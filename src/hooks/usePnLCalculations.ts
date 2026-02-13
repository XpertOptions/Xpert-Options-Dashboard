import { useMemo } from "react";
import { DailyPnL } from "./usePnLData";
import { startOfMonth, endOfMonth, isToday, parseISO, isWithinInterval, differenceInCalendarDays } from "date-fns";

export interface PnLMetrics {
  // Equity
  equityCurve: { date: string; equity: number; pnl: number; percentChange: number }[];
  currentEquity: number;

  // Profit Metrics
  overallProfit: number;
  overallProfitPercent: number;
  todayProfit: number;
  todayProfitPercent: number;
  currentMonthProfit: number;
  currentMonthProfitPercent: number;

  // Win/Loss Metrics
  totalWinDays: number;
  totalLossDays: number;
  totalActiveDays: number;
  winRate: number;
  currentMonthWinDays: number;

  // Average Metrics
  avgDailyProfit: number;
  avgDailyProfitPercent: number;
  avgWin: number;
  avgWinPercent: number;
  avgLoss: number;
  avgLossPercent: number;

  // Risk Metrics
  riskRewardRatio: number;
  profitFactor: number;
  expectancy: number;
  expectancyPercent: number;

  // Drawdown Metrics
  peakEquity: number;
  currentDrawdown: number;
  currentDrawdownPercent: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  currentDaysInDrawdown: number;
  maxDaysInDrawdown: number;
  drawdownCurve: { date: string; drawdown: number; drawdownPercent: number }[];

  // Advanced Ratios
  recoveryFactor: number;
  calmarRatio: number;

  // Streak Metrics
  maxWinStreak: number;
  currentStreak: number;
  maxLosingStreak: number;

  // New Metrics
  maxProfitDay: number;
  maxLossDay: number;
  maxProfitWeek: number;
  maxLossWeek: number;
  maxProfitMonth: number;
  maxLossMonth: number;
  avgProfitWeek: number;
  avgProfitMonth: number;
}

