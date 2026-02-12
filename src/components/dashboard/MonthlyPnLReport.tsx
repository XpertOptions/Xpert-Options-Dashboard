import React, { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface MonthlyPnLReportProps {
    data: { date: string; pnl: number }[];
}

export const MonthlyPnLReport = ({ data }: MonthlyPnLReportProps) => {
    const tableData = useMemo(() => {
        const yearsMap: Record<number, Record<number, number>> = {};
        const years: number[] = [];

        data.forEach((item) => {
            const date = parseISO(item.date);
            const year = date.getFullYear();
            const month = date.getMonth(); // 0-11

            if (!yearsMap[year]) {
                yearsMap[year] = {};
                years.push(year);
            }
            yearsMap[year][month] = (yearsMap[year][month] || 0) + item.pnl;
        });

        const yearsStats: Record<number, { maxDD: number, maxDDDays: number }> = {};

        // Calculate yearly stats
        years.forEach(year => {
            const yearData = data.filter(d => parseISO(d.date).getFullYear() === year)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            let runningEquity = 0;
            let peakEquity = 0;
            let maxDD = 0;
            let currentDDDays = 0;
            let maxDDDays = 0;
            let inDD = false;

            yearData.forEach(d => {
                runningEquity += d.pnl;
                if (runningEquity > peakEquity) {
                    peakEquity = runningEquity;
                    if (inDD) {
                        maxDDDays = Math.max(maxDDDays, currentDDDays);
                        currentDDDays = 0;
                        inDD = false;
                    }
                } else {
                    inDD = true;
                    currentDDDays++;
                    const dd = peakEquity - runningEquity;
                    maxDD = Math.max(maxDD, dd);
                }
            });
            if (inDD) maxDDDays = Math.max(maxDDDays, currentDDDays);

            yearsStats[year] = { maxDD, maxDDDays };
        });

        return {
            years: years.sort((a, b) => b - a),
            yearsMap,
            yearsStats
        };
    }, [data]);

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    if (tableData.years.length === 0) {
        return (
            <div className="chart-container h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">No monthly data available</p>
            </div>
        );
    }

    return (
        <div className="chart-container overflow-x-auto">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                Monthly P&L Report
            </h3>
            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="bg-muted/50">
                        <th className="p-2 text-left border border-border">Year</th>
                        {months.map((month) => (
                            <th key={month} className="p-2 text-center border border-border font-medium">
                                {month}
                            </th>
                        ))}
                        <th className="p-2 text-center border border-border font-bold">Total</th>
                        <th className="p-2 text-center border border-border font-bold">Max Drawdown</th>
                        <th className="p-2 text-center border border-border font-bold">Days for MDD</th>
                    </tr>
                </thead>
                <tbody>
                    {tableData.years.map((year) => {
                        let yearlyTotal = 0;
                        const stats = tableData.yearsStats[year];
                        return (
                            <tr key={year}>
                                <td className="p-2 font-bold border border-border">{year}</td>
                                {months.map((_, monthIdx) => {
                                    const pnl = tableData.yearsMap[year][monthIdx] || 0;
                                    yearlyTotal += pnl;
                                    return (
                                        <td
                                            key={monthIdx}
                                            className={cn(
                                                "p-2 text-center border border-border",
                                                pnl > 0 ? "text-emerald-500" : pnl < 0 ? "text-red-500" : "text-muted-foreground"
                                            )}
                                        >
                                            {pnl !== 0 ? formatCurrency(pnl, true).replace("₹", "") : "0"}
                                        </td>
                                    );
                                })}
                                <td
                                    className={cn(
                                        "p-2 text-center border border-border font-bold",
                                        yearlyTotal > 0 ? "text-emerald-600" : yearlyTotal < 0 ? "text-red-600" : ""
                                    )}
                                >
                                    {formatCurrency(yearlyTotal, true).replace("₹", "")}
                                </td>
                                <td className="p-2 text-center border border-border text-red-500 font-medium">
                                    {stats.maxDD > 0 ? formatCurrency(stats.maxDD, true).replace("₹", "-") : "0"}
                                </td>
                                <td className="p-2 text-center border border-border text-muted-foreground">
                                    {stats.maxDDDays > 0 ? stats.maxDDDays : "NA"}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
