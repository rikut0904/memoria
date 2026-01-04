package usecase

import (
	"time"

	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"
)

type PostUsecase struct {
	postRepo repository.PostRepository
	tagRepo  repository.TagRepository
}

func NewPostUsecase(postRepo repository.PostRepository, tagRepo repository.TagRepository) *PostUsecase {
	return &PostUsecase{
		postRepo: postRepo,
		tagRepo:  tagRepo,
	}
}

func (u *PostUsecase) CreatePost(postType, title, body string, authorID uint, tagNames []string) (*model.Post, error) {
	post := &model.Post{
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

func (u *PostUsecase) GetPost(id uint) (*model.Post, error) {
	return u.postRepo.FindByID(id)
}

func (u *PostUsecase) GetAllPosts() ([]*model.Post, error) {
	return u.postRepo.FindAll()
}

func (u *PostUsecase) GetPostsByTag(tagID uint) ([]*model.Post, error) {
	return u.postRepo.FindByTagID(tagID)
}

func (u *PostUsecase) UpdatePost(id uint, postType, title, body string, tagNames []string) (*model.Post, error) {
	post, err := u.postRepo.FindByID(id)
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

func (u *PostUsecase) DeletePost(id uint) error {
	return u.postRepo.Delete(id)
}

func (u *PostUsecase) AddLike(postID, userID uint) error {
	return u.postRepo.AddLike(postID, userID)
}

func (u *PostUsecase) RemoveLike(postID, userID uint) error {
	return u.postRepo.RemoveLike(postID, userID)
}

func (u *PostUsecase) CreateComment(postID, userID uint, body string) (*model.PostComment, error) {
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

func (u *PostUsecase) GetComments(postID uint) ([]*model.PostComment, error) {
	return u.postRepo.FindCommentsByPostID(postID)
}

func (u *PostUsecase) AddAlbum(postID, albumID uint) error {
	return u.postRepo.AddAlbum(postID, albumID)
}

func (u *PostUsecase) RemoveAlbum(postID, albumID uint) error {
	return u.postRepo.RemoveAlbum(postID, albumID)
}

func (u *PostUsecase) AddPhoto(postID, photoID uint) error {
	return u.postRepo.AddPhoto(postID, photoID)
}

func (u *PostUsecase) RemovePhoto(postID, photoID uint) error {
	return u.postRepo.RemovePhoto(postID, photoID)
}

func (u *PostUsecase) GetAllTags() ([]*model.Tag, error) {
	return u.tagRepo.FindAll()
}
