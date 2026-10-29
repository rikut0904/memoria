package usecase

import (
	"errors"

	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"
)

type UserUsecase struct {
	userRepo repository.UserRepository
}

func NewUserUsecase(userRepo repository.UserRepository) *UserUsecase {
	return &UserUsecase{userRepo: userRepo}
}

func (u *UserUsecase) GetMe(userID uint) (*model.User, error) {
	return u.userRepo.FindByID(userID)
}

func (u *UserUsecase) UpdateDisplayName(userID uint, displayName string) (*model.User, error) {
	user, err := u.userRepo.FindByID(userID)
	if err != nil {
		return nil, err
	}

	user.DisplayName = displayName
	if err := u.userRepo.Update(user); err != nil {
		return nil, err
	}

	return user, nil
}

// 管理者用: 全ユーザー一覧取得
func (u *UserUsecase) GetAllUsers() ([]*model.User, error) {
	return u.userRepo.FindAll()
}

// 管理者用: ユーザー詳細取得
func (u *UserUsecase) GetUserByID(userID uint) (*model.User, error) {
	return u.userRepo.FindByID(userID)
}

func (u *UserUsecase) GetUserByEmail(email string) (*model.User, error) {
	return u.userRepo.FindByEmail(email)
}

// 管理者用: ユーザーのロール変更
func (u *UserUsecase) UpdateUserRole(userID uint, role string) (*model.User, error) {
	// ロールのバリデーション
	if role != "admin" && role != "member" {
		return nil, errors.New("invalid role: must be 'admin' or 'member'")
	}

	user, err := u.userRepo.FindByID(userID)
	if err != nil {
		return nil, err
	}

	user.Role = role
	if err := u.userRepo.Update(user); err != nil {
		return nil, err
	}

	return user, nil
}

// 管理者用: ユーザー削除
func (u *UserUsecase) DeleteUser(userID uint) error {
	// ユーザー情報を取得
	if _, err := u.userRepo.FindByID(userID); err != nil {
		return err
	}

	// ClerkアカウントはClerk Dashboardで管理し、ここではアプリケーションユーザーだけを削除する。
	return u.userRepo.Delete(userID)
}
