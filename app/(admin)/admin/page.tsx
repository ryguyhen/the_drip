import Link from "next/link";
import { CANDIDATE_STATS } from "@/data/candidates";
import { SHOPS } from "@/data/shops";
import { CITY_INGESTION_CONFIG } from "@/lib/places-ingestion";

const liveShops = SHOPS.filter((s) => s.moderationStatus === "approved").length;

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Dashboard</h1>
        <p className="text-sm text-stone-500">
          Internal moderation and ingestion tools for The Drip.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
        {[
          { label: "Live shops", value: liveShops, color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
          { label: "Pending review", value: CANDIDATE_STATS.pending, color: "bg-amber-50 text-amber-700 border-amber-100" },
          { label: "Needs review", value: CANDIDATE_STATS.needsReview, color: "bg-orange-50 text-orange-700 border-orange-100" },
          { label: "Rejected", value: CANDIDATE_STATS.rejected, color: "bg-red-50 text-red-600 border-red-100" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`p-4 rounded-2xl border ${color}`}>
            <p className="text-3xl font-bold tabular-nums">{value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-70">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-3 mb-8 sm:grid-cols-2">
        <Link
          href="/admin/candidates"
          className="flex items-center justify-between p-5 bg-white rounded-2xl border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all"
        >
          <div>
            <h3 className="font-semibold text-stone-900 mb-0.5">Moderation queue</h3>
            <p className="text-xs text-stone-400">
              {CANDIDATE_STATS.pending + CANDIDATE_STATS.needsReview} candidates need attention
            </p>
          </div>
          <span className="text-2xl">📋</span>
        </Link>

        <Link
          href="/admin/ingestion"
          className="flex items-center justify-between p-5 bg-white rounded-2xl border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all"
        >
          <div>
            <h3 className="font-semibold text-stone-900 mb-0.5">Ingestion pipeline</h3>
            <p className="text-xs text-stone-400">
              Configure and run Google Places searches
            </p>
          </div>
          <span className="text-2xl">🗺️</span>
        </Link>
      </div>

      {/* City coverage */}
      <div className="mb-8">
        <h2 className="font-bold text-stone-900 mb-3">City coverage</h2>
        <div className="space-y-2">
          {Object.entries(CITY_INGESTION_CONFIG).map(([key, config]) => {
            const cityShops = SHOPS.filter(
              (s) => s.moderationStatus === "approved" && s.city === config.displayName
            ).length;
            return (
              <div key={key} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-stone-100">
                <div>
                  <p className="font-medium text-stone-900 text-sm">{config.displayName}</p>
                  <p className="text-xs text-stone-400">
                    {config.textQueries.length} text queries · {config.nearbyCenters.length} nearby zones
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-stone-900">{cityShops}</p>
                  <p className="text-xs text-stone-400">live shops</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pipeline architecture */}
      <div>
        <h2 className="font-bold text-stone-900 mb-3">Ingestion architecture</h2>
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <ol className="space-y-4">
            {[
              {
                step: "1",
                label: "Text Search or Nearby Search",
                desc: "POST /v1/places:searchText or :searchNearby with city query. Returns up to 20 candidates per request.",
                status: "todo",
              },
              {
                step: "2",
                label: "Deduplication check",
                desc: "Filter out any google_place_id already present in the approved shop pool or rejected candidates.",
                status: "done",
              },
              {
                step: "3",
                label: "Place Details enrichment",
                desc: "GET /v1/places/{place_id} with full field mask to retrieve photos, opening hours, editorial summary, and attributes.",
                status: "todo",
              },
              {
                step: "4",
                label: "Map to PlaceCandidate",
                desc: "lib/places-ingestion.ts → mapPlaceToCandidate(). Derives neighborhood, extracts city, stages for moderation.",
                status: "done",
              },
              {
                step: "5",
                label: "Moderation queue",
                desc: "Curator reviews: fills in description, verifies brew attributes, sets specialty focus level, approves or rejects.",
                status: "done",
              },
              {
                step: "6",
                label: "Promote to live shop",
                desc: "On approval: merge PlaceCandidate + curatorOverrides → CoffeeShop. Set moderationStatus: approved. Assign initial Elo 1500.",
                status: "todo",
              },
            ].map(({ step, label, desc, status }) => (
              <li key={step} className="flex gap-4">
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${
                  status === "done" ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"
                }`}>
                  {status === "done" ? "✓" : step}
                </div>
                <div>
                  <p className="font-semibold text-stone-800 text-sm">{label}</p>
                  <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-5 pt-4 border-t border-stone-100">
            <p className="text-xs text-stone-400 leading-relaxed">
              <strong className="text-stone-600">Compliance:</strong> All ingestion uses the official Google Places API (places.googleapis.com).
              Raw place data is not cached beyond the 30-day permitted window.
              Place IDs are stored as the canonical deduplication key.
              No scraping of google.com/maps or display of raw Maps content outside Google-permitted surfaces.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
