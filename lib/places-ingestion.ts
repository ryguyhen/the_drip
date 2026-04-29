/**
 * Google Places API (New) — Ingestion Pipeline
 *
 * This module defines types matching the Places API v1 response format,
 * a mapper that converts Place Details into PlaceCandidate objects,
 * and helpers for the Text Search + Nearby Search flows.
 *
 * COMPLIANCE NOTE:
 * Google's Terms of Service prohibit scraping or exporting Maps content
 * for use outside Google services. This pipeline uses only the official
 * Places API (places.googleapis.com) with proper API key authentication.
 * Place IDs are the canonical deduplication key and must be stored —
 * do not cache raw Places data beyond the permitted 30-day window.
 *
 * TODO: Replace mock functions with real API calls when deploying.
 * API docs: https://developers.google.com/maps/documentation/places/web-service/op-overview
 */

import { PlaceCandidate } from "@/types";
import { slugify } from "@/lib/utils";

// ─── Places API v1 Types ──────────────────────────────────────────────────────
// Shaped from https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places

export interface PlacesApiLocation {
  latitude: number;
  longitude: number;
}

export interface PlacesApiAddressComponent {
  longText: string;
  shortText: string;
  types: string[];
  languageCode: string;
}

export interface PlacesApiPhoto {
  name: string; // resource name, e.g. "places/{place_id}/photos/{photo_reference}"
  widthPx: number;
  heightPx: number;
  authorAttributions: Array<{ displayName: string; uri: string; photoUri: string }>;
}

export interface PlacesApiReview {
  name: string;
  relativePublishTimeDescription: string;
  rating: number;
  text: { text: string; languageCode: string };
  authorAttribution: { displayName: string; uri: string; photoUri: string };
  publishTime: string;
}

export interface PlacesApiOpeningHours {
  openNow: boolean;
  periods: Array<{
    open: { day: number; hour: number; minute: number };
    close: { day: number; hour: number; minute: number };
  }>;
  weekdayDescriptions: string[];
}

/** Full Place Details response from Places API v1 */
export interface PlacesApiPlace {
  name: string; // resource name: "places/{place_id}"
  id: string;   // the place_id
  displayName: { text: string; languageCode: string };
  formattedAddress: string;
  addressComponents: PlacesApiAddressComponent[];
  location: PlacesApiLocation;
  rating: number | null;
  userRatingCount: number | null;
  priceLevel: string | null; // "PRICE_LEVEL_FREE" | "PRICE_LEVEL_INEXPENSIVE" | etc.
  types: string[];
  primaryType: string | null;
  editorialSummary: { text: string; languageCode: string } | null;
  websiteUri: string | null;
  nationalPhoneNumber: string | null;
  regularOpeningHours: PlacesApiOpeningHours | null;
  photos: PlacesApiPhoto[];
  reviews: PlacesApiReview[];
  servesCoffee: boolean | null;
  allowsDogs: boolean | null;
  goodForGroups: boolean | null;
  goodForWatchingSports: boolean | null;
  liveMusic: boolean | null;
  menuForChildren: boolean | null;
  outdoorSeating: boolean | null;
  restroom: boolean | null;
  wifi: boolean | null;
}

/** Text Search request body */
export interface PlacesTextSearchRequest {
  textQuery: string;
  /** ISO 3166-1 alpha-2 */
  languageCode?: string;
  /** e.g. "us" */
  regionCode?: string;
  /** Restrict to a city bounding box — recommended for city-scale ingestion */
  locationBias?: {
    circle?: {
      center: PlacesApiLocation;
      radius: number; // meters
    };
    rectangle?: {
      low: PlacesApiLocation;
      high: PlacesApiLocation;
    };
  };
  maxResultCount?: number; // 1–20
  rankPreference?: "RELEVANCE" | "DISTANCE";
  includedType?: string; // e.g. "cafe"
}

/** Nearby Search request body */
export interface PlacesNearbySearchRequest {
  locationRestriction: {
    circle: {
      center: PlacesApiLocation;
      radius: number;
    };
  };
  includedTypes?: string[];
  maxResultCount?: number;
  rankPreference?: "POPULARITY" | "DISTANCE";
  languageCode?: string;
  regionCode?: string;
}

