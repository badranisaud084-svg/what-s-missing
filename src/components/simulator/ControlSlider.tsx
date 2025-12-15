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
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground/80">{labelAr}</span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <span
          className={cn(
            "font-display text-lg font-bold px-3 py-1 rounded-md",
            "bg-muted/50 border border-border/50"
          )}
          style={{ color }}
        >
          {value.toLocaleString()} {unit}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="cursor-pointer"
        style={{
          // @ts-ignore
          '--slider-color': color,
        }}
      />
    </div>
  );
}
