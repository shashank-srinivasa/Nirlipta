# 🚀 Quick Start Guide - Yoga Studio App

## ✅ What's Been Built

Your yoga studio management app now has:

### **Frontend (React + Vite)**
- ✨ Beautiful UI with Tailwind CSS
- 🏠 Landing, About, Schedule, Profile, Admin pages
- 🔐 Google/Facebook OAuth login
- 👤 User authentication with JWT
- 📱 Fully responsive design

### **Backend (Go + Gin)**
- 🔑 JWT authentication system
- 🌐 OAuth integration (Google & Facebook)
- 📊 PostgreSQL database with GORM
- 🛡️ Protected API endpoints
- 👥 User management
- 🎨 Role-based access control (Admin/Client)

---

## 📝 Setup Instructions

### **Step 1: Set Up Database** (5 minutes)

Choose **Supabase** (recommended) or Neon:

#### Supabase:
1. Go to https://supabase.com
2. Create account (sign in with GitHub)
3. Create new project: `yoga-studio-app`
4. Save the database password!
5. Get connection string from "Connect" button

#### Your connection string looks like:
```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

---

### **Step 2: Set Up OAuth** (10 minutes)

#### Google OAuth:
1. Go to https://console.cloud.google.com
2. Create project: "Yoga Studio App"
3. Enable "Google+ API"
4. Credentials → OAuth 2.0 Client ID
5. Authorized redirect: `http://localhost:8080/api/v1/auth/google/callback`
6. Copy Client ID & Secret

#### Facebook (Optional):
1. Go to https://developers.facebook.com
2. Create app: "Yoga Studio App"
3. Add "Facebook Login"
4. Redirect URI: `http://localhost:8080/api/v1/auth/facebook/callback`
5. Copy App ID & Secret

---

### **Step 3: Configure Environment Variables**

Create `/backend/.env`:
```env
DATABASE_URL=your-supabase-connection-string
JWT_SECRET=your-super-secret-change-this-in-production
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
FACEBOOK_CLIENT_ID=your-facebook-app-id (optional)
FACEBOOK_CLIENT_SECRET=your-facebook-secret (optional)
PORT=8080
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080
ENV=development
```

Frontend `.env` is already created with correct values!

---

### **Step 4: Run the Backend** (Terminal 1)

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

✅ Test: Visit http://localhost:8080/health

---

### **Step 5: Run the Frontend** (Terminal 2)

Frontend is already running! If not:
```bash
cd frontend
npm run dev
```

Visit http://localhost:5173

---

## 🎮 How to Use

### **For Users:**
1. Click "Sign In" in navbar
2. Login with Google (or Facebook)
3. Get redirected to your profile
4. Browse classes in Schedule
5. Enroll in classes (coming soon!)

### **For Admins:**
1. Login as user first
2. Go to database and change your role:
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
   ```
3. Access Admin Dashboard from user menu
4. Manage classes, schedules, and content

---

## 🔐 Authentication Flow

1. User clicks "Sign In" → Redirected to Google/Facebook
2. User authorizes → OAuth callback received
3. Backend creates/finds user in database
4. JWT token generated and sent to frontend
5. Frontend stores token and user data
6. Token sent with all API requests (Authorization: Bearer TOKEN)

---

## 📡 API Endpoints

### Public:
- `GET /health` - Health check
- `GET /api/v1/auth/google` - Start Google login
- `GET /api/v1/auth/google/callback` - Google callback
- `GET /api/v1/classes` - List all classes
- `GET /api/v1/schedules` - List all schedules

### Protected (requires login):
- `GET /api/v1/users/me` - Get profile
- `PUT /api/v1/users/me` - Update profile
- `POST /api/v1/enrollments` - Enroll in class
- `GET /api/v1/enrollments/my` - My enrollments

### Admin Only:
- `POST /api/v1/admin/classes` - Create class
- `POST /api/v1/admin/schedules` - Create schedule
- `PUT /api/v1/admin/content` - Update content
- `GET /api/v1/admin/users` - List users
- `GET /api/v1/admin/analytics/overview` - Analytics

---

## 🐛 Troubleshooting

### Backend won't start:
- Check `DATABASE_URL` in `.env`
- Verify database is accessible
- Check Go version: `go version` (need 1.21+)

### Frontend shows errors:
- Clear browser localStorage
- Check console for errors
- Verify backend is running

### OAuth not working:
- Verify redirect URLs match exactly
- Check CLIENT_ID and SECRET are correct
- Make sure OAuth is configured in Google/Facebook console

---

## 📂 Project Structure

```
yoga-studio-app/
├── backend/
│   ├── cmd/api/main.go          # Entry point
│   ├── internal/
│   │   ├── api/                 # HTTP handlers
│   │   ├── auth/                # JWT & OAuth
│   │   ├── database/            # DB connection
│   │   ├── middleware/          # Auth middleware
│   │   └── models/              # Data models
│   └── .env                     # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, Footer
│   │   ├── pages/               # All pages
│   │   ├── services/            # API calls
│   │   └── store/               # Auth state
│   └── .env                     # API URL
│
└── README.md                    # Main documentation
```

---

## 🎯 Next Steps

Now that auth is working, you can:

1. **Add Real Classes** - Create yoga classes in admin panel
2. **Implement Enrollment** - Let users book classes
3. **Add Calendar View** - Beautiful schedule UI
4. **Content Management** - Edit landing/about pages
5. **Deploy** - Make it live on the internet!

---

## 🆘 Need Help?

- Check `backend/SETUP_DATABASE.md` for detailed database setup
- Review code in `internal/auth/` for OAuth implementation
- Frontend API calls are in `src/services/api.js`
- All routes defined in `backend/internal/api/routes.go`

---

**Happy coding! 🧘‍♀️✨**

