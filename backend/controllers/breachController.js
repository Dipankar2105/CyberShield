const breachService = require('../services/breachService');
const ScanResult = require('../models/ScanResult');

async function checkBreach(req, res, next) {
  try {
    const { email } = req.body;
    const result = await breachService.checkEmail(email);

    ScanResult.create({
      type: 'breach',
      input: email.substring(0, 3) + '***@***',
      result: { rawData: result, riskLevel: result.breached ? 'FRAUD' : 'SAFE' },
    }).catch(() => {});

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { checkBreach };
