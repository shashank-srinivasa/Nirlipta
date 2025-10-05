# 🧘 Yoga Studio Management App

A beautiful, modern web application for managing yoga classes, student enrollments, and studio content.

## ✨ Features

### For Clients
- 🏠 Beautiful landing page with studio information
- 📖 About page with instructor profiles
- 📅 Interactive schedule with daily/weekly/monthly views
- 👤 Personal profile with social media authentication (Google, Facebook)
- 📝 Easy class enrollment and management
- 📜 View enrollment history

### For Admins
- ⚙️ Admin dashboard with content management
- ✏️ Edit landing and about page content
- 📆 Create, update, and delete class schedules
- 🔄 Support for recurring schedules (daily, weekly, monthly)
- 👥 View enrolled students and manage classes
- 📊 Basic analytics and reporting

## 🛠 Tech Stack

### Frontend
- **React** with **Vite** - Fast, modern development
- **Tailwind CSS** - Beautiful, responsive styling
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations
- **React Query** - Data fetching and caching
- **Zustand** - State management

### Backend
- **Go (Golang)** - High-performance API server
- **Gin** - Web framework
- **GORM** - ORM for database operations
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **Goth** - OAuth authentication

### Deployment (Free Hosting)
- **Frontend:** Vercel
- **Backend:** Render / Railway
- **Database:** Supabase / Neon

## 📁 Project Structure

```
yoga-studio-app/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   ├── store/         # State management
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   ├── public/            # Static assets
│   └── package.json
│
├── backend/               # Go backend API
│   ├── cmd/               # Application entry points
│   ├── internal/          # Private application code
│   │   ├── api/           # HTTP handlers
│   │   ├── auth/          # Authentication logic
│   │   ├── database/      # Database connection
│   │   ├── models/        # Data models
│   │   └── middleware/    # HTTP middleware
│   ├── config/            # Configuration files
│   ├── migrations/        # Database migrations
│   └── go.mod
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Go** (v1.21 or higher)
- **PostgreSQL** (or Supabase account)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

### Backend Setup

```bash
cd backend
go mod download
go run cmd/api/main.go
```

The backend will run on `http://localhost:8080`

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/yoga_studio

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OAuth - Facebook
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# Server
PORT=8080
FRONTEND_URL=http://localhost:5173
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8080
```

## 📦 Database Setup

The application will automatically create tables on first run. Alternatively, run migrations:

```bash
cd backend
go run cmd/migrate/main.go
```

## 🎨 Design Philosophy

- **Mobile-first:** Responsive design that works beautifully on all devices
- **Accessibility:** WCAG 2.1 compliant with proper ARIA labels
- **Performance:** Optimized images, lazy loading, code splitting
- **UX:** Smooth transitions, loading states, clear feedback

## 🔐 Authentication Flow

1. User clicks "Sign in with Google/Facebook"
2. OAuth provider authentication
3. Backend receives auth token and creates/updates user
4. JWT token issued for subsequent requests
5. Frontend stores JWT in localStorage
6. Protected routes check for valid JWT

## 🗄️ Database Schema

### Users
- Basic profile information
- Role (CLIENT | ADMIN)
- OAuth provider details

### Classes
- Class details (title, description, instructor)
- Duration, capacity, difficulty level

### Schedules
- Class timing
- Recurrence rules (once, daily, weekly, monthly)
- Linked to classes

### Enrollments
- User enrollments in scheduled classes
- Enrollment status and timestamps

### Content
- Editable page content (landing, about)
- Admin-managed sections

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel via GitHub integration or CLI
```

### Backend (Render/Railway)
```bash
cd backend
go build -o yoga-studio-api cmd/api/main.go
# Deploy via platform-specific instructions
```

## 📝 Future Enhancements

- 💳 Payment integration (Stripe/PayPal)
- 📧 Email notifications for class reminders
- 📱 Mobile app (React Native)
- 🎥 Virtual class streaming integration
- 📊 Advanced analytics dashboard
- 🌍 Multi-language support
- ⭐ Client reviews and ratings

## 🤝 Contributing

Contributions are welcome! Please follow standard Git workflow:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for your yoga studio!

## 👨‍💻 Author

Built with ❤️ for yoga enthusiasts and studio owners

---

**Questions or issues?** Open an issue on GitHub or reach out!

