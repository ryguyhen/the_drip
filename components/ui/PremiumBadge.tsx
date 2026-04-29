import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

export function PremiumBadge({ size = "sm", className }: PremiumBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full font-semibold tracking-tight",
        "bg-gradient-to-br from-amber-400 to-amber-600 text-white",
        "shadow-sm shadow-amber-200/50",
        size === "sm" ? "text-[9px] px-1.5 py-px" : "text-[10px] px-2 py-0.5",
        className
      )}
    >
      <span className="opacity-90">★</span>
      PRO
    </span>
  );
}
