export interface DoseValidationResult {
  valid: boolean;
  message: string;
}

export interface DrugInteraction {
  med: string;
  severity: 'major' | 'moderate' | 'minor';
  description: string;
}

export interface DosageCalculationInput {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  renalFunction: number;
  hepaticFunction: 'normal' | 'mild' | 'moderate' | 'severe';
}

export interface DosageResult {
  bsa: number;
  standardDose: number;
  adjustedDose: number;
  adjustmentFactors: string[];
  warnings: string[];
}

export function calculateDosePerKg(
  weightKg: number | null | undefined,
  dosePerKg: number | null | undefined
): number | null {
  if (!weightKg || !dosePerKg) return null;
  return weightKg * dosePerKg;
}

export function validateDose(
  totalDose: number | null | undefined,
  maxDose: number | null | undefined
): DoseValidationResult {
  if (totalDose == null || maxDose == null) {
    return { valid: false, message: 'Dose not specified.' };
  }
  if (totalDose > maxDose) {
    return {
      valid: false,
      message: `Total dose ${totalDose} exceeds max allowed ${maxDose}.`
    };
  }
  return { valid: true, message: '' };
}

export function mockInteractionCheck(
  drug: string | null | undefined,
  concomitantMeds: string[] | null | undefined
): DrugInteraction[] {
  if (!drug || !concomitantMeds || concomitantMeds.length === 0) {
    return [];
  }
  const interactions: DrugInteraction[] = [];
  concomitantMeds.forEach((m: string) => {
    if (m.toLowerCase().includes('azole')) {
      interactions.push({
        med: m,
        severity: 'major',
        description: `Strong CYP inhibitor may increase ${drug} exposure.`
      });
    }
    if (m.toLowerCase().includes('statin')) {
      interactions.push({
        med: m,
        severity: 'moderate',
        description: `Potential myopathy risk when combined with ${drug}.`
      });
    }
  });
  return interactions;
}

export const calculateBSA = (weight: number, height: number): number => {
  if (weight <= 0 || height <= 0) return 0;
  const bsa = Math.sqrt((weight * height) / 3600);
  return Math.round(bsa * 100) / 100;
};

export const calculateCreatinineClearance = (
  age: number,
  weight: number,
  creatinine: number,
  gender: 'male' | 'female' | 'other'
): number => {
  if (creatinine <= 0) return 0;
  const genderFactor = gender === 'female' ? 0.85 : 1;
  const crcl = ((140 - age) * weight * genderFactor) / (72 * creatinine);
  return Math.round(crcl * 10) / 10;
};

export const calculateDosage = (
  input: DosageCalculationInput,
  baseDosePerBSA: number
): DosageResult => {
  const bsa = calculateBSA(input.weight, input.height);
  const standardDose = Math.round(bsa * baseDosePerBSA);

  let adjustedDose = standardDose;
  const adjustmentFactors: string[] = [];
  const warnings: string[] = [];

  if (input.renalFunction < 60) {
    const renalAdjustment = input.renalFunction < 30 ? 0.5 : 0.75;
    adjustedDose = Math.round(adjustedDose * renalAdjustment);
    adjustmentFactors.push(`Renal adjustment: ${renalAdjustment * 100}%`);
    if (input.renalFunction < 30) {
      warnings.push('Severe renal impairment - close monitoring required');
    }
  }

  const hepaticAdjustments: Record<string, number> = {
    normal: 1,
    mild: 0.9,
    moderate: 0.75,
    severe: 0.5,
  };
  const hepaticFactor = hepaticAdjustments[input.hepaticFunction];
  if (hepaticFactor < 1) {
    adjustedDose = Math.round(adjustedDose * hepaticFactor);
    adjustmentFactors.push(`Hepatic adjustment: ${hepaticFactor * 100}%`);
    if (input.hepaticFunction === 'severe') {
      warnings.push('Severe hepatic impairment - consider alternative therapy');
    }
  }

  if (input.age > 65) {
    const ageAdjustment = input.age > 75 ? 0.8 : 0.9;
    adjustedDose = Math.round(adjustedDose * ageAdjustment);
    adjustmentFactors.push(`Age adjustment: ${ageAdjustment * 100}%`);
  }

  if (bsa < 1.5) {
    warnings.push('Low BSA - verify dose calculation');
  } else if (bsa > 2.5) {
    warnings.push('High BSA - consider dose capping');
  }

  return {
    bsa,
    standardDose,
    adjustedDose,
    adjustmentFactors,
    warnings,
  };
};

export const validateDoseRange = (
  dose: number,
  minDose: number,
  maxDose: number
): DoseValidationResult => {
  if (dose < minDose) {
    return {
      valid: false,
      message: `Dose ${dose}mg is below minimum threshold (${minDose}mg)`,
    };
  }
  if (dose > maxDose) {
    return {
      valid: false,
      message: `Dose ${dose}mg exceeds maximum threshold (${maxDose}mg)`,
    };
  }
  return { valid: true, message: 'Dose within acceptable range' };
};