# 🚀 Vibe Platform Deployment Guide

This guide will help you deploy the Vibe Reverse Engineer Platform to production using **Vercel** (frontend) and **Render** (backend).

## 📋 Prerequisites

- Node.js 18+ installed
- Git installed
- Vercel account ([signup here](https://vercel.com))
- Render account ([signup here](https://render.com))

## 🎯 Quick Deployment (Recommended)

### Option 1: Automatic Deployment Script

1. **Run the deployment script:**
```bash
./deploy.sh
```

2. **Follow the interactive prompts to:**
   - Choose deployment target (frontend/backend/both)
   - Login to Vercel
   - Get instructions for Render deployment
   - Set environment variables

### Option 2: Manual Step-by-Step Deployment

## 🖥️ Frontend Deployment (Vercel)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy to Vercel
```bash
vercel --prod
```

### 4. Set Environment Variables in Vercel Dashboard
Go to your Vercel project settings and add:
- `VITE_API_BASE_URL` = `https://your-backend-url.onrender.com`

## 🗄️ Backend Deployment (Render)

### 1. Create Render Account
Go to [render.com](https://render.com) and sign up

### 2. Connect Your Repository
1. Click "New +" and select "Web Service"
2. Connect your GitHub repository
3. Select your repository

### 3. Configure Render Service
Use these settings:
- **Name**: `vibe-backend` (or your preferred name)
- **Environment**: `Python 3`
- **Build Command**: `cd backend && pip install -r requirements.txt`
- **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/health`

### 4. Set Environment Variables in Render Dashboard
Go to your Render service settings and add:
- `CORS_ORIGINS` = `https://your-frontend-url.vercel.app`
- `ENVIRONMENT` = `production`

## 🔧 Configuration Files Created

The following files have been created for deployment:

- `vercel.json` - Vercel deployment configuration
- `render.yaml` - Render service configuration
- `Dockerfile` - Container configuration (backup option)
- `.env.production` - Production environment variables
- `deploy.sh` - Automated deployment script

## 🌐 Environment Variables

### Frontend (Vercel)
```bash
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

### Backend (Render)
```bash
CORS_ORIGINS=https://your-frontend-url.vercel.app
ENVIRONMENT=production
```

## 📝 Manual Deployment Steps

If you prefer manual deployment:

### Frontend to Vercel:
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Backend to Render:
1. Push your code to GitHub
2. Connect your GitHub repo to Render
3. Set environment variables in Render dashboard
4. Deploy automatically on push

## 🔍 Verification

After deployment, verify your application:

1. **Frontend:** Visit your Vercel URL
2. **Backend:** Visit `https://your-backend-url.onrender.com/health`
3. **Full Integration:** Test repository submission and analysis

## 🛠️ Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Ensure `CORS_ORIGINS` includes your frontend URL
   - Check that URLs don't have trailing slashes

2. **API Connection Failed:**
   - Verify `VITE_API_BASE_URL` is correct
   - Check backend health endpoint

3. **Build Failures:**
   - Ensure all dependencies are in `requirements.txt`
   - Check build logs in Render dashboard

4. **Render-specific Issues:**
   - Check that Python version is compatible
   - Verify the start command is correct
   - Monitor service logs in Render dashboard

## 📊 Monitoring

- **Vercel:** Check deployment logs in Vercel dashboard
- **Render:** Monitor application logs in Render dashboard  
- **Health Check:** `https://your-backend-url.onrender.com/health`

## 🔄 Updates

To deploy updates:

1. **Push to main branch** - Both services will auto-deploy
2. **Manual redeploy:**
   ```bash
   vercel --prod  # Frontend
   # Backend: Push to GitHub (auto-deploys on Render)
   ```

## 🎉 Success!

Your Vibe Reverse Engineer Platform is now live! 

- **Frontend:** https://your-app.vercel.app
- **Backend:** https://your-backend.onrender.com
- **Health Check:** https://your-backend.onrender.com/health

## 📚 Next Steps

1. Set up custom domain (optional)
2. Configure monitoring and alerts
3. Set up CI/CD pipelines
4. Add SSL certificates (handled automatically)

---

Need help? Check the troubleshooting section or create an issue in the repository.
