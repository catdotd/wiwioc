// frontend/src/api/auth.js
import { apiRequest } from "./client";

/**
 * API layer.
 * All communication with Django backend should go through this folder.
 * Do not call fetch directly from components.
 */

export async function login(username, password) {
  // Placeholder: replace with real endpoint when backend is ready
  return apiRequest("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function logout() {
  return apiRequest("/api/auth/logout/", {
    method: "POST",
  });
}

export async function getCurrentUser() {
  return apiRequest("/api/auth/me/", {
    method: "GET",
  });
}