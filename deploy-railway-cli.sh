#!/bin/bash

# Railway CLI Deployment Script for LTOCMS Backend
echo "🚂 Railway CLI Deployment for LTOCMS Backend"
echo "============================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Navigate to backend directory
echo "📁 Navigating to backend directory..."
cd backend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in backend directory!"
    echo "   Make sure you're running this from the project root."
    exit 1
fi

echo "✅ Found package.json in backend directory"

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Initialize Railway project
echo "🚀 Initializing Railway project..."
railway init

# Set environment variables
echo "🔧 Setting environment variables..."
echo "⚠️  You'll need to set these environment variables in Railway dashboard:"
echo ""
echo "NODE_ENV=production"
echo "PORT=5000"
echo "MONGODB_URI=your-actual-mongodb-connection-string"
echo "JWT_SECRET=your-actual-jwt-secret"
echo "JWT_REFRESH_SECRET=your-actual-refresh-secret"
echo "JWT_EXPIRE=15m"
echo "JWT_REFRESH_EXPIRE=7d"
echo "FRONTEND_URL=https://your-frontend-url.vercel.app"
echo "MAX_FILE_SIZE=5242880"
echo "UPLOAD_PATH=uploads/"
echo "RATE_LIMIT_WINDOW_MS=900000"
echo "RATE_LIMIT_MAX_REQUESTS=50"
echo "GOOGLE_CLIENT_ID=your-actual-google-client-id"
echo "GOOGLE_CLIENT_SECRET=your-actual-google-client-secret"
echo ""

read -p "Press Enter after you've set the environment variables in Railway dashboard..."

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🎯 Next steps:"
echo "1. Check Railway dashboard for your service URL"
echo "2. Test the health endpoint: https://your-app.railway.app/api/health"
echo "3. Update FRONTEND_URL in Railway with your Vercel URL"
echo "4. Deploy your frontend to Vercel"
echo ""
echo "📖 If this still fails, use Render.com instead (see DEPLOY-TO-RENDER-GUIDE.md)"