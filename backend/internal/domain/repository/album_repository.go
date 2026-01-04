package repository

import "memoria/internal/domain/model"

type AlbumRepository interface {
	Create(album *model.Album) error
	FindByID(id uint) (*model.Album, error)
	FindAll() ([]*model.Album, error)
	Update(album *model.Album) error
	Delete(id uint) error
}
