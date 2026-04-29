"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  CheckCircle,
  SkipForward,
  Equal,
  ChevronRight,
  Coffee,
  ArrowRight,
  Check,
  ArrowUp,
  ArrowDown,
  Trophy,
} from "lucide-react";
import type { CoffeeShop, UserVisit } from "@/types";
import { useAppState } from "@/hooks/useAppState";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function estimatedSteps(totalRankedAtStart: number): number {
  if (totalRankedAtStart === 0) return 0;
  return Math.max(1, Math.ceil(Math.log2(totalRankedAtStart + 1)));
}

// ─── Comparison card ──────────────────────────────────────────────────────────

type CardResult = "winner" | "loser" | "idle";

function ComparisonCard({
  shop,
  onSelect,
  result,
  label,
  isNew,
}: {
  shop: CoffeeShop;
  onSelect: () => void;
  result: CardResult;
  label: string;
  isNew: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      disabled={result !== "idle"}
      className={cn(
        "relative flex-1 rounded-2xl overflow-hidden border-2 transition-all duration-200 focus:outline-none",
        result === "idle" && "border-transparent active:scale-[0.97]",
        result === "winner" && "border-amber-400 shadow-xl shadow-amber-100",
        result === "loser" && "border-transparent"
      )}
    >
      <div className="relative h-52">
        <Image
          src={shop.heroImage}
          alt={shop.name}
          fill
          className={cn(
            "object-cover transition-all duration-300",
            result === "loser" && "grayscale brightness-50"
          )}
          sizes="(max-width: 640px) 50vw, 280px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        {result === "winner" && (
          <div className="absolute inset-0 flex items-center justify-center bg-amber-400/20">
            <div className="w-11 h-11 rounded-full bg-amber-400 flex items-center justify-center shadow-lg animate-fade-up">
              <Check size={20} className="text-white" strokeWidth={3} />
            </div>
          </div>
        )}

        <div className="absolute top-2.5 left-2.5">
          <span className={cn(
            "text-[9px] font-bold px-2 py-0.5 rounded-full leading-4",
            isNew ? "bg-amber-400/90 text-white" : "bg-white/20 backdrop-blur-sm text-white"
          )}>
            {label}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 pt-8">
          <p className="text-[9px] font-medium text-white/60 mb-0.5 flex items-center gap-0.5 truncate">
            <MapPin size={8} className="flex-shrink-0" />
            {shop.neighborhood}
          </p>
          <h3 className="font-bold text-white text-sm leading-tight line-clamp-2">
            {shop.name}
          </h3>
        </div>
      </div>
    </button>
  );
}

// ─── Insertion view ───────────────────────────────────────────────────────────

const AUTO_ADVANCE_MS = 700;

