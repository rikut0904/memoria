package usecase

import (
	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"
	"time"
)

type AnniversaryUsecase struct {
	anniversaryRepo repository.AnniversaryRepository
}

func NewAnniversaryUsecase(anniversaryRepo repository.AnniversaryRepository) *AnniversaryUsecase {
	return &AnniversaryUsecase{
		anniversaryRepo: anniversaryRepo,
	}
}

func (u *AnniversaryUsecase) CreateAnniversary(title string, date time.Time, remindDaysBefore int, note string, createdBy uint) (*model.Anniversary, error) {
	// Calculate reminder time
	var remindAt *time.Time
	if remindDaysBefore > 0 {
		reminder := date.AddDate(0, 0, -remindDaysBefore)
		remindAt = &reminder
	}

	anniversary := &model.Anniversary{
		Title:            title,
		Date:             date,
		RemindDaysBefore: remindDaysBefore,
		RemindAt:         remindAt,
		Note:             note,
		CreatedBy:        createdBy,
	}

	if err := u.anniversaryRepo.Create(anniversary); err != nil {
		return nil, err
	}

	return anniversary, nil
}

func (u *AnniversaryUsecase) GetAnniversary(id uint) (*model.Anniversary, error) {
	return u.anniversaryRepo.FindByID(id)
}

func (u *AnniversaryUsecase) GetAllAnniversaries() ([]*model.Anniversary, error) {
	return u.anniversaryRepo.FindAll()
}

func (u *AnniversaryUsecase) UpdateAnniversary(id uint, title string, date time.Time, remindDaysBefore int, note string) (*model.Anniversary, error) {
	anniversary, err := u.anniversaryRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	anniversary.Title = title
	anniversary.Date = date
	anniversary.RemindDaysBefore = remindDaysBefore
	anniversary.Note = note

	// Recalculate reminder time
	if remindDaysBefore > 0 {
		reminder := date.AddDate(0, 0, -remindDaysBefore)
		anniversary.RemindAt = &reminder
	} else {
		anniversary.RemindAt = nil
	}

	if err := u.anniversaryRepo.Update(anniversary); err != nil {
		return nil, err
	}

	return anniversary, nil
}

func (u *AnniversaryUsecase) DeleteAnniversary(id uint) error {
	return u.anniversaryRepo.Delete(id)
}
