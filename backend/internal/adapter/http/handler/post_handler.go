package handler

import (
	"net/http"
	"strconv"

	"memoria/internal/domain/model"
	"memoria/internal/usecase"

	"github.com/labstack/echo/v4"
)

type PostHandler struct {
	postUsecase *usecase.PostUsecase
}

func NewPostHandler(postUsecase *usecase.PostUsecase) *PostHandler {
	return &PostHandler{
		postUsecase: postUsecase,
	}
}

type CreatePostRequest struct {
	Type  string   `json:"type" validate:"required"`
	Title string   `json:"title"`
	Body  string   `json:"body" validate:"required"`
	Tags  []string `json:"tags"`
}

type PostResponse struct {
	ID          uint   `json:"id"`
	Type        string `json:"type"`
	Title       string `json:"title"`
	Body        string `json:"body"`
	AuthorID    uint   `json:"author_id"`
	PublishedAt string `json:"published_at"`
	CreatedAt   string `json:"created_at"`
}

func (h *PostHandler) CreatePost(c echo.Context) error {
	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}

	var req CreatePostRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	post, err := h.postUsecase.CreatePost(req.Type, req.Title, req.Body, user.ID, req.Tags)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, PostResponse{
		ID:          post.ID,
		Type:        post.Type,
		Title:       post.Title,
		Body:        post.Body,
		AuthorID:    post.AuthorID,
		PublishedAt: post.PublishedAt.Format("2006-01-02T15:04:05Z07:00"),
		CreatedAt:   post.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

func (h *PostHandler) GetPost(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid post ID")
	}

	post, err := h.postUsecase.GetPost(uint(id))
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "post not found")
	}

	return c.JSON(http.StatusOK, PostResponse{
		ID:          post.ID,
		Type:        post.Type,
		Title:       post.Title,
		Body:        post.Body,
		AuthorID:    post.AuthorID,
		PublishedAt: post.PublishedAt.Format("2006-01-02T15:04:05Z07:00"),
		CreatedAt:   post.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

func (h *PostHandler) GetAllPosts(c echo.Context) error {
	posts, err := h.postUsecase.GetAllPosts()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	response := make([]PostResponse, len(posts))
	for i, post := range posts {
		response[i] = PostResponse{
			ID:          post.ID,
			Type:        post.Type,
			Title:       post.Title,
			Body:        post.Body,
			AuthorID:    post.AuthorID,
			PublishedAt: post.PublishedAt.Format("2006-01-02T15:04:05Z07:00"),
			CreatedAt:   post.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	return c.JSON(http.StatusOK, response)
}

type UpdatePostRequest struct {
	Type  string   `json:"type"`
	Title string   `json:"title"`
	Body  string   `json:"body"`
	Tags  []string `json:"tags"`
}

func (h *PostHandler) UpdatePost(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid post ID")
	}

	var req UpdatePostRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	post, err := h.postUsecase.UpdatePost(uint(id), req.Type, req.Title, req.Body, req.Tags)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, PostResponse{
		ID:          post.ID,
		Type:        post.Type,
		Title:       post.Title,
		Body:        post.Body,
		AuthorID:    post.AuthorID,
		PublishedAt: post.PublishedAt.Format("2006-01-02T15:04:05Z07:00"),
		CreatedAt:   post.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

func (h *PostHandler) DeletePost(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid post ID")
	}

	if err := h.postUsecase.DeletePost(uint(id)); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}

func (h *PostHandler) AddLike(c echo.Context) error {
	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}

	postID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid post ID")
	}

	if err := h.postUsecase.AddLike(uint(postID), user.ID); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusCreated)
}

func (h *PostHandler) RemoveLike(c echo.Context) error {
	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}

	postID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid post ID")
	}

	if err := h.postUsecase.RemoveLike(uint(postID), user.ID); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}

type CreateCommentRequest struct {
	Body string `json:"body" validate:"required"`
}

type CommentResponse struct {
	ID        uint   `json:"id"`
	PostID    uint   `json:"post_id"`
	UserID    uint   `json:"user_id"`
	Body      string `json:"body"`
	CreatedAt string `json:"created_at"`
}

func (h *PostHandler) CreateComment(c echo.Context) error {
	userVal := c.Get("user")
	user, ok := userVal.(*model.User)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid user")
	}

	postID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid post ID")
	}

	var req CreateCommentRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	comment, err := h.postUsecase.CreateComment(uint(postID), user.ID, req.Body)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, CommentResponse{
		ID:        comment.ID,
		PostID:    comment.PostID,
		UserID:    comment.UserID,
		Body:      comment.Body,
		CreatedAt: comment.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

func (h *PostHandler) DeleteComment(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid comment ID")
	}

	if err := h.postUsecase.DeleteComment(uint(id)); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}

func (h *PostHandler) GetComments(c echo.Context) error {
	postID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid post ID")
	}

	comments, err := h.postUsecase.GetComments(uint(postID))
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	response := make([]CommentResponse, len(comments))
	for i, comment := range comments {
		response[i] = CommentResponse{
			ID:        comment.ID,
			PostID:    comment.PostID,
			UserID:    comment.UserID,
			Body:      comment.Body,
			CreatedAt: comment.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	return c.JSON(http.StatusOK, response)
}

type AddAlbumRequest struct {
	AlbumID uint `json:"album_id" validate:"required"`
}

func (h *PostHandler) AddAlbum(c echo.Context) error {
	postID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid post ID")
	}

	var req AddAlbumRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := h.postUsecase.AddAlbum(uint(postID), req.AlbumID); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusCreated)
}

func (h *PostHandler) RemoveAlbum(c echo.Context) error {
	postID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid post ID")
	}

	albumID, err := strconv.ParseUint(c.Param("albumId"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid album ID")
	}

	if err := h.postUsecase.RemoveAlbum(uint(postID), uint(albumID)); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}

type AddPhotoRequest struct {
	PhotoID uint `json:"photo_id" validate:"required"`
}

func (h *PostHandler) AddPhoto(c echo.Context) error {
	postID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid post ID")
	}

	var req AddPhotoRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := h.postUsecase.AddPhoto(uint(postID), req.PhotoID); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusCreated)
}

func (h *PostHandler) RemovePhoto(c echo.Context) error {
	postID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid post ID")
	}

	photoID, err := strconv.ParseUint(c.Param("photoId"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid photo ID")
	}

	if err := h.postUsecase.RemovePhoto(uint(postID), uint(photoID)); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}

type TagResponse struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

func (h *PostHandler) GetAllTags(c echo.Context) error {
	tags, err := h.postUsecase.GetAllTags()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	response := make([]TagResponse, len(tags))
	for i, tag := range tags {
		response[i] = TagResponse{
			ID:   tag.ID,
			Name: tag.Name,
		}
	}

	return c.JSON(http.StatusOK, response)
}
