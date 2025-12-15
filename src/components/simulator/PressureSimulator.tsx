import { useState, useMemo } from "react";
import { ControlSlider } from "./ControlSlider";
import { HUDDisplay } from "./HUDDisplay";
import { PressureChart } from "./PressureChart";
import { WellboreSchematic } from "./WellboreSchematic";
import { calculateTraverse, SimulatorParams } from "@/lib/pressureCalculations";
import { Gauge } from "lucide-react";

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
    default: 3000,
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
    default: 20,
  },
  {
    key: 'oilAPI',
    label: 'Oil API',
    labelAr: 'كثافة النفط API',
    min: 10,
    max: 50,
    step: 1,
    unit: '°',
    color: '#22c55e',
    default: 30,
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
    default: 2.5,
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
    default: 1000,
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

  const result = useMemo(() => calculateTraverse(simulatorParams), [simulatorParams]);

  const chartData = useMemo(() => {
    return result.depthArray.map((depth, i) => ({
      depth,
      pressure: result.pressureArray[i],
    }));
  }, [result]);

  const handleParamChange = (key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <header className="text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Gauge className="w-10 h-10 text-primary" />
          <h1 className="font-display text-3xl md:text-4xl font-bold glow-text">
            محاكي ضغط الآبار
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Pressure Traverse Simulator
        </p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div 
          className="glass-panel p-6 space-y-6 lg:col-span-1 animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        >
          <h2 className="font-display text-xl font-bold text-primary border-b border-border/50 pb-2">
            عناصر التحكم
          </h2>
          
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

        {/* Main Display Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* HUD */}
          <div 
            className="animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            <HUDDisplay
              velocity={result.velocity}
              status={result.status}
              statusMessage={result.statusMessage}
              whp={result.whp}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Pressure Chart */}
            <div 
              className="glass-panel p-4 animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              <h3 className="font-display text-lg font-bold text-foreground/90 mb-4 text-center">
                منحنى الضغط
              </h3>
              <PressureChart
                data={chartData}
                reservoirPressure={params.reservoirPressure}
                pwf={result.pwf}
                status={result.status}
              />
            </div>

            {/* Wellbore Schematic */}
            <div 
              className="glass-panel p-4 animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              <h3 className="font-display text-lg font-bold text-foreground/90 mb-4 text-center">
                مقطع البئر
              </h3>
              <WellboreSchematic
                waterCut={params.waterCut / 100}
                fluidSG={result.fluidSG}
                status={result.status}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-8 text-muted-foreground text-sm">
        <p>محاكي فيزيائي تفاعلي لتحليل ضغط الآبار النفطية</p>
      </footer>
    </div>
  );
}
