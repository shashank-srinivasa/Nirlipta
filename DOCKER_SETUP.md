# 🐳 Docker Setup Guide

This guide will help you run the Yoga Studio App using Docker containers.

## 📋 Prerequisites

- Docker installed ([Download Docker](https://www.docker.com/products/docker-desktop))
- Docker Compose installed (comes with Docker Desktop)

## 🚀 Quick Start

### 1. Set Environment Variables

Create a `.env` file in the root directory with your configuration:

```bash
# Copy the backend .env as a template
cp backend/.env .env
```

Make sure your `.env` file contains:

```env
# Database
DATABASE_URL=postgresql://postgres.aqiexhcuignvfcwsjewa:7M7vUsfrvddD9wna@aws-1-ap-south-1.pooler.supabase.com:6543/postgres

# JWT Secret
JWT_SECRET=yoga-studio-super-secret-jwt-key-change-in-production-12345

# OAuth - Google
GOOGLE_CLIENT_ID=84200537919-q6p8313tn5qdila060ncotuo4q7ed36p.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# OAuth - Facebook (optional)
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

### 2. Build and Run

```bash
# Build and start all containers
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

### 3. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

### 4. Stop the Application

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (including uploads)
docker-compose down -v
```

## 📦 What's Included

### Services

1. **Backend** (Go API)
   - Port: 8080
   - Built with multi-stage Docker build
   - Connects to Supabase PostgreSQL
   - Handles OAuth authentication
   - Serves uploaded images

2. **Frontend** (React + Vite)
   - Port: 80
   - Built with Nginx for production
   - Optimized static assets
   - React Router support

### Volumes

- `./backend/uploads` - Persisted user-uploaded images (avatars)

## 🔧 Development vs Production

### Development (Current Setup)
```bash
# Run locally without Docker
cd backend && go run cmd/api/main.go
cd frontend && npm run dev
```

### Production (Docker)
```bash
# Run with Docker
docker-compose up -d
```

## 📝 Useful Commands

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild specific service
docker-compose up -d --build backend

# Stop all containers
docker-compose stop

# Remove all containers and networks
docker-compose down

# Remove everything including volumes
docker-compose down -v

# Execute command in running container
docker-compose exec backend sh
docker-compose exec frontend sh
```

## 🐛 Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Stop existing processes
lsof -ti:8080 | xargs kill -9  # Backend
lsof -ti:80 | xargs kill -9    # Frontend

# Or change ports in docker-compose.yml
ports:
  - "3000:80"  # Frontend on port 3000
  - "8081:8080"  # Backend on port 8081
```

### Database Connection Issues

Make sure your `DATABASE_URL` is accessible from Docker containers. Supabase URLs should work fine.

### OAuth Redirect Issues

Update your Google OAuth settings:
- Authorized JavaScript origins: `http://localhost`
- Authorized redirect URIs: `http://localhost:8080/api/v1/auth/google/callback`

### Uploads Not Persisting

Make sure the uploads volume is mounted:
```bash
# Check volumes
docker volume ls

# Inspect volume
docker volume inspect yoga-studio-app_uploads
```

## 🔐 Security Notes

**For Production:**

1. **Change JWT Secret**: Use a strong, random secret
2. **Use HTTPS**: Set up SSL certificates (Let's Encrypt)
3. **Environment Variables**: Use Docker secrets or external secret management
4. **Database**: Use connection pooling and read replicas
5. **Rate Limiting**: Add rate limiting to prevent abuse
6. **CORS**: Update CORS settings for your domain

## 📊 Monitoring

```bash
# Check container health
docker-compose ps

# View resource usage
docker stats

# Check container logs
docker-compose logs --tail=100 -f
```

## 🚢 Deployment

### Deploy to Cloud

1. **Push to Container Registry**:
   ```bash
   docker tag yoga-studio-app_backend your-registry/yoga-backend:latest
   docker tag yoga-studio-app_frontend your-registry/yoga-frontend:latest
   docker push your-registry/yoga-backend:latest
   docker push your-registry/yoga-frontend:latest
   ```

2. **Deploy to Kubernetes, AWS ECS, or Google Cloud Run**

### Environment-Specific Builds

```bash
# Build for specific environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Go Docker Best Practices](https://docs.docker.com/language/golang/)

## ✅ Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to a strong random value
- [ ] Update OAuth redirect URLs
- [ ] Set up HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Set up health checks
- [ ] Test all features in production mode
- [ ] Set up CI/CD pipeline

---

**Need Help?** Check the main [README.md](./README.md) or [QUICKSTART.md](./QUICKSTART.md) for more information.
