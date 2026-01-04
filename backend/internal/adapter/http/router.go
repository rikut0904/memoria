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

	// Public invite routes
	api.GET("/invites/:token", inviteHandler.VerifyInvite)
	api.POST("/invites/:token/accept", inviteHandler.AcceptInvite)

	// Protected routes
	protected := api.Group("", authMiddleware.RequireAuth)
	protected.GET("/me", userHandler.GetMe)
	protected.PATCH("/me", userHandler.UpdateMe)

	// Album routes
	protected.GET("/albums", albumHandler.GetAllAlbums)
	protected.POST("/albums", albumHandler.CreateAlbum)
	protected.GET("/albums/:id", albumHandler.GetAlbum)
	protected.PATCH("/albums/:id", albumHandler.UpdateAlbum)
	protected.DELETE("/albums/:id", albumHandler.DeleteAlbum)

	// Photo routes
	protected.GET("/albums/:id/photos", albumHandler.GetAlbumPhotos)
	protected.POST("/albums/:id/photos/presign", photoHandler.GeneratePresignedURL)
	protected.POST("/albums/:id/photos", photoHandler.CreatePhoto)
	protected.DELETE("/photos/:id", photoHandler.DeletePhoto)

	// Post routes
	protected.GET("/posts", postHandler.GetAllPosts)
	protected.POST("/posts", postHandler.CreatePost)
	protected.GET("/posts/:id", postHandler.GetPost)
	protected.PATCH("/posts/:id", postHandler.UpdatePost)
	protected.DELETE("/posts/:id", postHandler.DeletePost)

	// Post relations
	protected.POST("/posts/:id/albums", postHandler.AddAlbum)
	protected.DELETE("/posts/:id/albums/:albumId", postHandler.RemoveAlbum)
	protected.POST("/posts/:id/photos", postHandler.AddPhoto)
	protected.DELETE("/posts/:id/photos/:photoId", postHandler.RemovePhoto)

	// Likes & Comments
	protected.POST("/posts/:id/likes", postHandler.AddLike)
	protected.DELETE("/posts/:id/likes", postHandler.RemoveLike)
	protected.GET("/posts/:id/comments", postHandler.GetComments)
	protected.POST("/posts/:id/comments", postHandler.CreateComment)
	protected.DELETE("/comments/:id", postHandler.DeleteComment)

	// Tags
	protected.GET("/tags", postHandler.GetAllTags)

	// Anniversary routes
	protected.GET("/anniversaries", anniversaryHandler.GetAllAnniversaries)
	protected.POST("/anniversaries", anniversaryHandler.CreateAnniversary)
	protected.PATCH("/anniversaries/:id", anniversaryHandler.UpdateAnniversary)
	protected.DELETE("/anniversaries/:id", anniversaryHandler.DeleteAnniversary)

	// Trip routes
	protected.GET("/trips", tripHandler.GetAllTrips)
	protected.POST("/trips", tripHandler.CreateTrip)
	protected.GET("/trips/:id", tripHandler.GetTrip)
	protected.DELETE("/trips/:id", tripHandler.DeleteTrip)

	// Admin routes
	admin := api.Group("", authMiddleware.RequireAdmin)

	// Invite management (admin only)
	admin.POST("/invites", inviteHandler.CreateInvite)
	admin.GET("/invites", inviteHandler.GetAllInvites)
	admin.DELETE("/invites/:id", inviteHandler.DeleteInvite)

	// User management (admin only)
	admin.GET("/users", userHandler.GetAllUsers)
	admin.GET("/users/:id", userHandler.GetUser)
	admin.PATCH("/users/:id/role", userHandler.UpdateUserRole)
	admin.DELETE("/users/:id", userHandler.DeleteUser)
}
