// frontend/src/components/impact/ImpactCard.jsx
import React from "react";
import ImpactBadge from "../badges/ImpactBadge.jsx";

function palette(level) {
  if (level === "breaking") {
    return { card: "bg-red-50 border-red-200", rail: "bg-red-500", title: "text-red-900", detail: "text-red-700" };
  }
  if (level === "review-needed") {
    return { card: "bg-amber-50 border-amber-200", rail: "bg-amber-500", title: "text-amber-900", detail: "text-amber-700" };
  }
  return { card: "bg-emerald-50 border-emerald-200", rail: "bg-emerald-500", title: "text-emerald-900", detail: "text-emerald-700" };
}

export default function ImpactCard({ item }) {
  const p = palette(item.impact);

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${p.card}`}>
      <div className={`absolute left-0 top-0 h-full w-1.5 ${p.rail}`} />

      <div className="p-1 pl-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-bold">Field:</span>
            <span className="truncate rounded-md bg-white/70 px-2 py-0.5 font-mono text-[11px] font-semibold">
              {item.path}
            </span>
          </div>
          <ImpactBadge level={item.impact} />
        </div>

        <div className={`mt-0.5 text-xs font-semibold ${p.title}`}>
          - {item.title}
          {item.detail ? <span className={`font-light ${p.detail}`}> • {item.detail}</span> : null}
        </div>
      </div>
    </div>
  );
}