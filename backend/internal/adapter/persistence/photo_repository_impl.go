package persistence

import (
	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"

	"gorm.io/gorm"
)

type photoRepositoryImpl struct {
	db *gorm.DB
}

func NewPhotoRepository(db *gorm.DB) repository.PhotoRepository {
	return &photoRepositoryImpl{db: db}
}

func (r *photoRepositoryImpl) Create(photo *model.Photo) error {
	return r.db.Create(photo).Error
}

func (r *photoRepositoryImpl) FindByID(id uint, groupID uint) (*model.Photo, error) {
	var photo model.Photo
	if err := r.db.Where("id = ? AND group_id = ?", id, groupID).First(&photo).Error; err != nil {
		return nil, err
	}
	return &photo, nil
}

func (r *photoRepositoryImpl) FindByAlbumID(albumID uint, groupID uint) ([]*model.Photo, error) {
	var photos []*model.Photo
	if err := r.db.Where("album_id = ? AND group_id = ?", albumID, groupID).Order("created_at DESC").Find(&photos).Error; err != nil {
		return nil, err
	}
	return photos, nil
}

func (r *photoRepositoryImpl) Delete(id uint) error {
	return r.db.Delete(&model.Photo{}, id).Error
}
