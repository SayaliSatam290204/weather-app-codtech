#weather-app-codtech

*COMPANY*: CODTECH IT SOLUTIONS

*NAME*: SAYALI SURYAKANT SATAM

*INTERN ID*: CTIS1140

*DOMAIN*: MERN STACK WEB DEVELOPEMENT

*DURATION*: 6 WEEKS

*MENTOR*: NEELA SANTOSH


# Weather App (Codtech)

A simple full-stack weather application with a Node.js backend and a React frontend.

## Features

- Search current weather by city
- View forecast, search history, and favorites
- Backend API that proxies requests to a weather provider

## Repository Structure

- `backend/` — Node.js API server (server.js)
- `frontend/` — React app (create-react-app structure)
- `models/`, `controllers/`, `routes/`, `config/` — backend components

For detailed instructions, see the component READMEs:

- Backend: `backend/README.md`
- Frontend: `frontend/README.md`

## Prerequisites

- Node.js 16+ and npm
- (Optional) MongoDB if using persistence
- An API key from OpenWeatherMap (or your chosen weather API)

## Environment Variables

Create a `.env` file in `backend/` with the following values:

- `PORT` — port for the backend server (e.g., 5000)
- `MONGO_URI` — MongoDB connection string (if used)
- `OPENWEATHER_API_KEY` — API key for the weather provider

## Setup & Run

Backend

```bash
cd backend
npm install
# create a .env as described above
npm start
```

Frontend

```bash
cd frontend
npm install
npm start
```

From development, the frontend will typically run on `http://localhost:3000` and the backend on the port you set in `.env` (commonly `http://localhost:5000`). Adjust proxy settings in `frontend/package.json` if needed.

## Database

If the app uses MongoDB, ensure `MONGO_URI` points to your database. The backend includes `config/db.js` for connecting.

## Testing

Frontend tests (if present)

```bash
cd frontend
npm test
```

Backend tests (if present)

```bash
cd backend
npm test
```

## Deployment

- Build frontend: `cd frontend && npm run build`
- Serve the static build with any static host or integrate with the backend for fullstack hosting.

## Troubleshooting

- 500 errors: check backend logs and that `OPENWEATHER_API_KEY` is set.
- DB connectivity: confirm `MONGO_URI` and that MongoDB is reachable.

## Contributing

1. Fork the repo
2. Create a feature branch
3. Open a PR with a clear description

## License

This project does not include a license file. Add a `LICENSE` if you plan to publish.

---

<img width="1919" height="985" alt="Image" src="https://github.com/user-attachments/assets/e69050d3-2c05-42ea-a01f-c49b8e52668b" />

<img width="1919" height="1079" alt="Image" src="https://github.com/user-attachments/assets/f6244807-ba94-4bfb-a0a5-32f9f2984c50" />
