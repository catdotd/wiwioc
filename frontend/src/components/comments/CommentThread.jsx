// frontend/src/components/comments/CommentThread.jsx
import React, { useMemo, useState } from "react";
import CommentComposer from "./CommentComposer.jsx";
import CommentNode from "./CommentNode.jsx";
import { buildThreadModel, countByStatus, findRootFor, makeId } from "./threadModel.js";
import {isThreadOpen, STATUS_META} from "./commentStatusMeta.js";

export default function CommentThread({
  comments,
  onChange,
  currentUser = "Anonymous",
  canEditStatus = true,
}) {
  const [local, setLocal] = useState([]);
  const data = comments ?? local;

  const { roots, childrenMap } = useMemo(() => buildThreadModel(data), [data]);
  const counts = useMemo(() => countByStatus(data), [data]);

  function commit(next) {
    if (onChange) onChange(next);
    if (!comments) setLocal(next);
  }

  function addRoot(text) {
    commit([
      ...data,
      {
        id: makeId(),
        parentId: null,
        author: currentUser,
        text,
        createdAt: new Date().toISOString(),
        status: "open",
      },
    ]);
  }

  function addReply(parentId, text) {
    const root = findRootFor(data, parentId);
    const rootStatus = root?.status ?? "open";
    if (!isThreadOpen(rootStatus)) return;

    commit([
      ...data,
      {
        id: makeId(),
        parentId,
        author: currentUser,
        text,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  function setRootStatus(rootId, status) {
    if (!STATUS_META[status]) return;

    commit(
      data.map((c) => {
        if (c.id !== rootId) return c;
        if (c.parentId) return c;
        return { ...c, status };
      })
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="rounded-xl border border-gray-200 bg-white/70 px-3 py-2">
        <div className="text-xs font-semibold text-gray-900">Threads</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.keys(STATUS_META).map((k) => (
            <span
              key={k}
              className="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1 text-[11px] ring-1 ring-inset ring-gray-200"
            >
              <span className={`h-2 w-2 rounded-full ${STATUS_META[k].dot}`} />
              <span className="text-gray-700">{STATUS_META[k].label}</span>
              <span className="text-gray-500">({counts[k] ?? 0})</span>
            </span>
          ))}
        </div>
      </div>

      {roots.length ? (
        roots.map((root) => (
          <CommentNode
            key={root.id}
            node={root}
            childrenMap={childrenMap}
            depth={0}
            rootId={root.id}
            rootStatus={root.status ?? "open"}
            isRoot
            onReply={addReply}
            onRootStatusChange={setRootStatus}
            canEditStatus={canEditStatus}
            currentUser={currentUser}
          />
        ))
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-xs text-gray-600">
          No comments yet.
        </div>
      )}

      <CommentComposer currentUser={currentUser} placeholder="Add a comment..." onSubmit={addRoot} />
    </div>
  );
}