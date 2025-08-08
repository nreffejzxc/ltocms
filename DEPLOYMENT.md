# LTOCMS Deployment Guide

This guide will help you deploy the LTOCMS application to the internet using free hosting services.

## 🚨 SECURITY WARNING

**CRITICAL: Before deploying, read [`SECURITY.md`](./SECURITY.md) to ensure your sensitive data is protected!**

Your `.env` files contain database credentials and API keys that must NEVER be committed to GitHub.

## Prerequisites

- GitHub account
- Railway account (for backend)
- Vercel account (for frontend)
- MongoDB Atlas database (already configured)
- **Security awareness** - Read SECURITY.md first!

## Deployment Steps

### 1. Security Check & Repository Setup

**IMPORTANT: Run the security-aware deployment script:**

```bash
./deploy-production.sh
```

This script will:

- Check for security issues with .env files
- Verify .gitignore is properly configured
- Build the applications
- Safely commit only non-sensitive files
- Provide deployment instructions

**Manual alternative:**

```bash
# Initialize git (if not already done)
git init

# NEVER add .env files - they're in .gitignore
git add .gitignore backend/.gitignore frontend/.gitignore
git add *.md *.sh backend/.env.example frontend/.env.example
git add backend/railway.json frontend/vercel.json
# ... add other safe files

git commit -m "Prepare for deployment"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy Backend (Choose One Option)

#### Option A: Deploy to Railway

1. **Sign up for Railway**: Go to [railway.app](https://railway.app) and sign up with GitHub
2. **Create New Project**: Click "New Project" → "Deploy from GitHub repo"
3. **Select Repository**: Choose your LTOCMS repository
4. **Select Backend**: Choose the `backend` folder as the root directory
5. **Configure Environment Variables**: Add the following variables in Railway dashboard:

⚠️ **SECURITY NOTE**: Use your actual values from your local `.env` file, but NEVER commit the .env file itself!

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-actual-mongodb-connection-string
JWT_SECRET=your-actual-jwt-secret-from-env-file
JWT_REFRESH_SECRET=your-actual-refresh-secret-from-env-file
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=https://your-frontend-url.vercel.app
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads/
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
```

6. **Deploy**: Railway will automatically build and deploy your backend
7. **Get Backend URL**: Copy the generated Railway URL (e.g., `https://your-app.railway.app`)

**If Railway fails with "No start command found":**

- The backend includes multiple configuration files (`nixpacks.toml`, `Procfile`, `railway.json`)
- Try redeploying or use Option B (Render) below

#### Option B: Deploy to Render (Alternative)

