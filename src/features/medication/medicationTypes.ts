import { Medication, ClinicalDataStatus } from '../../types/clinical';

export interface RegimenTemplate {
  id: string;
  name: string;
  drug: string;
  dosePerKg: number;
  maxDose: number;
  frequency: string;
}

export interface DrugInteraction {
  med: string;
  severity: 'major' | 'moderate' | 'low' | 'minor';
  description: string;
}

export interface CurrentRegimen {
  templateId: string | null;
  drug: string;
  dosePerKg: number | null;
  maxDose: number | null;
  frequency: string;
  totalDose: number | null;
  interactions: DrugInteraction[];
  notes: string;
}

export interface MedicationState {
  regimenTemplates: RegimenTemplate[];
  currentRegimen: CurrentRegimen;
  loading: boolean;
  errors: string[];
  studyDrugs: Medication[];
  concomitantMeds: Medication[];
  selectedRegimen: string;
  dosageCalculation: {
    bsa: number;
    calculatedDose: number;
    adjustedDose: number;
    adjustmentReason: string;
  };
  status: ClinicalDataStatus<Medication[]>;
}