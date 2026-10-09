/**
 * ProgressBar — a colored horizontal bar showing progress as value/max.
 * Supports multiple color variants matching the Duolingo design system.
 */

interface ProgressBarProps {
  value: number; // current value
  max: number; // maximum value
  variant?: "green" | "blue" | "yellow" | "orange" | "purple";
  color?: "green" | "blue" | "yellow" | "orange" | "purple";
  height?: "sm" | "md" | "lg" | string;
  showLabel?: boolean;
  className?: string;
}

const colorStyles = {
  green: "bg-duo-green",
  blue: "bg-duo-blue",
  yellow: "bg-duo-yellow",
  orange: "bg-duo-orange",
  purple: "bg-duo-purple",
};

const heightStyles: Record<string, string> = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
  "h-2": "h-2",
  "h-3": "h-3",
  "h-4": "h-4",
};

export function ProgressBar({
  value,
  max,
  variant,
  color = "green",
  height = "md",
  showLabel = false,
  className = "",
}: ProgressBarProps) {
  const selectedColor = variant || color;
  const heightClass = heightStyles[height] || "h-3";

  // Clamp percentage between 0 and 100
  const pct = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0));

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-xs font-bold text-[#afafaf] mb-1">
          <span>{value} XP</span>
          <span>{max} XP</span>
        </div>
      )}
      {/* Track */}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${heightClass}`}>
        {/* Fill */}
        <div
          className={`${heightClass} ${colorStyles[selectedColor]} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
