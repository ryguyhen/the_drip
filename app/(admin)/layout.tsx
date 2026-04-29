import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Admin top bar */}
      <header className="sticky top-0 z-50 bg-stone-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="font-bold text-sm">
            The Drip <span className="text-stone-400 font-normal">/ Admin</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/candidates" className="text-xs text-stone-400 hover:text-white transition-colors">
            Candidates
          </Link>
          <Link href="/admin/ingestion" className="text-xs text-stone-400 hover:text-white transition-colors">
            Ingestion
          </Link>
          <Link href="/home" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
            ← Back to app
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
