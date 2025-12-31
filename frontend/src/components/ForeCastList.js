/**
 * ===============================================
 * ForeCastList Component
 * ===============================================
 * Displays 5-day weather forecast in a horizontal scrollable grid
 * Shows date, temperature, icon, and description for each day
 */

import React from 'react';

/**
 * ForeCastList Component
 * @param {Array} forecast - Array of forecast day objects
 * @param {string} forecast[].date - Date string (e.g., "Mon, 31")
 * @param {number} forecast[].temp - Temperature for the day
 * @param {string} forecast[].icon - URL to weather icon image
 * @param {string} forecast[].description - Weather description
 */
const ForeCastList = ({ forecast }) => {
  // Empty state check
  if (!forecast || forecast.length === 0) {
    return null;
  }
  
  return (
    <section className="forecast-container">
      <h3>📅 5-Day Forecast</h3>
      <div className="forecast-grid">
        {/* Map through each day's forecast and render a card */}
        {forecast.map((day, idx) => (
          <div key={idx} className="forecast-card">
            {/* Day and date */}
            <p className="date">{day.date}</p>
            
            {/* Weather icon */}
            <img src={day.icon} alt={day.description} width="40" height="40" />
            
            {/* Temperature */}
            <p className="temp">{day.temp}°</p>
            
            {/* Weather description */}
            <p className="desc">{day.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ForeCastList;
