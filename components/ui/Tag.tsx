import { cn } from "@/lib/utils";

interface TagProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}

export function Tag({ children, className, size = "sm" }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        "border border-stone-200/70 bg-stone-50 text-stone-500",
        "tracking-tight",
        size === "sm" ? "text-[10px] px-2 py-px" : "text-[11px] px-2.5 py-0.5",
        className
      )}
    >
      {children}
    </span>
  );
}
