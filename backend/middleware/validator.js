const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};

const validateText = [
  body('text')
    .isString().withMessage('Text must be a string')
    .trim()
    .notEmpty().withMessage('Text is required')
    .isLength({ max: 10000 }).withMessage('Text too long (max 10000 chars)'),
  handleValidation,
];

const validateUrl = [
  body('url')
    .isURL().withMessage('Valid URL is required'),
  handleValidation,
];

const validateEmail = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  handleValidation,
];

const validateReport = [
  body('city')
    .isString().trim().notEmpty().withMessage('City is required'),
  body('scamType')
    .isString().trim().notEmpty().withMessage('Scam type is required'),
  body('description')
    .isString().trim().notEmpty()
    .isLength({ max: 2000 }).withMessage('Description required (max 2000 chars)'),
  handleValidation,
];

module.exports = { validateText, validateUrl, validateEmail, validateReport };
