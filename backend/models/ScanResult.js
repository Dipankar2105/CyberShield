const mongoose = require('mongoose');

const scanResultSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'image', 'url', 'file', 'breach'],
    required: true,
  },
  input: { type: String },
  result: {
    trustScore: { type: Number },
    riskLevel: { type: String, enum: ['SAFE', 'SUSPICIOUS', 'FRAUD'] },
    indicators: [{ type: String }],
    explanation: { type: String },
    extractedText: { type: String },
    rawData: { type: mongoose.Schema.Types.Mixed },
  },
  metadata: {
    model: { type: String },
    processingTime: { type: Number },
    source: { type: String },
  },
}, { timestamps: true });

module.exports = mongoose.model('ScanResult', scanResultSchema);
