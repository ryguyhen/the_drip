"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import {
  MapPin,
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  ArrowLeft,
  GitCompareArrows,
  Star,
  ChevronRight,
  Lock,
  Award,
  Users,
  Plus,
  X,
} from "lucide-react";
import { getShopBySlug } from "@/data/shops";
import { useAppState } from "@/hooks/useAppState";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { Tag } from "@/components/ui/Tag";
import { CriteriaBreakdown } from "@/components/scoring/CriteriaBreakdown";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { cn } from "@/lib/utils";
import { scoreLabel } from "@/lib/scoring";

// ─── Score card component ──────────────────────────────────────────────────────

function CommunityScoreCard({
  score,
  cityRank,
  city,
  voteCount,
}: {
  score: number;
  cityRank: number;
  city: string;
  voteCount: number;
}) {
  const cityLabel = city === "New York" ? "NYC" : city === "Los Angeles" ? "LA" : city;

  return (
    <div className="flex-1 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
      <div className="flex items-center gap-1.5 mb-3">
        <Users size={12} className="text-amber-500" />
        <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wide">
          Community
        </span>
      </div>
      <div className="flex items-end gap-1.5 mb-1">
        <span className="text-5xl font-bold text-amber-700 tabular-nums leading-none">
          {score}
        </span>
        <span className="text-sm text-amber-400 pb-1">/100</span>
      </div>
      <p className="text-[11px] text-amber-600/80 font-medium">
        {scoreLabel(score)}
      </p>
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-amber-100">
        <span className="text-[11px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">
          #{cityRank} {cityLabel}
        </span>
        <span className="text-[10px] text-amber-400">{voteCount.toLocaleString()} votes</span>
      </div>
      <p className="text-[10px] text-amber-400/80 mt-1">Rated by the community</p>
    </div>
  );
}

