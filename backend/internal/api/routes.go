package api

import (
	"yoga-studio-app/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.Engine, db *gorm.DB) {
	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "message": "Yoga Studio API is running"})
	})

	// API v1 group
	v1 := router.Group("/api/v1")
	{
		// Public routes
		public := v1.Group("")
		{
			// Auth routes
			auth := public.Group("/auth")
			{
				authHandler := NewAuthHandler(db)
				auth.GET("/google", authHandler.GoogleLogin)
				auth.GET("/google/callback", authHandler.GoogleCallback)
				auth.GET("/facebook", authHandler.FacebookLogin)
				auth.GET("/facebook/callback", authHandler.FacebookCallback)
				auth.POST("/logout", authHandler.Logout)
			}

			// Classes (public read)
			classes := public.Group("/classes")
			{
				classHandler := NewClassHandler(db)
				classes.GET("", classHandler.GetAll)
				classes.GET("/:id", classHandler.GetByID)
			}

			// Schedules (public read)
			schedules := public.Group("/schedules")
			{
				scheduleHandler := NewScheduleHandler(db)
				schedules.GET("", scheduleHandler.GetAll)
				schedules.GET("/:id", scheduleHandler.GetByID)
			}

			// Content (public read)
			content := public.Group("/content")
			{
				contentHandler := NewContentHandler(db)
				content.GET("/:page", contentHandler.GetByPage)
			}
		}

		// Protected routes (require authentication)
		protected := v1.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			// User routes
			users := protected.Group("/users")
			{
				userHandler := NewUserHandler(db)
				users.GET("/me", userHandler.GetProfile)
				users.PUT("/me", userHandler.UpdateProfile)
			}

			// Enrollments
			enrollments := protected.Group("/enrollments")
			{
				enrollmentHandler := NewEnrollmentHandler(db)
				enrollments.POST("", enrollmentHandler.Create)
				enrollments.GET("/my", enrollmentHandler.GetMyEnrollments)
				enrollments.DELETE("/:id", enrollmentHandler.Cancel)
			}
		}

		// Admin routes (require admin role)
		admin := v1.Group("/admin")
		admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
		{
			// Classes management
			classes := admin.Group("/classes")
			{
				classHandler := NewClassHandler(db)
				classes.POST("", classHandler.Create)
				classes.PUT("/:id", classHandler.Update)
				classes.DELETE("/:id", classHandler.Delete)
			}

			// Schedules management
			schedules := admin.Group("/schedules")
			{
				scheduleHandler := NewScheduleHandler(db)
				schedules.POST("", scheduleHandler.Create)
				schedules.PUT("/:id", scheduleHandler.Update)
				schedules.DELETE("/:id", scheduleHandler.Delete)
			}

			// Content management
			content := admin.Group("/content")
			{
				contentHandler := NewContentHandler(db)
				content.PUT("", contentHandler.Update)
			}

			// User management
			users := admin.Group("/users")
			{
				userHandler := NewUserHandler(db)
				users.GET("", userHandler.GetAll)
				users.PUT("/:id/role", userHandler.UpdateRole)
			}

			// Analytics
			analytics := admin.Group("/analytics")
			{
				analyticsHandler := NewAnalyticsHandler(db)
				analytics.GET("/overview", analyticsHandler.GetOverview)
			}
		}
	}
}

