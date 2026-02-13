import { useAccountSettings, useDailyPnL } from "@/hooks/usePnLData";
import { usePnLCalculations } from "@/hooks/usePnLCalculations";
import { AddPnLDialog } from "./AddPnLDialog";
import { SettingsDialog } from "./SettingsDialog";
import { MetricsSections } from "./MetricsSections";
import { EquityChart } from "./EquityChart";
import { DrawdownChart } from "./DrawdownChart";
import { DailyPnLChart } from "./DailyPnLChart";
import { LoginDialog } from "@/components/LoginDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/formatters";
import { PnLHeatmap } from "./PnLHeatmap";
import { PnLCurve } from "./PnLCurve";
import { MonthlyPnLReport } from "./MonthlyPnLReport";
import { BarChart3, Loader2, LogOut, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Dashboard = () => {
  const { data: settings, isLoading: settingsLoading } = useAccountSettings();
  const { data: dailyPnL, isLoading: pnlLoading } = useDailyPnL();
  const { isAdmin, logout } = useAuth();

  const initialCapital = settings?.initial_capital || 100000;
  const metrics = usePnLCalculations(dailyPnL, initialCapital);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  if (settingsLoading || pnlLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Xpert Options Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Capital: {formatCurrency(initialCapital)} • {metrics.totalActiveDays} trading days
              {isAdmin && <span className="ml-2 px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">Admin</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!isAdmin ? (
            <LoginDialog />
          ) : (
            <>
              {settings && (
                <SettingsDialog
                  currentId={settings.id}
                  currentCapital={settings.initial_capital}
                />
              )}
              <AddPnLDialog />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Metrics */}
      <MetricsSections metrics={metrics} initialCapital={initialCapital} />

      {/* Charts */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Charts
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EquityChart
            data={metrics.equityCurve}
            initialCapital={initialCapital}
          />
          <DrawdownChart data={metrics.drawdownCurve} />
        </div>
        <div className="mt-6">
          <PnLHeatmap data={dailyPnL?.map(d => ({ date: d.trade_date, pnl: d.pnl })) || []} />
        </div>
        <div className="mt-6">
          <MonthlyPnLReport data={dailyPnL?.filter(d => d.pnl !== 0).map(d => ({ date: d.trade_date, pnl: d.pnl })) || []} />
        </div>
        <div className="mt-6">
          <PnLCurve
            data={dailyPnL?.filter(d => d.pnl !== 0).map(d => ({ date: d.trade_date, pnl: d.pnl })) || []}
            initialCapital={initialCapital}
          />
        </div>
        <div className="mt-6">
          <DailyPnLChart
            data={metrics.equityCurve}
            initialCapital={initialCapital}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          Xpert Options • Professional PnL Tracking & Risk Analytics
        </p>
      </footer>
    </div>
  );
};