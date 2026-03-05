const mongoose = require('mongoose');

const threatLogSchema = new mongoose.Schema({
  source: { type: String, required: true },
  threatType: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },
  resolved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('ThreatLog', threatLogSchema);
