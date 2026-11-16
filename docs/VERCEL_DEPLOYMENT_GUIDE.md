# Vercel Frontend Deployment Guide

This guide walks you through deploying the React (Vite) frontend to **Vercel** and linking it with the Render backend.

---

## Prerequisites
1. A [Vercel](https://vercel.com/) account.
2. The deployed URL of your Render backend (e.g. `https://student-records-backend.onrender.com`).
3. GitHub repository containing the `student-management-system` codebase.

---

## Step 1: Push Project to GitHub
Initialize git and push to your GitHub repository:
```bash
git init
git add .
git commit -m "Initial commit of Student Records Management System"
git branch -M main
git remote add origin https://github.com/<your-username>/student-management-system.git
git push -u origin main
```

---

## Step 2: Import Project in Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Select your GitHub repository `student-management-system`.
4. In the configuration screen:
   - **Framework Preset**: `Vite` (Vercel automatically detects this).
   - **Root Directory**: Click *Edit* and select `frontend`.
   - **Build Command**: `npm run build` (Default).
   - **Output Directory**: `dist` (Default).
   - **Install Command**: `npm install` (Default).

---

## Step 3: Configure Environment Variables
Under the **Environment Variables** section, add the backend URL:
- **Key**: `VITE_API_URL`
- **Value**: `https://<your-render-service>.onrender.com/api`
*(Ensure no trailing slash at the end)*

> ⚠️ **CRITICAL NOTE**:
> Vite bakes `VITE_` environment variables into the static bundle **at build time**. If you ever change the backend URL in Vercel settings, you must click **Redeploy** for the change to take effect in the browser!

---

## Step 4: Verify Single Page Application (SPA) Rewrites
In `frontend/vercel.json`, ensure the following configuration exists to avoid 404 errors when reloading pages:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## Step 5: Deploy & Verify
1. Click **Deploy**. Vercel will build the project in 30–60 seconds.
2. Once deployed, note your public domain: `https://<project-name>.vercel.app`.
3. Copy this Vercel domain and update `FRONTEND_URL` in your Render Web Service settings so CORS allows requests from this domain.
4. Open the Vercel URL in your browser:
   - The status badge should say **Backend: Connected**.
   - Student records should load in the table.
   - Adding, editing, and deleting records will persist directly to MongoDB Atlas.
