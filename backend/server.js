require('dotenv').config();
const express = require('express');
const { connectDB } = require('./config/db');
const { corsMiddleware } = require('./middleware/corsConfig');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const studentRoutes = require('./routes/studentRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. Core Middleware Configuration
// ==========================================

// Apply CORS with custom origin whitelist and header support
app.use(corsMiddleware);

// Explicitly handle CORS preflight for all routes
app.options('*', corsMiddleware);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware for debugging API calls
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// ==========================================
// 2. API Routes
// ==========================================

// Root welcome & API info endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    project: 'Student Records Management API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: 'GET /api/health',
      getAllStudents: 'GET /api/students',
      getStudentById: 'GET /api/students/:id',
      createStudent: 'POST /api/students',
      updateStudent: 'PUT /api/students/:id',
      deleteStudent: 'DELETE /api/students/:id',
      statistics: 'GET /api/students/stats/summary',
      seedDatabase: 'POST /api/students/seed',
    },
    documentation: 'Designed for Vercel Frontend + Render Backend integration',
  });
});

// Health check endpoint (Used by Render liveness checks and Frontend diagnostic panel)
app.use('/api/health', healthRoutes);

// Student resource endpoints
app.use('/api/students', studentRoutes);

// ==========================================
// 3. Error Handling Middleware
// ==========================================

// Catch 404 for undefined routes
app.use(notFoundHandler);

// Central error handler
app.use(errorHandler);

// ==========================================
// 4. Server Initialization & Database Connect
// ==========================================

const startServer = async () => {
  // 1. Connect to MongoDB before starting server
  const dbConnected = await connectDB();

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('====================================================');
    console.log(`🚀 Express Backend Server Running!`);
    console.log(`📡 Local Port: http://localhost:${PORT}`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🎓 Students API: http://localhost:${PORT}/api/students`);
    console.log(`🗄️ Database Connected: ${dbConnected ? 'YES' : 'NO (Check MONGODB_URI)'}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('====================================================\n');
  });

  // Graceful shutdown handling for Render dyno restarts
  const handleShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Gracefully shutting down Express server...`);
    server.close(() => {
      console.log('💤 Express server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer();

module.exports = app;
