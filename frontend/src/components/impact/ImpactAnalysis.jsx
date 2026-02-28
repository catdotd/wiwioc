// src/components/impact/ImpactAnalysis.jsx
import React, { forwardRef, useMemo, useState } from "react";
import DocIcon from "../../assets/DocIcon.jsx";
import ImpactCardRow from "./ImpactCardRow.jsx";
import {impactItemKey} from "./impactKeys.js";


const ImpactAnalysis = forwardRef(function ImpactAnalysis(
  {
    items,
    currentUser = "Anonymous",
    commentsByKey,
    onCommentsByKeyChange,
  },
  ref
) {
  const sortedItems = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];

    const rank = { breaking: 0, "review-needed": 1, "non-breaking": 2 };

    return [...safeItems].sort((a, b) => {
      const ra = rank[a.impact] ?? 3;
      const rb = rank[b.impact] ?? 3;
      return ra - rb;
    });
  }, [items]);

  const [localCommentsByKey, setLocalCommentsByKey] = useState({});

  const isControlled = Boolean(onCommentsByKeyChange);
  const state = isControlled ? commentsByKey || {} : localCommentsByKey;
  const setState = isControlled ? onCommentsByKeyChange : setLocalCommentsByKey;

  return (
    <div ref={ref} className="mt-2">
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-start gap-2">
          <div className="shrink-0">
            <DocIcon className="h-6 w-6 text-gray-700" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900">
              Impact Analysis:{" "}
              <span className="mt-0 text-xs font-light text-gray-500">
                Potential impact of changes to help prioritize review,
                especially where existing data or consumers could be affected.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 space-y-2">
          {sortedItems.map((x) => {
            const k = impactItemKey(x);
            const rowComments = state[k];

            return (
              <ImpactCardRow
                key={k}
                item={x}
                comments={rowComments}
                onCommentsChange={(next) =>
                  setState((prev) => ({
                    ...(prev || {}),
                    [k]: next,
                  }))
                }
                currentUser={currentUser}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default ImpactAnalysis;