const express = require('express');
const router = express.Router();
const { validateText } = require('../middleware/validator');
const textController = require('../controllers/textController');
const imageController = require('../controllers/imageController');
const chatController = require('../controllers/chatController');
const simulationController = require('../controllers/simulationController');

router.post('/analyze-text', validateText, textController.analyzeText);
router.post('/analyze-image', imageController.analyzeImage);
router.post('/chat', chatController.chat);
router.get('/generate-scenario', simulationController.generateScenario);

module.exports = router;
