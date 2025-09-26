const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { query, body } = require('express-validator');
const geoCtrl = require('../controllers/geoController');

const fetchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

// a) GET /api/geo-data  -> fetch from API (no save)
router.get(
  '/',
  fetchLimiter,
  [
    query('lat').exists().withMessage('lat is required').isFloat({ min: -90, max: 90 }),
    query('lon').exists().withMessage('lon is required').isFloat({ min: -180, max: 180 }),
  ],
  geoCtrl.fetchFromApi
);

// b) POST /api/geo-data -> save a document
router.post(
  '/',
  [
    body('lat').exists().withMessage('lat is required').isFloat({ min: -90, max: 90 }),
    body('lon').exists().withMessage('lon is required').isFloat({ min: -180, max: 180 }),
    body('payload').optional().isObject().withMessage('payload must be an object'),
    body('source').optional().isString(),
  ],
  geoCtrl.saveGeoData
);

// c) GET /api/geo-data/all -> list with filters
router.get(
  '/all',
  [
    query('start').optional().isISO8601().withMessage('start must be a date'),
    query('end').optional().isISO8601().withMessage('end must be a date'),
    query('lat').optional().isFloat({ min: -90, max: 90 }),
    query('lon').optional().isFloat({ min: -180, max: 180 }),
    query('radiusKm').optional().isFloat({ gt: 0 }),
  ],
  geoCtrl.listGeoData
);

// d) GET /api/geo-data/:id -> single doc
router.get('/:id', geoCtrl.getById);

module.exports = router;
