const aiService = require('../services/aiService');

async function chat(req, res, next) {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const reply = await aiService.chat(message.trim(), history || []);
    res.json({ reply });
  } catch (err) {
    next(err);
  }
}

module.exports = { chat };