// ─── Neighborhood extraction ──────────────────────────────────────────────────

function extractNeighborhood(components: PlacesApiAddressComponent[]): string | null {
  // Try sublocality_level_1 first (NYC neighborhoods), then neighborhood, then sublocality
  const priority = ["sublocality_level_1", "neighborhood", "sublocality", "political"];
  for (const type of priority) {
    const match = components.find((c) => c.types.includes(type));
    if (match) return match.longText;
  }
  return null;
}

function extractCity(components: PlacesApiAddressComponent[]): string {
  const locality = components.find((c) => c.types.includes("locality"));
  return locality?.longText ?? "Unknown";
}

// ─── Mapper: PlacesApiPlace → PlaceCandidate ──────────────────────────────────

/**
 * Convert a raw Google Places API response into a PlaceCandidate.
 * This is the primary transformation step before human moderation.
 *
 * What we do here:
 * - Extract structured fields from the Places API response
 * - Derive soft signals (specialty focus likelihood, brew method hints)
 * - Flag completeness so the moderation queue can prioritize
 * - Never infer scores — scoring happens after moderation
 */
export function mapPlaceToCandidate(
  place: PlacesApiPlace,
  opts: {
    importMethod: PlaceCandidate["importMethod"];
    sourceQuery: string | null;
  }
): PlaceCandidate {
  const neighborhood = extractNeighborhood(place.addressComponents);
  const city = extractCity(place.addressComponents);
  const now = new Date().toISOString();

  return {
    id: `candidate-${place.id}`,
    googlePlaceId: place.id,
    name: place.displayName.text,
    address: place.formattedAddress,
    city,
    neighborhood,
    latitude: place.location.latitude,
    longitude: place.location.longitude,
    googleRating: place.rating,
    googleReviewCount: place.userRatingCount,
    openNow: place.regularOpeningHours?.openNow ?? null,
    websiteUri: place.websiteUri,
    phoneNumber: place.nationalPhoneNumber,
    placeTypes: place.types,
    editorialSummary: place.editorialSummary?.text ?? null,
    // Store photo resource names — resolve to URLs via Photos API at display time
    photoReferences: (place.photos ?? []).slice(0, 6).map((p) => p.name),
    importMethod: opts.importMethod,
    sourceQuery: opts.sourceQuery,
    importedAt: now,
    enrichmentStatus: "mapped",
    moderationStatus: "pending",
    moderationNotes: "",
    reviewedBy: null,
    reviewedAt: null,
    curatorOverrides: {
      // Derive a slug from the name + city as a starting point
      slug: slugify(`${place.displayName.text} ${neighborhood ?? city}`),
    },
  };
}

// ─── Completeness check ────────────────────────────────────────────────────────

/** Fields a candidate needs before it can be approved as a CoffeeShop. */
export interface CandidateReadiness {
  isReady: boolean;
  missingFields: string[];
  warnings: string[];
}

export function checkCandidateReadiness(candidate: PlaceCandidate): CandidateReadiness {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!candidate.curatorOverrides.description && !candidate.editorialSummary) {
    missing.push("Editorial description (required for shop page)");
  }
  if (!candidate.curatorOverrides.heroImage && !candidate.photoReferences.length) {
    missing.push("Hero image");
  }
  if (candidate.curatorOverrides.hasEspresso === undefined) {
    missing.push("Brew attributes (hasEspresso, hasPourOver)");
  }
  if (!candidate.curatorOverrides.tags || candidate.curatorOverrides.tags.length === 0) {
    missing.push("At least one tag");
  }
  if (!candidate.neighborhood && !candidate.curatorOverrides.neighborhood) {
    warnings.push("Neighborhood not resolved — check address components");
  }
  if (candidate.curatorOverrides.specialtyFocusLevel === undefined) {
    warnings.push("Specialty focus level not set — defaults to 3");
  }
  if (candidate.googleRating !== null && candidate.googleRating < 3.5) {
    warnings.push(`Low Google rating (${candidate.googleRating}) — review carefully`);
  }

  return {
    isReady: missing.length === 0,
    missingFields: missing,
    warnings,
  };
}

