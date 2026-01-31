package repository

import "memoria/internal/domain/model"

type TripRepository interface {
	Create(trip *model.Trip) error
	FindByID(id uint, groupID uint) (*model.Trip, error)
	FindAll(groupID uint) ([]*model.Trip, error)
	Update(trip *model.Trip) error
	Delete(id uint) error
}

type TripItineraryRepository interface {
	Create(itinerary *model.TripItinerary) error
	FindByTripID(tripID uint) ([]*model.TripItinerary, error)
	Update(itinerary *model.TripItinerary) error
	Delete(id uint) error
}

type TripWishlistRepository interface {
	Create(wishlist *model.TripWishlist) error
	FindByTripID(tripID uint) ([]*model.TripWishlist, error)
	Update(wishlist *model.TripWishlist) error
	Delete(id uint) error
}

type TripExpenseRepository interface {
	Create(expense *model.TripExpense) error
	FindByTripID(tripID uint) ([]*model.TripExpense, error)
	Update(expense *model.TripExpense) error
	Delete(id uint) error
}
