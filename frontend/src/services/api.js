const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function submitSession(sessionData) {
  const res = await fetch(`${API_BASE}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sessionData),
  });
  if (!res.ok) throw new Error(`Session error: ${res.status}`);
  return res.json();
}

export async function getSessions(userId) {
  const res = await fetch(`${API_BASE}/sessions/${userId}`);
  if (!res.ok) throw new Error(`Sessions error: ${res.status}`);
  return res.json();
}

export async function getInsight(userId) {
  const res = await fetch(`${API_BASE}/insight/${userId}`);
  if (!res.ok) throw new Error(`Insight error: ${res.status}`);
  return res.json();
}

export async function getPreferences(userId) {
  const res = await fetch(`${API_BASE}/preferences/${userId}`);
  if (!res.ok) throw new Error(`Preferences error: ${res.status}`);
  return res.json();
}

export async function updatePreferences(userId, prefs) {
  const res = await fetch(`${API_BASE}/preferences/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prefs),
  });
  if (!res.ok) throw new Error(`Preferences error: ${res.status}`);
  return res.json();
}

export async function saveContact(userId, contact) {
  const res = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, ...contact }),
  });
  if (!res.ok) throw new Error(`Contact error: ${res.status}`);
  return res.json();
}

export async function getContact(userId) {
  const res = await fetch(`${API_BASE}/contact/${userId}`);
  if (!res.ok) throw new Error(`Contact error: ${res.status}`);
  return res.json();
}

export async function dismiss(userId, type) {
  const res = await fetch(`${API_BASE}/dismiss`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, type }),
  });
  if (!res.ok) throw new Error(`Dismiss error: ${res.status}`);
  return res.json();
}

export async function chat(userId, messages) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, messages }),
  });
  if (!res.ok) throw new Error(`Chat error: ${res.status}`);
  return res.json();
}
