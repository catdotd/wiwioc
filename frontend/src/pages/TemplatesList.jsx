// src/pages/TemplatesList.jsx
import React from "react";
import {
  reviewStatusKey,
  reviewStatusLabel,
  reviewStatusChipClasses,
} from "../utils/reviewFormat.js";

export default function TemplatesList({
  templates,
  onOpenEditor,
  reviewByTemplateId,
  loading = false,
  error = "",
}) {
  const safeTemplates = Array.isArray(templates) ? templates : [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="font-semibold">List of JSON Templates</div>

        <button
          type="button"
          className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          title="Upload support coming soon"
          disabled
        >
          Upload New JSON Template
        </button>
      </div>

      {loading ? (
        <div className="px-4 py-6 text-sm text-gray-500">
          Loading templates...
        </div>
      ) : error ? (
        <div className="px-4 py-6 text-sm text-red-600">
          {error}
        </div>
      ) : safeTemplates.length === 0 ? (
        <div className="px-4 py-6 text-sm text-gray-500">
          No templates found.
        </div>
      ) : (
        <div className="divide-y">
          {safeTemplates.map((t, idx) => {
            const reviewState = reviewByTemplateId?.[t.id] || {
              status: "needs-review",
              decision: null,
            };
            const statusKey = reviewStatusKey(reviewState);
            const chipCls = reviewStatusChipClasses(statusKey);

            return (
              <div
                key={t.id}
                onClick={() => onOpenEditor(t.id)}
                className="flex cursor-pointer items-center justify-between px-4 py-4 hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-semibold text-gray-400">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div className="text-sm font-semibold">{t.name}</div>

                    <span
                      className={[
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold",
                        chipCls,
                      ].join(" ")}
                      title="Review status"
                    >
                      {reviewStatusLabel(reviewState)}
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-gray-500">
                    JSON Schema
                  </div>
                </div>

                <div className="ml-4">
                  <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                    Edit / Review
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}