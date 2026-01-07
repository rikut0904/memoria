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
	AlbumIDs []uint  `json:"album_ids"`
	PostIDs  []uint  `json:"post_ids"`
}

type TripAlbumResponse struct {
	ID          uint   `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type TripPostResponse struct {
	ID          uint   `json:"id"`
	Type        string `json:"type"`
	Title       string `json:"title"`
	Body        string `json:"body"`
	PublishedAt string `json:"published_at"`
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
	Albums    []TripAlbumResponse `json:"albums,omitempty"`
	Posts     []TripPostResponse  `json:"posts,omitempty"`
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

	trip, err := h.tripUsecase.CreateTrip(req.Title, startAt, endAt, req.Note, user.ID, notifyAt, req.AlbumIDs, req.PostIDs)
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

	albums, posts, err := h.tripUsecase.GetTripRelations(trip.ID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	var notifyAtStr *string
	if trip.NotifyAt != nil {
		str := trip.NotifyAt.Format("2006-01-02T15:04:05Z07:00")
		notifyAtStr = &str
	}

	albumResponses := make([]TripAlbumResponse, len(albums))
	for i, album := range albums {
		albumResponses[i] = TripAlbumResponse{
			ID:          album.ID,
			Title:       album.Title,
			Description: album.Description,
		}
	}
	postResponses := make([]TripPostResponse, len(posts))
	for i, post := range posts {
		postResponses[i] = TripPostResponse{
			ID:          post.ID,
			Type:        post.Type,
			Title:       post.Title,
			Body:        post.Body,
			PublishedAt: post.PublishedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
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
		Albums:    albumResponses,
		Posts:     postResponses,
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
