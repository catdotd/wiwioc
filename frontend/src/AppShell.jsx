// src/AppShell.jsx
import React, { useEffect, useMemo, useState } from "react";
import Layout from "./layout/Layout.jsx";
import TemplatesList from "./pages/TemplatesList.jsx";
import { validateSchema } from "./utils/validate.js";
import TemplateViewer from "./pages/TemplateViewer.jsx";
import ArrowBackIcon from "./assets/ArrowBackIcon.jsx";
import { fetchTemplates, fetchTemplateViewerData } from "./api/templates";

function defaultReviewState() {
  return {
    status: "needs-review", // "needs-review" | "in-progress" | "completed"
    decision: null, // null | "needs-attention" | "approved"
  };
}

export default function AppShell() {
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState("");

  const [activeTemplate, setActiveTemplate] = useState(null); // null => list
  const [draft, setDraft] = useState(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState("");

  const [reviewByTemplateId, setReviewByTemplateId] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function loadTemplates() {
      try {
        setTemplatesLoading(true);
        setTemplatesError("");

        const data = await fetchTemplates();
        if (cancelled) return;

        const templateList = Array.isArray(data) ? data : [];
        setTemplates(templateList);

        const initialReviewState = {};
        for (const t of templateList) {
          initialReviewState[t.id] = defaultReviewState();
        }
        setReviewByTemplateId((prev) => ({ ...initialReviewState, ...prev }));
      } catch (error) {
        if (cancelled) return;
        setTemplatesError(error?.message || "Failed to load templates.");
      } finally {
        if (!cancelled) setTemplatesLoading(false);
      }
    }

    loadTemplates();

    return () => {
      cancelled = true;
    };
  }, []);

  const validation = useMemo(() => {
    if (!draft) return { ok: true, errors: [] };
    return validateSchema(draft);
  }, [draft]);

  async function openTemplate(id) {
    try {
      setViewerLoading(true);
      setViewerError("");

      const payload = await fetchTemplateViewerData(id);

      setActiveTemplate({
        id: payload.id,
        name: payload.name,
        baseline: payload.baseline,
        versionLabel: payload.versionLabel,
      });

      setDraft(payload.draft);
    } catch (error) {
      setViewerError(error?.message || "Failed to load template.");
    } finally {
      setViewerLoading(false);
    }
  }

  function backToList() {
    setActiveTemplate(null);
    setDraft(null);
    setViewerError("");
  }

  function getReviewState(id) {
    return reviewByTemplateId[id] || defaultReviewState();
  }

  function updateReviewState(id, nextPartial) {
    setReviewByTemplateId((prev) => ({
      ...prev,
      [id]: { ...getReviewState(id), ...nextPartial },
    }));
  }

  return (
    <Layout
      title="Visual JSON Template Reviewer"
      navItems={
        activeTemplate
          ? [
              {
                key: "list",
                label: (
                  <span className="inline-flex items-center gap-2">
                    <ArrowBackIcon className="h-4 w-4 text-gray-600" />
                    <span>Back to templates</span>
                  </span>
                ),
                onClick: backToList,
              },
            ]
          : []
      }
      activeKey={activeTemplate ? "edit" : "list"}
    >
      {!activeTemplate ? (
        <TemplatesList
          templates={templates}
          onOpenEditor={openTemplate}
          reviewByTemplateId={reviewByTemplateId}
          loading={templatesLoading}
          error={templatesError}
        />
      ) : viewerLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Loading template...
        </div>
      ) : viewerError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {viewerError}
        </div>
      ) : (
        <TemplateViewer
          templateId={activeTemplate.id}
          templateName={activeTemplate.name || activeTemplate.id || "Template"}
          baseline={activeTemplate.baseline}
          value={draft}
          onChange={setDraft}
          validation={validation}
          versionLabel={activeTemplate.versionLabel}
          reviewState={getReviewState(activeTemplate.id)}
          onReviewStateChange={(nextPartial) =>
            updateReviewState(activeTemplate.id, nextPartial)
          }
        />
      )}
    </Layout>
  );
}