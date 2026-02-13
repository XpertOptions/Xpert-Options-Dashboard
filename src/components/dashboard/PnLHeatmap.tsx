import React, { useMemo } from "react";
import {
    format,
    startOfYear,
    endOfYear,
    eachDayOfInterval,
    isSameDay,
    parseISO,
    subYears,
} from "date-fns";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface PnLHeatmapProps {
    data: { date: string; pnl: number; is_no_trade_day?: boolean }[];
}

export const PnLHeatmap = ({ data }: PnLHeatmapProps) => {
    const currentYear = new Date().getFullYear();
    const startDate = startOfYear(new Date());
    const endDate = endOfYear(new Date());

    const days = useMemo(() => {
        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [startDate, endDate]);

    const pnlMap = useMemo(() => {
        const map = new Map<string, number>();
        data.forEach((item) => {
            map.set(format(parseISO(item.date), "yyyy-MM-dd"), item.pnl);
        });
        return map;
    }, [data]);

    const getColorClass = (pnl: number | undefined) => {
        if (pnl === undefined) return "bg-muted/30";
        if (pnl === 0) return "bg-yellow-500/50";

        if (pnl > 0) {
            if (pnl > 10000) return "bg-emerald-600";
            if (pnl > 5000) return "bg-emerald-500";
            if (pnl > 2000) return "bg-emerald-400";
            return "bg-emerald-300";
        } else {
            const absPnl = Math.abs(pnl);
            if (absPnl > 10000) return "bg-red-600";
            if (absPnl > 5000) return "bg-red-500";
            if (absPnl > 2000) return "bg-red-400";
            return "bg-red-300";
        }
    };

    // Group days by month for the layout shown in screenshot
    const months = useMemo(() => {
        const monthsArr: { name: string; days: Date[] }[] = [];
        let currentMonth = -1;

        days.forEach((day) => {
            const monthIdx = day.getMonth();
            if (monthIdx !== currentMonth) {
                monthsArr.push({
                    name: format(day, "MMM"),
                    days: [],
                });
                currentMonth = monthIdx;
            }
            monthsArr[monthsArr.length - 1].days.push(day);
        });

        return monthsArr;
    }, [days]);

    return (
        <div className="chart-container overflow-x-auto">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                P&L Heatmap ({currentYear})
            </h3>
            <div className="flex gap-4 min-w-max pb-4">
                <div className="flex flex-col gap-2 pt-6 text-[10px] text-muted-foreground">
                    <span>M</span>
                    <span>W</span>
                    <span>F</span>
                </div>
                <div className="flex flex-1 justify-between gap-2">
                    {months.map((month, mIdx) => (
                        <div key={mIdx} className="flex flex-col gap-1 flex-1">
                            <span className="text-[10px] text-muted-foreground mb-1 h-3 text-center">
                                {month.name}
                            </span>
                            <div className="grid grid-rows-7 grid-flow-col gap-1.5 justify-center">
                                {/* Add empty spots for the first week of the month to align days correctly */}
                                {Array.from({ length: month.days[0].getDay() === 0 ? 6 : month.days[0].getDay() - 1 }).map((_, i) => (
                                    <div key={`empty-${i}`} className="w-4 h-4" />
                                ))}

                                {month.days.map((day, dIdx) => {
                                    const dateStr = format(day, "yyyy-MM-dd");
                                    const pnl = pnlMap.get(dateStr);

                                    return (
                                        <TooltipProvider key={dIdx}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className={cn(
                                                            "w-4 h-4 rounded-sm transition-all hover:scale-125 cursor-pointer",
                                                            getColorClass(pnl)
                                                        )}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div className="text-xs">
                                                        <p className="font-semibold">{format(day, "PPP")}</p>
                                                        {pnl === 0 ? (
                                                            <p className="text-yellow-500 font-medium italic">No Trade Day</p>
                                                        ) : (
                                                            <p className={cn(
                                                                pnl !== undefined && pnl > 0 ? "text-emerald-500" : pnl !== undefined && pnl < 0 ? "text-red-500" : ""
                                                            )}>
                                                                {pnl !== undefined ? `P&L: ${formatCurrency(pnl, true)}` : "No trades"}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
                <span>Min. loss</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 bg-red-300 rounded-sm" />
                    <div className="w-3 h-3 bg-red-400 rounded-sm" />
                    <div className="w-3 h-3 bg-red-500 rounded-sm" />
                    <div className="w-3 h-3 bg-red-600 rounded-sm" />
                </div>
                <span className="ml-2">Min. profit</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 bg-emerald-300 rounded-sm" />
                    <div className="w-3 h-3 bg-emerald-400 rounded-sm" />
                    <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                    <div className="w-3 h-3 bg-emerald-600 rounded-sm" />
                </div>
                <span className="ml-2">Max. profit</span>
            </div>
        </div>
    );
};
