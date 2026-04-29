"use client";

import { useState } from "react";
import Link from "next/link";
import { CANDIDATES_WITH_READINESS, CANDIDATE_STATS } from "@/data/candidates";
import { ModerationStatus } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_META: Record<ModerationStatus, { label: string; color: string; dot: string }> = {
  pending:      { label: "Pending",       color: "bg-amber-50 text-amber-700 border-amber-200",    dot: "bg-amber-400" },
  needs_review: { label: "Needs review",  color: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-400" },
  approved:     { label: "Approved",      color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  rejected:     { label: "Rejected",      color: "bg-red-50 text-red-600 border-red-200",          dot: "bg-red-400" },
  draft:        { label: "Draft",         color: "bg-stone-100 text-stone-500 border-stone-200",   dot: "bg-stone-400" },
};

type FilterStatus = ModerationStatus | "all";

export default function CandidatesPage() {
  const [filter, setFilter] = useState<FilterStatus>("all");

  const visible = CANDIDATES_WITH_READINESS.filter(
    (c) => filter === "all" || c.moderationStatus === filter
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Moderation queue</h1>
        <p className="text-sm text-stone-500">
          Review candidates ingested from Google Places API.
          Approve → promote to live shop. Reject → removes from queue.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {([
          ["all", `All (${CANDIDATE_STATS.total})`],
          ["pending", `Pending (${CANDIDATE_STATS.pending})`],
          ["needs_review", `Needs review (${CANDIDATE_STATS.needsReview})`],
          ["approved", `Approved (${CANDIDATE_STATS.approved})`],
          ["rejected", `Rejected (${CANDIDATE_STATS.rejected})`],
        ] as [FilterStatus, string][]).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              filter === val
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Candidate list */}
      <div className="space-y-2">
        {visible.length === 0 && (
          <div className="text-center py-16 text-stone-400">
            <p className="text-4xl mb-3">✓</p>
            <p className="font-semibold">No candidates in this state</p>
          </div>
        )}
        {visible.map((candidate) => {
          const meta = STATUS_META[candidate.moderationStatus];
          const method = candidate.importMethod?.replace("_", " ") ?? "unknown";
          const isActionable =
            candidate.moderationStatus === "pending" ||
            candidate.moderationStatus === "needs_review";

          return (
            <div
              key={candidate.id}
              className="bg-white rounded-2xl border border-stone-100 p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-stone-900 text-sm">{candidate.name}</h3>
                    <span className={cn(
                      "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                      meta.color
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", meta.dot)} />
                      {meta.label}
                    </span>
                    {!candidate.readiness.isReady && candidate.moderationStatus === "pending" && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
                        Incomplete
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400">
                    {candidate.neighborhood ?? "No neighborhood"} · {candidate.city}
                  </p>
                  <p className="text-xs text-stone-300 mt-0.5">{candidate.address}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  {candidate.googleRating && (
                    <p className="text-sm font-bold text-stone-700">
                      ★ {candidate.googleRating}
                    </p>
                  )}
                  {candidate.googleReviewCount && (
                    <p className="text-[10px] text-stone-400">
                      {candidate.googleReviewCount.toLocaleString()} reviews
                    </p>
                  )}
                </div>
              </div>

              {/* Summary / notes */}
              {(candidate.editorialSummary || candidate.moderationNotes) && (
                <p className="text-xs text-stone-500 leading-relaxed mb-3 line-clamp-2">
                  {candidate.moderationNotes || candidate.editorialSummary}
                </p>
              )}

              {/* Missing fields */}
              {candidate.readiness.missingFields.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-semibold text-orange-600 mb-1">Missing:</p>
                  <div className="flex flex-wrap gap-1">
                    {candidate.readiness.missingFields.map((f) => (
                      <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata row */}
              <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-stone-50">
                <span className="text-[10px] text-stone-300">
                  via {method}
                  {candidate.sourceQuery && ` · "${candidate.sourceQuery}"`}
                </span>
                <span className="text-[10px] text-stone-300">
                  {new Date(candidate.importedAt).toLocaleDateString()}
                </span>
                {candidate.googlePlaceId && (
                  <span className="text-[10px] font-mono text-stone-300 truncate max-w-[120px]">
                    {candidate.googlePlaceId}
                  </span>
                )}
                <div className="ml-auto">
                  {isActionable && (
                    <Link
                      href={`/admin/candidates/${candidate.id}`}
                      className="text-xs font-semibold text-amber-600 hover:text-amber-700"
                    >
                      Review →
                    </Link>
                  )}
                  {candidate.moderationStatus === "approved" && (
                    <span className="text-xs text-emerald-600 font-medium">
                      ✓ Approved by {candidate.reviewedBy}
                    </span>
                  )}
                  {candidate.moderationStatus === "rejected" && (
                    <span className="text-xs text-red-500 font-medium">
                      ✗ Rejected
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
