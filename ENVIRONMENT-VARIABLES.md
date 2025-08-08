# 🔧 Environment Variables Configuration

## Complete Environment Variables Guide for Render Deployment

This document lists all environment variables needed for your LTOCMS backend deployment on Render.com.

## Required Variables (Critical)

These variables are essential for the application to function:

### Database Configuration

```
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/ltocms?retryWrites=true&w=majority
```

- **Purpose**: MongoDB Atlas connection string
- **Status**: ❌ **NEEDS FIXING** - Currently causing connection errors
- **Action**: Follow [`MONGODB-ATLAS-SETUP.md`](MONGODB-ATLAS-SETUP.md) guide

### JWT Authentication

```
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-here
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

- **Purpose**: JSON Web Token signing and validation
- **Status**: ✅ **CONFIGURED**
- **Security**: Use strong, random strings (32+ characters)

### Application Environment

```
NODE_ENV=production
PORT=10000
```

- **Purpose**: Application environment and port configuration
- **Status**: ✅ **CONFIGURED**
- **Note**: Render automatically sets PORT, but 10000 is standard

### Frontend Integration

```
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

- **Purpose**: CORS configuration and OAuth redirects
- **Status**: ❓ **UPDATE NEEDED** - Set to your actual frontend URL
- **Example**: `https://ltocms-frontend.vercel.app`

## OAuth Configuration

### Google OAuth (Required)

```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

- **Purpose**: Google OAuth authentication
- **Status**: ✅ **CONFIGURED**
- **Source**: Google Cloud Console

### Facebook OAuth (Optional)

```
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

- **Purpose**: Facebook OAuth authentication
- **Status**: ❌ **MISSING** - Currently showing warnings
- **Action**: Follow [`FACEBOOK-OAUTH-SETUP.md`](FACEBOOK-OAUTH-SETUP.md) guide
- **Alternative**: Remove Facebook OAuth from code if not needed

## Security & Session Configuration

### Session Management

```
SESSION_SECRET=your-very-secure-session-secret-here
```

- **Purpose**: Session encryption and signing
- **Status**: ❓ **RECOMMENDED** - Add for production session store
- **Action**: Follow [`PRODUCTION-SESSION-STORE.md`](PRODUCTION-SESSION-STORE.md) guide

### File Upload Configuration

```
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads/
```

- **Purpose**: File upload limits and storage path
- **Status**: ✅ **CONFIGURED**
- **Note**: 5MB max file size

### Rate Limiting

```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

- **Purpose**: API rate limiting configuration
- **Status**: ✅ **CONFIGURED**
- **Note**: 50 requests per 15 minutes

## How to Set Environment Variables in Render

### Step 1: Access Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your **ltocms-backend** service
3. Click **"Environment"** tab

### Step 2: Add/Update Variables

1. Click **"Add Environment Variable"**
2. Enter **Key** and **Value**
3. Click **"Save Changes"**
4. **Redeploy** if needed

### Step 3: Verify Configuration

Check deployment logs for successful variable loading.

## Environment Variables Checklist

Copy this checklist and verify each variable in your Render dashboard:

### ✅ Currently Working

- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `JWT_SECRET=your-jwt-secret`
- [ ] `JWT_REFRESH_SECRET=your-refresh-secret`
- [ ] `JWT_EXPIRE=15m`
- [ ] `JWT_REFRESH_EXPIRE=7d`
- [ ] `GOOGLE_CLIENT_ID=your-google-client-id`
- [ ] `GOOGLE_CLIENT_SECRET=your-google-client-secret`
- [ ] `MAX_FILE_SIZE=5242880`
- [ ] `UPLOAD_PATH=uploads/`
- [ ] `RATE_LIMIT_WINDOW_MS=900000`
- [ ] `RATE_LIMIT_MAX_REQUESTS=50`

### ❌ Needs Attention

- [ ] `MONGODB_URI=your-mongodb-connection-string` (**CRITICAL**)
- [ ] `FRONTEND_URL=https://your-frontend-domain.com` (**UPDATE NEEDED**)

### ❓ Optional/Recommended

- [ ] `SESSION_SECRET=your-session-secret` (for production session store)
- [ ] `FACEBOOK_APP_ID=your-facebook-app-id` (if using Facebook OAuth)
- [ ] `FACEBOOK_APP_SECRET=your-facebook-app-secret` (if using Facebook OAuth)

## Security Best Practices

### Secret Generation

Use strong, random secrets for all sensitive variables:

```bash
# Generate secure secrets (32+ characters)
openssl rand -base64 32
```

### Variable Security

- ❌ **Never commit** secrets to Git repositories
- ✅ **Use environment variables** only
- ✅ **Rotate secrets** regularly
- ✅ **Use different secrets** for development and production

### Access Control

- ✅ **Limit access** to Render dashboard
- ✅ **Use team permissions** if working with others
- ✅ **Monitor** environment variable changes

## Testing Configuration

After setting all variables, test your deployment:

### Health Check

```bash
curl https://ltocms.onrender.com/api/health
```

**Expected Response:**

```json
{
  "status": "OK",
  "message": "LTOCMS Backend Server is running",
  "database": "Connected",
  "timestamp": "2025-01-08T14:00:00.000Z"
}
```

### OAuth Testing

- **Google OAuth**: `https://ltocms.onrender.com/auth/google`
- **Facebook OAuth**: `https://ltocms.onrender.com/auth/facebook` (if configured)

## Common Issues & Solutions

### Issue: MongoDB Connection Failed

**Solution**: Follow [`MONGODB-ATLAS-SETUP.md`](MONGODB-ATLAS-SETUP.md)

### Issue: OAuth Redirect Errors

**Solution**: Verify `FRONTEND_URL` matches your actual frontend domain

### Issue: Session Warnings

**Solution**: Add `SESSION_SECRET` and follow [`PRODUCTION-SESSION-STORE.md`](PRODUCTION-SESSION-STORE.md)

### Issue: Facebook OAuth Warnings

**Solution**: Either configure Facebook OAuth or remove it following [`FACEBOOK-OAUTH-SETUP.md`](FACEBOOK-OAUTH-SETUP.md)

## Priority Order

Fix these in order of importance:

1. **🔴 CRITICAL**: `MONGODB_URI` - Fix database connection
2. **🟡 IMPORTANT**: `FRONTEND_URL` - Update for your frontend
3. **🟢 RECOMMENDED**: `SESSION_SECRET` - Add production session store
4. **🔵 OPTIONAL**: Facebook OAuth variables - If needed

---

**🎯 Once all critical variables are properly configured, your Render deployment will be fully functional and production-ready!**
