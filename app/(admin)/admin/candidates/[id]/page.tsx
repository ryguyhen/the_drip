"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, X, AlertTriangle, ExternalLink } from "lucide-react";
import { getCandidateById } from "@/data/candidates";
import { checkCandidateReadiness, CITY_INGESTION_CONFIG } from "@/lib/places-ingestion";
import { cn } from "@/lib/utils";

export default function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const candidate = getCandidateById(id);

  if (!candidate) notFound();

  const readiness = checkCandidateReadiness(candidate);

  // Local override state (in production this would save to DB)
  const [overrides, setOverrides] = useState({
    description: candidate.curatorOverrides.description ?? candidate.editorialSummary ?? "",
    hasEspresso: candidate.curatorOverrides.hasEspresso ?? true,
    hasPourOver: candidate.curatorOverrides.hasPourOver ?? false,
    hasMultiBrewMethods: candidate.curatorOverrides.hasMultiBrewMethods ?? false,
    specialtyFocusLevel: candidate.curatorOverrides.specialtyFocusLevel ?? 3,
    tags: (candidate.curatorOverrides.tags ?? []).join(", "),
    moderationNotes: candidate.moderationNotes,
  });

  const [status, setStatus] = useState<"idle" | "approved" | "rejected">("idle");

  const handleApprove = () => {
    // TODO: POST /api/admin/candidates/[id]/approve with overrides
    setStatus("approved");
  };

  const handleReject = () => {
    // TODO: POST /api/admin/candidates/[id]/reject with notes
    setStatus("rejected");
  };

  if (status !== "idle") {
    return (
      <div className="text-center py-20">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
          status === "approved" ? "bg-emerald-100" : "bg-red-100"
        )}>
          {status === "approved"
            ? <Check size={28} className="text-emerald-600" />
            : <X size={28} className="text-red-500" />
          }
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">
          {status === "approved" ? "Candidate approved" : "Candidate rejected"}
        </h2>
        <p className="text-sm text-stone-400 mb-2">
          {status === "approved"
            ? `${candidate.name} will be promoted to a live shop on next deploy.`
            : `${candidate.name} has been removed from the active queue.`}
        </p>
        <p className="text-xs text-stone-300 mb-6">
          In production this would write to the database and trigger shop promotion.
        </p>
        <Link
          href="/admin/candidates"
          className="bg-stone-900 text-white rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          Back to queue
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/candidates"
          className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-stone-900">{candidate.name}</h1>
          <p className="text-xs text-stone-400">Candidate review · {candidate.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Left: Places API data (read-only) */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-stone-100 p-4">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
              Google Places Data
            </h2>
            <div className="space-y-2">
              {[
                ["Place ID", candidate.googlePlaceId],
                ["Address", candidate.address],
                ["City", candidate.city],
                ["Neighborhood", candidate.neighborhood ?? "—"],
                ["Rating", candidate.googleRating ? `★ ${candidate.googleRating} (${candidate.googleReviewCount?.toLocaleString()} reviews)` : "—"],
                ["Import method", candidate.importMethod?.replace("_", " ") ?? "—"],
                ["Source query", candidate.sourceQuery ?? "—"],
                ["Imported", new Date(candidate.importedAt).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2 text-xs">
                  <span className="text-stone-400 flex-shrink-0 w-28">{k}</span>
                  <span className="text-stone-700 break-all">{v}</span>
                </div>
              ))}
            </div>
            {candidate.websiteUri && (
              <a
                href={candidate.websiteUri}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
              >
                <ExternalLink size={11} />
                Visit website
              </a>
            )}
          </div>

          {/* Editorial summary from Places */}
          {candidate.editorialSummary && (
            <div className="bg-stone-50 rounded-2xl border border-stone-100 p-4">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                Places API editorial summary
              </p>
              <p className="text-sm text-stone-600 leading-relaxed">{candidate.editorialSummary}</p>
            </div>
          )}

          {/* Readiness */}
          <div className="bg-white rounded-2xl border border-stone-100 p-4">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
              Readiness check
            </h2>
            {readiness.missingFields.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-red-600 mb-1.5">Required:</p>
                {readiness.missingFields.map((f) => (
                  <div key={f} className="flex items-start gap-1.5 mb-1">
                    <X size={12} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-red-600">{f}</span>
                  </div>
                ))}
              </div>
            )}
            {readiness.warnings.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-600 mb-1.5">Warnings:</p>
                {readiness.warnings.map((w) => (
                  <div key={w} className="flex items-start gap-1.5 mb-1">
                    <AlertTriangle size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-amber-600">{w}</span>
                  </div>
                ))}
              </div>
            )}
            {readiness.isReady && (
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">Ready to approve</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Curator overrides (editable) */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-stone-100 p-4">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
              Curator overrides
            </h2>

            {/* Description */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-stone-600 block mb-1.5">
                Editorial description *
              </label>
              <textarea
                value={overrides.description}
                onChange={(e) => setOverrides((p) => ({ ...p, description: e.target.value }))}
                rows={5}
                placeholder="Write the editorial description shown on the shop page…"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-amber-400 resize-none"
              />
              <p className="text-[10px] text-stone-300 mt-1">{overrides.description.length} chars</p>
            </div>

            {/* Brew attributes */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-stone-600 block mb-2">
                Brew attributes *
              </label>
              <div className="space-y-2">
                {[
                  { key: "hasEspresso", label: "Has espresso program" },
                  { key: "hasPourOver", label: "Has pour over" },
                  { key: "hasMultiBrewMethods", label: "Multiple brew methods" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overrides[key as keyof typeof overrides] as boolean}
                      onChange={(e) => setOverrides((p) => ({ ...p, [key]: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-stone-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Specialty focus */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-stone-600 block mb-2">
                Specialty focus level *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setOverrides((p) => ({ ...p, specialtyFocusLevel: level as 1|2|3|4|5 }))}
                    className={cn(
                      "w-8 h-8 rounded-lg text-sm font-bold border transition-colors",
                      overrides.specialtyFocusLevel === level
                        ? "bg-stone-900 text-white border-stone-900"
                        : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-stone-400 mt-1">
                1 = mainstream, 3 = decent specialty, 5 = elite/focused
              </p>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-stone-600 block mb-1.5">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={overrides.tags}
                onChange={(e) => setOverrides((p) => ({ ...p, tags: e.target.value }))}
                placeholder="espresso, pour-over, minimalist, work-friendly"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Moderation notes */}
            <div>
              <label className="text-xs font-semibold text-stone-600 block mb-1.5">
                Moderation notes
              </label>
              <textarea
                value={overrides.moderationNotes}
                onChange={(e) => setOverrides((p) => ({ ...p, moderationNotes: e.target.value }))}
                rows={2}
                placeholder="Internal note about this decision…"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
          </div>

          {/* Promotion preview */}
          <div className="bg-stone-50 rounded-2xl border border-stone-100 p-4">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
              On approval, this shop will:
            </p>
            <ul className="space-y-1">
              {[
                "Get initial Elo of 1500 (communityScore ~52)",
                "Be added to the city leaderboard",
                "Appear in Explore and Home feeds",
                "Be eligible for pairwise ranking",
                "googlePlaceId stored for deduplication",
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-xs text-stone-500">
                  <span className="text-emerald-400 mt-0.5">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={!readiness.isReady}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors",
                readiness.isReady
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-stone-100 text-stone-300 cursor-not-allowed"
              )}
            >
              <Check size={15} />
              Approve
            </button>
            <button
              onClick={handleReject}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
            >
              <X size={15} />
              Reject
            </button>
          </div>
          {!readiness.isReady && (
            <p className="text-xs text-stone-400 text-center">
              Fill in all required fields to enable approval
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
