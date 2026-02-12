import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { formatCurrency, formatPercent } from "@/lib/formatters";

interface PnLCurveProps {
    data: { date: string; pnl: number }[];
    initialCapital: number;
}

export const PnLCurve = ({ data, initialCapital }: PnLCurveProps) => {
    if (data.length === 0) {
        return (
            <div className="chart-container h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No data available for P&L curve</p>
            </div>
        );
    }

    let cumulativePnL = 0;
    const chartData = [
        { date: "Start", cumulative: 0, percent: 0 },
        ...data.map((d) => {
            cumulativePnL += d.pnl;
            return {
                date: format(parseISO(d.date), "MMM d, yyyy"),
                cumulative: cumulativePnL,
                percent: (cumulativePnL / initialCapital) * 100,
            };
        }),
    ];

    return (
        <div className="chart-container">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                Cumulative P&L Curve
            </h3>
            <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(214 32% 91%)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="date"
                            stroke="hsl(215 16% 47%)"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            hide
                        />
                        <YAxis
                            stroke="hsl(215 16% 47%)"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(0 0% 100%)",
                                border: "1px solid hsl(214 32% 91%)",
                                borderRadius: "8px",
                                fontSize: "12px",
                            }}
                            formatter={(value: number, name: string, props: any) => [
                                `${formatCurrency(value, true)} (${formatPercent(props.payload.percent, true)})`,
                                "Cumulative P&L",
                            ]}
                            labelStyle={{ color: "hsl(222 47% 11%)" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="cumulative"
                            stroke="hsl(160 84% 39%)"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
