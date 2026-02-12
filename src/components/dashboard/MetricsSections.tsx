import { MetricCard } from "./MetricCard";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Target,
  AlertTriangle,
  Activity,
  Award,
  Flame,
} from "lucide-react";
import {
  formatCurrency,
  formatPercent,
  formatRatio,
  formatDays,
  formatStreak,
} from "@/lib/formatters";
import { PnLMetrics } from "@/hooks/usePnLCalculations";

interface MetricsSectionsProps {
  metrics: PnLMetrics;
  initialCapital: number;
}

export const MetricsSections = ({ metrics, initialCapital }: MetricsSectionsProps) => {
  const getTrend = (value: number) => {
    if (value > 0) return "profit" as const;
    if (value < 0) return "loss" as const;
    return "neutral" as const;
  };

  return (
    <div className="space-y-8">
      {/* Summary Section */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Initial Capital"
            value={formatCurrency(initialCapital)}
            trend="neutral"
            large
          />
          <MetricCard
            title="Overall Profit"
            value={formatCurrency(metrics.overallProfit, true)}
            subValue={formatPercent(metrics.overallProfitPercent, true)}
            trend={getTrend(metrics.overallProfit)}
            large
          />
          <MetricCard
            title="Current Month"
            value={formatCurrency(metrics.currentMonthProfit, true)}
            subValue={formatPercent(metrics.currentMonthProfitPercent, true)}
            trend={getTrend(metrics.currentMonthProfit)}
          />
          <MetricCard
            title="Today's P&L"
            value={formatCurrency(metrics.todayProfit, true)}
            subValue={formatPercent(metrics.todayProfitPercent, true)}
            trend={getTrend(metrics.todayProfit)}
          />
          <MetricCard
            title="Win Rate"
            value={formatPercent(metrics.winRate)}
            subValue={`${metrics.totalWinDays}W / ${metrics.totalLossDays}L`}
            trend={metrics.winRate >= 50 ? "profit" : "loss"}
          />
        </div>
      </section>

      {/* Performance Section */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Performance
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Avg Daily Profit"
            value={formatCurrency(metrics.avgDailyProfit, true)}
            subValue={formatPercent(metrics.avgDailyProfitPercent, true)}
            trend={getTrend(metrics.avgDailyProfit)}
          />
          <MetricCard
            title="Average Win"
            value={formatCurrency(metrics.avgWin)}
            subValue={formatPercent(metrics.avgWinPercent)}
            trend="profit"
          />
          <MetricCard
            title="Average Loss"
            value={formatCurrency(metrics.avgLoss)}
            subValue={formatPercent(metrics.avgLossPercent)}
            trend="loss"
          />
          <MetricCard
            title="Risk : Reward"
            value={formatRatio(metrics.riskRewardRatio)}
            trend={metrics.riskRewardRatio >= 1 ? "profit" : "loss"}
          />
          <MetricCard
            title="Expectancy"
            value={formatCurrency(metrics.expectancy, true)}
            subValue={formatPercent(metrics.expectancyPercent, true)}
            trend={getTrend(metrics.expectancy)}
          />
        </div>
      </section>

      {/* Risk Section */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Risk Analytics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Max Drawdown"
            value={formatCurrency(metrics.maxDrawdown)}
            subValue={formatPercent(metrics.maxDrawdownPercent)}
            trend="loss"
          />
          <MetricCard
            title="Current Drawdown"
            value={formatCurrency(metrics.currentDrawdown)}
            subValue={formatPercent(metrics.currentDrawdownPercent)}
            trend={metrics.currentDrawdown > 0 ? "loss" : "neutral"}
          />
          <MetricCard
            title="Max DD Days"
            value={metrics.maxDaysInDrawdown.toString()}
            subValue="consecutive days"
            trend={metrics.maxDaysInDrawdown > 10 ? "loss" : "neutral"}
          />
          <MetricCard
            title="Recovery Factor"
            value={formatRatio(metrics.recoveryFactor)}
            trend={metrics.recoveryFactor >= 1 ? "profit" : "neutral"}
          />
          <MetricCard
            title="Calmar Ratio"
            value={formatRatio(metrics.calmarRatio)}
            trend={metrics.calmarRatio >= 1 ? "profit" : "neutral"}
          />
        </div>
      </section>

      {/* Periodic Stats Section */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Periodic Stats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Max Profit (Day)"
            value={formatCurrency(metrics.maxProfitDay, true)}
            trend="profit"
          />
          <MetricCard
            title="Max Loss (Day)"
            value={formatCurrency(metrics.maxLossDay, true)}
            trend="loss"
          />
          <MetricCard
            title="Max Profit (Week)"
            value={formatCurrency(metrics.maxProfitWeek, true)}
            trend="profit"
          />
          <MetricCard
            title="Max Loss (Week)"
            value={formatCurrency(metrics.maxLossWeek, true)}
            trend="loss"
          />
          <MetricCard
            title="Max Profit (Month)"
            value={formatCurrency(metrics.maxProfitMonth, true)}
            trend="profit"
          />
          <MetricCard
            title="Max Loss (Month)"
            value={formatCurrency(metrics.maxLossMonth, true)}
            trend="loss"
          />
          <MetricCard
            title="Avg Weekly Profit"
            value={formatCurrency(metrics.avgProfitWeek, true)}
            trend={getTrend(metrics.avgProfitWeek)}
          />
          <MetricCard
            title="Avg Monthly Profit"
            value={formatCurrency(metrics.avgProfitMonth, true)}
            trend={getTrend(metrics.avgProfitMonth)}
          />
        </div>
      </section>
    </div>
  );
};