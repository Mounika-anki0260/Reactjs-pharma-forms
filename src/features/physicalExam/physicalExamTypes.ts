export interface VitalSigns {
  temp: number | null;
  bp_sys: number | null;
  bp_dia: number | null;
  hr: number | null;
  rr: number | null;
}

export interface ClinicalVitalSigns {
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  weight: number;
  height: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  oxygenSaturation: number;
}

export interface SystemExam {
  system: string;
  normal: boolean;
  findings: string;
}

export interface PhysicalExamState {
  vitalSigns: ClinicalVitalSigns;
  systemExams: SystemExam[];
  lastUpdated: string | null;
  status: {
    loading: boolean;
    validated: boolean;
    errors: string[];
  };
  examIntegrity: {
    complete: boolean;
    signedBy: string;
    signedDate: string;
  };
}

export type SystemKey = 'vitals' | 'cardio' | 'respiratory' | 'neurological' | 'gastrointestinal' | 'skin';

export interface SystemConfig {
  label: string;
}

export type SystemsConfig = Record<SystemKey, SystemConfig>;