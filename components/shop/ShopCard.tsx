"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Bookmark, BookmarkCheck } from "lucide-react";
import { CoffeeShop } from "@/types";
import { cn } from "@/lib/utils";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { Tag } from "@/components/ui/Tag";
import { useAppState } from "@/hooks/useAppState";

interface ShopCardProps {
  shop: CoffeeShop;
  variant?: "grid" | "list" | "featured";
  className?: string;
}

export function ShopCard({ shop, variant = "grid", className }: ShopCardProps) {
  const { isSaved, saveShop, unsaveShop } = useAppState();
  const saved = isSaved(shop.id);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    saved ? unsaveShop(shop.id) : saveShop(shop.id);
  };

  // ── List ────────────────────────────────────────────────────────────────────
  if (variant === "list") {
    return (
      <Link
        href={`/shop/${shop.slug}`}
        className={cn(
          "group flex gap-3 p-3 rounded-2xl bg-white border border-stone-100 tap-scale card-lift",
          className
        )}
      >
        <div className="relative w-[72px] h-[72px] flex-shrink-0 rounded-xl overflow-hidden bg-stone-100">
          <Image
            src={shop.heroImage}
            alt={shop.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="72px"
          />
          {shop.cityRank <= 3 && (
            <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
              {shop.cityRank}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-[13px] text-stone-900 leading-snug">
              {shop.name}
            </h3>
            <button
              onClick={handleSave}
              className="flex-shrink-0 mt-0.5 text-stone-300 hover:text-amber-500 transition-colors duration-100"
              aria-label={saved ? "Unsave" : "Save"}
            >
              {saved
                ? <BookmarkCheck size={15} className="text-amber-500" />
                : <Bookmark size={15} />}
            </button>
          </div>
          <p className="text-[11px] text-stone-400 flex items-center gap-0.5 mt-0.5 mb-2">
            <MapPin size={10} className="flex-shrink-0" />
            {shop.neighborhood}
          </p>
          <div className="flex items-center gap-1.5">
            <ScoreBadge score={shop.communityScore} type="community" size="sm" />
            {shop.proScore !== null && (
              <ScoreBadge score={shop.proScore} type="pro" size="sm" />
            )}
          </div>
        </div>
      </Link>
    );
  }

  // ── Featured ────────────────────────────────────────────────────────────────
  if (variant === "featured") {
    return (
      <Link
        href={`/shop/${shop.slug}`}
        className={cn(
          "group relative w-56 h-72 flex-shrink-0 rounded-3xl overflow-hidden tap-scale block",
          className
        )}
      >
        <Image
          src={shop.heroImage}
          alt={shop.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="224px"
        />
        {/* Layered gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3">
          {shop.cityRank <= 5 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-sm">
              #{shop.cityRank} {shop.city === "New York" ? "NYC" : "LA"}
            </span>
          )}
          <button
            onClick={handleSave}
            className="ml-auto w-7 h-7 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center text-white transition-colors hover:bg-black/40"
            aria-label={saved ? "Unsave" : "Save"}
          >
            {saved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
          </button>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5">
          <p className="text-[10px] text-white/60 mb-0.5 tracking-wide">{shop.neighborhood}</p>
          <h3 className="font-semibold text-white text-[13px] leading-snug mb-2">
            {shop.name}
          </h3>
          <div className="flex items-center gap-1.5">
            <ScoreBadge score={shop.communityScore} type="community" size="sm" className="opacity-95" />
            {shop.proScore !== null && (
              <ScoreBadge score={shop.proScore} type="pro" size="sm" className="opacity-95" />
            )}
          </div>
        </div>
      </Link>
    );
  }

  // ── Grid (default) ──────────────────────────────────────────────────────────
  return (
    <Link
      href={`/shop/${shop.slug}`}
      className={cn(
        "group block rounded-2xl bg-white border border-stone-100 overflow-hidden tap-scale card-lift",
        className
      )}
    >
      <div className="relative h-40 w-full bg-stone-100">
        <Image
          src={shop.heroImage}
          alt={shop.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <button
          onClick={handleSave}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-stone-500 transition-colors hover:bg-white"
          aria-label={saved ? "Unsave" : "Save"}
        >
          {saved
            ? <BookmarkCheck size={13} className="text-amber-500" />
            : <Bookmark size={13} />}
        </button>
        {shop.cityRank <= 5 && (
          <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
            {shop.cityRank}
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-[10px] text-stone-400 mb-0.5">{shop.neighborhood}</p>
        <h3 className="font-semibold text-[13px] text-stone-900 leading-snug mb-2">
          {shop.name}
        </h3>
        <div className="flex flex-wrap gap-1 mb-2">
          {shop.tags.slice(0, 2).map((tag) => <Tag key={tag}>{tag}</Tag>)}
        </div>
        <div className="flex items-center gap-1.5">
          <ScoreBadge score={shop.communityScore} type="community" size="sm" />
          {shop.proScore !== null && (
            <ScoreBadge score={shop.proScore} type="pro" size="sm" />
          )}
        </div>
      </div>
    </Link>
  );
}
