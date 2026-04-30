"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#faf9f7]">
      <span className="text-5xl mb-4">☕</span>
      <h1 className="text-2xl font-bold text-stone-900 mb-2">
        Something brewed wrong
      </h1>
      <p className="text-stone-500 mb-6 max-w-sm">
        We hit an unexpected error. Try again, or head back home.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => unstable_retry()}
          className="bg-stone-900 text-white rounded-2xl px-5 py-3 text-sm font-semibold tap-scale"
        >
          Try again
        </button>
        <Link
          href="/home"
          className="bg-stone-100 text-stone-700 rounded-2xl px-5 py-3 text-sm font-semibold tap-scale"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
