# Backend — Weather App API

This directory contains the Node.js backend API for the Weather App.

## Purpose

- Serve weather data to the frontend
- Proxy requests to the external weather provider
- Persist search history / favorites (if configured)

## Quick Start

1. Install dependencies

```bash
cd backend
npm install
```

2. Create a `.env` file (copy from example or set vars):

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/weather-app
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

3. Start the server

```bash
npm start
```

The server will run on `http://localhost:PORT` (default `5000`).

## Scripts

- `npm start` — start the server (check `package.json` for the exact script)
- `npm test` — run backend tests (if present)

## Key Files

- `server.js` — server entry point
- `routes/weather.js` — API routes
- `controllers/weatherController.js` — request handlers
- `models/Weather.js` — data model (if using MongoDB)
- `config/db.js` — DB connection

## Environment Variables

- `PORT` — port to listen on
- `MONGO_URI` — MongoDB connection string
- `OPENWEATHER_API_KEY` — API key for external weather provider

## Notes

- Check `routes/` and `controllers/` for available endpoints and expected request/response shapes.
- If you change the backend port, update the `proxy` field in `frontend/package.json` during development.
