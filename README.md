# Geospatial Data API Integration (Open-Meteo) + MongoDB

This Node.js app fetches geospatial weather data from **Open-Meteo** by latitude/longitude, stores results in MongoDB with a GeoJSON `Point` (2dsphere index), and provides REST endpoints to fetch, store, list, and retrieve entries.

## Tech

- Node.js + Express
- MongoDB + Mongoose (GeoJSON + 2dsphere)
- Open-Meteo (no API key)
- express-validator (input validation)
- express-rate-limit (bonus)

## Setup

```bash
git clone https://github.com/PeeplesKaitlyn-FS/Geospatial-Data-Api.git
cd geospatial-data-api
cp .env.example .env   
npm install
npm run dev
