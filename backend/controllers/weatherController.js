/**
 * ===============================================
 * WEATHER CONTROLLER - Business Logic
 * ===============================================
 * Handles all weather API requests and database operations.
 * Serves as the bridge between routes and data models.
 */

const axios = require('axios'); // HTTP client for API requests
const { WeatherModel, SearchHistory, ObjectId } = require('../models/Weather');
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY; // API key for OpenWeather service

/**
 * ========== WEATHER FETCH HANDLERS ==========
 */

/**
 * GET WEATHER BY CITY
 * Fetches current weather for a specified city name
 * Saves the search to history for user reference
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params.city - City name to search
 * @param {Object} req.query.units - Temperature units ('metric' or 'imperial')
 * @param {Object} res - Express response object
 * @param {Object} dbClient - MongoDB client instance
 */
const getWeatherByCity = async (req, res, dbClient) => {
  try {
    const { city } = req.params;
    const { units = 'metric' } = req.query; // Default to Celsius
    
    // Make API request to OpenWeather API
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: city, appid: OPENWEATHER_API_KEY, units, lang: 'en' }
    });

    // Transform API response into our WeatherModel format
    const weatherModel = WeatherModel.fromApiResponse(response.data);
    
    // Save search to history database
    const db = dbClient.db('weatherdb');
    await db.collection('searchHistory').insertOne(weatherModel.toDocument());
    
    // Send formatted response to frontend
    res.json({ success: true, data: weatherModel.toFrontend(units) });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * GET WEATHER BY GEOLOCATION (GPS)
 * Fetches weather for specific latitude and longitude coordinates
 * Used when user clicks "My Location" button
 * 
 * @param {Object} req - Express request object
 * @param {number} req.query.lat - Latitude coordinate
 * @param {number} req.query.lon - Longitude coordinate
 * @param {Object} req.query.units - Temperature units
 * @param {Object} res - Express response object
 * @param {Object} dbClient - MongoDB client instance
 */
const getCurrentLocation = async (req, res, dbClient) => {
  try {
    const { lat, lon, units = 'metric' } = req.query;
    
    // Validate that both latitude and longitude are provided
    if (!lat || !lon) {
      return res.status(400).json({ success: false, error: 'Coordinates required' });
    }

    // Make API request using GPS coordinates
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { lat, lon, appid: OPENWEATHER_API_KEY, units }
    });

    // Transform API response into our WeatherModel format
    const weatherModel = WeatherModel.fromApiResponse(response.data);
    
    // Save geolocation search to history
    const db = dbClient.db('weatherdb');
    await db.collection('searchHistory').insertOne(weatherModel.toDocument());

    // Send formatted response to frontend
    res.json({ success: true, data: weatherModel.toFrontend(units) });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * GET 5-DAY FORECAST
 * Fetches weather forecast for the next 5 days
 * Returns one forecast per day (filters data every 8 time slots)
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params.city - City name for forecast
 * @param {Object} req.query.units - Temperature units
 * @param {Object} res - Express response object
 * @param {Object} dbClient - MongoDB client instance
 */
