import { CriteriaScores } from "@/types";
import { CRITERIA_LABELS, getNormalizedWeights } from "@/lib/scoring";
import { cn } from "@/lib/utils";

interface CriteriaBreakdownProps {
  criteria: CriteriaScores;
  showWeights?: boolean;
  className?: string;
}

export function CriteriaBreakdown({
  criteria,
  showWeights = false,
  className,
}: CriteriaBreakdownProps) {
  const weights = getNormalizedWeights(criteria);
  const keys = (Object.keys(criteria) as Array<keyof CriteriaScores>).filter(
    (k) => criteria[k] !== null
  );

  return (
    <div className={cn("space-y-2.5", className)}>
      {keys.map((key) => {
        const score = criteria[key] as number;
        const pct = (score / 5) * 100;
        const weight = Math.round(weights[key] * 100);

        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-stone-700">
                  {CRITERIA_LABELS[key]}
                </span>
                {showWeights && (
                  <span className="text-[10px] text-stone-400">{weight}%</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={cn(
                      "text-[12px]",
                      star <= score ? "text-emerald-500" : "text-stone-200"
                    )}
                  >
                    ●
                  </span>
                ))}
                <span className="ml-1 text-xs font-semibold text-stone-600 tabular-nums">
                  {score}/5
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
