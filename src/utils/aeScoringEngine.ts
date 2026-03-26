import { AdverseEvent } from '../types/clinical';

/**
 * Adverse Event Scoring Engine
 * Clinical utility for grading severity, calculating causality, and determining seriousness
 */

/**
 * Unified input interface for adverse event assessment,
 * combining properties from AdverseEventInput (Resource 1) and AdverseEventForm (Resource 2).
 */
export interface AdverseEventUnifiedInput {
  id?: string;
  term?: string;
  startDate?: string;
  outcome?: 'death' | 'hospitalization' | 'disability' | 'congenital_anomaly' | 'life_threatening' | 'other' | string | null;
  impactOnDose?: 'none' | 'reduction' | 'interruption' | 'permanent_discontinuation' | string | null;
  temporalRelation?: 'plausible' | 'not_plausible' | 'unknown' | string | null;
  dechallenge?: 'improved' | 'not_improved' | 'not_applicable' | string | null;
  rechallenge?: 'recurred' | 'did_not_recur' | 'not_applicable' | string | null;
  alternativeCauses?: 'unlikely' | 'possible' | 'likely' | string | null;
  drugLevel?: 'toxic' | 'therapeutic' | 'subtherapeutic' | 'unknown' | string | null;
}

/**
 * Result interface for severity grading, from Resource 1.
 */
export interface SeverityGradeResult {
  grade: 1 | 2 | 3 | 4 | 5;
  label: 'Mild' | 'Moderate' | 'Severe' | 'Life-threatening or disabling' | 'Death';
}

/**
 * Result interface for causality scoring, from Resource 1.
 */
export interface CausalityScoreResult {
  score: number;
  category: 'unlikely' | 'possible' | 'probable';
}

/**
 * Detailed causality score breakdown, from Resource 2.
 */
export interface CausalityScore {
  temporalScore: number;
  dechallengeScore: number;
  rechallengeScore: number;
  alternativeCausesScore: number;
  totalScore: number;
  causalityLevel: 'unrelated' | 'unlikely' | 'possible' | 'probable' | 'definite';
}

/**
 * Detailed severity assessment, from Resource 2.
 */
export interface SeverityAssessment {
  grade: 1 | 2 | 3 | 4 | 5;
  description: string;
  requiresAction: boolean;
}

/**
 * Grades the severity of an adverse event based on CTCAE-like criteria.
 * Merged from Resource 1 and Resource 2 implementations with a unified input type.
 * @param ae - The adverse event input to grade.
 * @returns SeverityGradeResult with grade (1-5) and descriptive label.
 */
export function gradeSeverity(ae: Partial<AdverseEventUnifiedInput> | null | undefined): SeverityGradeResult {
  if (!ae || !ae.outcome || !ae.impactOnDose) {
    return { grade: 1, label: 'Mild' };
  }

  if (ae.outcome === 'death') {
    return { grade: 5, label: 'Death' };
  }

  if (ae.impactOnDose === 'permanent_discontinuation') {
    return { grade: 4, label: 'Life-threatening or disabling' };
  }

  if (ae.impactOnDose === 'interruption') {
    return { grade: 3, label: 'Severe' };
  }

  if (ae.impactOnDose === 'reduction') {
    return { grade: 2, label: 'Moderate' };
  }

  return { grade: 1, label: 'Mild' };
}

/**
 * Calculates causality score using Naranjo-like algorithm.
 * Merged from Resource 1 and Resource 2 implementations with a unified input type.
 * @param ae - The adverse event input to assess.
 * @returns CausalityScoreResult with numeric score and category classification.
 */
export function calculateCausalityScore(ae: Partial<AdverseEventUnifiedInput> | null): CausalityScoreResult {
  let score = 0;

  // Added null check from Resource 2's implementation.
  if (!ae) {
    return { score: 0, category: 'unlikely' };
  }

  if (ae.temporalRelation === 'plausible') score += 2;
  if (ae.dechallenge === 'improved') score += 2;
  if (ae.rechallenge === 'recurred') score += 3;
  if (ae.alternativeCauses === 'unlikely') score += 2;
  if (ae.drugLevel === 'toxic') score += 1;

  let category: CausalityScoreResult['category'] = 'unlikely';
  if (score >= 7) {
    category = 'probable';
  } else if (score >= 4) {
    category = 'possible';
  }

  return { score, category };
}

/**
 * Determines if an adverse event meets criteria for "serious" classification
 * per ICH E2A guidelines. Merged from Resource 1 and Resource 2 implementations.
 * @param ae - The adverse event input to evaluate.
 * @param severityGrade - The CTCAE grade (1-5).
 * @returns boolean indicating if event is serious.
 */
