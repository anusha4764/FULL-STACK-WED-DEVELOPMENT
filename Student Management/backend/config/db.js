const mongoose = require('mongoose');

/**
 * MongoDB Atlas & Local Database Connection Manager
 * Manages Mongoose lifecycle events, connectivity diagnostics, and error reporting.
 */

let lastError = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  lastError = null;

  if (!uri || !uri.trim()) {
    const errorMsg = 'MONGODB_URI environment variable is missing or empty in backend/.env.';
    lastError = errorMsg;
    console.error('\n❌ [DATABASE CONFIGURATION ERROR]');
    console.error(`   ${errorMsg}`);
    console.error('👉 For MongoDB Atlas: Set MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/student_db?retryWrites=true&w=majority');
    console.error('👉 For Local MongoDB: Set MONGODB_URI=mongodb://127.0.0.1:27017/student_db\n');
    return false;
  }

  const isAtlas = uri.startsWith('mongodb+srv://');
  const dbType = isAtlas ? 'MongoDB Atlas (Cloud)' : 'MongoDB Server (Local)';

  try {
    console.log(`\n📡 Connecting to ${dbType}...`);
    
    // Disconnect any existing connection before reconnecting
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    const conn = await mongoose.connect(uri.trim(), {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging
    });

    console.log(`✅ ${dbType} Connected Successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Port: ${conn.connection.port || 'Default'}`);
    console.log(`   Database Name: ${conn.connection.name}\n`);
    lastError = null;
    return true;
  } catch (error) {
    lastError = error.message;
    console.error(`\n❌ [${dbType.toUpperCase()} CONNECTION FAILED]`);
    console.error(`   Error Message: ${error.message}`);
    console.error('\n🔍 [DIAGNOSTIC CHECKLIST FOR THIS ERROR]:');
    if (isAtlas) {
      console.error('   1. IP Access List: In MongoDB Atlas -> Network Access -> Ensure 0.0.0.0/0 is added.');
      console.error('   2. Database User: Ensure database user exists in Atlas Database Access with read/write permissions.');
      console.error('   3. Special Characters: If password contains special characters (@, #, %), URL-encode them.');
      console.error('   4. Network: Ensure firewall permits outbound port 27017 connections.');
    } else {
      console.error('   1. Service: Ensure MongoDB service is running (e.g. net start MongoDB).');
      console.error('   2. Host & Port: Ensure MongoDB is listening on 127.0.0.1:27017.');
    }
    console.error('\n');
    return false;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB connection lost. Reconnect will be attempted...');
});

mongoose.connection.on('reconnected', () => {
  lastError = null;
  console.log('✅ MongoDB connection re-established.');
});

mongoose.connection.on('error', (err) => {
  lastError = err.message;
  console.error('❌ Mongoose connection event error:', err.message);
});

const getConnectionStatus = () => {
  const readyState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const uri = process.env.MONGODB_URI || '';
  const isAtlas = uri.startsWith('mongodb+srv://');
  const connectionType = isAtlas
    ? 'MongoDB Atlas (Cloud)'
    : uri.startsWith('mongodb://')
    ? 'MongoDB Server (Local)'
    : 'None';

  return {
    state: states[readyState] || 'unknown',
    connected: readyState === 1,
    connectionType,
    host: readyState === 1 ? mongoose.connection.host : null,
    port: readyState === 1 ? mongoose.connection.port || null : null,
    dbName: readyState === 1 ? mongoose.connection.name : null,
    error: lastError,
    uriConfigured: Boolean(uri && uri.trim()),
  };
};

module.exports = { connectDB, getConnectionStatus };
