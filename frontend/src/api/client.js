// frontend/src/api/client.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * API layer.
 * All communication with Django backend should go through this folder.
 * Do not call fetch directly from components.
 */

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: "include", // future-proof for session auth
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
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