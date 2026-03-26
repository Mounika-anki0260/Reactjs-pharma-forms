export interface ScheduledVisit {
  id: string;
  visitNumber: number;
  visitName: string;
  scheduledDate: string;
  windowStart: string;
  windowEnd: string;
  status: 'Scheduled' | 'Completed' | 'Missed' | 'Pending';
}

export interface LabResult {
  labName: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  flag: 'Normal' | 'Low' | 'High' | 'Critical' | null;
}

export interface Visit {
  id: string;
  name: string;
  date: string;
  day: number;
}

export interface LabValues {
  alt?: number | null;
  creatinine?: number | null;
  [key: string]: number | null | undefined;
}

export interface LabsByVisit {
  [visitId: string]: LabValues;
}

export interface SetLabValuePayload {
  visitId: string;
  labName: string;
  value: number | null;
}

export interface VisitsState {
  schedule: ScheduledVisit[] | Visit[];
  labsByVisit: Record<string, Record<string, LabResult>> | LabsByVisit;
  loading: boolean;
  errors: string[];
  selectedVisitId: string | null;
}