# EduRecord – B.Tech Student Records Management System

## Original Problem Statement

> "React frontend deployed on Vercel is unable to retrieve student records from an Express.js backend deployed on Render.
> Analyse the possible causes and propose appropriate solutions involving API configuration, environment variables, CORS and database connectivity."

---

## Project Objective

Build a full-stack B.Tech Student Records Management System that:
- Demonstrates correct cross-origin API communication between a Vercel-hosted React frontend and a Render-hosted Express backend.
- Implements proper CORS configuration, environment variable management, and MongoDB Atlas connectivity.
- Provides a production-ready CRUD dashboard for managing B.Tech student records.

---

## Architecture

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│   Vercel (Frontend)         │  HTTPS  │   Render (Backend)           │
│                             │ ──────► │                              │
│   React + Vite              │         │   Node.js + Express.js       │
│   Axios (centralised)       │ ◄────── │   REST API (/api/*)          │
│   VITE_API_URL env var      │  JSON   │   CORS-whitelisted origins   │
└─────────────────────────────┘         └──────────────┬───────────────┘
                                                       │ Mongoose
                                                       ▼
                                        ┌──────────────────────────────┐
                                        │   MongoDB Atlas (Cloud)      │
                                        │   students collection        │
                                        └──────────────────────────────┘
```

---

## Technology Stack

| Layer    | Technology               |
|----------|--------------------------|
| Frontend | React.js 18 + Vite       |
| Styling  | Plain CSS (no frameworks)|
| HTTP     | Axios                    |
| Backend  | Node.js + Express.js     |
| Database | MongoDB Atlas + Mongoose |
| Hosting  | Vercel (FE) + Render (BE)|

---

## Folder Structure

```
EduRecord/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosInstance.js   ← Centralised Axios config
│   │   │   └── students.js        ← API call functions
│   │   ├── components/
│   │   │   ├── StudentForm.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── StatsCards.jsx
│   │   │   └── Toast.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env                       ← Local only (gitignored)
│   ├── .env.example
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   └── Student.js         ← Mongoose schema
│   │   ├── routes/
│   │   │   ├── students.js        ← CRUD routes
│   │   │   └── stats.js           ← Aggregation stats
│   │   └── server.js              ← Express entry point
│   ├── .env                       ← Local only (gitignored)
│   └── .env.example
├── .gitignore
└── README.md
```

---

## API Endpoints

| Method | Endpoint            | Description                        |
|--------|---------------------|------------------------------------|
| GET    | /api/health         | Health check with DB status        |
| GET    | /api/students       | Get all students (search, filter)  |
| GET    | /api/students/:id   | Get single student by MongoDB ID   |
| POST   | /api/students       | Create a new student               |
| PUT    | /api/students/:id   | Update a student                   |
| DELETE | /api/students/:id   | Delete a student                   |
| GET    | /api/stats          | Dashboard statistics (aggregation) |

### Query Parameters for GET /api/students

| Param      | Type   | Description                              |
|------------|--------|------------------------------------------|
| search     | string | Search in name, studentId, email         |
| department | string | Filter by department (CSE, ECE, etc.)    |
| year       | number | Filter by year of study (1–4)            |

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/edurecord?retryWrites=true&w=majority
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=development
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000
```

> **For production**, set `VITE_API_URL=https://your-backend.onrender.com` in Vercel's environment settings.

---

## API Configuration Explanation

The frontend uses a **centralised Axios instance** (`src/api/axiosInstance.js`) with:

- `baseURL` set from `import.meta.env.VITE_API_URL` — the single source of truth for the backend URL.
- A `timeout` of 10 seconds to surface slow or unreachable backends clearly.
- **Request interceptors** for logging and **response interceptors** to convert raw network errors into human-readable messages (e.g., detecting CORS errors vs. network failures).

This means changing the backend URL only requires updating one environment variable, never touching source code.

---

## CORS Explanation

**What CORS is:** Cross-Origin Resource Sharing is a browser security mechanism that blocks frontend JavaScript from making requests to a different origin (protocol + domain + port) unless the server explicitly allows it.

**Why it matters here:** Vercel serves the frontend from `https://your-app.vercel.app` and Render serves the backend from `https://your-backend.onrender.com`. These are different origins — the browser will block the request unless the backend sends the right `Access-Control-Allow-Origin` header.

**Our solution** (`server.js`):

```js
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,   // ← Vercel URL set via env variable
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.options('*', cors()); // Handle preflight requests
```

---

## Database Connectivity Explanation

MongoDB Atlas is a cloud-hosted MongoDB service. Connectivity requires:

1. **Connection string** in `MONGODB_URI` env var (never hardcoded).
2. **IP Whitelist** in Atlas: Add `0.0.0.0/0` (allow all) for Render (dynamic IPs) or Render's static outbound IPs.
3. **Database user** with read/write permissions.
4. **Mongoose connection** with error handling and `process.exit(1)` on failure to prevent the server from running without a database.

---

## Possible Causes of the Original Issue and Solutions

### 1. CORS Not Configured (Most Common)

**Cause:** Backend does not send `Access-Control-Allow-Origin` header, or it only allows `*` without `credentials: true`.

**Symptoms:** Browser DevTools shows `CORS error` or `No 'Access-Control-Allow-Origin' header`.

**Solution:** Configure the `cors` middleware with an explicit allowlist of Vercel domains. Never use `origin: '*'` with `credentials: true` (this is a browser security restriction).

---

### 2. Wrong API URL in Frontend (Second Most Common)

**Cause:** `VITE_API_URL` is not set in Vercel's environment settings, so it falls back to `localhost:5000` — which does not exist on Vercel's servers.

**Symptoms:** Network requests go to `http://localhost:5000/api/...` and fail with ERR_CONNECTION_REFUSED or ERR_NAME_NOT_RESOLVED.

**Solution:** In Vercel → Settings → Environment Variables, set:
```
VITE_API_URL = https://your-backend.onrender.com
```
Then redeploy (Vite bakes env vars into the bundle at build time, so a redeploy is required after changing them).

---

### 3. MongoDB Atlas IP Not Whitelisted

**Cause:** Render uses dynamic outbound IPs. Atlas by default only allows specific IPs.

**Symptoms:** Backend starts but all API calls time out or return 500 errors with `MongooseServerSelectionError`.

**Solution:** In MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere (`0.0.0.0/0`). For production security, use Render's static IP add-on or a VPC.

---

### 4. Render Backend Sleeping (Free Tier)

**Cause:** Render's free tier spins down services after 15 minutes of inactivity. The first request after sleep takes 30–60 seconds to respond.

**Symptoms:** Initial API call times out, then subsequent calls work fine.

**Solution:** Use Render's paid tier, add an uptime monitor (e.g., UptimeRobot), or increase the Axios timeout.

---

### 5. Environment Variables Not Set in Render

**Cause:** `MONGODB_URI` or `FRONTEND_URL` not set in Render's environment settings.

**Symptoms:** Backend crashes on startup with `MongooseError` or CORS rejects all origins.

**Solution:** In Render → Environment → Add all variables from `backend/.env.example`.

---

### 6. Preflight Requests Not Handled

**Cause:** Browser sends an HTTP OPTIONS preflight before POST/PUT/DELETE. If the server doesn't respond correctly to OPTIONS, the actual request never fires.

**Solution:** `app.options('*', cors())` — explicitly handle all preflight requests before other routes.

---

### 7. HTTPS vs HTTP Mismatch

**Cause:** Vercel forces HTTPS. If `VITE_API_URL` points to an HTTP backend, browsers block the request as "mixed content".

**Solution:** Render provides HTTPS by default on custom domains. Ensure `VITE_API_URL` uses `https://`.

---

## Local Setup

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Atlas account (free tier is sufficient)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/EduRecord.git
cd EduRecord

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env — fill in your MONGODB_URI

# Frontend
cp frontend/.env.example frontend/.env
# VITE_API_URL=http://localhost:5000 (default for local dev)
```

### 3. Run Locally

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# → Server on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# → App on http://localhost:5173
```

---

## Deployment

### Backend → Render

1. Push code to GitHub.
2. Create a new **Web Service** on Render, connect your GitHub repo.
3. Set **Root Directory** to `backend`.
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node src/server.js`
6. Add **Environment Variables**:
   - `MONGODB_URI` — your Atlas connection string
   - `FRONTEND_URL` — your Vercel app URL (e.g. `https://edu-record.vercel.app`)
   - `NODE_ENV` — `production`
7. Deploy. Copy the Render URL (e.g. `https://edurecord-api.onrender.com`).

### Frontend → Vercel

1. Create a new project on Vercel, import your GitHub repo.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite**.
4. Add **Environment Variable**:
   - `VITE_API_URL` = your Render backend URL
5. Deploy.
6. Copy the Vercel URL and update `FRONTEND_URL` in Render, then redeploy the backend.

### MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user with read/write access.
3. Under Network Access → Add IP Address → Allow from Anywhere.
4. Get the connection string from Connect → Drivers → Node.js.
5. Replace `<username>`, `<password>`, and `<cluster>` in the connection string.

---

## Health Check

After deployment, verify your backend is running:

```
GET https://your-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "EduRecord API is running",
  "environment": "production",
  "database": "connected"
}
```
