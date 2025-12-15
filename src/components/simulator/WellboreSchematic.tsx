import { getFluidColor } from "@/lib/pressureCalculations";
import { useEffect, useState } from "react";

interface WellboreSchematicProps {
  waterCut: number;
  fluidSG: number;
  status: 'OPTIMAL' | 'EROSION' | 'DEAD';
}

export function WellboreSchematic({ waterCut, fluidSG, status }: WellboreSchematicProps) {
  const [animationOffset, setAnimationOffset] = useState(0);
  const fluidColor = getFluidColor(waterCut, fluidSG);

  useEffect(() => {
    if (status === 'DEAD') return;
    
    const interval = setInterval(() => {
      setAnimationOffset((prev) => (prev + 2) % 100);
    }, 50);
    
    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      <svg
        viewBox="0 0 200 500"
        className="h-full w-auto"
        style={{ maxWidth: '200px' }}
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="casingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(220, 10%, 30%)" />
            <stop offset="50%" stopColor="hsl(220, 10%, 45%)" />
            <stop offset="100%" stopColor="hsl(220, 10%, 30%)" />
          </linearGradient>
          
          <linearGradient id="tubingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(220, 10%, 20%)" />
            <stop offset="50%" stopColor="hsl(220, 10%, 35%)" />
            <stop offset="100%" stopColor="hsl(220, 10%, 20%)" />
          </linearGradient>
          
          <linearGradient id="fluidGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={fluidColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={fluidColor} stopOpacity="0.5" />
          </linearGradient>

          <clipPath id="tubingClip">
            <rect x="85" y="50" width="30" height="380" />
          </clipPath>
        </defs>

        {/* Casing (outer pipe) */}
        <rect
          x="60"
          y="40"
          width="80"
          height="400"
          fill="none"
          stroke="url(#casingGradient)"
          strokeWidth="4"
          rx="2"
        />

        {/* Tubing (inner pipe) */}
        <rect
          x="80"
          y="45"
          width="40"
          height="390"
          fill="none"
          stroke="url(#tubingGradient)"
          strokeWidth="3"
          rx="1"
        />

        {/* Fluid inside tubing */}
        <rect
          x="85"
          y="50"
          width="30"
          height="380"
          fill="url(#fluidGradient)"
          opacity="0.8"
        />

        {/* Flow animation arrows */}
        {status !== 'DEAD' && (
          <g clipPath="url(#tubingClip)">
            {[0, 1, 2, 3, 4].map((i) => (
              <polygon
                key={i}
                points="100,0 108,15 100,10 92,15"
                fill="hsl(45, 100%, 50%)"
                opacity="0.7"
                transform={`translate(0, ${((animationOffset + i * 80) % 400) + 50})`}
              />
            ))}
          </g>
        )}

        {/* Wellhead */}
        <rect
          x="50"
          y="20"
          width="100"
          height="25"
          fill="hsl(220, 10%, 25%)"
          stroke="hsl(220, 10%, 40%)"
          strokeWidth="2"
          rx="3"
        />
        
        {/* Christmas tree valve */}
        <rect
          x="70"
          y="5"
          width="60"
          height="18"
          fill="hsl(0, 70%, 40%)"
          stroke="hsl(0, 70%, 30%)"
          strokeWidth="2"
          rx="2"
        />

        {/* Perforations at bottom */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <line
              x1="60"
              y1={400 + i * 10}
              x2="50"
              y2={400 + i * 10}
              stroke="hsl(45, 100%, 50%)"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
            <line
              x1="140"
              y1={400 + i * 10}
              x2="150"
              y2={400 + i * 10}
              stroke="hsl(45, 100%, 50%)"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          </g>
        ))}

        {/* Labels */}
        <text
          x="100"
          y="500"
          textAnchor="middle"
          fill="hsl(45, 100%, 95%)"
          fontSize="14"
          fontFamily="Rajdhani"
          fontWeight="bold"
        >
          RESERVOIR
        </text>
        
        <text
          x="170"
          y="240"
          textAnchor="start"
          fill="hsl(220, 10%, 60%)"
          fontSize="10"
          fontFamily="Rajdhani"
        >
          TUBING
        </text>
        
        <text
          x="170"
          y="260"
          textAnchor="start"
          fill="hsl(220, 10%, 50%)"
          fontSize="10"
          fontFamily="Rajdhani"
        >
          CASING
        </text>
      </svg>

      {/* Status indicator */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
        status === 'OPTIMAL' ? 'bg-success/20 text-success' :
        status === 'EROSION' ? 'bg-warning/20 text-warning' :
        'bg-destructive/20 text-destructive'
      }`}>
        {status === 'DEAD' ? 'لا يوجد تدفق' : 'تدفق نشط'}
      </div>
    </div>
  );
}
