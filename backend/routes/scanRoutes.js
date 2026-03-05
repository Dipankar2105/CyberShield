const express = require('express');
const router = express.Router();
const multer = require('multer');
const { validateUrl } = require('../middleware/validator');
const urlController = require('../controllers/urlController');
const fileController = require('../controllers/fileController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 32 * 1024 * 1024 },
});

router.post('/scan-url', validateUrl, urlController.scanUrl);
router.post('/scan-file', upload.single('file'), fileController.scanFile);

module.exports = router;
