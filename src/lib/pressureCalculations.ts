// Physical constants
const STB_TO_FT3 = 5.615;
const SECONDS_PER_DAY = 86400;
const FRICTION_CONSTANT = 2.5e-6;
const PI = 5.0; // Productivity Index
const WATER_GRADIENT = 0.433; // psi/ft

export interface SimulatorParams {
  reservoirPressure: number; // psi
  waterCut: number; // 0-1
  oilAPI: number;
  tubingID: number; // inches
  productionRate: number; // STB/D
  depth?: number;
}

export interface TraverseResult {
  depthArray: number[];
  pressureArray: number[];
  pwf: number;
  whp: number;
  velocity: number;
  status: 'OPTIMAL' | 'EROSION' | 'DEAD';
  statusMessage: string;
  fluidSG: number;
}

export function apiToSpecificGravity(api: number): number {
  return 141.5 / (131.5 + api);
}

export function calculateDynamicGradient(
  pressure: number,
  pRes: number,
  waterCut: number,
  oilSG: number
): { gradient: number; fluidSG: number } {
  const waterSG = 1.0;
  const mixtureSG = oilSG * (1 - waterCut) + waterSG * waterCut;

  // Gas expansion factor
  const pressureRatio = Math.max(0.01, Math.min(1.0, pressure / pRes));
  const gasExpansionFactor = 1.0 / (0.2 + 0.8 * Math.pow(pressureRatio, 0.6));

  const finalSG = mixtureSG * gasExpansionFactor;
  const pressureGradient = finalSG * WATER_GRADIENT;

  return { gradient: pressureGradient, fluidSG: finalSG };
}

export function calculateTraverse(params: SimulatorParams): TraverseResult {
  const {
    reservoirPressure: pRes,
    waterCut: wc,
    oilAPI: api,
    tubingID: tid,
    productionRate: rate,
    depth = 8000,
  } = params;

  const nPoints = 100;
  const oilSG = apiToSpecificGravity(api);

  // Initialize arrays
  const depthArray: number[] = [];
  const pressureArray: number[] = [];

  for (let i = 0; i < nPoints; i++) {
    depthArray.push(depth - (i * depth) / (nPoints - 1));
  }

  // Bottom-hole conditions
  const pwf = pRes - rate / PI;
  pressureArray[0] = pwf;

  // Friction gradient
  const frictionGrad = tid > 0 ? FRICTION_CONSTANT * Math.pow(rate, 1.8) / Math.pow(tid, 4.8) : 0;

  // Fluid velocity
  const qFt3s = (rate * STB_TO_FT3) / SECONDS_PER_DAY;
  const areaFt2 = Math.PI * Math.pow(tid / 24, 2);
  const velocity = areaFt2 > 0 ? qFt3s / areaFt2 : 0;

  // Pressure profile calculation
  for (let i = 1; i < nPoints; i++) {
    const segmentLength = depthArray[i - 1] - depthArray[i];
    const { gradient: hydroGrad } = calculateDynamicGradient(pressureArray[i - 1], pRes, wc, oilSG);
    const totalGrad = hydroGrad + frictionGrad;
    pressureArray[i] = pressureArray[i - 1] - totalGrad * segmentLength;
  }

  const whp = pressureArray[nPoints - 1];
  const { status, statusMessage } = getStatus(whp, velocity);
  const { fluidSG } = calculateDynamicGradient(whp, pRes, wc, oilSG);

  return {
    depthArray,
    pressureArray,
    pwf,
    whp,
    velocity,
    status,
    statusMessage,
    fluidSG,
  };
}

function getStatus(whp: number, velocity: number): { status: 'OPTIMAL' | 'EROSION' | 'DEAD'; statusMessage: string } {
  if (whp <= 0) {
    return { status: 'DEAD', statusMessage: 'النظام غير قادر على الرفع - يحتاج رفع صناعي' };
  }
  if (velocity > 15) {
    return { status: 'EROSION', statusMessage: 'سرعة حرجة - خطر تآكل المعدات' };
  }
  return { status: 'OPTIMAL', statusMessage: 'يعمل ضمن الحدود التصميمية' };
}

export function getFluidColor(waterCut: number, fluidSG: number): string {
  // Oil: dark green, Water: blue, Gas: red tint
  const oilColor = { r: 26, g: 89, b: 26 };
  const waterColor = { r: 51, g: 128, b: 242 };
  const gasColor = { r: 230, g: 77, b: 77 };

  // Mix oil and water based on water cut
  const mixedR = oilColor.r * (1 - waterCut) + waterColor.r * waterCut;
  const mixedG = oilColor.g * (1 - waterCut) + waterColor.g * waterCut;
  const mixedB = oilColor.b * (1 - waterCut) + waterColor.b * waterCut;

  // Gas effect based on fluid SG
  const gasFraction = Math.max(0, Math.min(1, (1 - fluidSG) * 1.5));
  const finalR = Math.round((1 - gasFraction) * mixedR + gasFraction * gasColor.r);
  const finalG = Math.round((1 - gasFraction) * mixedG + gasFraction * gasColor.g);
  const finalB = Math.round((1 - gasFraction) * mixedB + gasFraction * gasColor.b);

  return `rgb(${finalR}, ${finalG}, ${finalB})`;
}
