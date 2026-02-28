// src/components/review/DiffViewer.jsx
import React from "react";
import ChangeBadge from "../badges/ChangeBadge.jsx";
import { displayLabel, indentPx } from "../../utils/reviewFormat.js";

export default function DiffViewer({
  mode,
  onModeChange,
  highlight,
  onHighlightChange,
  counts,
  flatDraft,
  mergedPaths,
  baseByPath,
  draftByPath,
  diffMap,
  metaPresence,
}) {
  const rowBg = (side, diffKind) => {
    if (!highlight) return "";
    if (side === "draft") {
      if (diffKind === "added") return "bg-emerald-50";
      if (diffKind === "modified") return "bg-amber-50";
      return "";
    }
    if (diffKind === "removed") return "bg-red-50";
    if (diffKind === "modified") return "bg-amber-50";
    return "";
  };

  const tagKindFor = (side, diffKind) => {
    if (!diffKind) return null;
    if (side === "draft") {
      if (diffKind === "added") return "added";
      if (diffKind === "modified") return "modified";
      return null;
    }
    if (diffKind === "removed") return "removed";
    if (diffKind === "modified") return "modified";
    return null;
  };

  const hasText = (s) => Boolean(s && String(s).trim().length > 0);

  const renderRow = (path, it, side) => {
    const diffKind = diffMap.get(path) || null;
    const bg = rowBg(side, diffKind);
    const tagKind = tagKindFor(side, diffKind);

    const label = displayLabel(path);
    const summary = it?.summary || "";
    const hint = (it?.hint || "").trim();

    const hasItem = Boolean(it);

    const showTagSlot = Boolean(diffKind);
    const showTag = Boolean(tagKind);

    const meta = metaPresence.get(path) || { hint: false };
    const showHintLine = Boolean(meta.hint);

    const hintText = hasText(hint) ? hint : " ";

    return (
      <div key={`${side}:${path}`} className={`px-3 py-2 ${bg}`} style={{ paddingLeft: `${indentPx(path)}px` }}>
        <div className={showTagSlot ? "flex items-baseline gap-2" : "flex items-baseline gap-1"}>
          <span className={`font-mono text-sm font-semibold ${hasItem ? "" : "invisible"}`}>{label}</span>
          <span className={`text-xs text-gray-500 ${hasItem ? "" : "invisible"}`}>{summary || " "}</span>
          {showTagSlot ? (
            <span className={showTag ? "" : "invisible"}>
              <ChangeBadge kind={showTag ? tagKind : "added"} size="xs" />
            </span>
          ) : null}
        </div>

        {showHintLine ? (
          <div className={`mt-1 text-xs text-gray-500 ${hasItem ? "" : "invisible"}`}>
            <div>
              <span className="pl-2 font-semibold text-gray-600">Hint:</span> <span>{hintText}</span>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  const renderDraftOnly = () => <div className="divide-y">{flatDraft.map((it) => renderRow(it.path, it, "draft"))}</div>;

  const renderSideBySidePaired = () => (
    <div className="grid grid-cols-2 divide-x">
      <div>
        <div className="px-3 py-2 text-xs font-semibold text-gray-500">Original</div>
        <div className="border-b-2 border-gray-200" />
      </div>
      <div>
        <div className="px-3 py-2 text-xs font-semibold text-gray-500">Modified</div>
        <div className="border-b-2 border-gray-200" />
      </div>

      <div className="col-span-2">
        {mergedPaths.map((path) => (
          <div key={path} className="grid grid-cols-2 divide-x border-b border-gray-200">
            <div>{renderRow(path, baseByPath.get(path) || null, "baseline")}</div>
            <div>{renderRow(path, draftByPath.get(path) || null, "draft")}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 py-3">
        <button
          type="button"
          onClick={() => onModeChange("side")}
          className={[
            "rounded-xl border px-3 py-2 text-sm",
            mode === "side" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white hover:bg-gray-50",
          ].join(" ")}
        >
          Original vs Modified
        </button>

        <button
          type="button"
          onClick={() => onModeChange("draft")}
          className={[
            "rounded-xl border px-3 py-2 text-sm",
            mode === "draft" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white hover:bg-gray-50",
          ].join(" ")}
        >
          Modified Only
        </button>

        <label className="ml-2 flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={highlight}
            onChange={(e) => onHighlightChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          Highlight changes
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {counts.added > 0 ? <ChangeBadge kind="added" count={counts.added} /> : null}
          {counts.removed > 0 ? <ChangeBadge kind="removed" count={counts.removed} /> : null}
          {counts.modified > 0 ? <ChangeBadge kind="modified" count={counts.modified} /> : null}
        </div>
      </div>

      <div className="mt-2 rounded-xl border border-gray-200">
        {mode === "draft" ? renderDraftOnly() : renderSideBySidePaired()}
      </div>
    </>
  );
}