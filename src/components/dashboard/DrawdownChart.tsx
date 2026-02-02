import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { formatCurrency, formatPercent } from "@/lib/formatters";

interface DrawdownChartProps {
  data: { date: string; drawdown: number; drawdownPercent: number }[];
}

export const DrawdownChart = ({ data }: DrawdownChartProps) => {
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
    negativeDrawdown: -d.drawdown,
  }));

  const maxDrawdown = Math.max(...data.map((d) => d.drawdown));

  return (
    <div className="chart-container">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
        Drawdown Curve
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0 72% 51%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(0 72% 51%)" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(value) => `₹${Math.abs(value / 1000).toFixed(0)}k`}
              domain={[-(maxDrawdown * 1.2 || 1000), 0]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(214 32% 91%)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string, props: any) => [
                `${formatCurrency(Math.abs(value))} (${formatPercent(props.payload.drawdownPercent)})`,
                "Drawdown",
              ]}
              labelStyle={{ color: "hsl(222 47% 11%)" }}
            />
            <Area
              type="monotone"
              dataKey="negativeDrawdown"
              stroke="hsl(0 72% 51%)"
              strokeWidth={2}
              fill="url(#drawdownGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};