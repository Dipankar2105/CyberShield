// Composite Trust Score Algorithm
// Aggregates signals from AI analysis, URL scanning, and threat intelligence

function computeTrustScore(signals) {
  const {
    aiScore = 50,
    patternScore = 50,
    urlSafetyScore = 100,
    senderReputationScore = 50,
    contentAnalysisScore = 50,
  } = signals;

  const weights = {
    ai: 0.35,
    pattern: 0.25,
    url: 0.15,
    sender: 0.10,
    content: 0.15,
  };

  const composite = Math.round(
    aiScore * weights.ai +
    patternScore * weights.pattern +
    urlSafetyScore * weights.url +
    senderReputationScore * weights.sender +
    contentAnalysisScore * weights.content
  );

  let riskLevel = 'SAFE';
  if (composite < 30) riskLevel = 'FRAUD';
  else if (composite < 60) riskLevel = 'SUSPICIOUS';

  let riskCategory = 'None';
  if (riskLevel === 'FRAUD') {
    if (patternScore < 20) riskCategory = 'Digital Arrest Scam';
    else if (urlSafetyScore < 30) riskCategory = 'Phishing';
    else riskCategory = 'Social Engineering';
  } else if (riskLevel === 'SUSPICIOUS') {
    riskCategory = 'Potentially Unsafe';
  }

  return {
    trustScore: Math.max(0, Math.min(100, composite)),
    riskLevel,
    riskCategory,
    breakdown: { aiScore, patternScore, urlSafetyScore, senderReputationScore, contentAnalysisScore },
    weights,
    timestamp: new Date().toISOString(),
  };
}

module.exports = { computeTrustScore };
