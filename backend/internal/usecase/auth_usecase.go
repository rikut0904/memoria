package usecase

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"memoria/internal/adapter/auth"
	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"
)

type AuthUsecase struct {
	firebaseAuth   *auth.FirebaseAuth
	userRepo       repository.UserRepository
	firebaseAPIKey string
	sessionTTL     time.Duration
	frontendBaseURL string
	projectID      string
}

type AuthError struct {
	Code    string
	Message string
}

func (e *AuthError) Error() string {
	if e.Message != "" {
		return e.Message
	}
	return e.Code
}

func NewAuthUsecase(firebaseAuth *auth.FirebaseAuth, userRepo repository.UserRepository, firebaseAPIKey string, sessionTTL time.Duration, frontendBaseURL string, projectID string) *AuthUsecase {
	return &AuthUsecase{
		firebaseAuth:   firebaseAuth,
		userRepo:       userRepo,
		firebaseAPIKey: firebaseAPIKey,
		sessionTTL:     sessionTTL,
		frontendBaseURL: strings.TrimRight(frontendBaseURL, "/"),
		projectID:      projectID,
	}
}

type firebaseAuthResponse struct {
	IDToken      string `json:"idToken"`
	LocalID      string `json:"localId"`
	Email        string `json:"email"`
	RefreshToken string `json:"refreshToken"`
}

type firebaseOobResponse struct {
	Email string `json:"email"`
}

type firebaseLookupResponse struct {
	Users []struct {
		EmailVerified bool `json:"emailVerified"`
	} `json:"users"`
}

type firebaseRefreshResponse struct {
	IDToken      string `json:"id_token"`
	RefreshToken string `json:"refresh_token"`
	UserID       string `json:"user_id"`
}

type firebaseSessionCookieResponse struct {
	SessionCookie string `json:"sessionCookie"`
}

func (u *AuthUsecase) Login(email, password, backPath string) (*model.User, string, string, string, error) {
	if u.firebaseAPIKey == "" {
		return nil, "", "", "", errors.New("firebase api key is required")
	}
	resp, err := u.signInWithPassword(email, password)
	if err != nil {
		return nil, "", "", "", err
	}
	verified, err := u.isEmailVerified(resp.IDToken)
	if err != nil {
		return nil, "", "", "", err
	}
	if !verified {
		if err := u.sendVerifyEmail(resp.IDToken, backPath); err != nil {
			log.Printf("Failed to send verify email: %v", err)
		}
		return nil, "", "", "", &AuthError{Code: "EMAIL_NOT_VERIFIED", Message: "メール認証が完了していません。送信したメールをご確認ください。"}
	}
	user, err := u.ensureUser(resp.LocalID, resp.Email)
	if err != nil {
		return nil, "", "", "", err
	}
	sessionCookie, err := u.createSessionCookie(resp.IDToken)
	if err != nil {
		return nil, "", "", "", err
	}
	return user, sessionCookie, resp.RefreshToken, resp.IDToken, nil
}

func (u *AuthUsecase) Signup(email, password, displayName, backPath string) (*model.User, string, error) {
	if u.firebaseAPIKey == "" {
		return nil, "", errors.New("firebase api key is required")
	}
	resp, err := u.signUpWithPassword(email, password)
	if err != nil {
		return nil, "", err
	}

	user := &model.User{
		FirebaseUID: resp.LocalID,
		Email:       resp.Email,
		DisplayName: displayName,
		Role:        "member",
	}
	if user.DisplayName == "" {
		user.DisplayName = resp.Email
	}
	if err := u.userRepo.Create(user); err != nil {
		return nil, "", err
	}

	if err := u.sendVerifyEmail(resp.IDToken, backPath); err != nil {
		log.Printf("Failed to send verify email: %v", err)
	}
	return nil, "", &AuthError{Code: "EMAIL_NOT_VERIFIED", Message: "認証メールを送信しました。メール内のリンクをクリックしてからログインしてください。"}
}

func (u *AuthUsecase) RefreshSession(refreshToken string) (string, string, string, error) {
	if u.firebaseAPIKey == "" {
		return "", "", "", errors.New("firebase api key is required")
	}
	if refreshToken == "" {
		return "", "", "", errors.New("refresh token is required")
	}
	resp, err := u.callFirebaseRefresh(refreshToken)
	if err != nil {
		return "", "", "", err
	}
	if resp.IDToken == "" || resp.RefreshToken == "" {
		return "", "", "", errors.New("invalid refresh response")
	}
	sessionCookie, err := u.createSessionCookie(resp.IDToken)
	if err != nil {
		return "", "", "", err
	}
	return sessionCookie, resp.RefreshToken, resp.IDToken, nil
}

