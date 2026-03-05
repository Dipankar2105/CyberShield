const config = require('../config/env');

const SCAM_TYPES = [
  'Digital Arrest', 'Phishing SMS', 'Bank KYC Fraud', 'Job Scam', 'Investment Fraud',
  'Lottery Scam', 'UPI Fraud', 'Tech Support Scam', 'Romance Scam', 'Customs Fraud',
  'Electricity Scam', 'Courier Scam', 'OTP Fraud', 'Insurance Scam', 'Loan Fraud',
  'Crypto Scam', 'Gift Card Scam', 'Fake Police Call', 'Income Tax Scam', 'Aadhaar Fraud'
];

const PLATFORMS = ['WhatsApp', 'SMS', 'Telegram', 'Email', 'Phone Call', 'Instagram', 'Facebook'];

async function generateScenario(req, res, next) {
  try {
    const scamType = SCAM_TYPES[Math.floor(Math.random() * SCAM_TYPES.length)];
    const platform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];

    const prompt = `Generate a realistic Indian scam simulation scenario for training purposes.

Scam Type: ${scamType}
Platform: ${platform}

Create a JSON response with:
1. "sender": A realistic fake sender name/number for this scam type (Indian context)
2. "message": The actual scam message (50-120 words, realistic, includes urgency tactics, Indian Rs amounts)
3. "options": Array of 3 response options, each with:
   - "id": "a", "b", or "c"
   - "text": Short response choice (under 15 words)
   - "isCorrect": boolean (only ONE should be true - the safe response)
   - "explanation": Why this choice is right/wrong (20-40 words)

Make it realistic and educational. The correct answer should always be to not engage/block/report.

Respond ONLY with valid JSON, no markdown.`;

    let scenario = null;

    // Try Together AI first
    if (config.TOGETHER_API_KEY) {
      try {
        const response = await fetch('https://api.together.xyz/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.TOGETHER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            max_tokens: 1024,
            temperature: 0.8,
          }),
        });
        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          scenario = JSON.parse(data.choices[0].message.content);
        }
      } catch (err) {
        console.warn('Together AI failed for simulation:', err.message);
      }
    }

    // Fallback to OpenRouter
    if (!scenario && config.OPENROUTER_API_KEY) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.3-70b-instruct:free',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1024,
            temperature: 0.8,
          }),
        });
        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          const content = data.choices[0].message.content;
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          scenario = JSON.parse(jsonMatch ? jsonMatch[0] : content);
        }
      } catch (err) {
        console.warn('OpenRouter failed for simulation:', err.message);
      }
    }

    if (!scenario) {
      // Fallback to hardcoded random scenario
      scenario = getRandomFallbackScenario();
    }

    res.json({
      id: Date.now(),
      type: scamType,
      platform: platform,
      ...scenario,
    });
  } catch (err) {
    next(err);
  }
}

function getRandomFallbackScenario() {
  const fallbacks = [
    {
      sender: '+91 98765 43210 (CBI Officer)',
      message: "URGENT: This is CBI calling. Your Aadhaar is linked to money laundering. Digital arrest warrant issued. Transfer ₹75,000 immediately to RBI security account to avoid arrest. Do not inform anyone or disconnect.",
      options: [
        { id: 'a', text: 'Transfer the money to avoid arrest.', isCorrect: false, explanation: 'Never pay under threats. "Digital arrest" is not real. CBI never demands money via calls.' },
        { id: 'b', text: 'Ask for official documentation.', isCorrect: false, explanation: 'Scammers have fake documents. Engaging gives them more manipulation opportunities.' },
        { id: 'c', text: 'Hang up and report to cybercrime.gov.in.', isCorrect: true, explanation: 'Correct! This is a scam. Real police never demand money or threaten arrest via phone.' }
      ]
    },
    {
      sender: 'SBI-KYC-ALERT',
      message: "Dear SBI Customer, Your account will be BLOCKED in 24 hours due to incomplete KYC. Update PAN & Aadhaar immediately: http://sbi-kyc-update.in/verify. Ignore this and lose access to your savings.",
      options: [
        { id: 'a', text: 'Click the link and update KYC quickly.', isCorrect: false, explanation: 'The link is fake. It will steal your login credentials and empty your account.' },
        { id: 'b', text: 'Call SBI official customer care to verify.', isCorrect: true, explanation: 'Correct! Always verify through official channels. Banks never send KYC links via SMS.' },
        { id: 'c', text: 'Reply asking for more time.', isCorrect: false, explanation: 'Replying confirms your number is active. Never engage with suspicious messages.' }
      ]
    },
    {
      sender: '+91 88776 55443 (Amazon HR)',
      message: "Congratulations! Selected for Amazon Work From Home. ₹30,000-60,000/month salary. Data entry job. Pay ₹1,499 registration fee now to secure your position. Limited seats! GPay: amazon.hr.jobs@oksbi",
      options: [
        { id: 'a', text: 'Pay the fee — great opportunity!', isCorrect: false, explanation: 'Amazon never charges for jobs. Registration fees are always scams.' },
        { id: 'b', text: 'Ask for official offer letter.', isCorrect: false, explanation: 'Scammers create convincing fake letters. Amazon does not recruit via WhatsApp.' },
        { id: 'c', text: 'Block and report — jobs never require payment.', isCorrect: true, explanation: 'Correct! Legitimate companies never charge candidates. This is job fraud.' }
      ]
    },
    {
      sender: 'Microsoft Support +1-800-555-0199',
      message: "ALERT: Your computer has been hacked! Hackers are stealing your passwords right now. Call us immediately or download AnyDesk and share access code so our technicians can remove the virus before your bank account is emptied!",
      options: [
        { id: 'a', text: 'Download AnyDesk and share code.', isCorrect: false, explanation: 'Never give remote access! They will steal your data and money once inside.' },
        { id: 'b', text: 'Call the number for help.', isCorrect: false, explanation: 'The number is fake. Microsoft never cold-calls about viruses.' },
        { id: 'c', text: 'Ignore — tech companies don\'t make unsolicited calls.', isCorrect: true, explanation: 'Correct! Microsoft never calls about detected viruses. This is tech support fraud.' }
      ]
    },
    {
      sender: '+91 99001 22334 (Delhi Customs)',
      message: "URGENT: Parcel in your name from Dubai containing gold, iPhone & foreign currency held at customs. Contents illegal under FEMA Act. Pay ₹95,000 penalty NOW or case forwarded to ED for seizure and arrest.",
      options: [
        { id: 'a', text: 'Pay to avoid legal trouble.', isCorrect: false, explanation: 'Customs never demands payment via WhatsApp. This is a scam.' },
        { id: 'b', text: 'Ask for official notice and case ID.', isCorrect: false, explanation: 'Scammers have fake documents. Real customs sends paper notices, not WhatsApp.' },
        { id: 'c', text: 'Ignore it completely — customs doesn\'t work this way.', isCorrect: true, explanation: 'Correct! Real customs sends official notices, not WhatsApp threats demanding instant payment.' }
      ]
    }
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

module.exports = { generateScenario };
