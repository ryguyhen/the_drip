"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { getCategoryBySlug } from "@/data/categories";
import { useAppState } from "@/hooks/useAppState";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { cn } from "@/lib/utils";

export default function LeaderboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const category = getCategoryBySlug(slug);

  if (!category) notFound();

  // Use live shops from store so community scores reflect current Elo state
  const { shops } = useAppState();
  const ranked = category.getShops(shops);

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <header className="px-4 pt-12 pb-5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-stone-400 text-sm mb-5 tap-scale"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl flex-shrink-0",
            category.bgClass, category.borderClass
          )}>
            {category.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">{category.title}</h1>
            <p className="text-xs text-stone-400 mt-0.5">{category.descriptor}</p>
          </div>
        </div>
      </header>

      {/* Count */}
      <div className="px-4 mb-4">
        <p className="text-xs text-stone-400">
          {ranked.length} shop{ranked.length !== 1 ? "s" : ""} · ranked by {category.scoreLabel.toLowerCase()} score
        </p>
      </div>

      {/* Ranked list */}
      <div className="px-4 space-y-2">
        {ranked.map((shop, index) => {
          const rank = index + 1;
          const categoryScore = category.getScore(shop);

          return (
            <Link
              key={shop.id}
              href={`/shop/${shop.slug}`}
              className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-stone-100 tap-scale hover:border-stone-200 transition-colors"
            >
              {/* Rank */}
              <div className="w-8 flex-shrink-0 text-center">
                {rank <= 3 ? (
                  <span className={cn(
                    "text-sm font-black tabular-nums",
                    rank === 1 && "text-amber-500",
                    rank === 2 && "text-stone-400",
                    rank === 3 && "text-amber-700/60"
                  )}>
                    #{rank}
                  </span>
                ) : (
                  <span className="text-sm font-bold text-stone-300 tabular-nums">
                    {rank}
                  </span>
                )}
              </div>

              {/* Thumbnail */}
              <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={shop.heroImage}
                  alt={shop.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-stone-900 leading-tight truncate">
                  {shop.name}
                </p>
                <p className="text-[10px] text-stone-400 flex items-center gap-0.5 mt-0.5">
                  <MapPin size={9} />
                  {shop.neighborhood}, {shop.city}
                </p>
              </div>

              {/* Scores */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                {categoryScore !== null && (
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold",
                    category.bgClass, category.borderClass, category.accentClass
                  )}>
                    <span>{categoryScore}</span>
                  </div>
                )}
                <ScoreBadge score={shop.communityScore} type="community" size="sm" />
              </div>
            </Link>
          );
        })}
      </div>

      {ranked.length === 0 && (
        <div className="px-4 py-20 text-center">
          <p className="text-stone-400 text-sm">No shops match this category yet.</p>
        </div>
      )}
    </div>
  );
}
