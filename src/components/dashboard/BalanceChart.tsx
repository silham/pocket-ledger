"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataPoint {
  label: string;
  balance: number;
}

interface Props {
  data: DataPoint[];
}

function formatLKR(v: number) {
  if (Math.abs(v) >= 1_000_000) return `Rs.${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `Rs.${(v / 1_000).toFixed(0)}K`;
  return `Rs.${v.toFixed(0)}`;
}

export function BalanceChart({ data }: Props) {
  const values = data.map((d) => d.balance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max((max - min) * 0.12, 500);
  const yMin = Math.floor((min - pad) / 500) * 500;
  const yMax = Math.ceil((max + pad) / 500) * 500;

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">Balance — Last 30 Days</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={formatLKR}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              width={52}
              domain={[yMin, yMax]}
            />
            <Tooltip
              formatter={(v) => [`Rs. ${Number(v).toLocaleString()}`, "Balance"]}
              labelStyle={{ fontSize: 12 }}
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
              }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#6366f1" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
