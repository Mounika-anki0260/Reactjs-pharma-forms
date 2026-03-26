export interface BaselineLabs {
  creatinine?: number | null;
  alt?: number | null;
  ast?: number | null;
  hemoglobin?: number | null;
  platelets?: number | null;
  wbc?: number | null;
  glucose?: number | null;
  potassium?: number | null;
  sodium?: number | null;
  bilirubin?: number | null;
  albumin?: number | null;
  inr?: number | null;
  [key: string]: number | null | undefined;
}

export type Sex = 'M' | 'F' | 'O' | '';

export type PregnancyStatus = 'negative' | 'positive' | 'unknown' | '' | 'not_applicable' | null;

export type Comorbidity =
  | 'severe_renal_impairment'
  | 'hepatic_impairment'
  | 'cardiac_disease'
  | 'diabetes'
  | 'hypertension'
  | 'immunocompromised'
  | 'malignancy';

export interface Step {
  id: number;
  label: string;
}

export interface AuditEntry {
  timestamp: string;
  entity: string;
  field: string;
  oldValue: string | number | boolean | null;
  newValue: string | number | boolean | null;
  user: string;
}

export interface ConfirmDialogState {
  show: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: 'warning' | 'info';
}

export interface ClinicalDataStatus<T> {
  loading: boolean;
  data: T | null;
  validated: boolean;
  errors: string[];
}

export interface Patient {
  id: string | null;
  subjectId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  enrollmentDate: string;
  status: 'screening' | 'enrolled' | 'completed' | 'withdrawn';
  dob: string;
  sex: Sex;
  weightKg: number | null;
  heightCm: number | null;
  comorbidities: Comorbidity[];
  pregnancyStatus: PregnancyStatus;
  baselineLabs: BaselineLabs;
}

export interface MedicalHistoryItem {
  id: string;
  condition: string;
  diagnosisDate: string;
  status: 'active' | 'resolved' | 'chronic';
  notes: string;
}

export interface LabResult {
  id: string;
  testName: string;
  value: number;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'abnormal' | 'critical';
  collectionDate: string;
}

export interface Medication {
  id: string;
  name: string;
  dose: number | string;
  unit: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  isStudyDrug: boolean;
}

export interface AdverseEvent {
  id: string;
  term: string;
  severity: 'mild' | 'moderate' | 'severe';
  seriousness: boolean;
  onsetDate: string;
  resolutionDate?: string;
  causality: 'unrelated' | 'unlikely' | 'possible' | 'probable' | 'definite';
  outcome: 'recovered' | 'recovering' | 'not_recovered' | 'fatal' | 'unknown';
}

export interface Visit {
  id: string;
  visitNumber: number;
  visitName: string;
  scheduledDate: string;
  actualDate?: string;
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled';
  windowStart: string;
  windowEnd: string;
}

export interface VitalSigns {
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

export interface EligibilityResult {
  eligible: boolean;
  inclusionCriteriaMet: boolean[];
  exclusionCriteriaMet: boolean[];
  overallScore: number;
  failureReasons: string[];
  isEligible: boolean | null;
  reasons: string[];
  exclusionCriteriaTriggered: boolean[];
}