package handler

import (
	"fmt"
	"net/http"

	"memoria/internal/domain/model"
	"memoria/internal/usecase"

	"github.com/labstack/echo/v4"
)

type InviteHandler struct {
	inviteUsecase *usecase.InviteUsecase
}

func NewInviteHandler(inviteUsecase *usecase.InviteUsecase) *InviteHandler {
	return &InviteHandler{
		inviteUsecase: inviteUsecase,
	}
}

type CreateInviteRequest struct {
	Email string `json:"email" validate:"required,email"`
	Role  string `json:"role"`
}

type CreateInviteResponse struct {
	Token     string `json:"token"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	ExpiresAt string `json:"expires_at"`
}

func (h *InviteHandler) CreateInvite(c echo.Context) error {
	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}

	var req CreateInviteRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	invite, err := h.inviteUsecase.CreateInvite(req.Email, req.Role, user.ID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, CreateInviteResponse{
		Token:     invite.Token,
		Email:     invite.Email,
		Role:      invite.Role,
		ExpiresAt: invite.ExpiresAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

type VerifyInviteResponse struct {
	Email     string `json:"email"`
	ExpiresAt string `json:"expires_at"`
	Status    string `json:"status"`
}

func (h *InviteHandler) VerifyInvite(c echo.Context) error {
	token := c.Param("token")

	invite, err := h.inviteUsecase.VerifyInvite(token)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, VerifyInviteResponse{
		Email:     invite.Email,
		ExpiresAt: invite.ExpiresAt.Format("2006-01-02T15:04:05Z07:00"),
		Status:    invite.Status,
	})
}

type AcceptInviteRequest struct {
	FirebaseUID string `json:"firebase_uid" validate:"required"`
	Email       string `json:"email" validate:"required,email"`
	DisplayName string `json:"display_name"`
}

type AcceptInviteResponse struct {
	UserID      uint   `json:"user_id"`
	Email       string `json:"email"`
	DisplayName string `json:"display_name"`
	Role        string `json:"role"`
}

func (h *InviteHandler) AcceptInvite(c echo.Context) error {
	token := c.Param("token")

	var req AcceptInviteRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	user, err := h.inviteUsecase.AcceptInvite(token, req.FirebaseUID, req.Email, req.DisplayName)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, AcceptInviteResponse{
		UserID:      user.ID,
		Email:       user.Email,
		DisplayName: user.DisplayName,
		Role:        user.Role,
	})
}

// 管理者用: 全招待一覧取得
type InviteListResponse struct {
	ID        uint   `json:"id"`
	Email     string `json:"email"`
	Token     string `json:"token"`
	Status    string `json:"status"`
	Role      string `json:"role"`
	ExpiresAt string `json:"expires_at"`
	InvitedBy uint   `json:"invited_by"`
	CreatedAt string `json:"created_at"`
}

func (h *InviteHandler) GetAllInvites(c echo.Context) error {
	invites, err := h.inviteUsecase.GetAllInvites()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	response := make([]InviteListResponse, len(invites))
	for i, invite := range invites {
		response[i] = InviteListResponse{
			ID:        invite.ID,
			Email:     invite.Email,
			Token:     invite.Token,
			Status:    invite.Status,
			Role:      invite.Role,
			ExpiresAt: invite.ExpiresAt.Format("2006-01-02T15:04:05Z07:00"),
			InvitedBy: invite.InvitedBy,
			CreatedAt: invite.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	return c.JSON(http.StatusOK, response)
}

// 管理者用: 招待削除
func (h *InviteHandler) DeleteInvite(c echo.Context) error {
	inviteID := c.Param("id")
	var id uint
	if _, err := fmt.Sscanf(inviteID, "%d", &id); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid invite ID")
	}

	if err := h.inviteUsecase.DeleteInvite(id); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}
