#!/bin/bash

echo "🔧 Facebook OAuth Configuration Test"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Checking Environment Variables${NC}"
echo "------------------------------------"

# Check if .env file exists
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} backend/.env file found"
    
    # Check Facebook credentials
    if grep -q "FACEBOOK_APP_ID=798034545888164" backend/.env; then
        echo -e "${GREEN}✓${NC} Facebook App ID is correct (798034545888164)"
    else
        echo -e "${RED}✗${NC} Facebook App ID mismatch or missing"
    fi
    
    if grep -q "FACEBOOK_APP_SECRET=" backend/.env; then
        echo -e "${GREEN}✓${NC} Facebook App Secret is present"
    else
        echo -e "${RED}✗${NC} Facebook App Secret is missing"
    fi
    
    if grep -q "FRONTEND_URL=http://localhost:5173" backend/.env; then
        echo -e "${GREEN}✓${NC} Frontend URL is configured for localhost"
    else
        echo -e "${YELLOW}⚠${NC} Frontend URL might need adjustment"
    fi
else
    echo -e "${RED}✗${NC} backend/.env file not found"
fi

echo ""
echo -e "${BLUE}Step 2: Testing Backend Server${NC}"
echo "------------------------------"

# Check if backend is running
if curl -s http://localhost:5000/api/auth/facebook > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend server is running on port 5000"
    echo -e "${GREEN}✓${NC} Facebook OAuth endpoint is accessible"
else
    echo -e "${RED}✗${NC} Backend server is not running or Facebook OAuth endpoint is not accessible"
    echo -e "${YELLOW}→${NC} Start your backend with: cd backend && npm run dev"
fi

echo ""
echo -e "${BLUE}Step 3: Facebook Developer Console Checklist${NC}"
echo "--------------------------------------------"

echo -e "${YELLOW}Please verify these settings in Facebook Developer Console:${NC}"
echo ""
echo "1. Go to https://developers.facebook.com/"
echo "2. Select your app (ID: 798034545888164)"
echo "3. Facebook Login → Settings → Valid OAuth Redirect URIs:"
echo "   ✓ http://localhost:5000/api/auth/facebook/callback"
echo "   ✓ http://localhost:5173/auth/callback"
echo "   ✓ https://ltocms.onrender.com/api/auth/facebook/callback"
echo ""
echo "4. Settings → Basic → App Domains:"
echo "   ✓ localhost"
echo "   ✓ ltocms.onrender.com"
echo ""
echo "5. Settings → Basic → Website → Site URL:"
echo "   ✓ http://localhost:5000"
echo ""
echo "6. App Mode should be set to 'Development'"

echo ""
echo -e "${BLUE}Step 4: Testing OAuth Flow${NC}"
echo "-------------------------"

echo -e "${YELLOW}Manual Test Steps:${NC}"
echo "1. Start your backend: cd backend && npm run dev"
echo "2. Start your frontend: cd frontend && npm run dev"
echo "3. Visit: http://localhost:5173/login"
echo "4. Click 'Continue with Facebook'"
echo "5. You should be redirected to Facebook login"
echo "6. After login, you should return to your app"

echo ""
echo -e "${BLUE}Step 5: Quick Test Server${NC}"
echo "------------------------"

echo "Run this command to start a test server:"
echo -e "${GREEN}node test-facebook-oauth.js${NC}"
echo "Then visit: http://localhost:3001/test-facebook"

echo ""
echo -e "${BLUE}Common Error Solutions${NC}"
echo "---------------------"

echo -e "${RED}Error: 'URL Blocked: This redirect failed'${NC}"
echo "→ Add localhost URLs to Facebook app Valid OAuth Redirect URIs"
echo ""

echo -e "${RED}Error: 'App Not Setup: This app is still in development mode'${NC}"
echo "→ Add your Facebook account as a test user in Facebook app"
echo "→ Or switch app to Live mode (requires review)"
echo ""

echo -e "${RED}Error: 'Invalid OAuth access token'${NC}"
echo "→ Check JWT configuration in backend"
echo "→ Ensure MongoDB connection is working"
echo ""

echo -e "${RED}Error: CORS issues${NC}"
echo "→ Verify FRONTEND_URL in .env matches your frontend server"
echo ""

echo "🎉 Configuration complete! Test your Facebook OAuth now."