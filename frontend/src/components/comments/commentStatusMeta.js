// frontend/src/components/comments/commentStatusMeta.js
export const STATUS_META = {
  open: {
    label: "New",
    help: "New comment. No action has been taken yet.",
    badge: "bg-slate-50 text-slate-800 ring-slate-200",
    dot: "bg-slate-400",
    group: "open",
  },
  under_review: {
    label: "Under Review",
    help: "Acknowledged and being evaluated, or requires clarification.",
    badge: "bg-amber-50 text-amber-900 ring-amber-200",
    dot: "bg-amber-500",
    group: "open",
  },
  accepted: {
    label: "Accepted",
    help:
      "Feedback is valid and will be implemented. This means a new version will be generated, so this version cannot be approved.",
    badge: "bg-emerald-50 text-emerald-900 ring-emerald-200",
    dot: "bg-emerald-500",
    group: "open",
  },
  rejected: {
    label: "Rejected",
    help: "Feedback will not be implemented. A reason should be provided.",
    badge: "bg-rose-50 text-rose-900 ring-rose-200",
    dot: "bg-rose-500",
    group: "closed",
  },
  resolved: {
    label: "Resolved",
    help: "Discussion is complete and outcome has been addressed.",
    badge: "bg-indigo-50 text-indigo-900 ring-indigo-200",
    dot: "bg-indigo-500",
    group: "closed",
  },
};

export function isThreadOpen(status) {
  return status === "open" || status === "under_review" || status === "accepted";
}