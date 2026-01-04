package usecase

import (
	"fmt"
	"path/filepath"
	"time"

	"memoria/internal/adapter/storage"
	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"
)

type PhotoUsecase struct {
	photoRepo repository.PhotoRepository
	s3Service *storage.S3Service
}

func NewPhotoUsecase(photoRepo repository.PhotoRepository, s3Service *storage.S3Service) *PhotoUsecase {
	return &PhotoUsecase{
		photoRepo: photoRepo,
		s3Service: s3Service,
	}
}

func (u *PhotoUsecase) GenerateUploadURL(albumID uint, filename, contentType string, userID uint) (string, string, error) {
	// Generate unique key
	timestamp := time.Now().UnixNano()
	ext := filepath.Ext(filename)
	key := fmt.Sprintf("albums/%d/%d-%d%s", albumID, userID, timestamp, ext)

	// Generate presigned URL (15 minutes)
	url, err := u.s3Service.GeneratePresignedURL(key, contentType, 15*time.Minute)
	if err != nil {
		return "", "", err
	}

	return url, key, nil
}

func (u *PhotoUsecase) CreatePhoto(albumID uint, s3Key, contentType string, sizeBytes int64, width, height int, uploadedBy uint) (*model.Photo, error) {
	photo := &model.Photo{
		AlbumID:     albumID,
		S3Key:       s3Key,
		ContentType: contentType,
		SizeBytes:   sizeBytes,
		Width:       width,
		Height:      height,
		UploadedBy:  uploadedBy,
	}

	if err := u.photoRepo.Create(photo); err != nil {
		return nil, err
	}

	return photo, nil
}

func (u *PhotoUsecase) GetPhoto(id uint) (*model.Photo, error) {
	return u.photoRepo.FindByID(id)
}

func (u *PhotoUsecase) DeletePhoto(id uint) error {
	photo, err := u.photoRepo.FindByID(id)
	if err != nil {
		return err
	}

	// Delete from S3
	if err := u.s3Service.DeleteObject(photo.S3Key); err != nil {
		return err
	}

	// Delete from database
	return u.photoRepo.Delete(id)
}
