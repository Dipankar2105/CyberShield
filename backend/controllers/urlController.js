const threatService = require('../services/threatService');
const ScanResult = require('../models/ScanResult');
const ThreatLog = require('../models/ThreatLog');

async function scanUrl(req, res, next) {
  try {
    const { url } = req.body;

    // Run Safe Browsing and VirusTotal in parallel
    const [safeBrowsingResult, virusTotalResult] = await Promise.all([
      threatService.checkUrl(url).catch(err => ({ safe: null, message: err.message })),
      threatService.scanUrl(url).catch(err => ({ scanned: false, message: err.message })),
    ]);

    const result = {
      url,
      safeBrowsing: safeBrowsingResult,
      virusTotal: virusTotalResult,
      overallSafe: safeBrowsingResult.safe !== false && virusTotalResult.riskLevel !== 'MALICIOUS',
    };

    // Log threats
    if (!result.overallSafe) {
      ThreatLog.create({
        source: 'url-scan',
        threatType: 'phishing',
        details: result,
        severity: 'High',
      }).catch(() => {});
    }

    ScanResult.create({
      type: 'url',
      input: url,
      result: { rawData: result, riskLevel: result.overallSafe ? 'SAFE' : 'FRAUD' },
    }).catch(() => {});

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { scanUrl };
