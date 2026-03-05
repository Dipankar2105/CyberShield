const express = require('express');
const router = express.Router();
const { validateEmail } = require('../middleware/validator');
const breachController = require('../controllers/breachController');

router.post('/check-breach', validateEmail, breachController.checkBreach);

module.exports = router;
