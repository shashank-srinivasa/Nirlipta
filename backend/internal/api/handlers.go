package api

import (
	"fmt"
	"net/http"
	"os"

	"yoga-studio-app/internal/auth"
	"yoga-studio-app/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/markbates/goth/gothic"
	"gorm.io/gorm"
)

// ============ Auth Handler ============
type AuthHandler struct {
	db *gorm.DB
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{db: db}
}

func (h *AuthHandler) GoogleLogin(c *gin.Context) {
	q := c.Request.URL.Query()
	q.Add("provider", "google")
	c.Request.URL.RawQuery = q.Encode()
	
	gothic.BeginAuthHandler(c.Writer, c.Request)
}

func (h *AuthHandler) GoogleCallback(c *gin.Context) {
	q := c.Request.URL.Query()
	q.Add("provider", "google")
	c.Request.URL.RawQuery = q.Encode()
	
	gothUser, err := gothic.CompleteUserAuth(c.Writer, c.Request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to authenticate with Google"})
		return
	}
	
	h.handleOAuthCallback(c, gothUser.Email, gothUser.Name, gothUser.AvatarURL, "google", gothUser.UserID)
}

func (h *AuthHandler) FacebookLogin(c *gin.Context) {
	q := c.Request.URL.Query()
	q.Add("provider", "facebook")
	c.Request.URL.RawQuery = q.Encode()
	
	gothic.BeginAuthHandler(c.Writer, c.Request)
}

func (h *AuthHandler) FacebookCallback(c *gin.Context) {
	q := c.Request.URL.Query()
	q.Add("provider", "facebook")
	c.Request.URL.RawQuery = q.Encode()
	
	gothUser, err := gothic.CompleteUserAuth(c.Writer, c.Request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to authenticate with Facebook"})
		return
	}
	
	h.handleOAuthCallback(c, gothUser.Email, gothUser.Name, gothUser.AvatarURL, "facebook", gothUser.UserID)
}

func (h *AuthHandler) handleOAuthCallback(c *gin.Context, email, name, avatarURL, provider, providerID string) {
	var user models.User
	
	// Check if user exists
	result := h.db.Where("email = ? AND auth_provider = ?", email, provider).First(&user)
	
	if result.Error == gorm.ErrRecordNotFound {
		// Create new user
		user = models.User{
			Email:          email,
			Name:           name,
			AvatarURL:      avatarURL,
			Role:           models.RoleClient,
			AuthProvider:   provider,
			AuthProviderID: providerID,
		}
		
		if err := h.db.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
	} else if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	
	// Generate JWT token
	token, err := auth.GenerateToken(user.ID, user.Email, string(user.Role))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}
	
	// Redirect to frontend with token
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}
	
	c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/auth/callback?token=%s", frontendURL, token))
}

func (h *AuthHandler) Logout(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Logged out successfully"})
}

// ============ Class Handler ============
type ClassHandler struct {
	db *gorm.DB
}

func NewClassHandler(db *gorm.DB) *ClassHandler {
	return &ClassHandler{db: db}
}

func (h *ClassHandler) GetAll(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Get all classes", "data": []string{}})
}

func (h *ClassHandler) GetByID(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Get class by ID"})
}

func (h *ClassHandler) Create(c *gin.Context) {
	c.JSON(201, gin.H{"message": "Class created"})
}

func (h *ClassHandler) Update(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Class updated"})
}

func (h *ClassHandler) Delete(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Class deleted"})
}

// ============ Schedule Handler ============
type ScheduleHandler struct {
	db *gorm.DB
}

func NewScheduleHandler(db *gorm.DB) *ScheduleHandler {
	return &ScheduleHandler{db: db}
}

func (h *ScheduleHandler) GetAll(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Get all schedules", "data": []string{}})
}

func (h *ScheduleHandler) GetByID(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Get schedule by ID"})
}

func (h *ScheduleHandler) Create(c *gin.Context) {
	c.JSON(201, gin.H{"message": "Schedule created"})
}

func (h *ScheduleHandler) Update(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Schedule updated"})
}

func (h *ScheduleHandler) Delete(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Schedule deleted"})
}

// ============ Enrollment Handler ============
type EnrollmentHandler struct {
	db *gorm.DB
}

func NewEnrollmentHandler(db *gorm.DB) *EnrollmentHandler {
	return &EnrollmentHandler{db: db}
}

func (h *EnrollmentHandler) Create(c *gin.Context) {
	c.JSON(201, gin.H{"message": "Enrollment created"})
}

func (h *EnrollmentHandler) GetMyEnrollments(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Get my enrollments", "data": []string{}})
}

func (h *EnrollmentHandler) Cancel(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Enrollment cancelled"})
}

// ============ User Handler ============
type UserHandler struct {
	db *gorm.DB
}

func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{db: db}
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	userID := c.GetString("user_id")
	
	var user models.User
	if err := h.db.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	
	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID := c.GetString("user_id")
	
	var input struct {
		Name string `json:"name"`
	}
	
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := h.db.Model(&models.User{}).Where("id = ?", userID).Update("name", input.Name).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}

func (h *UserHandler) GetAll(c *gin.Context) {
	var users []models.User
	if err := h.db.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}
	
	c.JSON(http.StatusOK, users)
}

func (h *UserHandler) UpdateRole(c *gin.Context) {
	userID := c.Param("id")
	
	var input struct {
		Role string `json:"role"`
	}
	
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := h.db.Model(&models.User{}).Where("id = ?", userID).Update("role", input.Role).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update role"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "User role updated successfully"})
}

// ============ Content Handler ============
type ContentHandler struct {
	db *gorm.DB
}

func NewContentHandler(db *gorm.DB) *ContentHandler {
	return &ContentHandler{db: db}
}

func (h *ContentHandler) GetByPage(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Get content by page", "data": []string{}})
}

func (h *ContentHandler) Update(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Content updated"})
}

// ============ Analytics Handler ============
type AnalyticsHandler struct {
	db *gorm.DB
}

func NewAnalyticsHandler(db *gorm.DB) *AnalyticsHandler {
	return &AnalyticsHandler{db: db}
}

func (h *AnalyticsHandler) GetOverview(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Analytics overview",
		"data": gin.H{
			"total_students":   0,
			"active_classes":   0,
			"total_enrollments": 0,
			"instructors":      0,
		},
	})
}

