import { getFluidColor } from "@/lib/pressureCalculations";
import { useEffect, useState } from "react";

interface WellboreSchematicProps {
  waterCut: number;
  fluidSG: number;
  status: 'OPTIMAL' | 'EROSION' | 'DEAD';
  tubingID: number;
  depth?: number;
}

export function WellboreSchematic({ 
  waterCut, 
  fluidSG, 
  status, 
  tubingID,
  depth = 8000 
}: WellboreSchematicProps) {
  const [animationOffset, setAnimationOffset] = useState(0);
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const fluidColor = getFluidColor(waterCut, fluidSG);

  // Flow animation
  useEffect(() => {
    if (status === 'DEAD') return;
    
    const speed = status === 'EROSION' ? 30 : 50;
    const interval = setInterval(() => {
      setAnimationOffset((prev) => (prev + 3) % 100);
    }, speed);
    
    return () => clearInterval(interval);
  }, [status]);

  // Bubble animation for gas
  useEffect(() => {
    if (status === 'DEAD' || fluidSG > 0.85) return;
    
    const interval = setInterval(() => {
      setBubbles(prev => {
        const newBubbles = prev
          .map(b => ({ ...b, y: b.y - 8 }))
          .filter(b => b.y > 50);
        
        if (Math.random() > 0.6) {
          newBubbles.push({
            id: Date.now(),
            x: 90 + Math.random() * 20,
            y: 420,
            size: 2 + Math.random() * 3,
          });
        }
        return newBubbles;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [status, fluidSG]);

  // Scale tubing width based on ID
  const tubingWidth = 20 + (tubingID - 1.5) * 8;
  const tubingX = 100 - tubingWidth / 2;

  return (
    <div className="relative w-full h-[350px] flex items-center justify-center">
      <svg
        viewBox="0 0 200 480"
        className="h-full w-auto"
        style={{ maxWidth: '180px' }}
      >
        <defs>
          {/* Metal gradients */}
          <linearGradient id="casingMetal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2a2a2e" />
            <stop offset="15%" stopColor="#4a4a52" />
            <stop offset="50%" stopColor="#5a5a65" />
            <stop offset="85%" stopColor="#4a4a52" />
            <stop offset="100%" stopColor="#2a2a2e" />
          </linearGradient>
          
          <linearGradient id="tubingMetal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1a1a1e" />
            <stop offset="20%" stopColor="#3a3a42" />
            <stop offset="50%" stopColor="#4a4a55" />
            <stop offset="80%" stopColor="#3a3a42" />
            <stop offset="100%" stopColor="#1a1a1e" />
          </linearGradient>

          <linearGradient id="fluidGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={fluidColor} stopOpacity="0.95" />
            <stop offset="50%" stopColor={fluidColor} stopOpacity="0.7" />
            <stop offset="100%" stopColor={fluidColor} stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="reservoirGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3d2817" />
            <stop offset="50%" stopColor="#5a3d22" />
            <stop offset="100%" stopColor="#2a1a0e" />
          </linearGradient>

          <pattern id="rockPattern" patternUnits="userSpaceOnUse" width="20" height="20">
            <rect width="20" height="20" fill="#2a2a30" />
            <circle cx="5" cy="5" r="2" fill="#3a3a40" />
            <circle cx="15" cy="15" r="1.5" fill="#222228" />
            <circle cx="10" cy="12" r="1" fill="#4a4a50" />
          </pattern>

          <clipPath id="tubingClip">
            <rect x={tubingX + 5} y="60" width={tubingWidth - 10} height="360" />
          </clipPath>

          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Formation/Rock background */}
        <rect x="20" y="40" width="160" height="420" fill="url(#rockPattern)" />
        
        {/* Reservoir zone */}
        <rect x="20" y="380" width="160" height="80" fill="url(#reservoirGrad)" opacity="0.8" />
        
        {/* Depth markers */}
        {[0, 2000, 4000, 6000, 8000].map((d, i) => (
          <g key={d}>
            <line 
              x1="15" 
              y1={50 + (i * 85)} 
              x2="20" 
              y2={50 + (i * 85)} 
              stroke="hsl(220, 10%, 40%)" 
              strokeWidth="1"
            />
            <text 
              x="12" 
              y={50 + (i * 85) + 3} 
              textAnchor="end" 
              fill="hsl(220, 10%, 50%)" 
              fontSize="7"
              fontFamily="Rajdhani"
            >
              {d}'
            </text>
          </g>
        ))}

        {/* Casing (outer pipe) */}
        <rect
          x="55"
          y="45"
          width="90"
          height="395"
          fill="none"
          stroke="url(#casingMetal)"
          strokeWidth="6"
          rx="3"
        />

        {/* Casing couplings */}
        {[100, 200, 300, 380].map((y) => (
          <rect
            key={y}
            x="52"
            y={y}
            width="96"
            height="8"
            fill="#3a3a42"
            stroke="#2a2a2e"
            strokeWidth="1"
          />
        ))}

        {/* Tubing (inner pipe) */}
        <rect
          x={tubingX}
          y="55"
          width={tubingWidth}
          height="375"
          fill="none"
          stroke="url(#tubingMetal)"
          strokeWidth="4"
          rx="2"
        />

        {/* Fluid inside tubing */}
        <rect
          x={tubingX + 5}
          y="60"
          width={tubingWidth - 10}
          height="360"
          fill="url(#fluidGrad)"
        />

        {/* Gas bubbles */}
        <g clipPath="url(#tubingClip)">
          {bubbles.map((bubble) => (
            <circle
              key={bubble.id}
              cx={bubble.x}
              cy={bubble.y}
              r={bubble.size}
              fill="rgba(255, 200, 100, 0.6)"
              filter="url(#glow)"
            />
          ))}
        </g>

        {/* Flow arrows */}
        {status !== 'DEAD' && (
          <g clipPath="url(#tubingClip)" opacity="0.9">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <polygon
                key={i}
                points="100,0 106,12 100,8 94,12"
                fill={status === 'EROSION' ? 'hsl(38, 92%, 50%)' : 'hsl(45, 100%, 50%)'}
                transform={`translate(0, ${((animationOffset + i * 60) % 380) + 60})`}
                filter="url(#glow)"
              />
            ))}
          </g>
        )}

        {/* Wellhead assembly */}
        <g>
          {/* Wellhead base */}
          <rect x="45" y="30" width="110" height="20" fill="#2a2a30" stroke="#1a1a1e" strokeWidth="2" rx="2" />
          
          {/* Christmas tree / valve assembly */}
          <rect x="65" y="10" width="70" height="22" fill="#3a3a42" stroke="#2a2a2e" strokeWidth="2" rx="3" />
          
          {/* Master valve */}
          <circle cx="100" cy="21" r="8" fill={status === 'DEAD' ? '#dc2626' : '#22c55e'} stroke="#1a1a1e" strokeWidth="2" />
          
          {/* Flow line */}
          <rect x="135" y="16" width="30" height="10" fill="#4a4a52" stroke="#2a2a2e" strokeWidth="1" rx="2" />
        </g>

        {/* Perforations */}
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              {/* Left perfs */}
              <line
                x1="55"
                y1={395 + i * 8}
                x2="40"
                y2={392 + i * 8}
                stroke="hsl(45, 100%, 50%)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.8"
              />
              <circle cx="38" cy={391 + i * 8} r="2" fill="hsl(45, 100%, 50%)" filter="url(#glow)" />
              
              {/* Right perfs */}
              <line
                x1="145"
                y1={395 + i * 8}
                x2="160"
                y2={392 + i * 8}
                stroke="hsl(45, 100%, 50%)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.8"
              />
              <circle cx="162" cy={391 + i * 8} r="2" fill="hsl(45, 100%, 50%)" filter="url(#glow)" />
            </g>
          ))}
        </g>

        {/* Labels */}
        <text x="175" y="80" fill="hsl(220, 10%, 50%)" fontSize="8" fontFamily="Rajdhani">CASING</text>
        <text x="175" y="150" fill="hsl(220, 10%, 50%)" fontSize="8" fontFamily="Rajdhani">TUBING</text>
        <text x="175" y="400" fill="hsl(30, 70%, 50%)" fontSize="8" fontFamily="Rajdhani">RESERVOIR</text>
      </svg>

      {/* Status indicator */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold border ${
        status === 'OPTIMAL' ? 'bg-success/20 text-success border-success/30' :
        status === 'EROSION' ? 'bg-warning/20 text-warning border-warning/30' :
        'bg-destructive/20 text-destructive border-destructive/30'
      }`}>
        {status === 'DEAD' ? '⚠ NO FLOW' : status === 'EROSION' ? '⚡ HIGH V' : '✓ FLOWING'}
      </div>

      {/* Tubing ID indicator */}
      <div className="absolute bottom-2 left-2 text-xs text-muted-foreground font-mono">
        ID: {tubingID}" | {depth} ft
      </div>
    </div>
  );
}
