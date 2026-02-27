// src/components/review/RejectConfirmModal.jsx
import React, { useMemo, useState } from "react";

export default function RejectConfirmModal({ open, initialReason, onCancel, onConfirm }) {
  const [reason, setReason] = useState(initialReason || "");
  const [touched, setTouched] = useState(false);

  // Force remount from parent via `key` to reset state on open or reason change.
  const trimmed = useMemo(() => reason.trim(), [reason]);
  const valid = trimmed.length > 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
        <div className="text-sm font-semibold text-gray-900">Reject this review?</div>
        <div className="mt-2 text-sm text-gray-600">
          A rejection requires a reason. This will be stored with the review state.
        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-700">
            Reason <span className="text-rose-700">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            rows={4}
            placeholder="Describe why this submission is being rejected..."
            className={[
              "mt-2 w-full resize-none rounded-xl border bg-white px-3 py-2 text-sm text-gray-900 outline-none",
              !touched || valid ? "border-gray-200 focus:border-gray-300" : "border-rose-300 focus:border-rose-400",
            ].join(" ")}
          />
          {!touched || valid ? null : (
            <div className="mt-1 text-xs font-semibold text-rose-700">Reason is required.</div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              setTouched(true);
              if (!valid) return;
              onConfirm(trimmed);
            }}
            disabled={!valid}
            className={[
              "rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
              valid
                ? "border-rose-700 bg-rose-700 text-white hover:bg-rose-800"
                : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed",
            ].join(" ")}
            title={valid ? "Reject with reason" : "Provide a reason to reject"}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}