1. **Sign up for Render**: Go to [render.com](https://render.com) and sign up with GitHub
2. **Create New Web Service**: Click "New" → "Web Service"
3. **Connect Repository**: Choose your LTOCMS repository
4. **Configure Service**:
   - **Name**: ltocms-backend
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/server.js`
5. **Add Environment Variables**: Same as Railway above
6. **Deploy**: Render will build and deploy your backend
7. **Get Backend URL**: Copy the generated Render URL (e.g., `https://your-app.onrender.com`)

### 3. Deploy Frontend to Vercel

1. **Sign up for Vercel**: Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. **Import Project**: Click "New Project" → Import your GitHub repository
3. **Configure Project**:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build:prod`
   - Output Directory: `dist`
4. **Configure Environment Variables**: Add the following in Vercel dashboard:

```env
VITE_API_URL=https://your-backend-url.railway.app/api
VITE_NODE_ENV=production
VITE_APP_NAME=LTOCMS
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Lease-to-Own Car Management System
VITE_ENABLE_DEVTOOLS=false
VITE_ENABLE_ANALYTICS=true
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx
VITE_DEFAULT_PAGE_SIZE=10
VITE_MAX_PAGE_SIZE=100
VITE_TOAST_DURATION=4000
VITE_TOAST_POSITION=top-right
```

5. **Deploy**: Vercel will automatically build and deploy your frontend
6. **Get Frontend URL**: Copy the generated Vercel URL (e.g., `https://your-app.vercel.app`)

### 4. Update CORS Configuration

1. **Update Backend Environment**: In Railway dashboard, update the `FRONTEND_URL` variable with your actual Vercel URL
2. **Redeploy Backend**: Railway will automatically redeploy with the new configuration

### 5. Update Google OAuth Configuration

1. **Google Cloud Console**: Go to [console.cloud.google.com](https://console.cloud.google.com)
2. **Select Project**: Choose your OAuth project
3. **Credentials**: Go to APIs & Services → Credentials
4. **Edit OAuth Client**: Update the authorized redirect URIs:
   - Add: `https://your-backend-url.railway.app/api/auth/google/callback`
   - Add: `https://your-frontend-url.vercel.app/auth/callback`

### 6. Seed Database (Optional)

To populate your database with test users, run the seed script:

```bash
# Clone your repository locally
git clone <your-repo-url>
cd ltocms/backend

# Install dependencies
npm install

# Set environment variables (create .env file with production values)
# Run seed script
npm run seed:prod
```

## Test User Accounts

After seeding, you can use these test accounts:

- **Admin**: admin@ltocms.com / Admin123!
- **Sales**: sales@ltocms.com / Sales123!
- **Credit**: credit@ltocms.com / Credit123!
- **Client**: client@ltocms.com / Client123!

## Monitoring and Maintenance

### Railway (Backend)

- Monitor logs in Railway dashboard
- Check health endpoint: `https://your-backend-url.railway.app/api/health`
- Railway provides automatic SSL certificates

### Vercel (Frontend)

- Monitor deployments in Vercel dashboard
- Automatic deployments on git push
- Built-in analytics and performance monitoring

### MongoDB Atlas

- Monitor database usage in Atlas dashboard
- Set up alerts for connection issues
- Regular backups are automatic

## Troubleshooting

### Common Issues

1. **Railway "No start command found" Error**:

   - The backend now includes multiple configuration files to fix this:
     - `nixpacks.toml` - Explicit Nixpacks configuration
     - `Procfile` - Heroku-style process file
     - `railway.json` - Railway-specific configuration
   - If still failing, try redeploying or check Railway logs

2. **CORS Errors**: Ensure `FRONTEND_URL` in backend matches your Vercel URL

3. **OAuth Issues**: Verify redirect URIs in Google Cloud Console

4. **Database Connection**: Check MongoDB Atlas IP whitelist (set to 0.0.0.0/0 for all IPs)

5. **Build Failures**: Check build logs in Railway/Vercel dashboards

### Railway Deployment Issues

If Railway deployment fails:

1. **Check the build logs** in Railway dashboard
2. **Verify environment variables** are set correctly
3. **Try redeploying** - sometimes Railway needs a fresh deployment
4. **Alternative: Use Railway CLI**:
   ```bash
   npm install -g @railway/cli
   railway login
   railway link
   railway up
   ```

### Environment Variables Checklist

**Backend (Railway):**

- [ ] NODE_ENV=production
- [ ] MONGODB_URI (MongoDB Atlas connection string)
- [ ] JWT_SECRET & JWT_REFRESH_SECRET
- [ ] FRONTEND_URL (Vercel URL)
- [ ] GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET

**Frontend (Vercel):**

- [ ] VITE_API_URL (Railway backend URL)
- [ ] VITE_NODE_ENV=production
- [ ] All other VITE\_ prefixed variables

## Security Notes

- Never commit sensitive environment variables to git
- Use strong, unique JWT secrets in production
- Regularly rotate OAuth client secrets
- Monitor for unusual database activity
- Keep dependencies updated

## Support

If you encounter issues:

1. Check the deployment logs in Railway/Vercel dashboards
2. Verify all environment variables are set correctly
3. Test the health endpoint: `https://your-backend-url.railway.app/api/health`
4. Check MongoDB Atlas connection status

## URLs After Deployment

- **Frontend**: https://your-app.vercel.app
- **Backend API**: https://your-app.railway.app/api
- **Health Check**: https://your-app.railway.app/api/health
- **Database**: MongoDB Atlas (managed)

---

🎉 **Congratulations!** Your LTOCMS application is now live and accessible to everyone on the internet!
