export interface MedicalHistoryEntry {
  id: number;
  condition: string;
  onset: string;
  status: 'Active' | 'Resolved' | 'Chronic';
  isSignificant: boolean;
}

export interface MedicalHistoryState {
  history: MedicalHistoryEntry[];
  commonConditions: string[];
  loading: boolean;
  errors: string[];
}

export interface UpdateEntryPayload {
  id: number;
  data: Partial<Omit<MedicalHistoryEntry, 'id'>>;
}