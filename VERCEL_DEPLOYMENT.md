# Vercel Deployment Guide

This guide will help you deploy your CMS project to Vercel.

## Overview

Your project has two parts that may be deployed separately:

- **Frontend (React)**: Deployed on Vercel ✅ (This guide focuses on this)
- **Backend (Django)**: Deploy separately on Railway, Render, Heroku, or another service

## Prerequisites

- Vercel account (free at [vercel.com](https://vercel.com))
- GitHub account with your repository
- Django backend already deployed and running

## Step 1: Prepare Your Django Backend

Before deploying the frontend, ensure your Django backend is deployed and accessible.

### Recommended Backend Hosting Options:

1. **Railway** (Recommended)

   - Easy deployment
   - Free tier available
   - Good PostgreSQL support
   - Visit: https://railway.app

2. **Render**

   - Similar to Railway
   - Good free tier
   - Visit: https://render.com

3. **Heroku** (Paid after free tier ended)
   - Traditional option
   - Visit: https://heroku.com

### Important: CORS Configuration

Update your Django `CORS_ALLOWED_ORIGINS` to include your Vercel frontend URL:

```python
# In your Django backend settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-project.vercel.app",  # Add your Vercel URL
    "https://your-custom-domain.com",   # Add your custom domain if you have one
]
```

## Step 2: Deploy Frontend to Vercel

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Navigate to your project root
cd C:\Django_Project\CMS

# Deploy to Vercel
vercel
```

### Option B: Using GitHub Integration (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Sign in or create an account
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - **Framework**: Vite
   - **Root Directory**: `./frontend`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`

## Step 3: Configure Environment Variables

After connecting your project on Vercel:

1. Go to your Vercel project settings
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```env
VITE_API_URL=https://your-backend-url.com/api
VITE_APP_NAME=My CMS Blog
VITE_APP_VERSION=1.0.0
```

Replace `https://your-backend-url.com/api` with your actual Django backend URL.

## Step 4: Update API Configuration in Frontend

Make sure your frontend's API configuration uses the environment variable:

**frontend/src/api/axios.js**:

```javascript
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
```

## Step 5: Configure Custom Domain (Optional)

To use a custom domain instead of `vercel.app`:

1. In Vercel project settings, go to **Domains**
2. Add your custom domain
3. Follow the DNS configuration instructions
4. Update your Django CORS settings with the new domain

## Step 6: Deploy and Monitor

### Automatic Deployments

Once connected to GitHub, your project will automatically deploy when you push to the `main` branch.

### Manual Deployments

```bash
# Using Vercel CLI
vercel --prod

# Using GitHub
# Simply push to main branch - automatic deployment
```

### Monitor Deployments

1. Go to your Vercel project
2. Check the **Deployments** tab
3. View logs for any build or runtime errors

## Troubleshooting

### Build Fails

**Error**: `Cannot find module 'vite'`

**Solution**: Ensure `vercel.json` is correctly configured and `vite` is in `package.json`

### CORS Errors

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:

1. Check that `VITE_API_URL` is correct in Vercel environment variables
2. Verify Django backend has your Vercel domain in `CORS_ALLOWED_ORIGINS`

### Environment Variables Not Loading

**Error**: `VITE_API_URL is undefined`

**Solution**:

1. Ensure environment variables are prefixed with `VITE_`
2. Rebuild and redeploy the project
3. Check Vercel environment variables are saved

### 404 Errors on Page Refresh

This is because Vercel is correctly routing all requests to `index.html` for SPA routing. Ensure your React Router is configured properly.

## Performance Optimization

1. **Enable Caching**: Vercel automatically caches static files
2. **Image Optimization**: Use Next.js Image component or optimize images
3. **Code Splitting**: Vite automatically handles this

## Security Best Practices

1. ✅ Use environment variables for API URLs
2. ✅ Never commit `.env` files
3. ✅ Use HTTPS only (automatic on Vercel)
4. ✅ Configure CORS properly on backend
5. ✅ Keep dependencies updated
6. ✅ Use strong secrets for JWT

## Monitoring and Logs

View your deployment logs:

```bash
# Using Vercel CLI
vercel logs
```

Or in the Vercel dashboard:

1. Go to your project
2. Click on a deployment
3. View detailed logs

## Backend Deployment References

### Railway Deployment Guide

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Environment Variables for Backend

Ensure these are set on your backend hosting:

```env
DEBUG=False
SECRET_KEY=your-very-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,*.railway.app
CORS_ALLOWED_ORIGINS=https://your-project.vercel.app,https://yourdomain.com
DATABASE_URL=postgresql://user:password@host/db
```

## Next Steps

1. ✅ Deploy Django backend
2. ✅ Get backend URL
3. ✅ Configure environment variables
4. ✅ Deploy frontend to Vercel
5. ✅ Test API connectivity
6. ✅ Set up custom domain (optional)
7. ✅ Configure monitoring and alerts

## Quick Command Reference

```bash
# Local development
cd frontend
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy with Vercel CLI
vercel --prod

# Check deployment status
vercel logs
```

## Support

- **Vercel Documentation**: https://vercel.com/docs
- **Vite Documentation**: https://vitejs.dev
- **React Documentation**: https://react.dev
- **Django REST Framework**: https://www.django-rest-framework.org

---

**Last Updated**: January 2026
**Project Version**: 1.0.0
