import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { format, parseISO } from "date-fns";
import { formatCurrency, formatPercent } from "@/lib/formatters";

interface EquityChartProps {
  data: { date: string; equity: number; percentChange: number }[];
  initialCapital: number;
}

export const EquityChart = ({ data, initialCapital }: EquityChartProps) => {
  if (data.length === 0) {
    return (
      <div className="chart-container h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const chartData = [
    { date: "Start", equity: initialCapital, percentChange: 0 },
    ...data.map((d) => ({
      ...d,
      date: format(parseISO(d.date), "MMM d"),
    })),
  ];

  const minEquity = Math.min(...chartData.map((d) => d.equity));
  const maxEquity = Math.max(...chartData.map((d) => d.equity));
  const padding = (maxEquity - minEquity) * 0.1 || initialCapital * 0.1;

  return (
    <div className="chart-container">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
        Equity Curve
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
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
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              domain={[minEquity - padding, maxEquity + padding]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(214 32% 91%)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string, props: any) => [
                `${formatCurrency(value)} (${formatPercent(props.payload.percentChange, true)})`,
                "Equity",
              ]}
              labelStyle={{ color: "hsl(222 47% 11%)" }}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="hsl(199 89% 48%)"
              strokeWidth={2}
              fill="url(#equityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};