const GeoData = require('../models/GeoData');
const { validationResult } = require('express-validator');

const makeError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// GET /api/geo-data?lat=..&lon=..
exports.fetchFromApi = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(makeError(errors.array()[0].msg, 422));

  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);

  // Open-Meteo example: current weather
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current_weather', 'true');

  fetch(url.toString())
    .then((r) => {
      if (!r.ok) throw makeError(`Upstream API error (${r.status})`, 502);
      return r.json();
    })
    .then((data) => {
      res.json({ success: true, source: 'open-meteo', requestUrl: url.toString(), data });
    })
    .catch(next);
};

// POST /api/geo-data
exports.saveGeoData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(makeError(errors.array()[0].msg, 422));

  const { lat, lon, payload, source } = req.body;

  const doc = new GeoData({
    source: source || 'custom',
    location: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] },
    params: { lat, lon, requestUrl: null },
    payload: payload || {},
    fetchedAt: new Date(),
  });

  doc
    .save()
    .then((saved) => res.status(201).json({ success: true, id: saved._id }))
    .catch(next);
};

// GET /api/geo-data/all
exports.listGeoData = (req, res, next) => {
  const { start, end, lat, lon, radiusKm } = req.query;

  const filter = {};
  if (start || end) {
    filter.fetchedAt = {};
    if (start) filter.fetchedAt.$gte = new Date(start);
    if (end) filter.fetchedAt.$lte = new Date(end);
  }

  const doQuery = () => {
    return GeoData.find(filter).sort({ createdAt: -1 }).limit(500).lean();
  };

  if (lat && lon && radiusKm) {
    const meters = parseFloat(radiusKm) * 1000;
    filter.location = {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] },
        $maxDistance: meters,
      },
    };
  }

  doQuery()
    .then((docs) => res.json({ success: true, count: docs.length, data: docs }))
    .catch(next);
};

// GET /api/geo-data/:id
exports.getById = (req, res, next) => {
  GeoData.findById(req.params.id)
    .lean()
    .then((doc) => {
      if (!doc) throw makeError('Document not found', 404);
      res.json({ success: true, data: doc });
    })
    .catch(next);
};
