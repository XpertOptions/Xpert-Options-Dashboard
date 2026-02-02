import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  trend?: "profit" | "loss" | "neutral";
  icon?: ReactNode;
  className?: string;
  large?: boolean;
}

export const MetricCard = ({
  title,
  value,
  subValue,
  trend = "neutral",
  icon,
  className,
  large = false,
}: MetricCardProps) => {
  const getTrendIcon = () => {
    switch (trend) {
      case "profit":
        return <TrendingUp className="h-4 w-4 text-profit" />;
      case "loss":
        return <TrendingDown className="h-4 w-4 text-loss" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getValueClass = () => {
    switch (trend) {
      case "profit":
        return "profit-value";
      case "loss":
        return "loss-value";
      default:
        return "text-foreground";
    }
  };

  return (
    <div className={cn("metric-card group", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            {title}
          </p>
          <p
            className={cn(
              "font-mono font-semibold transition-all",
              large ? "text-2xl md:text-3xl" : "text-xl md:text-2xl",
              getValueClass()
            )}
          >
            {value}
          </p>
          {subValue && (
            <p
              className={cn(
                "font-mono text-sm mt-1",
                trend === "profit"
                  ? "text-profit/80"
                  : trend === "loss"
                  ? "text-loss/80"
                  : "text-muted-foreground"
              )}
            >
              {subValue}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {icon && (
            <div className="p-2 rounded-lg bg-muted/50">{icon}</div>
          )}
          {getTrendIcon()}
        </div>
      </div>
    </div>
  );
};