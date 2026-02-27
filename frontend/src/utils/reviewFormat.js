// src/utils/reviewFormat.js
import { normalizeSchema } from "./schemaNormalize.js";

/**
 * Flat row shape:
 * {
 *   path: string,
 *   summary: string,
 *   hint: string,
 *   rules: string,
 *   signature: string
 * }
 */

function safeText(x) {
  if (x === null || x === undefined) return "";
  return String(x);
}

export function buildFlat(schema) {
  const norm = normalizeSchema(schema);
  const out = [];

  function add(path, field) {
    const requiredLabel = field.required ? "required" : "optional";
    const typeLabel = safeText(field.typeLabel) || "-";
    const rules = safeText(field.rulesPlain);
    const hint = safeText(field.description);

    const summary = `${requiredLabel} • ${typeLabel}${rules ? ` • ${rules}` : ""}`;
    const signature = `${summary}||${hint}||${rules}`;

    out.push({ path, summary, hint, rules, signature });
  }

  function addGroupRow(path, label) {
    const summary = safeText(label);
    const hint = "";
    const rules = "";
    const signature = `${summary}||${hint}||${rules}`;
    out.push({ path, summary, hint, rules, signature });
  }

  for (const f of norm.root?.fields || []) {
    add(f.name, f);

    const hasNested = Array.isArray(f.nestedFields) && f.nestedFields.length > 0;

    if (f.typeKind === "object" && hasNested) {
      for (const nf of f.nestedFields) add(`${f.name}.${nf.name}`, nf);
    }

    if (f.typeKind === "array" && hasNested) {
      addGroupRow(`${f.name}[]`, `items • ${f.nestedFields.length} fields`);
      for (const nf of f.nestedFields) add(`${f.name}[].${nf.name}`, nf);
    }
  }

  return out;
}

export function buildDiffMap(flatBase, flatDraft) {
  // returns Map<path, "added" | "removed" | "modified">
  const map = new Map();

  const baseByPath = new Map(flatBase.map((x) => [x.path, x.signature]));
  const draftByPath = new Map(flatDraft.map((x) => [x.path, x.signature]));

  for (const d of flatDraft) {
    const baseSig = baseByPath.get(d.path);
    if (baseSig === undefined) map.set(d.path, "added");
    else if (baseSig !== d.signature) map.set(d.path, "modified");
  }

  for (const b of flatBase) {
    if (!draftByPath.has(b.path)) map.set(b.path, "removed");
  }

  return map;
}

export function countDiffs(diffMap) {
  let added = 0;
  let removed = 0;
  let modified = 0;

  for (const v of diffMap.values()) {
    if (v === "added") added += 1;
    else if (v === "removed") removed += 1;
    else if (v === "modified") modified += 1;
  }

  return { added, removed, modified };
}

export function buildByPath(flat) {
  return new Map(flat.map((x) => [x.path, x]));
}

export function buildMergedPaths(flatBase, flatDraft) {
  const baseIndex = new Map(flatBase.map((x, i) => [x.path, i]));
  const draftIndex = new Map(flatDraft.map((x, i) => [x.path, i]));

  const set = new Set([...baseIndex.keys(), ...draftIndex.keys()]);
  const paths = Array.from(set);

  paths.sort((a, b) => {
    const ai = draftIndex.has(a) ? draftIndex.get(a) : Number.POSITIVE_INFINITY;
    const bi = draftIndex.has(b) ? draftIndex.get(b) : Number.POSITIVE_INFINITY;
    if (ai !== bi) return ai - bi;

    const aj = baseIndex.has(a) ? baseIndex.get(a) : Number.POSITIVE_INFINITY;
    const bj = baseIndex.has(b) ? baseIndex.get(b) : Number.POSITIVE_INFINITY;
    if (aj !== bj) return aj - bj;

    return a.localeCompare(b);
  });

  return paths;
}

/**
 * Per-path, decide which meta lines should exist at all.
 * If neither side has a hint (or rules), we do not render that line on either side.
 * If one side has it, we render the line on both sides (placeholder on the missing side) to keep alignment.
 */
