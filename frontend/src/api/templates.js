// frontend/src/api/templates.js
import { apiRequest } from "./client";

/**
 * API layer.
 * All communication with Django backend should go through this folder.
 * Do not call fetch directly from components.
 */

export async function fetchTemplates() {
  return apiRequest("/api/templates/", {
    method: "GET",
  });
}

export async function fetchTemplateById(id) {
  return apiRequest(`/api/templates/${id}/`, {
    method: "GET",
  });
}

export async function fetchTemplateViewerData(id) {
  return apiRequest(`/api/templates/${id}/viewer-data/`, {
    method: "GET",
  });
}

export async function submitReview(templateId, payload) {
  return apiRequest(`/api/templates/${templateId}/review/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}