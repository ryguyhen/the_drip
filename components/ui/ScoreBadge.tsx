import { cn, formatScore } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number | null;
  type: "community" | "pro";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ScoreBadge({
  score,
  type,
  size = "md",
  showLabel = false,
  className,
}: ScoreBadgeProps) {
  if (score === null) return null;

  const isCommunity = type === "community";

  // sm: tight pill, no dot — score speaks for itself
  // md/lg: dot indicator for type differentiation
  const showDot = size !== "sm";

  const sizeClasses = {
    sm: "text-[11px] px-1.5 py-px font-semibold tracking-tight",
    md: "text-xs px-2 py-0.5 font-semibold",
    lg: "text-sm px-2.5 py-1 font-semibold",
  };

  const colorClasses = isCommunity
    ? "bg-amber-50 text-amber-800 border border-amber-200/80"
    : "bg-emerald-50 text-emerald-800 border border-emerald-200/80";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "rounded-full tabular-nums inline-flex items-center gap-1 leading-none",
          sizeClasses[size],
          colorClasses
        )}
      >
        {showDot && (
          <span className={cn(
            "rounded-full flex-shrink-0",
            size === "lg" ? "w-2 h-2" : "w-1.5 h-1.5",
            isCommunity ? "bg-amber-500" : "bg-emerald-500"
          )} />
        )}
        {formatScore(score)}
      </span>
      {showLabel && (
        <span className="text-xs text-stone-400 font-medium">
          {isCommunity ? "Community" : "Pro Score"}
        </span>
      )}
    </div>
  );
}
