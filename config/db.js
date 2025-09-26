const mongoose = require('mongoose');

module.exports = function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/geodata_db';
  const opts = { useNewUrlParser: true, useUnifiedTopology: true };
  return mongoose.connect(uri, opts);
};
