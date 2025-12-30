/**
 * ===============================================
 * FavoritesList Component
 * ===============================================
 * Displays user's favorite cities in a grid layout
 * Shows current weather for each favorite city
 * Allows quick access and removal of favorites
 * 
 * FEATURES:
 * ✓ Grid display of favorite cities
 * ✓ Current weather info for each favorite
 * ✓ Click to view full weather details
 * ✓ Heart button to remove from favorites
 */

import React, { useState } from 'react';

/**
 * FavoritesList Component
 * @param {Array} favorites - Array of favorite city objects
 * @param {string} favorites[].id - Unique favorite ID (MongoDB ObjectId)
 * @param {string} favorites[].city - City name
 * @param {number} favorites[].temperature - Current temperature
 * @param {string} favorites[].description - Weather description
 * @param {string} favorites[].iconUrl - URL to weather icon
 * @param {Function} onCityClick - Callback when favorite city is clicked
 * @param {Function} onToggleFavorite - Callback to refresh list after removal
 */
const FavoritesList = ({ favorites, onCityClick, onToggleFavorite }) => {
  // ========== STATE ==========
  // Track loading state during delete operation
  const [loading, setLoading] = useState(false);

  // ========== EMPTY STATE ==========
  // Show empty message if no favorites saved
  if (!favorites || favorites.length === 0) {
    return (
      <section className="favorites-section">
        <div className="section-header">
          <h3>⭐ Favorites</h3>
          <span className="empty-badge">0</span>
        </div>
        <div className="empty-state">
          <p>No favorite cities yet.</p>
          <small>Search a city and click ❤️ to save it!</small>
        </div>
      </section>
    );
  }

  /**
   * ========== REMOVE FAVORITE HANDLER ==========
   * Deletes a favorite city from the database
   * Calls parent callback to refresh the list
   */
  const handleToggleFavorite = async (id, e) => {
    e.stopPropagation(); // Prevent triggering city click event
    setLoading(true);
    
    try {
      // Make DELETE request to backend API
      await fetch(`${process.env.REACT_APP_API_URL}/weather/favorites/${id}`, {
        method: 'DELETE'
      });
      // Refresh favorites list after deletion
      onToggleFavorite(id);
    } catch (error) {
      console.error('Favorite remove failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // ========== RENDER FAVORITES GRID ==========
  return (
    <section className="favorites-section">
      {/* Section header with count badge */}
      <div className="section-header">
        <h3>⭐ Favorites</h3>
        <span className="count-badge">{favorites.length}</span>
      </div>
      
      {/* Grid of favorite cities */}
      <div className="favorites-grid">
        {favorites.map((favorite) => (
          <div 
            key={favorite.id} 
            className="favorite-card"
            onClick={() => onCityClick(favorite.city)}
          >
            {/* Weather Icon */}
            <div className="fav-icon">
              <img 
                src={favorite.icon || favorite.iconUrl} 
                alt={favorite.description} 
                width="48" 
                height="48"
              />
            </div>
            
            {/* City Information */}
            <div className="fav-info">
              {/* City name */}
              <h4 className="fav-city">{favorite.city}</h4>
              
              {/* Current temperature */}
              <p className="fav-temp">{favorite.temperature}°</p>
              
              {/* Weather description */}
              {favorite.description && (
                <p className="fav-desc">{favorite.description}</p>
              )}
            </div>
            
            {/* Remove from Favorites Button */}
            <button 
              className="heart-btn"
              onClick={(e) => handleToggleFavorite(favorite.id, e)}
              disabled={loading}
              title="Remove from favorites"
            >
              {loading ? '⏳' : '❤️'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FavoritesList;
