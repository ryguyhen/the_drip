"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  User, CoffeeShop, SavedShop, UserVisit,
  InsertionState, InsertionComparison, LastInsertionResult,
} from "@/types";
import { MOCK_USER } from "@/data/user";
import { SHOPS } from "@/data/shops";
import { updateElo, eloToScore } from "@/lib/scoring";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppState {
  user: User;
  shops: CoffeeShop[];
  savedShops: SavedShop[];
  visits: UserVisit[];
  hasCompletedOnboarding: boolean;

  /** Set after an insertion completes — cleared by rank page after showing result */
  lastInsertionResult: LastInsertionResult | null;

  // User
  setUser: (partial: Partial<User>) => void;
  upgradeToPremium: () => void;

  // Bookmarks
  saveShop: (shopId: string) => void;
  unsaveShop: (shopId: string) => void;
  isSaved: (shopId: string) => boolean;

  // Visits
  logVisit: (shopId: string) => void;
  removeVisit: (shopId: string) => void;
  isVisited: (shopId: string) => boolean;
  getVisit: (shopId: string) => UserVisit | undefined;

  // Personal ranking (binary insertion)
  /** Visits that have a finalRank, sorted best (#1) to worst */
  getRankedVisits: () => UserVisit[];
  /** The visit currently mid-insertion (status in_progress), if any */
  getInsertionTarget: () => UserVisit | null;
  /**
   * The next opponent shop to compare against for the in-progress insertion.
   * Computed as the shop at index floor((lo+hi)/2) of the sorted ranked list.
   */
  getNextInsertionOpponent: () => CoffeeShop | null;
  /**
   * Begin the insertion flow for a newly visited shop.
   * If there are no other ranked visits, immediately assigns rank 1.
   * No-ops if an insertion for a different shop is already in progress,
   * or if this shop already has an insertionState.
   */
  startInsertion: (shopId: string) => void;
  /**
   * Record one comparison step in the binary insertion flow.
   * Updates Elo on both shops, advances lo/hi, and finalises if lo > hi.
   */
  submitInsertionComparison: (
    newShopId: string,
    opponentShopId: string,
    winnerId: string,
  ) => void;
  /**
   * Immediately place the new shop at the midpoint position (tie / too-close-to-call).
   */
  tieInsertionAtMidpoint: (newShopId: string) => void;
  /** Clear the result snapshot after the rank page has shown it */
  clearLastInsertionResult: () => void;

  completeOnboarding: (preferences: User["preferences"]) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Sorted array of fully-ranked visits (personalRank !== null), best first */
function sortedRanked(visits: UserVisit[]): UserVisit[] {
  return visits
    .filter((v) => v.personalRank !== null)
    .sort((a, b) => a.personalRank! - b.personalRank!);
}

/**
 * Finalise a placement: assign personalRank to the new visit and shift
 * all existing visits whose rank >= insertionPoint up by one.
 * insertionPoint is 0-based index (finalRank = insertionPoint + 1).
 */
function applyPlacement(
  visits: UserVisit[],
  newShopId: string,
  insertionPoint: number,
  updatedInsertionState: InsertionState,
): UserVisit[] {
  const finalRank = insertionPoint + 1;
  return visits.map((v) => {
    if (v.shopId === newShopId) {
      return {
        ...v,
        personalRank: finalRank,
        comparisonCount: updatedInsertionState.comparisons.length,
        lastComparedAt: new Date().toISOString(),
        insertionState: updatedInsertionState,
      };
    }
    if (v.personalRank !== null && v.personalRank >= finalRank) {
      return { ...v, personalRank: v.personalRank + 1 };
    }
    return v;
  });
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppState = create<AppState>()(
  persist(
    (set, get) => ({
      user: MOCK_USER,
      shops: SHOPS,
      savedShops: [],
      visits: [],
      hasCompletedOnboarding: false,
      lastInsertionResult: null,

      // ── User ──────────────────────────────────────────────────────────────

      setUser: (partial) =>
        set((state) => ({ user: { ...state.user, ...partial } })),

      upgradeToPremium: () =>
        set((state) => ({ user: { ...state.user, isPremium: true } })),

      // ── Bookmarks ─────────────────────────────────────────────────────────

      saveShop: (shopId) => {
        if (get().savedShops.some((s) => s.shopId === shopId)) return;
        set((state) => ({
          savedShops: [
            ...state.savedShops,
            {
              id: `save-${Date.now()}`,
              userId: state.user.id,
              shopId,
              type: "saved" as const,
              createdAt: new Date().toISOString(),
            },
          ],
          user: { ...state.user, savedShopsCount: state.user.savedShopsCount + 1 },
        }));
      },

      unsaveShop: (shopId) =>
        set((state) => ({
          savedShops: state.savedShops.filter((s) => s.shopId !== shopId),
          user: {
            ...state.user,
            savedShopsCount: Math.max(0, state.user.savedShopsCount - 1),
          },
        })),

      isSaved: (shopId) =>
        get().savedShops.some((s) => s.shopId === shopId),

      // ── Visits ────────────────────────────────────────────────────────────

      logVisit: (shopId) => {
        if (get().visits.some((v) => v.shopId === shopId)) return;
        set((state) => ({
          visits: [
            ...state.visits,
            {
              id: `visit-${Date.now()}`,
              userId: state.user.id,
              shopId,
              visitedAt: new Date().toISOString(),
              personalRank: null,
              insertionState: null,
              comparisonCount: 0,
              lastComparedAt: null,
            },
          ],
        }));
      },

      removeVisit: (shopId) =>
        set((state) => {
          const removed = state.visits.find((v) => v.shopId === shopId);
          const removedRank = removed?.personalRank ?? null;
          return {
            visits: state.visits
              .filter((v) => v.shopId !== shopId)
              .map((v) => {
                if (removedRank !== null && v.personalRank !== null && v.personalRank > removedRank) {
                  return { ...v, personalRank: v.personalRank - 1 };
                }
                return v;
              }),
          };
        }),

      isVisited: (shopId) =>
        get().visits.some((v) => v.shopId === shopId),

      getVisit: (shopId) =>
        get().visits.find((v) => v.shopId === shopId),

      // ── Personal ranking ──────────────────────────────────────────────────

      getRankedVisits: () => sortedRanked(get().visits),

      getInsertionTarget: () =>
        get().visits.find((v) => v.insertionState?.status === "in_progress") ?? null,

      getNextInsertionOpponent: () => {
        const { visits, shops } = get();
        const target = visits.find((v) => v.insertionState?.status === "in_progress");
        if (!target) return null;
        const ins = target.insertionState!;
        const ranked = sortedRanked(visits.filter((v) => v.shopId !== target.shopId));
        const mid = Math.floor((ins.lo + ins.hi) / 2);
        const opponentVisit = ranked[mid];
        if (!opponentVisit) return null;
        return shops.find((s) => s.id === opponentVisit.shopId) ?? null;
      },

      startInsertion: (shopId) => {
        set((state) => {
          const targetVisit = state.visits.find((v) => v.shopId === shopId);
          if (!targetVisit) return {};
          // Don't overwrite existing insertion state
          if (targetVisit.insertionState !== null) return {};
          // Only one insertion at a time
          const alreadyInProgress = state.visits.find(
            (v) => v.shopId !== shopId && v.insertionState?.status === "in_progress"
          );
          if (alreadyInProgress) return {};

          const ranked = sortedRanked(state.visits.filter((v) => v.shopId !== shopId));
          const N = ranked.length;

          if (N === 0) {
            // First ranked visit — immediately rank #1
            const ins: InsertionState = {
              totalRankedAtStart: 0,
              lo: 0,
              hi: -1,
              comparisons: [],
              status: "complete",
              finalRank: 1,
            };
            return {
              visits: state.visits.map((v) =>
                v.shopId === shopId ? { ...v, personalRank: 1, insertionState: ins } : v
              ),
              lastInsertionResult: { shopId, finalRank: 1, totalRanked: 1 },
            };
          }

          const ins: InsertionState = {
            totalRankedAtStart: N,
            lo: 0,
            hi: N - 1,
            comparisons: [],
            status: "in_progress",
            finalRank: null,
          };
          return {
            visits: state.visits.map((v) =>
              v.shopId === shopId ? { ...v, insertionState: ins } : v
            ),
          };
        });
      },

      submitInsertionComparison: (newShopId, opponentShopId, winnerId) => {
        set((state) => {
          const targetVisit = state.visits.find((v) => v.shopId === newShopId);
          if (!targetVisit?.insertionState || targetVisit.insertionState.status !== "in_progress") return {};

          const ins = targetVisit.insertionState;
          const ranked = sortedRanked(state.visits.filter((v) => v.shopId !== newShopId));
          const mid = Math.floor((ins.lo + ins.hi) / 2);
          const opponentRank = ranked[mid]?.personalRank ?? 1;

          // Update Elo
          const shops = [...state.shops];
          const wi = shops.findIndex((s) => s.id === winnerId);
          const li = shops.findIndex((s) => s.id === (winnerId === newShopId ? opponentShopId : newShopId));
          if (wi !== -1 && li !== -1) {
            const updated = updateElo(shops[wi].communityElo, shops[li].communityElo);
            shops[wi] = { ...shops[wi], communityElo: updated.winner, communityScore: eloToScore(updated.winner) };
            shops[li] = { ...shops[li], communityElo: updated.loser, communityScore: eloToScore(updated.loser) };
          }

          const newComp: InsertionComparison = {
            opponentShopId,
            opponentRank,
            winnerId,
            createdAt: new Date().toISOString(),
          };

          // Advance binary search
          let newLo = ins.lo;
          let newHi = ins.hi;
          if (winnerId === newShopId) {
            // New shop is better → it goes above the midpoint → hi = mid - 1
            newHi = mid - 1;
          } else {
            // Opponent is better → new shop goes below → lo = mid + 1
            newLo = mid + 1;
          }

          const done = newLo > newHi;
          const insertionPoint = newLo; // 0-based index
          const finalRank = done ? insertionPoint + 1 : null;

          const updatedIns: InsertionState = {
            ...ins,
            lo: newLo,
            hi: newHi,
            comparisons: [...ins.comparisons, newComp],
            status: done ? "complete" : "in_progress",
            finalRank,
          };

          const totalRanked = done ? ranked.length + 1 : ranked.length;
          const visits = done
            ? applyPlacement(state.visits, newShopId, insertionPoint, updatedIns)
            : state.visits.map((v) =>
                v.shopId === newShopId ? { ...v, insertionState: updatedIns } : v
              );

          return {
            shops,
            visits,
            lastInsertionResult: done
              ? { shopId: newShopId, finalRank: finalRank!, totalRanked }
              : state.lastInsertionResult,
            user: { ...state.user, shopsRanked: state.user.shopsRanked + 1 },
          };
        });
      },

      tieInsertionAtMidpoint: (newShopId) => {
        set((state) => {
          const targetVisit = state.visits.find((v) => v.shopId === newShopId);
          if (!targetVisit?.insertionState || targetVisit.insertionState.status !== "in_progress") return {};

          const ins = targetVisit.insertionState;
          const ranked = sortedRanked(state.visits.filter((v) => v.shopId !== newShopId));
          const mid = Math.floor((ins.lo + ins.hi) / 2);
          const opponentRank = ranked[mid]?.personalRank ?? 1;

          const newComp: InsertionComparison = {
            opponentShopId: ranked[mid]?.shopId ?? "",
            opponentRank,
            winnerId: "tie",
            createdAt: new Date().toISOString(),
          };

          // Place at the midpoint position (tie = same rank as opponent)
          const insertionPoint = mid;
          const finalRank = insertionPoint + 1;

          const updatedIns: InsertionState = {
            ...ins,
            lo: insertionPoint,
            hi: insertionPoint - 1, // lo > hi = done
            comparisons: [...ins.comparisons, newComp],
            status: "complete",
            finalRank,
          };

          const totalRanked = ranked.length + 1;
          const visits = applyPlacement(state.visits, newShopId, insertionPoint, updatedIns);

          return {
            visits,
            lastInsertionResult: { shopId: newShopId, finalRank, totalRanked },
            user: { ...state.user, shopsRanked: state.user.shopsRanked + 1 },
          };
        });
      },

      clearLastInsertionResult: () => set({ lastInsertionResult: null }),

      completeOnboarding: (preferences) =>
        set((state) => ({
          hasCompletedOnboarding: true,
          user: { ...state.user, preferences },
        })),
    }),
    {
      name: "thedrip-storage-v3",
      partialize: (state) => ({
        user: state.user,
        savedShops: state.savedShops,
        visits: state.visits,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        shops: state.shops,
        lastInsertionResult: state.lastInsertionResult,
      }),
    }
  )
);
