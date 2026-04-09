package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/generative-ai-go/genai"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
)

type ButtonEvent struct {
	ButtonName string  `json:"button_name" binding:"required"`
	Timestamp  float64 `json:"timestamp"`
	UserID     *string `json:"user_id,omitempty"`
}

type AIDrawRequest struct {
	Prompt     string  `json:"prompt" binding:"required"`
	CanvasData *string `json:"canvas_data,omitempty"`
	IsBlank    bool    `json:"is_blank"`
}

type AIDrawResponse struct {
	Success   bool    `json:"success"`
	ImageData *string `json:"image_data,omitempty"`
	Error     *string `json:"error,omitempty"`
}

type ButtonStatsManager struct {
	mu     sync.RWMutex
	stats  map[string]int
	events []map[string]interface{}
}

func NewButtonStatsManager() *ButtonStatsManager {
	return &ButtonStatsManager{
		stats:  make(map[string]int),
		events: make([]map[string]interface{}, 0),
	}
}

func (bsm *ButtonStatsManager) RecordEvent(buttonName string, userID *string) {
	bsm.mu.Lock()
	defer bsm.mu.Unlock()

	bsm.stats[buttonName]++

	event := map[string]interface{}{
		"button":    buttonName,
		"timestamp": time.Now().Format(time.RFC3339),
		"user_id":   userID,
	}
	bsm.events = append(bsm.events, event)
}

func (bsm *ButtonStatsManager) GetStats() map[string]int {
	bsm.mu.RLock()
	defer bsm.mu.RUnlock()

	stats := make(map[string]int)
	for k, v := range bsm.stats {
		stats[k] = v
	}
	return stats
}

func (bsm *ButtonStatsManager) GetEvents() []map[string]interface{} {
	bsm.mu.RLock()
	defer bsm.mu.RUnlock()

	events := make([]map[string]interface{}, len(bsm.events))
	copy(events, bsm.events)
	return events
}

func (bsm *ButtonStatsManager) ResetStats() {
	bsm.mu.Lock()
	defer bsm.mu.Unlock()

	bsm.stats = make(map[string]int)
	bsm.events = make([]map[string]interface{}, 0)
}

type AIService struct {
	client *genai.Client
	model  string
}

func NewAIService(apiKey, model string) (*AIService, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, err
	}

	return &AIService{
		client: client,
		model:  model,
	}, nil
}

func (ai *AIService) GenerateImage(prompt string, canvasData *string, isBlank bool) (*AIDrawResponse, error) {
	ctx := context.Background()
	model := ai.client.GenerativeModel(ai.model)

	var promptText string
	if isBlank {
		promptText = fmt.Sprintf("Generate a new image based on this prompt: %s. Return ONLY the generated image.", prompt)
	} else {
		promptText = fmt.Sprintf("Modify this drawing based on this prompt: %s. Return ONLY the modified image.", prompt)
	}

	var parts []genai.Part
	if !isBlank && canvasData != nil {
		// Remove data URI prefix if present
		imageData := *canvasData
		if idx := strings.Index(imageData, ","); idx != -1 {
			imageData = imageData[idx+1:]
		}

		// Decode base64 image data
		imgBytes, err := base64.StdEncoding.DecodeString(imageData)
		if err != nil {
			return &AIDrawResponse{Success: false, Error: &[]string{"Invalid canvas data"}[0]}, nil
		}

		parts = append(parts, genai.ImageData("image/png", imgBytes))
	}

	parts = append(parts, genai.Text(promptText))

	resp, err := model.GenerateContent(ctx, parts...)
	if err != nil {
		errorMsg := err.Error()
		return &AIDrawResponse{Success: false, Error: &errorMsg}, nil
	}

	if resp == nil || len(resp.Candidates) == 0 {
		errorMsg := "No response from AI service"
		return &AIDrawResponse{Success: false, Error: &errorMsg}, nil
	}

	// Extract image data from response
	for _, part := range resp.Candidates[0].Content.Parts {
		if img, ok := part.(genai.Blob); ok {
			encoded := base64.StdEncoding.EncodeToString(img.Data)
			return &AIDrawResponse{Success: true, ImageData: &encoded}, nil
		}
	}

	errorMsg := "No image data in response"
	return &AIDrawResponse{Success: false, Error: &errorMsg}, nil
}

func (ai *AIService) Close() {
	ai.client.Close()
}

func main() {
	// Load environment variables from common locations.
	// Local development runs from backend/go-backend and uses ../.env.
	// Docker builds copy .env into the working directory.
	if err := godotenv.Load(".env"); err != nil {
		if err := godotenv.Load("../.env"); err != nil {
			log.Printf("Warning: Error loading .env file: %v", err)
		}
	}

	// Get configuration
	apiKey := os.Getenv("GEMINI_API_KEY")
	model := os.Getenv("GEMINI_MODEL")
	if model == "" {
		model = "gemini-1.5-flash"
	}
	adminPassword := os.Getenv("ADMIN_PASSWORD")
	if adminPassword == "" {
		adminPassword = "admin123"
	}

	if apiKey == "" {
		log.Fatal("GEMINI_API_KEY is not set in environment variables")
	}

	// Initialize services
	statsManager := NewButtonStatsManager()
	aiService, err := NewAIService(apiKey, model)
	if err != nil {
		log.Fatalf("Failed to initialize AI service: %v", err)
	}
	defer aiService.Close()

	// Initialize Gin router
	r := gin.Default()

	// Add CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Button event tracking
	r.POST("/api/button-event", func(c *gin.Context) {
		var event ButtonEvent
		if err := c.ShouldBindJSON(&event); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		statsManager.RecordEvent(event.ButtonName, event.UserID)
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Event recorded"})
	})

	// Get button statistics
	r.GET("/api/button-stats", func(c *gin.Context) {
		stats := statsManager.GetStats()
		c.JSON(http.StatusOK, gin.H{"stats": stats})
	})

	// Get all button events
	r.GET("/api/button-events", func(c *gin.Context) {
		events := statsManager.GetEvents()
		c.JSON(http.StatusOK, gin.H{"events": events})
	})

	// AI draw endpoint
	r.POST("/api/ai-draw", func(c *gin.Context) {
		var req AIDrawRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if strings.TrimSpace(req.Prompt) == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Prompt cannot be empty"})
			return
		}

		result, err := aiService.GenerateImage(req.Prompt, req.CanvasData, req.IsBlank)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, result)
	})

	// Reset stats endpoint (protected)
	r.POST("/api/reset-stats", func(c *gin.Context) {
		password := c.Query("password")
		if password != adminPassword {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid password"})
			return
		}

		statsManager.ResetStats()
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Statistics reset"})
	})

	// Get port from environment or default to 8000
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	// Validate port
	if _, err := strconv.Atoi(port); err != nil {
		log.Fatalf("Invalid port: %s", port)
	}

	fmt.Printf("🚀 Go Backend Server starting on port %s\n", port)
	fmt.Printf("📊 Health check: http://localhost:%s/health\n", port)
	fmt.Printf("🎨 API docs: http://localhost:%s/api/button-stats\n", port)

	log.Fatal(r.Run(":" + port))
}