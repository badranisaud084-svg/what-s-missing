import { cn } from "@/lib/utils";
import { TraverseResult, IPRData } from "@/lib/pressureCalculations";

interface DataPanelProps {
  traverseResult: TraverseResult;
  iprData: IPRData;
  params: {
    reservoirPressure: number;
    waterCut: number;
    oilAPI: number;
    tubingID: number;
    productionRate: number;
  };
}

export function DataPanel({ traverseResult, iprData, params }: DataPanelProps) {
  const dataRows = [
    { label: 'Pr', labelAr: 'ضغط المكمن', value: params.reservoirPressure, unit: 'psi', color: 'text-primary' },
    { label: 'Pwf', labelAr: 'ضغط القاع', value: traverseResult.pwf, unit: 'psi', color: 'text-secondary' },
    { label: 'WHP', labelAr: 'ضغط الرأس', value: traverseResult.whp, unit: 'psi', color: traverseResult.whp > 0 ? 'text-success' : 'text-destructive' },
    { label: 'Δp', labelAr: 'فرق الضغط', value: params.reservoirPressure - traverseResult.pwf, unit: 'psi', color: 'text-accent' },
    { label: 'v', labelAr: 'السرعة', value: traverseResult.velocity, unit: 'ft/s', color: traverseResult.velocity > 15 ? 'text-warning' : 'text-foreground' },
    { label: 'AOF', labelAr: 'التدفق المطلق', value: iprData.aofVogel, unit: 'STB/D', color: 'text-success' },
  ];

  return (
    <div className="glass-panel p-4">
      <h3 className="font-display text-sm font-bold text-primary/80 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        بيانات التشغيل
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        {dataRows.map((row) => (
          <div 
            key={row.label}
            className="flex items-center justify-between bg-muted/30 rounded px-2 py-1.5 border border-border/30"
          >
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground">{row.labelAr}</span>
              <span className="text-xs text-muted-foreground/70">{row.label}</span>
            </div>
            <span className={cn("font-display text-sm font-bold", row.color)}>
              {typeof row.value === 'number' ? row.value.toFixed(row.unit === 'ft/s' ? 2 : 0) : row.value}
              <span className="text-[10px] text-muted-foreground ml-1">{row.unit}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Performance ratio */}
      <div className="mt-3 pt-3 border-t border-border/30">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">كفاءة التشغيل</span>
          <span className="font-display font-bold text-primary">
            {((params.productionRate / iprData.aofVogel) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-success via-warning to-destructive transition-all duration-500"
            style={{ width: `${Math.min(100, (params.productionRate / iprData.aofVogel) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
