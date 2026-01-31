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
	"time"

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
	groupRepo := persistence.NewGroupRepository(db)
	groupMemberRepo := persistence.NewGroupMemberRepository(db)
	albumRepo := persistence.NewAlbumRepository(db)
	photoRepo := persistence.NewPhotoRepository(db)
	postRepo := persistence.NewPostRepository(db)
	tagRepo := persistence.NewTagRepository(db)
	anniversaryRepo := persistence.NewAnniversaryRepository(db)
	tripRepo := persistence.NewTripRepository(db)
	itineraryRepo := persistence.NewTripItineraryRepository(db)
	wishlistRepo := persistence.NewTripWishlistRepository(db)
	expenseRepo := persistence.NewTripExpenseRepository(db)
	tripRelationRepo := persistence.NewTripRelationRepository(db)
	tripDetailRepo := persistence.NewTripDetailRepository(db)

	// Usecases
	userUsecase := usecase.NewUserUsecase(userRepo, firebaseAuth)
	groupUsecase := usecase.NewGroupUsecase(groupRepo, groupMemberRepo)
	sessionTTL := 7 * 24 * time.Hour
	authUsecase := usecase.NewAuthUsecase(firebaseAuth, userRepo, cfg.FirebaseAPIKey, sessionTTL)
	inviteUsecase := usecase.NewInviteUsecase(inviteRepo, userRepo, groupRepo, groupMemberRepo, mailer)
	albumUsecase := usecase.NewAlbumUsecase(albumRepo, photoRepo)
	photoUsecase := usecase.NewPhotoUsecase(photoRepo, albumRepo, s3Service)
	postUsecase := usecase.NewPostUsecase(postRepo, tagRepo, albumRepo, photoRepo)
	anniversaryUsecase := usecase.NewAnniversaryUsecase(anniversaryRepo)
	tripUsecase := usecase.NewTripUsecase(tripRepo, itineraryRepo, wishlistRepo, expenseRepo, tripRelationRepo, tripDetailRepo, albumRepo, postRepo)

	// Handlers
	userHandler := handler.NewUserHandler(userUsecase)
	groupHandler := handler.NewGroupHandler(groupUsecase, userUsecase)
	secureCookie := cfg.AppEnv == "production"
	authHandler := handler.NewAuthHandler(authUsecase, secureCookie, sessionTTL)
	inviteHandler := handler.NewInviteHandler(inviteUsecase, groupUsecase, userUsecase, authUsecase, secureCookie, sessionTTL)
	albumHandler := handler.NewAlbumHandler(albumUsecase)
	photoHandler := handler.NewPhotoHandler(photoUsecase)
	postHandler := handler.NewPostHandler(postUsecase)
	anniversaryHandler := handler.NewAnniversaryHandler(anniversaryUsecase)
	tripHandler := handler.NewTripHandler(tripUsecase)

	// Middleware
	authMiddleware := middleware.NewAuthMiddleware(firebaseAuth, userRepo, groupMemberRepo)

	// Register routes
	http.RegisterRoutes(e, userHandler, groupHandler, authHandler, inviteHandler, albumHandler, photoHandler, postHandler, anniversaryHandler, tripHandler, authMiddleware)
	return e, nil
}
