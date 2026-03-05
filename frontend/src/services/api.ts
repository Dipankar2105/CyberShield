const API_BASE = '/api';

async function request(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function analyzeText(text: string) {
  return request('/analyze-text', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export async function analyzeImage(image: string, mimeType?: string) {
  return request('/analyze-image', {
    method: 'POST',
    body: JSON.stringify({ image, mimeType }),
  });
}

export async function scanUrl(url: string) {
  return request('/scan-url', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

export async function scanFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/scan-file`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function checkBreach(email: string) {
  return request('/check-breach', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function reportScam(data: {
  city: string;
  scamType: string;
  description: string;
  platform?: string;
  severity?: string;
}) {
  return request('/report-scam', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getFraudMap() {
  return request('/fraud-map');
}

export async function getStats() {
  return request('/stats');
}

export async function chatWithAI(message: string, history: { role: string; content: string }[] = []) {
  return request('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
}

export async function generateScenario() {
  return request('/generate-scenario');
}
