package handler

import (
	"fmt"
	"net/http"

	"memoria/internal/domain/model"
	"memoria/internal/usecase"

	"github.com/labstack/echo/v4"
)

type UserHandler struct {
	userUsecase *usecase.UserUsecase
}

func NewUserHandler(userUsecase *usecase.UserUsecase) *UserHandler {
	return &UserHandler{
		userUsecase: userUsecase,
	}
}

type GetMeResponse struct {
	ID          uint   `json:"id"`
	Email       string `json:"email"`
	DisplayName string `json:"display_name"`
	Role        string `json:"role"`
}

func (h *UserHandler) GetMe(c echo.Context) error {
	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}

	return c.JSON(http.StatusOK, GetMeResponse{
		ID:          user.ID,
		Email:       user.Email,
		DisplayName: user.DisplayName,
		Role:        user.Role,
	})
}

type UpdateMeRequest struct {
	DisplayName string `json:"display_name"`
}

func (h *UserHandler) UpdateMe(c echo.Context) error {
	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}

	var req UpdateMeRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	updatedUser, err := h.userUsecase.UpdateDisplayName(user.ID, req.DisplayName)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, GetMeResponse{
		ID:          updatedUser.ID,
		Email:       updatedUser.Email,
		DisplayName: updatedUser.DisplayName,
		Role:        updatedUser.Role,
	})
}

// 管理者用: 全ユーザー一覧取得
type UserResponse struct {
	ID          uint   `json:"id"`
	Email       string `json:"email"`
	DisplayName string `json:"display_name"`
	Role        string `json:"role"`
	FirebaseUID string `json:"firebase_uid"`
	CreatedAt   string `json:"created_at"`
}

func (h *UserHandler) GetAllUsers(c echo.Context) error {
	users, err := h.userUsecase.GetAllUsers()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	response := make([]UserResponse, len(users))
	for i, user := range users {
		response[i] = UserResponse{
			ID:          user.ID,
			Email:       user.Email,
			DisplayName: user.DisplayName,
			Role:        user.Role,
			FirebaseUID: user.FirebaseUID,
			CreatedAt:   user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	return c.JSON(http.StatusOK, response)
}

// 管理者用: ユーザー詳細取得
func (h *UserHandler) GetUser(c echo.Context) error {
	userID := c.Param("id")
	var id uint
	if _, err := fmt.Sscanf(userID, "%d", &id); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid user ID")
	}

	user, err := h.userUsecase.GetUserByID(id)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "user not found")
	}

	return c.JSON(http.StatusOK, UserResponse{
		ID:          user.ID,
		Email:       user.Email,
		DisplayName: user.DisplayName,
		Role:        user.Role,
		FirebaseUID: user.FirebaseUID,
		CreatedAt:   user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

// 管理者用: ユーザーのロール変更
type UpdateUserRoleRequest struct {
	Role string `json:"role" validate:"required"`
}

func (h *UserHandler) UpdateUserRole(c echo.Context) error {
	userID := c.Param("id")
	var id uint
	if _, err := fmt.Sscanf(userID, "%d", &id); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid user ID")
	}

	var req UpdateUserRoleRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	user, err := h.userUsecase.UpdateUserRole(id, req.Role)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, UserResponse{
		ID:          user.ID,
		Email:       user.Email,
		DisplayName: user.DisplayName,
		Role:        user.Role,
		FirebaseUID: user.FirebaseUID,
		CreatedAt:   user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

// 管理者用: ユーザー削除
func (h *UserHandler) DeleteUser(c echo.Context) error {
	userID := c.Param("id")
	var id uint
	if _, err := fmt.Sscanf(userID, "%d", &id); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid user ID")
	}

	// 自分自身は削除できない
	currentUser := c.Get("user").(*model.User)
	if currentUser.ID == id {
		return echo.NewHTTPError(http.StatusBadRequest, "cannot delete yourself")
	}

	if err := h.userUsecase.DeleteUser(id); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}
