# 🔥 Render Deployment Guide for Vibe Platform

## Why Render?

Render offers:
- ✅ **Free tier** with generous limits
- ✅ **Automatic deploys** from GitHub
- ✅ **Built-in SSL** certificates
- ✅ **Easy environment** variable management
- ✅ **Excellent performance** and reliability

## 🚀 Step-by-Step Render Deployment

### 1. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with your GitHub account

### 2. Connect Your Repository
1. Click **"New +"** in the Render dashboard
2. Select **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your `unvibe` repository

### 3. Configure Your Service

Use these **exact settings**:

| Setting | Value |
|---------|-------|
| **Name** | `vibe-backend` |
| **Environment** | `Python 3` |
| **Build Command** | `cd backend && pip install -r requirements.txt` |
| **Start Command** | `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Health Check Path** | `/health` |

### 4. Set Environment Variables

In the Render dashboard, add these environment variables:

```bash
CORS_ORIGINS=https://your-frontend-url.vercel.app
ENVIRONMENT=production
```

**⚠️ Important:** Replace `your-frontend-url` with your actual Vercel URL after frontend deployment.

### 5. Deploy!

1. Click **"Create Web Service"**
2. Render will automatically deploy your backend
3. Wait for the build to complete (2-3 minutes)
4. Your backend will be live at `https://your-service-name.onrender.com`

## 🔧 Advanced Configuration

### Custom Domain (Optional)
1. Go to your service settings
2. Click **"Custom Domains"**
3. Add your domain and follow DNS instructions

### Auto-Deploy Setup
- ✅ **Already configured!** Render automatically deploys when you push to your main branch

### Health Check Monitoring
- Render automatically monitors `/health` endpoint
- Service restarts if health check fails

## 🎯 Frontend Integration

After backend deployment, update your frontend:

1. **Get your Render URL** (e.g., `https://vibe-backend.onrender.com`)
2. **Update Vercel environment variable:**
   - Go to Vercel dashboard → Your project → Settings → Environment Variables
   - Update `VITE_API_BASE_URL` to your Render URL

## 📊 Monitoring Your Deployment

### Render Dashboard Features:
- **Real-time logs** - See your application output
- **Metrics** - CPU, memory, and request analytics  
- **Events** - Deployment history and status
- **Shell access** - Debug directly in the container

### Quick Health Check:
```bash
curl https://your-backend-url.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-07T12:00:00Z",
  "version": "1.0.0",
  "service": "vibe-api"
}
```

## 🛠️ Troubleshooting

### Common Issues & Solutions:

1. **Build Fails:**
   ```bash
   # Check your requirements.txt includes all dependencies
   cd backend && pip install -r requirements.txt
   ```

2. **Service Won't Start:**
   - Verify start command is exactly: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Check build logs for Python errors

3. **CORS Errors:**
   - Ensure `CORS_ORIGINS` environment variable is set correctly
   - Verify frontend URL doesn't have trailing slash

4. **Health Check Fails:**
   - Test `/health` endpoint locally first
   - Check if your app is binding to `0.0.0.0:$PORT`

### Free Tier Limitations:
- **Sleeps after 15 minutes** of inactivity
- **750 hours/month** (enough for most projects)
- **Cold starts** when service wakes up

## 🔄 Updates & Maintenance

### Deploying Updates:
1. **Push to GitHub** - Render auto-deploys
2. **Manual deploy** - Use "Deploy Latest Commit" button in dashboard
3. **Environment changes** - Update in dashboard, service restarts automatically

### Monitoring Performance:
- Check **Metrics** tab for performance insights
- Use **Logs** tab for debugging
- Set up **notifications** for deployment failures

## 🎉 Success Checklist

- [ ] ✅ Backend deployed to Render
- [ ] ✅ Health check endpoint working
- [ ] ✅ CORS configured for frontend
- [ ] ✅ Environment variables set
- [ ] ✅ Auto-deploy enabled
- [ ] ✅ Frontend connected to backend

**Your backend is now live at:** `https://your-service-name.onrender.com`

---

**Next Step:** Deploy your frontend to Vercel and update the API URL!
