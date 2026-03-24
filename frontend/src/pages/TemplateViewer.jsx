// src/pages/TemplateViewer.jsx
import React, { useMemo, useRef, useCallback } from "react";
import TemplateEditor from "../components/TemplateEditor.jsx";
import TemplateReview from "../components/review/TemplateReview.jsx";
import { normalizeSchema } from "../utils/schemaNormalize.js";
import ConfirmSaveModal from "../components/ConfirmSaveModal.jsx";
import { useConfirmDirtyToggle } from "../hooks/useConfirmDirtyToggle.js";

export default function TemplateViewer({
  templateId,
  templateName,
  baseline,
  value,
  onChange,
  reviewState,
  onReviewStateChange,
  versionLabel,
}) {
  const editorRef = useRef(null);

  const {
    open: showJsonEditor,
    confirmOpen,
    toggle: toggleEditor,
    closeConfirm,
    discard: discardAndClose,
    saveAndClose,
  } = useConfirmDirtyToggle({ isDirtyRef: editorRef });

  const schemaDraft = useMemo(() => {
    const n = normalizeSchema(value);
    const d = n?.meta?.schemaDraft;
    return d && d !== "unknown" ? d : null;
  }, [value]);

  const safeTemplateId = templateId ?? "preview";

  const handleSave = useCallback(() => {
    saveAndClose(() => editorRef.current?.save());
  }, [saveAndClose]);

  return (
    <div className="grid gap-4">
      <ConfirmSaveModal
        open={confirmOpen}
        onCancel={closeConfirm}
        onDiscard={discardAndClose}
        onSave={handleSave}
      />

      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="absolute left-0 top-0 h-full w-1.5 bg-gray-800" aria-hidden="true" />

        <div className="border-b border-gray-200 px-4 py-3 pl-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-semibold">Template: {templateName}</div>

                {schemaDraft ? (
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[0.65rem] font-semibold text-gray-700">
                    JSON schema: {schemaDraft}
                  </span>
                ) : null}
              </div>

              <div className="mt-1 text-sm font-semibold text-gray-600">
                Version: {versionLabel || "Unknown"}{" "}
                <span className="text-xs font-light">
                  (loaded from backend)
                </span>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                title="Not wired yet. Will perform DB upload."
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
              >
                Upload new version
              </button>

              <button
                type="button"
                onClick={toggleEditor}
                title="Advanced users with proper permissions only"
                className={[
                  "rounded-xl border px-3 py-2 text-sm",
                  showJsonEditor
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white hover:bg-gray-50",
                ].join(" ")}
              >
                Edit raw JSON
              </button>
            </div>
          </div>
        </div>

        {showJsonEditor ? (
          <div className="p-4 pl-5">
            <TemplateEditor ref={editorRef} value={value} onChange={onChange} />
          </div>
        ) : null}
      </div>

      <TemplateReview
        baseline={baseline}
        draft={value}
        templateId={safeTemplateId}
        reviewState={reviewState}
        onReviewStateChange={onReviewStateChange}
      />
    </div>
  );
}