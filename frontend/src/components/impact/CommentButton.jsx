// frontend/src/components/impact/CommentButton.jsx
import React, { useMemo } from "react";
import CommentIcon from "../../assets/CommentIcon.jsx";

export default function CommentButton({ open, onToggle, comments }) {
  const count = useMemo(() => (Array.isArray(comments) ? comments.length : 0), [comments]);
  const has = count > 0;

  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative mt-2 shrink-0"
      title={has ? `${count} comment${count === 1 ? "" : "s"}` : "Comments"}
      aria-expanded={open}
      aria-label={has ? `Open comments (${count})` : "Open comments"}
    >
      <CommentIcon className={["h-6 w-6 transition-colors", has ? "text-indigo-600" : "text-gray-500"].join(" ")} />
      {has ? (
        <span className="absolute -right-2 -top-2 inline-flex min-w-[18px] items-center justify-center rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {count}
        </span>
      ) : null}
    </button>
  );
}