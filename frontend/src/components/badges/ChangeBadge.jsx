// src/components/badges/ChangeBadge.jsx
import React from "react";

export default function ChangeBadge({ kind, count = null, size = "sm" }) {
  if (!kind) return null;

  const cfg =
    kind === "added"
      ? { text: "New", cls: "border-emerald-400 bg-emerald-50 text-emerald-800" }
      : kind === "removed"
      ? { text: "Removed", cls: "border-red-200 bg-red-50 text-red-800" }
      : kind === "modified"
      ? { text: "Changed", cls: "border-amber-200 bg-amber-50 text-amber-800" }
      : null;

  if (!cfg) return null;

  const base = "inline-flex items-center rounded-full border";
  const sizing =
    size === "xs"
      ? "px-2 py-0.25 text-[0.60rem]"
      : "px-2 py-0.5 text-xs";

  const label = typeof count === "number" ? `${cfg.text} ${count}` : cfg.text;

  return <span className={[base, sizing, cfg.cls].join(" ")}>{label}</span>;
}