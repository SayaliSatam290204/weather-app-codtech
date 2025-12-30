/**
 * ===============================================
 * WeatherDisplay Component
 * ===============================================
 * Displays current weather information in a card format
 * Shows temperature, conditions, and detailed metrics
 * 
 * DISPLAYS:
 * ✓ Weather icon and temperature
 * ✓ Weather description (cloudy, sunny, etc.)
 * ✓ Feels like temperature
 * ✓ Humidity percentage
 * ✓ Wind speed
 * ✓ Atmospheric pressure
 * ✓ City name and country
 */

import React from 'react';

/**
 * WeatherDisplay Component
 * @param {Object} data - Weather data object
 * @param {string} data.city - City name
 * @param {string} data.country - Country name
 * @param {number} data.temperature - Current temperature
 * @param {number} data.feelsLike - "Feels like" temperature
 * @param {string} data.description - Weather description
 * @param {string} data.iconUrl - URL to weather icon image
 * @param {number} data.humidity - Humidity percentage
 * @param {number} data.windSpeed - Wind speed
 * @param {number} data.pressure - Atmospheric pressure
 */
const WeatherDisplay = ({ data }) => {
  return (
    <section className="weather-display">
      <div className="weather-card">
        {/* Weather Icon */}
        <div className="weather-icon">
          <img 
            src={data.iconUrl} 
            alt={data.description}
            width="120"
            height="120"
          />
        </div>
        
        {/* Weather Information */}
        <div className="weather-info">
          {/* Large temperature display */}
          <h2 className="temp">{data.temperature}°</h2>
          
          {/* Weather description (Cloudy, Sunny, etc.) */}
          <p className="description">{data.description}</p>
          
          {/* Detailed weather metrics grid */}
          <div className="weather-details">
            <div className="detail-item">
              <span>Feels like:</span>
              <span>{data.feelsLike}°</span>
            </div>
            <div className="detail-item">
              <span>Humidity:</span>
              <span>{data.humidity}%</span>
            </div>
            <div className="detail-item">
              <span>Wind:</span>
              <span>{data.windSpeed} m/s</span>
            </div>
            <div className="detail-item">
              <span>Pressure:</span>
              <span>{data.pressure} mb</span>
            </div>
          </div>

          {/* Location display */}
          <div className="location">
            📍 {data.city}, {data.country}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeatherDisplay;