export function isSerious(
  ae: Partial<AdverseEventUnifiedInput> | null | undefined,
  severityGrade: number
): boolean {
  if (!ae) return false;
  if (severityGrade >= 4) return true;
  if (ae.outcome === 'death' || ae.outcome === 'hospitalization') return true;
  return false;
}

/**
 * Calculates a detailed causality score from individual parameters.
 * From Resource 2.
 */
export const calculateCausalityScoreFromParams = (
  temporalRelationship: string,
  dechallenge: string,
  rechallenge: string,
  alternativeCauses: string
): CausalityScore => {
  let temporalScore = 0;
  switch (temporalRelationship) {
    case 'definite':
      temporalScore = 3;
      break;
    case 'compatible':
      temporalScore = 2;
      break;
    case 'incompatible':
      temporalScore = 0;
      break;
    default:
      temporalScore = 1;
  }

  let dechallengeScore = 0;
  switch (dechallenge) {
    case 'positive':
      dechallengeScore = 2;
      break;
    case 'negative':
      dechallengeScore = 0;
      break;
    case 'not_applicable':
      dechallengeScore = 1;
      break;
    default:
      dechallengeScore = 1;
  }

  let rechallengeScore = 0;
  switch (rechallenge) {
    case 'positive':
      rechallengeScore = 3;
      break;
    case 'negative':
      rechallengeScore = 0;
      break;
    case 'not_done':
      rechallengeScore = 1;
      break;
    default:
      rechallengeScore = 1;
  }

  let alternativeCausesScore = 0;
  switch (alternativeCauses) {
    case 'none':
      alternativeCausesScore = 2;
      break;
    case 'possible':
      alternativeCausesScore = 1;
      break;
    case 'likely':
      alternativeCausesScore = 0;
      break;
    default:
      alternativeCausesScore = 1;
  }

  const totalScore = temporalScore + dechallengeScore + rechallengeScore + alternativeCausesScore;

  let causalityLevel: CausalityScore['causalityLevel'];
  if (totalScore >= 9) {
    causalityLevel = 'definite';
  } else if (totalScore >= 7) {
    causalityLevel = 'probable';
  } else if (totalScore >= 5) {
    causalityLevel = 'possible';
  } else if (totalScore >= 3) {
    causalityLevel = 'unlikely';
  } else {
    causalityLevel = 'unrelated';
  }

  return {
    temporalScore,
    dechallengeScore,
    rechallengeScore,
    alternativeCausesScore,
    totalScore,
    causalityLevel,
  };
};

/**
 * Assesses the severity of an adverse event.
 * From Resource 2.
 * @param event - The adverse event object.
 * @returns SeverityAssessment with grade, description, and action requirement.
 */
export const assessSeverity = (event: AdverseEvent): SeverityAssessment => {
  const severityMap: Record<string, { grade: 1 | 2 | 3 | 4 | 5; description: string }> = {
    mild: { grade: 1, description: 'Mild; asymptomatic or mild symptoms' },
    moderate: { grade: 2, description: 'Moderate; minimal intervention indicated' },
    severe: { grade: 3, description: 'Severe; medically significant but not life-threatening' },
  };

  const severityInfo = severityMap[event.severity] || severityMap['mild'];

  if (event.seriousness) {
    return {
      grade: Math.max(severityInfo.grade, 3) as 3 | 4 | 5,
      description: severityInfo.description,
      requiresAction: true,
    };
  }

  return {
    grade: severityInfo.grade,
    description: severityInfo.description,
    requiresAction: severityInfo.grade >= 3,
  };
};

/**
 * Calculates a cumulative risk score based on a list of adverse events.
 * From Resource 2.
 * @param events - An array of adverse event objects.
 * @returns A number representing the total risk score, capped at 100.
 */
export const calculateRiskScore = (events: AdverseEvent[]): number => {
  if (events.length === 0) return 0;

  const severityWeights: Record<string, number> = {
    mild: 1,
    moderate: 2,
    severe: 4,
  };

  const causalityWeights: Record<string, number> = {
    unrelated: 0,
    unlikely: 0.5,
    possible: 1,
    probable: 1.5,
    definite: 2,
  };

  const totalRisk = events.reduce((sum, event) => {
    const severityWeight = severityWeights[event.severity] || 1;
    const causalityWeight = causalityWeights[event.causality] || 1;
    const seriousnessMultiplier = event.seriousness ? 2 : 1;
    return sum + severityWeight * causalityWeight * seriousnessMultiplier;
  }, 0);

  return Math.min(Math.round((totalRisk / events.length) * 10), 100);
};