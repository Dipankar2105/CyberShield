// Image Analysis Pipeline
// Provides prompts and processing logic for screenshot scam detection

function getImageAnalysisPrompt() {
  return `You are a cybersecurity expert AI analyzing a screenshot for scam indicators.

Analysis pipeline:
1. Extract ALL visible text from the image (OCR)
2. Identify the platform (WhatsApp, SMS, Email, Instagram, Telegram, etc.)
3. Detect scam patterns in extracted text
4. Look for visual indicators (fake logos, unusual formatting, suspicious sender)
5. Classify the risk level

Scam types to detect:
- Digital Arrest (fake police/CBI threats via video call)
- Phishing (fake login pages, KYC requests, password reset)
- Financial Fraud (investment scams, lottery, fake payments)
- Impersonation (fake brand/government/bank accounts)
- Job Scams (fake hiring, registration fees)
- UPI Fraud (fake collect requests, "scan to receive" tricks)

Return structured JSON with:
- extractedText: all text found in the image
- trustScore: 0-100 (100 = safe, 0 = definite scam)
- riskLevel: "SAFE", "SUSPICIOUS", or "FRAUD"
- indicators: array of specific fraud indicators found
- explanation: brief analysis summary`;
}

function processImageResult(ocrText, aiResult) {
  return {
    extractedText: ocrText || aiResult.extractedText || '',
    trustScore: aiResult.trustScore,
    riskLevel: aiResult.riskLevel,
    indicators: aiResult.indicators || [],
    explanation: aiResult.explanation || '',
    platform: detectPlatform(ocrText || aiResult.extractedText || ''),
  };
}

function detectPlatform(text) {
  const textLower = text.toLowerCase();
  if (textLower.includes('whatsapp') || textLower.includes('wa.me')) return 'WhatsApp';
  if (textLower.includes('telegram') || textLower.includes('t.me')) return 'Telegram';
  if (textLower.includes('instagram') || textLower.includes('ig.me')) return 'Instagram';
  if (textLower.includes('facebook') || textLower.includes('fb.com')) return 'Facebook';
  if (textLower.includes('twitter') || textLower.includes('x.com')) return 'Twitter/X';
  return 'Unknown';
}

module.exports = { getImageAnalysisPrompt, processImageResult, detectPlatform };
