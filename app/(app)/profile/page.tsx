"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  GitCompareArrows,
  Bookmark,
  CheckCircle,
  Star,
  ChevronRight,
  Award,
  ArrowRight,
} from "lucide-react";
import { useAppState } from "@/hooks/useAppState";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, savedShops, visits, upgradeToPremium, getRankedVisits, shops } = useAppState();
  const hasHydrated = useAppState((s) => s._hasHydrated);

  const ranked = getRankedVisits();
  const visitedCount = visits.length;
  const rankedCount = ranked.length;
  const savedCount = savedShops.length;
  const totalComparisons = visits.reduce((sum, v) => sum + v.comparisonCount, 0);
  const citiesExplored = new Set(
    visits
      .map((v) => shops.find((s) => s.id === v.shopId)?.city)
      .filter(Boolean)
  ).size || (visitedCount > 0 ? 1 : 0);

  const rankingCompleteness =
    visitedCount >= 1
      ? Math.round((rankedCount / visitedCount) * 100)
      : 0;

  const preferenceLabels: Record<string, string> = {
    "espresso-first": "Espresso-first ☕",
    "pour-over": "Pour over 🫗",
    vibe: "Atmosphere ✨",
    "work-friendly": "Work-friendly 💻",
    "roaster-led": "Roaster-led 🌱",
    pastries: "Pastries 🥐",
    minimalist: "Minimalist ⬜",
  };

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="px-4 pt-12 pb-5 border-b border-stone-100">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-200">
              <Image
                src={user.avatar}
                alt={user.name}
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
            {user.isPremium && (
              <div className="absolute -bottom-1 -right-1">
                <PremiumBadge size="sm" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-stone-900">{user.name}</h1>
            <div className="flex items-center gap-1 text-stone-400 mt-0.5">
              <MapPin size={12} />
              <span className="text-xs">{user.city}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visit + ranking stats */}
      <div className="px-4 py-5 border-b border-stone-100">
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
          Your coffee history
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-stone-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center mb-2">
              <CheckCircle size={15} className="text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-stone-900 tabular-nums">{visitedCount}</p>
            <p className="text-xs text-stone-400 mt-0.5">Shops visited</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-stone-100">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center mb-2">
              <GitCompareArrows size={15} className="text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-stone-900 tabular-nums">{totalComparisons}</p>
            <p className="text-xs text-stone-400 mt-0.5">Comparisons total</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-stone-100">
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center mb-2">
              <Bookmark size={15} className="text-stone-500" />
            </div>
            <p className="text-2xl font-bold text-stone-900 tabular-nums">{savedCount}</p>
            <p className="text-xs text-stone-400 mt-0.5">Saved shops</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-stone-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
              <MapPin size={15} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-stone-900 tabular-nums">{citiesExplored}</p>
            <p className="text-xs text-stone-400 mt-0.5">Cities explored</p>
          </div>
        </div>

        {/* Ranking completeness */}
        {visitedCount >= 1 && (
          <div className="mt-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-stone-700">Placement completeness</p>
              <p className="text-xs font-bold text-stone-900">{rankingCompleteness}%</p>
            </div>
            <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${rankingCompleteness}%` }}
              />
            </div>
            <p className="text-[10px] text-stone-400 mt-1.5">
              {rankedCount} of {visitedCount} visit{visitedCount !== 1 ? "s" : ""} placed in your ranking
              {rankingCompleteness < 100 && (
                <Link href="/rank" className="text-amber-600 font-medium ml-2">
                  Place now →
                </Link>
              )}
            </p>
          </div>
        )}

        {visitedCount === 0 && (
          <div className="mt-3">
            <Link
              href="/explore"
              className="flex items-center justify-between p-3.5 bg-amber-50 border border-amber-100 rounded-2xl tap-scale"
            >
              <div>
                <p className="text-sm font-semibold text-amber-800">Start logging visits</p>
                <p className="text-xs text-amber-600">Visits unlock the ranking system</p>
              </div>
              <ArrowRight size={15} className="text-amber-400" />
            </Link>
          </div>
        )}
      </div>

      {/* Preferences */}
      {user.preferences.length > 0 && (
        <div className="px-4 py-4 border-b border-stone-100">
          <h2 className="font-bold text-stone-900 mb-3 text-sm">My coffee style</h2>
          <div className="flex flex-wrap gap-2">
            {user.preferences.map((pref) => (
              <span
                key={pref}
                className="px-3 py-1.5 bg-stone-100 rounded-full text-xs font-medium text-stone-600"
              >
                {preferenceLabels[pref] ?? pref}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Premium */}
      {!hasHydrated ? (
        <div className="px-4 py-4 border-b border-stone-100">
          <div className="h-[120px] bg-stone-100 rounded-2xl animate-pulse" />
        </div>
      ) : user.isPremium ? (
        <div className="px-4 py-4 border-b border-stone-100">
          <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-50/30 border border-amber-100 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} className="text-amber-600" />
              <p className="font-bold text-stone-900 text-sm">The Drip Pro</p>
              <PremiumBadge />
            </div>
            <p className="text-xs text-stone-500 mb-3">
              Submit structured reviews, see full criteria breakdowns, access category leaderboards.
            </p>
            <Link href="/rank" className="text-xs text-amber-600 font-semibold">
              Start ranking →
            </Link>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4 border-b border-stone-100">
          <div className="p-4 bg-stone-900 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Star size={15} className="text-amber-400" />
              <p className="font-bold text-white text-sm">The Drip Pro</p>
            </div>
            <p className="text-xs text-stone-300 mb-3">
              Submit structured reviews, unlock criteria breakdowns, and access
              category leaderboards.
            </p>
            <button
              onClick={upgradeToPremium}
              className="flex items-center justify-between w-full bg-amber-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold tap-scale"
            >
              Upgrade to Pro
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="px-4 py-4">
        <h2 className="font-bold text-stone-900 mb-3 text-sm">Account</h2>
        <div className="space-y-1">
          {[
            { label: "Edit preferences", href: "/onboarding" },
            { label: "Premium & billing", href: "/premium" },
            { label: "About The Drip", href: "/" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center justify-between p-3.5 rounded-xl hover:bg-stone-50 transition-colors"
            >
              <span className="text-sm text-stone-700">{label}</span>
              <ChevronRight size={14} className="text-stone-300" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
