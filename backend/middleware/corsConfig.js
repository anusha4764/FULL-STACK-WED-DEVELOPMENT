const cors = require('cors');

/**
 * Robust CORS Configuration for Vercel Frontend + Render Backend
 * 
 * Common Causes of CORS failures solved here:
 * 1. Missing Access-Control-Allow-Origin header on responses.
 * 2. Preflight (OPTIONS) request failing or returning 404/405 before the main request.
 * 3. Exact origin mismatch (e.g. trailing slash in URL, or http vs https).
 * 4. Vercel deployment generates preview URLs (e.g. my-app-hash.vercel.app) that get blocked if only production is whitelisted.
 */

const getOriginWhitelist = () => {
  const envOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
    : [];

  const defaultLocalOrigins = [
    'http://localhost:5173', // Vite dev server
    'http://127.0.0.1:5173',
    'http://localhost:3000', // React CRA default
    'http://localhost:4173', // Vite preview
  ];

  return [...new Set([...defaultLocalOrigins, ...envOrigins])];
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server requests or tools like Postman/cURL (where origin is undefined)
    if (!origin) {
      return callback(null, true);
    }

    const whitelist = getOriginWhitelist();
    const cleanOrigin = origin.replace(/\/$/, '');

    // 1. Direct match in whitelist
    if (whitelist.includes(cleanOrigin)) {
      return callback(null, true);
    }

    // 2. Allow any valid Vercel deployment preview or production domain
    // Example: https://student-management-frontend.vercel.app or https://branch-user.vercel.app
    const isVercelDomain = /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(cleanOrigin);
    if (isVercelDomain) {
      return callback(null, true);
    }

    // 3. In development mode, allow all origins with warning
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[CORS NOTICE] Allowed unwhitelisted origin in development: ${origin}`);
      return callback(null, true);
    }

    console.error(`[CORS BLOCKED] Origin "${origin}" is not authorized by CORS policy.`);
    console.error(`[CORS INFO] Allowed origins: ${whitelist.join(', ')}`);
    return callback(
      new Error(`CORS Error: Origin ${origin} is not allowed by Access-Control-Allow-Origin`)
    );
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400, // 24 hours preflight cache
  optionsSuccessStatus: 200, // Important for legacy browsers / some proxies
};

module.exports = {
  corsMiddleware: cors(corsOptions),
  corsOptions,
  getOriginWhitelist,
};
