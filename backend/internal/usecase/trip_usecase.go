package usecase

import (
	"time"

	"memoria/internal/domain/model"
	"memoria/internal/domain/repository"
)

type TripUsecase struct {
	tripRepo          repository.TripRepository
	itineraryRepo     repository.TripItineraryRepository
	wishlistRepo      repository.TripWishlistRepository
	expenseRepo       repository.TripExpenseRepository
	relationRepo      repository.TripRelationRepository
	detailRepo        repository.TripDetailRepository
}

func NewTripUsecase(
	tripRepo repository.TripRepository,
	itineraryRepo repository.TripItineraryRepository,
	wishlistRepo repository.TripWishlistRepository,
	expenseRepo repository.TripExpenseRepository,
	relationRepo repository.TripRelationRepository,
	detailRepo repository.TripDetailRepository,
) *TripUsecase {
	return &TripUsecase{
		tripRepo:      tripRepo,
		itineraryRepo: itineraryRepo,
		wishlistRepo:  wishlistRepo,
		expenseRepo:   expenseRepo,
		relationRepo:  relationRepo,
		detailRepo:    detailRepo,
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

func (u *TripUsecase) GetSchedule(tripID uint) ([]*model.TripScheduleItem, error) {
	return u.detailRepo.FindScheduleItems(tripID)
}

func (u *TripUsecase) UpdateSchedule(tripID uint, items []*model.TripScheduleItem) error {
	return u.detailRepo.ReplaceScheduleItems(tripID, items)
}

func (u *TripUsecase) GetTransports(tripID uint) ([]*model.TripTransport, error) {
	return u.detailRepo.FindTransports(tripID)
}

func (u *TripUsecase) UpdateTransports(tripID uint, transports []*model.TripTransport) error {
	for _, transport := range transports {
		u.applyTransportCosts(transport)
	}
	return u.detailRepo.ReplaceTransports(tripID, transports)
}

func (u *TripUsecase) GetLodgings(tripID uint) ([]*model.TripLodging, error) {
	return u.detailRepo.FindLodgings(tripID)
}

func (u *TripUsecase) UpdateLodgings(tripID uint, lodgings []*model.TripLodging) error {
	return u.detailRepo.ReplaceLodgings(tripID, lodgings)
}

func (u *TripUsecase) GetBudget(tripID uint) ([]*model.TripBudgetItem, int64, int64, int64, error) {
	transportTotal, err := u.sumTransportCosts(tripID)
	if err != nil {
		return nil, 0, 0, 0, err
	}
	lodgingTotal, err := u.sumLodgingCosts(tripID)
	if err != nil {
		return nil, 0, 0, 0, err
	}
	items, err := u.detailRepo.FindBudgetItems(tripID)
	if err != nil {
		return nil, 0, 0, 0, err
	}
	var manualTotal int64
	for _, item := range items {
		manualTotal += item.CostYen
	}
	total := transportTotal + lodgingTotal + manualTotal
	return items, transportTotal, lodgingTotal, total, nil
}

func (u *TripUsecase) UpdateBudget(tripID uint, items []*model.TripBudgetItem) error {
	return u.detailRepo.ReplaceBudgetItems(tripID, items)
}

func (u *TripUsecase) sumTransportCosts(tripID uint) (int64, error) {
	transports, err := u.detailRepo.FindTransports(tripID)
	if err != nil {
		return 0, err
	}
	var total int64
	for _, transport := range transports {
		switch transport.Mode {
		case "car":
			total += transport.GasolineCostYen + transport.HighwayCostYen
		case "rental":
			total += transport.GasolineCostYen + transport.RentalFeeYen
		default:
			total += transport.FareYen
		}
	}
	return total, nil
}

func (u *TripUsecase) sumLodgingCosts(tripID uint) (int64, error) {
	lodgings, err := u.detailRepo.FindLodgings(tripID)
	if err != nil {
		return 0, err
	}
	var total int64
	for _, lodging := range lodgings {
		total += lodging.CostYen
	}
	return total, nil
}

func (u *TripUsecase) applyTransportCosts(transport *model.TripTransport) {
	if transport.Mode == "car" || transport.Mode == "rental" {
		if transport.GasolinePriceYenPerL > 0 && transport.DistanceKm > 0 && transport.FuelEfficiencyKmPerL > 0 {
			transport.GasolineCostYen = int64((transport.DistanceKm / transport.FuelEfficiencyKmPerL) * transport.GasolinePriceYenPerL)
		}
	}
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