function ProScoreCard({
  score,
  reviewCount,
  shopSlug,
  isPremium,
  hasAnyReviews,
}: {
  score: number | null;
  reviewCount: number;
  shopSlug: string;
  isPremium: boolean;
  hasAnyReviews: boolean;
}) {
  const hasScore = score !== null && hasAnyReviews;

  return (
    <div className={cn(
      "flex-1 p-4 rounded-2xl border",
      hasScore ? "bg-emerald-50 border-emerald-100" : "bg-stone-50 border-stone-100"
    )}>
      <div className="flex items-center gap-1.5 mb-3">
        <Award size={12} className={hasScore ? "text-emerald-500" : "text-stone-400"} />
        <span className={cn(
          "text-[11px] font-semibold uppercase tracking-wide",
          hasScore ? "text-emerald-600" : "text-stone-400"
        )}>
          Pro Score
        </span>
        <PremiumBadge size="sm" />
      </div>

      {hasScore ? (
        <>
          <div className="flex items-end gap-1.5 mb-1">
            <span className="text-5xl font-bold text-emerald-700 tabular-nums leading-none">
              {score}
            </span>
            <span className="text-sm text-emerald-400 pb-1">/100</span>
          </div>
          <p className="text-[11px] text-emerald-600/80 font-medium">
            {scoreLabel(score!)}
          </p>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-emerald-100">
            <span className="text-[10px] text-emerald-400">{reviewCount} pro review{reviewCount !== 1 ? "s" : ""}</span>
          </div>
          <p className="text-[10px] text-emerald-400/80 mt-1">Scored by premium reviewers</p>
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <span className="text-4xl font-bold text-stone-200">—</span>
          <p className="text-[11px] text-stone-400 leading-tight">
            {isPremium ? "No pro reviews yet." : "Unlocked with Pro."}
          </p>
          {isPremium ? (
            <Link
              href={`/shop/${shopSlug}/review`}
              className="text-[11px] font-semibold text-amber-600 flex items-center gap-1"
            >
              Write the first review <ChevronRight size={10} />
            </Link>
          ) : (
            <Link
              href="/premium"
              className="text-[11px] font-semibold text-amber-600 flex items-center gap-1"
            >
              Upgrade to Pro <ChevronRight size={10} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShopPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const shop = getShopBySlug(slug);
  const router = useRouter();

  const {
    isSaved, saveShop, unsaveShop,
    isVisited, logVisit, removeVisit, getVisit,
    startInsertion, getInsertionTarget,
    visits, user, shops, getRankedVisits,
  } = useAppState();

  if (!shop) notFound();

  // Pull live Elo-updated shop from store
  const live = shops.find((s) => s.id === shop.id) ?? shop;

  const saved = isSaved(shop.id);
  const visited = isVisited(shop.id);
  const visit = getVisit(shop.id);
  const ranked = getRankedVisits();
  const insertionTarget = getInsertionTarget();
  const insertionInProgressForThis = visit?.insertionState?.status === "in_progress";
  const insertionInProgressForOther = insertionTarget !== null && insertionTarget.shopId !== shop.id;
  const notYetPlaced = visited && visit?.insertionState === null;
  const [showPlacePrompt, setShowPlacePrompt] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-64 w-full">
        <Image
          src={shop.heroImage}
          alt={shop.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 512px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/25" />

        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="absolute top-12 right-4 flex gap-2">
          <button
            onClick={() => saved ? unsaveShop(shop.id) : saveShop(shop.id)}
            className={cn(
              "w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors",
              saved ? "bg-amber-500 text-white" : "bg-black/30 text-white"
            )}
            aria-label={saved ? "Unsave" : "Save"}
          >
            {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        </div>

        {live.cityRank <= 10 && (
          <div className="absolute bottom-4 left-4 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-bold">
            #{live.cityRank} in {live.city === "New York" ? "NYC" : "LA"}
          </div>
        )}

        {visited && (
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-semibold">
            <CheckCircle size={11} />
            Visited
          </div>
        )}
      </div>

      {/* ── Visit CTA (primary action) ── */}
      <div className="px-4 py-4 border-b border-stone-100">
        {!visited ? (
          <button
            onClick={() => {
              logVisit(shop.id);
              setShowPlacePrompt(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-stone-900 text-white rounded-2xl font-semibold text-[15px] tap-scale"
          >
            <Plus size={17} />
            Log a visit
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 px-3 py-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">You&apos;ve visited</p>
                <p className="text-[10px] text-emerald-500">
                  {visit?.personalRank != null
                    ? `Your #${visit.personalRank} of ${ranked.length}`
                    : visit?.insertionState?.status === "in_progress"
                    ? "Ranking in progress…"
                    : "Not yet placed"}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeVisit(shop.id)}
              className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 flex-shrink-0 tap-scale"
              aria-label="Remove visit"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Place in ranking prompt — shown after logging, or for unplaced visits */}
        {(showPlacePrompt || notYetPlaced) && !insertionInProgressForThis && (
          <div className="mt-3 flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-2xl animate-fade-up">
            <GitCompareArrows size={16} className="text-amber-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-800">Place in your ranking</p>
              <p className="text-[10px] text-amber-600">
                {ranked.length > 0
                  ? `~${Math.max(1, Math.ceil(Math.log2(ranked.length + 1)))} comparisons to find its spot`
                  : "This will be your first ranked shop"}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {!insertionInProgressForOther ? (
                <Link
                  href="/rank"
                  onClick={() => startInsertion(shop.id)}
                  className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full tap-scale"
                >
                  Place now
                </Link>
              ) : (
                <Link
                  href="/rank"
                  className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full tap-scale"
                >
                  Finish ranking
                </Link>
              )}
              <button
                onClick={() => setShowPlacePrompt(false)}
                className="text-amber-400"
                aria-label="Dismiss"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        )}

        {/* In-progress insertion banner */}
        {insertionInProgressForThis && (
          <div className="mt-3 flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-2xl animate-fade-up">
            <GitCompareArrows size={16} className="text-amber-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-800">Ranking in progress</p>
              <p className="text-[10px] text-amber-600">
                Step {(visit?.insertionState?.comparisons.length ?? 0) + 1} of ~{Math.max(1, Math.ceil(Math.log2((visit?.insertionState?.totalRankedAtStart ?? 1) + 1)))}
              </p>
            </div>
            <Link
              href="/rank"
              className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full tap-scale flex-shrink-0"
            >
              Continue
            </Link>
          </div>
        )}
      </div>

      <div className="px-4">
        {/* Shop identity */}
        <div className="py-5 border-b border-stone-100">
          <h1 className="text-2xl font-bold text-stone-900 leading-tight mb-1">
            {shop.name}
          </h1>
          <div className="flex items-center gap-1.5 text-stone-400 mb-3">
            <MapPin size={12} />
            <span className="text-sm">{shop.neighborhood}, {shop.city}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {shop.tags.map((tag) => (
              <Tag key={tag} size="md">{tag}</Tag>
            ))}
          </div>
          <p className="text-[15px] text-stone-600 leading-relaxed">{shop.description}</p>
        </div>

        {/* Dual scores — the core product moment */}
        <div className="py-5 border-b border-stone-100">
          <h2 className="font-bold text-stone-900 text-sm mb-1">Scores</h2>
          <p className="text-[11px] text-stone-400 mb-4">
            Two independent systems — crowd preference vs. technical quality.
          </p>
          <div className="flex gap-3">
            <CommunityScoreCard
              score={live.communityScore}
              cityRank={live.cityRank}
              city={live.city}
              voteCount={live.reviewCount}
            />
            <ProScoreCard
              score={live.proScore}
              reviewCount={live.proReviewCount}
              shopSlug={shop.slug}
              isPremium={user.isPremium}
              hasAnyReviews={live.proReviewCount > 0}
            />
          </div>

          {/* Score system explainer */}
          <div className="mt-3 p-3 bg-stone-50 rounded-xl">
            <div className="flex gap-3">
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-amber-600 mb-0.5">Community Rank</p>
                <p className="text-[10px] text-stone-400 leading-relaxed">
                  Elo algorithm. Built from head-to-head comparisons. Reflects what people prefer visiting.
                </p>
              </div>
              <div className="w-px bg-stone-200 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-emerald-600 mb-0.5">Pro Coffee Score</p>
                <p className="text-[10px] text-stone-400 leading-relaxed">
                  Weighted average of 10 technical criteria. Reflects actual coffee quality.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Brew attributes */}
        <div className="py-5 border-b border-stone-100">
          <h2 className="font-bold text-stone-900 text-sm mb-3">What&apos;s here</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Espresso program", active: shop.hasEspresso, icon: "☕" },
              { label: "Pour over", active: shop.hasPourOver, icon: "🫗" },
              { label: "Multi-method brewing", active: shop.hasMultiBrewMethods, icon: "⚗️" },
              { label: "Specialty focused", active: shop.specialtyFocusLevel >= 4, icon: "⭐" },
            ].map(({ label, active, icon }) => (
              <div
                key={label}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-xl",
                  active ? "bg-emerald-50" : "bg-stone-50"
                )}
              >
                <span className={active ? "" : "grayscale opacity-40"}>{icon}</span>
                <span className={cn(
                  "text-xs font-medium",
                  active ? "text-emerald-700" : "text-stone-400 line-through"
                )}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro criteria breakdown */}
        {shop.proCriteriaAverages && (
          <div className="py-5 border-b border-stone-100">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-stone-900 text-sm">Pro Review Breakdown</h2>
              <PremiumBadge size="md" />
            </div>
            <p className="text-[11px] text-stone-400 mb-4">
              Averaged across {live.proReviewCount} premium review{live.proReviewCount !== 1 ? "s" : ""}
            </p>

            {user.isPremium ? (
              <CriteriaBreakdown
                criteria={shop.proCriteriaAverages}
                showWeights={true}
              />
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-stone-100">
                {/* Blurred preview — top 4 criteria only */}
                <div className="p-4 blur-[3px] pointer-events-none select-none opacity-70">
                  <CriteriaBreakdown criteria={shop.proCriteriaAverages} />
                </div>
                {/* Lock overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1px]">
                  <div className="w-10 h-10 rounded-2xl bg-stone-900 flex items-center justify-center mb-3">
                    <Lock size={16} className="text-white" />
                  </div>
                  <p className="font-semibold text-stone-800 text-sm mb-0.5">
                    Pro members only
                  </p>
                  <p className="text-[11px] text-stone-400 mb-4 text-center px-10 leading-relaxed">
                    See the full 10-criteria breakdown with The Drip Pro
                  </p>
                  <Link
                    href="/premium"
                    className="flex items-center gap-1.5 bg-amber-500 text-white rounded-full px-5 py-2.5 text-sm font-semibold tap-scale"
                  >
                    <Star size={13} />
                    Upgrade to Pro
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gallery */}
        {shop.galleryImages.length > 0 && (
          <div className="py-5 border-b border-stone-100">
            <h2 className="font-bold text-stone-900 text-sm mb-3">Photos</h2>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {shop.galleryImages.map((img, i) => (
                <div key={i} className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-stone-100">
                  <Image
                    src={img}
                    alt={`${shop.name} ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="py-5 space-y-2 pb-8">
          {/* Rank CTA */}
          {!visited ? (
            <button
              onClick={() => { logVisit(shop.id); setShowPlacePrompt(true); }}
              className="w-full flex items-center justify-between p-4 bg-white border border-stone-100 rounded-2xl tap-scale hover:border-stone-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center">
                  <Plus size={15} className="text-stone-500" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-stone-800 text-sm">Log a visit</p>
                  <p className="text-[11px] text-stone-400">Required to place in your ranking</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-stone-300" />
            </button>
          ) : visit?.personalRank !== null ? (
            <Link
              href="/rank"
              className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-2xl tap-scale hover:border-amber-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                  <GitCompareArrows size={15} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-800 text-sm">Ranked #{visit?.personalRank} of {ranked.length}</p>
                  <p className="text-[11px] text-amber-500">View your full ranking</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-amber-300" />
            </Link>
          ) : visit?.insertionState?.status === "in_progress" ? (
            <Link
              href="/rank"
              className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-2xl tap-scale"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                  <GitCompareArrows size={15} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-800 text-sm">Ranking in progress</p>
                  <p className="text-[11px] text-amber-500">Continue to find its spot</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-amber-300" />
            </Link>
          ) : (
            <Link
              href="/rank"
              onClick={() => startInsertion(shop.id)}
              className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-2xl tap-scale hover:border-amber-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                  <GitCompareArrows size={15} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-800 text-sm">Place in your ranking</p>
                  <p className="text-[11px] text-amber-500">
                    {ranked.length > 0
                      ? `~${Math.max(1, Math.ceil(Math.log2(ranked.length + 1)))} comparisons`
                      : "Be the first to rank it"}
                  </p>
                </div>
              </div>
              <ChevronRight size={15} className="text-amber-300" />
            </Link>
          )}

          {user.isPremium ? (
            <Link
              href={`/shop/${shop.slug}/review`}
              className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl tap-scale hover:border-emerald-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Award size={15} className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-800 text-sm">Write a Pro review</p>
                  <p className="text-[11px] text-emerald-500">Rate all 10 criteria</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-emerald-300" />
            </Link>
          ) : (
            <Link
              href="/premium"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-50/50 border border-amber-100 rounded-2xl tap-scale"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Star size={15} className="text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold text-amber-800 text-sm">Unlock Pro reviews</p>
                  <p className="text-[11px] text-amber-500/80">Submit scores · See full breakdowns</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-amber-300" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
