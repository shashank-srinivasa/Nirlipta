#!/bin/bash

# Seed sample yoga classes and schedules
# Make sure backend is running first!

API_URL="http://localhost:8080/api/v1"

# You'll need to get an admin token first by:
# 1. Login via Google
# 2. Get your user ID from database
# 3. Update your role to ADMIN in database
# 4. Login again to get admin token

# For now, this script shows the curl commands you can run manually

echo "=== Sample Yoga Classes to Create ==="
echo ""
echo "1. Morning Vinyasa Flow"
curl -X POST "$API_URL/admin/classes" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning Vinyasa Flow",
    "description": "Start your day with energizing flow sequences that synchronize breath with movement.",
    "instructor_name": "Maya Patel",
    "duration": 60,
    "capacity": 15,
    "difficulty_level": "intermediate",
    "image_url": ""
  }'

echo ""
echo "2. Gentle Hatha Yoga"
curl -X POST "$API_URL/admin/classes" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Gentle Hatha Yoga",
    "description": "Perfect for beginners. Learn foundational poses with focus on alignment and breathing.",
    "instructor_name": "Sophia Lee",
    "duration": 60,
    "capacity": 20,
    "difficulty_level": "beginner",
    "image_url": ""
  }'

echo ""
echo "3. Power Yoga"
curl -X POST "$API_URL/admin/classes" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Power Yoga",
    "description": "Intense, fitness-based approach to vinyasa-style yoga. Build strength and flexibility.",
    "instructor_name": "James Wilson",
    "duration": 90,
    "capacity": 12,
    "difficulty_level": "advanced",
    "image_url": ""
  }'

echo ""
echo "4. Restorative Yoga & Meditation"
curl -X POST "$API_URL/admin/classes" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Restorative Yoga & Meditation",
    "description": "Slow-paced class with longer holds. Perfect for stress relief and deep relaxation.",
    "instructor_name": "Sophia Lee",
    "duration": 75,
    "capacity": 18,
    "difficulty_level": "beginner",
    "image_url": ""
  }'

echo ""
echo "5. Ashtanga Primary Series"
curl -X POST "$API_URL/admin/classes" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ashtanga Primary Series",
    "description": "Traditional Ashtanga practice following the primary series sequence.",
    "instructor_name": "James Wilson",
    "duration": 90,
    "capacity": 10,
    "difficulty_level": "advanced",
    "image_url": ""
  }'

echo ""
echo "=== To use this script ==="
echo "1. Login to your app with Google"
echo "2. Check your user ID in the database"
echo "3. Update your role: UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';"
echo "4. Login again to get a new token with admin privileges"
echo "5. Replace YOUR_ADMIN_TOKEN_HERE in this script with your actual token"
echo "6. Run: bash seed_data.sh"
