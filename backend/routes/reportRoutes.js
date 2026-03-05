const express = require('express');
const router = express.Router();
const { validateReport } = require('../middleware/validator');
const reportController = require('../controllers/reportController');

router.post('/report-scam', validateReport, reportController.reportScam);
router.get('/fraud-map', reportController.getFraudMap);
router.get('/stats', reportController.getStats);

module.exports = router;
