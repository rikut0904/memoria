package handler

import (
	"net/http"
	"strconv"
	"time"

	"memoria/internal/domain/model"
	"memoria/internal/usecase"

	"github.com/labstack/echo/v4"
)

type TripHandler struct {
	tripUsecase *usecase.TripUsecase
}

func NewTripHandler(tripUsecase *usecase.TripUsecase) *TripHandler {
	return &TripHandler{
		tripUsecase: tripUsecase,
	}
}

type CreateTripRequest struct {
	Title    string  `json:"title" validate:"required"`
	StartAt  string  `json:"start_at" validate:"required"`
	EndAt    string  `json:"end_at" validate:"required"`
	Note     string  `json:"note"`
	NotifyAt *string `json:"notify_at"`
}

type TripResponse struct {
	ID        uint    `json:"id"`
	Title     string  `json:"title"`
	StartAt   string  `json:"start_at"`
	EndAt     string  `json:"end_at"`
	Note      string  `json:"note"`
	CreatedBy uint    `json:"created_by"`
	NotifyAt  *string `json:"notify_at,omitempty"`
	CreatedAt string  `json:"created_at"`
}

func (h *TripHandler) CreateTrip(c echo.Context) error {
	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}

	var req CreateTripRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	startAt, err := time.Parse("2006-01-02T15:04:05Z07:00", req.StartAt)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid start_at format")
	}

	endAt, err := time.Parse("2006-01-02T15:04:05Z07:00", req.EndAt)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid end_at format")
	}

	var notifyAt *time.Time
	if req.NotifyAt != nil {
		parsed, err := time.Parse("2006-01-02T15:04:05Z07:00", *req.NotifyAt)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "invalid notify_at format")
		}
		notifyAt = &parsed
	}

	trip, err := h.tripUsecase.CreateTrip(req.Title, startAt, endAt, req.Note, user.ID, notifyAt)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	var notifyAtStr *string
	if trip.NotifyAt != nil {
		str := trip.NotifyAt.Format("2006-01-02T15:04:05Z07:00")
		notifyAtStr = &str
	}

	return c.JSON(http.StatusCreated, TripResponse{
		ID:        trip.ID,
		Title:     trip.Title,
		StartAt:   trip.StartAt.Format("2006-01-02T15:04:05Z07:00"),
		EndAt:     trip.EndAt.Format("2006-01-02T15:04:05Z07:00"),
		Note:      trip.Note,
		CreatedBy: trip.CreatedBy,
		NotifyAt:  notifyAtStr,
		CreatedAt: trip.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

func (h *TripHandler) GetAllTrips(c echo.Context) error {
	trips, err := h.tripUsecase.GetAllTrips()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	response := make([]TripResponse, len(trips))
	for i, trip := range trips {
		var notifyAtStr *string
		if trip.NotifyAt != nil {
			str := trip.NotifyAt.Format("2006-01-02T15:04:05Z07:00")
			notifyAtStr = &str
		}

		response[i] = TripResponse{
			ID:        trip.ID,
			Title:     trip.Title,
			StartAt:   trip.StartAt.Format("2006-01-02T15:04:05Z07:00"),
			EndAt:     trip.EndAt.Format("2006-01-02T15:04:05Z07:00"),
			Note:      trip.Note,
			CreatedBy: trip.CreatedBy,
			NotifyAt:  notifyAtStr,
			CreatedAt: trip.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	return c.JSON(http.StatusOK, response)
}

func (h *TripHandler) GetTrip(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid trip ID")
	}

	trip, err := h.tripUsecase.GetTrip(uint(id))
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "trip not found")
	}

	var notifyAtStr *string
	if trip.NotifyAt != nil {
		str := trip.NotifyAt.Format("2006-01-02T15:04:05Z07:00")
		notifyAtStr = &str
	}

	return c.JSON(http.StatusOK, TripResponse{
		ID:        trip.ID,
		Title:     trip.Title,
		StartAt:   trip.StartAt.Format("2006-01-02T15:04:05Z07:00"),
		EndAt:     trip.EndAt.Format("2006-01-02T15:04:05Z07:00"),
		Note:      trip.Note,
		CreatedBy: trip.CreatedBy,
		NotifyAt:  notifyAtStr,
		CreatedAt: trip.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

func (h *TripHandler) DeleteTrip(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid trip ID")
	}

	if err := h.tripUsecase.DeleteTrip(uint(id)); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}
