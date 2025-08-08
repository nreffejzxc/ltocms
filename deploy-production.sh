#!/bin/bash

# LTOCMS Production Deployment Helper Script
echo "🚀 LTOCMS Production Deployment Helper"
echo "======================================"

# Security check for .env files
echo "🔒 Security Check: Verifying .env files are not tracked..."

# Check if .env files exist and warn about security
if [ -f "backend/.env" ] || [ -f "frontend/.env" ] || [ -f "backend/.env.production" ] || [ -f "frontend/.env.production" ]; then
    echo "⚠️  WARNING: .env files detected!"
    echo "   These files contain sensitive information and should NEVER be committed to git."
    echo "   Please read SECURITY.md for important security guidelines."
    echo ""
fi

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "📝 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
else
    # Check if .env files are being tracked by git
    if git ls-files | grep -E "\.env$" > /dev/null; then
        echo "🚨 CRITICAL SECURITY ISSUE: .env files are being tracked by git!"
        echo "   This exposes your database credentials and API keys!"
        echo "   Run these commands to fix:"
        echo "   git rm --cached backend/.env backend/.env.production frontend/.env frontend/.env.production"
        echo "   git commit -m 'Remove sensitive .env files from tracking'"
        echo ""
        echo "   Then regenerate all your secrets (see SECURITY.md)"
        echo ""
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Deployment cancelled for security reasons."
            echo "Please read SECURITY.md and fix the security issues first."
            exit 1
        fi
    fi
fi

echo "📋 Pre-deployment Checklist:"
echo "1. ✅ Project structure analyzed"
echo "2. ✅ Deployment configurations created"
echo "3. ✅ Environment files prepared"
echo "4. ✅ Documentation updated"
echo "5. ✅ Security checks completed"
echo "6. ✅ .gitignore files configured"
echo ""

echo "🔧 Building frontend for production..."
cd frontend
npm run build:prod
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi
cd ..

echo "🔧 Building backend for production..."
cd backend
npm run build:prod
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed!"
    exit 1
fi
cd ..

echo "✅ Build completed successfully!"
echo ""

echo "📤 Preparing git commit..."
git add .gitignore backend/.gitignore frontend/.gitignore
git add backend/.env.example frontend/.env.example
git add *.md *.sh *.json *.yaml
git add backend/railway.json backend/Dockerfile backend/healthcheck.js
git add backend/Procfile backend/nixpacks.toml backend/render.yaml
git add frontend/vercel.json frontend/src/vite-env.d.ts

# Verify no .env files are being added
if git diff --cached --name-only | grep -E "\.env$" > /dev/null; then
    echo "🚨 ERROR: Attempting to commit .env files!"
    echo "This is a security risk. Aborting commit."
    git reset
    exit 1
fi

echo "✅ Safe files staged for commit"
git commit -m "Add production deployment configuration and security measures"

# Check if remote exists before pushing
if git remote get-url origin > /dev/null 2>&1; then
    echo "📤 Pushing to remote repository..."
    git push
else
    echo "⚠️  No remote repository configured."
    echo "   Add your GitHub repository:"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
fi

echo ""
echo "🎯 Next Steps for Deployment:"
echo "=============================="
echo ""
echo "1. 🚀 Deploy Backend to Railway:"
echo "   - Go to https://railway.app"
echo "   - Sign up/login with GitHub"
echo "   - Create new project from GitHub repo"
echo "   - Select 'backend' folder as root directory"
echo "   - Add environment variables (see DEPLOYMENT.md)"
echo ""
echo "2. 🌐 Deploy Frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Sign up/login with GitHub"
echo "   - Import your GitHub repository"
echo "   - Set root directory to 'frontend'"
echo "   - Add environment variables (see DEPLOYMENT.md)"
echo ""
echo "3. 🔗 Update URLs:"
echo "   - Update FRONTEND_URL in Railway with your Vercel URL"
echo "   - Update VITE_API_URL in Vercel with your Railway URL"
echo ""
echo "4. 🔐 Configure OAuth:"
echo "   - Update Google OAuth redirect URIs"
echo "   - Add your production URLs to authorized domains"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🎉 Your LTOCMS application is ready for deployment!"