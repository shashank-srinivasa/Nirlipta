package api

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"yoga-studio-app/internal/auth"
	"yoga-studio-app/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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
		fmt.Printf("Google OAuth error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to authenticate with Google", "details": err.Error()})
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
	var classes []models.Class

	if h.db == nil {
		log.Println("ERROR: Database connection is nil in GetAll")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection error"})
		return
	}

	query := h.db.Where("is_active = ?", true)

	// Optional filters
	if difficulty := c.Query("difficulty"); difficulty != "" {
		query = query.Where("difficulty_level = ?", difficulty)
	}

	if err := query.Order("created_at DESC").Find(&classes).Error; err != nil {
		log.Printf("ERROR: Failed to fetch classes: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch classes"})
		return
	}

	// Return empty array instead of null
	if classes == nil {
		classes = []models.Class{}
	}

	c.JSON(http.StatusOK, classes)
}

func (h *ClassHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	// Validate UUID
	if _, err := uuid.Parse(id); err != nil {
		log.Printf("ERROR: Invalid UUID format for class ID: %s", id)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid class ID format"})
		return
	}

	var class models.Class
	if err := h.db.First(&class, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Printf("WARN: Class not found with ID: %s", id)
			c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		} else {
			log.Printf("ERROR: Database error fetching class: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch class"})
		}
		return
	}

	c.JSON(http.StatusOK, class)
}

func (h *ClassHandler) Create(c *gin.Context) {
	var input models.Class

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("ERROR: Invalid JSON for class creation: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// Validate required fields
	if input.Title == "" || input.InstructorName == "" {
		log.Println("ERROR: Missing required fields for class creation")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Title and instructor name are required"})
		return
	}

	// Set default values
	input.IsActive = true

	if err := h.db.Create(&input).Error; err != nil {
		log.Printf("ERROR: Failed to create class: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create class"})
		return
	}

	log.Printf("INFO: Class created successfully: %s (ID: %s)", input.Title, input.ID)
	c.JSON(http.StatusCreated, input)
}

func (h *ClassHandler) Update(c *gin.Context) {
	id := c.Param("id")

	// Validate UUID
	if _, err := uuid.Parse(id); err != nil {
		log.Printf("ERROR: Invalid UUID format for class update: %s", id)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid class ID format"})
		return
	}

	var class models.Class
	if err := h.db.First(&class, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Printf("WARN: Class not found for update: %s", id)
			c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		} else {
			log.Printf("ERROR: Database error in class update: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch class"})
		}
		return
	}

	var input models.Class
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("ERROR: Invalid JSON for class update: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	if err := h.db.Model(&class).Updates(input).Error; err != nil {
		log.Printf("ERROR: Failed to update class: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update class"})
		return
	}

	log.Printf("INFO: Class updated successfully: %s", id)
	c.JSON(http.StatusOK, class)
}

func (h *ClassHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	// Validate UUID
	if _, err := uuid.Parse(id); err != nil {
		log.Printf("ERROR: Invalid UUID format for class delete: %s", id)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid class ID format"})
		return
	}

	// Soft delete by setting is_active to false
	result := h.db.Model(&models.Class{}).Where("id = ?", id).Update("is_active", false)
	if result.Error != nil {
		log.Printf("ERROR: Failed to delete class: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete class"})
		return
	}

	if result.RowsAffected == 0 {
		log.Printf("WARN: Class not found for deletion: %s", id)
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}

	log.Printf("INFO: Class deleted successfully: %s", id)
	c.JSON(http.StatusOK, gin.H{"message": "Class deleted successfully"})
}

// ============ Schedule Handler ============
type ScheduleHandler struct {
	db *gorm.DB
}

func NewScheduleHandler(db *gorm.DB) *ScheduleHandler {
	return &ScheduleHandler{db: db}
}

