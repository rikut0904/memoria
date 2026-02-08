package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

func parseGroupID(c echo.Context) (uint, error) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return 0, echo.NewHTTPError(http.StatusBadRequest, "invalid group id")
	}
	return uint(id), nil
}

func getGroupIDFromContext(c echo.Context) (uint, error) {
	groupIDVal := c.Get("group_id")
	groupID, ok := groupIDVal.(uint)
	if !ok {
		return 0, echo.NewHTTPError(http.StatusBadRequest, "invalid group")
	}
	return groupID, nil
}

func setSessionCookie(c echo.Context, value string, secure bool, maxAge int, domain string) {
	cookie := &http.Cookie{
		Name:     "memoria_session",
		Value:    value,
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   maxAge,
	}
	if domain != "" {
		cookie.Domain = domain
	}
	c.SetCookie(cookie)
}

func clearSessionCookie(c echo.Context, secure bool, domain string) {
	cookie := &http.Cookie{
		Name:     "memoria_session",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	}
	if domain != "" {
		cookie.Domain = domain
	}
	c.SetCookie(cookie)
}
