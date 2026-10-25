package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"memoria/internal/domain/model"
	"memoria/internal/usecase"

	"github.com/labstack/echo/v4"
)

type GroupDataHandler struct {
	usecase *usecase.GroupDataUsecase
}

const maxAccountDataBytes = 100 * 1024 * 1024

func NewGroupDataHandler(groupDataUsecase *usecase.GroupDataUsecase) *GroupDataHandler {
	return &GroupDataHandler{usecase: groupDataUsecase}
}

func (h *GroupDataHandler) ExportAccount(c echo.Context) error {
	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}
	var groupID *uint
	if raw := c.QueryParam("group_id"); raw != "" {
		parsed, err := strconv.ParseUint(raw, 10, 64)
		if err != nil || parsed == 0 {
			return echo.NewHTTPError(http.StatusBadRequest, "invalid group id")
		}
		value := uint(parsed)
		groupID = &value
	}
	data, err := h.usecase.ExportForUser(user.ID, groupID)
	if err != nil {
		return echo.NewHTTPError(http.StatusForbidden, "group access required")
	}
	payload, err := json.Marshal(data)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create export file")
	}
	if len(payload) > maxAccountDataBytes {
		return echo.NewHTTPError(http.StatusRequestEntityTooLarge, "export file is too large to restore; export a smaller group")
	}
	filename := "memoria-account-" + time.Now().Format("20060102-150405") + ".json"
	if groupID != nil {
		filename = "memoria-group-" + strconv.FormatUint(uint64(*groupID), 10) + "-" + time.Now().Format("20060102-150405") + ".json"
	}
	c.Response().Header().Set(echo.HeaderContentDisposition, "attachment; filename=\""+filename+"\"")
	c.Response().Header().Set(echo.HeaderContentType, "application/json; charset=utf-8")
	return c.Blob(http.StatusOK, "application/json; charset=utf-8", payload)
}

func (h *GroupDataHandler) ImportAccount(c echo.Context) error {
	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}
	groupIDParam := c.QueryParam("group_id")
	if c.Request().ContentLength > maxAccountDataBytes {
		return echo.NewHTTPError(http.StatusRequestEntityTooLarge, "export file is too large")
	}
	var data usecase.AccountDataExport
	decoder := json.NewDecoder(http.MaxBytesReader(c.Response().Writer, c.Request().Body, maxAccountDataBytes))
	if err := decoder.Decode(&data); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid export file")
	}
	if err := data.Validate(); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if len(data.Groups) != 1 {
		return echo.NewHTTPError(http.StatusBadRequest, "a single-group export is required")
	}
	var importedGroupID uint
	var importErr error
	if groupIDParam == "" {
		importedGroupID, importErr = h.usecase.ImportAsNewGroup(user.ID, &data.Groups[0])
	} else {
		parsed, err := strconv.ParseUint(groupIDParam, 10, 64)
		if err != nil || parsed == 0 {
			return echo.NewHTTPError(http.StatusBadRequest, "invalid group id")
		}
		importedGroupID = uint(parsed)
		importErr = h.usecase.Import(importedGroupID, user.ID, &data.Groups[0])
	}
	if importErr != nil {
		if importErr.Error() == "group manager access required" {
			return echo.NewHTTPError(http.StatusForbidden, importErr.Error())
		}
		return echo.NewHTTPError(http.StatusBadRequest, "group import failed")
	}
	return c.JSON(http.StatusOK, map[string]any{"message": "group data imported", "group_id": importedGroupID})
}

func (h *GroupDataHandler) DeleteGroup(c echo.Context) error {
	groupID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil || groupID == 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid group id")
	}
	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}
	if err := h.usecase.DeleteGroup(uint(groupID), user.ID); err != nil {
		if err.Error() == "group manager access required" {
			return echo.NewHTTPError(http.StatusForbidden, err.Error())
		}
		return echo.NewHTTPError(http.StatusBadRequest, "group deletion failed")
	}
	return c.NoContent(http.StatusNoContent)
}
