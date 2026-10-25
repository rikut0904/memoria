package repository

import "memoria/internal/domain/model"

type SignupProfileRepository interface {
	Create(profile *model.SignupProfile) error
	FindByFirebaseUID(firebaseUID string) (*model.SignupProfile, error)
	Delete(id uint) error
}
