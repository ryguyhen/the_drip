import { MapPin, ExternalLink } from "lucide-react";
import type { CoffeeShop } from "@/types";

interface Props {
  shop: Pick<CoffeeShop, "name" | "address" | "latitude" | "longitude">;
}

export function ShopLocationMap({ shop }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { name, address, latitude, longitude } = shop;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodeURIComponent(name)}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${encodeURIComponent(name)}`;

  const embedSrc = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(`${name}, ${address}`)}&zoom=15`
    : null;

  return (
    <div className="py-5 border-b border-stone-100">
      <h2 className="font-bold text-stone-900 text-sm mb-3">Location</h2>

      <div className="flex items-start gap-2 mb-3">
        <MapPin size={14} className="text-stone-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-stone-600 leading-relaxed">{address}</p>
      </div>

      {embedSrc ? (
        <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-stone-100 bg-stone-100 mb-3">
          <iframe
            title={`Map of ${name}`}
            src={embedSrc}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 w-full h-full"
          />
        </div>
      ) : (
        <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-stone-100 bg-stone-50 mb-3 flex flex-col items-center justify-center text-center px-6">
          <MapPin size={20} className="text-stone-300 mb-2" />
          <p className="text-xs text-stone-400 leading-relaxed max-w-[240px]">
            Map preview disabled. Set <code className="bg-stone-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to enable.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-stone-900 text-white rounded-2xl py-3 text-sm font-semibold tap-scale"
        >
          Get directions
          <ExternalLink size={14} />
        </a>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-stone-100 text-stone-700 rounded-2xl px-4 py-3 text-sm font-semibold tap-scale"
          aria-label={`Open ${name} in Google Maps`}
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
