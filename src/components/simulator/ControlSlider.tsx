import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ControlSliderProps {
  label: string;
  labelAr: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  color: string;
  onChange: (value: number) => void;
}

export function ControlSlider({
  label,
  labelAr,
  value,
  min,
  max,
  step,
  unit,
  color,
  onChange,
}: ControlSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-foreground/90">{labelAr}</span>
          <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{label}</span>
        </div>
        <div
          className={cn(
            "font-mono text-sm font-bold px-2 py-0.5 rounded",
            "bg-muted/50 border border-border/50"
          )}
          style={{ color, textShadow: `0 0 10px ${color}40` }}
        >
          {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          <span className="text-[10px] text-muted-foreground ml-1">{unit}</span>
        </div>
      </div>
      
      {/* Progress bar background */}
      <div className="relative">
        <div className="absolute inset-0 h-2 bg-muted/30 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-150"
            style={{ 
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${color}40, ${color}80)`,
            }}
          />
        </div>
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={([v]) => onChange(v)}
          className="cursor-pointer relative z-10"
          style={{
            // @ts-ignore
            '--slider-color': color,
          }}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-[9px] text-muted-foreground/60 font-mono">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
