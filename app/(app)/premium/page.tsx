"use client";

import { useRouter } from "next/navigation";
import { Award, Check, Star, Users, Layers, Filter, TrendingUp } from "lucide-react";
import { useAppState } from "@/hooks/useAppState";
import { CRITERIA_LABELS } from "@/lib/scoring";
import { cn } from "@/lib/utils";

const CRITERIA_KEYS = Object.keys(CRITERIA_LABELS) as Array<keyof typeof CRITERIA_LABELS>;

const PRO_FEATURES = [
  {
    icon: Award,
    title: "Submit Pro Coffee reviews",
    desc: "Rate shops across 10 technical criteria. Your scores contribute to the Pro Coffee Score.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Layers,
    title: "Full criteria breakdowns",
    desc: "See the detailed score breakdown for every shop — bean quality, espresso, pour over, and more.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: TrendingUp,
    title: "Category leaderboards",
    desc: "Access ranked lists by espresso quality, pour over quality, atmosphere, and specialty focus.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Filter,
    title: "Deeper filters",
    desc: "Filter by minimum Pro Score, bean quality threshold, and technique ratings.",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    icon: Users,
    title: "Support the community",
    desc: "Pro reviews improve the accuracy and depth of the entire platform for all users.",
    color: "text-stone-500",
    bg: "bg-stone-100",
  },
];

export default function PremiumPage() {
  const router = useRouter();
  const { user, upgradeToPremium } = useAppState();

  const handleUpgrade = () => {
    upgradeToPremium();
    router.push("/profile");
  };

  if (user.isPremium) {
    return (
      <div className="min-h-screen px-4 pt-12 pb-8 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-5">
          <Star size={28} className="text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">
          You&apos;re a Pro member
        </h1>
        <p className="text-stone-400 mb-6 leading-relaxed max-w-sm">
          You have full access to all The Drip Pro features including reviews,
          criteria breakdowns, and leaderboards.
        </p>
        <button
          onClick={() => router.back()}
          className="bg-stone-900 text-white rounded-2xl px-6 py-3 font-semibold tap-scale"
        >
          Back to exploring
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Hero */}
      <div className="px-4 pt-12 pb-8 bg-stone-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Star size={20} className="text-amber-400" />
            <span className="text-sm font-bold text-amber-400 uppercase tracking-wider">
              The Drip Pro
            </span>
          </div>
          <h1 className="text-3xl font-bold leading-tight mb-3">
            For serious coffee people.
          </h1>
          <p className="text-stone-300 text-[15px] leading-relaxed mb-6">
            Submit technical reviews, unlock full score breakdowns, and access
            exclusive insights across 10 coffee criteria.
          </p>

          {/* Pricing */}
          <div className="bg-white/10 rounded-2xl p-4 mb-5">
            <div className="flex items-end gap-2 mb-1">
              <span className="text-4xl font-bold">$4</span>
              <span className="text-stone-400 pb-1">/month</span>
            </div>
            <p className="text-stone-300 text-sm">
              Or $36/year — 25% off
            </p>
          </div>

          <button
            onClick={handleUpgrade}
            className="w-full bg-amber-500 text-white rounded-2xl py-4 font-bold text-[15px] hover:bg-amber-400 transition-colors tap-scale"
          >
            Upgrade to Pro
          </button>
          <p className="text-xs text-stone-400 text-center mt-2">
            Cancel anytime · No hidden fees
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="px-4 py-6">
        <h2 className="font-bold text-stone-900 mb-4 text-lg">
          What you get
        </h2>
        <div className="space-y-3">
          {PRO_FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
            <div
              key={title}
              className="flex gap-3 p-4 bg-white rounded-2xl border border-stone-100"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  bg
                )}
              >
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="font-semibold text-stone-900 text-sm mb-0.5">
                  {title}
                </p>
                <p className="text-xs text-stone-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The 10 criteria */}
      <div className="px-4 py-4 border-t border-stone-100">
        <h2 className="font-bold text-stone-900 mb-2 text-sm">
          The 10 Pro criteria
        </h2>
        <p className="text-xs text-stone-400 mb-4">
          Each criterion is rated 1–5 and weighted to produce a single 0–100 Pro Score.
        </p>
        <div className="space-y-2">
          {CRITERIA_KEYS.map((key) => (
            <div
              key={key}
              className="flex items-center gap-2 py-2 border-b border-stone-50 last:border-0"
            >
              <Check size={13} className="text-emerald-500 flex-shrink-0" />
              <span className="text-sm text-stone-700">{CRITERIA_LABELS[key]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-4 pt-6">
        <button
          onClick={handleUpgrade}
          className="w-full bg-stone-900 text-white rounded-2xl py-4 font-bold text-[15px] tap-scale"
        >
          Get The Drip Pro — $4/mo
        </button>
        <p className="text-xs text-stone-400 text-center mt-3">
          For this demo, clicking will simulate upgrading your account.
        </p>
      </div>
    </div>
  );
}
