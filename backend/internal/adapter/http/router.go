package http

import (
	"net/http"

	"memoria/internal/adapter/http/handler"
	customMiddleware "memoria/internal/adapter/http/middleware"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func RegisterRoutes(
	e *echo.Echo,
	userHandler *handler.UserHandler,
	groupHandler *handler.GroupHandler,
	authHandler *handler.AuthHandler,
	inviteHandler *handler.InviteHandler,
	albumHandler *handler.AlbumHandler,
	photoHandler *handler.PhotoHandler,
	postHandler *handler.PostHandler,
	anniversaryHandler *handler.AnniversaryHandler,
	tripHandler *handler.TripHandler,
	authMiddleware *customMiddleware.AuthMiddleware,
) {
	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// Health check
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	// API routes
	api := e.Group("/api")

	// Auth
	api.POST("/login", authHandler.Login)
	api.POST("/signup", authHandler.Signup)
	api.POST("/logout", authHandler.Logout)

	// Public invite routes
	api.GET("/invites/:token", inviteHandler.VerifyInvite)
	api.POST("/invites/:token/signup", inviteHandler.SignupInvite)

	// Protected routes
	protected := api.Group("", authMiddleware.RequireAuth)
	protected.GET("/me", userHandler.GetMe)
	protected.PATCH("/me", userHandler.UpdateMe)
	protected.POST("/invites/:token/accept", inviteHandler.AcceptInvite)
	protected.POST("/invites/:token/decline", inviteHandler.DeclineInvite)
	protected.GET("/groups", groupHandler.GetMyGroups)
	protected.POST("/groups", groupHandler.CreateGroup)
	protected.GET("/groups/:id/members", groupHandler.GetGroupMembers)

	// Group-scoped routes (require group membership)
	group := api.Group("", authMiddleware.RequireGroup)

	// Group invites
	group.POST("/invites", inviteHandler.CreateInvite)
	group.GET("/invites", inviteHandler.GetGroupInvites)
	group.DELETE("/invites/:id", inviteHandler.DeleteInvite)

	// Album routes
	group.GET("/albums", albumHandler.GetAllAlbums)
	group.POST("/albums", albumHandler.CreateAlbum)
	group.GET("/albums/:id", albumHandler.GetAlbum)
	group.PATCH("/albums/:id", albumHandler.UpdateAlbum)
	group.DELETE("/albums/:id", albumHandler.DeleteAlbum)

	// Photo routes
	group.GET("/albums/:id/photos", albumHandler.GetAlbumPhotos)
	group.POST("/albums/:id/photos/presign", photoHandler.GeneratePresignedURL)
	group.POST("/albums/:id/photos", photoHandler.CreatePhoto)
	group.DELETE("/photos/:id", photoHandler.DeletePhoto)

	// Post routes
	group.GET("/posts", postHandler.GetAllPosts)
	group.POST("/posts", postHandler.CreatePost)
	group.GET("/posts/:id", postHandler.GetPost)
	group.PATCH("/posts/:id", postHandler.UpdatePost)
	group.DELETE("/posts/:id", postHandler.DeletePost)

	// Post relations
	group.POST("/posts/:id/albums", postHandler.AddAlbum)
	group.DELETE("/posts/:id/albums/:albumId", postHandler.RemoveAlbum)
	group.POST("/posts/:id/photos", postHandler.AddPhoto)
	group.DELETE("/posts/:id/photos/:photoId", postHandler.RemovePhoto)

	// Likes & Comments
	group.POST("/posts/:id/likes", postHandler.AddLike)
	group.DELETE("/posts/:id/likes", postHandler.RemoveLike)
	group.GET("/posts/:id/comments", postHandler.GetComments)
	group.POST("/posts/:id/comments", postHandler.CreateComment)
	group.DELETE("/comments/:id", postHandler.DeleteComment)

	// Tags
	group.GET("/tags", postHandler.GetAllTags)

	// Anniversary routes
	group.GET("/anniversaries", anniversaryHandler.GetAllAnniversaries)
	group.POST("/anniversaries", anniversaryHandler.CreateAnniversary)
	group.PATCH("/anniversaries/:id", anniversaryHandler.UpdateAnniversary)
	group.DELETE("/anniversaries/:id", anniversaryHandler.DeleteAnniversary)

	// Trip routes
	group.GET("/trips", tripHandler.GetAllTrips)
	group.POST("/trips", tripHandler.CreateTrip)
	group.GET("/trips/:id", tripHandler.GetTrip)
	group.PATCH("/trips/:id", tripHandler.UpdateTrip)
	group.DELETE("/trips/:id", tripHandler.DeleteTrip)
	group.GET("/trips/:id/schedule", tripHandler.GetSchedule)
	group.PUT("/trips/:id/schedule", tripHandler.UpdateSchedule)
	group.GET("/trips/:id/transports", tripHandler.GetTransports)
	group.PUT("/trips/:id/transports", tripHandler.UpdateTransports)
	group.GET("/trips/:id/lodgings", tripHandler.GetLodgings)
	group.PUT("/trips/:id/lodgings", tripHandler.UpdateLodgings)
	group.GET("/trips/:id/budget", tripHandler.GetBudget)
	group.PUT("/trips/:id/budget", tripHandler.UpdateBudget)

	// Admin routes
	admin := api.Group("", authMiddleware.RequireAdmin)

	// User management (admin only)
	admin.GET("/users", userHandler.GetAllUsers)
	admin.GET("/users/:id", userHandler.GetUser)
	admin.PATCH("/users/:id/role", userHandler.UpdateUserRole)
	admin.DELETE("/users/:id", userHandler.DeleteUser)
}
