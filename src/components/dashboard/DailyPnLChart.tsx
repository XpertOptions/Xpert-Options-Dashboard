import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { format, parseISO } from "date-fns";
import { formatCurrency, formatPercent } from "@/lib/formatters";

interface DailyPnLChartProps {
  data: { date: string; pnl: number; percentChange: number }[];
  initialCapital: number;
}

export const DailyPnLChart = ({ data, initialCapital }: DailyPnLChartProps) => {
  if (data.length === 0) {
    return (
      <div className="chart-container h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    date: format(parseISO(d.date), "MMM d"),
    pnlPercent: (d.pnl / initialCapital) * 100,
  }));

  const maxPnL = Math.max(...data.map((d) => Math.abs(d.pnl)));

  return (
    <div className="chart-container">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
        Daily P&L
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
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
            />
            <YAxis
              stroke="hsl(215 16% 47%)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(1)}k`}
              domain={[-(maxPnL * 1.2), maxPnL * 1.2]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(214 32% 91%)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string, props: any) => [
                `${formatCurrency(value, true)} (${formatPercent(props.payload.pnlPercent, true)})`,
                "P&L",
              ]}
              labelStyle={{ color: "hsl(222 47% 11%)" }}
            />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? "hsl(160 84% 39%)" : "hsl(0 72% 51%)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};