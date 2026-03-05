const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cybershield',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  TOGETHER_API_KEY: process.env.TOGETHER_API_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  VIRUSTOTAL_API_KEY: process.env.VIRUSTOTAL_API_KEY,
  SAFE_BROWSING_API_KEY: process.env.SAFE_BROWSING_API_KEY,
  HIBP_API_KEY: process.env.HIBP_API_KEY,
};
