const mongoose = require('mongoose');

const GeoDataSchema = new mongoose.Schema(
  {
    source: { type: String, default: 'open-meteo' },
    location: {
      type: { type: String, enum: ['Point'], required: true, default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lon, lat]
    },
    params: {
      lat: Number,
      lon: Number,
      requestUrl: String,
    },
    fetchedAt: { type: Date, default: Date.now },
    payload: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

GeoDataSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('GeoData', GeoDataSchema);
