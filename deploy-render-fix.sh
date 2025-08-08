#!/bin/bash

# Deploy Render Fix Script
# This script commits and pushes the Render deployment fixes

echo "🔧 Deploying Render.com deployment fixes..."

# Add all changes
echo "📝 Adding changes to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Fix Render deployment: Update Dockerfile, render.yaml, and add .dockerignore

- Fixed Dockerfile with proper user permissions and npm ci
- Updated render.yaml with correct build configuration
- Added .dockerignore to exclude unnecessary files
- Created comprehensive deployment fix guide

This should resolve the 'package.json not found' error on Render."

# Push to main branch
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Changes pushed successfully!"
echo ""
echo "🎯 Next Steps:"
echo "1. Go to Render.com dashboard"
echo "2. Delete existing service (if any)"
echo "3. Create new Web Service with these settings:"
echo "   - Root Directory: backend"
echo "   - Runtime: Node"
echo "   - Build Command: npm ci && npm run build"
echo "   - Start Command: node dist/server.js"
echo "4. Add environment variables from backend/.env.example"
echo ""
echo "📖 See RENDER-DEPLOYMENT-FIX.md for detailed instructions"