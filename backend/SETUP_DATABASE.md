# Database Setup Guide

## Option 1: Supabase (Recommended - Free Forever Plan)

### Step 1: Create Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (easiest)

### Step 2: Create Project
1. Click "New Project"
2. Choose your organization
3. Project settings:
   - **Name:** yoga-studio-app
   - **Database Password:** (Generate a strong password - SAVE THIS!)
   - **Region:** Choose closest to you
   - **Plan:** Free (500MB database, plenty for starting)
4. Click "Create new project" (takes 2-3 minutes)

### Step 3: Get Connection String
1. Once project is created, click "Connect"
2. Choose "Connection string" → "URI"
3. Copy the connection string (looks like):
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your actual password

### Step 4: Create .env File
Create `/backend/.env` with:
```env
DATABASE_URL=your-connection-string-here
JWT_SECRET=your-super-secret-jwt-key-change-this
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-secret
PORT=8080
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080
ENV=development
```

---

## Option 2: Neon (Alternative Free PostgreSQL)

### Step 1: Create Account
1. Go to https://neon.tech
2. Sign up with GitHub

### Step 2: Create Project
1. Click "Create Project"
2. Name: yoga-studio-app
3. PostgreSQL version: 15 (latest)
4. Region: Choose closest
5. Plan: Free (0.5GB storage)

### Step 3: Get Connection String
1. On dashboard, find "Connection Details"
2. Copy the connection string
3. Add to `.env` as `DATABASE_URL`

---

## Setup OAuth Providers

### Google OAuth

1. Go to https://console.cloud.google.com
2. Create a new project: "Yoga Studio App"
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: Web application
6. Authorized redirect URIs:
   - `http://localhost:8080/api/v1/auth/google/callback`
   - (Later add production URL)
7. Copy Client ID and Client Secret to `.env`

### Facebook Login

1. Go to https://developers.facebook.com
2. Click "My Apps" → "Create App"
3. Use case: "Consumer"
4. App name: "Yoga Studio App"
5. In Settings → Basic:
   - Copy App ID and App Secret to `.env`
6. Add Product: "Facebook Login"
7. Valid OAuth Redirect URIs:
   - `http://localhost:8080/api/v1/auth/facebook/callback`

---

## Test the Setup

```bash
cd backend
go run cmd/api/main.go
```

You should see:
```
Database connected successfully
Migrations completed successfully
Server starting on port 8080
```

Visit http://localhost:8080/health to verify the API is running!

