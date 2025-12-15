import { useState, useMemo } from "react";
import { ControlSlider } from "./ControlSlider";
import { HUDDisplay } from "./HUDDisplay";
import { PressureChart } from "./PressureChart";
import { WellboreSchematic } from "./WellboreSchematic";
import { IPRChart } from "./IPRChart";
import { DataPanel } from "./DataPanel";
import { calculateTraverse, calculateIPR, SimulatorParams } from "@/lib/pressureCalculations";
import { Gauge, Activity, BarChart3 } from "lucide-react";

const SLIDER_CONFIG = [
  {
    key: 'reservoirPressure',
    label: 'Reservoir Pressure',
    labelAr: 'ضغط المكمن',
    min: 1000,
    max: 6000,
    step: 50,
    unit: 'psi',
    color: '#fbbf24',
    default: 3500,
  },
  {
    key: 'waterCut',
    label: 'Water Cut',
    labelAr: 'نسبة الماء',
    min: 0,
    max: 100,
    step: 1,
    unit: '%',
    color: '#3b82f6',
    default: 15,
  },
  {
    key: 'oilAPI',
    label: 'Oil API',
    labelAr: 'كثافة النفط',
    min: 10,
    max: 50,
    step: 1,
    unit: '°API',
    color: '#22c55e',
    default: 32,
  },
  {
    key: 'tubingID',
    label: 'Tubing ID',
    labelAr: 'قطر الأنابيب',
    min: 1.5,
    max: 4.5,
    step: 0.1,
    unit: 'in',
    color: '#ef4444',
    default: 2.875,
  },
  {
    key: 'productionRate',
    label: 'Production Rate',
    labelAr: 'معدل الإنتاج',
    min: 100,
    max: 5000,
    step: 50,
    unit: 'STB/D',
    color: '#a855f7',
    default: 800,
  },
] as const;

export function PressureSimulator() {
  const [params, setParams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    SLIDER_CONFIG.forEach((config) => {
      initial[config.key] = config.default;
    });
    return initial;
  });

  const simulatorParams: SimulatorParams = useMemo(() => ({
    reservoirPressure: params.reservoirPressure,
    waterCut: params.waterCut / 100,
    oilAPI: params.oilAPI,
    tubingID: params.tubingID,
    productionRate: params.productionRate,
  }), [params]);

  const traverseResult = useMemo(() => calculateTraverse(simulatorParams), [simulatorParams]);
  const iprData = useMemo(() => calculateIPR(simulatorParams), [simulatorParams]);

  const chartData = useMemo(() => {
    return traverseResult.depthArray.map((depth, i) => ({
      depth,
      pressure: traverseResult.pressureArray[i],
    }));
  }, [traverseResult]);

  const handleParamChange = (key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background engineering-grid p-3 md:p-4 relative">
      {/* Scanline effect */}
      <div className="scanline" />
      
      {/* Header */}
      <header className="text-center mb-4 animate-fade-in relative z-10">
        <div className="flex items-center justify-center gap-3 mb-1">
          <div className="relative">
            <Gauge className="w-8 h-8 text-primary" />
            <div className="absolute inset-0 w-8 h-8 text-primary blur-md opacity-50">
              <Gauge className="w-8 h-8" />
            </div>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-black tracking-wider glow-text">
            PRESSURE TRAVERSE SIMULATOR
          </h1>
        </div>
        <p className="text-muted-foreground text-sm font-mono tracking-wide">
          محاكي ضغط الآبار النفطية | IPR Analysis System
        </p>
      </header>

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-3 space-y-4">
          <div 
            className="glass-panel p-4 animate-fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            <h2 className="font-display text-sm font-bold text-primary flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
              <Activity className="w-4 h-4" />
              <span className="tracking-wider">PARAMETERS</span>
            </h2>
            
            <div className="space-y-4">
              {SLIDER_CONFIG.map((config) => (
                <ControlSlider
                  key={config.key}
                  label={config.label}
                  labelAr={config.labelAr}
                  value={params[config.key]}
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  unit={config.unit}
                  color={config.color}
                  onChange={(v) => handleParamChange(config.key, v)}
                />
              ))}
            </div>
          </div>

          {/* Data Panel */}
          <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <DataPanel 
              traverseResult={traverseResult}
              iprData={iprData}
              params={params as any}
            />
          </div>
        </div>

        {/* Main Display Area */}
        <div className="lg:col-span-9 space-y-4">
          {/* HUD */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <HUDDisplay
              velocity={traverseResult.velocity}
              status={traverseResult.status}
              statusMessage={traverseResult.statusMessage}
              whp={traverseResult.whp}
              pwf={traverseResult.pwf}
              aof={iprData.aofVogel}
              productionRate={params.productionRate}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Pressure Traverse Chart */}
            <div 
              className="glass-panel p-4 animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              <h3 className="font-display text-xs font-bold text-foreground/80 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-secondary" />
                <span className="tracking-wider">PRESSURE TRAVERSE</span>
              </h3>
              <PressureChart
                data={chartData}
                reservoirPressure={params.reservoirPressure}
                pwf={traverseResult.pwf}
                status={traverseResult.status}
              />
            </div>

            {/* IPR Chart */}
            <div 
              className="glass-panel p-4 animate-fade-in"
              style={{ animationDelay: '0.35s' }}
            >
              <h3 className="font-display text-xs font-bold text-foreground/80 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-success" />
                <span className="tracking-wider">IPR CURVES</span>
                <span className="text-[10px] text-muted-foreground font-normal">(Vogel & Fetkovich)</span>
              </h3>
              <IPRChart data={iprData} />
            </div>

            {/* Wellbore Schematic */}
            <div 
              className="glass-panel p-4 animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              <h3 className="font-display text-xs font-bold text-foreground/80 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="tracking-wider">WELLBORE SCHEMATIC</span>
              </h3>
              <WellboreSchematic
                waterCut={params.waterCut / 100}
                fluidSG={traverseResult.fluidSG}
                status={traverseResult.status}
                tubingID={params.tubingID}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-4 text-muted-foreground text-xs font-mono relative z-10">
        <p className="tracking-wider">PETROLEUM ENGINEERING SIMULATOR v2.0 | Vogel & Fetkovich IPR Models</p>
      </footer>
    </div>
  );
}
