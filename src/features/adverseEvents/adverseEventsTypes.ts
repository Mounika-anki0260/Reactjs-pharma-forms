import { ClinicalDataStatus } from '../../types/clinical';

export interface AdverseEvent {
  id: string;
  term: string;
  onsetDate: string;
  startDate: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Life-threatening' | 'Fatal';
  causality: 'Unrelated' | 'Unlikely' | 'Possible' | 'Probable' | 'Definite' | null;
  outcome: string;
  serious: boolean;
  description: string;
  actionTaken: string;
  impactOnDose: string;
  temporalRelation: string;
  dechallenge: string;
  rechallenge: string;
  alternativeCauses: string;
  drugLevel: string;
  severityGrade: number;
  severityLabel: string;
  causalityScore: number;
  causalityCategory: string;
  notes: string;
}

export interface AdverseEventsState {
  events: AdverseEvent[];
  selectedEventId: string | null;
  loading: boolean;
  errors: string[];
  currentEvent: AdverseEvent | null;
  causalityAssessment: {
    temporalRelationship: string;
    dechallenge: string;
    rechallenge: string;
    alternativeCauses: string;
    overallCausality: string;
  };
  status: ClinicalDataStatus<AdverseEvent[]>;
}

export interface AdverseEventForm {
  term: string;
  startDate: string;
  outcome: string;
  impactOnDose: string;
  temporalRelation: string;
  dechallenge: string;
  rechallenge: string;
  alternativeCauses: string;
  drugLevel: string;
}

export interface SeverityResult {
  grade: number;
  label: string;
}

export interface CausalityResult {
  score: number;
  category: string;
}