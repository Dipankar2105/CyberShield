const crypto = require('crypto');
const config = require('../config/env');

// ── Google Safe Browsing API ──────────────────────────────────────────────────

async function checkUrl(url) {
  if (!config.SAFE_BROWSING_API_KEY) {
    return { safe: null, message: 'Safe Browsing API key not configured' };
  }

  const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(config.SAFE_BROWSING_API_KEY)}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: { clientId: 'cybershield', clientVersion: '1.0.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }],
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const status = errData?.error?.status || response.status;
      
      if (status === 403 || status === 'PERMISSION_DENIED' || errData?.error?.code === 403) {
        return { safe: null, message: 'Safe Browsing API not enabled. Enable it at console.cloud.google.com' };
      }
      if (status === 400) {
        return { safe: null, message: 'Invalid API key or request' };
      }
      return { safe: null, message: `API error (${response.status})` };
    }

    const data = await response.json();

    if (data.matches && data.matches.length > 0) {
      return {
        safe: false,
        threats: data.matches.map(m => ({
          type: m.threatType,
          platform: m.platformType,
          url: m.threat.url,
        })),
        message: `URL flagged: ${data.matches.map(m => m.threatType).join(', ')}`,
      };
    }

    return { safe: true, threats: [], message: 'URL appears safe (Google Safe Browsing)' };
  } catch (err) {
    return { safe: null, message: 'Safe Browsing check failed - service unavailable' };
  }
}

// ── VirusTotal API ────────────────────────────────────────────────────────────

async function scanFile(fileBuffer, fileName) {
  if (!config.VIRUSTOTAL_API_KEY) {
    return { scanned: false, message: 'VirusTotal API key not configured' };
  }

  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  // Check existing report by hash
  const reportResponse = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
    headers: { 'x-apikey': config.VIRUSTOTAL_API_KEY },
  });

  if (reportResponse.ok) {
    const report = await reportResponse.json();
    const stats = report.data?.attributes?.last_analysis_stats || {};
    const totalEngines = Object.values(stats).reduce((a, b) => Number(a) + Number(b), 0);
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;

    return {
      scanned: true,
      hash,
      fileName,
      stats,
      malicious,
      suspicious,
      totalEngines,
      detectionRate: totalEngines > 0 ? `${malicious + suspicious}/${totalEngines}` : 'N/A',
      riskLevel: malicious > 0 ? 'MALWARE_DETECTED' : suspicious > 0 ? 'SUSPICIOUS' : 'CLEAN',
      permalink: `https://www.virustotal.com/gui/file/${hash}`,
    };
  }

  // File not in VT database — upload for scanning
  if (reportResponse.status === 404) {
    try {
      // Upload file to VirusTotal
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
      formData.append('file', blob, fileName);

      const uploadResponse = await fetch('https://www.virustotal.com/api/v3/files', {
        method: 'POST',
        headers: { 'x-apikey': config.VIRUSTOTAL_API_KEY },
        body: formData,
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        const analysisId = uploadData.data?.id;

        // Wait a bit and check analysis status
        await new Promise(resolve => setTimeout(resolve, 3000));

        const analysisResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
          headers: { 'x-apikey': config.VIRUSTOTAL_API_KEY },
        });

        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          const status = analysisData.data?.attributes?.status;
          const stats = analysisData.data?.attributes?.stats || {};

          if (status === 'completed') {
            const totalEngines = Object.values(stats).reduce((a, b) => Number(a) + Number(b), 0);
            const malicious = stats.malicious || 0;
            const suspicious = stats.suspicious || 0;

            return {
              scanned: true,
              hash,
              fileName,
              stats,
              malicious,
              suspicious,
              totalEngines,
              detectionRate: totalEngines > 0 ? `${malicious + suspicious}/${totalEngines}` : 'N/A',
              riskLevel: malicious > 0 ? 'MALWARE_DETECTED' : suspicious > 0 ? 'SUSPICIOUS' : 'CLEAN',
              permalink: `https://www.virustotal.com/gui/file/${hash}`,
            };
          }

          return {
            scanned: true,
            hash,
            fileName,
            status: 'queued',
            riskLevel: 'PENDING',
            message: 'File uploaded for scanning. Analysis in progress — check back in 1-2 minutes.',
            permalink: `https://www.virustotal.com/gui/file/${hash}`,
          };
        }
      }

      return {
        scanned: true,
        hash,
        fileName,
        status: 'upload_failed',
        riskLevel: 'UNKNOWN',
        message: 'File upload failed. This may be due to API rate limits.',
        permalink: `https://www.virustotal.com/gui/file/${hash}`,
      };
    } catch (err) {
      console.error('VT file upload error:', err.message);
      return {
        scanned: true,
        hash,
        fileName,
        status: 'not_found',
        riskLevel: 'UNKNOWN',
        message: 'File not found in database. Upload for scanning failed.',
        permalink: `https://www.virustotal.com/gui/file/${hash}`,
      };
    }
  }

  return { scanned: false, hash, message: 'Unable to query VirusTotal' };
}

// ── VirusTotal URL Scan ───────────────────────────────────────────────────────

async function scanUrl(url) {
  if (!config.VIRUSTOTAL_API_KEY) {
    return { scanned: false, message: 'VirusTotal API key not configured' };
  }

  const urlId = Buffer.from(url).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const response = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
    headers: { 'x-apikey': config.VIRUSTOTAL_API_KEY },
  });

  if (response.ok) {
    const data = await response.json();
    const stats = data.data?.attributes?.last_analysis_stats || {};
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;

    return {
      scanned: true,
      url,
      stats,
      malicious,
      suspicious,
      riskLevel: malicious > 0 ? 'MALICIOUS' : suspicious > 0 ? 'SUSPICIOUS' : 'CLEAN',
    };
  }

  // Submit URL for scanning
  if (response.status === 404) {
    const submitResponse = await fetch('https://www.virustotal.com/api/v3/urls', {
      method: 'POST',
      headers: {
        'x-apikey': config.VIRUSTOTAL_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `url=${encodeURIComponent(url)}`,
    });

    if (submitResponse.ok) {
      return { scanned: true, url, status: 'queued', riskLevel: 'PENDING', message: 'URL submitted for analysis. Check back shortly.' };
    }
  }

  return { scanned: false, url, message: 'Unable to scan URL with VirusTotal' };
}

module.exports = { checkUrl, scanFile, scanUrl };