export const usePnLCalculations = (
  dailyPnL: DailyPnL[] | undefined,
  initialCapital: number
): PnLMetrics => {
  return useMemo(() => {
    if (!dailyPnL || dailyPnL.length === 0) {
      return getEmptyMetrics();
    }

    const sortedData = [...dailyPnL].sort(
      (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
    );

    // Calculate equity curve
    let runningEquity = initialCapital;
    let peakEquity = initialCapital;
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;

    const equityCurve = sortedData.map((day) => {
      runningEquity += day.pnl;
      const percentChange = ((runningEquity - initialCapital) / initialCapital) * 100;
      return {
        date: day.trade_date,
        equity: runningEquity,
        pnl: day.pnl,
        percentChange,
      };
    });

    const currentEquity = runningEquity;

    // Calculate drawdown curve
    let currentDrawdownDays = 0;
    let maxDrawdownDays = 0;
    let inDrawdown = false;
    let drawdownStartEquity = initialCapital;

    const drawdownCurve = equityCurve.map((point, index) => {
      if (point.equity > peakEquity) {
        peakEquity = point.equity;
        if (inDrawdown) {
          maxDrawdownDays = Math.max(maxDrawdownDays, currentDrawdownDays);
          currentDrawdownDays = 0;
          inDrawdown = false;
        }
      } else {
        if (!inDrawdown) {
          inDrawdown = true;
          drawdownStartEquity = peakEquity;
        }
        currentDrawdownDays++;
      }

      const drawdown = peakEquity - point.equity;
      const drawdownPercent = peakEquity > 0 ? (drawdown / peakEquity) * 100 : 0;

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownPercent = drawdownPercent;
      }

      return {
        date: point.date,
        drawdown,
        drawdownPercent,
      };
    });

    if (inDrawdown) {
      maxDrawdownDays = Math.max(maxDrawdownDays, currentDrawdownDays);
    }

    const currentDrawdown = peakEquity - currentEquity;
    const currentDrawdownPercent = peakEquity > 0 ? (currentDrawdown / peakEquity) * 100 : 0;

    // Profit metrics
    const overallProfit = currentEquity - initialCapital;
    const overallProfitPercent = (overallProfit / initialCapital) * 100;

    // Today's profit
    const today = new Date();
    const todayEntry = sortedData.find((d) => {
      const entryDate = parseISO(d.trade_date);
      return isToday(entryDate);
    });
    const todayProfit = todayEntry?.pnl || 0;
    const todayProfitPercent = (todayProfit / initialCapital) * 100;

    // Current month profit
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const currentMonthData = sortedData.filter((d) => {
      const entryDate = parseISO(d.trade_date);
      return isWithinInterval(entryDate, { start: monthStart, end: monthEnd });
    });
    const currentMonthProfit = currentMonthData.reduce((sum, d) => sum + d.pnl, 0);
    const currentMonthProfitPercent = (currentMonthProfit / initialCapital) * 100;
    const currentMonthWinDays = currentMonthData.filter((d) => d.pnl > 0).length;

    // Win/Loss metrics
    const winDays = sortedData.filter((d) => d.pnl > 0);
    const lossDays = sortedData.filter((d) => d.pnl < 0);
    const activeTradingDays = sortedData.filter((d) => d.pnl !== 0);

    const totalWinDays = winDays.length;
    const totalLossDays = lossDays.length;
    const totalDays = activeTradingDays.length;
    const winRate = totalDays > 0 ? (totalWinDays / totalDays) * 100 : 0;

    // Average metrics
    const totalProfit = winDays.reduce((sum, d) => sum + d.pnl, 0);
    const totalLoss = Math.abs(lossDays.reduce((sum, d) => sum + d.pnl, 0));

    const avgDailyProfit = totalDays > 0 ? overallProfit / totalDays : 0;
    const avgDailyProfitPercent = (avgDailyProfit / initialCapital) * 100;

    const avgWin = totalWinDays > 0 ? totalProfit / totalWinDays : 0;
    const avgWinPercent = (avgWin / initialCapital) * 100;

    const avgLoss = totalLossDays > 0 ? totalLoss / totalLossDays : 0;
    const avgLossPercent = (avgLoss / initialCapital) * 100;

    // Risk metrics
    const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

    const expectancy = totalDays > 0
      ? (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss
      : 0;
    const expectancyPercent = (expectancy / initialCapital) * 100;

    // Advanced ratios
    const recoveryFactor = maxDrawdown > 0 ? overallProfit / maxDrawdown : overallProfit > 0 ? Infinity : 0;

    // Annualized return (assuming 252 trading days)
    const annualizedReturn = totalDays > 0
      ? (overallProfitPercent / totalDays) * 252
      : 0;
    const calmarRatio = maxDrawdownPercent > 0 ? annualizedReturn / maxDrawdownPercent : 0;

    // Streak calculations
    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLosingStreak = 0;
    let tempWinStreak = 0;
    let tempLoseStreak = 0;

    for (let i = sortedData.length - 1; i >= 0; i--) {
      const pnl = sortedData[i].pnl;
      if (i === sortedData.length - 1) {
        currentStreak = pnl > 0 ? 1 : pnl < 0 ? -1 : 0;
      } else if (currentStreak > 0 && pnl > 0) {
        currentStreak++;
      } else if (currentStreak < 0 && pnl < 0) {
        currentStreak--;
      } else {
        break;
      }
    }

    for (const day of sortedData) {
      if (day.pnl > 0) {
        tempWinStreak++;
        tempLoseStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, tempWinStreak);
      } else if (day.pnl < 0) {
        tempLoseStreak++;
        tempWinStreak = 0;
        maxLosingStreak = Math.max(maxLosingStreak, tempLoseStreak);
      }
    }

    return {
      equityCurve: equityCurve.filter(p => p.pnl !== 0),
      currentEquity,
      overallProfit,
      overallProfitPercent,
      todayProfit,
      todayProfitPercent,
      currentMonthProfit,
      currentMonthProfitPercent,
      totalWinDays,
      totalLossDays,
      totalActiveDays: totalDays,
      winRate,
      currentMonthWinDays,
      avgDailyProfit,
      avgDailyProfitPercent,
      avgWin,
      avgWinPercent,
      avgLoss,
      avgLossPercent,
      riskRewardRatio,
      profitFactor,
      expectancy,
      expectancyPercent,
      peakEquity,
      currentDrawdown,
      currentDrawdownPercent,
      maxDrawdown,
      maxDrawdownPercent,
      currentDaysInDrawdown: inDrawdown ? currentDrawdownDays : 0,
      maxDaysInDrawdown: maxDrawdownDays,
      drawdownCurve: drawdownCurve.filter((_, i) => equityCurve[i].pnl !== 0),
      recoveryFactor,
      calmarRatio,
      maxWinStreak,
      currentStreak,
      maxLosingStreak,
      ...calculateStats(sortedData),
    };
  }, [dailyPnL, initialCapital]);
};

