// API Client for Factora Multimodal Backend

const API_BASE = '/api/v1';

export function getStoredToken() {
  return localStorage.getItem('factora_token') || '';
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('factora_token', token);
  } else {
    localStorage.removeItem('factora_token');
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('factora_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('factora_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('factora_user');
  }
}

function getAuthHeaders(isJson = true) {
  const headers = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function signupUser(username, email, password) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || 'Registration failed');
  }
  const data = await res.json();
  setStoredToken(data.access_token);
  setStoredUser(data.user);
  return data;
}

export async function loginUser(username_or_email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username_or_email, password })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
    throw new Error(err.detail || 'Authentication failed');
  }
  const data = await res.json();
  setStoredToken(data.access_token);
  setStoredUser(data.user);
  return data;
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    throw new Error('Not authenticated');
  }
  return res.json();
}

export async function detectText(text, title = '') {
  const res = await fetch(`${API_BASE}/detect/text`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify({ text, title })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Text analysis failed' }));
    throw new Error(err.detail || 'Text analysis failed');
  }
  return res.json();
}

export async function detectImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/detect/image`, {
    method: 'POST',
    headers: getAuthHeaders(false),
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Image analysis failed' }));
    throw new Error(err.detail || 'Image analysis failed');
  }
  return res.json();
}

export async function detectVideo(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/detect/video`, {
    method: 'POST',
    headers: getAuthHeaders(false),
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Video analysis failed' }));
    throw new Error(err.detail || 'Video analysis failed');
  }
  return res.json();
}

export async function detectAudio(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/detect/audio`, {
    method: 'POST',
    headers: getAuthHeaders(false),
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Audio analysis failed' }));
    throw new Error(err.detail || 'Audio analysis failed');
  }
  return res.json();
}

export async function getHistory(modality = null) {
  let url = `${API_BASE}/detect/history?limit=30`;
  if (modality) {
    url += `&modality=${modality}`;
  }
  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    throw new Error('Failed to fetch history');
  }
  return res.json();
}

export async function submitFeedback(record_id, rating, feedback_text, suggested_verdict = null) {
  const res = await fetch(`${API_BASE}/detect/feedback`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify({
      record_id,
      rating,
      feedback_text,
      suggested_verdict
    })
  });
  if (!res.ok) {
    throw new Error('Failed to submit feedback');
  }
  return res.json();
}

// -------------------------------------------------------------
// Live News Radar
// -------------------------------------------------------------
export async function fetchLiveNews(category = 'general', query = null) {
  let url = `${API_BASE}/news/live?category=${encodeURIComponent(category)}`;
  if (query) {
    url += `&q=${encodeURIComponent(query)}`;
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch live news');
  }
  return res.json();
}

export async function extractArticleContent(url, fallbackText = '') {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const res = await fetch(
      `${API_BASE}/news/extract-full-text?url=${encodeURIComponent(url)}&fallback=${encodeURIComponent(fallbackText)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.content && data.content.trim().length > 0) {
        return data.content;
      }
    }
  } catch (err) {
    console.warn('Failed to extract full article text from backend:', err);
  }
  return fallbackText;
}

// -------------------------------------------------------------
// Source Credibility Checker
// -------------------------------------------------------------
export async function verifySource(query) {
  const res = await fetch(`${API_BASE}/source/verify?query=${encodeURIComponent(query)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to verify source');
  }
  return res.json();
}

export async function fetchPopularSources() {
  const res = await fetch(`${API_BASE}/source/popular`);
  if (!res.ok) {
    throw new Error('Failed to fetch popular sources');
  }
  return res.json();
}

// -------------------------------------------------------------
// User Analytics & CSV Export
// -------------------------------------------------------------
export async function fetchUserAnalytics() {
  const res = await fetch(`${API_BASE}/detect/analytics`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    throw new Error('Failed to fetch analytics');
  }
  return res.json();
}

export function getExportCsvUrl() {
  return `${API_BASE}/detect/export-csv`;
}

// -------------------------------------------------------------
// Browser Extension Integration
// -------------------------------------------------------------
export async function pingExtension() {
  const res = await fetch(`${API_BASE}/extension/ping`);
  if (!res.ok) {
    throw new Error('Extension server ping failed');
  }
  return res.json();
}

export function getExtensionDownloadUrl() {
  return `${API_BASE}/extension/download`;
}

// -------------------------------------------------------------
// Admin Management API
// -------------------------------------------------------------
export async function fetchAdminOverview() {
  const res = await fetch(`${API_BASE}/admin/overview`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to fetch admin overview');
  }
  return res.json();
}

export async function fetchAdminUsers() {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to fetch users');
  }
  return res.json();
}

export async function toggleUserRole(userId) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/toggle-role`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to toggle user role');
  }
  return res.json();
}

export async function deleteUserAccount(userId) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete user');
  }
  return res.json();
}

export async function fetchAdminRecords(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/admin/records${query ? '?' + query : ''}`;
  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to fetch audit records');
  }
  return res.json();
}

export async function deleteAdminRecord(recordId) {
  const res = await fetch(`${API_BASE}/admin/records/${recordId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete record');
  }
  return res.json();
}

export async function purgeAllAdminRecords() {
  const res = await fetch(`${API_BASE}/admin/records/purge-all`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to purge records');
  }
  return res.json();
}

export async function fetchAdminFeedback() {
  const res = await fetch(`${API_BASE}/admin/feedback`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to fetch feedback');
  }
  return res.json();
}

export async function deleteAdminFeedback(feedbackId) {
  const res = await fetch(`${API_BASE}/admin/feedback/${feedbackId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete feedback');
  }
  return res.json();
}

export async function fetchAdminModelLifecycle() {
  const res = await fetch(`${API_BASE}/admin/model-lifecycle`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to fetch model telemetry');
  }
  return res.json();
}

