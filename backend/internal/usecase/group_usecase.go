package usecase

import (
	"errors"
	"time"

	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"
)

type GroupUsecase struct {
	groupRepo       repository.GroupRepository
	groupMemberRepo repository.GroupMemberRepository
}

func NewGroupUsecase(groupRepo repository.GroupRepository, groupMemberRepo repository.GroupMemberRepository) *GroupUsecase {
	return &GroupUsecase{
		groupRepo:       groupRepo,
		groupMemberRepo: groupMemberRepo,
	}
}

func (u *GroupUsecase) CreateGroup(name string, createdBy uint) (*model.Group, error) {
	if name == "" {
		return nil, errors.New("group name is required")
	}

	group := &model.Group{
		Name:      name,
		CreatedBy: createdBy,
	}
	if err := u.groupRepo.Create(group); err != nil {
		return nil, err
	}

	member := &model.GroupMember{
		GroupID:  group.ID,
		UserID:   createdBy,
		Role:     "manager",
		JoinedAt: time.Now(),
	}
	if err := u.groupMemberRepo.Add(member); err != nil {
		return nil, err
	}

	return group, nil
}

func (u *GroupUsecase) GetGroupsForUser(userID uint) ([]*model.Group, error) {
	return u.groupRepo.FindByUserID(userID)
}

func (u *GroupUsecase) GetGroupMembers(groupID uint) ([]*model.GroupMember, error) {
	return u.groupMemberRepo.FindByGroupID(groupID)
}

func (u *GroupUsecase) GetMembership(groupID, userID uint) (*model.GroupMember, error) {
	return u.groupMemberRepo.FindByGroupAndUser(groupID, userID)
}

func (u *GroupUsecase) GetGroup(groupID uint) (*model.Group, error) {
	return u.groupRepo.FindByID(groupID)
}
