const { GoogleGenAI, Type } = require('@google/genai');
const config = require('../config/env');

// ── Response Schemas ──────────────────────────────────────────────────────────

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    trustScore: { type: Type.NUMBER, description: '0-100, where 100 is completely safe' },
    riskLevel: { type: Type.STRING, description: 'SAFE, SUSPICIOUS, or FRAUD' },
    indicators: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Specific fraud indicators found' },
    explanation: { type: Type.STRING, description: 'Brief clear explanation of the analysis' },
  },
  required: ['trustScore', 'riskLevel', 'indicators', 'explanation'],
};

const imageResponseSchema = {
  type: Type.OBJECT,
  properties: {
    extractedText: { type: Type.STRING, description: 'The main text extracted from the image' },
    trustScore: { type: Type.NUMBER, description: '0-100, where 100 is completely safe' },
    riskLevel: { type: Type.STRING, description: 'SAFE, SUSPICIOUS, or FRAUD' },
    indicators: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Specific fraud indicators found' },
    explanation: { type: Type.STRING, description: 'Brief clear explanation of the analysis' },
  },
  required: ['extractedText', 'trustScore', 'riskLevel', 'indicators', 'explanation'],
};

// ── System Prompts ────────────────────────────────────────────────────────────

const SCAM_ANALYSIS_PROMPT = `You are a cybersecurity expert AI. Analyze the following message for:
- Social media scams (WhatsApp, Telegram, Instagram, SMS)
- Digital arrest fraud patterns (fake police/CBI threats, Aadhaar misuse threats, "digital arrest warrant")
- Phishing attempts (fake bank KYC, account verification)
- Urgency/pressure tactics and legal intimidation
- Authority impersonation (government, police, banks)
- Financial fraud (investment scams, lottery, job fraud)
- Suspicious URLs or phone numbers

Classify the risk accurately:
- SAFE: Legitimate message with no fraud indicators
- SUSPICIOUS: Some concerning patterns but not definitively fraud
- FRAUD: Clear scam/phishing/fraud indicators present

Return JSON with trustScore (0-100, 100=safe), riskLevel (SAFE/SUSPICIOUS/FRAUD), indicators (array), explanation (string).`;

const IMAGE_ANALYSIS_PROMPT = `You are a cybersecurity expert AI. Analyze this screenshot for:
- Social media scams and phishing attempts
- Digital arrest fraud (fake police/CBI threats)
- Suspicious URLs or links visible in the image
- Authority impersonation and fake branding
- Financial fraud indicators
- Fake notifications or alerts

Extract ALL visible text from the image and analyze it for threats.
Return JSON with extractedText, trustScore (0-100), riskLevel (SAFE/SUSPICIOUS/FRAUD), indicators (array), explanation (string).`;

// ── Gemini Provider ───────────────────────────────────────────────────────────

async function analyzeWithGemini(prompt, text) {
  const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${prompt}\n\nMessage: "${text}"`,
    config: {
      responseMimeType: 'application/json',
      responseSchema,
    },
  });
  return JSON.parse(response.text.trim());
}

async function analyzeImageWithGemini(base64Data, mimeType) {
  const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: IMAGE_ANALYSIS_PROMPT },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: imageResponseSchema,
    },
  });
  return JSON.parse(response.text.trim());
}

// ── Together AI Provider (Fallback 1) ─────────────────────────────────────────

async function analyzeWithTogether(prompt, text) {
  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.TOGETHER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Analyze this message: "${text}"\n\nRespond ONLY with valid JSON: { "trustScore": number, "riskLevel": "SAFE"|"SUSPICIOUS"|"FRAUD", "indicators": [...], "explanation": "..." }` },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1024,
      temperature: 0.3,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Together AI request failed');
  return JSON.parse(data.choices[0].message.content);
}

// ── OpenRouter Provider (Fallback 2) ──────────────────────────────────────────

