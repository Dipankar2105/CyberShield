const mongoose = require('mongoose');

const fraudReportSchema = new mongoose.Schema({
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    city: { type: String, required: true },
  },
  scamType: { type: String, required: true },
  description: { type: String, required: true },
  platform: { type: String, default: 'Unknown' },
  severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  reportedBy: { type: String, default: 'Anonymous' },
}, { timestamps: true });

module.exports = mongoose.model('FraudReport', fraudReportSchema);
