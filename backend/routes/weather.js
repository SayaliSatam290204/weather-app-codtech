/**
 * ===============================================
 * WEATHER ROUTES - Express Route Handlers
 * ===============================================
 * Defines all API endpoints for weather operations.
 * Each route calls a corresponding controller function.
 */

const controller = require('../controllers/weatherController');

/**
 * Creates and returns Express router with all weather endpoints.
 * The dbClient is passed to each route so controllers can access MongoDB.
 */
const createWeatherRoutes = (dbClient) => {
  const router = require('express').Router();
  
  // Apply JSON body parser to all POST requests
  router.use(require('express').json());
  
  /**
   * ========== SPECIFIC ROUTES FIRST (before generic :id/:city routes) ==========
   */
  
  // GET /api/weather/history
  // Returns all previous city searches from database
  router.get('/history', (req, res) => controller.getSearchHistory(req, res, dbClient));
  
  // DELETE /api/weather/history
  // Clears all search history records from database
  router.delete('/history', (req, res) => controller.clearHistory(req, res, dbClient));
  
  // GET /api/weather/favorites
  // Returns all favorite cities saved by user
  router.get('/favorites', (req, res) => controller.getFavorites(req, res, dbClient));
  
  // POST /api/weather/favorites
  // Adds a new city to favorites list
  router.post('/favorites', (req, res) => controller.addFavorite(req, res, dbClient));
  
  // DELETE /api/weather/favorites/:id
  // Removes a favorite city by ID (MUST be before /:city route)
  router.delete('/favorites/:id', (req, res) => controller.removeFavorite(req, res, dbClient));
  
  // GET /api/weather/current?lat=X&lon=Y
  // Gets weather for a specific latitude and longitude
  // Used for geolocation-based weather queries
  router.get('/current', (req, res) => controller.getCurrentLocation(req, res, dbClient));
  
  // GET /api/weather/forecast/:city
  // Gets 5-day forecast for a specified city (MUST be before /:city route)
  router.get('/forecast/:city', (req, res) => controller.getForecast(req, res, dbClient));
  
  /**
   * ========== GENERIC ROUTE LAST (catches everything else) ==========
   */
  
  // GET /api/weather/:city
  // Gets current weather for a specified city
  // This is the main weather search endpoint
  router.get('/:city', (req, res) => controller.getWeatherByCity(req, res, dbClient));
  
  return router;
};

module.exports = createWeatherRoutes;
