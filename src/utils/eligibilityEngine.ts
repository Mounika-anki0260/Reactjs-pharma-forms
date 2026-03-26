import { Patient, EligibilityResult as BaseEligibilityResult, MedicalHistoryItem } from '../types/clinical';

/**
 * Defines the comprehensive EligibilityResult structure after merging.
 * This combines the basic isEligible and reasons from Resource 1,
 * with inclusion/exclusion criteria and overall score from Resource 2.
 */
export interface EligibilityResult extends BaseEligibilityResult {
  isEligible: boolean;
  reasons: string[];
  inclusionCriteriaMet: boolean[];
  exclusionCriteriaTriggered: boolean[];
  overallScore: number;
}

/**
 * Interface for the input to the evaluateEligibility function, combining needs from both original resources.
 * This interface is derived from Resource 2 and used for clarity if `evaluateEligibility` was to accept a single object parameter.
 */
export interface EligibilityInput {
  patient: Patient | null;
  medicalHistory: MedicalHistoryItem[];
  labResults: Record<string, number>;
}

/**
 * Calculates age in years from a date of birth string.
 * This helper function is present and identical in both original resources.
 */
function calculateAge(dob: string): number {
  if (!dob) return 0;
  const d = new Date(dob);
  const diff = Date.now() - d.getTime();
  const ageDt = new Date(diff);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

/**
 * Evaluates patient eligibility for clinical trial enrollment by merging criteria
 * from two separate eligibility evaluation implementations.
 *
 * This function combines the criteria for inclusion and exclusion, and the return
 * structure, from both original resources.
 */
export const evaluateEligibility = (
  patient: Patient | null,
  medicalHistory: MedicalHistoryItem[] = [],
  labResults: Record<string, number> | null = null
): EligibilityResult => {
  const reasons: string[] = [];
  const inclusionCriteriaMet: boolean[] = [];
  const exclusionCriteriaTriggered: boolean[] = [];

  // --- Initial patient data check (from Resource 2) ---
  if (!patient) {
    return {
      isEligible: false,
      inclusionCriteriaMet: [],
      exclusionCriteriaTriggered: [],
      overallScore: 0,
      reasons: ['Patient data not available.'],
    };
  }

  // --- Age calculation (using the common helper function) ---
  const age = calculateAge(patient.dob);

  // --- Criteria merged from Resource 1 ---

  // Name completeness check
  if (!patient.firstName || !patient.lastName) {
    reasons.push('Name is incomplete.');
  }

  // Date of Birth presence check
  if (!patient.dob) {
    reasons.push('Date of birth is required.');
  }

  // Minimum age check
  if (age < 18) {
    reasons.push('Patient must be at least 18 years old.');
  }

  // Weight check
  if (patient.weightKg != null && patient.weightKg < 40) {
    reasons.push('Weight below 40 kg is not allowed.');
  }

  // Comorbidities check (using optional chaining for robustness)
  if (patient.comorbidities?.includes('severe_renal_impairment')) {
    reasons.push('Severe renal impairment is exclusionary.');
  }

  // Pregnancy status check for women of childbearing potential
  if (
    patient.sex === 'F' &&
    age >= 18 &&
    age <= 50 &&
    patient.pregnancyStatus !== 'negative'
  ) {
    reasons.push(
      'Women of childbearing potential must have negative pregnancy status.'
    );
  }

  // Baseline creatinine check (from Resource 1, using optional chaining for robustness)
  const baselineCreatinine = patient.baselineLabs?.creatinine;
  if (baselineCreatinine != null && baselineCreatinine > 2.0) {
    reasons.push('Creatinine above 2.0 mg/dL (baseline labs) is exclusionary.');
  }


  // --- Criteria merged from Resource 2 ---

  // Age range check (18-75)
  const ageEligibleR2 = age >= 18 && age <= 75;
  inclusionCriteriaMet.push(ageEligibleR2);
  if (!ageEligibleR2) {
    // This reason is added if age is outside 18-75. If age < 18, R1 already added a reason.
    // This handles the >75 case and provides a general message for R2's metric.
    if (age > 75) {
      reasons.push(`Age ${age} is above eligible range (max 75) (R2 criteria).`);
    } else if (age < 18) {
      // If R1's reason already covered <18, we can skip a redundant message here
      // or provide a different context specific to R2 metrics.
      // For this merged output, we will rely on R1's more specific message for <18.
      // If R1's check was removed, then this line would be `reasons.push(`Age ${age} is below eligible range (min 18) (R2 criteria).`);`
    }
  }


  // Patient consent status (assuming patient.status exists on the Patient interface)
  const hasConsent = patient.status !== 'withdrawn';
  inclusionCriteriaMet.push(hasConsent);
  if (!hasConsent) {
    reasons.push('Patient consent not obtained or withdrawn (R2 criteria).');
  }

  // Excluded medical conditions from medical history
  const excludedConditions = ['cancer', 'hiv', 'hepatitis', 'renal failure'];
  const hasExcludedCondition = medicalHistory.some((item) =>
    excludedConditions.some((condition) =>
      item.condition.toLowerCase().includes(condition)
    )
  );
  exclusionCriteriaTriggered.push(hasExcludedCondition);
  if (hasExcludedCondition) {
    reasons.push('Patient has excluded medical condition from history (R2 criteria).');
  }

  // Lab results from provided `labResults` parameter
  if (labResults) {
    const creatinineR2 = labResults['creatinine'] || 0;
    const creatinineExcluded = creatinineR2 > 2.0;
    exclusionCriteriaTriggered.push(creatinineExcluded);
    if (creatinineExcluded) {
      reasons.push(`Creatinine level ${creatinineR2} exceeds threshold (2.0) (labResults R2 criteria).`);
    }

    const alt = labResults['alt'] || 0;
    const altExcluded = alt > 100;
    exclusionCriteriaTriggered.push(altExcluded);
    if (altExcluded) {
      reasons.push(`ALT level ${alt} exceeds threshold (100) (R2 criteria).`);
    }
  }

  // --- Final Eligibility Determination (adapted from Resource 2) ---
  // A patient is eligible if ALL inclusion criteria are met, NO exclusion criteria are triggered,
  // AND no specific reasons were found by any check (from R1 or R2).
  const allInclusionMet = inclusionCriteriaMet.every((met) => met);
  const noExclusionTriggered = exclusionCriteriaTriggered.every((triggered) => !triggered);

  // The final eligibility status. If 'reasons' array is not empty, it implies ineligibility from any specific check.
  const finalIsEligible = reasons.length === 0 && allInclusionMet && noExclusionTriggered;

  // Calculate overall score (from Resource 2)
  const totalCriteria = inclusionCriteriaMet.length + exclusionCriteriaTriggered.length;
  const metCriteria =
    inclusionCriteriaMet.filter((met) => met).length +
    exclusionCriteriaTriggered.filter((triggered) => !triggered).length;
  const overallScore = totalCriteria > 0 ? (metCriteria / totalCriteria) * 100 : 0;

  return {
    isEligible: finalIsEligible,
    inclusionCriteriaMet,
    exclusionCriteriaTriggered,
    overallScore: Math.round(overallScore),
    reasons,
  };
};