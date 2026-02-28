// frontend/src/components/comments/CommentComposer.jsx
import React, { useState } from "react";

export default function CommentComposer({
  placeholder,
  onSubmit,
  compact,
  disabledReason,
  currentUser,
}) {
  const [text, setText] = useState("");

  function submit() {
    if (disabledReason) return;
    const t = text.trim();
    if (!t) return;
    onSubmit(t);
    setText("");
  }

  return (
    <div className={compact ? "mt-2" : "mt-3"}>
      <div className="mb-2 flex items-center gap-2 text-xs text-gray-600">
        <span className="font-medium text-red-800">Commenting as</span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 font-semibold text-gray-700">
          {currentUser}
        </span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={disabledReason ? disabledReason : placeholder}
        rows={compact ? 2 : 3}
        disabled={Boolean(disabledReason)}
        className={[
          "w-full resize-none rounded-xl border bg-white px-3 py-2 text-sm outline-none",
          disabledReason ? "border-gray-200 text-gray-400" : "border-gray-200 focus:border-gray-300",
        ].join(" ")}
      />

      <div className="mt-2 flex items-center justify-between">
        {disabledReason ? <div className="text-[11px] text-gray-500">{disabledReason}</div> : <div />}

        <button
          type="button"
          onClick={submit}
          disabled={Boolean(disabledReason)}
          className={[
            "rounded-lg border px-3 py-1.5 text-sm",
            disabledReason ? "border-gray-200 bg-gray-50 text-gray-400" : "border-gray-200 bg-white hover:bg-gray-50",
          ].join(" ")}
        >
          Add Comment
        </button>
      </div>
    </div>
  );
}