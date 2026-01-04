package handler

import (
	"net/http"
	"strconv"
	"time"

	"memoria/internal/domain/model"
	"memoria/internal/usecase"

	"github.com/labstack/echo/v4"
)

type AnniversaryHandler struct {
	anniversaryUsecase *usecase.AnniversaryUsecase
}

func NewAnniversaryHandler(anniversaryUsecase *usecase.AnniversaryUsecase) *AnniversaryHandler {
	return &AnniversaryHandler{
		anniversaryUsecase: anniversaryUsecase,
	}
}

type CreateAnniversaryRequest struct {
	Title            string `json:"title" validate:"required"`
	Date             string `json:"date" validate:"required"`
	RemindDaysBefore int    `json:"remind_days_before"`
	Note             string `json:"note"`
}

type AnniversaryResponse struct {
	ID               uint    `json:"id"`
	Title            string  `json:"title"`
	Date             string  `json:"date"`
	RemindDaysBefore int     `json:"remind_days_before"`
	RemindAt         *string `json:"remind_at,omitempty"`
	Note             string  `json:"note"`
	CreatedBy        uint    `json:"created_by"`
	CreatedAt        string  `json:"created_at"`
}

func (h *AnniversaryHandler) CreateAnniversary(c echo.Context) error {
	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}

	var req CreateAnniversaryRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid date format")
	}

	anniversary, err := h.anniversaryUsecase.CreateAnniversary(req.Title, date, req.RemindDaysBefore, req.Note, user.ID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	var remindAtStr *string
	if anniversary.RemindAt != nil {
		str := anniversary.RemindAt.Format("2006-01-02T15:04:05Z07:00")
		remindAtStr = &str
	}

	return c.JSON(http.StatusCreated, AnniversaryResponse{
		ID:               anniversary.ID,
		Title:            anniversary.Title,
		Date:             anniversary.Date.Format("2006-01-02"),
		RemindDaysBefore: anniversary.RemindDaysBefore,
		RemindAt:         remindAtStr,
		Note:             anniversary.Note,
		CreatedBy:        anniversary.CreatedBy,
		CreatedAt:        anniversary.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

func (h *AnniversaryHandler) GetAllAnniversaries(c echo.Context) error {
	anniversaries, err := h.anniversaryUsecase.GetAllAnniversaries()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	response := make([]AnniversaryResponse, len(anniversaries))
	for i, ann := range anniversaries {
		var remindAtStr *string
		if ann.RemindAt != nil {
			str := ann.RemindAt.Format("2006-01-02T15:04:05Z07:00")
			remindAtStr = &str
		}

		response[i] = AnniversaryResponse{
			ID:               ann.ID,
			Title:            ann.Title,
			Date:             ann.Date.Format("2006-01-02"),
			RemindDaysBefore: ann.RemindDaysBefore,
			RemindAt:         remindAtStr,
			Note:             ann.Note,
			CreatedBy:        ann.CreatedBy,
			CreatedAt:        ann.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	return c.JSON(http.StatusOK, response)
}

type UpdateAnniversaryRequest struct {
	Title            string `json:"title"`
	Date             string `json:"date"`
	RemindDaysBefore int    `json:"remind_days_before"`
	Note             string `json:"note"`
}

func (h *AnniversaryHandler) UpdateAnniversary(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid anniversary ID")
	}

	var req UpdateAnniversaryRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid date format")
	}

	anniversary, err := h.anniversaryUsecase.UpdateAnniversary(uint(id), req.Title, date, req.RemindDaysBefore, req.Note)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	var remindAtStr *string
	if anniversary.RemindAt != nil {
		str := anniversary.RemindAt.Format("2006-01-02T15:04:05Z07:00")
		remindAtStr = &str
	}

	return c.JSON(http.StatusOK, AnniversaryResponse{
		ID:               anniversary.ID,
		Title:            anniversary.Title,
		Date:             anniversary.Date.Format("2006-01-02"),
		RemindDaysBefore: anniversary.RemindDaysBefore,
		RemindAt:         remindAtStr,
		Note:             anniversary.Note,
		CreatedBy:        anniversary.CreatedBy,
		CreatedAt:        anniversary.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

func (h *AnniversaryHandler) DeleteAnniversary(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid anniversary ID")
	}

	if err := h.anniversaryUsecase.DeleteAnniversary(uint(id)); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}
