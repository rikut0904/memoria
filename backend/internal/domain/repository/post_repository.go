package repository

import "memoria/internal/domain/model"

type PostRepository interface {
	Create(post *model.Post) error
	FindByID(id uint, groupID uint) (*model.Post, error)
	FindAll(groupID uint) ([]*model.Post, error)
	FindByTagID(tagID uint, groupID uint) ([]*model.Post, error)
	Update(post *model.Post) error
	Delete(id uint) error

	// Relations
	AddAlbum(postID, albumID uint) error
	RemoveAlbum(postID, albumID uint) error
	AddPhoto(postID, photoID uint) error
	RemovePhoto(postID, photoID uint) error
	AddTag(postID, tagID uint) error
	RemoveTag(postID, tagID uint) error

	// Likes & Comments
	AddLike(postID, userID uint) error
	RemoveLike(postID, userID uint) error
	CreateComment(comment *model.PostComment) error
	DeleteComment(id uint) error
	FindCommentsByPostID(postID uint) ([]*model.PostComment, error)
}
