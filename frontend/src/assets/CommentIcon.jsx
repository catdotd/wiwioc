// src/assets/CommentIcon.jsx
import React from "react";

export default function CommentIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="4" width="19" height="13" rx="4.5" />

      <path d="M9.5 17l-3.5 3.5v-3.5" />
    </svg>
  );
}