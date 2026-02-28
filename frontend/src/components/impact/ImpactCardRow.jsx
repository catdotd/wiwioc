// frontend/src/components/impact/ImpactCardRow.jsx
import React, { useState } from "react";
import ImpactCard from "./ImpactCard.jsx";
import CommentButton from "./CommentButton.jsx";
import CommentThread from "../comments/CommentThread.jsx";

export default function ImpactCardRow({
  item,
  comments,
  onCommentsChange,
  currentUser = "Anonymous",
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <ImpactCard item={item} />
        </div>

        <CommentButton open={open} onToggle={() => setOpen((v) => !v)} comments={comments} />
      </div>

      {open ? (
        <div className="ml-6 mt-2">
          <CommentThread
            comments={comments}
            onChange={onCommentsChange}
            currentUser={currentUser}
          />
        </div>
      ) : null}
    </div>
  );
}