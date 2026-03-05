function calculateTrustScore({ aiResult, urlScanResult, threatIntelResult }) {
  const weights = { ai: 0.6, url: 0.2, threat: 0.2 };

  const aiScore = aiResult?.trustScore ?? 50;

  let urlScore = 100;
  if (urlScanResult) {
    if (urlScanResult.safe === false) urlScore = 0;
    else if (urlScanResult.safe === true) urlScore = 100;
    else urlScore = 50;
  }

  let threatScore = 100;
  if (threatIntelResult) {
    if (threatIntelResult.riskLevel === 'MALICIOUS' || threatIntelResult.riskLevel === 'MALWARE_DETECTED') threatScore = 0;
    else if (threatIntelResult.riskLevel === 'SUSPICIOUS') threatScore = 30;
    else if (threatIntelResult.riskLevel === 'CLEAN') threatScore = 100;
  }

  const composite = Math.round(
    aiScore * weights.ai + urlScore * weights.url + threatScore * weights.threat
  );

  let overallRisk = 'SAFE';
  if (composite < 30) overallRisk = 'FRAUD';
  else if (composite < 70) overallRisk = 'SUSPICIOUS';

  return {
    trustScore: composite,
    riskLevel: overallRisk,
    breakdown: {
      aiScore: Math.round(aiScore),
      urlSafetyScore: Math.round(urlScore),
      threatIntelScore: Math.round(threatScore),
    },
    weights,
  };
}

module.exports = { calculateTrustScore };
