// controllers/weatherController.js
// Handles all business logic for weather operations, API calls, and database interactions.

const axios = require('axios'); // HTTP client for making requests to OpenWeatherMap
const { WeatherModel, SearchHistory, ObjectId } = require('../models/Weather'); // Models for data validation and formatting
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY; // API Key from environment variables

/**
 * =======================================================================
 * 1. GET WEATHER BY CITY
 * Fetches current weather data for a specific city name.
 * 
 * @route GET /api/weather/:city
 * @param {Object} req - Express request object containing city param and units query
 * @param {Object} res - Express response object
 * @param {MongoClient} dbClient - Shared MongoDB client instance
 * =======================================================================
 */
const getWeatherByCity = async (req, res, dbClient) => {
  try {
    const { city } = req.params; // Extract city name from URL
    const { units = 'metric' } = req.query; // Default to Celsius ('metric') if not specified
    
    // 1. Request data from OpenWeatherMap API
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: city, appid: OPENWEATHER_API_KEY, units, lang: 'en' }
    });

    // 2. Validate and format data using our Model
    const weatherModel = WeatherModel.fromApiResponse(response.data);
    
    // 3. Save search to MongoDB 'searchHistory' collection
    const db = dbClient.db('weatherdb');
    await db.collection('searchHistory').insertOne(weatherModel.toDocument());
    
    // 4. Send formatted response to frontend
    res.json({ success: true, data: weatherModel.toFrontend(units) });
  } catch (error) {
    handleError(res, error); // Centralized error handling
  }
};

/**
 * =======================================================================
 * 2. GEOLOCATION WEATHER
 * Fetches weather data using GPS coordinates (Latitude & Longitude).
 * 
 * @route GET /api/weather/current
 * @param {Object} req - Request containing lat, lon query parameters
 * =======================================================================
 */
const getCurrentLocation = async (req, res, dbClient) => {
  try {
    const { lat, lon, units = 'metric' } = req.query;
    
    // Convert strings to floats
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ success: false, error: 'Coords required' });
    }

    // 1. Request weather by coordinates
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { lat: latitude, lon: longitude, appid: OPENWEATHER_API_KEY, units }
    });

    // 2. Format data
    const weatherModel = WeatherModel.fromApiResponse(response.data);
    
    // 3. Save "My Location" search to history
    const db = dbClient.db('weatherdb');
    await db.collection('searchHistory').insertOne(weatherModel.toDocument());

    // 4. Send response
    res.json({ success: true, data: weatherModel.toFrontend(units) });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * =======================================================================
 * 3. 5-DAY FORECAST
 * Fetches forecast data and filters it to show one summary per day.
 * 
 * @route GET /api/weather/forecast/:city
 * =======================================================================
 */
