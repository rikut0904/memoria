package repository

import "memoria/internal/domain/model"

type PhotoRepository interface {
	Create(photo *model.Photo) error
	FindByID(id uint, groupID uint) (*model.Photo, error)
	FindByAlbumID(albumID uint, groupID uint) ([]*model.Photo, error)
	Delete(id uint) error
}
