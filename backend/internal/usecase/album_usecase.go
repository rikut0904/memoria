package usecase

import (
	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"
)

type AlbumUsecase struct {
	albumRepo repository.AlbumRepository
	photoRepo repository.PhotoRepository
}

func NewAlbumUsecase(albumRepo repository.AlbumRepository, photoRepo repository.PhotoRepository) *AlbumUsecase {
	return &AlbumUsecase{
		albumRepo: albumRepo,
		photoRepo: photoRepo,
	}
}

func (u *AlbumUsecase) CreateAlbum(title, description string, createdBy uint, groupID uint) (*model.Album, error) {
	album := &model.Album{
		GroupID:     groupID,
		Title:       title,
		Description: description,
		CreatedBy:   createdBy,
	}

	if err := u.albumRepo.Create(album); err != nil {
		return nil, err
	}

	return album, nil
}

func (u *AlbumUsecase) GetAlbum(id uint, groupID uint) (*model.Album, error) {
	return u.albumRepo.FindByID(id, groupID)
}

func (u *AlbumUsecase) GetAllAlbums(groupID uint) ([]*model.Album, error) {
	return u.albumRepo.FindAll(groupID)
}

func (u *AlbumUsecase) UpdateAlbum(id uint, title, description string, coverPhotoID *uint, groupID uint) (*model.Album, error) {
	album, err := u.albumRepo.FindByID(id, groupID)
	if err != nil {
		return nil, err
	}

	album.Title = title
	album.Description = description
	if coverPhotoID != nil {
		album.CoverPhotoID = coverPhotoID
	}

	if err := u.albumRepo.Update(album); err != nil {
		return nil, err
	}

	return album, nil
}

func (u *AlbumUsecase) DeleteAlbum(id uint) error {
	return u.albumRepo.Delete(id)
}

func (u *AlbumUsecase) GetAlbumPhotos(albumID uint, groupID uint) ([]*model.Photo, error) {
	return u.photoRepo.FindByAlbumID(albumID, groupID)
}
