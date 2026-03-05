const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

const scanLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Scan rate limit exceeded. Please wait a moment.' },
});

module.exports = { apiLimiter, scanLimiter };