function calculateStats(sortedData: DailyPnL[]) {
  if (!sortedData || sortedData.length === 0) {
    return {
      maxProfitDay: 0,
      maxLossDay: 0,
      maxProfitWeek: 0,
      maxLossWeek: 0,
      maxProfitMonth: 0,
      maxLossMonth: 0,
      avgProfitWeek: 0,
      avgProfitMonth: 0,
    };
  }

  // Day stats
  let maxProfitDay = 0;
  let maxLossDay = 0;
  sortedData.forEach(d => {
    if (d.pnl > maxProfitDay) maxProfitDay = d.pnl;
    if (d.pnl < maxLossDay) maxLossDay = d.pnl;
  });

  // Week stats
  const weeklyPnL: Record<string, number> = {};
  sortedData.forEach(d => {
    const date = parseISO(d.trade_date);
    // Use ISO week (YYYY-WW)
    const year = date.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    const weekKey = `${year}-W${weekNum}`;

    weeklyPnL[weekKey] = (weeklyPnL[weekKey] || 0) + d.pnl;
  });

  const weeklyValues = Object.values(weeklyPnL);
  const maxProfitWeek = Math.max(0, ...weeklyValues);
  const maxLossWeek = Math.min(0, ...weeklyValues);
  const avgProfitWeek = weeklyValues.length > 0 ? weeklyValues.reduce((a, b) => a + b, 0) / weeklyValues.length : 0;

  // Month stats
  const monthlyPnL: Record<string, number> = {};
  sortedData.forEach(d => {
    const date = parseISO(d.trade_date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    monthlyPnL[monthKey] = (monthlyPnL[monthKey] || 0) + d.pnl;
  });

  const monthlyValues = Object.values(monthlyPnL);
  const maxProfitMonth = Math.max(0, ...monthlyValues);
  const maxLossMonth = Math.min(0, ...monthlyValues);
  const avgProfitMonth = monthlyValues.length > 0 ? monthlyValues.reduce((a, b) => a + b, 0) / monthlyValues.length : 0;

  return {
    maxProfitDay,
    maxLossDay,
    maxProfitWeek,
    maxLossWeek,
    maxProfitMonth,
    maxLossMonth,
    avgProfitWeek,
    avgProfitMonth,
  };
}

function getEmptyMetrics(): PnLMetrics {
  return {
    equityCurve: [],
    currentEquity: 0,
    overallProfit: 0,
    overallProfitPercent: 0,
    todayProfit: 0,
    todayProfitPercent: 0,
    currentMonthProfit: 0,
    currentMonthProfitPercent: 0,
    totalWinDays: 0,
    totalLossDays: 0,
    totalActiveDays: 0,
    winRate: 0,
    currentMonthWinDays: 0,
    avgDailyProfit: 0,
    avgDailyProfitPercent: 0,
    avgWin: 0,
    avgWinPercent: 0,
    avgLoss: 0,
    avgLossPercent: 0,
    riskRewardRatio: 0,
    profitFactor: 0,
    expectancy: 0,
    expectancyPercent: 0,
    peakEquity: 0,
    currentDrawdown: 0,
    currentDrawdownPercent: 0,
    maxDrawdown: 0,
    maxDrawdownPercent: 0,
    currentDaysInDrawdown: 0,
    maxDaysInDrawdown: 0,
    drawdownCurve: [],
    recoveryFactor: 0,
    calmarRatio: 0,
    maxWinStreak: 0,
    currentStreak: 0,
    maxLosingStreak: 0,
    maxProfitDay: 0,
    maxLossDay: 0,
    maxProfitWeek: 0,
    maxLossWeek: 0,
    maxProfitMonth: 0,
    maxLossMonth: 0,
    avgProfitWeek: 0,
    avgProfitMonth: 0,
  };
}