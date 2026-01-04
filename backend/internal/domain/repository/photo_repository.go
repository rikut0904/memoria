package repository

import "memoria/internal/domain/model"

type PhotoRepository interface {
	Create(photo *model.Photo) error
	FindByID(id uint) (*model.Photo, error)
	FindByAlbumID(albumID uint) ([]*model.Photo, error)
	Delete(id uint) error
}