func (u *AuthUsecase) createSessionCookie(idToken string) (string, error) {
	if u.firebaseAPIKey == "" {
		return "", errors.New("firebase api key is required")
	}
	if idToken == "" {
		return "", errors.New("id token is required")
	}
	if u.projectID == "" {
		return "", errors.New("firebase project id is required")
	}
	payload := map[string]any{
		"idToken":       idToken,
		"validDuration": int64(u.sessionTTL.Seconds()),
	}
	accessToken, err := u.firebaseAuth.GetAccessToken(context.Background())
	if err != nil {
		return "", err
	}

	endpoint := "https://www.googleapis.com/identitytoolkit/v3/relyingparty/createSessionCookie"
	cookie, err := u.requestSessionCookie(endpoint, payload, accessToken)
	if err != nil {
		return "", err
	}
	return cookie, nil
}

func (u *AuthUsecase) requestSessionCookie(endpoint string, payload map[string]any, accessToken string) (string, error) {
	body, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	if accessToken != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	if res.StatusCode >= 400 {
		return "", parseFirebaseError(res)
	}

	var resp firebaseSessionCookieResponse
	if err := json.NewDecoder(res.Body).Decode(&resp); err != nil {
		return "", err
	}
	if resp.SessionCookie == "" {
		return "", errors.New("invalid session cookie response")
	}
	return resp.SessionCookie, nil
}

func (u *AuthUsecase) isEmailVerified(idToken string) (bool, error) {
	payload := map[string]any{
		"idToken": idToken,
	}
	resp, err := u.callFirebaseLookup("accounts:lookup", payload)
	if err != nil {
		return false, err
	}
	if len(resp.Users) == 0 {
		return false, errors.New("user not found")
	}
	return resp.Users[0].EmailVerified, nil
}

func (u *AuthUsecase) sendVerifyEmail(idToken string, backPath string) error {
	if u.frontendBaseURL == "" {
		return errors.New("frontend base url is required")
	}
	continueURL := fmt.Sprintf("%s/login", u.frontendBaseURL)
	if backPath != "" {
		continueURL = fmt.Sprintf("%s?back-path=%s", continueURL, url.QueryEscape(backPath))
	}
	payload := map[string]any{
		"requestType": "VERIFY_EMAIL",
		"idToken":     idToken,
		"continueUrl": continueURL,
	}
	_, err := u.callFirebaseOob("accounts:sendOobCode", payload)
	return err
}

func (u *AuthUsecase) ensureUser(firebaseUID, email string) (*model.User, error) {
	if existing, err := u.userRepo.FindByFirebaseUID(firebaseUID); err == nil && existing != nil {
		return existing, nil
	}
	if existing, err := u.userRepo.FindByEmail(email); err == nil && existing != nil {
		if existing.FirebaseUID != firebaseUID {
			return nil, errors.New("email already exists")
		}
		return existing, nil
	}
	user := &model.User{
		FirebaseUID: firebaseUID,
		Email:       email,
		DisplayName: email,
		Role:        "member",
	}
	if err := u.userRepo.Create(user); err != nil {
		return nil, err
	}
	return user, nil
}

func (u *AuthUsecase) signInWithPassword(email, password string) (*firebaseAuthResponse, error) {
	payload := map[string]any{
		"email":             email,
		"password":          password,
		"returnSecureToken": true,
	}
	return u.callFirebaseAuth("accounts:signInWithPassword", payload)
}

func (u *AuthUsecase) signUpWithPassword(email, password string) (*firebaseAuthResponse, error) {
	payload := map[string]any{
		"email":             email,
		"password":          password,
		"returnSecureToken": true,
	}
	return u.callFirebaseAuth("accounts:signUp", payload)
}

func (u *AuthUsecase) callFirebaseAuth(endpoint string, payload map[string]any) (*firebaseAuthResponse, error) {
	url := fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/%s?key=%s", endpoint, u.firebaseAPIKey)
	body, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode >= 400 {
		return nil, parseFirebaseError(res)
	}

	var resp firebaseAuthResponse
	if err := json.NewDecoder(res.Body).Decode(&resp); err != nil {
		return nil, err
	}
	if resp.IDToken == "" || resp.LocalID == "" {
		return nil, errors.New("invalid firebase response")
	}
	return &resp, nil
}

