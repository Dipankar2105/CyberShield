const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/env');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const analyzeRoutes = require('./routes/analyzeRoutes');
const scanRoutes = require('./routes/scanRoutes');
const breachRoutes = require('./routes/breachRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/api', apiLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', analyzeRoutes);
app.use('/api', scanRoutes);
app.use('/api', breachRoutes);
app.use('/api', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CyberShield API',
    timestamp: new Date().toISOString(),
    apis: {
      gemini: !!config.GEMINI_API_KEY,
      together: !!config.TOGETHER_API_KEY,
      openrouter: !!config.OPENROUTER_API_KEY,
      virustotal: !!config.VIRUSTOTAL_API_KEY,
      safebrowsing: !!config.SAFE_BROWSING_API_KEY,
      hibp: !!config.HIBP_API_KEY,
    },
  });
});

// Error handler
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
mongoose.connect(config.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(config.PORT, () => {
      console.log(`CyberShield API running on http://localhost:${config.PORT}`);
    });
  })
  .catch(err => {
    console.warn('MongoDB connection failed:', err.message);
    console.log('Starting in demo mode (no database persistence)...');
    app.listen(config.PORT, () => {
      console.log(`CyberShield API running on http://localhost:${config.PORT} (demo mode)`);
    });
  });

module.exports = app;
