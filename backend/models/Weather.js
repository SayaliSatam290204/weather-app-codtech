/**
 * ===============================================
 * WEATHER MODEL - Data Validation & Formatting
 * ===============================================
 * Defines data structures for weather information.
 * Handles conversion between API responses and frontend display.
 */

const { ObjectId } = require('mongodb');

/**
 * ========== WeatherModel CLASS ==========
 * Main class for storing and formatting weather data.
 * Provides methods to transform API data into displayable formats.
 */
class WeatherModel {
  /**
   * Constructor initializes weather data properties
   * @param {Object} data - Weather data from OpenWeather API
   */
  constructor(data = {}) {
    this.city = data.city || '';
    this.country = data.country || '';
    this.temperature = data.temperature || 0;
    this.feelsLike = data.feelsLike || 0;
    this.description = data.description || '';
    this.icon = data.icon || '';
    this.humidity = data.humidity || 0;
    this.windSpeed = data.windSpeed || 0;
    this.pressure = data.pressure || 0;
    this.timestamp = data.timestamp || new Date();
  }

  /**
   * Validates if weather data has required fields
   * @returns {boolean} true if data is valid
   */
  isValid() {
    return this.city && this.temperature !== undefined && this.description && this.icon;
  }

  /**
   * Converts weather data to MongoDB document format
   * Removes undefined/null/empty values to keep database clean
   * @returns {Object} Document ready for database storage
   */
  toDocument() {
    const doc = {
      city: this.city.trim(),
      country: this.country,
      temperature: this.temperature,
      description: this.description,
      icon: this.icon,
      humidity: this.humidity,
      windSpeed: this.windSpeed,
      pressure: this.pressure,
      timestamp: this.timestamp
    };
    // Remove empty values
    Object.keys(doc).forEach(key => {
      if (doc[key] === undefined || doc[key] === null || doc[key] === '') {
        delete doc[key];
      }
    });
    return doc;
  }

  /**
   * Converts weather data to format suitable for frontend display
   * Includes units and formatted strings for UI rendering
   * @param {string} units - Temperature units: 'metric' (°C) or 'imperial' (°F)
   * @returns {Object} Formatted weather data for React components
   */
  toFrontend(units = 'metric') {
    return {
      city: this.city,
      country: this.country,
      temperature: this.temperature,
      feelsLike: this.feelsLike,
      description: this.description.charAt(0).toUpperCase() + this.description.slice(1),
      iconUrl: `http://openweathermap.org/img/wn/${this.icon}@2x.png`,
      humidity: this.humidity,
      windSpeed: this.windSpeed,
      pressure: this.pressure,
      units: units
    };
  }

  /**
   * Static method to create WeatherModel from OpenWeather API response
   * Extracts only necessary fields from the complex API response
   * @param {Object} apiData - Raw response from OpenWeather API
   * @returns {WeatherModel} New instance with extracted data
   */
  static fromApiResponse(apiData) {
    return new WeatherModel({
      city: apiData.name,
      country: apiData.sys?.country || '',
      temperature: Math.round(apiData.main?.temp || 0),
      feelsLike: Math.round(apiData.main?.feels_like || 0),
      description: apiData.weather?.[0]?.description || '',
      icon: apiData.weather?.[0]?.icon || '',
      humidity: apiData.main?.humidity || 0,
      windSpeed: apiData.wind?.speed || 0,
      pressure: apiData.main?.pressure || 0
    });
  }
}

/**
 * ========== SearchHistory CLASS ==========
 * Extends WeatherModel to add MongoDB ID for database records
 * Used when retrieving historical searches from database
 */
class SearchHistory extends WeatherModel {
  /**
   * Constructor calls parent class and adds MongoDB ID
   * @param {Object} data - Weather data including MongoDB _id field
   */
  constructor(data) {
    super(data);
    this._id = data._id ? new ObjectId(data._id) : null;
  }

  /**
   * Formats historical search data for frontend display
   * Includes formatted timestamp and weather icon
   * @param {string} units - Temperature units: 'metric' (°C) or 'imperial' (°F)
   * @returns {Object} Formatted history item for UI
   */
  toFrontend(units = 'metric') {
    const unitSymbol = units === 'metric' ? '°C' : '°F';
    return {
      id: this._id?.toString(),
      city: this.city,
      temperature: `${this.temperature}${unitSymbol}`,
      description: this.description.charAt(0).toUpperCase() + this.description.slice(1),
      iconUrl: `http://openweathermap.org/img/wn/${this.icon}@2x.png`,
      time: this.timestamp.toLocaleString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short'
      })
    };
  }
}

// Export classes and MongoDB ObjectId for use in controllers
module.exports = { WeatherModel, SearchHistory, ObjectId };
