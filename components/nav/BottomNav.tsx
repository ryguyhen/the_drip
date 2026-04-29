"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, GitCompareArrows, Search, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home",    label: "Home",    icon: Home },
  { href: "/rank",    label: "Rank",    icon: GitCompareArrows },
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/saved",   label: "Saved",   icon: Bookmark },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-stone-100/80 px-2 pb-safe"
         style={{ boxShadow: "0 -1px 0 rgba(28,25,23,0.04), 0 -4px 16px rgba(28,25,23,0.04)" }}>
      <div className="max-w-lg mx-auto flex items-center justify-around py-1.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl",
                "transition-all duration-150",
                active
                  ? "text-amber-700 bg-amber-50"
                  : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"
              )}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.25 : 1.75}
              />
              <span className={cn(
                "text-[10px] tracking-tight",
                active ? "font-semibold" : "font-medium"
              )}>
                {label}
              </span>
              {active && (
                <span className="absolute -top-px left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-amber-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
