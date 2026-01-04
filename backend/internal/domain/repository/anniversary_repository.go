package repository

import "memoria/internal/domain/model"

type AnniversaryRepository interface {
	Create(anniversary *model.Anniversary) error
	FindByID(id uint) (*model.Anniversary, error)
	FindAll() ([]*model.Anniversary, error)
	Update(anniversary *model.Anniversary) error
	Delete(id uint) error
}