const getForecast = async (req, res, dbClient) => {
  try {
    const { city } = req.params;
    const { units = 'metric' } = req.query;

    // 1. Get raw 5-day/3-hour forecast data
    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: { q: city, appid: OPENWEATHER_API_KEY, units }
    });

    // 2. Filter list: API returns 40 items (5 days * 8 three-hour segments)
    // We take every 8th item to get roughly one forecast per 24 hours (e.g., noon daily)
    const daily = response.data.list.slice(0, 40).filter((_, i) => i % 8 === 0);

    // 3. Format response for frontend
    res.json({
      success: true,
      city: response.data.city.name,
      forecast: daily.map(item => ({
        // Format date (e.g., "Mon, Jan 1")
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
 * =======================================================================
 * 4. FAVORITES MANAGEMENT
 * CRUD operations for User Favorites (Get, Add, Remove)
 * =======================================================================
 */

// Get all favorite cities
const getFavorites = async (req, res, dbClient) => {
  try {
    const { units = 'metric' } = req.query; // Get units from query parameter
    // Fetch all documents from 'favorites' collection
    const favorites = await dbClient.db('weatherdb').collection('favorites').find({}).toArray();
    
    console.log('Retrieved favorites:', favorites.length);
    console.log('Favorite IDs:', favorites.map(f => f._id.toString()));
    
    // Map _id to string 'id' for frontend React keys and format temperature with units
    const formattedFavorites = favorites.map(f => {
      const unitSymbol = units === 'metric' ? '°C' : '°F';
      return {
        ...f, 
        id: f._id.toString(), // Convert ObjectId to string
        temperature: f.temperature, // Keep raw temp, display logic will add unit
        iconUrl: f.icon ? `http://openweathermap.org/img/wn/${f.icon}@2x.png` : f.iconUrl
      };
    });
    
    res.json({ success: true, favorites: formattedFavorites, units: units });
  } catch (error) { 
    console.error('Error fetching favorites:', error);
    handleError(res, error);
  }
};

// Add a city to favorites
const addFavorite = async (req, res, dbClient) => {
  try {
    const { city } = req.body;
    const db = dbClient.db('weatherdb');
    
    // Prevent duplicates: Check if city exists
    const exists = await db.collection('favorites').findOne({ city });
    if (exists) return res.json({ success: false, message: 'Already in favorites' });

    // Fetch fresh weather data to store current snapshot
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: city, appid: OPENWEATHER_API_KEY, units: 'metric' }
    });
    
    const model = WeatherModel.fromApiResponse(response.data);
    
    // Save to DB
    await db.collection('favorites').insertOne(model.toDocument());
    
    res.json({ success: true, message: 'Added to favorites' });
  } catch (error) { handleError(res, error); }
};

// Remove a favorite by ID
const removeFavorite = async (req, res, dbClient) => {
  try {
    const { id } = req.params;
    
    console.log('Attempting to remove favorite with ID:', id);
    
    // Validate that ID is a valid ObjectId format
    if (!ObjectId.isValid(id)) {
      console.error('Invalid ObjectId format:', id);
      return res.status(400).json({ success: false, error: 'Invalid favorite ID' });
    }
    
    const db = dbClient.db('weatherdb');
    const objectId = new ObjectId(id);
    
    // First, check if the favorite exists
    const favorite = await db.collection('favorites').findOne({ _id: objectId });
    console.log('Found favorite to delete:', favorite ? 'YES' : 'NO');
    
    if (!favorite) {
      console.warn('No document found with ID:', id);
      console.log('All favorite IDs in DB:', (await db.collection('favorites').find({}).project({ _id: 1 }).toArray()).map(f => f._id.toString()));
      return res.status(404).json({ success: false, error: 'Favorite not found' });
    }
    
    // Delete the favorite
    const result = await db.collection('favorites').deleteOne({ _id: objectId });
    
    console.log('Delete result:', result);
    
    res.json({ success: true, message: 'Removed favorite' });
  } catch (error) { 
    console.error('Error removing favorite:', error);
    handleError(res, error);
  }
};

/**
 * =======================================================================
 * 5. SEARCH HISTORY & HELPERS
 * =======================================================================
 */

// Get recent search history (Limit 10)
const getSearchHistory = async (req, res, dbClient) => {
  try {
    const { units = 'metric' } = req.query; // Get units from query parameter
    const history = await dbClient.db('weatherdb').collection('searchHistory')
      .find({})
      .sort({ timestamp: -1 }) // Sort by newest first
      .limit(10) // Limit to last 10 searches
      .toArray();
      
    // Format using SearchHistory model helper, passing units parameter
    res.json({ success: true, history: history.map(h => new SearchHistory(h).toFrontend(units)) });
  } catch (error) {
    console.error('Error fetching search history:', error);
    handleError(res, error);
  }
};

// Clear entire search history
const clearHistory = async (req, res, dbClient) => {
  try {
    const result = await dbClient.db('weatherdb').collection('searchHistory').deleteMany({});
    console.log('Cleared search history. Deleted count:', result.deletedCount);
    res.json({ success: true, message: `Cleared ${result.deletedCount} history items` });
  } catch (error) {
    console.error('Error clearing history:', error);
    handleError(res, error);
  }
};

// Centralized Error Handler
// Parses OpenWeatherMap errors and Internal Server Errors
const handleError = (res, error) => {
  console.error('API Error:', error.message || error);
  
  // Handle axios errors from external APIs
  if (error.response) {
    const statusCode = error.response.status;
    const message = error.response.data?.message || error.message;
    
    if (statusCode === 401) {
      return res.status(401).json({ success: false, error: 'Invalid API key' });
    }
    if (statusCode === 404) {
      return res.status(404).json({ success: false, error: 'Location/Resource not found' });
    }
    if (statusCode === 429) {
      return res.status(429).json({ success: false, error: 'Too many requests. Try again later' });
    }
    
    return res.status(statusCode).json({ success: false, error: message || 'API Error' });
  }
  
  // Generic server error
  res.status(500).json({ success: false, error: 'Server Error: ' + (error.message || 'Unknown error') });
};

// Clear all database collections (for testing/debugging)
const clearAllData = async (req, res, dbClient) => {
  try {
    const db = dbClient.db('weatherdb');
    const searchHistoryResult = await db.collection('searchHistory').deleteMany({});
    const favoritesResult = await db.collection('favorites').deleteMany({});
    
    res.json({ 
      success: true, 
      message: 'Database cleared',
      deleted: {
        searchHistory: searchHistoryResult.deletedCount,
        favorites: favoritesResult.deletedCount
      }
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Export all controller functions for use in routes
module.exports = {
  getWeatherByCity, getCurrentLocation, getForecast,
  getFavorites, addFavorite, removeFavorite,
  getSearchHistory, clearHistory, clearAllData
};
