"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppError({
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
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <span className="text-4xl mb-3">☕</span>
      <h2 className="text-xl font-bold text-stone-900 mb-1.5">
        This page didn&apos;t pour right
      </h2>
      <p className="text-sm text-stone-500 mb-5 max-w-xs">
        Something went wrong loading this section.
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => unstable_retry()}
          className="bg-stone-900 text-white rounded-2xl px-4 py-2.5 text-sm font-semibold tap-scale"
        >
          Try again
        </button>
        <Link
          href="/home"
          className="bg-stone-100 text-stone-700 rounded-2xl px-4 py-2.5 text-sm font-semibold tap-scale"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
