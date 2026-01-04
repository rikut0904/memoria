package persistence

import (
	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"

	"gorm.io/gorm"
)

type inviteRepositoryImpl struct {
	db *gorm.DB
}

func NewInviteRepository(db *gorm.DB) repository.InviteRepository {
	return &inviteRepositoryImpl{db: db}
}

func (r *inviteRepositoryImpl) Create(invite *model.Invite) error {
	return r.db.Create(invite).Error
}

func (r *inviteRepositoryImpl) FindByToken(token string) (*model.Invite, error) {
	var invite model.Invite
	if err := r.db.Where("token = ?", token).First(&invite).Error; err != nil {
		return nil, err
	}
	return &invite, nil
}

func (r *inviteRepositoryImpl) FindAll() ([]*model.Invite, error) {
	var invites []*model.Invite
	if err := r.db.Order("created_at DESC").Find(&invites).Error; err != nil {
		return nil, err
	}
	return invites, nil
}

func (r *inviteRepositoryImpl) Update(invite *model.Invite) error {
	return r.db.Save(invite).Error
}

func (r *inviteRepositoryImpl) Delete(id uint) error {
	return r.db.Delete(&model.Invite{}, id).Error
}
