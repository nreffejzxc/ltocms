# 🚀 Deploy LTOCMS to Render.com - Step by Step

Since Railway is having issues with the directory structure, let's use Render.com which is more reliable for this type of deployment.

## 🎯 Why Render.com?

- More reliable directory handling
- Better error messages
- Free tier available
- Easier configuration

## 📋 Step-by-Step Render Deployment

### Step 1: Prepare Your Code

```bash
# Commit and push all changes
./deploy.sh
```

### Step 2: Sign Up for Render

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with your GitHub account
4. Authorize Render to access your repositories

### Step 3: Create a New Web Service

1. Click **"New +"** button
2. Select **"Web Service"**
3. Choose **"Build and deploy from a Git repository"**
4. Click **"Connect"** next to your LTOCMS repository

### Step 4: Configure the Service

Fill in these settings:

**Basic Settings:**

- **Name**: `ltocms-backend`
- **Region**: Choose closest to you
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend` ⚠️ **CRITICAL**
- **Runtime**: `Node`

**Build & Deploy:**

- **Build Command**: `npm install && npm run build`
- **Start Command**: `node dist/server.js`

### Step 5: Set Environment Variables

Click **"Advanced"** and add these environment variables:

```
NODE_ENV = production
PORT = 10000
MONGODB_URI = your-actual-mongodb-connection-string-from-env-file
JWT_SECRET = your-actual-jwt-secret-from-env-file
JWT_REFRESH_SECRET = your-actual-refresh-secret-from-env-file
JWT_EXPIRE = 15m
JWT_REFRESH_EXPIRE = 7d
FRONTEND_URL = https://your-frontend-url.vercel.app
MAX_FILE_SIZE = 5242880
UPLOAD_PATH = uploads/
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 50
GOOGLE_CLIENT_ID = your-actual-google-client-id-from-env-file
GOOGLE_CLIENT_SECRET = your-actual-google-client-secret-from-env-file
```

**⚠️ IMPORTANT**:

- Copy values from your local `backend/.env` file
- Don't include quotes around values
- `PORT` should be `10000` for Render (they assign this automatically)

### Step 6: Deploy

1. Click **"Create Web Service"**
2. Render will start building your application
3. Watch the build logs in real-time

### Step 7: Monitor Deployment

You should see:

1. ✅ **Install**: `npm install` runs successfully
2. ✅ **Build**: `npm run build` compiles TypeScript
3. ✅ **Start**: `node dist/server.js` starts the server
4. ✅ **Success**: "Your service is live at https://..."

### Step 8: Get Your Backend URL

1. Once deployed, Render provides a URL like: `https://ltocms-backend.onrender.com`
2. Copy this URL - you'll need it for frontend deployment

### Step 9: Test Your Deployment

1. Visit: `https://your-app.onrender.com/api/health`
2. You should see:

```json
{
  "status": "OK",
  "message": "LTOCMS Backend Server is running",
  "timestamp": "2025-01-08T10:00:00.000Z",
  "environment": "production"
}
```

## 🔧 Troubleshooting Render Issues

### Issue 1: Build Fails

**Check the build logs for specific errors:**

- TypeScript compilation errors
- Missing dependencies
- Environment variable issues

### Issue 2: Server Starts but Crashes

**Common causes:**

- Missing environment variables
- Database connection issues
- Port configuration problems

### Issue 3: Database Connection Fails

**Solution:**

1. Check MongoDB Atlas IP whitelist
2. Set to `0.0.0.0/0` (allow all IPs)
3. Verify `MONGODB_URI` is correct

## ✅ Advantages of Render over Railway

1. **Better Directory Handling**: Properly handles monorepo structures
2. **Clearer Error Messages**: Easier to debug issues
3. **Reliable Builds**: More consistent build process
4. **Free Tier**: 750 hours/month free
5. **Automatic SSL**: HTTPS enabled by default

## 🚀 Next Steps After Backend Deployment

1. **Update Frontend Environment**: Use your Render URL in frontend `.env.production`
2. **Deploy Frontend to Vercel**: Follow the frontend deployment guide
3. **Update OAuth Settings**: Add your production URLs to Google OAuth
4. **Test Full Application**: Verify frontend can communicate with backend

## 📞 If You Still Have Issues

1. **Check Render Status**: [status.render.com](https://status.render.com)
2. **Review Build Logs**: Look for specific error messages
3. **Verify Environment Variables**: Double-check all values
4. **Test Locally**: Make sure `npm run build` works locally

---

**🎉 Render.com should work much more reliably than Railway for this project structure!**
