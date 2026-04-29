import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#faf9f7]">
      <span className="text-5xl mb-5">☕</span>
      <h2 className="text-2xl font-bold text-stone-900 mb-2">Page not found</h2>
      <p className="text-stone-400 mb-6">
        This page doesn&apos;t exist — but great coffee does.
      </p>
      <Link
        href="/home"
        className="bg-stone-900 text-white rounded-2xl px-6 py-3 font-semibold"
      >
        Back to home
      </Link>
    </div>
  );
}