export function buildMetaPresence(mergedPaths, baseByPath, draftByPath) {
  const hasText = (s) => Boolean(s && String(s).trim().length > 0);

  const m = new Map();
  for (const path of mergedPaths) {
    const b = baseByPath.get(path);
    const d = draftByPath.get(path);

    const hintPresent = hasText(b?.hint) || hasText(d?.hint);
    const rulesPresent = hasText(b?.rules) || hasText(d?.rules);

    m.set(path, { hint: hintPresent, rules: rulesPresent });
  }
  return m;
}

export function displayLabel(path) {
  if (path.includes("[].")) return path.split("[].").pop();
  if (path.includes(".")) return path.split(".").pop();
  return path;
}

export function indentPx(path) {
  const isArrayItem = path.includes("[]");
  const isSub = path.includes(".") || path.includes("[].");
  const indentUnits = isArrayItem ? 6 : isSub ? 8 : 3;
  return indentUnits * 4;
}

/**
 * Build a human-facing list of "potentially breaking" changes.
 *
 * This is intentionally conservative and informational (not an alarm).
 * It focuses on changes that are likely to affect validators/consumers:
 * - removals
 * - optional -> required
 * - type changes
 * - rule tightening (best-effort heuristic)
 */
function parseRulesPlain(rulesPlain) {
  const s = String(rulesPlain || "");

  const num = (re) => {
    const m = s.match(re);
    if (!m) return null;
    const v = Number(m[1]);
    return Number.isFinite(v) ? v : null;
  };

  // "Minimum value is X." / "Maximum value is X."
  // "Minimum length is N characters." / "Maximum length is N characters."
  const minimum = num(/Minimum value is\s+(-?\d+(?:\.\d+)?)\./);
  const maximum = num(/Maximum value is\s+(-?\d+(?:\.\d+)?)\./);
  const minLength = num(/Minimum length is\s+(\d+)\s+characters\./);
  const maxLength = num(/Maximum length is\s+(\d+)\s+characters\./);

  const enumCountMatch = s.match(/Must be one of\s+(\d+)\s+allowed values\./);
  const enumCount = enumCountMatch ? Number(enumCountMatch[1]) : null;

  const patternMatch = s.match(/Must match pattern:\s+(.+)\.$/);
  const pattern = patternMatch ? String(patternMatch[1] || "").trim() : null;

  const formatMatch =
    s.match(/Must be a valid\s+([A-Za-z0-9_-]+)\s+address\./i) ||
    s.match(/Must be a valid\s+([A-Za-z0-9_-]+)\./i);
  const format = formatMatch ? String(formatMatch[1] || "").toLowerCase() : null;

  return { minimum, maximum, minLength, maxLength, enumCount, pattern, format };
}

function safeStr(x) {
  if (x === null || x === undefined) return "";
  return String(x);
}

function parseReqType(summary) {
  const s = safeStr(summary);

  // Expected: "required • Text • Must be a valid email address."
  const parts = s.split("•").map((x) => x.trim());
  const reqToken = (parts[0] || "").toLowerCase();

  const required = reqToken === "required";
  const typeLabel = parts[1] ? parts[1].trim() : "";

  return { required, typeLabel };
}

/**
 * Impact levels for UI badges.
 * - "breaking"
 * - "review-needed"
 * - "non-breaking"
 */
function classifyImpact({ kind, title }) {
  if (kind === "added") {
    if (title === "New required field") return "breaking";
    return "non-breaking";
  }

  if (kind === "removed") return "breaking";

  if (kind === "modified") {
    if (title === "Now required") return "breaking";
    if (title === "Now optional") return "non-breaking";

    if (title === "Type changed") return "breaking";

    if (
      title === "Minimum accepted value increased" ||
      title === "Maximum accepted value decreased" ||
      title === "Minimum input length increased" ||
      title === "Maximum input length decreased" ||
      title === "Total allowed values reduced" ||
      title === "Pattern changed" ||
      title === "Format changed" ||
      title === "Validation rule changed"
    ) {
      return "review-needed";
    }

    if (
      title === "Minimum accepted value decreased" ||
      title === "Maximum accepted value increased" ||
      title === "Minimum input length decreased" ||
      title === "Maximum input length increased" ||
      title === "Total allowed values increased"
    ) {
      return "non-breaking";
    }

    return "review-needed";
  }

  return "review-needed";
}

/**
 * Returns:
 * [{ path, kind: "added"|"removed"|"modified", title, detail, impact }]
 *
 * Inputs are your flat rows from buildFlat():
 * { path, summary, hint, rules, signature }
 */
