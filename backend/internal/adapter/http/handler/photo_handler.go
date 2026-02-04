package handler

import (
	"net/http"
	"strconv"

	"memoria/internal/domain/model"
	"memoria/internal/usecase"

	"github.com/labstack/echo/v4"
)

type PhotoHandler struct {
	photoUsecase *usecase.PhotoUsecase
}

func NewPhotoHandler(photoUsecase *usecase.PhotoUsecase) *PhotoHandler {
	return &PhotoHandler{
		photoUsecase: photoUsecase,
	}
}

type PresignRequest struct {
	Filename    string `json:"filename" validate:"required"`
	ContentType string `json:"content_type" validate:"required"`
}

type PresignResponse struct {
	UploadURL string `json:"upload_url"`
	S3Key     string `json:"s3_key"`
}

func (h *PhotoHandler) GeneratePresignedURL(c echo.Context) error {
	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}

	groupID, err := getGroupIDFromContext(c)
	if err != nil {
		return err
	}

	albumID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid album ID")
	}

	var req PresignRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	url, key, err := h.photoUsecase.GenerateUploadURL(uint(albumID), req.Filename, req.ContentType, user.ID, groupID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, PresignResponse{
		UploadURL: url,
		S3Key:     key,
	})
}

type CreatePhotoRequest struct {
	S3Key       string `json:"s3_key" validate:"required"`
	ContentType string `json:"content_type" validate:"required"`
	SizeBytes   int64  `json:"size_bytes" validate:"required"`
	Width       int    `json:"width"`
	Height      int    `json:"height"`
}

func (h *PhotoHandler) CreatePhoto(c echo.Context) error {
	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}

	groupID, err := getGroupIDFromContext(c)
	if err != nil {
		return err
	}

	albumID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid album ID")
	}

	var req CreatePhotoRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	photo, err := h.photoUsecase.CreatePhoto(
		uint(albumID),
		req.S3Key,
		req.ContentType,
		req.SizeBytes,
		req.Width,
		req.Height,
		user.ID,
		groupID,
	)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, PhotoResponse{
		ID:          photo.ID,
		AlbumID:     photo.AlbumID,
		S3Key:       photo.S3Key,
		ContentType: photo.ContentType,
		SizeBytes:   photo.SizeBytes,
		Width:       photo.Width,
		Height:      photo.Height,
		UploadedBy:  photo.UploadedBy,
		CreatedAt:   photo.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

func (h *PhotoHandler) DeletePhoto(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid photo ID")
	}

	groupID, err := getGroupIDFromContext(c)
	if err != nil {
		return err
	}

	if err := h.photoUsecase.DeletePhoto(uint(id), groupID); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}
