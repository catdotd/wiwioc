// frontend/src/api/auth.js
import { apiRequest } from "./client";

/**
 * API layer.
 * All communication with Django backend should go through this folder.
 * Do not call fetch directly from components.
 */

export async function login(username, password) {
  const response = await apiRequest("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  // Store tokens in localStorage
  if (response.access) {
    localStorage.setItem('access_token', response.access);
  }
  if (response.refresh) {
    localStorage.setItem('refresh_token', response.refresh);
  }

  return response;
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

export function isLoggedIn() {
  const token = localStorage.getItem('access_token');
  return !!token;
}