func (h *ScheduleHandler) GetAll(c *gin.Context) {
	var schedules []models.Schedule

	if h.db == nil {
		log.Println("ERROR: Database connection is nil in Schedule GetAll")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection error"})
		return
	}

	// Preload Class with condition to only load active classes
	query := h.db.Preload("Class", "is_active = ?", true).Preload("Enrollments")

	// Filter by date range if provided
	if startDate := c.Query("start_date"); startDate != "" {
		query = query.Where("start_time >= ?", startDate)
	}
	if endDate := c.Query("end_date"); endDate != "" {
		query = query.Where("start_time <= ?", endDate)
	}

	// Filter by class if provided
	if classID := c.Query("class_id"); classID != "" {
		// Validate UUID
		if _, err := uuid.Parse(classID); err != nil {
			log.Printf("ERROR: Invalid UUID format for class_id filter: %s", classID)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid class ID format"})
			return
		}
		query = query.Where("class_id = ?", classID)
	}

	if err := query.Order("start_time ASC").Find(&schedules).Error; err != nil {
		log.Printf("ERROR: Failed to fetch schedules: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch schedules"})
		return
	}

	// Filter out schedules with deleted/inactive classes
	activeSchedules := []models.Schedule{}
	for _, schedule := range schedules {
		// Check if Class was loaded (ID is not nil)
		if schedule.Class.ID != uuid.Nil && schedule.Class.IsActive {
			activeSchedules = append(activeSchedules, schedule)
		} else {
			log.Printf("WARN: Skipping schedule %s - associated class is inactive or not found", schedule.ID)
		}
	}

	c.JSON(http.StatusOK, activeSchedules)
}

func (h *ScheduleHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	var schedule models.Schedule
	if err := h.db.Preload("Class").Preload("Enrollments").First(&schedule, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
		return
	}

	c.JSON(http.StatusOK, schedule)
}

func (h *ScheduleHandler) Create(c *gin.Context) {
	userID := c.GetString("user_id")

	if userID == "" {
		log.Println("ERROR: user_id not found in context for schedule creation")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input models.Schedule
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("ERROR: Invalid JSON for schedule creation: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// Validate class exists
	var class models.Class
	if err := h.db.First(&class, "id = ?", input.ClassID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Printf("WARN: Class not found for schedule: %s", input.ClassID)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Class not found"})
		} else {
			log.Printf("ERROR: Database error checking class: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to validate class"})
		}
		return
	}

	// Set created_by to current admin user
	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		log.Printf("ERROR: Invalid user_id format: %s", userID)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}
	input.CreatedBy = parsedUserID

	if err := h.db.Create(&input).Error; err != nil {
		log.Printf("ERROR: Failed to create schedule: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create schedule"})
		return
	}

	// Load the class information
	h.db.Preload("Class").First(&input, input.ID)

	log.Printf("INFO: Schedule created successfully for class: %s", input.ClassID)
	c.JSON(http.StatusCreated, input)
}

func (h *ScheduleHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var schedule models.Schedule
	if err := h.db.First(&schedule, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
		return
	}

	var input models.Schedule
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Model(&schedule).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update schedule"})
		return
	}

	c.JSON(http.StatusOK, schedule)
}

func (h *ScheduleHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	if err := h.db.Delete(&models.Schedule{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete schedule"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Schedule deleted successfully"})
}

// ============ Enrollment Handler ============
type EnrollmentHandler struct {
	db *gorm.DB
}

func NewEnrollmentHandler(db *gorm.DB) *EnrollmentHandler {
	return &EnrollmentHandler{db: db}
}

