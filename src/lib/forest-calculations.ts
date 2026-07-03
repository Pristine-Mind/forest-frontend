/**
 * Forest Management Calculation Utilities
 * Based on API documentation specifications
 */

export interface TreeVolumeMetrics {
  girthCm: number;
  heightM: number;
  treeClass: "i" | "ii" | "iii";
}

export interface CalculatedVolumes {
  basalAreaSqm: number;
  stemVolumeCubicM: number;
  rFactor: number;
  branchVolumeCubicM: number;
  totalVolumeCubicM: number;
  rLessThan10: number;
  volumeLessThan10CubicM: number;
  grossVolumeCubicM: number;
  netVolumeCubicM: number;
  fuelwoodVolumeCubicM: number;
}

/**
 * Calculate basal area from girth (circumference)
 * Formula: Basal Area = π × (DBH/2)²
 * where DBH (Diameter at Breast Height) = Girth / π
 */
export function calculateBasalArea(girthCm: number): number {
  const pi = Math.PI;
  const dbh = girthCm / pi;
  const dbhM = dbh / 100; // Convert to meters
  const basalArea = pi * Math.pow(dbhM / 2, 2);
  return Math.round(basalArea * 10000) / 10000; // 4 decimal places
}

/**
 * Get R factor based on tree class
 * Class I: 0.00
 * Class II: 0.15
 * Class III: 0.30
 */
export function getRFactor(treeClass: "i" | "ii" | "iii"): number {
  const rFactors: Record<"i" | "ii" | "iii", number> = {
    i: 0.0,
    ii: 0.15,
    iii: 0.3,
  };
  return rFactors[treeClass];
}

/**
 * Calculate stem volume
 * Formula: Stem Volume = Basal Area × Height × Form Factor (0.45)
 */
export function calculateStemVolume(basalAreaSqm: number, heightM: number, formFactor = 0.45): number {
  const stemVolume = basalAreaSqm * heightM * formFactor;
  return Math.round(stemVolume * 10000) / 10000;
}

/**
 * Calculate branch volume
 * Formula: Branch Volume = Stem Volume × R Factor
 */
export function calculateBranchVolume(stemVolumeCubicM: number, rFactor: number): number {
  const branchVolume = stemVolumeCubicM * rFactor;
  return Math.round(branchVolume * 10000) / 10000;
}

/**
 * Calculate gross volume (with bark loss)
 * Formula: Gross Volume = Total Volume × 0.95 (5% bark loss)
 */
export function calculateGrossVolume(totalVolumeCubicM: number): number {
  const grossVolume = totalVolumeCubicM * 0.95;
  return Math.round(grossVolume * 10000) / 10000;
}

/**
 * Calculate net volume (with waste factor)
 * Formula: Net Volume = Gross × 0.80 (20% waste)
 */
export function calculateNetVolume(grossVolumeCubicM: number): number {
  const netVolume = grossVolumeCubicM * 0.8;
  return Math.round(netVolume * 10000) / 10000;
}

/**
 * Calculate fuelwood volume
 * Formula: Fuelwood = Gross × 0.35
 */
export function calculateFuelwoodVolume(grossVolumeCubicM: number): number {
  const fuelwood = grossVolumeCubicM * 0.35;
  return Math.round(fuelwood * 10000) / 10000;
}

/**
 * Complete volume calculation for a tree
 */
export function calculateTreeVolumes(metrics: TreeVolumeMetrics): CalculatedVolumes {
  const basalArea = calculateBasalArea(metrics.girthCm);
  const stemVolume = calculateStemVolume(basalArea, metrics.heightM);
  const rFactor = getRFactor(metrics.treeClass);
  const branchVolume = calculateBranchVolume(stemVolume, rFactor);
  const totalVolume = stemVolume + branchVolume;
  const grossVolume = calculateGrossVolume(totalVolume);
  const netVolume = calculateNetVolume(grossVolume);
  const fuelwood = calculateFuelwoodVolume(grossVolume);

  return {
    basalAreaSqm: basalArea,
    stemVolumeCubicM: stemVolume,
    rFactor,
    branchVolumeCubicM: branchVolume,
    totalVolumeCubicM: totalVolume,
    rLessThan10: 0, // Placeholder - specific for small diameter trees
    volumeLessThan10CubicM: 0, // Placeholder
    grossVolumeCubicM: grossVolume,
    netVolumeCubicM: netVolume,
    fuelwoodVolumeCubicM: fuelwood,
  };
}

/**
 * Validate tree measurements
 */
export function validateTreeMeasurements(girth: number, height: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (girth <= 0 || girth > 500) {
    errors.push("Girth must be between 0 and 500 cm");
  }

  if (height <= 0 || height > 100) {
    errors.push("Height must be between 0 and 100 meters");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format volume value to 3 decimal places (cubic meters)
 */
export function formatVolume(value: number): string {
  return (Math.round(value * 1000) / 1000).toFixed(3);
}

/**
 * Format measurement value
 */
export function formatMeasurement(value: number, decimals: number = 1): string {
  return (Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)).toFixed(decimals);
}

/**
 * Calculate total volume from multiple trees
 */
export function calculateTotalVolumes(trees: CalculatedVolumes[]): CalculatedVolumes {
  return {
    basalAreaSqm: Math.round(trees.reduce((sum, t) => sum + t.basalAreaSqm, 0) * 10000) / 10000,
    stemVolumeCubicM: Math.round(trees.reduce((sum, t) => sum + t.stemVolumeCubicM, 0) * 10000) / 10000,
    rFactor: 0,
    branchVolumeCubicM: Math.round(trees.reduce((sum, t) => sum + t.branchVolumeCubicM, 0) * 10000) / 10000,
    totalVolumeCubicM: Math.round(trees.reduce((sum, t) => sum + t.totalVolumeCubicM, 0) * 10000) / 10000,
    rLessThan10: 0,
    volumeLessThan10CubicM: Math.round(trees.reduce((sum, t) => sum + t.volumeLessThan10CubicM, 0) * 10000) / 10000,
    grossVolumeCubicM: Math.round(trees.reduce((sum, t) => sum + t.grossVolumeCubicM, 0) * 10000) / 10000,
    netVolumeCubicM: Math.round(trees.reduce((sum, t) => sum + t.netVolumeCubicM, 0) * 10000) / 10000,
    fuelwoodVolumeCubicM: Math.round(trees.reduce((sum, t) => sum + t.fuelwoodVolumeCubicM, 0) * 10000) / 10000,
  };
}
