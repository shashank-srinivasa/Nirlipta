#!/bin/bash

echo "🐳 Starting Yoga Studio App with Docker..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from backend/.env..."
    cp backend/.env .env
    echo "✅ Created .env file"
    echo ""
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down
echo ""

# Build and start containers
echo "🏗️  Building and starting containers..."
docker-compose up --build -d
echo ""

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 5
echo ""

# Check if containers are running
echo "📊 Container Status:"
docker-compose ps
echo ""

# Show logs
echo "📝 Recent logs:"
docker-compose logs --tail=20
echo ""

echo "✅ Application is running!"
echo ""
echo "🌐 Access the app:"
echo "   Frontend: http://localhost"
echo "   Backend:  http://localhost:8080"
echo "   Health:   http://localhost:8080/health"
echo ""
echo "📝 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop the app:"
echo "   docker-compose down"
echo ""
