package handler

import (
	"net/http"
	"strings"
	"time"

	"memoria/internal/usecase"

	"github.com/labstack/echo/v4"
)

type AuthHandler struct {
	authUsecase *usecase.AuthUsecase
	secureCookie bool
	sessionTTL   time.Duration
	cookieDomain string
	enableLocalStorageAuth bool
}

func NewAuthHandler(authUsecase *usecase.AuthUsecase, secureCookie bool, sessionTTL time.Duration, cookieDomain string, enableLocalStorageAuth bool) *AuthHandler {
	return &AuthHandler{
		authUsecase: authUsecase,
		secureCookie: secureCookie,
		sessionTTL: sessionTTL,
		cookieDomain: cookieDomain,
		enableLocalStorageAuth: enableLocalStorageAuth,
	}
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
	BackPath string `json:"back_path"`
}

type AuthResponse struct {
	ID          uint   `json:"id"`
	Email       string `json:"email"`
	DisplayName string `json:"display_name"`
	Role        string `json:"role"`
	Token       string `json:"token,omitempty"`
	RefreshToken string `json:"refresh_token,omitempty"`
	IDToken     string `json:"id_token,omitempty"`
}

func (h *AuthHandler) Login(c echo.Context) error {
	var req LoginRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	backPath := sanitizeBackPath(req.BackPath)
	user, sessionCookie, refreshToken, idToken, err := h.authUsecase.Login(req.Email, req.Password, backPath)
	if err != nil {
		if authErr, ok := err.(*usecase.AuthError); ok {
			return c.JSON(http.StatusUnauthorized, map[string]string{
				"code":    authErr.Code,
				"message": authErr.Message,
			})
		}
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	setSessionCookie(c, sessionCookie, h.secureCookie, int(h.sessionTTL.Seconds()), h.cookieDomain)

	resp := AuthResponse{
		ID:          user.ID,
		Email:       user.Email,
		DisplayName: user.DisplayName,
		Role:        user.Role,
		Token:       sessionCookie,
		RefreshToken: refreshToken,
	}
	if h.enableLocalStorageAuth {
		resp.IDToken = idToken
	}
	return c.JSON(http.StatusOK, resp)
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type RefreshResponse struct {
	Token        string `json:"token"`
	RefreshToken string `json:"refresh_token"`
	IDToken      string `json:"id_token,omitempty"`
}

func (h *AuthHandler) Refresh(c echo.Context) error {
	var req RefreshRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	sessionCookie, newRefresh, idToken, err := h.authUsecase.RefreshSession(req.RefreshToken)
	if err != nil {
		if authErr, ok := err.(*usecase.AuthError); ok {
			return c.JSON(http.StatusUnauthorized, map[string]string{
				"code":    authErr.Code,
				"message": authErr.Message,
			})
		}
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	setSessionCookie(c, sessionCookie, h.secureCookie, int(h.sessionTTL.Seconds()), h.cookieDomain)
	resp := RefreshResponse{
		Token:        sessionCookie,
		RefreshToken: newRefresh,
	}
	if h.enableLocalStorageAuth {
		resp.IDToken = idToken
	}
	return c.JSON(http.StatusOK, resp)
}

type SignupRequest struct {
	Email       string `json:"email" validate:"required,email"`
	Password    string `json:"password" validate:"required"`
	DisplayName string `json:"display_name"`
	BackPath    string `json:"back_path"`
}

func (h *AuthHandler) Signup(c echo.Context) error {
	var req SignupRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	backPath := sanitizeBackPath(req.BackPath)
	user, sessionCookie, err := h.authUsecase.Signup(req.Email, req.Password, req.DisplayName, backPath)
	if err != nil {
		if authErr, ok := err.(*usecase.AuthError); ok {
			return c.JSON(http.StatusBadRequest, map[string]string{
				"code":    authErr.Code,
				"message": authErr.Message,
			})
		}
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	setSessionCookie(c, sessionCookie, h.secureCookie, int(h.sessionTTL.Seconds()), h.cookieDomain)

	return c.JSON(http.StatusCreated, AuthResponse{
		ID:          user.ID,
		Email:       user.Email,
		DisplayName: user.DisplayName,
		Role:        user.Role,
	})
}

func (h *AuthHandler) Logout(c echo.Context) error {
	clearSessionCookie(c, h.secureCookie, h.cookieDomain)
	return c.NoContent(http.StatusNoContent)
}

func sanitizeBackPath(backPath string) string {
	if backPath == "" {
		return ""
	}
	if !strings.HasPrefix(backPath, "/") {
		return ""
	}
	if strings.Contains(backPath, "://") {
		return ""
	}
	return backPath
}
