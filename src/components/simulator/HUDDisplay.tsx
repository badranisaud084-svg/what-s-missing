import { cn } from "@/lib/utils";
import { Gauge, Activity, Droplets } from "lucide-react";

interface HUDDisplayProps {
  velocity: number;
  status: 'OPTIMAL' | 'EROSION' | 'DEAD';
  statusMessage: string;
  whp: number;
}

export function HUDDisplay({ velocity, status, statusMessage, whp }: HUDDisplayProps) {
  const statusColors = {
    OPTIMAL: 'status-optimal',
    EROSION: 'status-warning',
    DEAD: 'status-critical',
  };

  const statusLabels = {
    OPTIMAL: 'مثالي',
    EROSION: 'تحذير',
    DEAD: 'توقف',
  };

  const velocityColor = velocity > 15 ? 'text-warning' : 'text-success';

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Velocity */}
      <div className="hud-display">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">السرعة</span>
        </div>
        <div className={cn("font-display text-2xl font-bold", velocityColor)}>
          {velocity.toFixed(2)}
        </div>
        <div className="text-xs text-muted-foreground">ft/s</div>
      </div>

      {/* Status */}
      <div className={cn("hud-display border", statusColors[status])}>
        <div className="flex items-center gap-2 mb-2">
          <Gauge className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider">الحالة</span>
        </div>
        <div className="font-display text-xl font-bold">
          {statusLabels[status]}
        </div>
        <div className="text-xs mt-1 opacity-80 line-clamp-2">
          {statusMessage}
        </div>
      </div>

      {/* WHP */}
      <div className="hud-display">
        <div className="flex items-center gap-2 mb-2">
          <Droplets className="w-4 h-4 text-secondary" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">ضغط الرأس</span>
        </div>
        <div className={cn(
          "font-display text-2xl font-bold",
          whp <= 0 ? "text-destructive" : "text-secondary"
        )}>
          {whp.toFixed(0)}
        </div>
        <div className="text-xs text-muted-foreground">psi</div>
      </div>
    </div>
  );
}
