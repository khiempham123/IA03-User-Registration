# Vercel CLI Deployment Guide

## 1. Install Vercel CLI
```bash
npm install -g vercel
```

## 2. Login to Vercel
```bash
vercel login
```

## 3. Deploy from frontend folder
```bash
cd frontend
vercel
```

## 4. Set environment variable
```bash
vercel env add VITE_API_BASE production
# Enter value: https://your-backend-url.up.railway.app
```

## 5. Redeploy with environment variable
```bash
vercel --prod
```
