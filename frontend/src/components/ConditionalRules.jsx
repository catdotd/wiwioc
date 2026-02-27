// frontend/src/components/ConditionalRules.jsx
import React, { useMemo, useState } from "react";
import ChangeBadge from "./badges/ChangeBadge.jsx";

/* ---------------- helpers ---------------- */

function sigOf(rule) {
  if (!rule) return "";
  const when = String(rule.when || "");
  const thenList = Array.isArray(rule.then) ? rule.then.join("\n") : "";
  const elseList = Array.isArray(rule.else) ? rule.else.join("\n") : "";
  return `${when}||${thenList}||${elseList}`;
}

function diffKindFor(baseRule, draftRule) {
  if (!baseRule && draftRule) return "added";
  if (baseRule && !draftRule) return "removed";
  if (baseRule && draftRule && sigOf(baseRule) !== sigOf(draftRule)) return "modified";
  return null;
}

/* ---------------- UI ---------------- */

function RuleCard({ title, rule, tagKind, highlight }) {
  const when = rule?.when || "";
  const thenList = Array.isArray(rule?.then) ? rule.then : [];
  const elseList = Array.isArray(rule?.else) ? rule.else : [];

  const bg =
    highlight && tagKind === "added"
      ? "bg-emerald-50"
      : highlight && tagKind === "removed"
      ? "bg-red-50"
      : highlight && tagKind === "modified"
      ? "bg-amber-50"
      : "";

  if (!rule) {
    return (
      <div className={`rounded-xl border border-gray-200 p-4 ${bg}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">{title}</div>
          {tagKind ? <ChangeBadge kind={tagKind} /> : null}
        </div>
        <div className="mt-3 text-sm text-gray-500">None</div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-gray-200 p-4 ${bg}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">{title}</div>
        {tagKind ? <ChangeBadge kind={tagKind} /> : null}
      </div>

      <div className="mt-3 text-xs font-semibold text-gray-600">When</div>
      <div className="mt-1 text-sm text-gray-700">{when}</div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-xs font-semibold text-gray-600">Then</div>
          {thenList.length ? (
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
              {thenList.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          ) : (
            <div className="mt-2 text-sm text-gray-500">None</div>
          )}
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-600">Else</div>
          {elseList.length ? (
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
              {elseList.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          ) : (
            <div className="mt-2 text-sm text-gray-500">None</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- main ---------------- */

export default function ConditionalRules({ baseline, draft }) {
  const [mode, setMode] = useState("side"); // "side" | "draft"
  const [highlight, setHighlight] = useState(true);

  // Exactly ONE rule per badges, by design
  const baseRule = Array.isArray(baseline) ? baseline[0] || null : null;
  const draftRule = Array.isArray(draft) ? draft[0] || null : null;

  const diffKind = useMemo(
    () => diffKindFor(baseRule, draftRule),
    [baseRule, draftRule]
  );

  if (!baseRule && !draftRule) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Conditional rules</div>
          <div className="mt-1 text-xs text-gray-500">
            If/then/else logic summarized in plain language.
          </div>
        </div>

        {diffKind ? <ChangeBadge kind={diffKind} /> : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setMode("side")}
          className={[
            "rounded-xl border px-3 py-2 text-sm",
            mode === "side"
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-200 bg-white hover:bg-gray-50",
          ].join(" ")}
        >
          Original vs Modified
        </button>

        <button
          onClick={() => setMode("draft")}
          className={[
            "rounded-xl border px-3 py-2 text-sm",
            mode === "draft"
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-200 bg-white hover:bg-gray-50",
          ].join(" ")}
        >
          Modified Only
        </button>

        <label className="ml-2 flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={highlight}
            onChange={(e) => setHighlight(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          Highlight changes
        </label>
      </div>

      <div className="mt-4">
        {mode === "draft" ? (
          <RuleCard
            title="Modified"
            rule={draftRule}
            tagKind={diffKind === "added" || diffKind === "modified" ? diffKind : null}
            highlight={highlight}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <RuleCard
              title="Original"
              rule={baseRule}
              tagKind={diffKind === "removed" || diffKind === "modified" ? diffKind : null}
              highlight={highlight}
            />
            <RuleCard
              title="Modified"
              rule={draftRule}
              tagKind={diffKind === "added" || diffKind === "modified" ? diffKind : null}
              highlight={highlight}
            />
          </div>
        )}
      </div>
    </div>
  );
}