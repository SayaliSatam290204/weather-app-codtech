/**
 * ===============================================
 * HistoryList Component
 * ===============================================
 * Displays user's search history (last 10 searches)
 * Allows clicking on items to view that weather again
 * Can clear all history with one click
 */

import React from 'react';

/**
 * HistoryList Component
 * @param {Array} history - Array of search history items
 * @param {string} history[].id - Unique history record ID
 * @param {string} history[].city - City name that was searched
 * @param {string} history[].temperature - Temperature recorded
 * @param {string} history[].iconUrl - URL to weather icon
 * @param {string} history[].time - Formatted timestamp
 * @param {Function} onClear - Callback to clear all history
 * @param {Function} onCityClick - Callback when history item is clicked
 */
const HistoryList = ({ history, onClear, onCityClick }) => {
  // ========== EMPTY STATE ==========
  // Show empty message if no search history exists
  if (!history.length) {
    return (
      <section className="history-section">
        <h3>📜 Search History</h3>
        <p className="empty-state">No searches yet. Search a city to see history.</p>
      </section>
    );
  }

  // ========== HISTORY LIST ==========
  // Display all previous searches
  return (
    <section className="history-section">
      {/* Header with title and clear button */}
      <div className="history-header">
        <h3>📜 Recent Searches ({history.length})</h3>
        <button onClick={onClear} className="clear-btn">
          🗑️ Clear All
        </button>
      </div>
      
      {/* List of history items */}
      <div className="history-list">
        {history.map((item) => (
          <div 
            key={item.id}
            className="history-item"
            onClick={() => onCityClick(item)}
          >
            {/* Weather icon */}
            <img src={item.iconUrl} alt="" width="32" height="32" />
            
            {/* City name and temperature */}
            <div className="history-info">
              <span className="city-name">{item.city}</span>
              <span className="temp">{item.temperature}</span>
            </div>
            
            {/* Search timestamp */}
            <span className="time">{item.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HistoryList;
