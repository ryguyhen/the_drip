import { CITY_INGESTION_CONFIG } from "@/lib/places-ingestion";

export default function IngestionPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Ingestion pipeline</h1>
        <p className="text-sm text-stone-500">
          Configure Google Places API searches for each city. Each query generates candidates
          routed to the moderation queue.
        </p>
      </div>

      {/* Environment */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
        <p className="text-xs font-semibold text-amber-700 mb-1">Environment setup required</p>
        <p className="text-xs text-amber-600 leading-relaxed mb-2">
          Set <code className="bg-amber-100 px-1 rounded">GOOGLE_PLACES_API_KEY</code> in your{" "}
          <code className="bg-amber-100 px-1 rounded">.env.local</code> to activate live ingestion.
          The key requires the <strong>Places API (New)</strong> enabled in Google Cloud Console.
        </p>
        <div className="text-[11px] text-amber-500 space-y-0.5">
          <p>• Enable: Places API (New) — <em>not</em> the legacy Places API</p>
          <p>• Restrict key: HTTP referrers → your domain only</p>
          <p>• Billing: ~$0.017 per Text Search call, ~$0.020 per Place Details</p>
        </div>
      </div>

      {/* City configs */}
      {Object.entries(CITY_INGESTION_CONFIG).map(([key, config]) => (
        <div key={key} className="mb-6 bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-stone-900">{config.displayName}</h2>
              <p className="text-xs text-stone-400">City key: {key}</p>
            </div>
            <button
              disabled
              className="px-4 py-2 rounded-xl bg-stone-100 text-stone-400 text-xs font-semibold cursor-not-allowed"
            >
              Run ingestion (needs API key)
            </button>
          </div>

          <div className="p-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Text queries */}
            <div>
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-3">
                Text Search queries ({config.textQueries.length})
              </p>
              <div className="space-y-1.5">
                {config.textQueries.map((q) => (
                  <div
                    key={q}
                    className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-xl"
                  >
                    <span className="text-stone-300 text-xs">🔍</span>
                    <span className="text-xs text-stone-600 font-mono">{q}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby zones */}
            <div>
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-3">
                Nearby Search zones ({config.nearbyCenters.length})
              </p>
              <div className="space-y-1.5">
                {config.nearbyCenters.map((zone) => (
                  <div
                    key={zone.label}
                    className="px-3 py-2 bg-stone-50 rounded-xl"
                  >
                    <p className="text-xs font-medium text-stone-700">{zone.label}</p>
                    <p className="text-[10px] text-stone-400 font-mono">
                      {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)} · r={zone.radiusMeters}m
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* API field mask reference */}
      <div className="bg-stone-900 rounded-2xl p-5 text-white">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
          Required field mask (X-Goog-FieldMask header)
        </p>
        <pre className="text-xs text-stone-300 leading-relaxed whitespace-pre-wrap font-mono">
{`places.id,
places.displayName,
places.formattedAddress,
places.addressComponents,
places.location,
places.rating,
places.userRatingCount,
places.types,
places.primaryType,
places.editorialSummary,
places.websiteUri,
places.nationalPhoneNumber,
places.regularOpeningHours,
places.photos,
places.servesCoffee,
places.wifi,
places.outdoorSeating,
places.goodForGroups`}
        </pre>
        <p className="text-[11px] text-stone-500 mt-3">
          Only request fields you actually use. Google bills per field mask group,
          so a tight mask reduces cost significantly.
        </p>
      </div>

      {/* TODOs */}
      <div className="mt-6 p-5 bg-white rounded-2xl border border-stone-100">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
          TODO — before live ingestion
        </p>
        <ol className="space-y-2">
          {[
            "Add GOOGLE_PLACES_API_KEY to Vercel environment variables",
            "Implement mockTextSearch() in lib/places-ingestion.ts with real fetch to places.googleapis.com/v1/places:searchText",
            "Implement mockGetPlaceDetails() for Place Details enrichment step",
            "Add /api/admin/ingestion/run route that calls the pipeline and writes candidates to DB",
            "Add /api/admin/candidates/[id]/approve and /reject routes that promote/remove from queue",
            "Implement photo URL resolution: POST /v1/places/{place_id}/photos/{photo_reference}:getMedia",
            "Add 30-day cache TTL on raw place data per Google ToS",
            "Set up deduplication index on googlePlaceId in the database",
            "Add city expansion: Portland, Chicago, London as next targets after NYC + LA",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-stone-600">
              <span className="text-stone-300 flex-shrink-0 font-mono">{i + 1}.</span>
              {item}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
