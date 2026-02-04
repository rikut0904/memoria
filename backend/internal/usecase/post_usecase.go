package usecase

import (
	"time"

	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"
)

type PostUsecase struct {
	postRepo  repository.PostRepository
	tagRepo   repository.TagRepository
	albumRepo repository.AlbumRepository
	photoRepo repository.PhotoRepository
}

func NewPostUsecase(postRepo repository.PostRepository, tagRepo repository.TagRepository, albumRepo repository.AlbumRepository, photoRepo repository.PhotoRepository) *PostUsecase {
	return &PostUsecase{
		postRepo:  postRepo,
		tagRepo:   tagRepo,
		albumRepo: albumRepo,
		photoRepo: photoRepo,
	}
}

func (u *PostUsecase) CreatePost(postType, title, body string, authorID uint, tagNames []string, groupID uint) (*model.Post, error) {
	post := &model.Post{
		GroupID:     groupID,
		Type:        postType,
		Title:       title,
		Body:        body,
		AuthorID:    authorID,
		PublishedAt: time.Now(),
	}

	if err := u.postRepo.Create(post); err != nil {
		return nil, err
	}

	// Add tags
	for _, tagName := range tagNames {
		tag, err := u.tagRepo.FindByName(tagName)
		if err != nil {
			// Create new tag if not exists
			tag = &model.Tag{Name: tagName}
			if err := u.tagRepo.Create(tag); err != nil {
				return nil, err
			}
		}

		if err := u.postRepo.AddTag(post.ID, tag.ID); err != nil {
			return nil, err
		}
	}

	return post, nil
}

func (u *PostUsecase) GetPost(id uint, groupID uint) (*model.Post, error) {
	return u.postRepo.FindByID(id, groupID)
}

func (u *PostUsecase) GetAllPosts(groupID uint) ([]*model.Post, error) {
	return u.postRepo.FindAll(groupID)
}

func (u *PostUsecase) GetPostsByTag(tagID uint, groupID uint) ([]*model.Post, error) {
	return u.postRepo.FindByTagID(tagID, groupID)
}

func (u *PostUsecase) UpdatePost(id uint, postType, title, body string, tagNames []string, groupID uint) (*model.Post, error) {
	post, err := u.postRepo.FindByID(id, groupID)
	if err != nil {
		return nil, err
	}

	post.Type = postType
	post.Title = title
	post.Body = body

	if err := u.postRepo.Update(post); err != nil {
		return nil, err
	}

	// Update tags (simple approach: clear and re-add)
	// In production, you might want a more sophisticated approach
	for _, tagName := range tagNames {
		tag, err := u.tagRepo.FindByName(tagName)
		if err != nil {
			tag = &model.Tag{Name: tagName}
			if err := u.tagRepo.Create(tag); err != nil {
				continue
			}
		}
		u.postRepo.AddTag(post.ID, tag.ID)
	}

	return post, nil
}

func (u *PostUsecase) DeletePost(id uint, groupID uint) error {
	if _, err := u.postRepo.FindByID(id, groupID); err != nil {
		return err
	}
	return u.postRepo.Delete(id)
}

func (u *PostUsecase) AddLike(postID, userID uint, groupID uint) error {
	if _, err := u.postRepo.FindByID(postID, groupID); err != nil {
		return err
	}
	return u.postRepo.AddLike(postID, userID)
}

func (u *PostUsecase) RemoveLike(postID, userID uint, groupID uint) error {
	if _, err := u.postRepo.FindByID(postID, groupID); err != nil {
		return err
	}
	return u.postRepo.RemoveLike(postID, userID)
}

func (u *PostUsecase) CreateComment(postID, userID uint, body string, groupID uint) (*model.PostComment, error) {
	if _, err := u.postRepo.FindByID(postID, groupID); err != nil {
		return nil, err
	}
	comment := &model.PostComment{
		PostID: postID,
		UserID: userID,
		Body:   body,
	}

	if err := u.postRepo.CreateComment(comment); err != nil {
		return nil, err
	}

	return comment, nil
}

func (u *PostUsecase) DeleteComment(id uint) error {
	return u.postRepo.DeleteComment(id)
}

func (u *PostUsecase) GetComments(postID uint, groupID uint) ([]*model.PostComment, error) {
	if _, err := u.postRepo.FindByID(postID, groupID); err != nil {
		return nil, err
	}
	return u.postRepo.FindCommentsByPostID(postID)
}

func (u *PostUsecase) AddAlbum(postID, albumID uint, groupID uint) error {
	if _, err := u.postRepo.FindByID(postID, groupID); err != nil {
		return err
	}
	if _, err := u.albumRepo.FindByID(albumID, groupID); err != nil {
		return err
	}
	return u.postRepo.AddAlbum(postID, albumID)
}

func (u *PostUsecase) RemoveAlbum(postID, albumID uint, groupID uint) error {
	if _, err := u.postRepo.FindByID(postID, groupID); err != nil {
		return err
	}
	if _, err := u.albumRepo.FindByID(albumID, groupID); err != nil {
		return err
	}
	return u.postRepo.RemoveAlbum(postID, albumID)
}

func (u *PostUsecase) AddPhoto(postID, photoID uint, groupID uint) error {
	if _, err := u.postRepo.FindByID(postID, groupID); err != nil {
		return err
	}
	if _, err := u.photoRepo.FindByID(photoID, groupID); err != nil {
		return err
	}
	return u.postRepo.AddPhoto(postID, photoID)
}

func (u *PostUsecase) RemovePhoto(postID, photoID uint, groupID uint) error {
	if _, err := u.postRepo.FindByID(postID, groupID); err != nil {
		return err
	}
	if _, err := u.photoRepo.FindByID(photoID, groupID); err != nil {
		return err
	}
	return u.postRepo.RemovePhoto(postID, photoID)
}

func (u *PostUsecase) GetAllTags() ([]*model.Tag, error) {
	return u.tagRepo.FindAll()
}
