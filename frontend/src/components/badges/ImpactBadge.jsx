// src/components/badges/ImpactBadge.jsx
import React from "react";

export default function ImpactBadge({ level= "non-breaking"  }) {
  const cfg =
    level === "breaking"
      ? { text: "Potentially Breaking Change", cls: "border-red-200 bg-red-50 text-red-800" }
      : level === "review-needed"
      ? { text: "Review Carefully", cls: "border-amber-200 bg-amber-50 text-amber-800" }
      : { text: "Non-Breaking", cls: "border-emerald-200 bg-emerald-50 text-emerald-800" };

  return (
    <span className={["inline-flex items-center rounded-full border px-2 py-0.5 text-xs", cfg.cls].join(" ")}>
      {cfg.text}
    </span>
  );
}