package persistence

import (
	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"

	"gorm.io/gorm"
)

type groupRepositoryImpl struct {
	db *gorm.DB
}

func NewGroupRepository(db *gorm.DB) repository.GroupRepository {
	return &groupRepositoryImpl{db: db}
}

func (r *groupRepositoryImpl) Create(group *model.Group) error {
	return r.db.Create(group).Error
}

func (r *groupRepositoryImpl) FindByID(id uint) (*model.Group, error) {
	var group model.Group
	if err := r.db.First(&group, id).Error; err != nil {
		return nil, err
	}
	return &group, nil
}

func (r *groupRepositoryImpl) FindByUserID(userID uint) ([]*model.Group, error) {
	var groups []*model.Group
	if err := r.db.
		Joins("JOIN group_members ON group_members.group_id = groups.id").
		Where("group_members.user_id = ?", userID).
		Order("groups.created_at DESC").
		Find(&groups).Error; err != nil {
		return nil, err
	}
	return groups, nil
}

type groupMemberRepositoryImpl struct {
	db *gorm.DB
}

func NewGroupMemberRepository(db *gorm.DB) repository.GroupMemberRepository {
	return &groupMemberRepositoryImpl{db: db}
}

func (r *groupMemberRepositoryImpl) Add(member *model.GroupMember) error {
	return r.db.Create(member).Error
}

func (r *groupMemberRepositoryImpl) FindByGroupID(groupID uint) ([]*model.GroupMember, error) {
	var members []*model.GroupMember
	if err := r.db.Where("group_id = ?", groupID).Order("joined_at ASC").Find(&members).Error; err != nil {
		return nil, err
	}
	return members, nil
}

func (r *groupMemberRepositoryImpl) FindByGroupAndUser(groupID, userID uint) (*model.GroupMember, error) {
	var member model.GroupMember
	if err := r.db.Where("group_id = ? AND user_id = ?", groupID, userID).First(&member).Error; err != nil {
		return nil, err
	}
	return &member, nil
}

func (r *groupMemberRepositoryImpl) Update(member *model.GroupMember) error {
	return r.db.Save(member).Error
}

func (r *groupMemberRepositoryImpl) Delete(groupID, userID uint) error {
	return r.db.Where("group_id = ? AND user_id = ?", groupID, userID).Delete(&model.GroupMember{}).Error
}
