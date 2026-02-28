// src/components/review/reviewWorkflow.js

export function topImpactLevel(items) {
  const arr = Array.isArray(items) ? items : [];
  let hasBreaking = false;
  let hasReview = false;

  for (const x of arr) {
    if (x.impact === "breaking") hasBreaking = true;
    else if (x.impact === "review-needed") hasReview = true;
  }

  if (hasBreaking) return "breaking";
  if (hasReview) return "review-needed";
  return "non-breaking";
}

export function impactChipClasses(level) {
  if (level === "breaking") {
    return { border: "border-red-200", bg: "bg-red-50", text: "text-red-800", hover: "hover:bg-red-100" };
  }
  if (level === "review-needed") {
    return { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-800", hover: "hover:bg-amber-100" };
  }
  return { border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-800", hover: "hover:bg-emerald-100" };
}

export function reviewStatusMeta(status) {
  const s = status || "needs-review";

  if (s === "approved") return { label: "Approved", cls: "border-emerald-200 bg-emerald-50 text-emerald-800" };
  if (s === "rejected") return { label: "Rejected", cls: "border-rose-200 bg-rose-50 text-rose-900" };
  if (s === "review-complete") return { label: "Review Complete", cls: "border-indigo-200 bg-indigo-50 text-indigo-900" };
  if (s === "under-review") return { label: "Under Review", cls: "border-amber-200 bg-amber-50 text-amber-900" };
  return { label: "Needs Review", cls: "border-gray-200 bg-gray-50 text-gray-700" };
}

function flattenAllComments(commentsByKey) {
  const obj = commentsByKey && typeof commentsByKey === "object" ? commentsByKey : {};
  const all = [];
  for (const k of Object.keys(obj)) {
    const arr = obj[k];
    if (Array.isArray(arr)) all.push(...arr);
  }
  return all;
}

export function computeCommentRollup(commentsByKey) {
  const all = flattenAllComments(commentsByKey);
  const roots = all.filter((c) => !c?.parentId);

  const counts = {
    total: all.length,
    rootTotal: roots.length,
    open: 0,
    under_review: 0,
    accepted: 0,
    rejected: 0,
    resolved: 0,
    unknown: 0,
  };

  for (const r of roots) {
    const s = r?.status ?? "open";
    if (counts[s] !== undefined) counts[s] += 1;
    else counts.unknown += 1;
  }

  const hasAnyComments = all.length > 0;

  const canApproveByComments =
    !hasAnyComments || (counts.rootTotal > 0 && counts.resolved + counts.rejected === counts.rootTotal);

  const hasBlocking =
    hasAnyComments &&
    (counts.open > 0 || counts.under_review > 0 || counts.accepted > 0 || counts.unknown > 0);

  return { all, roots, counts, hasAnyComments, canApproveByComments, hasBlocking };
}