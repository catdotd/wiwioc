// src/assets/ArrowBackIcon.jsx
import React from "react";

export default function ArrowBackIcon({ className = "" }) {
  return (
      <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
      >
        <path d="M9 7l-6 5 6 5"/>
        <path d="M3 12h11a7 7 0 0 1 7 7"/>
      </svg>
  );
}