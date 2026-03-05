const aiService = require('../services/aiService');
const ScanResult = require('../models/ScanResult');

async function analyzeText(req, res, next) {
  try {
    const { text } = req.body;
    const result = await aiService.analyzeText(text);

    // Save scan result (non-blocking)
    ScanResult.create({
      type: 'text',
      input: text.substring(0, 500),
      result,
      metadata: result.metadata,
    }).catch(err => console.warn('DB save failed:', err.message));

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { analyzeText };
