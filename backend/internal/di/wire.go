package di

import (
	"memoria/internal/adapter/auth"
	"memoria/internal/adapter/email"
	"memoria/internal/adapter/http"
	"memoria/internal/adapter/http/handler"
	"memoria/internal/adapter/http/middleware"
	"memoria/internal/adapter/persistence"
	"memoria/internal/adapter/storage"
	"memoria/internal/config"
	"memoria/internal/usecase"

	"github.com/labstack/echo/v4"
)

func BuildServer(cfg config.Config) (*echo.Echo, error) {
	e := echo.New()

	// Database
	db, err := persistence.NewDB(cfg)
	if err != nil {
		return nil, err
	}

	// Firebase Auth
	firebaseAuth, err := auth.NewFirebaseAuth(
		cfg.FirebaseProjectID,
		cfg.FirebaseClientEmail,
		cfg.FirebasePrivateKey,
	)
	if err != nil {
		return nil, err
	}

	// S3 Service
	s3Service, err := storage.NewS3Service(
		cfg.AWSRegion,
		cfg.S3Bucket,
		cfg.S3Endpoint,
		cfg.S3AccessKey,
		cfg.S3SecretKey,
	)
	if err != nil {
		return nil, err
	}

	// SES Mailer
	mailer, err := email.NewSESMailer(
		cfg.AWSRegion,
		cfg.S3AccessKey,
		cfg.S3SecretKey,
		cfg.SESFromEmail,
		cfg.FrontendBaseURL,
		cfg.SESInviteTemplatePath,
	)
	if err != nil {
		return nil, err
	}

	// Repositories
	userRepo := persistence.NewUserRepository(db)
	inviteRepo := persistence.NewInviteRepository(db)
	albumRepo := persistence.NewAlbumRepository(db)
	photoRepo := persistence.NewPhotoRepository(db)
	postRepo := persistence.NewPostRepository(db)
	tagRepo := persistence.NewTagRepository(db)
	anniversaryRepo := persistence.NewAnniversaryRepository(db)
	tripRepo := persistence.NewTripRepository(db)
	itineraryRepo := persistence.NewTripItineraryRepository(db)
	wishlistRepo := persistence.NewTripWishlistRepository(db)
	expenseRepo := persistence.NewTripExpenseRepository(db)

	// Usecases
	userUsecase := usecase.NewUserUsecase(userRepo, firebaseAuth)
	inviteUsecase := usecase.NewInviteUsecase(inviteRepo, userRepo, mailer, cfg.AdminEmails)
	albumUsecase := usecase.NewAlbumUsecase(albumRepo, photoRepo)
	photoUsecase := usecase.NewPhotoUsecase(photoRepo, s3Service)
	postUsecase := usecase.NewPostUsecase(postRepo, tagRepo)
	anniversaryUsecase := usecase.NewAnniversaryUsecase(anniversaryRepo)
	tripUsecase := usecase.NewTripUsecase(tripRepo, itineraryRepo, wishlistRepo, expenseRepo)

	// Handlers
	userHandler := handler.NewUserHandler(userUsecase)
	inviteHandler := handler.NewInviteHandler(inviteUsecase)
	albumHandler := handler.NewAlbumHandler(albumUsecase)
	photoHandler := handler.NewPhotoHandler(photoUsecase)
	postHandler := handler.NewPostHandler(postUsecase)
	anniversaryHandler := handler.NewAnniversaryHandler(anniversaryUsecase)
	tripHandler := handler.NewTripHandler(tripUsecase)

	// Middleware
	authMiddleware := middleware.NewAuthMiddleware(firebaseAuth, userRepo)

	// Register routes
	http.RegisterRoutes(e, userHandler, inviteHandler, albumHandler, photoHandler, postHandler, anniversaryHandler, tripHandler, authMiddleware)
	return e, nil
}
