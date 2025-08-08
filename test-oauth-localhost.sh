#!/bin/bash

# Test OAuth Endpoints on Localhost
# This script tests if OAuth endpoints are accessible and configured correctly

echo "🧪 Testing OAuth endpoints on localhost..."
echo ""

# Check if backend is running
echo "📡 Checking if backend is running on localhost:5000..."
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running. Please start with: npm run dev"
    exit 1
fi

echo ""
echo "🔍 Testing OAuth endpoints..."

# Test Google OAuth endpoint
echo "📊 Testing Google OAuth endpoint..."
GOOGLE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/auth/google)
if [ "$GOOGLE_RESPONSE" = "302" ]; then
    echo "✅ Google OAuth endpoint working (redirects to Google)"
else
    echo "❌ Google OAuth endpoint failed (HTTP $GOOGLE_RESPONSE)"
fi

# Test Facebook OAuth endpoint
echo "📘 Testing Facebook OAuth endpoint..."
FACEBOOK_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/auth/facebook)
if [ "$FACEBOOK_RESPONSE" = "302" ]; then
    echo "✅ Facebook OAuth endpoint working (redirects to Facebook)"
else
    echo "❌ Facebook OAuth endpoint failed (HTTP $FACEBOOK_RESPONSE)"
fi

echo ""
echo "🎯 Manual Testing URLs:"
echo "- Google OAuth: http://localhost:5000/api/auth/google"
echo "- Facebook OAuth: http://localhost:5000/api/auth/facebook"
echo "- Health Check: http://localhost:5000/api/health"
echo ""
echo "📖 For detailed configuration, see: FACEBOOK-OAUTH-LOCALHOST-FIX.md"
echo ""

# Check environment variables
echo "🔧 Checking environment variables..."
if [ -f "backend/.env" ]; then
    echo "✅ .env file exists"
    
    if grep -q "FACEBOOK_APP_ID" backend/.env; then
        echo "✅ FACEBOOK_APP_ID is set"
    else
        echo "❌ FACEBOOK_APP_ID is missing from .env"
    fi
    
    if grep -q "FACEBOOK_APP_SECRET" backend/.env; then
        echo "✅ FACEBOOK_APP_SECRET is set"
    else
        echo "❌ FACEBOOK_APP_SECRET is missing from .env"
    fi
    
    if grep -q "GOOGLE_CLIENT_ID" backend/.env; then
        echo "✅ GOOGLE_CLIENT_ID is set"
    else
        echo "❌ GOOGLE_CLIENT_ID is missing from .env"
    fi
else
    echo "❌ .env file not found. Copy from .env.example"
fi

echo ""
echo "🎉 OAuth testing complete!"