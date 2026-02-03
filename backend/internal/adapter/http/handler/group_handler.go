package handler

import (
	"net/http"

	"memoria/internal/domain/model"
	"memoria/internal/usecase"

	"github.com/labstack/echo/v4"
)

type GroupHandler struct {
	groupUsecase *usecase.GroupUsecase
	userUsecase  *usecase.UserUsecase
}

func NewGroupHandler(groupUsecase *usecase.GroupUsecase, userUsecase *usecase.UserUsecase) *GroupHandler {
	return &GroupHandler{
		groupUsecase: groupUsecase,
		userUsecase:  userUsecase,
	}
}

type CreateGroupRequest struct {
	Name string `json:"name" validate:"required"`
}

type GroupResponse struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	CreatedBy uint   `json:"created_by"`
	CreatedAt string `json:"created_at"`
}

func (h *GroupHandler) CreateGroup(c echo.Context) error {
	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}

	var req CreateGroupRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	group, err := h.groupUsecase.CreateGroup(req.Name, user.ID)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusCreated, GroupResponse{
		ID:        group.ID,
		Name:      group.Name,
		CreatedBy: group.CreatedBy,
		CreatedAt: group.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

func (h *GroupHandler) GetMyGroups(c echo.Context) error {
	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}

	groups, err := h.groupUsecase.GetGroupsForUser(user.ID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	response := make([]GroupResponse, len(groups))
	for i, group := range groups {
		response[i] = GroupResponse{
			ID:        group.ID,
			Name:      group.Name,
			CreatedBy: group.CreatedBy,
			CreatedAt: group.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	return c.JSON(http.StatusOK, response)
}

type GroupMemberResponse struct {
	UserID      uint   `json:"user_id"`
	Email       string `json:"email"`
	DisplayName string `json:"display_name"`
	Role        string `json:"role"`
	JoinedAt    string `json:"joined_at"`
}

func (h *GroupHandler) GetGroupMembers(c echo.Context) error {
	groupID, err := parseGroupID(c)
	if err != nil {
		return err
	}

	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}

	if _, err := h.groupUsecase.GetMembership(groupID, user.ID); err != nil {
		return echo.NewHTTPError(http.StatusForbidden, "group access required")
	}

	members, err := h.groupUsecase.GetGroupMembers(groupID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	response := make([]GroupMemberResponse, 0, len(members))
	for _, member := range members {
		userInfo, err := h.userUsecase.GetUserByID(member.UserID)
		if err != nil {
			c.Logger().Errorf("Failed to get user info for user ID %d: %v", member.UserID, err)
			continue
		}
		response = append(response, GroupMemberResponse{
			UserID:      member.UserID,
			Email:       userInfo.Email,
			DisplayName: userInfo.DisplayName,
			Role:        member.Role,
			JoinedAt:    member.JoinedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	return c.JSON(http.StatusOK, response)
}
