"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, CheckCircle, MapPin, GitCompareArrows, ArrowRight } from "lucide-react";
import { ShopCard } from "@/components/shop/ShopCard";
import { useAppState } from "@/hooks/useAppState";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { cn } from "@/lib/utils";
import type { CoffeeShop, UserVisit } from "@/types";

type Tab = "saved" | "visited";

function VisitedShopRow({
  shop,
  visit,
  totalRanked,
}: {
  shop: CoffeeShop;
  visit: UserVisit;
  totalRanked: number;
}) {
  const isPlaced = visit.personalRank !== null;
  const isInProgress = visit.insertionState?.status === "in_progress";

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
      <Link href={`/shop/${shop.slug}`} className="flex gap-3 p-3 tap-scale">
        {/* Rank number column */}
        <div className="w-10 flex-shrink-0 flex flex-col items-center justify-center">
          {isPlaced ? (
            <>
              <span className="text-lg font-black text-stone-700 tabular-nums leading-none">
                {visit.personalRank}
              </span>
              <span className="text-[9px] text-stone-300">of {totalRanked}</span>
            </>
          ) : (
            <span className="text-lg text-stone-200 font-bold">—</span>
          )}
        </div>

        <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden">
          <Image
            src={shop.heroImage}
            alt={shop.name}
            fill
            className="object-cover"
            sizes="56px"
          />
          {isPlaced && (
            <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/30">
              <CheckCircle size={16} className="text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-stone-400 mb-0.5">{shop.neighborhood}, {shop.city}</p>
          <h3 className="font-semibold text-sm text-stone-900 leading-tight">{shop.name}</h3>
          <div className="flex items-center gap-2 mt-1.5">
            <ScoreBadge score={shop.communityScore} type="community" size="sm" />
            {shop.proScore !== null && (
              <ScoreBadge score={shop.proScore} type="pro" size="sm" />
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0 justify-center">
          <span className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-full",
            isPlaced
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
              : isInProgress
              ? "bg-blue-50 text-blue-500 border border-blue-100"
              : "bg-amber-50 text-amber-600 border border-amber-100"
          )}>
            {isPlaced ? `#${visit.personalRank}` : isInProgress ? "In progress" : "Not placed"}
          </span>
        </div>
      </Link>

      {/* Place CTA row — only for unplaced visits */}
      {!isPlaced && !isInProgress && (
        <div className="mx-3 mb-3">
          <Link
            href="/rank"
            className="flex items-center justify-between px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl tap-scale"
          >
            <div className="flex items-center gap-2">
              <GitCompareArrows size={13} className="text-amber-500" />
              <span className="text-xs font-semibold text-amber-700">Place in your ranking</span>
            </div>
            <ArrowRight size={13} className="text-amber-400" />
          </Link>
        </div>
      )}

      {/* Continue insertion CTA */}
      {isInProgress && (
        <div className="mx-3 mb-3">
          <Link
            href="/rank"
            className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl tap-scale"
          >
            <div className="flex items-center gap-2">
              <GitCompareArrows size={13} className="text-blue-400" />
              <span className="text-xs font-semibold text-blue-600">Continue ranking</span>
            </div>
            <ArrowRight size={13} className="text-blue-400" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SavedPage() {
  const { savedShops, visits, shops, getRankedVisits } = useAppState();
  const [tab, setTab] = useState<Tab>("visited");

  const saved = savedShops
    .map((s) => shops.find((sh) => sh.id === s.shopId))
    .filter(Boolean) as CoffeeShop[];

  const ranked = getRankedVisits();
  const totalRanked = ranked.length;

  // Sort: ranked visits by personalRank first, then unplaced
  const visitedList = visits
    .slice()
    .sort((a, b) => {
      if (a.personalRank !== null && b.personalRank !== null) return a.personalRank - b.personalRank;
      if (a.personalRank !== null) return -1;
      if (b.personalRank !== null) return 1;
      return new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime();
    })
    .map((v) => ({ visit: v, shop: shops.find((sh) => sh.id === v.shopId) }))
    .filter((x): x is { visit: UserVisit; shop: CoffeeShop } => !!x.shop);

  const unplacedCount = visitedList.filter((x) => x.visit.personalRank === null && x.visit.insertionState?.status !== "in_progress").length;
  const inProgressCount = visitedList.filter((x) => x.visit.insertionState?.status === "in_progress").length;

  return (
    <div className="min-h-screen">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold text-stone-900 mb-0.5">Your Coffee</h1>
        <p className="text-sm text-stone-400">Visits power the Community Rank</p>
      </header>

      {/* Unplaced callout */}
      {(unplacedCount > 0 || inProgressCount > 0) && tab === "visited" && (
        <div className="mx-4 mb-4 flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-100 rounded-2xl">
          <GitCompareArrows size={16} className="text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-800">
              {inProgressCount > 0
                ? "Ranking in progress"
                : `${unplacedCount} visit${unplacedCount !== 1 ? "s" : ""} not yet placed`}
            </p>
            <p className="text-[10px] text-amber-600">
              {inProgressCount > 0 ? "Continue to finish your ranking" : "Place them in your hierarchy"}
            </p>
          </div>
          <Link
            href="/rank"
            className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full flex-shrink-0 tap-scale"
          >
            {inProgressCount > 0 ? "Continue" : "Place now"}
          </Link>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 mb-5">
        <div className="flex gap-2 p-1 bg-stone-100 rounded-2xl">
          <button
            onClick={() => setTab("visited")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all",
              tab === "visited" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
            )}
          >
            <CheckCircle size={14} />
            Visited {visitedList.length > 0 && `(${visitedList.length})`}
          </button>
          <button
            onClick={() => setTab("saved")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all",
              tab === "saved" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
            )}
          >
            <Bookmark size={14} />
            Saved {saved.length > 0 && `(${saved.length})`}
          </button>
        </div>
      </div>

      <div className="px-4">
        {/* Visited tab */}
        {tab === "visited" && (
          visitedList.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">☕</div>
              <p className="font-semibold text-stone-700 mb-2">No visits logged yet</p>
              <p className="text-sm text-stone-400 leading-relaxed max-w-xs mx-auto mb-6">
                Open any shop page and tap <strong>Log a visit</strong> after you&apos;ve been there.
                Visits unlock the ranking system.
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 bg-stone-900 text-white rounded-2xl px-5 py-3 text-sm font-semibold tap-scale"
              >
                Find shops <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {visitedList.map(({ visit, shop }) => (
                <VisitedShopRow
                  key={shop.id}
                  shop={shop}
                  visit={visit}
                  totalRanked={totalRanked}
                />
              ))}

              {/* City breakdown */}
              <div className="mt-5 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={13} className="text-stone-400" />
                  <p className="text-sm font-semibold text-stone-700">Cities explored</p>
                </div>
                {Array.from(new Set(visitedList.map((x) => x.shop.city))).map((city) => {
                  const cityVisits = visitedList.filter((x) => x.shop.city === city);
                  const ranked = cityVisits.filter((x) => x.visit.comparisonCount > 0).length;
                  return (
                    <div key={city} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                      <span className="text-sm text-stone-600">{city}</span>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-stone-500">
                          {cityVisits.length} visited
                        </span>
                        {ranked > 0 && (
                          <span className="text-[10px] text-emerald-500 ml-2">
                            · {ranked} ranked
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

        {/* Saved tab */}
        {tab === "saved" && (
          saved.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔖</div>
              <p className="font-semibold text-stone-700 mb-1">No saved shops</p>
              <p className="text-sm text-stone-400 leading-relaxed max-w-xs mx-auto">
                Bookmark shops you want to visit. Saves don&apos;t affect rankings — only logged visits do.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {saved.map((shop) => (
                <ShopCard key={shop.id} shop={shop} variant="list" />
              ))}
              <p className="text-center text-xs text-stone-300 pt-3">
                Bookmarks don&apos;t affect Community Rankings.
                <Link href="/explore" className="text-amber-500 ml-1">Log a visit</Link> to rank.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
