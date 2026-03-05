const threatService = require('../services/threatService');
const ScanResult = require('../models/ScanResult');

async function scanFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const result = await threatService.scanFile(req.file.buffer, req.file.originalname);

    ScanResult.create({
      type: 'file',
      input: req.file.originalname,
      result: { rawData: result, riskLevel: result.riskLevel || 'UNKNOWN' },
    }).catch(() => {});

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { scanFile };
