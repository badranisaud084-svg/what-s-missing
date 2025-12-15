import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceDot,
  Legend,
} from "recharts";
import { IPRData } from "@/lib/pressureCalculations";

interface IPRChartProps {
  data: IPRData;
}

export function IPRChart({ data }: IPRChartProps) {
  // Combine curves for chart
  const chartData = data.vogelCurve.map((v, i) => ({
    rate: v.rate,
    vogelPwf: v.pwf,
    fetkovichPwf: data.fetkovichCurve[i]?.pwf || 0,
  }));

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <defs>
            <linearGradient id="vogelGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(142, 76%, 50%)" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="fetkovichGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(200, 80%, 50%)" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(200, 80%, 65%)" stopOpacity={1} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 20%)" />
          
          <XAxis
            dataKey="rate"
            type="number"
            domain={[0, 'auto']}
            stroke="hsl(220, 10%, 50%)"
            tick={{ fill: 'hsl(220, 10%, 60%)', fontSize: 11 }}
            label={{
              value: 'معدل الإنتاج (STB/D)',
              position: 'bottom',
              fill: 'hsl(45, 100%, 90%)',
              fontSize: 12,
              fontFamily: 'Rajdhani',
              dy: 15,
            }}
          />
          
          <YAxis
            domain={[0, data.reservoirPressure]}
            stroke="hsl(220, 10%, 50%)"
            tick={{ fill: 'hsl(220, 10%, 60%)', fontSize: 11 }}
            label={{
              value: 'Pwf (psi)',
              angle: -90,
              position: 'insideLeft',
              fill: 'hsl(45, 100%, 90%)',
              fontSize: 12,
              fontFamily: 'Rajdhani',
            }}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(220, 25%, 10%)',
              border: '1px solid hsl(220, 20%, 25%)',
              borderRadius: '8px',
              fontFamily: 'Rajdhani',
              fontSize: 12,
            }}
            labelStyle={{ color: 'hsl(45, 100%, 95%)' }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(0)} psi`,
              name === 'vogelPwf' ? 'Vogel' : 'Fetkovich'
            ]}
            labelFormatter={(label) => `${label.toFixed(0)} STB/D`}
          />
          
          <Legend 
            verticalAlign="top"
            height={36}
            formatter={(value) => (
              <span style={{ color: 'hsl(45, 100%, 90%)', fontSize: 11 }}>
                {value === 'vogelPwf' ? 'Vogel IPR' : 'Fetkovich IPR'}
              </span>
            )}
          />
          
          {/* Vogel Curve */}
          <Line
            type="monotone"
            dataKey="vogelPwf"
            stroke="url(#vogelGradient)"
            strokeWidth={2.5}
            dot={false}
            animationDuration={800}
          />
          
          {/* Fetkovich Curve */}
          <Line
            type="monotone"
            dataKey="fetkovichPwf"
            stroke="url(#fetkovichGradient)"
            strokeWidth={2.5}
            strokeDasharray="5 5"
            dot={false}
            animationDuration={800}
          />
          
          {/* Operating Point */}
          <ReferenceDot
            x={data.operatingPoint.rate}
            y={data.operatingPoint.pwf}
            r={8}
            fill="hsl(45, 100%, 50%)"
            stroke="hsl(45, 100%, 70%)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Legend for operating point */}
      <div className="flex justify-center gap-6 mt-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50" />
          <span className="text-muted-foreground">نقطة التشغيل</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">AOF (Vogel): </span>
          <span className="text-success font-bold">{data.aofVogel.toFixed(0)} STB/D</span>
        </div>
      </div>
    </div>
  );
}
