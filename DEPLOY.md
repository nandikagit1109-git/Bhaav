# BHAAV — Deploy Guide

## Prerequisites
```bash
npm install -g @railway/cli vercel
```

## Step 1: Deploy Backend to Railway
```bash
cd bhaav
railway login
railway init bhaav-backend
railway variables set ANTHROPIC_API_KEY=your-key-here
railway variables set NODE_ENV=production
railway up
railway domain
```
Copy the URL it gives you (e.g. `bhaav-backend-production.up.railway.app`).

## Step 2: Deploy Frontend to Vercel
```bash
cd frontend
vercel --prod -e VITE_API_URL=https://your-railway-url
```

## Step 3: Update CORS (if needed)
The backend already allows all origins via `cors()`, so no changes needed.

## Done! 🎉
- **Frontend**: https://bhaav.vercel.app
- **Backend**: https://your-railway-url.railway.app

## Optional: One-Click Deploy
```powershell
.\deploy.ps1
```
