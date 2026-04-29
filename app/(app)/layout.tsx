import { BottomNav } from "@/components/nav/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <main className="pb-24 max-w-lg mx-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
