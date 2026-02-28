// frontend/src/hooks/useConfirmDirtyToggle.js
import { useState } from "react";

export function useConfirmDirtyToggle({ isDirtyRef }) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function toggle() {
    if (open && isDirtyRef.current?.isDirty) {
      setConfirmOpen(true);
      return;
    }
    setOpen((v) => !v);
  }

  function closeConfirm() {
    setConfirmOpen(false);
  }

  function discard() {
    setConfirmOpen(false);
    setOpen(false);
  }

  function saveAndClose(saveFn) {
    try {
      saveFn?.();
      setConfirmOpen(false);
      setOpen(false);
    } catch {
      setConfirmOpen(false);
    }
  }

  return {
    open,
    confirmOpen,
    toggle,
    closeConfirm,
    discard,
    saveAndClose,
  };
}