// src/components/review/ReviewHeader.jsx
import React, { useMemo } from "react";
import { impactChipClasses } from "./reviewWorkflow.js";

export default function ReviewHeader({
  breakingCandidates,
  topImpact,
  status,
  statusMeta,
  rejectReason,
  commentCount,
  hasAnyComments,
  canApprove,
  canReject,
  onStartReview,
  onOpenReject,
  onApprove,
  onReopen,
}) {
  const chip = useMemo(() => impactChipClasses(topImpact), [topImpact]);
  const btnBase = "rounded-xl border px-3 py-2 text-sm font-semibold transition-colors";

  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="font-semibold">Change summary</div>

          {breakingCandidates.length ? (
            <div
              className={[
                "inline-flex items-center gap-2 rounded-full border px-2 py-0.5 text-xs font-semibold",
                chip.border,
                chip.bg,
                chip.text,
                chip.hover,
              ].join(" ")}
              title="Potential impact of changes"
            >
              {breakingCandidates.length} impact item{breakingCandidates.length === 1 ? "" : "s"}
            </div>
          ) : null}

          <span
            className={[
              "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
              statusMeta.cls,
            ].join(" ")}
          >
            {statusMeta.label}
          </span>

          {hasAnyComments ? (
            <span
              className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[0.65rem] font-semibold text-gray-700"
              title="Total comments (roots and replies)"
            >
              {commentCount} comment{commentCount === 1 ? "" : "s"}
            </span>
          ) : null}

          {status === "rejected" && rejectReason.trim() ? (
            <span
              className="inline-flex max-w-[520px] items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[0.65rem] font-semibold text-rose-900"
              title={rejectReason}
            >
              <span className="mr-1">Reason:</span>
              <span className="truncate">{rejectReason}</span>
            </span>
          ) : null}
        </div>

        <div className="mt-1 text-xs text-gray-500">
          Overview of differences between original and modified versions.
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        {status === "needs-review" ? (
          <button
            type="button"
            onClick={onStartReview}
            className={`${btnBase} border-gray-900 bg-gray-900 text-white hover:bg-gray-800`}
            title="Start review"
          >
            Start Review
          </button>
        ) : status === "approved" || status === "rejected" ? (
          <button
            type="button"
            onClick={onReopen}
            className={`${btnBase} border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}
            title="Reopen review"
          >
            Reopen
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onOpenReject}
              disabled={!canReject}
              className={[
                btnBase,
                canReject
                  ? "border-rose-700 bg-white text-rose-800 hover:bg-rose-50"
                  : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed",
              ].join(" ")}
              title={canReject ? "Reject this submission" : "Start review first to enable reject"}
            >
              Reject
            </button>

            <div className="relative group">
              <button
                type="button"
                onClick={onApprove}
                disabled={!canApprove}
                className={[
                  btnBase,
                  canApprove
                    ? "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800"
                    : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed",
                ].join(" ")}
              >
                Approve
              </button>

              {!canApprove ? (
                <div className="pointer-events-none absolute right-0 top-full z-20 mt-2 hidden w-72 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-lg group-hover:block">
                  All comment threads must be either <span className="font-semibold">Resolved</span> or{" "}
                  <span className="font-semibold">Rejected</span> before approval is allowed.
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}