package persistence

import (
	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"

	"gorm.io/gorm"
)

type albumRepositoryImpl struct {
	db *gorm.DB
}

func NewAlbumRepository(db *gorm.DB) repository.AlbumRepository {
	return &albumRepositoryImpl{db: db}
}

func (r *albumRepositoryImpl) Create(album *model.Album) error {
	return r.db.Create(album).Error
}

func (r *albumRepositoryImpl) FindByID(id uint, groupID uint) (*model.Album, error) {
	var album model.Album
	if err := r.db.Where("id = ? AND group_id = ?", id, groupID).First(&album).Error; err != nil {
		return nil, err
	}
	return &album, nil
}

func (r *albumRepositoryImpl) FindAll(groupID uint) ([]*model.Album, error) {
	var albums []*model.Album
	if err := r.db.Where("group_id = ?", groupID).Order("created_at DESC").Find(&albums).Error; err != nil {
		return nil, err
	}
	return albums, nil
}

func (r *albumRepositoryImpl) Update(album *model.Album) error {
	return r.db.Save(album).Error
}

func (r *albumRepositoryImpl) Delete(id uint) error {
	return r.db.Delete(&model.Album{}, id).Error
}
