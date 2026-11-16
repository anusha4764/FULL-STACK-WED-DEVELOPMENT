import React, { useState } from 'react';
import { API_BASE_URL, apiService } from '../services/api';

const TROUBLESHOOTING_ISSUES = [
  {
    id: 1,
    title: '1. Incorrect API URL',
    category: 'API Configuration',
    severity: 'High',
    symptom: 'Fetch calls return 404 Not Found or ERR_NAME_NOT_RESOLVED.',
    cause: 'Typo in Render URL, missing "/api" prefix, missing "https://", or trailing slash discrepancies.',
    solution: 'Verify the Render backend service URL. In Vite, set VITE_API_URL=https://<your-render-service>.onrender.com/api in both local .env and Vercel Project Settings.',
    code: `// frontend/src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Always ensure base URL strips accidental trailing slashes:
const cleanUrl = API_BASE_URL.replace(/\\/$/, '');`,
  },
  {
    id: 2,
    title: '2. Missing Environment Variables',
    category: 'Environment Variables',
    severity: 'Critical',
    symptom: 'import.meta.env.VITE_API_URL evaluates to undefined in production, causing fetch calls to "/undefined/students".',
    cause: 'In Vite, variables not starting with "VITE_" are intentionally excluded from client bundle for security. Or variable was not added in Vercel Dashboard.',
    solution: 'Prefix frontend variables with "VITE_". In Vercel: Settings -> Environment Variables -> Add VITE_API_URL. Note: Vite bakes env vars at build time, so you must redeploy after updating them!',
    code: `# frontend/.env
VITE_API_URL=https://student-records-backend.onrender.com/api

# backend/.env
PORT=5000
MONGODB_URI=mongodb+srv://...
FRONTEND_URL=https://student-management.vercel.app`,
  },
  {
    id: 3,
    title: '3. CORS Policy Errors',
    category: 'CORS Configuration',
    severity: 'Critical',
    symptom: 'Console displays: "Access to fetch at \'...\' from origin \'https://...vercel.app\' has been blocked by CORS policy: No \'Access-Control-Allow-Origin\' header is present on the requested resource."',
    cause: 'Express backend did not whitelist the Vercel frontend origin, or preflight (OPTIONS) request returned an unhandled 404/405.',
    solution: 'Configure Express CORS middleware with dynamic origin validation that permits your Vercel deployment and supports preflight options.',
    code: `// backend/middleware/corsConfig.js
const cors = require('cors');
app.use(cors({
  origin: (origin, callback) => {
    const whitelist = [process.env.FRONTEND_URL, 'http://localhost:5173'];
    if (!origin || whitelist.includes(origin) || /\\.vercel\\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked for ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.options('*', cors()); // Preflight handler`,
  },
  {
    id: 4,
    title: '4. MongoDB Connection Failures',
    category: 'Database Connectivity',
    severity: 'Critical',
    symptom: 'Backend logs "MongooseServerSelectionError: connect ECONNREFUSED" or server crashes on startup.',
    cause: 'MongoDB Atlas Network Access does not allow Render IP addresses. Render uses dynamic IPs, so requests are dropped by the Atlas firewall.',
    solution: 'Go to MongoDB Atlas -> Security -> Network Access -> Add IP Address -> Choose "Allow Access From Anywhere" (0.0.0.0/0).',
    code: `// MongoDB Atlas Network Access configuration:
Entry: 0.0.0.0/0
Comment: Allow Render Cloud backend dynamic instances

// Mongoose connection timeout configuration:
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000 // Fast fail rather than hang indefinitely
});`,
  },
  {
    id: 5,
    title: '5. Incorrect API Endpoint Paths',
    category: 'API Configuration',
    severity: 'Medium',
    symptom: 'Request to /students returns 404 with HTML error page.',
    cause: 'Frontend calls "/students" while Express routes are mounted under "/api/students".',
    solution: 'Ensure all routes are consistently prefixed with /api in backend server.js and centralized in api.js.',
    code: `// backend/server.js
app.use('/api/students', studentRoutes);

// frontend/src/services/api.js
export const getStudents = () => fetch(\`\${API_BASE_URL}/students\`);`,
  },
  {
    id: 6,
    title: '6. Backend Server Not Running (Render Cold Starts)',
    category: 'Render Deployment',
    severity: 'High',
    symptom: 'First request takes 50+ seconds or times out with 502/504 Gateway Timeout.',
    cause: 'Render Free Tier Web Services automatically spin down after 15 minutes of inactivity. The server requires 40-60 seconds to spin up on cold start.',
    solution: 'Implement retry logic with a timeout banner in the React frontend, informing the user that Render is waking up. Provide a manual "Ping Backend" button.',
    code: `// Frontend retry and health polling
const pingBackend = async () => {
  setIsWakingUp(true);
  try {
    await apiService.checkHealth();
  } catch (err) {
    // Keep showing cold-start spinner
  }
};`,
  },
  {
    id: 7,
    title: '7. Frontend Calling Localhost in Production',
    category: 'Environment Variables',
    severity: 'Critical',
    symptom: 'Network tab on deployed Vercel site shows requests to http://localhost:5000/api/students (Failed to connect).',
    cause: 'VITE_API_URL was hardcoded or missing in Vercel environment settings, falling back to local default.',
    solution: 'Never hardcode localhost in components. Ensure VITE_API_URL is configured in Vercel Environment Variables and trigger a fresh build.',
    code: `// BAD:
fetch('http://localhost:5000/api/students')

// GOOD:
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
fetch(\`\${API_URL}/students\`);`,
  },
  {
    id: 8,
    title: '8. Missing or Incorrect Database Credentials',
    category: 'Database Connectivity',
    severity: 'High',
    symptom: 'MongoServerError: bad auth : authentication failed.',
    cause: 'Wrong database username/password, or password contains special characters like "@", "#", "%" that break MongoDB URI parser.',
    solution: 'URL-encode special characters in the Atlas password (e.g. replace "@" with "%40", "#" with "%23"). Ensure database user exists in Atlas Database Access tab.',
    code: `// If password is: P@ss#123
// MongoDB URI should encode special characters:
MONGODB_URI=mongodb+srv://admin:P%40ss%23123@cluster0.abcde.mongodb.net/student_records?retryWrites=true&w=majority`,
  },
  {
    id: 9,
    title: '9. Render Deployment or Server Startup Errors',
    category: 'Render Deployment',
    severity: 'High',
    symptom: 'Render build fails or service continuously crashes with "Port already in use" or "Failed to bind to port".',
    cause: 'Hardcoding port 5000 in server.js instead of using dynamic process.env.PORT assigned by Render, or missing "start" script in package.json.',
    solution: 'Listen on process.env.PORT || 5000 and bind to "0.0.0.0". Ensure package.json defines "start": "node server.js".',
    code: `// backend/server.js
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Server listening on dynamic port \${PORT}\`);
});`,
  },
  {
    id: 10,
    title: '10. Incorrect Frontend Build Configuration',
    category: 'Vercel Deployment',
    severity: 'Medium',
    symptom: 'Navigating directly to a route (e.g. /students) on Vercel returns 404 NOT_FOUND.',
    cause: 'Single Page Applications (SPA) require all URL requests to be rewritten to /index.html so React Router / state can handle client routing.',
    solution: 'Add vercel.json in frontend root directory configuring rewrites.',
    code: `// frontend/vercel.json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`,
  },
];

