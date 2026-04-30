"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Star, Award } from "lucide-react";
import { getShopBySlug } from "@/data/shops";
import { useAppState } from "@/hooks/useAppState";
import { CRITERIA_LABELS, calculateProScore } from "@/lib/scoring";
import { CriteriaScores } from "@/types";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";

type WritableCriteriaKey = keyof Omit<CriteriaScores, "qualityOfPourOver" | "qualityOfEspresso">;
type NullableCriteriaKey = "qualityOfPourOver" | "qualityOfEspresso";

function StarRating({
  value,
  onChange,
  label,
  sublabel,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  sublabel?: string;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-stone-800">{label}</p>
        {sublabel && <p className="text-[11px] text-stone-400 mt-0.5">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="p-0.5 tap-scale"
          >
            <Star
              size={22}
              className={cn(
                "transition-colors",
                star <= (hovered || value)
                  ? "fill-amber-400 text-amber-400"
                  : "text-stone-200"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

const CRITERIA_SUBLABELS: Partial<Record<keyof CriteriaScores, string>> = {
  variationsOfCoffee: "Range of drinks & offerings",
  qualityOfBean: "Sourcing, freshness, origin quality",
  variationsOfBrewingMethods: "Drip, chemex, aeropress, etc.",
  qualityOfBrew: "Consistency and technical execution",
  atmosphereVibe: "Space, mood, design, energy",
  qualityOfService: "Barista knowledge and hospitality",
  qualityOfPourOver: "V60, Kalita, Chemex technique",
  qualityOfEspresso: "Extraction, crema, balance",
  specialtyFocus: "Dedication to specialty coffee culture",
  locationOfShop: "Accessibility, neighborhood, convenience",
};

export default function ReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const shop = getShopBySlug(slug);
  const user = useAppState((s) => s.user);
  const submitProReview = useAppState((s) => s.submitProReview);

  const [scores, setScores] = useState<CriteriaScores>({
    variationsOfCoffee: 0,
    qualityOfBean: 0,
    variationsOfBrewingMethods: 0,
    qualityOfBrew: 0,
    atmosphereVibe: 0,
    qualityOfService: 0,
    qualityOfPourOver: shop?.hasPourOver ? 0 : null,
    qualityOfEspresso: shop?.hasEspresso ? 0 : null,
    specialtyFocus: 0,
    locationOfShop: 0,
  });

  const [notes, setNotes] = useState("");
  const [favoriteDrink, setFavoriteDrink] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!shop) notFound();

  if (!user.isPremium) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <Star size={40} className="text-amber-400 mb-4" />
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Pro members only</h2>
        <p className="text-stone-400 mb-6">
          Upgrade to The Drip Pro to submit structured reviews.
        </p>
        <Link
          href="/premium"
          className="bg-amber-500 text-white rounded-2xl px-6 py-3 font-semibold"
        >
          Upgrade to Pro
        </Link>
      </div>
    );
  }

  const setScore = (key: keyof CriteriaScores, val: number) => {
    setScores((prev) => ({ ...prev, [key]: val }));
  };

  const applicableScores = Object.fromEntries(
    Object.entries(scores).filter(([, v]) => v !== null && v > 0)
  ) as Partial<CriteriaScores>;

  const allFilled = (Object.entries(scores) as [keyof CriteriaScores, number | null][])
    .filter(([, v]) => v !== null)
    .every(([, v]) => (v as number) > 0);

  const previewScore = allFilled
    ? calculateProScore(
        Object.fromEntries(
          Object.entries(scores).map(([k, v]) => [k, v === 0 ? null : v])
        ) as CriteriaScores
      )
    : null;

  const handleSubmit = () => {
    if (!allFilled || !shop) return;
    const normalized = Object.fromEntries(
      Object.entries(scores).map(([k, v]) => [k, v === 0 ? null : v]),
    ) as CriteriaScores;
    submitProReview(shop.id, normalized);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
          <Check size={28} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Review submitted!</h2>
        <p className="text-stone-400 mb-2">
          Your Pro Coffee Score for <strong>{shop.name}</strong> has been recorded.
        </p>
        {previewScore !== null && (
          <div className="my-4 px-6 py-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <p className="text-xs text-emerald-600 font-semibold mb-1">Your Pro Score</p>
            <span className="text-5xl font-bold text-emerald-700">{previewScore}</span>
            <span className="text-sm text-emerald-400">/100</span>
          </div>
        )}
        <Link
          href={`/shop/${shop.slug}`}
          className="bg-stone-900 text-white rounded-2xl px-6 py-3 font-semibold mt-2"
        >
          Back to {shop.name}
        </Link>
      </div>
    );
  }

  const writableKeys: WritableCriteriaKey[] = [
    "variationsOfCoffee",
    "qualityOfBean",
    "variationsOfBrewingMethods",
    "qualityOfBrew",
    "atmosphereVibe",
    "qualityOfService",
    "specialtyFocus",
    "locationOfShop",
  ];

  const nullableKeys: NullableCriteriaKey[] = ["qualityOfPourOver", "qualityOfEspresso"];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#faf9f7]/90 backdrop-blur-md px-4 pt-12 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <Link
            href={`/shop/${shop.slug}`}
            className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-stone-600" />
          </Link>
          <div>
            <h1 className="font-bold text-stone-900 leading-tight">Pro Review</h1>
            <p className="text-xs text-stone-400">{shop.name}</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full">
            <Award size={12} className="text-white" />
            <span className="text-[11px] font-bold text-white">PRO</span>
          </div>
        </div>
      </header>

      <div className="px-4 py-5">
        {/* Score preview */}
        {previewScore !== null && (
          <div className="mb-5 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center animate-fade-up">
            <p className="text-xs text-emerald-600 font-semibold mb-1">Pro Score preview</p>
            <span className="text-5xl font-bold text-emerald-700">{previewScore}</span>
            <span className="text-sm text-emerald-400"> / 100</span>
          </div>
        )}

        {/* Criteria section */}
        <div className="bg-white rounded-2xl border border-stone-100 px-4 mb-5">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider pt-4 pb-2">
            Core Criteria
          </p>
          {writableKeys.map((key) => (
            <StarRating
              key={key}
              value={scores[key] as number}
              onChange={(v) => setScore(key, v)}
              label={CRITERIA_LABELS[key]}
              sublabel={CRITERIA_SUBLABELS[key]}
            />
          ))}
        </div>

        {/* Optional criteria */}
        {nullableKeys.some((k) => scores[k] !== null) && (
          <div className="bg-white rounded-2xl border border-stone-100 px-4 mb-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider pt-4 pb-2">
              Available at this shop
            </p>
            {nullableKeys
              .filter((k) => scores[k] !== null)
              .map((key) => (
                <StarRating
                  key={key}
                  value={scores[key] as number}
                  onChange={(v) => setScore(key, v)}
                  label={CRITERIA_LABELS[key]}
                  sublabel={CRITERIA_SUBLABELS[key]}
                />
              ))}
          </div>
        )}

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-stone-100 p-4 mb-5">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
            Your notes
          </p>
          <div className="mb-3">
            <label className="text-sm font-medium text-stone-700 block mb-1.5">
              Favorite drink here
            </label>
            <input
              type="text"
              value={favoriteDrink}
              onChange={(e) => setFavoriteDrink(e.target.value)}
              placeholder="e.g., Single-origin pour over"
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1.5">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What made this shop stand out? Any context on your scores?"
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!allFilled}
          className={cn(
            "w-full py-4 rounded-2xl font-semibold text-[15px] transition-all tap-scale",
            allFilled
              ? "bg-stone-900 text-white"
              : "bg-stone-100 text-stone-300 cursor-not-allowed"
          )}
        >
          {allFilled ? "Submit Pro Review" : "Rate all criteria to submit"}
        </button>

        {!allFilled && (
          <p className="text-center text-xs text-stone-400 mt-2">
            Rate all applicable criteria to unlock submission
          </p>
        )}
      </div>
    </div>
  );
}
