import { cn } from "@/lib/utils";
import { Gauge, Activity, Droplets, Zap, AlertTriangle, CheckCircle } from "lucide-react";

interface HUDDisplayProps {
  velocity: number;
  status: 'OPTIMAL' | 'EROSION' | 'DEAD';
  statusMessage: string;
  whp: number;
  pwf: number;
  aof: number;
  productionRate: number;
}

export function HUDDisplay({ velocity, status, statusMessage, whp, pwf, aof, productionRate }: HUDDisplayProps) {
  const statusConfig = {
    OPTIMAL: {
      color: 'text-success',
      bg: 'bg-success/10',
      border: 'border-success/30',
      icon: CheckCircle,
      label: 'OPTIMAL',
      labelAr: 'مثالي',
    },
    EROSION: {
      color: 'text-warning',
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      icon: AlertTriangle,
      label: 'WARNING',
      labelAr: 'تحذير',
    },
    DEAD: {
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      border: 'border-destructive/30',
      icon: Zap,
      label: 'DEAD WELL',
      labelAr: 'توقف',
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const efficiency = aof > 0 ? (productionRate / aof) * 100 : 0;

  return (
    <div className="grid grid-cols-4 gap-3">
      {/* Status */}
      <div className={cn("hud-display border-2", config.bg, config.border)}>
        <div className="flex items-center gap-2 mb-1">
          <StatusIcon className={cn("w-4 h-4", config.color)} />
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">STATUS</span>
        </div>
        <div className={cn("font-display text-xl font-black tracking-wider", config.color)}>
          {config.label}
        </div>
        <div className="text-xs text-muted-foreground mt-1">{config.labelAr}</div>
      </div>

      {/* Velocity */}
      <div className="hud-display">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-4 h-4 text-secondary" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">VELOCITY</span>
        </div>
        <div className={cn(
          "font-display text-2xl font-black",
          velocity > 15 ? "text-warning" : velocity > 10 ? "text-accent" : "text-foreground"
        )}>
          {velocity.toFixed(2)}
        </div>
        <div className="text-xs text-muted-foreground">ft/s</div>
        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-300",
              velocity > 15 ? "bg-warning" : velocity > 10 ? "bg-accent" : "bg-success"
            )}
            style={{ width: `${Math.min(100, (velocity / 20) * 100)}%` }}
          />
        </div>
      </div>

      {/* WHP */}
      <div className="hud-display">
        <div className="flex items-center gap-2 mb-1">
          <Droplets className="w-4 h-4 text-primary" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">WHP</span>
        </div>
        <div className={cn(
          "font-display text-2xl font-black",
          whp <= 0 ? "text-destructive" : whp < 100 ? "text-warning" : "text-primary"
        )}>
          {whp.toFixed(0)}
        </div>
        <div className="text-xs text-muted-foreground">psi</div>
      </div>

      {/* Efficiency */}
      <div className="hud-display">
        <div className="flex items-center gap-2 mb-1">
          <Gauge className="w-4 h-4 text-accent" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">EFFICIENCY</span>
        </div>
        <div className="font-display text-2xl font-black text-accent">
          {efficiency.toFixed(1)}%
        </div>
        <div className="text-xs text-muted-foreground">of AOF</div>
      </div>
    </div>
  );
}
