package persistence

import (
	"errors"
	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"

	"gorm.io/gorm"
)

type signupProfileRepositoryImpl struct {
	db *gorm.DB
}

func NewSignupProfileRepository(db *gorm.DB) repository.SignupProfileRepository {
	return &signupProfileRepositoryImpl{db: db}
}

func (r *signupProfileRepositoryImpl) Create(profile *model.SignupProfile) error {
	var existing model.SignupProfile
	if err := r.db.Where("firebase_uid = ?", profile.FirebaseUID).First(&existing).Error; err == nil {
		existing.Email = profile.Email
		existing.DisplayName = profile.DisplayName
		return r.db.Save(&existing).Error
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	return r.db.Create(profile).Error
}

func (r *signupProfileRepositoryImpl) FindByFirebaseUID(firebaseUID string) (*model.SignupProfile, error) {
	var profile model.SignupProfile
	if err := r.db.Where("firebase_uid = ?", firebaseUID).First(&profile).Error; err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *signupProfileRepositoryImpl) Delete(id uint) error {
	return r.db.Delete(&model.SignupProfile{}, id).Error
}
