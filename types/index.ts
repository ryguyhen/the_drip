// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  city: string;
  isPremium: boolean;
  preferences: UserPreference[];
  shopsRanked: number;
  citiesExplored: number;
  savedShopsCount: number;
}

export type UserPreference =
  | "espresso-first"
  | "pour-over"
  | "vibe"
  | "work-friendly"
  | "roaster-led"
  | "pastries"
  | "minimalist";

// ─── Scoring ──────────────────────────────────────────────────────────────────

export interface CriteriaScores {
  variationsOfCoffee: number;
  qualityOfBean: number;
  variationsOfBrewingMethods: number;
  qualityOfBrew: number;
  atmosphereVibe: number;
  qualityOfService: number;
  qualityOfPourOver: number | null; // null = shop doesn't offer pour over
  qualityOfEspresso: number | null; // null = shop doesn't offer espresso
  specialtyFocus: number;
  locationOfShop: number;
}

// ─── Moderation & Source Attribution ─────────────────────────────────────────

export type ModerationStatus =
  | "approved"    // Live in the app
  | "pending"     // Awaiting review
  | "needs_review" // Flagged — incomplete data or conflict
  | "rejected"    // Will not be published
  | "draft";      // Being edited pre-submission

export interface SourceAttribution {
  /** Google Places API place_id for deduplication and re-enrichment */
  googlePlaceId: string | null;
  /** Which API method surfaced this candidate */
  importMethod: "text_search" | "nearby_search" | "place_details" | "manual" | null;
  /** Free-text query used to find it, e.g. "specialty coffee Tribeca" */
  sourceQuery: string | null;
  /** ISO timestamp of when it was ingested into the candidate pool */
  importedAt: string | null;
  /** Reviewer who approved/edited this record */
  reviewedBy: string | null;
  /** ISO timestamp of last moderation action */
  reviewedAt: string | null;
}

/** Quantifies how complete the shop's data is (0–1). Drives admin queue priority. */
export interface DataCompleteness {
  hasHeroImage: boolean;
  hasDescription: boolean;
  hasAddress: boolean;
  hasCoords: boolean;
  hasBrewAttributes: boolean; // hasEspresso / hasPourOver populated
  hasTags: boolean;
  hasProReviews: boolean;
  /** 0–1 computed score */
  score: number;
}

// ─── Coffee Shop ──────────────────────────────────────────────────────────────

export interface CoffeeShop {
  id: string;
  slug: string;
  name: string;
  description: string;
  city: string;
  neighborhood: string;
  address: string;
  latitude: number;
  longitude: number;
  heroImage: string;
  galleryImages: string[];
  tags: string[];
  hasEspresso: boolean;
  hasPourOver: boolean;
  hasMultiBrewMethods: boolean;
  specialtyFocusLevel: 1 | 2 | 3 | 4 | 5;
  communityElo: number;
  communityScore: number;
  cityRank: number;
  proScore: number | null;
  proCriteriaAverages: CriteriaScores | null;
  reviewCount: number;
  proReviewCount: number;
  // Curation flags
  featured?: boolean;
  trending?: boolean;
  recentlyAdded?: boolean;
  // Data provenance
  moderationStatus: ModerationStatus;
  source: SourceAttribution;
  dataCompleteness: DataCompleteness;
}

// ─── Place Candidate (pre-moderation) ────────────────────────────────────────

/**
 * A raw candidate shop ingested from the Google Places API.
 * Lives in the moderation queue until approved → becomes a CoffeeShop.
 */
export interface PlaceCandidate {
  id: string;
  /** Direct from Places API */
  googlePlaceId: string;
  name: string;
  address: string;
  city: string;
  neighborhood: string | null;
  latitude: number;
  longitude: number;
  /** Places API rating (1–5), used as a soft signal only */
  googleRating: number | null;
  googleReviewCount: number | null;
  /** Opening hours summary */
  openNow: boolean | null;
  websiteUri: string | null;
  phoneNumber: string | null;
  /** Places API types array e.g. ["cafe", "food", "establishment"] */
  placeTypes: string[];
  /** Raw editorial summary from Places API if available */
  editorialSummary: string | null;
  /** Photos from Places API (resource names, not URLs — resolved via photo API) */
  photoReferences: string[];
  /** Import metadata */
  importMethod: SourceAttribution["importMethod"];
  sourceQuery: string | null;
  importedAt: string;
  /** How the candidate was enriched after initial import */
  enrichmentStatus: "raw" | "enriched" | "mapped";
  /** Moderation outcome */
  moderationStatus: ModerationStatus;
  moderationNotes: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  /**
   * The partially-completed CoffeeShop fields filled in by a moderator.
   * Merged with Places API data at approval time.
   */
  curatorOverrides: Partial<
    Pick<
      CoffeeShop,
      | "slug"
      | "description"
      | "tags"
      | "hasEspresso"
      | "hasPourOver"
      | "hasMultiBrewMethods"
      | "specialtyFocusLevel"
      | "heroImage"
      | "galleryImages"
      | "neighborhood"
      | "featured"
    >
  >;
}

