// src/components/review/useReviewWorkflow.js
import { useCallback, useEffect, useMemo, useState } from "react";
import { computeCommentRollup, reviewStatusMeta, topImpactLevel } from "./reviewWorkflow.js";

export default function useReviewWorkflow({ reviewState, onReviewStateChange, commentsByKey }) {
  const status = reviewState?.status || "needs-review";
  const rejectReason = String(reviewState?.rejectedReason || "");

  const rollup = useMemo(() => computeCommentRollup(commentsByKey || {}), [commentsByKey]);
  const statusMeta = useMemo(() => reviewStatusMeta(status), [status]);

  const [rejectOpen, setRejectOpen] = useState(false);

  const setStatus = useCallback(
    (nextStatus, nextDecision, patch) => {
      const next = {
        status: nextStatus,
        decision: nextDecision ?? null,
        ...(reviewState && typeof reviewState === "object" ? reviewState : {}),
        ...(patch && typeof patch === "object" ? patch : {}),
      };

      next.status = nextStatus;
      next.decision = nextDecision ?? null;

      onReviewStateChange?.(next);
    },
    [onReviewStateChange, reviewState]
  );

  // Auto transitions based on comment rollup
  useEffect(() => {
    if (status === "needs-review" && rollup.hasAnyComments) setStatus("under-review", null);
  }, [status, rollup.hasAnyComments, setStatus]);

  useEffect(() => {
    if (status === "under-review" && rollup.hasAnyComments && rollup.canApproveByComments) setStatus("review-complete", null);
  }, [status, rollup.hasAnyComments, rollup.canApproveByComments, setStatus]);

  useEffect(() => {
    if (status === "review-complete" && rollup.hasBlocking) setStatus("under-review", null);
  }, [status, rollup.hasBlocking, setStatus]);

  const startReview = useCallback(() => {
    if (status === "needs-review") setStatus("under-review", null);
  }, [status, setStatus]);

  const approveReview = useCallback(() => {
    if (!rollup.canApproveByComments) return;
    setStatus("approved", "approved", { rejectedReason: "" });
  }, [rollup.canApproveByComments, setStatus]);

  const openReject = useCallback(() => setRejectOpen(true), []);
  const closeReject = useCallback(() => setRejectOpen(false), []);

  const rejectWithReason = useCallback(
    (reason) => {
      setRejectOpen(false);
      setStatus("rejected", "rejected", { rejectedReason: reason });
    },
    [setStatus]
  );

  const reopenReview = useCallback(() => {
    setStatus("under-review", null);
  }, [setStatus]);

  const canApprove =
    status !== "approved" &&
    status !== "rejected" &&
    (status === "review-complete" || (!rollup.hasAnyComments && status !== "needs-review")) &&
    rollup.canApproveByComments;

  const canReject = status !== "approved" && status !== "rejected" && status !== "needs-review";

  // If you want this to be meaningful, pass real breakingCandidates into a separate hook.
  // For now keep it as "non-breaking" unless caller wants to compute it.
  const topImpact = topImpactLevel([]);

  return {
    status,
    statusMeta,
    rejectOpen,
    rejectReason,
    rollup,

    canApprove,
    canReject,

    startReview,
    approveReview,
    openReject,
    closeReject,
    rejectWithReason,
    reopenReview,

    topImpact,
  };
}