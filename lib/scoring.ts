import { CriteriaScores, CoffeeShop } from "@/types";

// ─── Elo System ──────────────────────────────────────────────────────────────

const ELO_K = 32;
const ELO_BASE = 1500;

export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function updateElo(
  winnerElo: number,
  loserElo: number
): { winner: number; loser: number } {
  const expectedWinner = expectedScore(winnerElo, loserElo);
  const expectedLoser = expectedScore(loserElo, winnerElo);
  return {
    winner: Math.round(winnerElo + ELO_K * (1 - expectedWinner)),
    loser: Math.round(loserElo + ELO_K * (0 - expectedLoser)),
  };
}

/** Normalize Elo to a 0–100 community score. Tuned around 1500 baseline. */
export function eloToScore(elo: number): number {
  // Map roughly 1200–1800+ to 0–100
  const min = 1200;
  const max = 1850;
  const clamped = Math.min(Math.max(elo, min), max);
  return Math.round(((clamped - min) / (max - min)) * 100);
}

export { ELO_BASE };

// ─── Pro Coffee Score ─────────────────────────────────────────────────────────

/** Base weights (must sum to 1). */
const BASE_WEIGHTS: Record<keyof CriteriaScores, number> = {
  variationsOfCoffee: 0.08,
  qualityOfBean: 0.15,
  variationsOfBrewingMethods: 0.08,
  qualityOfBrew: 0.15,
  atmosphereVibe: 0.08,
  qualityOfService: 0.08,
  qualityOfPourOver: 0.10,
  qualityOfEspresso: 0.10,
  specialtyFocus: 0.12,
  locationOfShop: 0.06,
};

export const CRITERIA_LABELS: Record<keyof CriteriaScores, string> = {
  variationsOfCoffee: "Coffee Variety",
  qualityOfBean: "Bean Quality",
  variationsOfBrewingMethods: "Brewing Methods",
  qualityOfBrew: "Brew Quality",
  atmosphereVibe: "Atmosphere & Vibe",
  qualityOfService: "Service & Baristas",
  qualityOfPourOver: "Pour Over Quality",
  qualityOfEspresso: "Espresso Quality",
  specialtyFocus: "Specialty Focus",
  locationOfShop: "Location",
};

/**
 * Calculate a Pro Coffee Score (0–100) from criteria scores.
 * Null criteria (not applicable) are excluded and weights renormalized.
 */
export function calculateProScore(criteria: CriteriaScores): number {
  const applicable: Array<{ key: keyof CriteriaScores; score: number; weight: number }> = [];

  (Object.keys(criteria) as Array<keyof CriteriaScores>).forEach((key) => {
    const score = criteria[key];
    if (score !== null) {
      applicable.push({ key, score, weight: BASE_WEIGHTS[key] });
    }
  });

  const totalWeight = applicable.reduce((sum, c) => sum + c.weight, 0);
  const weightedSum = applicable.reduce(
    (sum, c) => sum + (c.score * c.weight) / totalWeight,
    0
  );

  return Math.round((weightedSum / 5) * 100);
}

/** Re-export normalized weights for display purposes. */
export function getNormalizedWeights(
  criteria: CriteriaScores
): Record<keyof CriteriaScores, number> {
  const applicable = (Object.keys(criteria) as Array<keyof CriteriaScores>).filter(
    (k) => criteria[k] !== null
  );
  const totalWeight = applicable.reduce((sum, k) => sum + BASE_WEIGHTS[k], 0);
  const result = {} as Record<keyof CriteriaScores, number>;
  (Object.keys(criteria) as Array<keyof CriteriaScores>).forEach((k) => {
    result[k] = criteria[k] !== null ? BASE_WEIGHTS[k] / totalWeight : 0;
  });
  return result;
}

/** Get descriptive label for a 0–100 score. */
export function scoreLabel(score: number): string {
  if (score >= 90) return "Exceptional";
  if (score >= 80) return "Outstanding";
  if (score >= 70) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 50) return "Average";
  return "Below Average";
}

/** Get color class for a 0–100 score. */
export function scoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 80) return "text-emerald-500";
  if (score >= 70) return "text-amber-500";
  if (score >= 60) return "text-amber-400";
  return "text-stone-400";
}

export function scoreBgColor(score: number): string {
  if (score >= 90) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 80) return "bg-emerald-50 text-emerald-600 border-emerald-100";
  if (score >= 70) return "bg-amber-50 text-amber-700 border-amber-200";
  if (score >= 60) return "bg-amber-50 text-amber-600 border-amber-100";
  return "bg-stone-100 text-stone-500 border-stone-200";
}
