"use client";

import Link from "next/link";
import { Bell, GitCompareArrows, ChevronRight, TrendingUp } from "lucide-react";
import { ShopCard } from "@/components/shop/ShopCard";
import { useAppState } from "@/hooks/useAppState";
import { getTrendingShops, getTopRankedByCity } from "@/data/shops";
import { CATEGORIES } from "@/data/categories";
import { cn } from "@/lib/utils";

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  href?: string;
}) {
  return (
    <div className="flex items-end justify-between px-4 mb-3">
      <div>
        <h2 className="font-bold text-stone-900 text-[15px]">{title}</h2>
        {subtitle && <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="text-xs text-amber-600 font-medium">
          See all
        </Link>
      )}
    </div>
  );
}

function HorizontalScroll({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="flex gap-3 px-4 pb-2" style={{ width: "max-content" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Category card ────────────────────────────────────────────────────────────

function CategoryCard({
  slug,
  title,
  descriptor,
  icon,
  bgClass,
  borderClass,
  accentClass,
  shopCount,
}: {
  slug: string;
  title: string;
  descriptor: string;
  icon: string;
  bgClass: string;
  borderClass: string;
  accentClass: string;
  shopCount: number;
}) {
  return (
    <Link
      href={`/leaderboard/${slug}`}
      className={cn(
        "flex-shrink-0 w-36 p-3.5 rounded-2xl border tap-scale",
        bgClass, borderClass
      )}
    >
      <span className="text-2xl block mb-2.5">{icon}</span>
      <p className={cn("font-bold text-sm leading-tight mb-0.5", accentClass)}>
        {title}
      </p>
      <p className="text-[10px] text-stone-400 leading-tight mb-3">
        {descriptor}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-stone-400">
          {shopCount} shop{shopCount !== 1 ? "s" : ""}
        </span>
        <ChevronRight size={12} className="text-stone-300" />
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { user, shops } = useAppState();

  // Use live shops for accurate community scores after Elo updates
  const trending = getTrendingShops();
  const topNearYou = getTopRankedByCity(user.city || "New York", 6);

  // Compute shop counts per category from live data
  const categoryShopCounts = CATEGORIES.map((cat) => ({
    ...cat,
    count: cat.getShops(shops).length,
  }));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-4 pt-12 pb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-stone-400 mb-0.5">Good morning,</p>
          <h1 className="text-xl font-bold text-stone-900">{user.name.split(" ")[0]}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/rank"
            className="flex items-center gap-1.5 bg-amber-500 text-white rounded-full px-3 py-1.5 text-xs font-semibold tap-scale"
          >
            <GitCompareArrows size={12} />
            Rank
          </Link>
          <button className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
            <Bell size={16} />
          </button>
        </div>
      </header>

      {/* Score explainer */}
      <div className="mx-4 mb-6 p-3.5 bg-stone-50 border border-stone-100 rounded-2xl flex items-center gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-semibold">
            Community
          </span>
          <span className="text-xs text-stone-400">vs</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
            Pro
          </span>
        </div>
        <p className="text-xs text-stone-400 leading-tight flex-1">
          Community scores come from people who&apos;ve actually visited
        </p>
      </div>

      {/* ── 1. Trending ── */}
      <section className="mb-7">
        <div className="flex items-end justify-between px-4 mb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <TrendingUp size={13} className="text-amber-500" />
              <h2 className="font-bold text-stone-900 text-[15px]">Trending</h2>
            </div>
            <p className="text-xs text-stone-400">Moving up the ranks</p>
          </div>
          <Link href="/explore" className="text-xs text-amber-600 font-medium">
            See all
          </Link>
        </div>
        <HorizontalScroll>
          {(trending.length > 0 ? trending : getTopRankedByCity("New York", 5)).map((shop) => (
            <ShopCard key={shop.id} shop={shop} variant="featured" />
          ))}
        </HorizontalScroll>
      </section>

      {/* ── 2. Top ranked near you ── */}
      <section className="mb-7">
        <SectionHeader
          title="Top ranked near you"
          subtitle={`Best in ${user.city || "New York"} by community score`}
          href="/explore"
        />
        <div className="px-4 space-y-2">
          {topNearYou.map((shop) => (
            <ShopCard key={shop.id} shop={shop} variant="list" />
          ))}
        </div>
      </section>

      {/* ── 3. Best of... category cards ── */}
      <section className="mb-7">
        <div className="flex items-end justify-between px-4 mb-3">
          <div>
            <h2 className="font-bold text-stone-900 text-[15px]">Best of…</h2>
            <p className="text-xs text-stone-400 mt-0.5">Leaderboards by category</p>
          </div>
        </div>
        <HorizontalScroll>
          {categoryShopCounts.map((cat) => (
            <CategoryCard
              key={cat.slug}
              slug={cat.slug}
              title={cat.title}
              descriptor={cat.descriptor}
              icon={cat.icon}
              bgClass={cat.bgClass}
              borderClass={cat.borderClass}
              accentClass={cat.accentClass}
              shopCount={cat.count}
            />
          ))}
        </HorizontalScroll>
      </section>

      {/* Rank CTA */}
      <section className="px-4 mb-8">
        <Link
          href="/rank"
          className="block p-5 bg-stone-900 rounded-3xl text-white tap-scale"
        >
          <p className="text-xs text-stone-400 mb-1">Help shape the rankings</p>
          <h3 className="text-lg font-bold mb-1">Rank your visits</h3>
          <p className="text-sm text-stone-400 mb-3">
            Log a visit, then compare it against your history. Your rankings move the Community Score.
          </p>
          <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white rounded-full px-4 py-2 text-sm font-semibold">
            <GitCompareArrows size={14} />
            Start ranking
          </span>
        </Link>
      </section>
    </div>
  );
}
