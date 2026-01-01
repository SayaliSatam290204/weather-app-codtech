/**
 * ===============================================
 * APP.JS - Main React Application Component
 * ===============================================
 * Root component that manages the entire weather application.
 * Handles state management, API calls, and component rendering.
 * 
 * FEATURES:
 * ✓ Search weather by city name
 * ✓ Get weather by GPS location
 * ✓ View current weather details (temp, humidity, wind, pressure)
 * ✓ 5-day weather forecast
 * ✓ Save and manage favorite cities
 * ✓ Search history tracking (last 10 searches)
 * ✓ Temperature unit conversion (°C / °F)
 * ✓ Dark/Light theme toggle
 */

import React, { useState, useEffect } from 'react';

// ========== COMPONENT IMPORTS ==========
import SearchForm from './components/SearchForm';      // City search and geolocation input
import WeatherDisplay from './components/WeatherDisplay'; // Current weather card display
import HistoryList from './components/HistoryList';    // Search history list
import FavoritesList from './components/FavoritesList'; // Favorite cities list
import ForecastList from './components/ForeCastList';  // 5-day forecast display
import './App.css'; // Application stylesheet

/**
 * ========== MAIN APP COMPONENT ==========
 */
function App() {
  // ========== STATE MANAGEMENT ==========
  
  // Current weather data from API
  const [weatherData, setWeatherData] = useState(null);
  
  // 5-day forecast data
  const [forecast, setForecast] = useState([]);
  
  // User's search history (last 10 searches)
  const [history, setHistory] = useState([]);
  
  // User's favorite cities list
  const [favorites, setFavorites] = useState([]);
  
  // Loading state for API calls
  const [loading, setLoading] = useState(false);
  
  // Temperature units: 'metric' (°C) or 'imperial' (°F)
  const [units, setUnits] = useState('metric');
  
  // Theme: 'light' or 'dark' mode
  const [theme, setTheme] = useState('light');
  
  // Backend API URL from .env file
  const API_URL = process.env.REACT_APP_API_URL;

  /**
   * ========== INITIALIZATION (useEffect) ==========
   * Runs when component mounts and when theme changes
   * Loads initial data and applies theme styling
   */
  useEffect(() => {
    // Fetch initial search history and favorites when component loads
    fetchHistory();
    fetchFavorites();
    // Apply theme class to body element for global styling
    document.body.className = theme;
  }, [theme]); // Re-run when theme changes

  /**
   * ========== FETCH WEATHER DATA ==========
   * Main weather fetch function
   * Supports city name searches and geolocation queries
   * Automatically converts units based on user preference
   */
  const fetchWeather = async (query) => {
    setLoading(true);
    try {
      // Handle both city names and geolocation queries with units
      // Format: city name or "current?lat=X&lon=Y"
      let endpoint;
      if (query.includes('current')) {
        // Geolocation query: current?lat=X&lon=Y
        endpoint = `/weather/${query}&units=${units}`;
      } else {
        // City name query
        endpoint = `/weather/${query}?units=${units}`;
      }
      
      // Make API request to backend
      const res = await fetch(`${API_URL}${endpoint}`);
      const data = await res.json();
      
      // Handle successful response
      if (data.success) {
        setWeatherData(data.data);
        fetchHistory(); // Update history list after new search
        
        // Auto-fetch 5-day forecast for city searches
        if (data.data.city) {
          fetchForecast(data.data.city);
        }
      } else {
        alert(data.error || 'Failed to fetch weather');
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      alert('Network error. Check backend on port 5000');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ========== FETCH 5-DAY FORECAST ==========
   * Gets weather forecast for the next 5 days
   * Called automatically after successful city search
   */
  const fetchForecast = async (city) => {
    try {
      const res = await fetch(`${API_URL}/weather/forecast/${city}?units=${units}`);
      const data = await res.json();
      if (data.success) {
        setForecast(data.forecast);
      }
    } catch (err) {
      console.error('Forecast error:', err);
    }
  };

  /**
   * ========== SEARCH HISTORY MANAGEMENT ==========
   * Fetches all previous searches from backend
   */
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/weather/history?units=${units}`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('History fetch failed:', error);
    }
  };

  /**
   * ========== FAVORITES MANAGEMENT ==========
   * Fetches all favorite cities from backend
   */
  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${API_URL}/weather/favorites?units=${units}`);
      const data = await res.json();
      if (data.success) {
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error('Favorites fetch failed:', error);
    }
  };

  /**
   * TOGGLE FAVORITE
   * Adds or removes a city from user's favorites
   * Makes POST request to backend with city name
   */
  const toggleFavorite = async (city) => {
    try {
      const res = await fetch(`${API_URL}/weather/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city })
      });
      const data = await res.json();
      
      if (data.success) {
        fetchFavorites(); // Refresh favorites list
        alert(data.message || `${city} added to favorites!`);
      } else {
        alert(data.error || 'Failed to toggle favorite');
      }
    } catch (error) {
      console.error('Favorite toggle failed:', error);
      alert('Failed to update favorites');
    }
  };

  /**
   * CLEAR HISTORY
   * Deletes all search history records
   * Calls backend DELETE endpoint
   */
  const clearHistory = async () => {
    try {
      await fetch(`${API_URL}/weather/history`, { method: 'DELETE' });
      setHistory([]);
      alert('History cleared!');
    } catch (error) {
      console.error('Clear history failed:', error);
    }
  };

  /**
   * ========== CLICK HANDLERS ==========
   */
  
  /**
   * Handle city click from history or favorites
   * Converts different input formats to city name
   */
  const handleCityClick = (cityOrItem) => {
    const city = typeof cityOrItem === 'string' ? cityOrItem : cityOrItem.city;
    fetchWeather(city);
  };

  /**
   * Handle removing a favorite
   * Refreshes favorites list after deletion
   */
  const handleFavoriteRemove = (favoriteId) => {
    fetchFavorites();
  };

  /**
   * ========== RENDER ==========
   */

  return (
    <div className={`App ${theme}`}>
      <header className="app-header">
        <h1>🌤️ Ultimate Weather App</h1>
        <div className="controls">
          <button 
            onClick={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
            className="unit-btn"
            title="Toggle °C / °F"
          >
            {units === 'metric' ? '°F' : '°C'}
          </button>
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="theme-btn"
            title="Toggle Dark/Light Mode"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <main className="main-content">
        {/* 🔥 Search + Geolocation */}
        <SearchForm 
          onSearch={fetchWeather} 
          loading={loading}
          currentCity={weatherData?.city}
          units={units}
        />
        
        {/* 🌤️ Current Weather */}
        {weatherData && (
          <>
            <WeatherDisplay data={weatherData} />
            <button 
              className="fav-btn" 
              onClick={() => toggleFavorite(weatherData.city)}
            >
              ❤️ Add to Favorites
            </button>
          </>
        )}

        {/* 📅 5-Day Forecast */}
        {forecast.length > 0 && (
          <ForecastList forecast={forecast} />
        )}
        
        {/* ⭐ Favorites Section */}
        <FavoritesList 
          favorites={favorites}
          units={units}
          onCityClick={handleCityClick}
          onToggleFavorite={handleFavoriteRemove} // Refresh after remove
        />

        {/* 📜 Search History */}
        <HistoryList 
          history={history} 
          onClear={clearHistory}
          onCityClick={handleCityClick}
        />
      </main>
    </div>
  );
}

export default App;
