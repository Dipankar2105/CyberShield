// Scam Detection Patterns and Prompts
// Used by the backend AI service for pattern-based pre-analysis

const SCAM_PATTERNS = {
  digitalArrest: {
    keywords: ['digital arrest', 'arrest warrant', 'CBI', 'police', 'cybercrime department', 'money laundering', 'Aadhaar linked', 'FIR registered', 'TRAI', 'narcotics'],
    urgencyPhrases: ['immediately', 'urgent', 'do not disconnect', 'transfer now', 'within 1 hour', 'legal action'],
    description: 'Digital Arrest Scam: Fraudsters impersonate law enforcement officers to extort money through fear and intimidation.',
  },
  phishing: {
    keywords: ['KYC update', 'account blocked', 'verify identity', 'click here', 'login', 'password expired', 'OTP', 'PAN card', 'bank account suspended'],
    urgencyPhrases: ['within 24 hours', 'account suspended', 'will be blocked', 'immediate action required'],
    description: 'Phishing Scam: Attempts to steal login credentials or personal data through fake websites or messages.',
  },
  investmentFraud: {
    keywords: ['guaranteed returns', 'double your money', 'crypto', 'bitcoin', 'investment opportunity', 'minimum deposit', 'daily profit', 'trading platform'],
    urgencyPhrases: ['limited offer', 'act now', 'exclusive', 'last chance', 'only today'],
    description: 'Investment Fraud: Promises unrealistic returns to steal money from victims.',
  },
  jobFraud: {
    keywords: ['work from home', 'easy money', 'hiring now', 'no experience needed', 'registration fee', 'data entry', 'part time job', 'daily payment'],
    urgencyPhrases: ['limited positions', 'apply now', 'immediate joining', 'today only'],
    description: 'Job Fraud: Fake job offers requiring upfront payment or personal information.',
  },
  lotterySweepstakes: {
    keywords: ['congratulations', 'lottery', 'winner', 'prize', 'claim your reward', 'selected', 'lucky draw'],
    urgencyPhrases: ['expires soon', 'claim within', 'processing fee', 'transfer charges'],
    description: 'Lottery/Sweepstakes Scam: Fake winning notifications asking for processing fees.',
  },
  upiFraud: {
    keywords: ['UPI', 'PhonePe', 'GPay', 'Paytm', 'collect request', 'payment link', 'QR code', 'scan to receive'],
    urgencyPhrases: ['receive money', 'enter PIN', 'verify payment'],
    description: 'UPI Fraud: Tricks victims into sending money via fake collect requests or payment links.',
  },
};

function detectPatterns(text) {
  const textLower = text.toLowerCase();
  const detected = [];

  for (const [type, pattern] of Object.entries(SCAM_PATTERNS)) {
    const keywordMatches = pattern.keywords.filter(k => textLower.includes(k.toLowerCase()));
    const urgencyMatches = pattern.urgencyPhrases.filter(p => textLower.includes(p.toLowerCase()));

    if (keywordMatches.length > 0 || urgencyMatches.length > 0) {
      detected.push({
        type,
        description: pattern.description,
        keywordMatches,
        urgencyMatches,
        confidence: Math.min(100, (keywordMatches.length + urgencyMatches.length) * 20),
      });
    }
  }

  return detected;
}

function getSystemPrompt() {
  return `You are a cybersecurity expert AI that detects social media scams and digital fraud.

Scam types to identify:
${Object.values(SCAM_PATTERNS).map(p => `- ${p.description}`).join('\n')}

Analysis criteria:
1. Language patterns (urgency, threats, authority impersonation)
2. Financial requests (money transfers, fees, deposits, UPI)
3. Link safety (suspicious URLs, shortened links)
4. Identity impersonation (government, banks, companies)
5. Social engineering techniques (fear, greed, curiosity)

Return structured JSON with trustScore, riskLevel, indicators, and explanation.`;
}

module.exports = { SCAM_PATTERNS, detectPatterns, getSystemPrompt };