function InsertionView({ onPlaced }: { onPlaced: () => void }) {
  const {
    shops,
    getInsertionTarget,
    getNextInsertionOpponent,
    submitInsertionComparison,
    tieInsertionAtMidpoint,
  } = useAppState();

  const targetVisit = getInsertionTarget();
  const targetShop = targetVisit ? shops.find((s) => s.id === targetVisit.shopId) : null;
  const opponentShop = getNextInsertionOpponent();

  const [result, setResult] = useState<"new" | "opponent" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset when pair changes
  useEffect(() => {
    setResult(null);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [targetVisit?.shopId, opponentShop?.id]);

  if (!targetVisit || !targetShop || !opponentShop) return null;

  const ins = targetVisit.insertionState!;
  const step = ins.comparisons.length + 1;
  const maxSteps = estimatedSteps(ins.totalRankedAtStart);
  const progress = Math.min(ins.comparisons.length / Math.max(maxSteps, 1), 1);

  const handleSelect = (winner: "new" | "opponent") => {
    if (result) return;
    setResult(winner);
    const winnerId = winner === "new" ? targetShop.id : opponentShop.id;
    submitInsertionComparison(targetShop.id, opponentShop.id, winnerId);
    timer.current = setTimeout(onPlaced, AUTO_ADVANCE_MS);
  };

  const handleTie = () => {
    tieInsertionAtMidpoint(targetShop.id);
    onPlaced();
  };

  const handleSkip = () => {
    // Treat skip as new shop losing this comparison (conservative placement)
    submitInsertionComparison(targetShop.id, opponentShop.id, opponentShop.id);
    onPlaced();
  };

  const newResult: CardResult = result ? (result === "new" ? "winner" : "loser") : "idle";
  const oppResult: CardResult = result ? (result === "opponent" ? "winner" : "loser") : "idle";

  return (
    <div className="px-4">
      {/* Framing */}
      <div className="mb-4">
        <h2 className="text-[15px] font-bold text-stone-900 leading-snug">
          Placing <span className="text-amber-700">{targetShop.name}</span>
        </h2>
        <p className="text-xs text-stone-400 mt-0.5">
          Which would you choose again?
        </p>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-stone-500">
            Step {step} of ~{maxSteps}
          </span>
          <span className="text-[10px] text-stone-400">
            Narrowing placement
          </span>
        </div>
        <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Side-by-side cards */}
      <div className="relative flex gap-2.5">
        <ComparisonCard
          shop={targetShop}
          onSelect={() => handleSelect("new")}
          result={newResult}
          label="New visit"
          isNew
        />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center shadow-sm">
          <span className="text-[9px] font-black text-stone-400 tracking-tight">VS</span>
        </div>

        <ComparisonCard
          shop={opponentShop}
          onSelect={() => handleSelect("opponent")}
          result={oppResult}
          label="Past visit"
          isNew={false}
        />
      </div>

      {/* Actions */}
      <div className="mt-3">
        {result ? (
          <button
            onClick={() => { if (timer.current) clearTimeout(timer.current); onPlaced(); }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-stone-900 text-white font-semibold text-sm animate-fade-up tap-scale"
          >
            Continue <ChevronRight size={15} />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleTie}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-500 text-xs font-medium tap-scale"
            >
              <Equal size={13} />
              Too close to call
            </button>
            <button
              onClick={handleSkip}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-400 text-xs font-medium tap-scale"
            >
              <SkipForward size={13} />
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Placement result screen ──────────────────────────────────────────────────

function PlacementResult({ onDone }: { onDone: () => void }) {
  const { lastInsertionResult, clearLastInsertionResult, shops, getRankedVisits } = useAppState();

  if (!lastInsertionResult) return null;

  const { shopId, finalRank, totalRanked } = lastInsertionResult;
  const shop = shops.find((s) => s.id === shopId);
  if (!shop) return null;

  const ranked = getRankedVisits();
  const aboveVisit = ranked.find((v) => v.personalRank === finalRank - 1);
  const belowVisit = ranked.find((v) => v.personalRank === finalRank + 1);
  const aboveShop = aboveVisit ? shops.find((s) => s.id === aboveVisit.shopId) : null;
  const belowShop = belowVisit ? shops.find((s) => s.id === belowVisit.shopId) : null;

  const isFirst = finalRank === 1;
  const isLast = finalRank === totalRanked;

  const handleDone = () => {
    clearLastInsertionResult();
    onDone();
  };

  return (
    <div className="px-4 animate-fade-up">
      {/* Trophy header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
          <Trophy size={18} className="text-amber-500" />
        </div>
        <div>
          <p className="text-xs text-stone-400">Placement complete</p>
          <h2 className="text-[15px] font-bold text-stone-900 leading-tight">
            {shop.name} is ranked
          </h2>
        </div>
      </div>

      {/* Rank card */}
      <div className="rounded-2xl overflow-hidden border border-stone-100 mb-4">
        <div className="relative h-28">
          <Image src={shop.heroImage} alt={shop.name} fill className="object-cover" sizes="400px" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
          <div className="absolute inset-0 flex items-center px-5 gap-4">
            <div className="flex-shrink-0">
              <span className="text-5xl font-black text-white tabular-nums leading-none">
                #{finalRank}
              </span>
            </div>
            <div>
              <p className="text-white/60 text-[10px]">out of {totalRanked} visited shops</p>
              <p className="text-white font-bold text-sm leading-tight mt-0.5">{shop.name}</p>
              <p className="text-white/50 text-[10px] mt-0.5">{shop.neighborhood}</p>
            </div>
          </div>
        </div>

        {/* Above / below context */}
        <div className="divide-y divide-stone-50">
          {aboveShop ? (
            <div className="flex items-center gap-3 px-4 py-2.5">
              <ArrowUp size={13} className="text-emerald-400 flex-shrink-0" />
              <div className="relative w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={aboveShop.heroImage} alt={aboveShop.name} fill className="object-cover" sizes="28px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-stone-400">Ranked above</p>
                <p className="text-xs font-semibold text-stone-700 truncate">{aboveShop.name}</p>
              </div>
              <span className="text-[10px] text-stone-400 flex-shrink-0">#{finalRank - 1}</span>
            </div>
          ) : isFirst ? (
            <div className="flex items-center gap-3 px-4 py-2.5">
              <Trophy size={13} className="text-amber-400 flex-shrink-0" />
              <p className="text-xs font-semibold text-amber-700">Your new #1 pick</p>
            </div>
          ) : null}

          {belowShop ? (
            <div className="flex items-center gap-3 px-4 py-2.5">
              <ArrowDown size={13} className="text-stone-300 flex-shrink-0" />
              <div className="relative w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={belowShop.heroImage} alt={belowShop.name} fill className="object-cover" sizes="28px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-stone-400">Ranked below</p>
                <p className="text-xs font-semibold text-stone-700 truncate">{belowShop.name}</p>
              </div>
              <span className="text-[10px] text-stone-400 flex-shrink-0">#{finalRank + 1}</span>
            </div>
          ) : isLast && totalRanked > 1 ? (
            <div className="flex items-center gap-3 px-4 py-2.5">
              <ArrowDown size={13} className="text-stone-300 flex-shrink-0" />
              <p className="text-xs text-stone-400">Bottom of your current ranking</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-2">
        <button
          onClick={handleDone}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-stone-900 text-white font-semibold text-sm tap-scale"
        >
          Done <CheckCircle size={15} />
        </button>
        <Link
          href="/saved"
          onClick={clearLastInsertionResult}
          className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-stone-500 text-sm font-medium tap-scale"
        >
          View your full ranking <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}

// ─── Empty / gating states ────────────────────────────────────────────────────

function NoVisitsState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-5">
        <Coffee size={28} className="text-stone-400" />
      </div>
      <h2 className="text-xl font-bold text-stone-900 mb-2">Log a visit first</h2>
      <p className="text-stone-400 text-sm leading-relaxed mb-6 max-w-xs">
        Find a shop, mark it as visited, then place it in your personal ranking.
        Your rankings feed the Community Score.
      </p>
      <Link
        href="/explore"
        className="flex items-center gap-2 bg-stone-900 text-white rounded-2xl px-5 py-3 font-semibold text-sm tap-scale"
      >
        Find shops <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function HasUnstartedState({
  visit,
  shop,
  onStart,
}: {
  visit: UserVisit;
  shop: CoffeeShop;
  onStart: () => void;
}) {
  const { getRankedVisits } = useAppState();
  const ranked = getRankedVisits();

  return (
    <div className="px-4">
      <div className="mb-5">
        <h2 className="text-[15px] font-bold text-stone-900 leading-snug">
          Place a new visit
        </h2>
        <p className="text-xs text-stone-400 mt-0.5">
          {ranked.length > 0
            ? `Compare it against your ${ranked.length} ranked shop${ranked.length !== 1 ? "s" : ""}`
            : "This will be your first ranked shop"}
        </p>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl mb-5">
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
            <Image src={shop.heroImage} alt={shop.name} fill className="object-cover" sizes="56px" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-amber-600 font-medium mb-0.5">{shop.neighborhood}</p>
            <p className="font-bold text-stone-900 text-sm leading-tight">{shop.name}</p>
            <p className="text-[10px] text-amber-500 mt-0.5">
              Visited · Not yet placed
            </p>
          </div>
        </div>

        {ranked.length > 0 && (
          <p className="text-[10px] text-amber-600 mt-3 pt-3 border-t border-amber-100">
            ~{estimatedSteps(ranked.length)} comparison{estimatedSteps(ranked.length) !== 1 ? "s" : ""} to determine placement
          </p>
        )}
      </div>

      <button
        onClick={onStart}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-stone-900 text-white font-semibold text-sm tap-scale"
      >
        Start placing {shop.name} <ArrowRight size={15} />
      </button>
    </div>
  );
}

function AllCaughtUpState() {
  const { visits, getRankedVisits } = useAppState();
  const ranked = getRankedVisits();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-20 text-center">
      <div className="text-4xl mb-4">☕</div>
      <h2 className="text-xl font-bold text-stone-900 mb-2">All ranked</h2>
      <p className="text-stone-400 text-sm leading-relaxed mb-3 max-w-xs">
        Every shop you&apos;ve visited has been placed in your personal ranking.
        Log a new visit to keep building it.
      </p>
      <p className="text-xs text-stone-300 mb-6">
        {visits.length} visit{visits.length !== 1 ? "s" : ""} · {ranked.length} ranked
      </p>
      <div className="flex flex-col gap-2 w-full">
        <Link
          href="/saved"
          className="flex items-center justify-center gap-2 bg-stone-900 text-white rounded-2xl px-5 py-3 font-semibold text-sm tap-scale"
        >
          View your ranking <ChevronRight size={15} />
        </Link>
        <Link
          href="/explore"
          className="flex items-center justify-center gap-2 text-stone-500 rounded-2xl px-5 py-2.5 font-medium text-sm tap-scale"
        >
          Find your next shop <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}

// ─── Visit history ────────────────────────────────────────────────────────────

function VisitHistory() {
  const { visits, shops, getRankedVisits } = useAppState();
  const ranked = getRankedVisits();

  const visitedShops = visits
    .slice()
    .sort((a, b) => {
      // Ranked visits first, sorted by rank; unranked last
      if (a.personalRank !== null && b.personalRank !== null) return a.personalRank - b.personalRank;
      if (a.personalRank !== null) return -1;
      if (b.personalRank !== null) return 1;
      return new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime();
    })
    .map((v) => ({ visit: v, shop: shops.find((s) => s.id === v.shopId) }))
    .filter((x): x is { visit: UserVisit; shop: CoffeeShop } => !!x.shop);

  if (visitedShops.length === 0) return null;

  return (
    <section className="px-4 mt-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-stone-900 text-sm">Your ranking</h3>
        <Link href="/saved" className="text-xs text-amber-600 font-medium">
          See all
        </Link>
      </div>
      <div className="space-y-1.5">
        {visitedShops.slice(0, 6).map(({ visit, shop }) => (
          <Link
            key={shop.id}
            href={`/shop/${shop.slug}`}
            className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-stone-100 tap-scale hover:border-stone-200 transition-colors"
          >
            {/* Rank number */}
            <div className="w-7 flex-shrink-0 text-center">
              {visit.personalRank !== null ? (
                <span className="text-sm font-bold text-stone-400 tabular-nums">
                  {visit.personalRank}
                </span>
              ) : (
                <span className="text-xs text-stone-300">—</span>
              )}
            </div>
            <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
              <Image src={shop.heroImage} alt={shop.name} fill className="object-cover" sizes="40px" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">{shop.name}</p>
              <p className="text-[10px] text-stone-400">{shop.neighborhood}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <ScoreBadge score={shop.communityScore} type="community" size="sm" />
              {visit.personalRank === null && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">
                  {visit.insertionState?.status === "in_progress" ? "In progress" : "Not placed"}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type PageMode =
  | "no_visits"
  | "has_unstarted"
  | "inserting"
  | "placed"
  | "all_caught_up";

export default function RankPage() {
  const {
    visits, shops,
    lastInsertionResult,
    getInsertionTarget,
    startInsertion,
    getRankedVisits,
    clearLastInsertionResult,
  } = useAppState();

  const ranked = getRankedVisits();
  const insertionTarget = getInsertionTarget();

  // Derive page mode
  function getMode(): PageMode {
    if (lastInsertionResult) return "placed";
    if (insertionTarget) return "inserting";
    if (visits.length === 0) return "no_visits";
    const unstartedVisit = visits.find((v) => v.insertionState === null);
    if (unstartedVisit) return "has_unstarted";
    return "all_caught_up";
  }

  const mode = getMode();

  // For has_unstarted: find oldest unstarted visit
  const unstartedVisit = visits
    .filter((v) => v.insertionState === null)
    .sort((a, b) => new Date(a.visitedAt).getTime() - new Date(b.visitedAt).getTime())[0] ?? null;
  const unstartedShop = unstartedVisit ? shops.find((s) => s.id === unstartedVisit.shopId) : null;

  const handleInsertionAdvance = () => {
    // After submitInsertionComparison, store updates; re-render handles next step
    // If the insertion is now complete, lastInsertionResult will be set → mode becomes "placed"
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <header className="px-4 pt-12 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Rank</h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Your personal coffee hierarchy
          </p>
        </div>
        {ranked.length > 0 && (
          <div className="text-right">
            <p className="text-xl font-bold text-stone-900 tabular-nums">{ranked.length}</p>
            <p className="text-[10px] text-stone-400">ranked</p>
          </div>
        )}
      </header>

      {/* Credibility pill */}
      {(mode === "inserting" || mode === "has_unstarted") && (
        <div className="mx-4 mb-5 flex items-center gap-2.5 px-3.5 py-2 bg-stone-50 border border-stone-100 rounded-2xl">
          <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
          <p className="text-xs text-stone-500">
            Only shops you&apos;ve personally visited · results feed Community Rank
          </p>
        </div>
      )}

      {mode === "no_visits" && <NoVisitsState />}

      {mode === "has_unstarted" && unstartedShop && unstartedVisit && (
        <HasUnstartedState
          visit={unstartedVisit}
          shop={unstartedShop}
          onStart={() => startInsertion(unstartedVisit.shopId)}
        />
      )}

      {mode === "inserting" && (
        <InsertionView onPlaced={handleInsertionAdvance} />
      )}

      {mode === "placed" && (
        <PlacementResult onDone={() => clearLastInsertionResult()} />
      )}

      {mode === "all_caught_up" && <AllCaughtUpState />}

      {/* Visit history — shown below in non-empty states */}
      {mode !== "no_visits" && mode !== "placed" && <VisitHistory />}
    </div>
  );
}
