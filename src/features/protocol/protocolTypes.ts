export interface Criterion {
  id: string;
  text: string;
  status: boolean | null;
  mandatory: boolean;
}

export interface ProtocolState {
  inclusionCriteria: Criterion[];
  exclusionCriteria: Criterion[];
  justifications: Record<string, string>;
  loading: boolean;
  errors: string[];
}

export interface EligibilityStatus {
  text: string;
  class: 'pending' | 'deviation' | 'eligible';
}

export type CriteriaType = 'inclusion' | 'exclusion';

export type CriterionType = 'inclusion' | 'exclusion';