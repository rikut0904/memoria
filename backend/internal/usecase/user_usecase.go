package usecase

import (
	"context"
	"errors"

	"memoria/internal/adapter/auth"
	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"
)

type UserUsecase struct {
	userRepo     repository.UserRepository
	firebaseAuth *auth.FirebaseAuth
}

func NewUserUsecase(userRepo repository.UserRepository, firebaseAuth *auth.FirebaseAuth) *UserUsecase {
	return &UserUsecase{
		userRepo:     userRepo,
		firebaseAuth: firebaseAuth,
	}
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

func (u *UserUsecase) CreateUserIfNotExists(firebaseUID, email, displayName string) (*model.User, error) {
	if firebaseUID == "" || email == "" {
		return nil, errors.New("firebase uid and email are required")
	}

	if existing, err := u.userRepo.FindByFirebaseUID(firebaseUID); err == nil && existing != nil {
		return existing, nil
	}

	if existing, err := u.userRepo.FindByEmail(email); err == nil && existing != nil {
		if existing.FirebaseUID != firebaseUID {
			return nil, errors.New("email already exists")
		}
		return existing, nil
	}

	user := &model.User{
		FirebaseUID: firebaseUID,
		Email:       email,
		DisplayName: displayName,
		Role:        "member",
	}

	if err := u.userRepo.Create(user); err != nil {
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
	user, err := u.userRepo.FindByID(userID)
	if err != nil {
		return err
	}

	// Firebaseユーザーを削除
	if err := u.firebaseAuth.DeleteUser(context.Background(), user.FirebaseUID); err != nil {
		// Firebase削除に失敗してもログに記録してDB削除は続行
		// （Firebaseユーザーが既に削除されている場合などを考慮）
		// 本番環境ではログに記録すべき
	}

	// データベースからユーザーを削除
	return u.userRepo.Delete(userID)
}
