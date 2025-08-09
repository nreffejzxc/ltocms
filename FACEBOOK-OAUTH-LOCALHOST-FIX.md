# 🔧 Fix Facebook OAuth Login on Localhost

## Current Issue

Users can't login using Facebook OAuth on localhost development environment. This is a common issue with Facebook OAuth configuration.

## Root Causes

1. **Facebook App Configuration**: Facebook app not configured for localhost URLs
2. **Callback URL Issues**: Hardcoded callback URLs not working for localhost
3. **HTTPS Requirements**: Facebook OAuth has specific requirements for localhost
4. **App Domain Restrictions**: Facebook app domain settings blocking localhost

## ✅ Fixes Applied

I've already fixed the callback URL configuration in [`backend/src/config/passport.ts`](backend/src/config/passport.ts):

```typescript
// Before (BROKEN for localhost)
callbackURL: "/api/auth/facebook/callback",

// After (FIXED for localhost)
callbackURL: process.env.NODE_ENV === 'production'
  ? "/api/auth/facebook/callback"
  : "http://localhost:5000/api/auth/facebook/callback",
```

## 🔧 Facebook App Configuration Steps

### Step 1: Access Facebook Developer Console

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"**
3. Select your LTOCMS app (App ID: `798034545888164`)

### Step 2: Configure Valid OAuth Redirect URIs

1. Go to **"Facebook Login"** → **"Settings"**
2. In **"Valid OAuth Redirect URIs"**, add these URLs:

```
http://localhost:5000/api/auth/facebook/callback
http://localhost:3000/auth/callback
http://localhost:5173/auth/callback
https://ltocms.onrender.com/api/auth/facebook/callback
https://ltocms.vercel.app/auth/callback
```

3. Click **"Save Changes"**

### Step 3: Configure App Domains

1. Go to **"Settings"** → **"Basic"**
2. In **"App Domains"**, add:

```
localhost
ltocms.onrender.com
ltocms.vercel.app
```

3. Click **"Save Changes"**

### Step 4: Configure Site URL

1. In **"Settings"** → **"Basic"**
2. Scroll to **"Website"** section
3. Add **Site URL**:

```
http://localhost:5000
```

4. Click **"Save Changes"**

### Step 5: Enable Development Mode (Important!)

1. In your Facebook app dashboard
2. Toggle **"App Mode"** to **"Development"**
3. This allows localhost URLs to work

**Note**: For production, you'll need to switch to "Live" mode and submit for review.

## 🔧 Local Environment Setup

### Step 1: Update Your Local .env File

Create or update `backend/.env` with:

```env
# Facebook OAuth for Development
FACEBOOK_APP_ID=798034545888164
FACEBOOK_APP_SECRET=961de59f54b3731d8037d507852b45bb

# Other required variables
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=your-local-mongodb-uri
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
GOOGLE_CLIENT_ID=207387161497-0hk84j935855sjh7r8l2mjdvrndvd0h6.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Step 2: Update Google OAuth for Localhost

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **"APIs & Services"** → **"Credentials"**
4. Edit your OAuth 2.0 Client ID
5. Add to **"Authorized redirect URIs"**:

```
http://localhost:5000/api/auth/google/callback
```

## 🧪 Testing the Fix

### Step 1: Start Your Backend

```bash
cd backend
npm run dev
```

### Step 2: Test Facebook OAuth

1. **Direct URL Test**: Visit `http://localhost:5000/api/auth/facebook`
2. **Should redirect** to Facebook login page
3. **After login**, should redirect back to your frontend
4. **Check console logs** for any errors

### Step 3: Test Google OAuth

1. **Direct URL Test**: Visit `http://localhost:5000/api/auth/google`
2. **Should redirect** to Google login page
3. **After login**, should redirect back to your frontend

## 🚨 Common Issues & Solutions

### Issue 1: "URL Blocked: This redirect failed"

**Cause**: Facebook app not configured for localhost
**Solution**: Follow Step 2 above to add localhost URLs

### Issue 2: "App Not Setup: This app is still in development mode"

**Cause**: Facebook app in development mode with restricted access
**Solution**:

- Add your Facebook account as a test user
- Or switch app to "Live" mode (requires review)

### Issue 3: "Invalid OAuth access token"

**Cause**: Token generation or validation issues
**Solution**: Check JWT configuration and ensure MongoDB is connected

### Issue 4: CORS Errors

**Cause**: Frontend and backend CORS mismatch
**Solution**: Ensure `FRONTEND_URL` matches your frontend development server

## 🔧 Frontend Integration

Update your frontend OAuth buttons to use localhost URLs:

```typescript
// Facebook OAuth Button
const handleFacebookLogin = () => {
  const backendUrl =
    process.env.NODE_ENV === "production"
      ? "https://ltocms.onrender.com"
      : "http://localhost:5000";

  window.location.href = `${backendUrl}/api/auth/facebook`;
};

// Google OAuth Button
const handleGoogleLogin = () => {
  const backendUrl =
    process.env.NODE_ENV === "production"
      ? "https://ltocms.onrender.com"
      : "http://localhost:5000";

  window.location.href = `${backendUrl}/api/auth/google`;
};
```

## 🔒 Security Considerations

### For Development:

- ✅ Use localhost URLs in Facebook app settings
- ✅ Keep app in "Development" mode
- ✅ Use test users for testing

### For Production:

- ✅ Remove localhost URLs from production app
- ✅ Switch to "Live" mode
- ✅ Submit for Facebook review if needed
- ✅ Use HTTPS URLs only

## 📋 Verification Checklist

After applying all fixes:

- [ ] Facebook app configured with localhost URLs
- [ ] Google OAuth configured with localhost URLs
- [ ] Local `.env` file has correct credentials
- [ ] Backend starts without OAuth errors
- [ ] `http://localhost:5000/api/auth/facebook` redirects to Facebook
- [ ] `http://localhost:5000/api/auth/google` redirects to Google
- [ ] OAuth callbacks redirect back to frontend
- [ ] User authentication works end-to-end

## 🎯 Expected Flow

1. **User clicks "Login with Facebook"** on frontend
2. **Redirects to**: `http://localhost:5000/api/auth/facebook`
3. **Facebook redirects to**: Facebook login page
4. **After login, Facebook redirects to**: `http://localhost:5000/api/auth/facebook/callback`
5. **Backend processes OAuth** and generates JWT tokens
6. **Backend redirects to**: `http://localhost:5173/auth/callback?token=...&refreshToken=...`
7. **Frontend receives tokens** and completes authentication

---

**🎉 After following these steps, Facebook OAuth should work perfectly on localhost!**

**Need help?** Check the browser console and backend logs for specific error messages.
