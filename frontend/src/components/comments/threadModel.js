// frontend/src/components/comments/threadModel.js
import {STATUS_META} from "./commentStatusMeta.js";

export function formatTime(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
}

export function makeId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

export function buildThreadModel(data) {
  const roots = (data || []).filter((c) => !c.parentId);
  const childrenMap = new Map();

  for (const c of data || []) {
    if (!c.parentId) continue;
    const arr = childrenMap.get(c.parentId) || [];
    arr.push(c);
    childrenMap.set(c.parentId, arr);
  }

  roots.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  for (const [k, arr] of childrenMap.entries()) {
    arr.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
    childrenMap.set(k, arr);
  }

  return { roots, childrenMap };
}

export function findRootFor(data, startId) {
  const byId = new Map((data || []).map((c) => [c.id, c]));
  let cur = byId.get(startId);
  while (cur && cur.parentId) cur = byId.get(cur.parentId);
  return cur || null;
}

export function countByStatus(data) {
  const out = {};
  for (const k of Object.keys(STATUS_META)) out[k] = 0;

  for (const c of data || []) {
    if (c.parentId) continue;
    const s = c.status ?? "open";
    if (out[s] !== undefined) out[s] += 1;
  }
  return out;
}