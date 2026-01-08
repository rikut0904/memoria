package repository

import "memoria/internal/domain/model"

type TripDetailRepository interface {
	ReplaceScheduleItems(tripID uint, items []*model.TripScheduleItem) error
	FindScheduleItems(tripID uint) ([]*model.TripScheduleItem, error)

	ReplaceTransports(tripID uint, transports []*model.TripTransport) error
	FindTransports(tripID uint) ([]*model.TripTransport, error)

	ReplaceLodgings(tripID uint, lodgings []*model.TripLodging) error
	FindLodgings(tripID uint) ([]*model.TripLodging, error)

	ReplaceBudgetItems(tripID uint, items []*model.TripBudgetItem) error
	FindBudgetItems(tripID uint) ([]*model.TripBudgetItem, error)
}
