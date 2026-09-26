package persistence

import (
	"fmt"
	"log"

	"memoria/internal/config"
	"memoria/internal/domain/model"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func NewDB(cfg config.Config) (*gorm.DB, error) {
	db, err := ConnectDB(cfg)
	if err != nil {
		return nil, err
	}

	// Auto-migrate all models (can be disabled via AUTO_MIGRATE=false)
	if cfg.AutoMigrate {
		if err := Migrate(db); err != nil {
			return nil, err
		}
	} else {
		log.Println("Auto-migration is disabled")
	}

	return db, nil
}

// ConnectDB opens a database connection without changing the schema.
func ConnectDB(cfg config.Config) (*gorm.DB, error) {
	sslMode := cfg.DBSSLMode
	if sslMode == "" {
		sslMode = "disable"
	}

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=Asia/Tokyo",
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBName,
		sslMode,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	return db, nil
}

// Migrate applies the current model schema to the database.
func Migrate(db *gorm.DB) error {
	log.Println("Running database migration...")

	models := []interface{}{
		&model.User{},
		&model.Group{},
		&model.GroupMember{},
		&model.Invite{},
		&model.Album{},
		&model.Photo{},
		&model.Post{},
		&model.AlbumPost{},
		&model.Tag{},
		&model.PostTag{},
		&model.PostPhoto{},
		&model.PostLike{},
		&model.PostComment{},
		&model.NotificationSetting{},
		&model.Notification{},
		&model.WebPushSubscription{},
		&model.Trip{},
		&model.TripItinerary{},
		&model.TripWishlist{},
		&model.TripExpense{},
		&model.TripAlbum{},
		&model.TripPost{},
		&model.TripScheduleItem{},
		&model.TripTransport{},
		&model.TripLodging{},
		&model.TripBudgetItem{},
	}

	if err := db.AutoMigrate(models...); err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("Database migration completed successfully")
	return nil
}
