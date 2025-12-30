/**
 * ===============================================
 * SearchForm Component
 * ===============================================
 * Input form for searching weather by city name
 * Includes geolocation button for GPS-based weather
 * 
 * FEATURES:
 * ✓ City name text input
 * ✓ Search button with loading state
 * ✓ Geolocation button (gets weather for current GPS location)
 * ✓ Error handling for geolocation access
 */

import React, { useState } from 'react';

/**
 * SearchForm Component
 * @param {Function} onSearch - Callback function when search is performed
 * @param {boolean} loading - Whether API request is in progress
 * @param {string} currentCity - Currently displayed city name
 */
const SearchForm = ({ onSearch, loading, currentCity }) => {
  // ========== STATE ==========
  // Stores the text input value for city search
  const [city, setCity] = useState('');

  /**
   * ========== FORM SUBMISSION HANDLER ==========
   * Triggered when user clicks search button or presses Enter
   * Validates input and calls parent's onSearch callback
   */
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    
    // Only search if input is not empty
    if (city.trim()) {
      onSearch(city.trim());
      setCity(''); // Clear input after search
    }
  };

  /**
   * ========== GEOLOCATION HANDLER ==========
   * Gets user's current location and fetches weather
   * Handles geolocation permission errors gracefully
   */
  const getCurrentLocation = () => {
    // Check if browser supports geolocation API
    if (!navigator.geolocation) {
      alert('Geolocation not supported in your browser');
      return;
    }

    // Request user's current GPS coordinates
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Success callback - received coordinates
        const { latitude, longitude } = position.coords;
        // Pass coordinates to parent component for API call
        onSearch(`current?lat=${latitude}&lon=${longitude}`);
      },
      (error) => {
        // Error callback - handle different error types
        let message = 'Location error: ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message += 'Location access denied';
            break;
          case error.POSITION_UNAVAILABLE:
            message += 'Location unavailable';
            break;
          default:
            message += 'Unknown error';
        }
        alert(message);
      },
      { 
        enableHighAccuracy: true, // Request high precision GPS
        timeout: 10000,           // Timeout after 10 seconds
        maximumAge: 60000         // Cache location for 1 minute
      }
    );
  };

  // ========== RENDER ==========
  return (
    <section className="search-section">
      {/* City search form */}
      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter city (Mumbai, Karad) or click 📍 My Location"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="city-input"
            disabled={loading} // Disable input while loading
          />
          <button 
            type="submit" 
            className="search-btn" 
            disabled={loading}
          >
            {loading ? '🔄 Searching...' : '🌤️ Search'}
          </button>
        </div>
      </form>

      {/* Geolocation button */}
      <div className="location-buttons">
        <button 
          onClick={getCurrentLocation} 
          className="geo-btn"
          disabled={loading}
          title="Get weather for your current GPS location"
        >
          📍 My Location
        </button>
      </div>

      {/* Display currently viewed city */}
      {currentCity && (
        <p className="current-city">Current: {currentCity}</p>
      )}
    </section>
  );
};

export default SearchForm;