const getForecast = async (req, res, dbClient) => {
  try {
    const { city } = req.params;
    const { units = 'metric' } = req.query;

    // Make API request to get forecast data
    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: { q: city, appid: OPENWEATHER_API_KEY, units }
    });

    // Filter forecast to get one prediction per day (every 8th item = 24 hours)
    // API returns 5-day forecast with 3-hour intervals
    const daily = response.data.list.slice(0, 40).filter((_, i) => i % 8 === 0);

    // Format and send forecast response
    res.json({
      success: true,
      city: response.data.city.name,
      forecast: daily.map(item => ({
        date: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        temp: Math.round(item.main.temp),
        icon: `http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
        description: item.weather[0].description
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Forecast failed' });
  }
};

/**
 * ========== FAVORITES MANAGEMENT ==========
 */

/**
 * GET ALL FAVORITES
 * Retrieves all favorite cities saved by the user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} dbClient - MongoDB client instance
 */
const getFavorites = async (req, res, dbClient) => {
  try {
    // Query all favorites from database
    const favorites = await dbClient.db('weatherdb').collection('favorites').find({}).toArray();
    
    // Transform MongoDB IDs to string format for frontend
    res.json({ success: true, favorites: favorites.map(f => ({ ...f, id: f._id })) });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * ADD FAVORITE CITY
 * Saves a city to user's favorites list
 * Fetches fresh weather data before saving
 * Prevents duplicate favorites
 * 
 * @param {Object} req - Express request object
 * @param {string} req.body.city - City name to add
 * @param {Object} res - Express response object
 * @param {Object} dbClient - MongoDB client instance
 */
const addFavorite = async (req, res, dbClient) => {
  try {
    const { city } = req.body;
    const db = dbClient.db('weatherdb');
    
    // Check if city is already in favorites
    const exists = await db.collection('favorites').findOne({ city });
    if (exists) {
      return res.json({ success: false, message: 'Already in favorites' });
    }

    // Fetch fresh weather data for the favorite
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: city, appid: OPENWEATHER_API_KEY, units: 'metric' }
    });
    
    // Convert API response to our model format
    const model = WeatherModel.fromApiResponse(response.data);
    
    // Save to favorites collection in database
    await db.collection('favorites').insertOne(model.toDocument());
    
    res.json({ success: true, message: 'Added to favorites' });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * REMOVE FAVORITE CITY
 * Deletes a city from user's favorites list
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.id - MongoDB ID of favorite to remove
 * @param {Object} res - Express response object
 * @param {Object} dbClient - MongoDB client instance
 */
const removeFavorite = async (req, res, dbClient) => {
  try {
    const { id } = req.params;
    
    // Delete from favorites collection using MongoDB ObjectId
    await dbClient.db('weatherdb').collection('favorites').deleteOne({ _id: new ObjectId(id) });
    
    res.json({ success: true, message: 'Removed favorite' });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * ========== SEARCH HISTORY MANAGEMENT ==========
 */

/**
 * GET SEARCH HISTORY
 * Retrieves last 10 city searches performed by user
 * Sorted by most recent first
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} dbClient - MongoDB client instance
 */
const getSearchHistory = async (req, res, dbClient) => {
  try {
    // Query search history, sorted by most recent, limit to 10 items
    const history = await dbClient.db('weatherdb').collection('searchHistory')
      .find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    
    // Format each history item for frontend display
    res.json({ success: true, history: history.map(h => new SearchHistory(h).toFrontend()) });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * CLEAR SEARCH HISTORY
 * Deletes all search history records from database
 * Cannot be undone
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} dbClient - MongoDB client instance
 */
const clearHistory = async (req, res, dbClient) => {
  try {
    // Delete all documents from searchHistory collection
    await dbClient.db('weatherdb').collection('searchHistory').deleteMany({});
    res.json({ success: true });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * ========== ERROR HANDLING ==========
 */

/**
 * ERROR HANDLER
 * Standardized error response for all API errors
 * Logs error to console for debugging
 * 
 * @param {Object} res - Express response object
 * @param {Error} error - Error object containing error details
 */
const handleError = (res, error) => {
  console.error('API Error:', error.message);
  res.status(500).json({ 
    success: false, 
    error: error.response?.data?.message || 'Server Error' 
  });
};

/**
 * ========== EXPORT ALL CONTROLLER FUNCTIONS ==========
 */
module.exports = {
  getWeatherByCity,        // Search weather by city name
  getCurrentLocation,      // Get weather by GPS coordinates
  getForecast,             // Get 5-day forecast
  getFavorites,            // List all favorites
  addFavorite,             // Add city to favorites
  removeFavorite,          // Remove city from favorites
  getSearchHistory,        // Get search history
  clearHistory             // Clear all search history
};
