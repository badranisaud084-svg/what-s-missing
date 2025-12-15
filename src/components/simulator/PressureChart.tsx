import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface PressureChartProps {
  data: { depth: number; pressure: number }[];
  reservoirPressure: number;
  pwf: number;
  status: 'OPTIMAL' | 'EROSION' | 'DEAD';
}

export function PressureChart({ data, reservoirPressure, pwf, status }: PressureChartProps) {
  const statusColors = {
    OPTIMAL: '#22c55e',
    EROSION: '#f59e0b',
    DEAD: '#ef4444',
  };

  const lineColor = statusColors[status];

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="pressureGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(180, 70%, 45%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 25%)" />
          
          <XAxis
            dataKey="pressure"
            type="number"
            domain={['auto', 'auto']}
            stroke="hsl(220, 10%, 60%)"
            tick={{ fill: 'hsl(220, 10%, 60%)', fontSize: 12 }}
            label={{
              value: 'الضغط (psi)',
              position: 'bottom',
              fill: 'hsl(45, 100%, 95%)',
              fontSize: 14,
              fontFamily: 'Rajdhani',
            }}
          />
          
          <YAxis
            dataKey="depth"
            type="number"
            domain={[0, 8000]}
            reversed
            stroke="hsl(220, 10%, 60%)"
            tick={{ fill: 'hsl(220, 10%, 60%)', fontSize: 12 }}
            label={{
              value: 'العمق (ft)',
              angle: -90,
              position: 'insideLeft',
              fill: 'hsl(45, 100%, 95%)',
              fontSize: 14,
              fontFamily: 'Rajdhani',
            }}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(220, 25%, 12%)',
              border: '1px solid hsl(220, 20%, 25%)',
              borderRadius: '8px',
              fontFamily: 'Rajdhani',
            }}
            labelStyle={{ color: 'hsl(45, 100%, 95%)' }}
            formatter={(value: number) => [`${value.toFixed(1)} psi`, 'الضغط']}
            labelFormatter={(label) => `العمق: ${label} ft`}
          />
          
          {/* Reference lines */}
          <ReferenceLine
            x={reservoirPressure}
            stroke="hsl(45, 100%, 50%)"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: `ضغط المكمن: ${reservoirPressure} psi`,
              position: 'top',
              fill: 'hsl(45, 100%, 50%)',
              fontSize: 11,
            }}
          />
          
          <ReferenceLine
            x={pwf}
            stroke="hsl(30, 70%, 50%)"
            strokeDasharray="3 3"
            strokeWidth={2}
            label={{
              value: `Pwf: ${pwf.toFixed(0)} psi`,
              position: 'insideTopRight',
              fill: 'hsl(30, 70%, 50%)',
              fontSize: 11,
            }}
          />
          
          <Area
            type="monotone"
            dataKey="pressure"
            stroke={lineColor}
            strokeWidth={3}
            fill="url(#pressureGradient)"
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
