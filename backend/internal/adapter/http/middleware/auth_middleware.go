package middleware

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"memoria/internal/adapter/auth"
	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type AuthMiddleware struct {
	clerkAuth       *auth.ClerkAuth
	userRepo        repository.UserRepository
	groupMemberRepo repository.GroupMemberRepository
}

func NewAuthMiddleware(clerkAuth *auth.ClerkAuth, userRepo repository.UserRepository, groupMemberRepo repository.GroupMemberRepository) *AuthMiddleware {
	return &AuthMiddleware{clerkAuth: clerkAuth, userRepo: userRepo, groupMemberRepo: groupMemberRepo}
}

func (m *AuthMiddleware) RequireAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		parts := strings.SplitN(c.Request().Header.Get("Authorization"), " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" || parts[1] == "" {
			return echo.NewHTTPError(http.StatusUnauthorized, "missing Clerk authorization header")
		}
		if m.clerkAuth == nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Clerk authentication is not configured")
		}

		clerkUser, err := m.clerkAuth.VerifyToken(c.Request().Context(), parts[1])
		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid Clerk session")
		}

		user, err := m.userRepo.FindByClerkUserID(clerkUser.ID)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			if clerkUser.Email == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "Clerk user has no email address")
			}
			user = &model.User{ClerkUserID: clerkUser.ID, Email: clerkUser.Email, DisplayName: clerkUser.DisplayName, Role: "member"}
			if err = m.userRepo.Create(user); err != nil {
				user, err = m.userRepo.FindByClerkUserID(clerkUser.ID)
			}
		}
		if err != nil || user == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "application user is not available")
		}

		if user.Email != clerkUser.Email || (user.DisplayName == "" && clerkUser.DisplayName != "") {
			user.Email = clerkUser.Email
			if user.DisplayName == "" {
				user.DisplayName = clerkUser.DisplayName
			}
			_ = m.userRepo.Update(user)
		}

		now := time.Now()
		if user.LastAccessAt != nil && now.Sub(*user.LastAccessAt) > 30*24*time.Hour {
			return echo.NewHTTPError(http.StatusUnauthorized, "session expired")
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

func (m *AuthMiddleware) RequireAdmin(next echo.HandlerFunc) echo.HandlerFunc {
	return m.RequireAuth(func(c echo.Context) error {
		user, ok := c.Get("user").(*model.User)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "user not found in context")
		}
		if user.Role != "admin" {
			return echo.NewHTTPError(http.StatusForbidden, "admin access required")
		}
		return next(c)
	})
}

func (m *AuthMiddleware) RequireGroup(next echo.HandlerFunc) echo.HandlerFunc {
	return m.RequireAuth(func(c echo.Context) error {
		user, ok := c.Get("user").(*model.User)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
		}
		groupIDHeader := c.Request().Header.Get("X-Group-ID")
		if groupIDHeader == "" {
			return echo.NewHTTPError(http.StatusBadRequest, "group ID is required")
		}
		var groupID uint
		if _, err := fmt.Sscanf(groupIDHeader, "%d", &groupID); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "invalid group ID")
		}
		member, err := m.groupMemberRepo.FindByGroupAndUser(groupID, user.ID)
		if err != nil || member == nil {
			return echo.NewHTTPError(http.StatusForbidden, "not a group member")
		}
		c.Set("group_id", groupID)
		c.Set("group_member", member)
		return next(c)
	})
}
