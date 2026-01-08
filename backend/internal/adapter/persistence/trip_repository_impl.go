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

type tripRelationRepositoryImpl struct {
	db *gorm.DB
}

func NewTripRelationRepository(db *gorm.DB) repository.TripRelationRepository {
	return &tripRelationRepositoryImpl{db: db}
}

func (r *tripRelationRepositoryImpl) AddAlbums(tripID uint, albumIDs []uint) error {
	if len(albumIDs) == 0 {
		return nil
	}

	relations := make([]model.TripAlbum, 0, len(albumIDs))
	for _, albumID := range albumIDs {
		relations = append(relations, model.TripAlbum{
			TripID:  tripID,
			AlbumID: albumID,
		})
	}

	return r.db.Create(&relations).Error
}

func (r *tripRelationRepositoryImpl) AddPosts(tripID uint, postIDs []uint) error {
	if len(postIDs) == 0 {
		return nil
	}

	relations := make([]model.TripPost, 0, len(postIDs))
	for _, postID := range postIDs {
		relations = append(relations, model.TripPost{
			TripID: tripID,
			PostID: postID,
		})
	}

	return r.db.Create(&relations).Error
}

func (r *tripRelationRepositoryImpl) FindAlbumsByTripID(tripID uint) ([]*model.Album, error) {
	var albums []*model.Album
	if err := r.db.
		Table("trip_albums").
		Select("albums.*").
		Joins("JOIN albums ON albums.id = trip_albums.album_id").
		Where("trip_albums.trip_id = ?", tripID).
		Order("albums.created_at DESC").
		Find(&albums).Error; err != nil {
		return nil, err
	}
	return albums, nil
}

func (r *tripRelationRepositoryImpl) FindPostsByTripID(tripID uint) ([]*model.Post, error) {
	var posts []*model.Post
	if err := r.db.
		Table("trip_posts").
		Select("posts.*").
		Joins("JOIN posts ON posts.id = trip_posts.post_id").
		Where("trip_posts.trip_id = ?", tripID).
		Order("posts.published_at DESC").
		Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

type tripDetailRepositoryImpl struct {
	db *gorm.DB
}

func NewTripDetailRepository(db *gorm.DB) repository.TripDetailRepository {
	return &tripDetailRepositoryImpl{db: db}
}

func (r *tripDetailRepositoryImpl) ReplaceScheduleItems(tripID uint, items []*model.TripScheduleItem) error {
	if err := r.db.Where("trip_id = ?", tripID).Delete(&model.TripScheduleItem{}).Error; err != nil {
		return err
	}
	if len(items) == 0 {
		return nil
	}
	return r.db.Create(&items).Error
}

func (r *tripDetailRepositoryImpl) FindScheduleItems(tripID uint) ([]*model.TripScheduleItem, error) {
	var items []*model.TripScheduleItem
	if err := r.db.Where("trip_id = ?", tripID).Order("date ASC, time ASC").Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *tripDetailRepositoryImpl) ReplaceTransports(tripID uint, transports []*model.TripTransport) error {
	if err := r.db.Where("trip_id = ?", tripID).Delete(&model.TripTransport{}).Error; err != nil {
		return err
	}
	if len(transports) == 0 {
		return nil
	}
	return r.db.Create(&transports).Error
}

func (r *tripDetailRepositoryImpl) FindTransports(tripID uint) ([]*model.TripTransport, error) {
	var transports []*model.TripTransport
	if err := r.db.Where("trip_id = ?", tripID).Order("date ASC, id ASC").Find(&transports).Error; err != nil {
		return nil, err
	}
	return transports, nil
}

func (r *tripDetailRepositoryImpl) ReplaceLodgings(tripID uint, lodgings []*model.TripLodging) error {
	if err := r.db.Where("trip_id = ?", tripID).Delete(&model.TripLodging{}).Error; err != nil {
		return err
	}
	if len(lodgings) == 0 {
		return nil
	}
	return r.db.Create(&lodgings).Error
}

func (r *tripDetailRepositoryImpl) FindLodgings(tripID uint) ([]*model.TripLodging, error) {
	var lodgings []*model.TripLodging
	if err := r.db.Where("trip_id = ?", tripID).Order("date ASC, id ASC").Find(&lodgings).Error; err != nil {
		return nil, err
	}
	return lodgings, nil
}

func (r *tripDetailRepositoryImpl) ReplaceBudgetItems(tripID uint, items []*model.TripBudgetItem) error {
	if err := r.db.Where("trip_id = ?", tripID).Delete(&model.TripBudgetItem{}).Error; err != nil {
		return err
	}
	if len(items) == 0 {
		return nil
	}
	return r.db.Create(&items).Error
}

func (r *tripDetailRepositoryImpl) FindBudgetItems(tripID uint) ([]*model.TripBudgetItem, error) {
	var items []*model.TripBudgetItem
	if err := r.db.Where("trip_id = ?", tripID).Order("id ASC").Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}