export function computeBreakingCandidates({ flatBase, flatDraft, diffMap }) {
  const out = [];

  const baseByPath = new Map((flatBase || []).map((x) => [x.path, x]));
  const draftByPath = new Map((flatDraft || []).map((x) => [x.path, x]));

  const add = (path, kind, title, detail) => {
    out.push({
      path,
      kind,
      title,
      detail,
      impact: classifyImpact({ kind, title }),
    });
  };

  const allPaths = new Set([...baseByPath.keys(), ...draftByPath.keys()]);

  for (const path of allPaths) {
    const kind = diffMap?.get(path) || null;
    if (!kind) continue;

    const b = baseByPath.get(path) || null;
    const d = draftByPath.get(path) || null;

    // 1) Field added
    if (kind === "added") {
      if (!d) continue;

      const dInfo = parseReqType(d.summary);
      if (dInfo.required) {
        add(
          path,
          "added",
          "New required field",
          "This new field is mandatory. Existing workflows may need to be updated to include it."
        );
      } else {
        add(
          path,
          "added",
          "New optional field",
          "Addition of a new field that is not required to be filled means the new field can be ignored in existing workflows without impact."
        );
      }
      continue;
    }

    // 2) Field removed
    if (kind === "removed") {
      add(path, "removed", "Field removed", "Since field is no longer available, any existing workflows or data that used it may need to be updated.");
      continue;
    }

    // For modified, compare what we can infer from the flat strings
    if (kind !== "modified") continue;
    if (!b || !d) continue;

    const bInfo = parseReqType(b.summary);
    const dInfo = parseReqType(d.summary);

    // 3) Optional -> required (breaking)
    if (!bInfo.required && dInfo.required) {
      add(path, "modified", "Now required", "This field is now mandatory. Existing workflows may need to be updated to include it.");
    }

    // 4) Required -> optional (non-breaking)
    if (bInfo.required && !dInfo.required) {
      add(
        path,
        "modified",
        "Now optional",
        "Changing a field from 'required' to 'optional' relaxes requirements for producers."
      );
    }

    // 5) Type changed
    if (bInfo.typeLabel && dInfo.typeLabel && bInfo.typeLabel !== dInfo.typeLabel) {
      add(path, "modified", "Type changed", `From "${bInfo.typeLabel}" to "${dInfo.typeLabel}".`);
    }

    // 6) Rule comparisons (tightening + loosening)
    const bRules = parseRulesPlain(b.rules);
    const dRules = parseRulesPlain(d.rules);

    // Track whether we already emitted a specific rule-change warning for this path.
    const alreadyFlaggedForRules = {
      min: false,
      max: false,
      minLength: false,
      maxLength: false,
      enumCount: false,
      pattern: false,
      format: false,
    };

    if (bRules.minimum !== null && dRules.minimum !== null && dRules.minimum > bRules.minimum) {
      alreadyFlaggedForRules.min = true;
      add(
        path,
        "modified",
        "Minimum accepted value increased",
        `Minimum went from ${bRules.minimum} to ${dRules.minimum}. Double check that this range is still valid/relevant.`
      );
    }
    if (bRules.maximum !== null && dRules.maximum !== null && dRules.maximum < bRules.maximum) {
      alreadyFlaggedForRules.max = true;
      add(
        path,
        "modified",
        "Maximum accepted value decreased",
        `Maximum went from ${bRules.maximum} to ${dRules.maximum}. Double check that this range is still valid/relevant.`
      );
    }
    if (bRules.minLength !== null && dRules.minLength !== null && dRules.minLength > bRules.minLength) {
      alreadyFlaggedForRules.minLength = true;
      add(
        path,
        "modified",
        "Minimum input length increased",
        `Minimum length went from ${bRules.minLength} to ${dRules.minLength}.`
      );
    }
    if (bRules.maxLength !== null && dRules.maxLength !== null && dRules.maxLength < bRules.maxLength) {
      alreadyFlaggedForRules.maxLength = true;
      add(
        path,
        "modified",
        "Maximum input length decreased",
        `Maximum length went from ${bRules.maxLength} to ${dRules.maxLength}.`
      );
    }
    if (bRules.enumCount !== null && dRules.enumCount !== null && dRules.enumCount < bRules.enumCount) {
      alreadyFlaggedForRules.enumCount = true;
      add(
        path,
        "modified",
        "Total allowed values reduced",
        `Allowed values count went from ${bRules.enumCount} to ${dRules.enumCount}.`
      );
    }

    if (bRules.minimum !== null && dRules.minimum !== null && dRules.minimum < bRules.minimum) {
      alreadyFlaggedForRules.min = true;
      add(
        path,
        "modified",
        "Minimum accepted value decreased",
        `Minimum went from ${bRules.minimum} to ${dRules.minimum}.`
      );
    }
    if (bRules.maximum !== null && dRules.maximum !== null && dRules.maximum > bRules.maximum) {
      alreadyFlaggedForRules.max = true;
      add(
        path,
        "modified",
        "Maximum accepted value increased",
        `Maximum went from ${bRules.maximum} to ${dRules.maximum}.`
      );
    }
    if (bRules.minLength !== null && dRules.minLength !== null && dRules.minLength < bRules.minLength) {
      alreadyFlaggedForRules.minLength = true;
      add(
        path,
        "modified",
        "Minimum input length decreased",
        `Minimum length went from ${bRules.minLength} to ${dRules.minLength}. This is a risk free change, but double check range is still valid/relevant.`
      );
    }
    if (bRules.maxLength !== null && dRules.maxLength !== null && dRules.maxLength > bRules.maxLength) {
      alreadyFlaggedForRules.maxLength = true;
      add(
        path,
        "modified",
        "Maximum input length increased",
        `Maximum length went from ${bRules.maxLength} to ${dRules.maxLength}. This is a risk free change, but double check range is still valid/relevant.`
      );
    }
    if (bRules.enumCount !== null && dRules.enumCount !== null && dRules.enumCount > bRules.enumCount) {
      alreadyFlaggedForRules.enumCount = true;
      add(
        path,
        "modified",
        "Total allowed values increased",
        `Allowed values count went from ${bRules.enumCount} to ${dRules.enumCount}.`
      );
    }

    if (bRules.pattern && dRules.pattern && bRules.pattern !== dRules.pattern) {
      alreadyFlaggedForRules.pattern = true;
      add(path, "modified", "Pattern changed", "Existing values may no longer match the new pattern.");
    }

    if (bRules.format && dRules.format && bRules.format !== dRules.format) {
      alreadyFlaggedForRules.format = true;
      add(path, "modified", "Format changed", `From "${bRules.format}" to "${dRules.format}".`);
    }

    const bType = bInfo.typeLabel;
    const dType = dInfo.typeLabel;

    const rulesChanged = safeStr(b.rules) !== safeStr(d.rules);

    const anySpecificRuleFlag =
      alreadyFlaggedForRules.min ||
      alreadyFlaggedForRules.max ||
      alreadyFlaggedForRules.minLength ||
      alreadyFlaggedForRules.maxLength ||
      alreadyFlaggedForRules.enumCount ||
      alreadyFlaggedForRules.pattern ||
      alreadyFlaggedForRules.format;

    if (!anySpecificRuleFlag && rulesChanged && bType === "Text" && dType === "Text") {
      add(
        path,
        "modified",
        "Validation rule changed",
        `From "${safeStr(b.rules)}" to "${safeStr(d.rules)}".`
      );
    }
  }

  const seen = new Set();
  const deduped = [];
  for (const x of out) {
    const key = `${x.path}||${x.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(x);
  }

  return deduped;
}


// ---- Review workflow status helpers (list + chips) ----
export function reviewStatusKey(state) {
  const s = state?.status ?? "needs-review";
  if (s === "approved") return "approved";
  if (s === "rejected") return "rejected";
  if (s === "review-complete") return "review-complete";
  if (s === "under-review") return "under-review";
  return "needs-review";
}

export function reviewStatusLabel(state) {
  const key = reviewStatusKey(state);
  if (key === "approved") return "Approved";
  if (key === "rejected") return "Rejected";
  if (key === "review-complete") return "Review Complete";
  if (key === "under-review") return "Under Review";
  return "Needs Review";
}

export function reviewStatusChipClasses(statusKey) {
  const k = statusKey || "needs-review";
  if (k === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (k === "rejected") return "border-rose-200 bg-rose-50 text-rose-900";
  if (k === "review-complete") return "border-indigo-200 bg-indigo-50 text-indigo-900";
  if (k === "under-review") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-gray-200 bg-gray-50 text-gray-700";
}