func (h *EnrollmentHandler) Create(c *gin.Context) {
	userID := c.GetString("user_id")

	if userID == "" {
		log.Println("ERROR: user_id not found in context for enrollment")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input struct {
		ScheduleID string `json:"schedule_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("ERROR: Invalid JSON for enrollment: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// Validate schedule ID format
	if _, err := uuid.Parse(input.ScheduleID); err != nil {
		log.Printf("ERROR: Invalid schedule ID format: %s", input.ScheduleID)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid schedule ID format"})
		return
	}

	// Check if schedule exists and has capacity
	var schedule models.Schedule
	if err := h.db.Preload("Class").Preload("Enrollments").First(&schedule, "id = ?", input.ScheduleID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Printf("WARN: Schedule not found for enrollment: %s", input.ScheduleID)
			c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
		} else {
			log.Printf("ERROR: Database error fetching schedule: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch schedule"})
		}
		return
	}

	// Check if Class is loaded
	if schedule.Class.ID == uuid.Nil {
		log.Printf("ERROR: Class not loaded for schedule: %s", input.ScheduleID)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Schedule configuration error"})
		return
	}

	// Check capacity
	if len(schedule.Enrollments) >= schedule.Class.Capacity {
		log.Printf("WARN: Class full for schedule: %s", input.ScheduleID)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Class is full"})
		return
	}

	// Check if already enrolled
	var existing models.Enrollment
	result := h.db.Where("user_id = ? AND schedule_id = ?", userID, input.ScheduleID).First(&existing)
	if result.Error == nil {
		log.Printf("WARN: User already enrolled: user=%s, schedule=%s", userID, input.ScheduleID)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Already enrolled in this class"})
		return
	}

	// Parse user ID
	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		log.Printf("ERROR: Invalid user_id format: %s", userID)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	parsedScheduleID, err := uuid.Parse(input.ScheduleID)
	if err != nil {
		log.Printf("ERROR: Invalid schedule_id format: %s", input.ScheduleID)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid schedule ID"})
		return
	}

	// Create enrollment
	enrollment := models.Enrollment{
		UserID:        parsedUserID,
		ScheduleID:    parsedScheduleID,
		PaymentStatus: models.PaymentCompleted, // Free for now
	}

	if err := h.db.Create(&enrollment).Error; err != nil {
		log.Printf("ERROR: Failed to create enrollment: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create enrollment"})
		return
	}

	// Load relationships
	if err := h.db.Preload("Schedule.Class").First(&enrollment, enrollment.ID).Error; err != nil {
		log.Printf("WARN: Failed to load enrollment relationships: %v", err)
		// Still return success since enrollment was created
	}

	log.Printf("INFO: Enrollment created: user=%s, schedule=%s", userID, input.ScheduleID)
	c.JSON(http.StatusCreated, enrollment)
}

func (h *EnrollmentHandler) GetMyEnrollments(c *gin.Context) {
	userID := c.GetString("user_id")

	var enrollments []models.Enrollment
	if err := h.db.Preload("Schedule.Class").Where("user_id = ?", userID).Order("created_at DESC").Find(&enrollments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch enrollments"})
		return
	}

	c.JSON(http.StatusOK, enrollments)
}

func (h *EnrollmentHandler) Cancel(c *gin.Context) {
	userID := c.GetString("user_id")
	enrollmentID := c.Param("id")

	if userID == "" {
		log.Println("ERROR: user_id not found in context for enrollment cancellation")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Validate enrollment ID
	if _, err := uuid.Parse(enrollmentID); err != nil {
		log.Printf("ERROR: Invalid enrollment ID format: %s", enrollmentID)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid enrollment ID format"})
		return
	}

	// Verify ownership and load schedule
	var enrollment models.Enrollment
	if err := h.db.Preload("Schedule").Where("id = ? AND user_id = ?", enrollmentID, userID).First(&enrollment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Printf("WARN: Enrollment not found or unauthorized: enrollment=%s, user=%s", enrollmentID, userID)
			c.JSON(http.StatusNotFound, gin.H{"error": "Enrollment not found"})
		} else {
			log.Printf("ERROR: Database error fetching enrollment: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch enrollment"})
		}
		return
	}

	// Check if schedule exists
	if enrollment.Schedule.ID == uuid.Nil {
		log.Printf("ERROR: Schedule not loaded for enrollment: %s", enrollmentID)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Enrollment configuration error"})
		return
	}

	// Check if cancellation is within 1 hour of class start
	now := time.Now()
	classStartTime := enrollment.Schedule.StartTime
	timeUntilClass := classStartTime.Sub(now)

	if timeUntilClass < time.Hour && timeUntilClass > 0 {
		log.Printf("WARN: Cancellation denied - within 1 hour of class: enrollment=%s, time_until_class=%v", enrollmentID, timeUntilClass)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":               "Cannot cancel within 1 hour of class start time",
			"minutes_until_class": int(timeUntilClass.Minutes()),
		})
		return
	}

	// Allow cancellation if class has already started or passed (for cleanup)
	if timeUntilClass < 0 {
		log.Printf("WARN: Cancelling enrollment for past class: enrollment=%s", enrollmentID)
	}

	if err := h.db.Delete(&enrollment).Error; err != nil {
		log.Printf("ERROR: Failed to cancel enrollment: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel enrollment"})
		return
	}

	log.Printf("INFO: Enrollment cancelled successfully: enrollment=%s, user=%s", enrollmentID, userID)
	c.JSON(http.StatusOK, gin.H{"message": "Enrollment cancelled successfully"})
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

// UploadAvatar - Upload profile picture
func (h *UserHandler) UploadAvatar(c *gin.Context) {
	userID := c.GetString("user_id")

	// Get file from request
	file, err := c.FormFile("profile_picture")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	// Validate file size (max 5MB)
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File too large (max 5MB)"})
		return
	}

	// Validate file type
	contentType := file.Header.Get("Content-Type")
	if contentType != "image/jpeg" && contentType != "image/png" && contentType != "image/webp" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only JPEG, PNG, and WebP images allowed"})
		return
	}

	// Create uploads directory if it doesn't exist
	uploadsDir := "./uploads/avatars"
	os.MkdirAll(uploadsDir, os.ModePerm)

	// Generate unique filename
	ext := ".jpg"
	if contentType == "image/png" {
		ext = ".png"
	} else if contentType == "image/webp" {
		ext = ".webp"
	}
	filename := fmt.Sprintf("%s_%d%s", userID, time.Now().Unix(), ext)
	filepath := fmt.Sprintf("%s/%s", uploadsDir, filename)

	// Save file
	if err := c.SaveUploadedFile(file, filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Update user avatar_url
	avatarURL := fmt.Sprintf("/uploads/avatars/%s", filename)
	if err := h.db.Model(&models.User{}).Where("id = ?", userID).Update("avatar_url", avatarURL).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update avatar"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"avatar_url": avatarURL})
}

// UpdateInstructorBio - Update instructor bio (for instructors)
func (h *UserHandler) UpdateInstructorBio(c *gin.Context) {
	userID := c.GetString("user_id")

	var user models.User
	if err := h.db.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if !user.IsInstructor {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only instructors can update bio"})
		return
	}

	var input struct {
		InstructorBio         string   `json:"instructor_bio"`
		InstructorSpecialties []string `json:"instructor_specialties"`
		YearsExperience       int      `json:"years_experience"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{
		"instructor_bio":         input.InstructorBio,
		"instructor_specialties": input.InstructorSpecialties,
		"years_experience":       input.YearsExperience,
	}

	if err := h.db.Model(&user).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update bio"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// ============ Content Handler ============
type ContentHandler struct {
	db *gorm.DB
}

func NewContentHandler(db *gorm.DB) *ContentHandler {
	return &ContentHandler{db: db}
}

func (h *ContentHandler) GetByPage(c *gin.Context) {
	pageName := c.Param("page")

	var contents []models.Content
	if err := h.db.Where("page_name = ?", pageName).Find(&contents).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch content"})
		return
	}

	// Convert to map for easier frontend use
	contentMap := make(map[string]string)
	for _, content := range contents {
		contentMap[content.SectionKey] = content.Content
	}

	c.JSON(http.StatusOK, contentMap)
}

func (h *ContentHandler) Update(c *gin.Context) {
	userID := c.GetString("user_id")

	var input struct {
		PageName   string `json:"page_name" binding:"required"`
		SectionKey string `json:"section_key" binding:"required"`
		Content    string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if content exists
	var content models.Content
	result := h.db.Where("page_name = ? AND section_key = ?", input.PageName, input.SectionKey).First(&content)

	if result.Error == gorm.ErrRecordNotFound {
		// Create new content
		content = models.Content{
			PageName:   input.PageName,
			SectionKey: input.SectionKey,
			Content:    input.Content,
			UpdatedBy:  uuid.MustParse(userID),
		}
		if err := h.db.Create(&content).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create content"})
			return
		}
	} else {
		// Update existing content
		content.Content = input.Content
		content.UpdatedBy = uuid.MustParse(userID)
		if err := h.db.Save(&content).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update content"})
			return
		}
	}

	c.JSON(http.StatusOK, content)
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
			"total_students":    0,
			"active_classes":    0,
			"total_enrollments": 0,
			"instructors":       0,
		},
	})
}

