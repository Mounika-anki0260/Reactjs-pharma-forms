import { ClinicalDataStatus } from '../../types/clinical';

export type Sex = 'M' | 'F' | 'O' | '';

export type PregnancyStatus = 'positive' | 'negative' | 'unknown' | 'not_applicable' | null;

export type Comorbidity =
  | 'diabetes'
  | 'hypertension'
  | 'cardiac_disease'
  | 'severe_renal_impairment'
  | 'hepatic_impairment'
  | 'malignancy'
  | 'immunocompromised';

export interface BaselineLabs {
  creatinine?: number | null;
  hemoglobin?: number | null;
  platelets?: number | null;
  alt?: number | null;
  ast?: number | null;
  bilirubin?: number | null;
  [key: string]: any;
}

export interface Patient {
  id: string | null;
  subjectId: string;
  firstName: string;
  lastName: string;
  dob: string;
  dateOfBirth: string;
  sex: Sex;
  gender: 'male' | 'female' | 'other';
  weightKg: number | null;
  heightCm: number | null;
  comorbidities: Comorbidity[];
  pregnancyStatus: PregnancyStatus;
  baselineLabs: BaselineLabs;
  status: 'screening' | 'enrolled' | 'completed' | 'withdrawn';
  enrollmentDate: string;
}

export interface EligibilityResult {
  isEligible: boolean | null;
  reasons: string[];
}

export interface PatientState {
  currentPatient: ClinicalDataStatus<Patient>;
  eligibility: ClinicalDataStatus<EligibilityResult>;
  enrollmentData: {
    subjectId: string;
    siteId: string;
    enrollmentDate: string;
    consentDate: string;
    consentVersion: string;
  };
}