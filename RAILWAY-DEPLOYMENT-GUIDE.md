# 🚂 Railway Deployment Guide - Step by Step

This guide will walk you through deploying your LTOCMS backend to Railway with exact steps.

## 📋 Prerequisites

1. ✅ Your code is ready with all configuration files
2. ✅ You have a GitHub account
3. ✅ Your project is pushed to GitHub
4. ✅ You have your environment variables from your local `.env` file

## 🚀 Step-by-Step Railway Deployment

### Step 1: Prepare Your Code

First, make sure your code is committed and pushed to GitHub:

```bash
# Run the deployment script to commit all files safely
./deploy.sh

# If you don't have a GitHub repository yet:
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

### Step 2: Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Click **"Login"** in the top right
3. Choose **"Login with GitHub"**
4. Authorize Railway to access your GitHub account

### Step 3: Create a New Project

1. Once logged in, click **"New Project"** (big purple button)
2. You'll see several options - click **"Deploy from GitHub repo"**
3. You'll see a list of your GitHub repositories
4. Find and click on your LTOCMS repository

### Step 4: Configure the Service

**IMPORTANT: This is where most people make mistakes!**

1. After selecting your repo, Railway will show a project setup screen
2. You'll see your repository structure
3. **DO NOT** deploy the root directory!
4. Look for a **"Add Service"** or **"Deploy"** button
5. When prompted for the **root directory**, type: `backend`
6. Or if you see a folder structure, click on the `backend` folder specifically

### Step 5: Set Environment Variables

This is crucial! Railway needs your environment variables to work:

1. In your Railway project dashboard, look for **"Variables"** tab
2. Click **"Variables"** or **"Environment Variables"**
3. Add each variable one by one by clicking **"New Variable"**:

```
NODE_ENV = production
PORT = 5000
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

- Copy the values from your local `backend/.env` file
- Don't include the quotes around the values
- Make sure `MONGODB_URI` is your full connection string
- Set `FRONTEND_URL` to your future Vercel URL (you can update this later)

### Step 6: Deploy

1. After setting all environment variables, Railway should automatically start deploying
2. If not, look for a **"Deploy"** button and click it
3. You'll see the build logs in real-time

### Step 7: Monitor the Deployment

Watch the build logs carefully:

1. **Install phase**: Should show `npm install` running
2. **Build phase**: Should show `npm run build` and TypeScript compilation
3. **Start phase**: Should show `node dist/server.js` starting
4. **Success**: You should see your server startup message

### Step 8: Get Your Backend URL

1. Once deployment succeeds, Railway will provide a URL
2. It will look like: `https://your-app-name.railway.app`
3. Copy this URL - you'll need it for the frontend deployment

### Step 9: Test Your Deployment

1. Open your Railway URL in a browser
2. Add `/api/health` to the end: `https://your-app.railway.app/api/health`
3. You should see a JSON response like:

```json
{
  "status": "OK",
  "message": "LTOCMS Backend Server is running",
  "timestamp": "2025-01-08T10:00:00.000Z",
  "environment": "production"
}
```

## 🔧 Troubleshooting Common Issues

### Issue 1: "Could not read package.json" - ENOENT Error

**This is the most critical error!**

**Error message**:

```
npm error path /app/package.json
npm error errno -2
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory
```

**Root Cause**: Railway is not deploying from the `backend` folder correctly.

**Solution**:

1. **CRITICAL**: Make sure you selected `backend` as the root directory in Railway
2. **In Railway Dashboard**:
   - Go to your service settings
   - Look for "Root Directory" or "Source Directory"
   - Set it to: `backend`
   - Save and redeploy
3. **Alternative**: Delete the service and create a new one, making sure to select `backend` folder

### Issue 2: "npm ci" Error - "can only install with existing package-lock.json"

**This is the most common error!**

**Error message**:

```
npm error The `npm ci` command can only install with an existing package-lock.json
```

**Solution**:

1. **Push the updated configuration** - I've fixed this by updating all config files to use `npm install` instead of `npm ci`
2. **Commit and push the changes**:
   ```bash
   ./deploy.sh
   ```
3. **Redeploy on Railway** - trigger a new deployment
4. **If still failing**, try the Railway CLI method below

### Issue 3: "npm run build" Fails - Exit Code 249

**Error message**:

```
RUN npm run build
process "/bin/bash -ol pipefail -c npm run build" did not complete successfully: exit code 249
```

**Solution**:

1. **Updated build configuration** - I've added optimized TypeScript build config
2. **Commit and push the changes**:
   ```bash
   ./deploy.sh
   ```
3. **Redeploy on Railway** - the build should now work with improved TypeScript configuration
4. **Check build logs** - Railway will now show more detailed build information

### Issue 4: "No start command found"

**Solution**: Make sure you selected the `backend` folder as the root directory, not the main project folder.

### Issue 2: Build fails with TypeScript errors

**Solution**:

1. Check the build logs for specific errors
2. Make sure all your code is committed and pushed to GitHub
3. Try redeploying

### Issue 3: Server starts but crashes immediately

**Solution**: Check your environment variables, especially:

- `MONGODB_URI` - must be the complete connection string
- `JWT_SECRET` and `JWT_REFRESH_SECRET` - must be set

### Issue 4: Database connection fails

**Solution**:

1. Check your MongoDB Atlas IP whitelist
2. Set it to `0.0.0.0/0` to allow all IPs (Railway uses dynamic IPs)
3. Verify your `MONGODB_URI` is correct

## 🎯 Alternative: Railway CLI Method

If the web interface doesn't work, try the CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to your backend folder
cd backend

# Initialize Railway project
railway init

# Deploy
railway up
```

## 📞 If You're Still Having Issues

1. **Check Railway Status**: Visit [railway.app/status](https://railway.app/status)
2. **Review Build Logs**: Look for specific error messages in Railway dashboard
3. **Try Render.com**: Use the alternative deployment method in DEPLOYMENT.md
4. **Double-check Environment Variables**: Make sure all values are correct

## ✅ Success Checklist

- [ ] Repository is on GitHub
- [ ] Selected `backend` folder as root directory in Railway
- [ ] All environment variables are set correctly
- [ ] Build completed successfully
- [ ] Health endpoint returns OK response
- [ ] Railway URL is accessible

Once your backend is deployed successfully, you can proceed with deploying the frontend to Vercel!
