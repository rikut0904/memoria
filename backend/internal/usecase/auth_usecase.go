package usecase

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
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

func NewAuthUsecase(firebaseAuth *auth.FirebaseAuth, userRepo repository.UserRepository, firebaseAPIKey string, sessionTTL time.Duration) *AuthUsecase {
	return &AuthUsecase{
		firebaseAuth:   firebaseAuth,
		userRepo:       userRepo,
		firebaseAPIKey: firebaseAPIKey,
		sessionTTL:     sessionTTL,
	}
}

type firebaseAuthResponse struct {
	IDToken string `json:"idToken"`
	LocalID string `json:"localId"`
	Email   string `json:"email"`
}

func (u *AuthUsecase) Login(email, password string) (*model.User, string, error) {
	if u.firebaseAPIKey == "" {
		return nil, "", errors.New("firebase api key is required")
	}
	resp, err := u.signInWithPassword(email, password)
	if err != nil {
		return nil, "", err
	}
	user, err := u.ensureUser(resp.LocalID, resp.Email)
	if err != nil {
		return nil, "", err
	}
	return user, resp.IDToken, nil
}

func (u *AuthUsecase) Signup(email, password, displayName string) (*model.User, string, error) {
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

	return user, resp.IDToken, nil
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
		var errBody map[string]any
		_ = json.NewDecoder(res.Body).Decode(&errBody)
		code := "UNKNOWN"
		if errMap, ok := errBody["error"].(map[string]any); ok {
			if msg, ok := errMap["message"].(string); ok && msg != "" {
				code = msg
			}
		}
		return nil, &AuthError{Code: code, Message: firebaseErrorMessage(code)}
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
