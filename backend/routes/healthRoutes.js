const express = require('express');
const router = express.Router();
const { getConnectionStatus } = require('../config/db');
const { getOriginWhitelist } = require('../middleware/corsConfig');

/**
 * @route   GET /api/health
 * @desc    Comprehensive backend & database health diagnostic check
 * @access  Public
 */
router.get('/', (req, res) => {
  const dbStatus = getConnectionStatus();
  const uptimeSeconds = Math.floor(process.uptime());
  const isHealthy = dbStatus.connected;

  res.status(200).json({
    status: isHealthy ? 'healthy' : 'degraded',
    message: isHealthy
      ? `Express server and ${dbStatus.connectionType} are operational.`
      : 'Express server is running; MongoDB is disconnected. Check MONGODB_URI and database connectivity.',
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds} seconds`,
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    database: {
      connected: dbStatus.connected,
      state: dbStatus.state,
      connectionType: dbStatus.connectionType,
      host: dbStatus.host || 'N/A',
      port: dbStatus.port || 'N/A',
      dbName: dbStatus.dbName || 'N/A',
      error: dbStatus.error || null,
      uriConfigured: dbStatus.uriConfigured,
    },
    cors: {
      allowedOrigins: getOriginWhitelist(),
    },
  });
});

module.exports = router;