export const TroubleshootingPage = ({ healthStatus, onRefreshHealth }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(3); // Expand CORS by default
  const [diagnosticsOutput, setDiagnosticsOutput] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const categories = ['All', 'API Configuration', 'CORS Configuration', 'Database Connectivity', 'Environment Variables', 'Render Deployment', 'Vercel Deployment'];

  const filteredIssues =
    selectedCategory === 'All'
      ? TROUBLESHOOTING_ISSUES
      : TROUBLESHOOTING_ISSUES.filter((i) => i.category === selectedCategory);

  const runLiveTest = async () => {
    setIsTesting(true);
    const startTime = performance.now();
    try {
      const result = await apiService.checkHealth();
      const endTime = performance.now();
      setDiagnosticsOutput({
        success: true,
        responseTimeMs: Math.round(endTime - startTime),
        data: result,
      });
      if (onRefreshHealth) onRefreshHealth();
    } catch (err) {
      const endTime = performance.now();
      setDiagnosticsOutput({
        success: false,
        responseTimeMs: Math.round(endTime - startTime),
        error: {
          message: err.message,
          endpoint: err.endpoint || `${API_BASE_URL}/health`,
          isNetworkError: err.isNetworkError,
        },
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2 border border-indigo-150">
          <span>Root Cause Analysis & Architecture Solutions</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Cloud Integration Diagnostics & Solutions
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Comprehensive diagnostic analysis resolving why a React frontend on Vercel is unable
          to retrieve student records from an Express backend on Render.
        </p>
      </div>

      {/* Live System Diagnostics Tester Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <span>Live API & CORS Probe</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulates a cross-origin probe from this browser to your backend
            </p>
          </div>

          <button
            onClick={runLiveTest}
            disabled={isTesting}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            {isTesting && (
              <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{isTesting ? 'Pinging Backend...' : 'Execute Live Probe'}</span>
          </button>
        </div>

        {/* Configuration Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Configured Base URL</span>
            <code className="text-indigo-600 font-bold break-all">{API_BASE_URL}</code>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Health Probe Target</span>
            <code className="text-slate-700 font-bold break-all">{API_BASE_URL}/health</code>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Database Connectivity</span>
            <span
              className={`font-bold ${
                healthStatus?.database?.connected ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {healthStatus?.database?.connected
                ? `${healthStatus?.database?.connectionType || 'MongoDB'} Connected (${healthStatus?.database?.host || 'Active'})`
                : 'Disconnected (Check MONGODB_URI)'}
            </span>
          </div>
        </div>

        {/* Probe Output */}
        {diagnosticsOutput && (
          <div
            className={`p-4 rounded-xl text-xs font-mono border ${
              diagnosticsOutput.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-2 pb-2 border-b border-current/10">
              <span>{diagnosticsOutput.success ? '✅ Probe Succeeded' : '❌ Probe Blocked / Failed'}</span>
              <span>Latency: {diagnosticsOutput.responseTimeMs}ms</span>
            </div>
            <pre className="whitespace-pre-wrap overflow-x-auto text-[11px] leading-relaxed">
              {JSON.stringify(diagnosticsOutput.data || diagnosticsOutput.error, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* 10 Problem Scenarios & Solutions Matrix */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Top 10 Causes & Solutions Directory
          </h2>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredIssues.map((issue) => {
            const isExpanded = expandedId === issue.id;

            return (
              <div
                key={issue.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs transition-all"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        issue.severity === 'Critical'
                          ? 'bg-rose-100 text-rose-700'
                          : issue.severity === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{issue.title}</h3>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span className="hidden sm:inline px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[11px]">
                      {issue.category}
                    </span>
                    <svg
                      className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 text-xs space-y-3 bg-slate-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-white border border-slate-200">
                        <span className="font-semibold text-rose-600 block mb-1">
                          ⚠️ Observed Symptoms:
                        </span>
                        <p className="text-slate-600 leading-relaxed">{issue.symptom}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-white border border-slate-200">
                        <span className="font-semibold text-amber-600 block mb-1">
                          🔍 Root Cause:
                        </span>
                        <p className="text-slate-600 leading-relaxed">{issue.cause}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-950">
                      <span className="font-bold text-emerald-800 block mb-1">
                        ✅ Verified Fix & Implementation:
                      </span>
                      <p className="leading-relaxed">{issue.solution}</p>
                    </div>

                    {issue.code && (
                      <div className="mt-2">
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mb-1">
                          <span>SOLUTION CODE REFERENCE</span>
                        </div>
                        <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto font-mono text-[11px] leading-relaxed">
                          {issue.code}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TroubleshootingPage;
