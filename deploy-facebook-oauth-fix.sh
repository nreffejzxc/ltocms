#!/bin/bash

# Deploy Facebook OAuth Localhost Fix Script
# This script commits and pushes the Facebook OAuth fixes for localhost development

echo "🔧 Deploying Facebook OAuth localhost fixes..."

# Add all changes
echo "📝 Adding changes to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Fix Facebook OAuth login issues on localhost

- Fixed callback URLs to use full localhost URLs in development
- Updated both Google and Facebook OAuth strategies for environment-specific URLs
- Created comprehensive localhost OAuth configuration guide
- Added proper URL handling for development vs production environments

This resolves Facebook OAuth login failures on localhost development."

# Push to main branch
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Facebook OAuth fixes pushed successfully!"
echo ""
echo "🎯 Next Steps for Localhost Development:"
echo "1. Configure Facebook App with localhost URLs"
echo "2. Update local .env file with Facebook credentials"
echo "3. Configure Google OAuth with localhost callback"
echo "4. Test OAuth flows on localhost"
echo ""
echo "📖 See FACEBOOK-OAUTH-LOCALHOST-FIX.md for detailed instructions"
echo ""
echo "🧪 Test URLs:"
echo "- Facebook OAuth: http://localhost:5000/api/auth/facebook"
echo "- Google OAuth: http://localhost:5000/api/auth/google"