// src/components/review/TemplateReview.jsx
import React, { useMemo, useRef, useState } from "react";
import { normalizeSchema } from "../../utils/schemaNormalize.js";
import ConditionalRules from "../ConditionalRules.jsx";
import ImpactAnalysis from "../impact/ImpactAnalysis.jsx";
import {
  buildFlat,
  buildDiffMap,
  countDiffs,
  buildByPath,
  buildMergedPaths,
  buildMetaPresence,
  computeBreakingCandidates,
} from "../../utils/reviewFormat.js";

import RejectConfirmModal from "./RejectConfirmModal.jsx";
import ReviewHeader from "./ReviewHeader.jsx";
import DiffViewer from "./DiffViewer.jsx";
import useReviewWorkflow from "./useReviewWorkflow.js";

export default function TemplateReview({ baseline, draft, reviewState, onReviewStateChange }) {
  const [mode, setMode] = useState("side"); // "side" | "draft"
  const [highlight, setHighlight] = useState(true);

  const breakingRef = useRef(null);

  const normDraft = useMemo(() => normalizeSchema(draft), [draft]);
  const normBase = useMemo(() => normalizeSchema(baseline), [baseline]);

  const flatDraft = useMemo(() => buildFlat(draft), [draft]);
  const flatBase = useMemo(() => buildFlat(baseline), [baseline]);

  const diffMap = useMemo(() => buildDiffMap(flatBase, flatDraft), [flatBase, flatDraft]);
  const counts = useMemo(() => countDiffs(diffMap), [diffMap]);

  const baseByPath = useMemo(() => buildByPath(flatBase), [flatBase]);
  const draftByPath = useMemo(() => buildByPath(flatDraft), [flatDraft]);
  const mergedPaths = useMemo(() => buildMergedPaths(flatBase, flatDraft), [flatBase, flatDraft]);

  const metaPresence = useMemo(
    () => buildMetaPresence(mergedPaths, baseByPath, draftByPath),
    [mergedPaths, baseByPath, draftByPath]
  );

  const breakingCandidates = useMemo(() => {
    const out = computeBreakingCandidates({ flatBase, flatDraft, diffMap });
    return Array.isArray(out) ? out : [];
  }, [flatBase, flatDraft, diffMap]);


  // ImpactAnalysis comment state stays here because it is owned by the review page.
  const [impactCommentsByKey, setImpactCommentsByKey] = useState({});

  // Wire rollup into the workflow (this keeps workflow reusable if you later lift comments state up)
  const {
    status,
    statusMeta,
    rejectOpen,
    rejectReason,
    canApprove,
    canReject,
    openReject,
    closeReject,
    rejectWithReason,
    startReview,
    approveReview,
    reopenReview,
    rollup,
    topImpact,
  } = useReviewWorkflow({
    reviewState,
    onReviewStateChange,
    commentsByKey: impactCommentsByKey,
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <RejectConfirmModal
        key={`${rejectOpen ? "open" : "closed"}:${rejectReason}`}
        open={rejectOpen}
        initialReason={rejectReason}
        onCancel={closeReject}
        onConfirm={rejectWithReason}
      />

      <ReviewHeader
        breakingCandidates={breakingCandidates}
        topImpact={topImpact}
        status={status}
        statusMeta={statusMeta}
        rejectReason={rejectReason}
        commentCount={rollup.all.length}
        hasAnyComments={rollup.hasAnyComments}
        canApprove={canApprove}
        canReject={canReject}
        onStartReview={startReview}
        onOpenReject={openReject}
        onApprove={approveReview}
        onReopen={reopenReview}
      />

      {breakingCandidates.length ? (
        <ImpactAnalysis
          ref={breakingRef}
          items={breakingCandidates}
          commentsByKey={impactCommentsByKey}
          onCommentsByKeyChange={setImpactCommentsByKey}
        />
      ) : null}

      <DiffViewer
        mode={mode}
        onModeChange={setMode}
        highlight={highlight}
        onHighlightChange={setHighlight}
        counts={counts}
        flatDraft={flatDraft}
        mergedPaths={mergedPaths}
        baseByPath={baseByPath}
        draftByPath={draftByPath}
        diffMap={diffMap}
        metaPresence={metaPresence}
      />

      <div className="mt-4">
        <ConditionalRules baseline={normBase.conditionals} draft={normDraft.conditionals} />
      </div>
    </div>
  );
}