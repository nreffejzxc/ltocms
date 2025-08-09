# 🚨 Fix "App not active" Facebook OAuth Error

## The Error

When you try to log in with Facebook, you see:

```
App not active
This app is not accessible right now and the app developer is aware of the issue.
You will be able to log in when the app is reactivated.
```

## Root Causes & Solutions

### 1. Facebook App in Development Mode (Most Common)

**Problem**: Your Facebook app is in Development mode, which restricts access to only approved users.

**Solution**: Add yourself as a test user or app developer.

#### Step 1: Add Yourself as App Developer

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app (ID: `798034545888164`)
3. Go to **"Roles"** → **"Roles"**
4. Click **"Add People"**
5. Enter your Facebook email/username
6. Select role: **"Developer"** or **"Administrator"**
7. Click **"Submit"**

#### Step 2: Add Test Users (Alternative)

1. In your Facebook app dashboard
2. Go to **"Roles"** → **"Test Users"**
3. Click **"Add"** or **"Create Test Users"**
4. Add your Facebook account as a test user

### 2. App Domain Configuration Issues

**Problem**: Your Facebook app domains don't match your localhost setup.

**Solution**: Update App Domains in Facebook Developer Console.

1. Go to **"Settings"** → **"Basic"**
2. In **"App Domains"**, ensure you have:
   ```
   localhost
   ```
3. In **"Website"** section, set **Site URL**:
   ```
   http://localhost:5000
   ```
4. Click **"Save Changes"**

### 3. Invalid OAuth Redirect URIs

**Problem**: Facebook doesn't recognize your callback URLs.

**Solution**: Update Valid OAuth Redirect URIs.

1. Go to **"Facebook Login"** → **"Settings"**
2. In **"Valid OAuth Redirect URIs"**, add:
   ```
   http://localhost:5000/api/auth/facebook/callback
   http://localhost:5173/auth/callback
   ```
3. Click **"Save Changes"**

### 4. App Review Status Issues

**Problem**: Your app requires Facebook review for certain permissions.

**Solution**: Use basic permissions or submit for review.

1. Go to **"App Review"** → **"Permissions and Features"**
2. Check if **"email"** permission is approved
3. If not approved, either:
   - Submit for review (for production)
   - Keep app in Development mode and add test users

### 5. App Status Issues

**Problem**: Your app might be disabled or restricted.

**Solution**: Check app status and compliance.

1. Go to your app dashboard
2. Check for any warnings or notifications
3. Ensure app complies with Facebook policies
4. If restricted, follow Facebook's guidance to resolve

## 🔧 Complete Fix Checklist

### Facebook Developer Console Settings:

#### Basic Settings (`Settings` → `Basic`):

- [ ] **App Domains**: `localhost`
- [ ] **Website Site URL**: `http://localhost:5000`
- [ ] **App Mode**: `Development` (for testing)

#### Facebook Login Settings (`Facebook Login` → `Settings`):

- [ ] **Valid OAuth Redirect URIs**:
  - `http://localhost:5000/api/auth/facebook/callback`
  - `http://localhost:5173/auth/callback`
- [ ] **Client OAuth Login**: `Yes`
- [ ] **Web OAuth Login**: `Yes`

#### Roles & Permissions (`Roles`):

- [ ] Add your Facebook account as **Developer** or **Administrator**
- [ ] OR add your account as a **Test User**

#### App Review (`App Review` → `Permissions and Features`):

- [ ] **email** permission should be available (basic permission)
- [ ] **public_profile** permission should be available (basic permission)

## 🧪 Testing Steps

### Step 1: Verify Your Role

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Check if you can see your app (ID: `798034545888164`)
3. If you can't see it, you're not added as a developer

### Step 2: Test OAuth Flow

1. Start your backend: `cd backend && npm run dev`
2. Visit: `http://localhost:5000/api/auth/facebook`
3. You should see Facebook login (not "App not active")
4. Log in with your Facebook account
5. You should be redirected back to your app

### Step 3: Check for Errors

If you still get "App not active":

1. Double-check you're logged into Facebook with the same account added as developer
2. Try logging out of Facebook and logging back in
3. Clear browser cache and cookies
4. Try in incognito/private browsing mode

## 🚨 Common Mistakes

### Mistake 1: Wrong Facebook Account

- **Problem**: You added a different Facebook account as developer
- **Solution**: Ensure the Facebook account you're testing with is the same one added as developer

### Mistake 2: App ID Mismatch

- **Problem**: Using wrong App ID in configuration
- **Solution**: Verify App ID `798034545888164` matches in:
  - Facebook Developer Console
  - Your `.env` file
  - Your documentation

### Mistake 3: Missing Permissions

- **Problem**: App doesn't have required permissions
- **Solution**: Ensure your app requests only basic permissions (`email`, `public_profile`)

## 🎯 Expected Behavior After Fix

1. **Visit OAuth URL**: `http://localhost:5000/api/auth/facebook`
2. **See Facebook Login**: Normal Facebook login page (not "App not active")
3. **Successful Login**: Redirected back to your app with tokens
4. **User Created**: New user created in your database

## 📞 Still Having Issues?

If you're still seeing "App not active" after following these steps:

1. **Wait 5-10 minutes** after making changes (Facebook needs time to propagate)
2. **Try different browser** or incognito mode
3. **Check Facebook app notifications** for any policy violations
4. **Contact Facebook Support** if the app is unexpectedly restricted

---

**🎉 After following these steps, your Facebook OAuth should work without the "App not active" error!**
