/**
 * ===============================================
 * DATABASE CONFIGURATION - MongoDB Connection
 * ===============================================
 * Manages MongoDB database connection and operations
 * Provides centralized database access methods
 * 
 * NOTE: This module is instantiated and exported as a singleton.
 * Only one database connection is created and reused throughout the application.
 */

const { MongoClient } = require('mongodb'); // MongoDB driver

// Get MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

/**
 * ========== DATABASE CLASS ==========
 * Encapsulates all database operations
 * Provides methods for connecting and accessing collections
 */
class Database {
  /**
   * Constructor initializes MongoDB client
   * Creates the client but does not connect yet
   * Connection happens when connect() is explicitly called
   */
  constructor() {
    this.client = new MongoClient(MONGODB_URI); // MongoDB client instance
    this.db = null; // Database instance (set after connection)
  }

  /**
   * ========== CONNECT TO DATABASE ==========
   * Establishes connection to MongoDB
   * Selects the 'weatherdb' database
   * Should be called once during application startup
   * 
   * @returns {Object} Database instance for use in application
   * @throws {Error} If connection fails
   */
  async connect() {
    try {
      // Connect to MongoDB using connection string from .env
      await this.client.connect();
      
      // Select the 'weatherdb' database
      this.db = this.client.db('weatherdb');
      
      console.log('✅ Database connected');
      return this.db;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error; // Re-throw error so application can handle it
    }
  }

  /**
   * ========== GET COLLECTION ==========
   * Returns a reference to a specific MongoDB collection
   * Use this to perform CRUD operations on collections
   * 
   * Example usage:
   * const usersCollection = db.getCollection('users');
   * const users = await usersCollection.find({}).toArray();
   * 
   * @param {string} collectionName - Name of the collection
   * @returns {Object} MongoDB collection object
   * @throws {Error} If database is not connected
   */
  getCollection(collectionName) {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db.collection(collectionName);
  }

  /**
   * ========== DISCONNECT FROM DATABASE ==========
   * Closes the MongoDB connection
   * Should be called during application shutdown
   * 
   * Example usage:
   * process.on('SIGINT', async () => {
   *   await db.disconnect();
   *   process.exit(0);
   * });
   */
  async disconnect() {
    await this.client.close();
    console.log('🔌 Database connection closed');
  }
}

/**
 * ========== EXPORT SINGLETON INSTANCE ==========
 * Create and export a single Database instance
 * This ensures only one database connection exists throughout the app
 */
module.exports = new Database();
