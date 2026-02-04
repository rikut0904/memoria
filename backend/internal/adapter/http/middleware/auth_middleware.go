package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"memoria/internal/adapter/auth"
	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"

	"github.com/labstack/echo/v4"
)

type AuthMiddleware struct {
	firebaseAuth *auth.FirebaseAuth
	userRepo     repository.UserRepository
	groupMemberRepo repository.GroupMemberRepository
}

func NewAuthMiddleware(firebaseAuth *auth.FirebaseAuth, userRepo repository.UserRepository, groupMemberRepo repository.GroupMemberRepository) *AuthMiddleware {
	return &AuthMiddleware{
		firebaseAuth: firebaseAuth,
		userRepo:     userRepo,
		groupMemberRepo: groupMemberRepo,
	}
}

func (m *AuthMiddleware) RequireAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		var idToken string
		authHeader := c.Request().Header.Get("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				idToken = parts[1]
			}
		}
		if idToken == "" {
			cookie, err := c.Cookie("memoria_session")
			if err != nil || cookie.Value == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "missing session")
			}
			idToken = cookie.Value
		}

		token, err := m.firebaseAuth.VerifyIDToken(c.Request().Context(), idToken)
		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid session")
		}

		user, err := m.userRepo.FindByFirebaseUID(token.UID)
		if err != nil {
			email, _ := token.Claims["email"].(string)
			if email == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "user not found")
			}
			user, err = m.userRepo.FindByEmail(email)
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "user not found")
			}
		}

		now := time.Now()
		if user.LastAccessAt != nil {
			if now.Sub(*user.LastAccessAt) > 30*24*time.Hour {
				return echo.NewHTTPError(http.StatusUnauthorized, "session expired")
			}
		}

		if user.LastAccessAt == nil || now.Sub(*user.LastAccessAt) > 24*time.Hour {
			user.LastAccessAt = &now
			_ = m.userRepo.Update(user)
		}

		c.Set("user_id", user.ID)
		c.Set("user", user)
		return next(c)
	}
}

func (m *AuthMiddleware) RequireFirebaseAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		if authHeader == "" {
			return echo.NewHTTPError(http.StatusUnauthorized, "missing authorization header")
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid authorization header")
		}

		idToken := parts[1]
		token, err := m.firebaseAuth.VerifyIDToken(c.Request().Context(), idToken)
		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
		}

		email, _ := token.Claims["email"].(string)
		name, _ := token.Claims["name"].(string)

		c.Set("firebase_uid", token.UID)
		c.Set("firebase_email", email)
		c.Set("firebase_name", name)
		return next(c)
	}
}

func (m *AuthMiddleware) RequireAdmin(next echo.HandlerFunc) echo.HandlerFunc {
	return m.RequireAuth(func(c echo.Context) error {
		userVal := c.Get("user")
		if userVal == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "user not found in context")
		}

		user, ok := userVal.(*model.User)
		if !ok {
			return echo.NewHTTPError(http.StatusInternalServerError, "invalid user type")
		}

		if user.Role != "admin" {
			return echo.NewHTTPError(http.StatusForbidden, "admin access required")
		}

		return next(c)
	})
}

func (m *AuthMiddleware) RequireGroup(next echo.HandlerFunc) echo.HandlerFunc {
	return m.RequireAuth(func(c echo.Context) error {
		userVal := c.Get("user")
		user, ok := userVal.(*model.User)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
		}

		groupIDHeader := c.Request().Header.Get("X-Group-ID")
		if groupIDHeader == "" {
			return echo.NewHTTPError(http.StatusBadRequest, "missing X-Group-ID header")
		}
		var groupID uint
		if _, err := fmt.Sscanf(groupIDHeader, "%d", &groupID); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "invalid X-Group-ID header")
		}

		member, err := m.groupMemberRepo.FindByGroupAndUser(groupID, user.ID)
		if err != nil || member == nil {
			return echo.NewHTTPError(http.StatusForbidden, "group access required")
		}

		c.Set("group_id", groupID)
		c.Set("group_member", member)
		return next(c)
	})
}
