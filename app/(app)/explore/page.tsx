"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ShopCard } from "@/components/shop/ShopCard";
import { useAppState } from "@/hooks/useAppState";
import { cn } from "@/lib/utils";

type SortKey = "communityScore" | "proScore" | "name" | "cityRank";
type CityFilter = "all" | "New York" | "Los Angeles";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "communityScore", label: "Community Score" },
  { key: "proScore", label: "Pro Score" },
  { key: "cityRank", label: "City Rank" },
  { key: "name", label: "Name" },
];

const FEATURE_FILTERS: Array<{
  key: "hasEspresso" | "hasPourOver" | "hasMultiBrewMethods";
  label: string;
  emoji: string;
}> = [
  { key: "hasEspresso", label: "Espresso", emoji: "☕" },
  { key: "hasPourOver", label: "Pour over", emoji: "🫗" },
  { key: "hasMultiBrewMethods", label: "Multi-method", emoji: "⚗️" },
];

export default function ExplorePage() {
  const { shops } = useAppState();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<CityFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("communityScore");
  const [featureFilters, setFeatureFilters] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [minProScore, setMinProScore] = useState<number | null>(null);

  const toggleFeature = (key: string) => {
    setFeatureFilters((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let result = [...shops];

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.neighborhood.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (city !== "all") {
      result = result.filter((s) => s.city === city);
    }

    featureFilters.forEach((key) => {
      result = result.filter(
        (s) => s[key as keyof typeof s] === true
      );
    });

    if (minProScore !== null) {
      result = result.filter(
        (s) => s.proScore !== null && s.proScore >= minProScore
      );
    }

    result.sort((a, b) => {
      if (sortBy === "communityScore") return b.communityScore - a.communityScore;
      if (sortBy === "proScore") {
        if (a.proScore === null && b.proScore === null) return 0;
        if (a.proScore === null) return 1;
        if (b.proScore === null) return -1;
        return b.proScore - a.proScore;
      }
      if (sortBy === "cityRank") return a.cityRank - b.cityRank;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [shops, query, city, sortBy, featureFilters, minProScore]);

  const hasActiveFilters =
    city !== "all" || featureFilters.size > 0 || minProScore !== null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#faf9f7]/95 backdrop-blur-md pt-12 pb-3 px-4 border-b border-stone-100">
        <h1 className="text-xl font-bold text-stone-900 mb-3">Explore</h1>

        {/* Search */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2 bg-white border border-stone-200 rounded-2xl px-3 py-2.5">
            <Search size={15} className="text-stone-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shops, neighborhoods..."
              className="flex-1 text-sm text-stone-800 placeholder:text-stone-300 bg-transparent focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-stone-300">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "w-10 h-10 flex-shrink-0 rounded-2xl flex items-center justify-center border transition-colors",
              showFilters || hasActiveFilters
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white text-stone-500 border-stone-200"
            )}
          >
            <SlidersHorizontal size={15} />
          </button>
        </div>

        {/* City tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {(["all", "New York", "Los Angeles"] as CityFilter[]).map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                city === c
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-500 border-stone-200"
              )}
            >
              {c === "all" ? "All cities" : c === "New York" ? "NYC" : "LA"}
            </button>
          ))}
        </div>
      </header>

      {/* Filter panel */}
      {showFilters && (
        <div className="px-4 py-4 bg-stone-50 border-b border-stone-100 animate-fade-up">
          {/* Sort */}
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
            Sort by
          </p>
          <div className="flex gap-2 flex-wrap mb-4">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  sortBy === opt.key
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-500 border-stone-200"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Feature filters */}
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
            Must have
          </p>
          <div className="flex gap-2 flex-wrap mb-4">
            {FEATURE_FILTERS.map(({ key, label, emoji }) => (
              <button
                key={key}
                onClick={() => toggleFeature(key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  featureFilters.has(key)
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-500 border-stone-200"
                )}
              >
                <span>{emoji}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Min pro score */}
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
            Min Pro Score
          </p>
          <div className="flex gap-2">
            {[null, 70, 75, 80, 85].map((val) => (
              <button
                key={String(val)}
                onClick={() => setMinProScore(val)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  minProScore === val
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-500 border-stone-200"
                )}
              >
                {val === null ? "Any" : `${val}+`}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setCity("all");
                setFeatureFilters(new Set());
                setMinProScore(null);
              }}
              className="mt-3 text-xs text-amber-600 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      <div className="px-4 py-4">
        <p className="text-xs text-stone-400 mb-3">
          {filtered.length} shop{filtered.length !== 1 ? "s" : ""}
          {sortBy === "communityScore"
            ? " · by community score"
            : sortBy === "proScore"
            ? " · by pro score"
            : sortBy === "cityRank"
            ? " · by city rank"
            : " · alphabetical"}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">☕</p>
            <p className="font-semibold text-stone-600">No shops found</p>
            <p className="text-sm text-stone-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((shop, i) => (
              <div key={shop.id} className="flex items-center gap-2">
                <span className="text-sm font-bold text-stone-200 w-5 text-right flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <ShopCard shop={shop} variant="list" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
