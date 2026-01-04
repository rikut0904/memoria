package repository

import "memoria/internal/domain/model"

type InviteRepository interface {
	Create(invite *model.Invite) error
	FindByToken(token string) (*model.Invite, error)
	FindAll() ([]*model.Invite, error)
	Update(invite *model.Invite) error
	Delete(id uint) error
}