async function analyzeWithOpenRouter(prompt, text) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Analyze this message: "${text}"\n\nRespond ONLY with valid JSON: { "trustScore": number, "riskLevel": "SAFE"|"SUSPICIOUS"|"FRAUD", "indicators": [...], "explanation": "..." }` },
      ],
      max_tokens: 1024,
      temperature: 0.3,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'OpenRouter request failed');
  const content = data.choices[0].message.content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : content);
}

// ── Result Normalization ──────────────────────────────────────────────────────

function normalizeResult(result) {
  const validLevels = ['SAFE', 'SUSPICIOUS', 'FRAUD'];
  let riskLevel = String(result.riskLevel || '').toUpperCase();

  if (riskLevel.includes('HIGH') || riskLevel.includes('FRAUD') || riskLevel.includes('SCAM') || riskLevel.includes('DANGER'))
    riskLevel = 'FRAUD';
  else if (riskLevel.includes('SUSPICIOUS') || riskLevel.includes('MEDIUM') || riskLevel.includes('WARNING'))
    riskLevel = 'SUSPICIOUS';
  else if (riskLevel.includes('SAFE') || riskLevel.includes('LOW') || riskLevel.includes('CLEAN') || riskLevel.includes('LEGITIMATE'))
    riskLevel = 'SAFE';

  if (!validLevels.includes(riskLevel)) riskLevel = 'SUSPICIOUS';

  return {
    trustScore: Math.max(0, Math.min(100, Number(result.trustScore) || 50)),
    riskLevel,
    indicators: Array.isArray(result.indicators) ? result.indicators : [],
    explanation: String(result.explanation || 'Analysis completed.'),
  };
}

function normalizeImageResult(result) {
  return {
    ...normalizeResult(result),
    extractedText: String(result.extractedText || ''),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

async function analyzeText(text) {
  const startTime = Date.now();
  let modelUsed = '';

  // Try Together AI first (primary)
  if (config.TOGETHER_API_KEY) {
    try {
      modelUsed = 'together-llama-3.3-70b';
      const result = await analyzeWithTogether(SCAM_ANALYSIS_PROMPT, text);
      return { ...normalizeResult(result), metadata: { model: modelUsed, processingTime: Date.now() - startTime } };
    } catch (err) {
      console.warn('Together AI failed:', err.message);
    }
  }

  // Fallback: OpenRouter
  if (config.OPENROUTER_API_KEY) {
    try {
      modelUsed = 'openrouter-llama-3.3-70b';
      const result = await analyzeWithOpenRouter(SCAM_ANALYSIS_PROMPT, text);
      return { ...normalizeResult(result), metadata: { model: modelUsed, processingTime: Date.now() - startTime } };
    } catch (err) {
      console.warn('OpenRouter failed:', err.message);
    }
  }

  // Fallback: Gemini
  if (config.GEMINI_API_KEY) {
    try {
      modelUsed = 'gemini-2.5-flash';
      const result = await analyzeWithGemini(SCAM_ANALYSIS_PROMPT, text);
      return { ...normalizeResult(result), metadata: { model: modelUsed, processingTime: Date.now() - startTime } };
    } catch (err) {
      console.warn('Gemini failed:', err.message);
    }
  }

  throw new Error('All AI providers failed. Please check your API keys.');
}

async function analyzeImage(base64Data, mimeType) {
  const startTime = Date.now();
  try {
    const result = await analyzeImageWithGemini(base64Data, mimeType);
    return { ...normalizeImageResult(result), metadata: { model: 'gemini-2.5-flash', processingTime: Date.now() - startTime } };
  } catch (err) {
    console.error('Image analysis failed:', err.message);
    throw new Error('Image analysis failed. Gemini multimodal is required for image analysis.');
  }
}

async function chat(message, history = []) {
  const systemPrompt = `You are CyberShield AI, a cybersecurity expert assistant. Help users understand:
- How to identify social media scams and phishing
- Digital arrest fraud patterns and how to respond
- Online safety best practices
- How to report cybercrime in India (cybercrime.gov.in, 1930 helpline)
- Password security and data breach prevention
Be concise, helpful, and provide actionable advice. If asked about non-cybersecurity topics, politely redirect.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ];

  // Try OpenRouter first (primary)
  if (config.OPENROUTER_API_KEY) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages,
          max_tokens: 1024,
        }),
      });
      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      }
      throw new Error(data.error?.message || 'OpenRouter returned empty response');
    } catch (err) {
      console.warn('OpenRouter chat failed:', err.message);
    }
  }

  // Fallback: Together AI
  if (config.TOGETHER_API_KEY) {
    try {
      const res = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
          messages,
          max_tokens: 1024,
        }),
      });
      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      }
      throw new Error(data.error?.message || 'Together AI returned empty response');
    } catch (err) {
      console.warn('Together AI chat failed:', err.message);
    }
  }

  // Fallback: Gemini
  if (config.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
      const historyStr = history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n');
      const fullPrompt = `${systemPrompt}\n\n${historyStr ? 'Previous conversation:\n' + historyStr + '\n\n' : ''}User: ${message}\n\nRespond as CyberShield AI:`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      });
      return response.text;
    } catch (err) {
      console.warn('Gemini chat failed:', err.message);
    }
  }

  throw new Error('All AI providers failed. Please check your API keys.');
}

module.exports = { analyzeText, analyzeImage, chat };
