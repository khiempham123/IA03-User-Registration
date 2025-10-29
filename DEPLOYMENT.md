# IA03 Deployment Guide - Vercel

This guide explains how to deploy the frontend to Vercel and the backend to a cloud provider (Railway/Render).

## Architecture Overview

- **Frontend**: Deployed on Vercel (static React app)
- **Backend**: Deployed on Railway or Render (Node.js API + MongoDB)
- **Database**: MongoDB Atlas (cloud database)

---

## Part 1: Setup MongoDB Atlas (Database)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account (M0 Sandbox - Free tier)

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "Shared" (Free tier)
   - Select a cloud provider and region close to you
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Username: `ia03user` (or your choice)
   - Password: Generate a strong password and save it
   - Set "Database User Privileges" to "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
   - ⚠️ For production, restrict to your backend server IPs
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string. It looks like:
     ```
     mongodb+srv://ia03user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add database name at the end: `/ia03`
   - Final example:
     ```
     mongodb+srv://ia03user:mypassword123@cluster0.xxxxx.mongodb.net/ia03?retryWrites=true&w=majority
     ```

---

## Part 2: Deploy Backend to Railway

Railway is simple and offers a free tier for hobby projects.

### Step-by-step

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your repository (or create one by pushing your `backend` folder to GitHub first)

3. **Configure Backend Deployment**
   - Railway will auto-detect Node.js
   - Add a `start:prod` script to `backend/package.json` if not present:
     ```json
     "scripts": {
       "start": "ts-node -r tsconfig-paths/register src/main.ts",
       "start:prod": "node dist/main.js",
       "build": "tsc -p tsconfig.json"
     }
     ```
   - Railway will run `npm install` and `npm run build`, then `npm run start:prod`

4. **Set Environment Variables**
   - Go to your Railway project → "Variables" tab
   - Add these variables:
     ```
     MONGO_URI=mongodb+srv://ia03user:yourpassword@cluster0.xxxxx.mongodb.net/ia03
     PORT=3333
     NODE_ENV=production
     JWT_SECRET=your-super-secret-jwt-key-change-this
     ```
   - ⚠️ Use a strong random JWT_SECRET (e.g., generate with `openssl rand -base64 32`)

5. **Deploy**
   - Railway will automatically deploy
   - After deployment, go to "Settings" → "Generate Domain" to get a public URL
   - Your backend will be at: `https://your-app.up.railway.app`
   - Test with: `https://your-app.up.railway.app/user/register` (should return error for GET, meaning backend is running)

### Alternative: Render

If you prefer Render:

1. Go to https://render.com and sign up
2. Create a new "Web Service"
3. Connect your GitHub repo
4. Set:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Environment Variables**: Same as Railway above
5. Click "Create Web Service"

---

## Part 3: Deploy Frontend to Vercel

1. **Prepare Frontend for Deployment**
   
   In `frontend/.env` or create `frontend/.env.production`:
   ```bash
   VITE_API_BASE=https://your-backend.up.railway.app
   ```
   Replace with your actual Railway or Render backend URL.

2. **Push to GitHub**
   
   Push your `frontend` folder to a GitHub repository.

3. **Deploy to Vercel**
   
   - Go to https://vercel.com and sign up with GitHub
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration
   
   **Settings:**
   - **Root Directory**: `frontend` (if your repo has both backend and frontend)
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   
   **Environment Variables:**
   - Add `VITE_API_BASE` with value: `https://your-backend.up.railway.app`
   
   - Click "Deploy"

4. **Done!**
   
   Vercel will give you a URL like `https://your-app.vercel.app`
   
   Visit it and test Sign Up → Login → Home flow.

---

## Part 4: Testing Deployment

1. **Test Backend**
   ```powershell
   curl -X POST https://your-backend.up.railway.app/user/register -H "Content-Type: application/json" -d '{ "email":"test@example.com", "password":"secret123" }'
   ```
   Expected: 201 response with user data

2. **Test Frontend**
   - Visit your Vercel URL
   - Go to Sign Up page
   - Register a new user
   - You should be auto-logged in and redirected to Home
   - Check Profile page to see your email

3. **Check Database**
   - Go to MongoDB Atlas → "Collections"
   - You should see `ia03` database with a `users` collection containing your registered user (password hashed)

---

## Troubleshooting

### Backend not connecting to MongoDB
- Check `MONGO_URI` in Railway environment variables
- Ensure IP whitelist in MongoDB Atlas allows 0.0.0.0/0 or Railway IPs
- Check Railway logs for connection errors

### Frontend can't reach backend (CORS errors)
- Ensure `VITE_API_BASE` points to correct backend URL (with https://)
- Check backend CORS is enabled (should be in `src/main.ts`: `app.enableCors({ origin: true })`)
- Verify backend is deployed and running (visit backend URL in browser)

### JWT token errors
- Ensure `JWT_SECRET` is set in backend environment variables
- Check browser console for token decode errors

---

## Security Recommendations for Production

1. **MongoDB Atlas**
   - Restrict Network Access to specific IPs (your backend server)
   - Use strong database passwords
   - Enable audit logging

2. **Backend**
   - Use a strong random `JWT_SECRET` (32+ characters)
   - Set `NODE_ENV=production`
   - Add rate limiting (e.g., `express-rate-limit`)
   - Add helmet for security headers
   - Validate all inputs strictly

3. **Frontend**
   - Use HTTPS (Vercel provides this automatically)
   - Don't commit `.env` files to Git
   - Use environment variables for all config

---

## Cost Estimate

- **MongoDB Atlas M0**: Free forever (512MB storage)
- **Railway**: Free tier (500 hours/month, $5 credit)
- **Vercel**: Free tier (100GB bandwidth, unlimited deployments)

**Total**: $0/month for small projects (within free tier limits)

---

## Next Steps

- Add your own domain in Vercel settings
- Set up CI/CD for auto-deploy on Git push
- Add monitoring (Vercel Analytics, Railway metrics)
- Implement password reset functionality
- Add email verification

---

## Support

If you encounter issues:
1. Check Railway/Vercel deployment logs
2. Check browser console for frontend errors
3. Test backend endpoints with curl/Postman
4. Verify environment variables are set correctly

Created by 22120159
