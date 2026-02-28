// src/components/modals/ConfirmSaveModal.jsx
import React from "react";

export default function ConfirmSaveModal({
  open,
  onSave,
  onDiscard,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-4 shadow-lg">
        <div className="text-sm font-semibold text-gray-900">
          Unsaved JSON changes
        </div>

        <div className="mt-1 text-xs text-gray-600">
          You have edits in the JSON editor. Save before closing?
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onDiscard}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Discard
          </button>

          <button
            type="button"
            onClick={onSave}
            className="rounded-md border border-gray-900 bg-gray-900 px-3 py-2 text-sm text-white hover:bg-black"
          >
            Save and close
          </button>
        </div>
      </div>
    </div>
  );
}