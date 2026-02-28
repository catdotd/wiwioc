// frontend/src/components/comments/Tooltip.jsx
import React, { useEffect, useRef, useState } from "react";

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    function onDown(e) {
      if (!ref.current) return;
      if (ref.current.contains(e.target)) return;
      handler();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [ref, handler]);
}

export default function Tooltip({ text }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useOnClickOutside(ref, () => setOpen(false));

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 bg-white text-[11px] font-semibold text-gray-600 hover:bg-gray-50"
        aria-label="Status help"
      >
        ?
      </button>

      {open ? (
        <span
          role="tooltip"
          className="absolute right-0 top-6 z-20 w-64 rounded-lg border border-gray-200 bg-white p-2 text-xs text-gray-700 shadow-lg"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}