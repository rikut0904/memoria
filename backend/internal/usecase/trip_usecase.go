package usecase

import (
	"math"
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
	albumRepo         repository.AlbumRepository
	postRepo          repository.PostRepository
}

func NewTripUsecase(
	tripRepo repository.TripRepository,
	itineraryRepo repository.TripItineraryRepository,
	wishlistRepo repository.TripWishlistRepository,
	expenseRepo repository.TripExpenseRepository,
	relationRepo repository.TripRelationRepository,
	detailRepo repository.TripDetailRepository,
	albumRepo repository.AlbumRepository,
	postRepo repository.PostRepository,
) *TripUsecase {
	return &TripUsecase{
		tripRepo:      tripRepo,
		itineraryRepo: itineraryRepo,
		wishlistRepo:  wishlistRepo,
		expenseRepo:   expenseRepo,
		relationRepo:  relationRepo,
		detailRepo:    detailRepo,
		albumRepo:     albumRepo,
		postRepo:      postRepo,
	}
}

// Trip operations
func (u *TripUsecase) CreateTrip(title string, startAt, endAt time.Time, note string, createdBy uint, notifyAt *time.Time, albumIDs, postIDs []uint, groupID uint) (*model.Trip, error) {
	for _, albumID := range albumIDs {
		if _, err := u.albumRepo.FindByID(albumID, groupID); err != nil {
			return nil, err
		}
	}
	for _, postID := range postIDs {
		if _, err := u.postRepo.FindByID(postID, groupID); err != nil {
			return nil, err
		}
	}

	trip := &model.Trip{
		GroupID:   groupID,
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

func (u *TripUsecase) GetTrip(id uint, groupID uint) (*model.Trip, error) {
	return u.tripRepo.FindByID(id, groupID)
}

func (u *TripUsecase) GetTripRelations(tripID uint, groupID uint) ([]*model.Album, []*model.Post, error) {
	if _, err := u.tripRepo.FindByID(tripID, groupID); err != nil {
		return nil, nil, err
	}
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

func (u *TripUsecase) GetSchedule(tripID uint, groupID uint) ([]*model.TripScheduleItem, error) {
	if _, err := u.tripRepo.FindByID(tripID, groupID); err != nil {
		return nil, err
	}
	return u.detailRepo.FindScheduleItems(tripID)
}

func (u *TripUsecase) UpdateSchedule(tripID uint, items []*model.TripScheduleItem, groupID uint) error {
	if _, err := u.tripRepo.FindByID(tripID, groupID); err != nil {
		return err
	}
	return u.detailRepo.ReplaceScheduleItems(tripID, items)
}

func (u *TripUsecase) GetTransports(tripID uint, groupID uint) ([]*model.TripTransport, error) {
	if _, err := u.tripRepo.FindByID(tripID, groupID); err != nil {
		return nil, err
	}
	return u.detailRepo.FindTransports(tripID)
}

func (u *TripUsecase) UpdateTransports(tripID uint, transports []*model.TripTransport, groupID uint) error {
	if _, err := u.tripRepo.FindByID(tripID, groupID); err != nil {
		return err
	}
	for _, transport := range transports {
		u.applyTransportCosts(transport)
	}
	return u.detailRepo.ReplaceTransports(tripID, transports)
}

func (u *TripUsecase) GetLodgings(tripID uint, groupID uint) ([]*model.TripLodging, error) {
	if _, err := u.tripRepo.FindByID(tripID, groupID); err != nil {
		return nil, err
	}
	return u.detailRepo.FindLodgings(tripID)
}

func (u *TripUsecase) UpdateLodgings(tripID uint, lodgings []*model.TripLodging, groupID uint) error {
	if _, err := u.tripRepo.FindByID(tripID, groupID); err != nil {
		return err
	}
	return u.detailRepo.ReplaceLodgings(tripID, lodgings)
}

func (u *TripUsecase) GetBudget(tripID uint, groupID uint) ([]*model.TripBudgetItem, int64, int64, int64, error) {
	if _, err := u.tripRepo.FindByID(tripID, groupID); err != nil {
		return nil, 0, 0, 0, err
	}
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

func (u *TripUsecase) UpdateBudget(tripID uint, items []*model.TripBudgetItem, groupID uint) error {
	if _, err := u.tripRepo.FindByID(tripID, groupID); err != nil {
		return err
	}
	return u.detailRepo.ReplaceBudgetItems(tripID, items)
}

func (u *TripUsecase) sumTransportCosts(tripID uint) (int64, error) {
	return u.detailRepo.SumTransportCosts(tripID)
}

func (u *TripUsecase) sumLodgingCosts(tripID uint) (int64, error) {
	return u.detailRepo.SumLodgingCosts(tripID)
}

func (u *TripUsecase) applyTransportCosts(transport *model.TripTransport) {
	if transport.Mode == "car" || transport.Mode == "rental" {
		if transport.GasolinePriceYenPerL > 0 && transport.DistanceKm > 0 && transport.FuelEfficiencyKmPerL > 0 {
			cost := (transport.DistanceKm / transport.FuelEfficiencyKmPerL) * transport.GasolinePriceYenPerL
			transport.GasolineCostYen = int64(math.Round(cost))
		}
	}
}

func (u *TripUsecase) GetAllTrips(groupID uint) ([]*model.Trip, error) {
	return u.tripRepo.FindAll(groupID)
}

func (u *TripUsecase) UpdateTrip(id uint, title string, startAt, endAt time.Time, note string, notifyAt *time.Time, groupID uint) (*model.Trip, error) {
	trip, err := u.tripRepo.FindByID(id, groupID)
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

func (u *TripUsecase) DeleteTrip(id uint, groupID uint) error {
	if _, err := u.tripRepo.FindByID(id, groupID); err != nil {
		return err
	}
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
