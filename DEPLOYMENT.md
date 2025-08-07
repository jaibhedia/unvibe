# 🚀 Vibe Platform Deployment Guide

This guide will help you deploy the Vibe Reverse Engineer Platform to production using **Vercel** (frontend) and **Railway** (backend).

## 📋 Prerequisites

- Node.js 18+ installed
- Git installed
- Vercel account ([signup here](https://vercel.com))
- Railway account ([signup here](https://railway.app))

## 🎯 Quick Deployment (Recommended)

### Option 1: Automatic Deployment Script

1. **Run the deployment script:**
```bash
./deploy.sh
```

2. **Follow the interactive prompts to:**
   - Choose deployment target (frontend/backend/both)
   - Login to Vercel and Railway
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
- `VITE_API_BASE_URL` = `https://your-backend-url.railway.app`

## 🗄️ Backend Deployment (Railway)

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Initialize Railway Project
```bash
railway init
```

### 4. Deploy to Railway
```bash
railway up
```

### 5. Set Environment Variables in Railway
```bash
railway variables set CORS_ORIGINS=https://your-frontend-url.vercel.app
railway variables set ENVIRONMENT=production
```

## 🔧 Configuration Files Created

The following files have been created for deployment:

- `vercel.json` - Vercel deployment configuration
- `Dockerfile` - Railway container configuration  
- `railway.json` - Railway service configuration
- `.env.production` - Production environment variables
- `deploy.sh` - Automated deployment script

## 🌐 Environment Variables

### Frontend (Vercel)
```bash
VITE_API_BASE_URL=https://your-backend-url.railway.app
```

### Backend (Railway)
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

### Backend to Railway:
1. Connect your GitHub repo to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

## 🔍 Verification

After deployment, verify your application:

1. **Frontend:** Visit your Vercel URL
2. **Backend:** Visit `https://your-backend-url.railway.app/health`
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
   - Ensure all dependencies are in `package.json`
   - Check TypeScript errors in build logs

## 📊 Monitoring

- **Vercel:** Check deployment logs in Vercel dashboard
- **Railway:** Monitor application logs in Railway dashboard
- **Health Check:** `https://your-backend-url.railway.app/health`

## 🔄 Updates

To deploy updates:

1. **Push to main branch** - Both services will auto-deploy
2. **Manual redeploy:**
   ```bash
   vercel --prod  # Frontend
   railway up     # Backend
   ```

## 🎉 Success!

Your Vibe Reverse Engineer Platform is now live! 

- **Frontend:** https://your-app.vercel.app
- **Backend:** https://your-backend.railway.app
- **Health Check:** https://your-backend.railway.app/health

## 📚 Next Steps

1. Set up custom domain (optional)
2. Configure monitoring and alerts
3. Set up CI/CD pipelines
4. Add SSL certificates (handled automatically)

---

Need help? Check the troubleshooting section or create an issue in the repository.
