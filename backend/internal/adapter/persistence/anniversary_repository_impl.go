package persistence

import (
	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"

	"gorm.io/gorm"
)

type anniversaryRepositoryImpl struct {
	db *gorm.DB
}

func NewAnniversaryRepository(db *gorm.DB) repository.AnniversaryRepository {
	return &anniversaryRepositoryImpl{db: db}
}

func (r *anniversaryRepositoryImpl) Create(anniversary *model.Anniversary) error {
	return r.db.Create(anniversary).Error
}

func (r *anniversaryRepositoryImpl) FindByID(id uint, groupID uint) (*model.Anniversary, error) {
	var anniversary model.Anniversary
	if err := r.db.Where("id = ? AND group_id = ?", id, groupID).First(&anniversary).Error; err != nil {
		return nil, err
	}
	return &anniversary, nil
}

func (r *anniversaryRepositoryImpl) FindAll(groupID uint) ([]*model.Anniversary, error) {
	var anniversaries []*model.Anniversary
	if err := r.db.Where("group_id = ?", groupID).Order("date ASC").Find(&anniversaries).Error; err != nil {
		return nil, err
	}
	return anniversaries, nil
}

func (r *anniversaryRepositoryImpl) Update(anniversary *model.Anniversary) error {
	return r.db.Save(anniversary).Error
}

func (r *anniversaryRepositoryImpl) Delete(id uint) error {
	return r.db.Delete(&model.Anniversary{}, id).Error
}
