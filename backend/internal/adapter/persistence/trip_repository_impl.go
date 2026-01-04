package persistence

import (
	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"

	"gorm.io/gorm"
)

type tripRepositoryImpl struct {
	db *gorm.DB
}

func NewTripRepository(db *gorm.DB) repository.TripRepository {
	return &tripRepositoryImpl{db: db}
}

func (r *tripRepositoryImpl) Create(trip *model.Trip) error {
	return r.db.Create(trip).Error
}

func (r *tripRepositoryImpl) FindByID(id uint) (*model.Trip, error) {
	var trip model.Trip
	if err := r.db.First(&trip, id).Error; err != nil {
		return nil, err
	}
	return &trip, nil
}

func (r *tripRepositoryImpl) FindAll() ([]*model.Trip, error) {
	var trips []*model.Trip
	if err := r.db.Order("start_at DESC").Find(&trips).Error; err != nil {
		return nil, err
	}
	return trips, nil
}

func (r *tripRepositoryImpl) Update(trip *model.Trip) error {
	return r.db.Save(trip).Error
}

func (r *tripRepositoryImpl) Delete(id uint) error {
	return r.db.Delete(&model.Trip{}, id).Error
}

type tripItineraryRepositoryImpl struct {
	db *gorm.DB
}

func NewTripItineraryRepository(db *gorm.DB) repository.TripItineraryRepository {
	return &tripItineraryRepositoryImpl{db: db}
}

func (r *tripItineraryRepositoryImpl) Create(itinerary *model.TripItinerary) error {
	return r.db.Create(itinerary).Error
}

func (r *tripItineraryRepositoryImpl) FindByTripID(tripID uint) ([]*model.TripItinerary, error) {
	var itineraries []*model.TripItinerary
	if err := r.db.Where("trip_id = ?", tripID).Order("start_at ASC").Find(&itineraries).Error; err != nil {
		return nil, err
	}
	return itineraries, nil
}

func (r *tripItineraryRepositoryImpl) Update(itinerary *model.TripItinerary) error {
	return r.db.Save(itinerary).Error
}

func (r *tripItineraryRepositoryImpl) Delete(id uint) error {
	return r.db.Delete(&model.TripItinerary{}, id).Error
}

type tripWishlistRepositoryImpl struct {
	db *gorm.DB
}

func NewTripWishlistRepository(db *gorm.DB) repository.TripWishlistRepository {
	return &tripWishlistRepositoryImpl{db: db}
}

func (r *tripWishlistRepositoryImpl) Create(wishlist *model.TripWishlist) error {
	return r.db.Create(wishlist).Error
}

func (r *tripWishlistRepositoryImpl) FindByTripID(tripID uint) ([]*model.TripWishlist, error) {
	var wishlists []*model.TripWishlist
	if err := r.db.Where("trip_id = ?", tripID).Order("priority DESC").Find(&wishlists).Error; err != nil {
		return nil, err
	}
	return wishlists, nil
}

func (r *tripWishlistRepositoryImpl) Update(wishlist *model.TripWishlist) error {
	return r.db.Save(wishlist).Error
}

func (r *tripWishlistRepositoryImpl) Delete(id uint) error {
	return r.db.Delete(&model.TripWishlist{}, id).Error
}

type tripExpenseRepositoryImpl struct {
	db *gorm.DB
}

func NewTripExpenseRepository(db *gorm.DB) repository.TripExpenseRepository {
	return &tripExpenseRepositoryImpl{db: db}
}

func (r *tripExpenseRepositoryImpl) Create(expense *model.TripExpense) error {
	return r.db.Create(expense).Error
}

func (r *tripExpenseRepositoryImpl) FindByTripID(tripID uint) ([]*model.TripExpense, error) {
	var expenses []*model.TripExpense
	if err := r.db.Where("trip_id = ?", tripID).Find(&expenses).Error; err != nil {
		return nil, err
	}
	return expenses, nil
}

func (r *tripExpenseRepositoryImpl) Update(expense *model.TripExpense) error {
	return r.db.Save(expense).Error
}

func (r *tripExpenseRepositoryImpl) Delete(id uint) error {
	return r.db.Delete(&model.TripExpense{}, id).Error
}
