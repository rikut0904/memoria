package middleware

import (
	"net/http"
	"strings"

	"memoria/internal/adapter/auth"
	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"

	"github.com/labstack/echo/v4"
)

type AuthMiddleware struct {
	firebaseAuth *auth.FirebaseAuth
	userRepo     repository.UserRepository
}

func NewAuthMiddleware(firebaseAuth *auth.FirebaseAuth, userRepo repository.UserRepository) *AuthMiddleware {
	return &AuthMiddleware{
		firebaseAuth: firebaseAuth,
		userRepo:     userRepo,
	}
}

func (m *AuthMiddleware) RequireAuth(next echo.HandlerFunc) echo.HandlerFunc {
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

		user, err := m.userRepo.FindByFirebaseUID(token.UID)
		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "user not found")
		}

		c.Set("user_id", user.ID)
		c.Set("user", user)
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
