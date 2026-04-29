"use client";

import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  className?: string;
  variant?: "community" | "pro";
}

export function ScoreRing({
  score,
  size = 80,
  strokeWidth = 6,
  label,
  sublabel,
  className,
  variant = "community",
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const trackColor = variant === "community" ? "#e8e4de" : "#e8e4de";
  const progressColor = variant === "community" ? "#b5622a" : "#2d6a4f";

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <circle
            className="progress"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={
              {
                "--target-offset": offset,
                transition: "stroke-dashoffset 1s ease-out",
              } as React.CSSProperties
            }
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "font-bold tabular-nums",
              size >= 80 ? "text-xl" : "text-sm",
              variant === "community" ? "text-[#b5622a]" : "text-[#2d6a4f]"
            )}
          >
            {score}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-xs font-medium text-stone-600 text-center leading-tight">
          {label}
        </span>
      )}
      {sublabel && (
        <span className="text-[10px] text-stone-400 text-center">{sublabel}</span>
      )}
    </div>
  );
}
