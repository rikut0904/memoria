package usecase

import (
	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"
	"time"
)

type TripUsecase struct {
	tripRepo          repository.TripRepository
	itineraryRepo     repository.TripItineraryRepository
	wishlistRepo      repository.TripWishlistRepository
	expenseRepo       repository.TripExpenseRepository
	relationRepo      repository.TripRelationRepository
}

func NewTripUsecase(
	tripRepo repository.TripRepository,
	itineraryRepo repository.TripItineraryRepository,
	wishlistRepo repository.TripWishlistRepository,
	expenseRepo repository.TripExpenseRepository,
	relationRepo repository.TripRelationRepository,
) *TripUsecase {
	return &TripUsecase{
		tripRepo:      tripRepo,
		itineraryRepo: itineraryRepo,
		wishlistRepo:  wishlistRepo,
		expenseRepo:   expenseRepo,
		relationRepo:  relationRepo,
	}
}

// Trip operations
func (u *TripUsecase) CreateTrip(title string, startAt, endAt time.Time, note string, createdBy uint, notifyAt *time.Time, albumIDs, postIDs []uint) (*model.Trip, error) {
	trip := &model.Trip{
		Title:     title,
		StartAt:   startAt,
		EndAt:     endAt,
		Note:      note,
		CreatedBy: createdBy,
		NotifyAt:  notifyAt,
	}

	if err := u.tripRepo.Create(trip); err != nil {
		return nil, err
	}

	if err := u.relationRepo.AddAlbums(trip.ID, albumIDs); err != nil {
		return nil, err
	}
	if err := u.relationRepo.AddPosts(trip.ID, postIDs); err != nil {
		return nil, err
	}

	return trip, nil
}

func (u *TripUsecase) GetTrip(id uint) (*model.Trip, error) {
	return u.tripRepo.FindByID(id)
}

func (u *TripUsecase) GetTripRelations(tripID uint) ([]*model.Album, []*model.Post, error) {
	albums, err := u.relationRepo.FindAlbumsByTripID(tripID)
	if err != nil {
		return nil, nil, err
	}
	posts, err := u.relationRepo.FindPostsByTripID(tripID)
	if err != nil {
		return nil, nil, err
	}
	return albums, posts, nil
}

func (u *TripUsecase) GetAllTrips() ([]*model.Trip, error) {
	return u.tripRepo.FindAll()
}

func (u *TripUsecase) UpdateTrip(id uint, title string, startAt, endAt time.Time, note string, notifyAt *time.Time) (*model.Trip, error) {
	trip, err := u.tripRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	trip.Title = title
	trip.StartAt = startAt
	trip.EndAt = endAt
	trip.Note = note
	trip.NotifyAt = notifyAt

	if err := u.tripRepo.Update(trip); err != nil {
		return nil, err
	}

	return trip, nil
}

func (u *TripUsecase) DeleteTrip(id uint) error {
	return u.tripRepo.Delete(id)
}

// Itinerary operations
func (u *TripUsecase) CreateItinerary(tripID uint, title string, startAt, endAt time.Time, location, note string) (*model.TripItinerary, error) {
	itinerary := &model.TripItinerary{
		TripID:   tripID,
		Title:    title,
		StartAt:  startAt,
		EndAt:    endAt,
		Location: location,
		Note:     note,
	}

	if err := u.itineraryRepo.Create(itinerary); err != nil {
		return nil, err
	}

	return itinerary, nil
}

func (u *TripUsecase) GetItineraries(tripID uint) ([]*model.TripItinerary, error) {
	return u.itineraryRepo.FindByTripID(tripID)
}

func (u *TripUsecase) UpdateItinerary(id uint, title string, startAt, endAt time.Time, location, note string) (*model.TripItinerary, error) {
	itinerary := &model.TripItinerary{
		BaseModel: model.BaseModel{ID: id},
		Title:     title,
		StartAt:   startAt,
		EndAt:     endAt,
		Location:  location,
		Note:      note,
	}

	if err := u.itineraryRepo.Update(itinerary); err != nil {
		return nil, err
	}

	return itinerary, nil
}

func (u *TripUsecase) DeleteItinerary(id uint) error {
	return u.itineraryRepo.Delete(id)
}

// Wishlist operations
func (u *TripUsecase) CreateWishlist(tripID uint, title, location, note string, priority int) (*model.TripWishlist, error) {
	wishlist := &model.TripWishlist{
		TripID:   tripID,
		Title:    title,
		Location: location,
		Note:     note,
		Priority: priority,
	}

	if err := u.wishlistRepo.Create(wishlist); err != nil {
		return nil, err
	}

	return wishlist, nil
}

func (u *TripUsecase) GetWishlists(tripID uint) ([]*model.TripWishlist, error) {
	return u.wishlistRepo.FindByTripID(tripID)
}

func (u *TripUsecase) UpdateWishlist(id uint, title, location, note string, priority int) (*model.TripWishlist, error) {
	wishlist := &model.TripWishlist{
		BaseModel: model.BaseModel{ID: id},
		Title:     title,
		Location:  location,
		Note:      note,
		Priority:  priority,
	}

	if err := u.wishlistRepo.Update(wishlist); err != nil {
		return nil, err
	}

	return wishlist, nil
}

func (u *TripUsecase) DeleteWishlist(id uint) error {
	return u.wishlistRepo.Delete(id)
}

// Expense operations
func (u *TripUsecase) CreateExpense(tripID uint, title, category string, amount int64, currency string, isActual bool, note string) (*model.TripExpense, error) {
	expense := &model.TripExpense{
		TripID:   tripID,
		Title:    title,
		Category: category,
		Amount:   amount,
		Currency: currency,
		IsActual: isActual,
		Note:     note,
	}

	if err := u.expenseRepo.Create(expense); err != nil {
		return nil, err
	}

	return expense, nil
}

func (u *TripUsecase) GetExpenses(tripID uint) ([]*model.TripExpense, error) {
	return u.expenseRepo.FindByTripID(tripID)
}

func (u *TripUsecase) UpdateExpense(id uint, title, category string, amount int64, currency string, isActual bool, note string) (*model.TripExpense, error) {
	expense := &model.TripExpense{
		BaseModel: model.BaseModel{ID: id},
		Title:     title,
		Category:  category,
		Amount:    amount,
		Currency:  currency,
		IsActual:  isActual,
		Note:      note,
	}

	if err := u.expenseRepo.Update(expense); err != nil {
		return nil, err
	}

	return expense, nil
}

func (u *TripUsecase) DeleteExpense(id uint) error {
	return u.expenseRepo.Delete(id)
}
