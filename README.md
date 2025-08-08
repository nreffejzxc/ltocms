# LTOCMS v3 - Lease-to-Own Car Management System

A complete MERN stack application for managing lease-to-own car transactions with role-based access control, JWT authentication, and modern UI.

## 🚀 Features

### User Roles & Permissions

- **Admin**: Full system access, user management, business reports
- **Sales Admin/Associate**: Manage lease agreements, assign vehicles, sales reports
- **Credit Staff/Cashier**: Handle payments, track installments, generate receipts
- **Client/Customer**: View lease status, payment schedules, request early buyouts
- **Developer**: System maintenance and debugging

### Core Functionality

- **Authentication**: JWT-based with refresh tokens, role-based access control
- **Vehicle Management**: CRUD operations, status tracking, image uploads
- **Lease Agreements**: Complete lease lifecycle management
- **Payment Processing**: Multiple payment methods, receipt generation, late fee tracking
- **Dashboard**: Role-specific dashboards with analytics and reports
- **Responsive Design**: Mobile-first approach with TailwindCSS

## 🛠 Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **React Router** for navigation
- **React Query** for data fetching
- **React Hook Form** with Yup validation
- **Axios** for API calls
- **React Hot Toast** for notifications

### Backend

- **Node.js** with Express and TypeScript
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Rate limiting** for API protection

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account or local MongoDB installation
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ltocms-v3
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm run install-deps

# Or install manually
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment Setup

#### Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ltocms?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-complex
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-here-make-it-long-and-complex
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

#### Frontend Environment

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=LTOCMS
```

### 4. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run server  # Backend only
npm run client  # Frontend only
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

## 📁 Project Structure

```
ltocms-v3/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── server.ts        # Express server
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # App entry point
│   ├── package.json
│   └── vite.config.ts
└── package.json             # Root package.json
```

## 🔐 Authentication Flow

1. **Registration/Login**: User provides credentials
2. **Token Generation**: Server returns access token (15min) + refresh token (7d)
3. **API Requests**: Access token sent in Authorization header
4. **Token Refresh**: Automatic refresh when access token expires
5. **Logout**: Tokens removed from client and server

## 🎯 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### Users (Admin only)

- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Vehicles (Sales access)

- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/available` - Get available vehicles
- `POST /api/vehicles` - Create vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Leases (Sales access)

- `GET /api/leases` - Get all leases
- `GET /api/leases/my-leases` - Get user's leases (clients)
- `POST /api/leases` - Create lease
- `PUT /api/leases/:id` - Update lease
- `PATCH /api/leases/:id/approve` - Approve lease

### Payments (Credit access)

- `GET /api/payments` - Get all payments
- `GET /api/payments/my-payments` - Get user's payments (clients)
- `POST /api/payments` - Create payment
- `GET /api/payments/:id/receipt` - Get payment receipt

## 🚀 Deployment

### Quick Deployment

For a quick deployment to free hosting services, run:

```bash
./deploy-production.sh
```

This script will:

- Build both frontend and backend for production
- Commit changes to git
- Provide step-by-step deployment instructions

### Recommended Hosting Services

- **Backend**: [Railway](https://railway.app) (Free tier, easy setup)
- **Frontend**: [Vercel](https://vercel.com) (Free tier, optimized for React)
- **Database**: MongoDB Atlas (already configured)

### Manual Deployment Steps

#### 1. Deploy Backend to Railway

1. Sign up at [railway.app](https://railway.app) with GitHub
2. Create new project from GitHub repository
3. Select `backend` folder as root directory
4. Add environment variables (see `DEPLOYMENT.md`)
5. Railway will automatically build and deploy

#### 2. Deploy Frontend to Vercel

1. Sign up at [vercel.com](https://vercel.com) with GitHub
2. Import your GitHub repository
3. Set root directory to `frontend`
4. Add environment variables (see `DEPLOYMENT.md`)
5. Vercel will automatically build and deploy

#### 3. Update Configuration

1. Update `FRONTEND_URL` in Railway with your Vercel URL
2. Update `VITE_API_URL` in Vercel with your Railway URL
3. Update Google OAuth redirect URIs

### Detailed Instructions

For complete deployment instructions, see [`DEPLOYMENT.md`](./DEPLOYMENT.md)

### Database Setup (MongoDB Atlas)

The database is already configured. If you need to set up a new database:

1. Create MongoDB Atlas account
2. Create new cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for production)
5. Get connection string
6. Update `MONGODB_URI` in environment variables

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### Git Workflow

- Create feature branches from `main`
- Use conventional commit messages
- Submit pull requests for code review
- Squash commits before merging

### Security Best Practices

- Never commit sensitive data
- Use environment variables for configuration
- Implement proper input validation
- Use HTTPS in production
- Regular dependency updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

## 🔄 Version History

- **v3.0.0** - Complete MERN stack rewrite with TypeScript
- **v2.0.0** - Added role-based access control
- **v1.0.0** - Initial release

---

Built with ❤️ using the MERN stack and TypeScript.
