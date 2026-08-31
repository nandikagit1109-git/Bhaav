const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Backend returned HTTP ${res.status} (not JSON)`);
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `API error ${res.status}`);
  return data;
}

export function createUser() {
  return request("/api/users", { method: "POST" });
}

export function submitSession({ user_id, start_ts, end_ts, keystroke_events }) {
  return request("/api/sessions", {
    method: "POST",
    body: JSON.stringify({ user_id, start_ts, end_ts, keystroke_events }),
  });
}

export function getAnalysis(userId) {
  return request(`/api/analysis/${userId}`);
}

export function getInsight(userId) {
  return request(`/api/insight/${userId}`);
}

export function submitFeedback(userId, insightId, feedback) {
  return request(`/api/insight/${userId}/feedback`, {
    method: "POST",
    body: JSON.stringify({ insight_id: insightId, feedback }),
  });
}

export function getCampusPulse() {
  return request("/api/campus-pulse/aggregate");
}

export function getAdminTrends() {
  return request("/api/admin/trends");
}

export { API_BASE };
