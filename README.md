# 🎓 Student Records Management System
### Full-Stack Architecture: React (Vercel) + Express.js (Render) + MongoDB Atlas

[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green?logo=node.js)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb)](https://cloud.mongodb.com/)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel%20%2B%20Render-black)](https://vercel.com/)

---

## 📌 Problem Statement & Context

> **Problem (Q6):**  
> *"A React frontend deployed on Vercel is unable to retrieve student records from an Express.js backend deployed on Render. Analyse the possible causes and implement appropriate solutions involving API configuration, environment variables, CORS and database connectivity."*

This repository delivers a **production-ready, full-stack Student Records Management System** engineered specifically to resolve and demonstrate solutions for cross-origin cloud integrations between **Vercel** and **Render** backed by **MongoDB Atlas**.

---

## 🏗️ Architecture & Request Flow

```mermaid
flowchart LR
    subgraph VercelEdge ["Vercel Edge Network (Frontend)"]
        UserBrowser["React 18 SPA (Vite)"]
        VercelConfig["vercel.json (SPA Rewrites)"]
    end

    subgraph RenderCloud ["Render Web Service (Backend)"]
        CORSFilter["CORS Middleware (Whitelist + Preflight)"]
        ExpressApp["Express.js REST API (:PORT)"]
        HealthEndpoint["GET /api/health"]
    end

    subgraph CloudDB ["MongoDB Atlas"]
        MongooseODM["Mongoose Connection"]
        StudentCollection[("Students Collection")]
    end

    UserBrowser -->|"1. Preflight OPTIONS /api/students"| CORSFilter
    CORSFilter -->|"2. 200 OK + Access-Control-Allow-Origin"| UserBrowser
    UserBrowser -->|"3. GET/POST/PUT/DELETE /api/students"| ExpressApp
    ExpressApp -->|"4. Mongoose Query (0.0.0.0/0 Whitelisted)"| StudentCollection
    StudentCollection -->|"5. Return Student Documents"| ExpressApp
    ExpressApp -->|"6. JSON Response"| UserBrowser
```

---

## 📂 Project Structure

```text
student-management-system/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB Atlas connection manager with lifecycle events
│   ├── controllers/
│   │   └── studentController.js   # Full CRUD, analytics, seeding, & resilient fallback
│   ├── middleware/
│   │   ├── corsConfig.js          # Dynamic CORS origin whitelist & preflight options
│   │   └── errorHandler.js        # Uniform JSON errors (Validation, Duplicate, CORS)
│   ├── models/
│   │   └── Student.js             # Mongoose Schema with strict validation & indexes
│   ├── routes/
│   │   ├── healthRoutes.js        # GET /api/health diagnostic probe
│   │   └── studentRoutes.js       # REST route mappings for /api/students
│   ├── scripts/
│   │   ├── seed.js                # Standalone database seeding script
│   │   └── test-api.js            # Automated test suite covering all 5 endpoints + CORS
│   ├── .env.example               # Backend environment template
│   ├── package.json               # Backend dependencies and scripts
│   ├── render.yaml                # Render Infrastructure-as-Code Blueprint
│   └── server.js                  # Express initialization, middleware, & graceful shutdown
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AlertToast.jsx          # Notification toast (success, error, warning)
│   │   │   ├── DeleteConfirmModal.jsx  # Confirmation modal before deletion
│   │   │   ├── ErrorBanner.jsx         # Connection failure diagnostics banner
│   │   │   ├── Navbar.jsx              # Header with live backend health indicator
│   │   │   ├── StatsCards.jsx          # Metric cards (students, depts, GPA, cloud state)
│   │   │   ├── StudentModal.jsx        # Add & Edit modal with field-level validation
│   │   │   └── StudentTable.jsx        # Table, live search, filters, actions, quick view
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx       # Overview, charts, honor roll, pipeline matrix
│   │   │   ├── StudentsPage.jsx        # Student records manager & CRUD lifecycle
│   │   │   └── TroubleshootingPage.jsx # Interactive live probe + 10 failure solutions
│   │   ├── services/
│   │   │   └── api.js                  # Centralized fetch wrapper with error classification
│   │   ├── App.jsx                     # Top-level state coordinator
│   │   ├── index.css                   # Custom animation keyframes and scrollbars
│   │   └── main.jsx                    # React 18 DOM mount point
│   ├── .env.example                    # Frontend environment template
│   ├── index.html                      # App shell with Tailwind CSS & Google Fonts
│   ├── package.json                    # Frontend dependencies and Vite build scripts
│   └── vercel.json                     # Vercel SPA routing rewrite rules
│
├── docs/
│   ├── CORS_AND_DEPLOYMENT_ANALYSIS.md # Detailed technical breakdown of all 10 causes
│   ├── RENDER_DEPLOYMENT_GUIDE.md      # Step-by-step backend deployment manual
│   └── VERCEL_DEPLOYMENT_GUIDE.md      # Step-by-step frontend deployment manual
└── README.md                           # Master project documentation
```

---

## ⚡ Quick Start: Running Locally

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- *(Optional)* **MongoDB Atlas** account (or use built-in fallback mode)

### 2. Start the Backend Server
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# (Optional) Edit .env with your MongoDB Atlas URI:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/student_db?retryWrites=true&w=majority

# Start Express in development mode
npm start
```
The backend will start at `http://localhost:5000`.  
Verify health: `http://localhost:5000/api/health`

### 3. Start the Frontend Dashboard
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start Vite dev server
npm run dev
```
The frontend will start at `http://localhost:5173`.  
Open `http://localhost:5173` in your browser.

---

## 🧪 Automated API Testing

A self-contained automated test suite is included in `backend/scripts/test-api.js`. It runs natively using Node's built-in `fetch` and tests:
- `GET /` (Root API status)
- `GET /api/health` (Database state and CORS whitelist check)
- `OPTIONS /api/students` (Preflight CORS verification for Vercel origin)
- `GET /api/students` (List all records)
- `POST /api/students` (Create record with validation)
- Duplicate rejection (`409 Conflict`) & missing field rejection (`400 Bad Request`)
- `GET /api/students/:id` (Fetch by ID)
- `PUT /api/students/:id` (Update record)
- `DELETE /api/students/:id` (Delete record and confirm 404 on subsequent fetch)
- `GET /api/students/stats/summary` (Analytics calculations)

To run the automated test suite:
```bash
cd backend
npm test
# or: node scripts/test-api.js
```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Request Body / Query | Status Code |
|---|---|---|---|---|
| `GET` | `/` | API status & endpoint directory | None | `200 OK` |
| `GET` | `/api/health` | Backend & MongoDB health probe | None | `200 OK` |
| `GET` | `/api/students` | Retrieve all students | `?search=term&department=CS&year=3rd` | `200 OK` |
| `GET` | `/api/students/:id` | Retrieve single student by ID | None | `200 OK` / `404 Not Found` |
| `POST` | `/api/students` | Create new student | `{ studentId, name, email, department, year, gpa }` | `201 Created` / `400` / `409` |
| `PUT` | `/api/students/:id` | Update student information | `{ name, department, year, gpa, status }` | `200 OK` / `400` / `404` |
| `DELETE` | `/api/students/:id` | Delete student record | None | `200 OK` / `404 Not Found` |
| `GET` | `/api/students/stats/summary` | Aggregate dashboard stats | None | `200 OK` |
| `POST` | `/api/students/seed` | Seed default sample students | None | `201 Created` |

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example Value |
|---|---|---|
| `PORT` | Port for Express server (Render injects automatically) | `5000` |
| `NODE_ENV` | Runtime environment (`development` or `production`) | `development` |
| `MONGODB_URI` | MongoDB Atlas SRV connection string | `mongodb+srv://user:pass@cluster0.net/student_db` |
| `FRONTEND_URL` | Allowed frontend origins (comma-separated) | `http://localhost:5173,https://your-app.vercel.app` |

### Frontend (`frontend/.env`)
| Variable | Description | Example Value |
|---|---|---|
| `VITE_API_URL` | Base API URL including `/api` (no trailing slash) | `http://localhost:5000/api` |

---

## 🚀 Cloud Deployment

### Backend -> Render
1. Push code to GitHub.
2. In [Render Dashboard](https://dashboard.render.com/), create a new **Web Service**.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `npm install` and **Start Command** to `node server.js`.
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas connection URI>`
   - `FRONTEND_URL`: `https://<your-vercel-app>.vercel.app`
6. In **Advanced Settings**, set **Health Check Path** to `/api/health`.

### Frontend -> Vercel
1. In [Vercel Dashboard](https://vercel.com/), click **Add New...** -> **Project**.
2. Select your GitHub repository.
3. Set **Root Directory** to `frontend`.
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://<your-render-service>.onrender.com/api`
5. Click **Deploy**.

*(See [docs/RENDER_DEPLOYMENT_GUIDE.md](docs/RENDER_DEPLOYMENT_GUIDE.md) and [docs/VERCEL_DEPLOYMENT_GUIDE.md](docs/VERCEL_DEPLOYMENT_GUIDE.md) for complete details).*

---

## 🔍 Key Troubleshooting Solutions (The 10 Failure Points)

| # | Failure Point | Root Cause | Verified Fix |
|---|---|---|---|
| 1 | **Incorrect API URL** | Missing `/api` prefix or typo | Centralized URL resolution in `frontend/src/services/api.js` stripping trailing slashes |
| 2 | **Missing Env Vars** | Variables missing `VITE_` prefix | Prefix frontend variables with `VITE_` and redeploy Vercel after editing settings |
| 3 | **CORS Policy Errors** | Preflight `OPTIONS` blocked or origin not allowed | `corsConfig.js` dynamically whitelisting `*.vercel.app` and handling `app.options('*', cors)` |
| 4 | **MongoDB Connection Failures** | Atlas firewall blocking Render dynamic IPs | In Atlas Network Access, set IP access to `0.0.0.0/0` (Allow from anywhere) |
| 5 | **Incorrect Endpoint Paths** | Route mismatch between client and server | Unified route paths under `/api/students` and structured 404 JSON response |
| 6 | **Server Not Running (Cold Starts)** | Render free tier spins down after 15m | Frontend health polling (`/api/health`) with user-friendly waking banner |
| 7 | **Frontend Calling Localhost** | Hardcoded `localhost` in components | Read from `import.meta.env.VITE_API_URL` exclusively |
| 8 | **Database Auth Failures** | Special characters in DB password | Percent-encode special characters (e.g. `@` -> `%40`) in `MONGODB_URI` |
| 9 | **Render Startup Errors** | Hardcoded port 5000 | Bind to `process.env.PORT || 5000` on host `0.0.0.0` |
| 10 | **Vercel SPA 404 on Refresh** | Server looking for static file | Added `vercel.json` rewrite rule directing all routes to `/index.html` |

*(See [docs/CORS_AND_DEPLOYMENT_ANALYSIS.md](docs/CORS_AND_DEPLOYMENT_ANALYSIS.md) for full deep-dive).*
