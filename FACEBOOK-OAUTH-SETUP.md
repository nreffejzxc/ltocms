# 📘 Facebook OAuth Configuration Guide

## Current Issue

Your Render deployment shows these warnings:

```
Facebook App ID: ✗ Missing
Facebook App Secret: ✗ Missing
✗ Facebook OAuth strategy not initialized - missing credentials
```

## Options

You have two choices:

### Option A: Add Facebook OAuth (Full Social Login)

### Option B: Remove Facebook OAuth (Simplify Application)

---

## Option A: Add Facebook OAuth

### Step 1: Create Facebook App

1. **Go to [Facebook Developers](https://developers.facebook.com/)**
2. **Click "My Apps"** → **"Create App"**
3. **Select "Consumer"** app type
4. **Fill in app details:**
   - App Name: `LTOCMS`
   - App Contact Email: Your email
   - App Purpose: Business/Other

### Step 2: Configure Facebook Login

1. **In your Facebook app dashboard**, click **"Add Product"**
2. **Find "Facebook Login"** and click **"Set Up"**
3. **Choose "Web"** platform
4. **Add these URLs:**

   **Valid OAuth Redirect URIs:**

   ```
   http://localhost:5000/auth/facebook/callback
   https://ltocms.onrender.com/auth/facebook/callback
   https://your-frontend-domain.com/auth/callback
   ```

   **Valid Deauthorize Callback URL:**

   ```
   https://ltocms.onrender.com/auth/facebook/deauthorize
   ```

### Step 3: Get App Credentials

1. **Go to "Settings" → "Basic"**
2. **Copy your App ID**
3. **Click "Show" next to App Secret** and copy it
4. **Note these values** - you'll need them for environment variables

### Step 4: Configure App Domain

1. **In "Settings" → "Basic"**
2. **Add App Domains:**
   ```
   localhost
   ltocms.onrender.com
   your-frontend-domain.com
   ```

### Step 5: Add Environment Variables to Render

1. **Go to Render Dashboard**
2. **Select your ltocms-backend service**
3. **Go to Environment tab**
4. **Add these variables:**

```
FACEBOOK_APP_ID=your-facebook-app-id-here
FACEBOOK_APP_SECRET=your-facebook-app-secret-here
```

### Step 6: Update Privacy Policy (Required)

Facebook requires a privacy policy URL:

1. **In Facebook app "Settings" → "Basic"**
2. **Add Privacy Policy URL:**
   ```
   https://your-frontend-domain.com/privacy-policy
   ```

### Step 7: Submit for Review (For Production)

For production use, you'll need to submit your app for review:

1. **Complete App Review** in Facebook Developer Console
2. **Provide app screenshots** and usage descriptions
3. **Wait for approval** (usually 1-7 days)

---

## Option B: Remove Facebook OAuth (Recommended for Simplicity)

If you don't need Facebook login, it's easier to remove it entirely.

### Step 1: Update Passport Configuration

Find your passport configuration file (likely `src/config/passport.ts`) and remove Facebook strategy:

```typescript
// Remove or comment out Facebook strategy
/*
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID!,
  clientSecret: process.env.FACEBOOK_APP_SECRET!,
  callbackURL: "/auth/facebook/callback",
  profileFields: ['id', 'emails', 'name']
}, async (accessToken, refreshToken, profile, done) => {
  // Facebook strategy logic
}));
*/
```

### Step 2: Update Routes

Remove Facebook routes from your auth routes file:

```typescript
// Remove or comment out Facebook routes
/*
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
);
*/
```

### Step 3: Update Frontend

Remove Facebook login button from your frontend components:

```tsx
// Remove Facebook OAuth button
/*
<button onClick={() => window.location.href = '/auth/facebook'}>
  Login with Facebook
</button>
*/
```

### Step 4: Update Package Dependencies

Remove Facebook-related packages if not needed:

```bash
npm uninstall passport-facebook @types/passport-facebook
```

---

## Recommended Approach

### For Development/Testing:

**Choose Option B** (Remove Facebook OAuth)

- Simpler setup
- Fewer dependencies
- Google OAuth is sufficient for most use cases

### For Production with Social Login Requirements:

**Choose Option A** (Add Facebook OAuth)

- More login options for users
- Better user acquisition
- Professional appearance

## Testing Facebook OAuth (If Implemented)

1. **Visit**: `https://ltocms.onrender.com/auth/facebook`
2. **Should redirect** to Facebook login
3. **After login**, should redirect back to your frontend
4. **Check logs** for successful authentication

## Environment Variables Summary

If keeping Facebook OAuth, add to Render:

```
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

If removing Facebook OAuth, no additional variables needed.

## Security Considerations

### If Using Facebook OAuth:

- **Keep App Secret secure** - never expose in frontend code
- **Use HTTPS** for all redirect URLs in production
- **Regularly rotate** App Secret
- **Monitor** Facebook app usage and security alerts

### If Removing Facebook OAuth:

- **Clean up unused code** to reduce attack surface
- **Remove unused dependencies** to reduce bundle size
- **Focus security efforts** on Google OAuth implementation

---

**🎯 Choose the option that best fits your project needs. For simplicity, I recommend Option B (removing Facebook OAuth) unless you specifically need multiple social login providers.**
