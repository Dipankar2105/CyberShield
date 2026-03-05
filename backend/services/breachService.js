const config = require('../config/env');

async function checkEmail(email) {
  const headers = {
    'User-Agent': 'CyberShield-App',
  };

  if (config.HIBP_API_KEY) {
    headers['hibp-api-key'] = config.HIBP_API_KEY;
  }

  const response = await fetch(
    `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
    { headers }
  );

  if (response.status === 404) {
    return { breached: false, breaches: [], message: 'No breaches found for this email.' };
  }

  if (response.status === 401) {
    return {
      breached: null,
      breaches: [],
      message: 'HIBP API key required for breach lookups. Get one at haveibeenpwned.com/API/Key',
    };
  }

  if (response.status === 429) {
    return { breached: null, breaches: [], message: 'Rate limited by HIBP. Please try again later.' };
  }

  if (!response.ok) {
    throw new Error(`HIBP API returned status ${response.status}`);
  }

  const breaches = await response.json();
  return {
    breached: true,
    count: breaches.length,
    breaches: breaches.map(b => ({
      name: b.Name,
      domain: b.Domain,
      breachDate: b.BreachDate,
      pwnCount: b.PwnCount,
      dataClasses: b.DataClasses,
      description: b.Description,
    })),
    message: `Found in ${breaches.length} data breach(es).`,
  };
}

module.exports = { checkEmail };
