package persistence

import (
	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"
	"time"

	"gorm.io/gorm"
)

type postRepositoryImpl struct {
	db *gorm.DB
}

func NewPostRepository(db *gorm.DB) repository.PostRepository {
	return &postRepositoryImpl{db: db}
}

func (r *postRepositoryImpl) Create(post *model.Post) error {
	return r.db.Create(post).Error
}

func (r *postRepositoryImpl) FindByID(id uint, groupID uint) (*model.Post, error) {
	var post model.Post
	if err := r.db.Where("id = ? AND group_id = ?", id, groupID).First(&post).Error; err != nil {
		return nil, err
	}
	return &post, nil
}

func (r *postRepositoryImpl) FindAll(groupID uint) ([]*model.Post, error) {
	var posts []*model.Post
	if err := r.db.Where("group_id = ?", groupID).Order("published_at DESC").Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

func (r *postRepositoryImpl) FindByTagID(tagID uint, groupID uint) ([]*model.Post, error) {
	var posts []*model.Post
	if err := r.db.
		Joins("JOIN post_tags ON post_tags.post_id = posts.id").
		Where("post_tags.tag_id = ? AND posts.group_id = ?", tagID, groupID).
		Order("published_at DESC").
		Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

func (r *postRepositoryImpl) Update(post *model.Post) error {
	return r.db.Save(post).Error
}

func (r *postRepositoryImpl) Delete(id uint) error {
	return r.db.Delete(&model.Post{}, id).Error
}

func (r *postRepositoryImpl) AddAlbum(postID, albumID uint) error {
	albumPost := &model.AlbumPost{
		AlbumID:   albumID,
		PostID:    postID,
		CreatedAt: time.Now(),
	}
	return r.db.Create(albumPost).Error
}

func (r *postRepositoryImpl) RemoveAlbum(postID, albumID uint) error {
	return r.db.Where("post_id = ? AND album_id = ?", postID, albumID).Delete(&model.AlbumPost{}).Error
}

func (r *postRepositoryImpl) AddPhoto(postID, photoID uint) error {
	postPhoto := &model.PostPhoto{
		PostID:    postID,
		PhotoID:   photoID,
		CreatedAt: time.Now(),
	}
	return r.db.Create(postPhoto).Error
}

func (r *postRepositoryImpl) RemovePhoto(postID, photoID uint) error {
	return r.db.Where("post_id = ? AND photo_id = ?", postID, photoID).Delete(&model.PostPhoto{}).Error
}

func (r *postRepositoryImpl) AddTag(postID, tagID uint) error {
	postTag := &model.PostTag{
		PostID:    postID,
		TagID:     tagID,
		CreatedAt: time.Now(),
	}
	return r.db.Create(postTag).Error
}

func (r *postRepositoryImpl) RemoveTag(postID, tagID uint) error {
	return r.db.Where("post_id = ? AND tag_id = ?", postID, tagID).Delete(&model.PostTag{}).Error
}

func (r *postRepositoryImpl) AddLike(postID, userID uint) error {
	like := &model.PostLike{
		PostID:    postID,
		UserID:    userID,
		CreatedAt: time.Now(),
	}
	return r.db.Create(like).Error
}

func (r *postRepositoryImpl) RemoveLike(postID, userID uint) error {
	return r.db.Where("post_id = ? AND user_id = ?", postID, userID).Delete(&model.PostLike{}).Error
}

func (r *postRepositoryImpl) CreateComment(comment *model.PostComment) error {
	return r.db.Create(comment).Error
}

func (r *postRepositoryImpl) DeleteComment(id uint) error {
	return r.db.Delete(&model.PostComment{}, id).Error
}

func (r *postRepositoryImpl) FindCommentsByPostID(postID uint) ([]*model.PostComment, error) {
	var comments []*model.PostComment
	if err := r.db.Where("post_id = ?", postID).Order("created_at ASC").Find(&comments).Error; err != nil {
		return nil, err
	}
	return comments, nil
}
