/**
 * ===============================================
 * BACKEND SERVER - Express + MongoDB Weather API
 * ===============================================
 * Main entry point for the weather application backend.
 * Handles all API requests from the React frontend.
 */

require('dotenv').config(); // Load environment variables from .env file
const express = require('express'); // Web framework
const cors = require('cors'); // Cross-origin resource sharing
const { MongoClient } = require('mongodb'); // MongoDB database client

const app = express(); // Initialize Express application
const PORT = process.env.PORT || 5000; // Server port (default: 5000)

/**
 * ========== MIDDLEWARE CONFIGURATION ==========
 * These middleware functions process all incoming requests
 */

// Enable CORS to allow requests from React frontend at localhost:3000
app.use(cors({ origin: 'http://localhost:3000' }));

// Parse incoming JSON request bodies
app.use(express.json());

// Parse incoming URL-encoded form data
app.use(express.urlencoded({ extended: true }));

/**
 * ========== HEALTH CHECK ENDPOINT ==========
 * Simple GET endpoint to verify server is running
 * Used for debugging and connection validation
 */
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: '✅ Weather Backend Running!', 
    timestamp: new Date().toISOString()
  });
});

// Global MongoDB client instance
let dbClient;

/**
 * ========== DATABASE CONNECTION & SERVER START ==========
 * Async function that:
 * 1. Connects to MongoDB
 * 2. Initializes all routes with the database client
 * 3. Starts the Express server
 */
const connectDBAndStartServer = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Create new MongoDB client and establish connection
    dbClient = new MongoClient(process.env.MONGODB_URI);
    await dbClient.connect();
    
    console.log('✅ MongoDB Connected to weatherdb');
    
    // Load and initialize weather routes, passing the database client
    // This allows routes to access MongoDB without creating new connections
    const weatherRoutes = require('./routes/weather')(dbClient);
    app.use('/api/weather', weatherRoutes);
    
    // Start listening for incoming HTTP requests
    app.listen(PORT, () => {
      console.log(`🚀 Server running: http://localhost:${PORT}`);
      console.log('📋 Test endpoints:');
      console.log('   GET  http://localhost:5000/api/test');
      console.log('   GET  http://localhost:5000/api/weather/Mumbai');
      console.log('   GET  http://localhost:5000/api/weather/history');
    });
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1); // Exit process if database connection fails
  }
};

/**
 * ========== GRACEFUL SHUTDOWN ==========
 * Handle SIGINT (Ctrl+C) signal to cleanly close database connection
 * before shutting down the server
 */
process.on('SIGINT', async () => {
  if (dbClient) await dbClient.close();
  console.log('🔌 MongoDB connection closed');
  process.exit(0);
});

// ========== START APPLICATION ==========
connectDBAndStartServer();
