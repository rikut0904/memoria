package usecase

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"strings"
	"time"

	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"
)

type InviteUsecase struct {
	inviteRepo      repository.InviteRepository
	userRepo        repository.UserRepository
	groupRepo       repository.GroupRepository
	groupMemberRepo repository.GroupMemberRepository
	mailer          InviteMailer
}

type InviteMailer interface {
	SendGroupInvite(email, role, token, groupName string, isExisting bool) error
}

func NewInviteUsecase(
	inviteRepo repository.InviteRepository,
	userRepo repository.UserRepository,
	groupRepo repository.GroupRepository,
	groupMemberRepo repository.GroupMemberRepository,
	mailer InviteMailer,
) *InviteUsecase {
	return &InviteUsecase{
		inviteRepo:      inviteRepo,
		userRepo:        userRepo,
		groupRepo:       groupRepo,
		groupMemberRepo: groupMemberRepo,
		mailer:          mailer,
	}
}

func (u *InviteUsecase) CreateInvite(email, role string, invitedBy uint, groupID uint) (*model.Invite, error) {
	if role == "" {
		role = "member"
	}
	if role != "member" && role != "manager" {
		return nil, errors.New("invalid role: must be 'member' or 'manager'")
	}

	group, err := u.groupRepo.FindByID(groupID)
	if err != nil {
		return nil, errors.New("group not found")
	}

	isExisting := false
	isPending := false
	if user, err := u.userRepo.FindByEmail(email); err == nil && user != nil {
		isPending = isPendingUser(user)
		isExisting = !isPending
		if _, err := u.groupMemberRepo.FindByGroupAndUser(groupID, user.ID); err == nil && !isPending {
			return nil, errors.New("user already belongs to the group")
		}
	}

	// Generate random token
	token, err := generateToken()
	if err != nil {
		return nil, err
	}

	expiresAt := time.Now().Add(7 * 24 * time.Hour)
	var invite *model.Invite
	if isPending {
		invites, err := u.inviteRepo.FindByGroupID(groupID)
		if err != nil {
			return nil, err
		}
		for _, candidate := range invites {
			if !strings.EqualFold(candidate.Email, email) || candidate.Status == "accepted" {
				continue
			}
			previous := *candidate
			candidate.Token = token
			candidate.Status = "pending"
			candidate.Role = role
			candidate.ExpiresAt = expiresAt
			candidate.InvitedBy = invitedBy
			if err := u.inviteRepo.Update(candidate); err != nil {
				return nil, err
			}
			if err := u.sendInvite(candidate, group.Name, isExisting, &previous); err != nil {
				return nil, err
			}
			return candidate, nil
		}
	}

	invite = &model.Invite{
		GroupID:   groupID,
		Email:     email,
		Token:     token,
		Status:    "pending",
		Role:      role,
		ExpiresAt: expiresAt,
		InvitedBy: invitedBy,
	}

	if err := u.inviteRepo.Create(invite); err != nil {
		return nil, err
	}

	if err := u.sendInvite(invite, group.Name, isExisting, nil); err != nil {
		_ = u.inviteRepo.Delete(invite.ID)
		return nil, err
	}

	return invite, nil
}

func (u *InviteUsecase) sendInvite(invite *model.Invite, groupName string, isExisting bool, previous *model.Invite) error {
	if u.mailer == nil {
		return nil
	}
	if err := u.mailer.SendGroupInvite(invite.Email, invite.Role, invite.Token, groupName, isExisting); err != nil {
		if previous != nil {
			_ = u.inviteRepo.Update(previous)
		}
		return err
	}
	return nil
}

func (u *InviteUsecase) VerifyInvite(token string) (*model.Invite, error) {
	invite, err := u.inviteRepo.FindByToken(token)
	if err != nil {
		return nil, errors.New("invalid invite token")
	}

	if invite.Status != "pending" {
		return nil, errors.New("invite already used or expired")
	}

	if time.Now().After(invite.ExpiresAt) {
		invite.Status = "expired"
		u.inviteRepo.Update(invite)
		return nil, errors.New("invite expired")
	}

	return invite, nil
}

func (u *InviteUsecase) AcceptInviteForUser(token string, user *model.User) error {
	invite, err := u.VerifyInvite(token)
	if err != nil {
		return err
	}

	if invite.Email != user.Email {
		return errors.New("email does not match invite")
	}

	if existingMember, err := u.groupMemberRepo.FindByGroupAndUser(invite.GroupID, user.ID); err == nil {
		// Imported users already have a placeholder membership. Once the invited
		// account claims that user record, accepting the invite only needs to
		// finalize the invite instead of inserting a duplicate membership.
		// Never downgrade an existing manager because an older member invite was
		// accepted after a newer manager invite.
		if existingMember.Role != "manager" && invite.Role == "manager" {
			existingMember.Role = invite.Role
			if err := u.groupMemberRepo.Update(existingMember); err != nil {
				return err
			}
		}
		invite.Status = "accepted"
		return u.inviteRepo.Update(invite)
	}

	member := &model.GroupMember{
		GroupID:  invite.GroupID,
		UserID:   user.ID,
		Role:     invite.Role,
		JoinedAt: time.Now(),
	}
	if err := u.groupMemberRepo.Add(member); err != nil {
		return err
	}

	invite.Status = "accepted"
	return u.inviteRepo.Update(invite)
}

func (u *InviteUsecase) DeclineInviteForUser(token string, user *model.User) error {
	invite, err := u.VerifyInvite(token)
	if err != nil {
		return err
	}

	if invite.Email != user.Email {
		return errors.New("email does not match invite")
	}

	invite.Status = "declined"
	return u.inviteRepo.Update(invite)
}

func (u *InviteUsecase) GetGroupInvites(groupID uint) ([]*model.Invite, error) {
	return u.inviteRepo.FindByGroupID(groupID)
}

func (u *InviteUsecase) DeleteInvite(inviteID, groupID uint) error {
	invite, err := u.inviteRepo.FindByID(inviteID)
	if err != nil {
		return err
	}
	if invite.GroupID != groupID {
		return errors.New("invite does not belong to group")
	}
	return u.inviteRepo.Delete(inviteID)
}

func generateToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
