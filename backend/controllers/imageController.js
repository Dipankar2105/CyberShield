const aiService = require('../services/aiService');
const ScanResult = require('../models/ScanResult');

async function analyzeImage(req, res, next) {
  try {
    const { image, mimeType } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required (base64)' });
    }

    // Remove data URL prefix if present
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const detectedMime = mimeType || (image.includes('data:') ? image.split(';')[0].split(':')[1] : 'image/png');

    const result = await aiService.analyzeImage(base64Data, detectedMime);

    ScanResult.create({
      type: 'image',
      input: '[image upload]',
      result,
      metadata: result.metadata,
    }).catch(err => console.warn('DB save failed:', err.message));

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { analyzeImage };
