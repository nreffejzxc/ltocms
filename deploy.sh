#!/bin/bash

# LTOCMS Production Deployment Script
echo "🚀 Starting LTOCMS Production Deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "🔧 Building backend for production..."
npm run build:prod

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "🔧 Building frontend for production..."
npm run build:prod

echo "🌱 Seeding database with test users..."
cd ../backend
npm run seed:prod

echo "✅ Deployment completed successfully!"
echo ""
echo "🎯 Next steps:"
echo "1. Start the backend server: cd backend && npm run start:prod"
echo "2. Serve the frontend: cd frontend && npm run serve"
echo "3. Access the application at: http://localhost:3000"
echo ""
echo "📋 Test User Accounts:"
echo "Admin: admin@ltocms.com / Admin123!"
echo "Sales: sales@ltocms.com / Sales123!"
echo "Credit: credit@ltocms.com / Credit123!"
echo "Client: client@ltocms.com / Client123!"