// ─── Deduplication ────────────────────────────────────────────────────────────

/**
 * Check whether a Place ID already exists in the approved shop pool.
 * Call this before inserting a candidate to prevent duplicates.
 *
 * TODO: In production, this checks the database index on googlePlaceId.
 */
export function isAlreadyIngested(
  googlePlaceId: string,
  existingPlaceIds: (string | null)[]
): boolean {
  return existingPlaceIds.includes(googlePlaceId);
}

// ─── City ingestion config ─────────────────────────────────────────────────────

/**
 * Search queries used per city.
 * These are the Text Search queries sent to the Places API.
 * Designed to surface specialty coffee rather than chain cafés.
 *
 * TODO: Add per-city Nearby Search center coords + radius for grid-based ingestion.
 */
export const CITY_INGESTION_CONFIG: Record<
  string,
  {
    displayName: string;
    textQueries: string[];
    nearbyCenters: Array<{ label: string; lat: number; lng: number; radiusMeters: number }>;
  }
> = {
  nyc: {
    displayName: "New York City",
    textQueries: [
      "specialty coffee shop Manhattan",
      "specialty coffee Brooklyn",
      "third wave coffee New York City",
      "pour over coffee New York",
      "single origin espresso New York",
    ],
    nearbyCenters: [
      { label: "Lower Manhattan", lat: 40.7128, lng: -74.006, radiusMeters: 2500 },
      { label: "Midtown", lat: 40.754, lng: -73.984, radiusMeters: 2000 },
      { label: "Brooklyn", lat: 40.692, lng: -73.99, radiusMeters: 3000 },
      { label: "Williamsburg", lat: 40.714, lng: -73.957, radiusMeters: 1500 },
      { label: "Astoria / LIC", lat: 40.762, lng: -73.93, radiusMeters: 2500 },
    ],
  },
  la: {
    displayName: "Los Angeles",
    textQueries: [
      "specialty coffee Los Angeles",
      "third wave coffee LA",
      "pour over coffee Silver Lake",
      "specialty espresso bar Los Angeles",
    ],
    nearbyCenters: [
      { label: "Silver Lake / Echo Park", lat: 34.087, lng: -118.271, radiusMeters: 2500 },
      { label: "Arts District", lat: 34.034, lng: -118.232, radiusMeters: 1500 },
      { label: "Venice / Abbot Kinney", lat: 33.993, lng: -118.464, radiusMeters: 2000 },
      { label: "Los Feliz", lat: 34.107, lng: -118.293, radiusMeters: 1500 },
    ],
  },
};

// ─── Mock ingestion (dev/demo only) ──────────────────────────────────────────

/**
 * Simulates what the Places API would return for a Text Search query.
 * In production, replace with a real fetch to:
 *   POST https://places.googleapis.com/v1/places:searchText
 *   Headers: X-Goog-Api-Key, X-Goog-FieldMask
 *
 * Required field mask for our use case:
 *   places.id,places.displayName,places.formattedAddress,places.addressComponents,
 *   places.location,places.rating,places.userRatingCount,places.types,places.primaryType,
 *   places.editorialSummary,places.websiteUri,places.nationalPhoneNumber,
 *   places.regularOpeningHours,places.photos,places.servesCoffee,places.wifi,
 *   places.outdoorSeating,places.goodForGroups
 *
 * TODO: Implement with GOOGLE_PLACES_API_KEY environment variable.
 */
export async function mockTextSearch(
  _query: string,
  _cityKey: string
): Promise<PlacesApiPlace[]> {
  // Returns empty in mock — real implementation hits the API
  return [];
}

/**
 * Simulate Place Details lookup for a known place_id.
 * In production:
 *   GET https://places.googleapis.com/v1/places/{place_id}
 *   Headers: X-Goog-Api-Key, X-Goog-FieldMask
 *
 * TODO: Implement with GOOGLE_PLACES_API_KEY environment variable.
 */
export async function mockGetPlaceDetails(
  _placeId: string
): Promise<PlacesApiPlace | null> {
  return null;
}
