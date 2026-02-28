// src/components/TemplateEditor.jsx
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

const DEFAULT_EDITOR_HEIGHT_PX = 420;

/**
 * Raw JSON editor for advanced users.
 */
const TemplateEditor = forwardRef(function TemplateEditor(
  { value, onChange, editorHeight = DEFAULT_EDITOR_HEIGHT_PX },
  ref
) {
  const original = useMemo(() => JSON.stringify(value, null, 2), [value]);

  // Initialize editor text once on mount.
  const [raw, setRaw] = useState(() => original);
  const [parseError, setParseError] = useState(null);

  const isDirty = raw !== original;

  const save = useCallback(() => {
    const next = JSON.parse(raw);
    onChange(next);
    setParseError(null);
  }, [raw, onChange]);

  const resetToOriginal = useCallback(() => {
    setRaw(original);
    setParseError(null);
  }, [original]);

  useImperativeHandle(
    ref,
    () => ({
      isDirty,
      save,
      resetToOriginal,
    }),
    [isDirty, save, resetToOriginal]
  );

  return (
    <div>
      <div className="mb-3">
        <div className="text-sm font-semibold text-gray-900">Raw JSON Editor</div>
        <div className="mt-1 text-xs text-gray-500">
          Advanced. Edit only if you are comfortable with JSON.
        </div>
      </div>

      <div
        className="relative flex overflow-hidden rounded-md border border-gray-200"
        style={{ height: `${editorHeight}px` }}
      >
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          className="w-full resize-none p-3 font-mono text-xs leading-5 outline-none"
          spellCheck={false}
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            try {
              save();
            } catch (e) {
              setParseError(String(e?.message || e));
            }
          }}
          className="rounded-md border border-green-800 bg-green-700 px-3 py-2 text-sm text-white hover:bg-green-800"
        >
          Save JSON changes
        </button>

        <button
          type="button"
          onClick={resetToOriginal}
          disabled={!isDirty}
          className={[
            "rounded-md border px-3 py-2 text-sm",
            isDirty
              ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed",
          ].join(" ")}
          title={isDirty ? "Discard local edits and reload original JSON" : "No changes to reset"}
        >
          Reset
        </button>

        {parseError ? <div className="text-xs text-red-700">{parseError}</div> : null}
      </div>
    </div>
  );
});

export default TemplateEditor;