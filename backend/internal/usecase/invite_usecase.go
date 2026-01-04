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
	inviteRepo repository.InviteRepository
	userRepo   repository.UserRepository
	mailer     InviteMailer
	adminEmails string
}

type InviteMailer interface {
	SendInvite(email, role, token string) error
}

func NewInviteUsecase(inviteRepo repository.InviteRepository, userRepo repository.UserRepository, mailer InviteMailer, adminEmails string) *InviteUsecase {
	return &InviteUsecase{
		inviteRepo: inviteRepo,
		userRepo:   userRepo,
		mailer:     mailer,
		adminEmails: adminEmails,
	}
}

func (u *InviteUsecase) CreateInvite(email, role string, invitedBy uint) (*model.Invite, error) {
	if role == "" {
		role = "user"
	}
	if role != "admin" && role != "user" {
		return nil, errors.New("invalid role: must be 'admin' or 'user'")
	}

	// Generate random token
	token, err := generateToken()
	if err != nil {
		return nil, err
	}

	invite := &model.Invite{
		Email:     email,
		Token:     token,
		Status:    "pending",
		Role:      role,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour), // 7 days
		InvitedBy: invitedBy,
	}

	if err := u.inviteRepo.Create(invite); err != nil {
		return nil, err
	}

	if u.mailer != nil {
		if err := u.mailer.SendInvite(invite.Email, invite.Role, invite.Token); err != nil {
			_ = u.inviteRepo.Delete(invite.ID)
			return nil, err
		}
	}

	return invite, nil
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

func (u *InviteUsecase) AcceptInvite(token, firebaseUID, email, displayName string) (*model.User, error) {
	invite, err := u.VerifyInvite(token)
	if err != nil {
		return nil, err
	}

	// Check if email matches
	if invite.Email != email {
		return nil, errors.New("email does not match invite")
	}

	// Determine role from invite (fallback to admin email list for legacy invites).
	role := invite.Role
	if role == "" {
		role = "user"
		if u.isAdminEmail(email) {
			role = "admin"
		}
	}

	// Create user
	user := &model.User{
		FirebaseUID: firebaseUID,
		Email:       email,
		DisplayName: displayName,
		Role:        role,
	}

	if err := u.userRepo.Create(user); err != nil {
		return nil, err
	}

	// After successful use, delete invite to prevent reuse.
	if err := u.inviteRepo.Delete(invite.ID); err != nil {
		invite.Status = "accepted"
		_ = u.inviteRepo.Update(invite)
	}

	return user, nil
}

func (u *InviteUsecase) isAdminEmail(email string) bool {
	adminEmails := strings.Split(u.adminEmails, ",")
	for _, adminEmail := range adminEmails {
		if strings.TrimSpace(adminEmail) == email {
			return true
		}
	}
	return false
}

// 管理者用: 全招待一覧取得
func (u *InviteUsecase) GetAllInvites() ([]*model.Invite, error) {
	return u.inviteRepo.FindAll()
}

// 管理者用: 招待の削除
func (u *InviteUsecase) DeleteInvite(inviteID uint) error {
	return u.inviteRepo.Delete(inviteID)
}

func generateToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
