// frontend/src/components/comments/CommentNode.jsx
import React, { useState } from "react";
import CommentComposer from "./CommentComposer.jsx";
import { StatusBadge, StatusSelect } from "./CommentStatus.jsx";
import { formatTime } from "./threadModel.js";
import {isThreadOpen} from "./commentStatusMeta.js";

export default function CommentNode({
  node,
  childrenMap,
  depth,
  rootId,
  rootStatus,
  isRoot,
  onReply,
  onRootStatusChange,
  canEditStatus,
  currentUser,
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const children = childrenMap.get(node.id) || [];
  const allowReplies = isThreadOpen(rootStatus);

  const indent = Math.min(depth, 6) * 12;
  const containerStyle = depth ? { marginLeft: indent } : undefined;

  return (
    <div style={containerStyle}>
      <div className="rounded-xl border border-gray-200 bg-white/70 px-3 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-900">{node.author}</span>
              <span className="text-[11px] text-gray-500">{formatTime(node.createdAt)}</span>
              {isRoot ? <StatusBadge status={rootStatus} /> : null}
            </div>

            <div className="mt-2 text-sm text-gray-900">{node.text}</div>

            {isRoot && canEditStatus ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="text-[11px] font-medium text-gray-500">Update status</div>
                <StatusSelect value={rootStatus} onChange={(next) => onRootStatusChange(rootId, next)} />
                {!allowReplies ? (
                  <span className="text-[11px] text-gray-500">Thread is closed. Replies are disabled.</span>
                ) : null}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setReplyOpen((v) => !v)}
            disabled={!allowReplies}
            className={[
              "shrink-0 rounded-lg border px-2.5 py-1 text-xs",
              allowReplies ? "border-gray-200 bg-white hover:bg-gray-50" : "border-gray-200 bg-gray-50 text-gray-400",
            ].join(" ")}
            title={allowReplies ? "Reply" : "Thread closed"}
          >
            Reply
          </button>
        </div>

        {replyOpen ? (
          <CommentComposer
            compact
            currentUser={currentUser}
            placeholder="Write a reply..."
            disabledReason={allowReplies ? undefined : "Replies are disabled because this thread is closed."}
            onSubmit={(t) => {
              onReply(node.id, t);
              setReplyOpen(false);
            }}
          />
        ) : null}
      </div>

      {children.length ? (
        <div className="mt-2 space-y-2">
          {children.map((child) => (
            <CommentNode
              key={child.id}
              node={child}
              childrenMap={childrenMap}
              depth={depth + 1}
              rootId={rootId}
              rootStatus={rootStatus}
              isRoot={false}
              onReply={onReply}
              onRootStatusChange={onRootStatusChange}
              canEditStatus={canEditStatus}
              currentUser={currentUser}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}