// ============ Instructor Handler ============
type InstructorHandler struct {
	db *gorm.DB
}

func NewInstructorHandler(db *gorm.DB) *InstructorHandler {
	return &InstructorHandler{db: db}
}

// GetAll - Public endpoint: get active instructors with avatars
func (h *InstructorHandler) GetAll(c *gin.Context) {
	var instructors []models.User

	if err := h.db.Where("is_instructor = ? AND avatar_url != ''", true).
		Order("instructor_order ASC, name ASC").
		Find(&instructors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch instructors"})
		return
	}

	c.JSON(http.StatusOK, instructors)
}

// GetAllAdmin - Admin endpoint: get all instructors
func (h *InstructorHandler) GetAllAdmin(c *gin.Context) {
	var instructors []models.User

	if err := h.db.Where("is_instructor = ?", true).
		Order("instructor_order ASC, name ASC").
		Find(&instructors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch instructors"})
		return
	}

	c.JSON(http.StatusOK, instructors)
}

// Update - Update instructor profile
func (h *InstructorHandler) Update(c *gin.Context) {
	id := c.Param("id")
	userID := c.GetString("user_id")

	var instructor models.User
	if err := h.db.First(&instructor, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Instructor not found"})
		return
	}

	// Check if user is admin or updating their own profile
	var currentUser models.User
	h.db.First(&currentUser, "id = ?", userID)
	if !currentUser.IsAdmin() && instructor.ID.String() != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized"})
		return
	}

	var input struct {
		InstructorBio         string   `json:"instructor_bio"`
		InstructorSpecialties []string `json:"instructor_specialties"`
		YearsExperience       int      `json:"years_experience"`
		IsFeatured            bool     `json:"is_featured"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{
		"instructor_bio":         input.InstructorBio,
		"instructor_specialties": input.InstructorSpecialties,
		"years_experience":       input.YearsExperience,
	}

	// Only admin can set featured
	if currentUser.IsAdmin() {
		updates["is_featured"] = input.IsFeatured
	}

	if err := h.db.Model(&instructor).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update instructor"})
		return
	}

	c.JSON(http.StatusOK, instructor)
}

// UpdateOrder - Reorder instructors
func (h *InstructorHandler) UpdateOrder(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		Order int `json:"order" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Model(&models.User{}).Where("id = ?", id).Update("instructor_order", input.Order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order updated"})
}

// PromoteToInstructor - Promote a user to instructor
func (h *InstructorHandler) PromoteToInstructor(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := h.db.First(&user, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if err := h.db.Model(&user).Update("is_instructor", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to promote user"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// RemoveInstructor - Remove instructor status
func (h *InstructorHandler) RemoveInstructor(c *gin.Context) {
	id := c.Param("id")

	if err := h.db.Model(&models.User{}).Where("id = ?", id).Update("is_instructor", false).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove instructor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Instructor removed"})
}
