// frontend/src/components/comments/CommentStatus.jsx
import React, { useMemo } from "react";
import Tooltip from "./Tooltip.jsx";
import { STATUS_META } from "./commentStatusMeta.js";

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.open;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${meta.badge}`}
    >
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      <span>{meta.label}</span>
      <Tooltip text={meta.help} />
    </span>
  );
}

export function StatusSelect({ value, onChange }) {
  const v = value ?? "open";

  const { openOpts, closedOpts } = useMemo(() => {
    const entries = Object.entries(STATUS_META).map(([val, meta]) => ({
      value: val,
      label: meta.label,
      group: meta.group,
    }));
    return {
      openOpts: entries.filter((o) => o.group === "open"),
      closedOpts: entries.filter((o) => o.group === "closed"),
    };
  }, []);

  return (
    <label className="inline-flex items-center gap-2">
      <span className="sr-only">Change status</span>

      <select
        value={v}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-800 outline-none hover:bg-gray-50"
      >
        <optgroup label="Open">
          {openOpts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="Closed">
          {closedOpts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  );
}