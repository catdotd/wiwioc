// src/AppShell.jsx
import React, { useMemo, useState } from "react";
import Layout from "./layout/Layout.jsx";
import TemplatesList from "./pages/TemplatesList.jsx";
import { validateSchema } from "./utils/validate.js";
import { templates as MOCK_TEMPLATES } from "./mocks/templates.js";
import TemplateViewer from "./pages/TemplateViewer.jsx";
import ArrowBackIcon from "./assets/ArrowBackIcon.jsx";

function defaultReviewState() {
  return {
    status: "needs-review", // "needs-review" | "in-progress" | "completed"
    decision: null, // null | "needs-attention" | "approved"
  };
}

export default function AppShell() {
  const [activeTemplate, setActiveTemplate] = useState(null); // null => list
  const [draft, setDraft] = useState(null);

  const [reviewByTemplateId, setReviewByTemplateId] = useState(() => {
    const init = {};
    for (const t of MOCK_TEMPLATES) init[t.id] = defaultReviewState();
    return init;
  });

  const validation = useMemo(() => {
    if (!draft) return { ok: true, errors: [] };
    return validateSchema(draft);
  }, [draft]);

  function openTemplate(id) {
    const t = MOCK_TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    setActiveTemplate(t);
    setDraft(t.draft);
  }

  function backToList() {
    setActiveTemplate(null);
    setDraft(null);
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
          templates={MOCK_TEMPLATES}
          onOpenEditor={openTemplate}
          reviewByTemplateId={reviewByTemplateId}
        />
      ) : (
        <TemplateViewer
          templateId={activeTemplate.id}
          templateName={activeTemplate.name || activeTemplate.id || "Template"}
          baseline={activeTemplate.baseline}
          value={draft}
          onChange={setDraft}
          validation={validation}
          reviewState={getReviewState(activeTemplate.id)}
          onReviewStateChange={(nextPartial) =>
            updateReviewState(activeTemplate.id, nextPartial)
          }
        />
      )}
    </Layout>
  );
}