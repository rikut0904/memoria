package handler

import (
	"net/http"
	"strconv"

	"memoria/internal/domain/model"
	"memoria/internal/usecase"

	"github.com/labstack/echo/v4"
)

type AlbumHandler struct {
	albumUsecase *usecase.AlbumUsecase
}

func NewAlbumHandler(albumUsecase *usecase.AlbumUsecase) *AlbumHandler {
	return &AlbumHandler{
		albumUsecase: albumUsecase,
	}
}

type CreateAlbumRequest struct {
	Title       string `json:"title" validate:"required"`
	Description string `json:"description"`
}

type AlbumResponse struct {
	ID           uint   `json:"id"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	CoverPhotoID *uint  `json:"cover_photo_id,omitempty"`
	CreatedBy    uint   `json:"created_by"`
	CreatedAt    string `json:"created_at"`
}

func (h *AlbumHandler) CreateAlbum(c echo.Context) error {
	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}

	var req CreateAlbumRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	album, err := h.albumUsecase.CreateAlbum(req.Title, req.Description, user.ID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, AlbumResponse{
		ID:          album.ID,
		Title:       album.Title,
		Description: album.Description,
		CreatedBy:   album.CreatedBy,
		CreatedAt:   album.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

func (h *AlbumHandler) GetAlbum(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid album ID")
	}

	album, err := h.albumUsecase.GetAlbum(uint(id))
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "album not found")
	}

	return c.JSON(http.StatusOK, AlbumResponse{
		ID:           album.ID,
		Title:        album.Title,
		Description:  album.Description,
		CoverPhotoID: album.CoverPhotoID,
		CreatedBy:    album.CreatedBy,
		CreatedAt:    album.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

func (h *AlbumHandler) GetAllAlbums(c echo.Context) error {
	albums, err := h.albumUsecase.GetAllAlbums()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	response := make([]AlbumResponse, len(albums))
	for i, album := range albums {
		response[i] = AlbumResponse{
			ID:           album.ID,
			Title:        album.Title,
			Description:  album.Description,
			CoverPhotoID: album.CoverPhotoID,
			CreatedBy:    album.CreatedBy,
			CreatedAt:    album.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	return c.JSON(http.StatusOK, response)
}

type UpdateAlbumRequest struct {
	Title        string `json:"title"`
	Description  string `json:"description"`
	CoverPhotoID *uint  `json:"cover_photo_id"`
}

func (h *AlbumHandler) UpdateAlbum(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid album ID")
	}

	var req UpdateAlbumRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	album, err := h.albumUsecase.UpdateAlbum(uint(id), req.Title, req.Description, req.CoverPhotoID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, AlbumResponse{
		ID:           album.ID,
		Title:        album.Title,
		Description:  album.Description,
		CoverPhotoID: album.CoverPhotoID,
		CreatedBy:    album.CreatedBy,
		CreatedAt:    album.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

func (h *AlbumHandler) DeleteAlbum(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid album ID")
	}

	if err := h.albumUsecase.DeleteAlbum(uint(id)); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}

type PhotoResponse struct {
	ID          uint   `json:"id"`
	AlbumID     uint   `json:"album_id"`
	S3Key       string `json:"s3_key"`
	ContentType string `json:"content_type"`
	SizeBytes   int64  `json:"size_bytes"`
	Width       int    `json:"width"`
	Height      int    `json:"height"`
	UploadedBy  uint   `json:"uploaded_by"`
	CreatedAt   string `json:"created_at"`
}

func (h *AlbumHandler) GetAlbumPhotos(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid album ID")
	}

	photos, err := h.albumUsecase.GetAlbumPhotos(uint(id))
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	response := make([]PhotoResponse, len(photos))
	for i, photo := range photos {
		response[i] = PhotoResponse{
			ID:          photo.ID,
			AlbumID:     photo.AlbumID,
			S3Key:       photo.S3Key,
			ContentType: photo.ContentType,
			SizeBytes:   photo.SizeBytes,
			Width:       photo.Width,
			Height:      photo.Height,
			UploadedBy:  photo.UploadedBy,
			CreatedAt:   photo.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	return c.JSON(http.StatusOK, response)
}
