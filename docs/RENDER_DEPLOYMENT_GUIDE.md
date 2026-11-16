# Render Backend Deployment Guide

This guide walks you through deploying the Express.js REST API backend to **Render** and connecting it to **MongoDB Atlas**.

---

## Step 1: Set Up MongoDB Atlas
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Sandbox** cluster.
3. **Create Database User**:
   - Go to **Security** -> **Database Access**.
   - Click **Add New Database User**.
   - Select **Password** authentication.
   - Set username (e.g. `student_admin`) and a secure password.
   - Role: `Read and write to any database`.
   - *Note*: If your password has special characters like `@` or `#`, encode them (e.g. `@` -> `%40`).
4. **Configure IP Access Whitelist**:
   - Go to **Security** -> **Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access From Anywhere** (`0.0.0.0/0`).
   - Click **Confirm**. *(Crucial because Render uses dynamic IP addresses).*
5. **Get Connection String**:
   - Go to **Deployment** -> **Database**.
   - Click **Connect** -> **Drivers** (Node.js).
   - Copy the URI:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/student_db?retryWrites=true&w=majority
     ```

---

## Step 2: Deploy to Render
1. Sign in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository `student-management-system`.
4. Configure the Web Service:
   - **Name**: `student-records-backend`
   - **Region**: Choose the closest region (e.g., Oregon or Frankfurt).
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`

---

## Step 3: Configure Environment Variables in Render
In the **Environment Variables** section, add:

| Key | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production optimizations |
| `MONGODB_URI` | `mongodb+srv://student_admin:...` | Your MongoDB Atlas connection string |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Your deployed Vercel domain for CORS whitelist |

> 💡 **Tip**: Render automatically injects `process.env.PORT`. In `server.js`, the app binds to `process.env.PORT || 5000` on host `0.0.0.0`, so it connects without manual port configuration.

---

## Step 4: Configure Health Check Path
Under **Advanced Settings**:
- **Health Check Path**: `/api/health`

This ensures Render knows when your instance is healthy and ready to accept requests.

---

## Step 5: Test the Live Render Endpoint
Once the deployment log says `Express Backend Server Running!`:
1. Open your Render service URL in a browser:
   `https://<your-service-name>.onrender.com/`
   You should see the API JSON welcome response.
2. Check the health check endpoint:
   `https://<your-service-name>.onrender.com/api/health`
   Should return:
   ```json
   {
     "status": "healthy",
     "database": {
       "connected": true,
       "state": "connected"
     }
   }
   ```
3. Test the student records endpoint:
   `https://<your-service-name>.onrender.com/api/students`

---

## Free Tier Spin-Down (Cold Start) Behavior
Render free web services spin down after 15 minutes of inactivity. The first incoming request takes 45–60 seconds to spin up the container.
- The frontend includes a responsive notification banner and status badge informing users of waking instances.
- Once warmed, subsequent requests respond in under 100ms.
