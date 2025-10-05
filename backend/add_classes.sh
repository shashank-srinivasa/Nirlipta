#!/bin/bash

# Quick script to add sample yoga classes
# Usage: ./add_classes.sh YOUR_JWT_TOKEN

if [ -z "$1" ]; then
    echo "Usage: ./add_classes.sh YOUR_JWT_TOKEN"
    echo ""
    echo "To get your token:"
    echo "1. Open browser console (F12)"
    echo "2. Run: localStorage.getItem('token')"
    echo "3. Copy the token and run: ./add_classes.sh YOUR_TOKEN"
    exit 1
fi

TOKEN=$1
API_URL="http://localhost:8080/api/v1"

echo "🧘 Adding sample yoga classes..."
echo ""

# Class 1: Morning Vinyasa Flow
echo "1️⃣  Creating Morning Vinyasa Flow..."
curl -s -X POST "$API_URL/admin/classes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning Vinyasa Flow",
    "description": "Start your day with energizing flow sequences that synchronize breath with movement. Perfect for building strength and flexibility.",
    "instructor_name": "Maya Patel",
    "duration": 60,
    "capacity": 15,
    "difficulty_level": "intermediate"
  }' | jq -r '.id' > /tmp/class1_id.txt

echo "✅ Created!"
echo ""

# Class 2: Gentle Hatha Yoga
echo "2️⃣  Creating Gentle Hatha Yoga..."
curl -s -X POST "$API_URL/admin/classes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Gentle Hatha Yoga",
    "description": "Perfect for beginners. Learn foundational poses with focus on alignment and breathing techniques.",
    "instructor_name": "Sophia Lee",
    "duration": 60,
    "capacity": 20,
    "difficulty_level": "beginner"
  }' | jq -r '.id' > /tmp/class2_id.txt

echo "✅ Created!"
echo ""

# Class 3: Power Yoga
echo "3️⃣  Creating Power Yoga..."
curl -s -X POST "$API_URL/admin/classes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Power Yoga",
    "description": "Intense, fitness-based approach to vinyasa-style yoga. Build strength, endurance, and flexibility.",
    "instructor_name": "James Wilson",
    "duration": 90,
    "capacity": 12,
    "difficulty_level": "advanced"
  }' | jq -r '.id' > /tmp/class3_id.txt

echo "✅ Created!"
echo ""

# Class 4: Restorative Yoga
echo "4️⃣  Creating Restorative Yoga & Meditation..."
curl -s -X POST "$API_URL/admin/classes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Restorative Yoga & Meditation",
    "description": "Slow-paced class with longer holds. Perfect for stress relief, deep relaxation, and mindfulness.",
    "instructor_name": "Sophia Lee",
    "duration": 75,
    "capacity": 18,
    "difficulty_level": "beginner"
  }' | jq -r '.id' > /tmp/class4_id.txt

echo "✅ Created!"
echo ""

# Class 5: Ashtanga Primary Series
echo "5️⃣  Creating Ashtanga Primary Series..."
curl -s -X POST "$API_URL/admin/classes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ashtanga Primary Series",
    "description": "Traditional Ashtanga practice following the primary series sequence. Challenging and transformative.",
    "instructor_name": "James Wilson",
    "duration": 90,
    "capacity": 10,
    "difficulty_level": "advanced"
  }' | jq -r '.id' > /tmp/class5_id.txt

echo "✅ Created!"
echo ""

echo "🎉 All classes created successfully!"
echo ""
echo "📋 Listing all classes:"
curl -s "$API_URL/classes" | jq '.'

echo ""
echo "✨ You can now view these classes in your app!"
