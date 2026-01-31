package repository

import "memoria/internal/domain/model"

type GroupRepository interface {
	Create(group *model.Group) error
	FindByID(id uint) (*model.Group, error)
	FindByUserID(userID uint) ([]*model.Group, error)
}

type GroupMemberRepository interface {
	Add(member *model.GroupMember) error
	FindByGroupID(groupID uint) ([]*model.GroupMember, error)
	FindByGroupAndUser(groupID, userID uint) (*model.GroupMember, error)
	Update(member *model.GroupMember) error
	Delete(groupID, userID uint) error
}