func (u *AuthUsecase) callFirebaseOob(endpoint string, payload map[string]any) (*firebaseOobResponse, error) {
	url := fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/%s?key=%s", endpoint, u.firebaseAPIKey)
	body, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode >= 400 {
		return nil, parseFirebaseError(res)
	}

	var resp firebaseOobResponse
	if err := json.NewDecoder(res.Body).Decode(&resp); err != nil {
		return nil, err
	}
	return &resp, nil
}

func (u *AuthUsecase) callFirebaseRefresh(refreshToken string) (*firebaseRefreshResponse, error) {
	endpointURL := fmt.Sprintf("https://securetoken.googleapis.com/v1/token?key=%s", u.firebaseAPIKey)
	form := url.Values{}
	form.Set("grant_type", "refresh_token")
	form.Set("refresh_token", refreshToken)
	req, err := http.NewRequest(http.MethodPost, endpointURL, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode >= 400 {
		return nil, parseFirebaseError(res)
	}

	var resp firebaseRefreshResponse
	if err := json.NewDecoder(res.Body).Decode(&resp); err != nil {
		return nil, err
	}
	return &resp, nil
}
func (u *AuthUsecase) callFirebaseLookup(endpoint string, payload map[string]any) (*firebaseLookupResponse, error) {
	url := fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/%s?key=%s", endpoint, u.firebaseAPIKey)
	body, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode >= 400 {
		return nil, parseFirebaseError(res)
	}

	var resp firebaseLookupResponse
	if err := json.NewDecoder(res.Body).Decode(&resp); err != nil {
		return nil, err
	}
	return &resp, nil
}

func firebaseErrorMessage(code string) string {
	normalized := normalizeAuthCode(code)
	if normalized != "" {
		code = normalized
	}
	switch code {
	case "EMAIL_EXISTS":
		return "このメールアドレスは既に登録されています"
	case "EMAIL_NOT_FOUND":
		return "メールアドレスが見つかりません"
	case "INVALID_PASSWORD":
		return "パスワードが違います"
	case "INVALID_LOGIN_CREDENTIALS":
		return "メールアドレスまたはパスワードが違います"
	case "USER_DISABLED":
		return "このアカウントは無効化されています"
	case "INVALID_EMAIL":
		return "メールアドレスの形式が正しくありません"
	case "WEAK_PASSWORD":
		return "パスワードが弱すぎます（8文字以上推奨）"
	case "TOO_MANY_ATTEMPTS_TRY_LATER":
		return "試行回数が多すぎます。しばらくしてから再試行してください"
	default:
		return "認証に失敗しました"
	}
}

func normalizeAuthCode(code string) string {
	if code == "" {
		return ""
	}
	if strings.Contains(code, "WEAK_PASSWORD") {
		return "WEAK_PASSWORD"
	}
	if strings.Contains(code, "EMAIL_EXISTS") {
		return "EMAIL_EXISTS"
	}
	if strings.Contains(code, "EMAIL_NOT_FOUND") {
		return "EMAIL_NOT_FOUND"
	}
	if strings.Contains(code, "INVALID_PASSWORD") {
		return "INVALID_PASSWORD"
	}
	if strings.Contains(code, "INVALID_EMAIL") {
		return "INVALID_EMAIL"
	}
	if strings.Contains(code, "INVALID_LOGIN_CREDENTIALS") {
		return "INVALID_LOGIN_CREDENTIALS"
	}
	if strings.Contains(code, "USER_DISABLED") {
		return "USER_DISABLED"
	}
	return ""
}

func parseFirebaseError(res *http.Response) *AuthError {
	bodyBytes, _ := io.ReadAll(res.Body)
	raw := strings.TrimSpace(string(bodyBytes))
	code := "UNKNOWN"
	if len(bodyBytes) > 0 {
		var errBody map[string]any
		if err := json.Unmarshal(bodyBytes, &errBody); err == nil {
			if errMap, ok := errBody["error"].(map[string]any); ok {
				if msg, ok := errMap["message"].(string); ok && msg != "" {
					code = msg
				}
			}
		}
	}
	if code == "UNKNOWN" && raw != "" {
		log.Printf("Firebase auth error (status=%d): %s", res.StatusCode, raw)
		return &AuthError{Code: code, Message: raw}
	}
	return &AuthError{Code: code, Message: firebaseErrorMessage(code)}
}
