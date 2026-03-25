// frontend/src/api/client.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * API layer.
 * All communication with Django backend should go through this folder.
 * Do not call fetch directly from components.
 */

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('access_token');
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: "include", // future-proof for session auth
    headers,
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "API request failed");
  }

  // Return JSON if present
  if (response.status !== 204) {
    return response.json();
  }

  return null;
}