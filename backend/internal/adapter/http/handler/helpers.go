package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

func parseGroupID(c echo.Context) (uint, error) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return 0, echo.NewHTTPError(http.StatusBadRequest, "invalid group id")
	}
	return uint(id), nil
}

func getGroupIDFromContext(c echo.Context) (uint, error) {
	groupID, ok := c.Get("group_id").(uint)
	if !ok {
		return 0, echo.NewHTTPError(http.StatusBadRequest, "invalid group")
	}
	return groupID, nil
}
