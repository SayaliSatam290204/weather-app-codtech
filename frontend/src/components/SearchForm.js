// src/components/SearchForm.js
// Component for city search input and geolocation button

import React, { useState } from 'react';

/**
 * SearchForm Component
 * Renders the search input and "My Location" button.
 * 
 * @param {Function} onSearch - Callback to parent App.js with search query
 * @param {boolean} loading - Loading state to disable inputs during API calls
 * @param {string} currentCity - Name of the currently displayed city
 * @param {string} units - Current temperature unit ('metric' or 'imperial')
 */
const SearchForm = ({ onSearch, loading, currentCity, units }) => {
  // Local state for the text input field
  const [city, setCity] = useState('');

  /**
   * Handles form submission (Enter key or Search button)
   * Prevents default page reload and triggers search if input is valid
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim()); // Send city name to parent
      setCity(''); // Clear input field after search
    }
  };

  /**
   * ✅ CHROME-OPTIMIZED GEOLOCATION HANDLER
   * Uses the browser's Geolocation API to get GPS coordinates.
   * Includes specific options for better accuracy in Chrome.
   */
  const getCurrentLocation = () => {
    // Check if browser supports Geolocation
    if (!navigator.geolocation) {
      alert('❌ Geolocation not supported. Use Chrome/Edge/Firefox');
      return;
    }

    // Options for getCurrentPosition
    const geoOptions = {
      enableHighAccuracy: true, // Request best possible accuracy (GPS)
      timeout: 15000,           // Wait max 15 seconds for location
      maximumAge: 300000        // Accept cached position up to 5 minutes old
    };

    // Request current position
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Success callback: Destructure coords from position object
        const { latitude, longitude } = position.coords;
        
        // Pass special query string to parent's fetchWeather function
        // Format: current?lat=...&lon=...
        onSearch(`current?lat=${latitude}&lon=${longitude}`);
      },
      (error) => {
        // Error callback: Handle various error codes
        let message = 'Location Error:\n\n';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message += '🚫 Permission denied. Go to Chrome Settings → Site Settings → Location → Allow localhost:3000';
            break;
          case error.POSITION_UNAVAILABLE:
            message += '📍 Location unavailable. Enable GPS/WiFi';
            break;
          case error.TIMEOUT:
            message += '⏰ Location timeout. Try again';
            break;
          default:
            message += '❓ Unknown error';
        }
        alert(message); // Show user-friendly error message
      },
      geoOptions
    );
  };

  return (
    <section className="search-section">
      {/* City Search Form */}
      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter city (Mumbai, Karad) or click 📍"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="city-input"
            disabled={loading} // Disable while fetching weather
          />
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? '🔄 Searching...' : '🌤️ Search'}
          </button>
        </div>
      </form>

      {/* Geolocation Button Section */}
      <div className="location-buttons">
        <button 
          onClick={getCurrentLocation} 
          className="geo-btn"
          disabled={loading}
          title="Get weather for your current GPS location"
        >
          📍 My Location
        </button>
        {/* Helper text for Chrome users needing to enable permissions */}
        <small className="geo-hint">Chrome: Click → Allow location access</small>
      </div>

      {/* Current City Indicator */}
      {currentCity && (
        <p className="current-city">📍 {currentCity}</p>
      )}
    </section>
  );
};

export default SearchForm;