// ─── Insertion ranking ────────────────────────────────────────────────────────

/**
 * One head-to-head comparison made during a binary insertion flow.
 * The sequence of these comparisons fully determines where the new shop
 * belongs in the user's personal ranked list.
 */
export interface InsertionComparison {
  /** The previously-ranked shop used as the comparison midpoint */
  opponentShopId: string;
  /** The opponent's personal rank at the time of this comparison */
  opponentRank: number;
  /** The shop ID that the user chose as preferred */
  winnerId: string;
  createdAt: string;
}

/**
 * Binary-search state for inserting a newly visited shop into the user's
 * personal ranked list. lo and hi are indices (0-based) into the sorted
 * array of already-ranked visits; when lo > hi the insertion point is
 * determined and finalRank is set.
 */
export interface InsertionState {
  /** How many ranked visits existed when this insertion started — used to estimate total steps */
  totalRankedAtStart: number;
  /** Current search window lower bound (index into ranked visits array) */
  lo: number;
  /** Current search window upper bound (index into ranked visits array) */
  hi: number;
  comparisons: InsertionComparison[];
  status: "in_progress" | "complete";
  /** 1-indexed personal rank assigned upon completion; null while in progress */
  finalRank: number | null;
}

/** Snapshot captured after an insertion completes — used to show the result screen */
export interface LastInsertionResult {
  shopId: string;
  finalRank: number;
  /** Total ranked shops including the newly inserted one */
  totalRanked: number;
}

// ─── Pairwise & Reviews ───────────────────────────────────────────────────────

export type VoteType = "prefer" | "skip" | "tie";

export interface PairwiseVote {
  id: string;
  userId: string;
  /** The "anchor" — the newly visited shop being ranked */
  anchorShopId: string;
  /** The shop from the user's visit history being compared against */
  opponentShopId: string;
  selectedShopId: string | null;
  voteType: VoteType;
  /** Which card position the winner was shown in — for bias analysis */
  winnerPosition: 0 | 1 | null;
  /** Always true — votes are only submitted after both shops are visited */
  visitConfirmed: true;
  createdAt: string;
}

export interface ProReview {
  id: string;
  userId: string;
  shopId: string;
  criteriaScores: CriteriaScores;
  notes: string;
  favoriteDrink: string;
  tags: string[];
  photoUrl: string | null;
  overallScore: number;
  createdAt: string;
}

export interface SavedShop {
  id: string;
  userId: string;
  shopId: string;
  type: "saved" | "wishlist";
  createdAt: string;
}

/**
 * A user's confirmed visit to a shop.
 * Visits gate the ranking system — users place each newly visited shop
 * into their personal ordered list via a binary insertion flow.
 */
export interface UserVisit {
  id: string;
  userId: string;
  shopId: string;
  /** ISO timestamp of when the user logged this visit */
  visitedAt: string;
  /**
   * 1-indexed position in this user's personal ranked list.
   * null = insertion not yet complete.
   */
  personalRank: number | null;
  /**
   * State of the binary insertion flow for this visit.
   * null = insertion not yet started.
   */
  insertionState: InsertionState | null;
  /** Convenience counter: equals insertionState.comparisons.length when set */
  comparisonCount: number;
  lastComparedAt: string | null;
}

export interface FilterState {
  search: string;
  city: string;
  neighborhood: string;
  sortBy: "communityScore" | "proScore" | "name" | "cityRank";
  espressoMin: number | null;
  pourOverMin: number | null;
  atmosphereMin: number | null;
  specialtyFocusMin: number | null;
  hasMultiBrewMethods: boolean | null;
}
