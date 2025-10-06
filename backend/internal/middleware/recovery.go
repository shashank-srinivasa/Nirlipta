package middleware

import (
	"log"
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
)

// RecoveryMiddleware recovers from panics and logs the error
func RecoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Log the panic with stack trace
				log.Printf("PANIC RECOVERED: %v\n%s", err, debug.Stack())

				// Return 500 error to client
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Internal server error",
				})

				// Abort the request
				c.Abort()
			}
		}()

		c.Next()
	}
}
