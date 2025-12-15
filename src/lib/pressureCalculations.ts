// Physical constants
const STB_TO_FT3 = 5.615;
const SECONDS_PER_DAY = 86400;
const FRICTION_CONSTANT = 2.5e-6;
const WATER_GRADIENT = 0.433; // psi/ft

export interface SimulatorParams {
  reservoirPressure: number; // psi
  waterCut: number; // 0-1
  oilAPI: number;
  tubingID: number; // inches
  productionRate: number; // STB/D
  depth?: number;
  bubblePointPressure?: number; // psi
  productivityIndex?: number; // STB/D/psi
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

export interface IPRData {
  vogelCurve: { pwf: number; rate: number }[];
  fetkovichCurve: { pwf: number; rate: number }[];
  operatingPoint: { pwf: number; rate: number };
  aofVogel: number; // Absolute Open Flow
  aofFetkovich: number;
  qmax: number;
  reservoirPressure: number;
}

// ============ IPR CALCULATIONS ============

/**
 * Vogel's IPR Equation (1968)
 * For solution-gas-drive reservoirs below bubble point
 * q/qmax = 1 - 0.2*(Pwf/Pr) - 0.8*(Pwf/Pr)²
 */
export function calculateVogelIPR(
  reservoirPressure: number,
  productivityIndex: number,
  bubblePointPressure: number,
  nPoints: number = 50
): { curve: { pwf: number; rate: number }[]; aof: number } {
  const curve: { pwf: number; rate: number }[] = [];
  
  // Calculate qmax at Pwf = 0 (AOF - Absolute Open Flow)
  // Using composite IPR if Pr > Pb
  const pb = Math.min(bubblePointPressure, reservoirPressure);
  
  // Flow rate at bubble point
  const qb = productivityIndex * (reservoirPressure - pb);
  
  // Maximum rate at Pwf = 0 using Vogel below bubble point
  // qmax = qb + (J * Pb) / 1.8
  const qmax = qb + (productivityIndex * pb) / 1.8;
  
  for (let i = 0; i <= nPoints; i++) {
    const pwf = (reservoirPressure * i) / nPoints;
    let rate: number;
    
    if (pwf >= pb) {
      // Above bubble point - linear (undersaturated)
      rate = productivityIndex * (reservoirPressure - pwf);
    } else {
      // Below bubble point - Vogel equation
      const vogelPart = 1 - 0.2 * (pwf / pb) - 0.8 * Math.pow(pwf / pb, 2);
      rate = qb + ((productivityIndex * pb) / 1.8) * vogelPart;
    }
    
    curve.push({ pwf, rate: Math.max(0, rate) });
  }
  
  return { curve, aof: qmax };
}

/**
 * Fetkovich's IPR Equation (1973)
 * Empirical correlation for gas and high GOR wells
 * q = C * (Pr² - Pwf²)^n
 * where n typically ranges from 0.5 to 1.0
 */
export function calculateFetkovichIPR(
  reservoirPressure: number,
  productivityIndex: number,
  n: number = 0.8, // Flow exponent (0.5-1.0)
  nPoints: number = 50
): { curve: { pwf: number; rate: number }[]; aof: number } {
  const curve: { pwf: number; rate: number }[] = [];
  
  // Calculate C from PI at reservoir conditions
  // At small drawdown: q ≈ J * (Pr - Pwf) ≈ C * 2 * Pr * (Pr - Pwf)^n
  // So C ≈ J / (2 * Pr * (Pr)^(n-1))
  const C = productivityIndex / (2 * reservoirPressure * Math.pow(reservoirPressure, n - 1));
  
  // AOF at Pwf = 0
  const aof = C * Math.pow(reservoirPressure * reservoirPressure, n);
  
  for (let i = 0; i <= nPoints; i++) {
    const pwf = (reservoirPressure * i) / nPoints;
    const deltaP2 = Math.pow(reservoirPressure, 2) - Math.pow(pwf, 2);
    const rate = C * Math.pow(Math.max(0, deltaP2), n);
    
    curve.push({ pwf, rate: Math.max(0, rate) });
  }
  
  return { curve, aof };
}

/**
 * Calculate complete IPR data
 */
export function calculateIPR(params: SimulatorParams): IPRData {
  const {
    reservoirPressure,
    productivityIndex = 5.0,
    bubblePointPressure = reservoirPressure * 0.7,
    productionRate,
  } = params;
  
  const vogel = calculateVogelIPR(reservoirPressure, productivityIndex, bubblePointPressure);
  const fetkovich = calculateFetkovichIPR(reservoirPressure, productivityIndex);
  
  // Calculate operating point Pwf from production rate
  const pwf = reservoirPressure - productionRate / productivityIndex;
  
  return {
    vogelCurve: vogel.curve,
    fetkovichCurve: fetkovich.curve,
    operatingPoint: { pwf: Math.max(0, pwf), rate: productionRate },
    aofVogel: vogel.aof,
    aofFetkovich: fetkovich.aof,
    qmax: Math.max(vogel.aof, fetkovich.aof),
    reservoirPressure,
  };
}

// ============ ORIGINAL FUNCTIONS ============

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
    productivityIndex = 5.0,
  } = params;

  const nPoints = 100;
  const oilSG = apiToSpecificGravity(api);

  // Initialize arrays
  const depthArray: number[] = [];
  const pressureArray: number[] = [];

  for (let i = 0; i < nPoints; i++) {
    depthArray.push(depth - (i * depth) / (nPoints - 1));
  }

  // Bottom-hole conditions using PI
  const pwf = pRes - rate / productivityIndex;
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
