package repository

import "memoria/internal/domain/model"

type TagRepository interface {
	Create(tag *model.Tag) error
	FindByID(id uint) (*model.Tag, error)
	FindByName(name string) (*model.Tag, error)
	FindAll() ([]*model.Tag, error)
}
