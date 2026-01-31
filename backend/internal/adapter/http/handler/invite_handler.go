package handler

import (
	"fmt"
	"net/http"
	"time"

	"memoria/internal/domain/model"
	"memoria/internal/usecase"

	"github.com/labstack/echo/v4"
)

type InviteHandler struct {
	inviteUsecase *usecase.InviteUsecase
	groupUsecase  *usecase.GroupUsecase
	userUsecase   *usecase.UserUsecase
	authUsecase   *usecase.AuthUsecase
	secureCookie  bool
	sessionTTL    time.Duration
}

func NewInviteHandler(inviteUsecase *usecase.InviteUsecase, groupUsecase *usecase.GroupUsecase, userUsecase *usecase.UserUsecase, authUsecase *usecase.AuthUsecase, secureCookie bool, sessionTTL time.Duration) *InviteHandler {
	return &InviteHandler{
		inviteUsecase: inviteUsecase,
		groupUsecase:  groupUsecase,
		userUsecase:   userUsecase,
		authUsecase:   authUsecase,
		secureCookie:  secureCookie,
		sessionTTL:    sessionTTL,
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

	groupMemberVal := c.Get("group_member")
	member, ok := groupMemberVal.(*model.GroupMember)
	if !ok || member.Role != "manager" {
		return echo.NewHTTPError(http.StatusForbidden, "group manager required")
	}

	groupIDVal := c.Get("group_id")
	groupID, ok := groupIDVal.(uint)
	if !ok {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid group")
	}

	var req CreateInviteRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	invite, err := h.inviteUsecase.CreateInvite(req.Email, req.Role, user.ID, groupID)
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
	GroupID   uint   `json:"group_id"`
	GroupName string `json:"group_name"`
	Role      string `json:"role"`
	UserExists bool  `json:"user_exists"`
}

func (h *InviteHandler) VerifyInvite(c echo.Context) error {
	token := c.Param("token")

	invite, err := h.inviteUsecase.VerifyInvite(token)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	group, err := h.groupUsecase.GetGroup(invite.GroupID)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "group not found")
	}

	userExists := false
	if _, err := h.userUsecase.GetUserByEmail(invite.Email); err == nil {
		userExists = true
	}

	return c.JSON(http.StatusOK, VerifyInviteResponse{
		Email:      invite.Email,
		ExpiresAt:  invite.ExpiresAt.Format("2006-01-02T15:04:05Z07:00"),
		Status:     invite.Status,
		GroupID:    invite.GroupID,
		GroupName:  group.Name,
		Role:       invite.Role,
		UserExists: userExists,
	})
}

type InviteSignupRequest struct {
	Email       string `json:"email" validate:"required,email"`
	Password    string `json:"password" validate:"required"`
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

	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}

	if err := h.inviteUsecase.AcceptInviteForUser(token, user); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, AcceptInviteResponse{
		UserID:      user.ID,
		Email:       user.Email,
		DisplayName: user.DisplayName,
		Role:        user.Role,
	})
}

func (h *InviteHandler) SignupInvite(c echo.Context) error {
	token := c.Param("token")

	var req InviteSignupRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	invite, err := h.inviteUsecase.VerifyInvite(token)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if invite.Email != req.Email {
		return echo.NewHTTPError(http.StatusBadRequest, "email does not match invite")
	}

	user, sessionCookie, err := h.authUsecase.Signup(req.Email, req.Password, req.DisplayName)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := h.inviteUsecase.AcceptInviteForUser(token, user); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	setSessionCookie(c, sessionCookie, h.secureCookie, int(h.sessionTTL.Seconds()))

	return c.JSON(http.StatusOK, AcceptInviteResponse{
		UserID:      user.ID,
		Email:       user.Email,
		DisplayName: user.DisplayName,
		Role:        user.Role,
	})
}

func (h *InviteHandler) DeclineInvite(c echo.Context) error {
	token := c.Param("token")

	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}

	if err := h.inviteUsecase.DeclineInviteForUser(token, user); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}

// グループ用: 招待一覧取得
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

func (h *InviteHandler) GetGroupInvites(c echo.Context) error {
	groupMemberVal := c.Get("group_member")
	member, ok := groupMemberVal.(*model.GroupMember)
	if !ok || member.Role != "manager" {
		return echo.NewHTTPError(http.StatusForbidden, "group manager required")
	}

	groupIDVal := c.Get("group_id")
	groupID, ok := groupIDVal.(uint)
	if !ok {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid group")
	}

	invites, err := h.inviteUsecase.GetGroupInvites(groupID)
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

// グループ用: 招待削除
func (h *InviteHandler) DeleteInvite(c echo.Context) error {
	groupMemberVal := c.Get("group_member")
	member, ok := groupMemberVal.(*model.GroupMember)
	if !ok || member.Role != "manager" {
		return echo.NewHTTPError(http.StatusForbidden, "group manager required")
	}

	groupIDVal := c.Get("group_id")
	groupID, ok := groupIDVal.(uint)
	if !ok {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid group")
	}

	inviteID := c.Param("id")
	var id uint
	if _, err := fmt.Sscanf(inviteID, "%d", &id); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid invite ID")
	}

	if err := h.inviteUsecase.DeleteInvite(id, groupID); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}
