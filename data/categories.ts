import type { CoffeeShop } from "@/types";

export interface Category {
  slug: string;
  title: string;
  descriptor: string;
  icon: string;
  /** Tailwind bg, border, and accent text classes for theming */
  bgClass: string;
  borderClass: string;
  accentClass: string;
  /** Returns shops sorted for this category, most relevant first */
  getShops: (shops: CoffeeShop[]) => CoffeeShop[];
  /** The score to display per shop on the leaderboard (0–100), or null to show community score */
  getScore: (shop: CoffeeShop) => number | null;
  scoreLabel: string;
}

export const CATEGORIES: Category[] = [
  {
    slug: "espresso",
    title: "Best Espresso",
    descriptor: "Extraction & technique",
    icon: "☕",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-100",
    accentClass: "text-amber-700",
    getShops: (shops) =>
      shops
        .filter((s) => s.hasEspresso && s.proCriteriaAverages?.qualityOfEspresso != null)
        .sort(
          (a, b) =>
            (b.proCriteriaAverages?.qualityOfEspresso ?? 0) -
            (a.proCriteriaAverages?.qualityOfEspresso ?? 0)
        ),
    getScore: (shop) =>
      shop.proCriteriaAverages?.qualityOfEspresso != null
        ? Math.round(shop.proCriteriaAverages.qualityOfEspresso * 20)
        : null,
    scoreLabel: "Espresso",
  },
  {
    slug: "pour-over",
    title: "Best Pour Over",
    descriptor: "Filter & nuance",
    icon: "🫗",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-100",
    accentClass: "text-blue-700",
    getShops: (shops) =>
      shops
        .filter((s) => s.hasPourOver && s.proCriteriaAverages?.qualityOfPourOver != null)
        .sort(
          (a, b) =>
            (b.proCriteriaAverages?.qualityOfPourOver ?? 0) -
            (a.proCriteriaAverages?.qualityOfPourOver ?? 0)
        ),
    getScore: (shop) =>
      shop.proCriteriaAverages?.qualityOfPourOver != null
        ? Math.round(shop.proCriteriaAverages.qualityOfPourOver * 20)
        : null,
    scoreLabel: "Pour Over",
  },
  {
    slug: "vibe",
    title: "Best Vibe",
    descriptor: "Space & atmosphere",
    icon: "✨",
    bgClass: "bg-violet-50",
    borderClass: "border-violet-100",
    accentClass: "text-violet-700",
    getShops: (shops) =>
      shops
        .filter((s) => s.proCriteriaAverages?.atmosphereVibe != null)
        .sort(
          (a, b) =>
            (b.proCriteriaAverages?.atmosphereVibe ?? 0) -
            (a.proCriteriaAverages?.atmosphereVibe ?? 0)
        ),
    getScore: (shop) =>
      shop.proCriteriaAverages?.atmosphereVibe != null
        ? Math.round(shop.proCriteriaAverages.atmosphereVibe * 20)
        : null,
    scoreLabel: "Atmosphere",
  },
  {
    slug: "service",
    title: "Best Service",
    descriptor: "Hospitality & care",
    icon: "🤝",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-100",
    accentClass: "text-emerald-700",
    getShops: (shops) =>
      shops
        .filter((s) => s.proCriteriaAverages?.qualityOfService != null)
        .sort(
          (a, b) =>
            (b.proCriteriaAverages?.qualityOfService ?? 0) -
            (a.proCriteriaAverages?.qualityOfService ?? 0)
        ),
    getScore: (shop) =>
      shop.proCriteriaAverages?.qualityOfService != null
        ? Math.round(shop.proCriteriaAverages.qualityOfService * 20)
        : null,
    scoreLabel: "Service",
  },
  {
    slug: "specialty",
    title: "Best Specialty",
    descriptor: "Roasters & sourcing",
    icon: "🌱",
    bgClass: "bg-lime-50",
    borderClass: "border-lime-100",
    accentClass: "text-lime-700",
    getShops: (shops) =>
      shops
        .filter((s) => s.proCriteriaAverages?.specialtyFocus != null)
        .sort(
          (a, b) =>
            (b.proCriteriaAverages?.specialtyFocus ?? 0) -
            (a.proCriteriaAverages?.specialtyFocus ?? 0)
        ),
    getScore: (shop) =>
      shop.proCriteriaAverages?.specialtyFocus != null
        ? Math.round(shop.proCriteriaAverages.specialtyFocus * 20)
        : null,
    scoreLabel: "Specialty",
  },
  {
    slug: "work",
    title: "Best for Working",
    descriptor: "Tables, wifi & focus",
    icon: "💻",
    bgClass: "bg-stone-50",
    borderClass: "border-stone-200",
    accentClass: "text-stone-600",
    getShops: (shops) =>
      shops
        .filter((s) => s.tags.includes("work-friendly"))
        .sort((a, b) => b.communityScore - a.communityScore),
    getScore: (shop) => shop.communityScore,
    scoreLabel: "Community",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
