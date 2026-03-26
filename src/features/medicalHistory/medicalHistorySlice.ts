import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MedicalHistoryEntry {
  id: number;
  condition: string;
  onset: string;
  status: 'Active' | 'Inactive' | 'Resolved' | string;
  isSignificant: boolean;
}

interface ClinicalDataStatus<T> {
  loading: boolean;
  data: T | null;
  validated: boolean;
  errors: string[];
}

interface UpdateEntryPayload {
  id: number;
  data: Partial<MedicalHistoryEntry>;
}

interface MedicalHistoryState {
  history: MedicalHistoryEntry[];
  commonConditions: string[];
  status: ClinicalDataStatus<MedicalHistoryEntry[]>;
}

const initialState: MedicalHistoryState = {
  history: [],
  commonConditions: [
    'Diabetes Type 2',
    'Hypertension',
    'Hyperlipidemia',
    'Asthma',
    'COPD',
    'Depression',
    'Anxiety',
  ],
  status: {
    loading: false,
    data: null,
    validated: false,
    errors: [],
  },
};

const medicalHistorySlice = createSlice({
  name: 'medicalHistory',
  initialState,
  reducers: {
    setHistory: (state, action: PayloadAction<MedicalHistoryEntry[]>) => {
      state.history = action.payload;
      state.status.data = action.payload;
    },
    addEntry: (state, action: PayloadAction<string>) => {
      const newEntry: MedicalHistoryEntry = {
        id: Date.now(),
        condition: action.payload,
        onset: '',
        status: 'Active',
        isSignificant: false,
      };
      state.history.push(newEntry);
    },
    addMedicalHistoryEntry: (state, action: PayloadAction<MedicalHistoryEntry>) => {
      state.history.push(action.payload);
    },
    updateEntry: (state, action: PayloadAction<UpdateEntryPayload>) => {
      const { id, data } = action.payload;
      const index = state.history.findIndex((item) => item.id === id);
      if (index !== -1) {
        state.history[index] = { ...state.history[index], ...data };
      }
    },
    removeEntry: (state, action: PayloadAction<number>) => {
      state.history = state.history.filter((item) => item.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.status.loading = action.payload;
    },
    setErrors: (state, action: PayloadAction<string[]>) => {
      state.status.errors = action.payload;
      state.status.validated = action.payload.length === 0;
    },
    clearErrors: (state) => {
      state.status.errors = [];
      state.status.validated = true;
    },
    resetMedicalHistory: (state) => {
      state.history = [];
      state.status = {
        loading: false,
        data: null,
        validated: false,
        errors: [],
      };
    },
  },
});

export const {
  setHistory,
  addEntry,
  addMedicalHistoryEntry,
  updateEntry,
  removeEntry,
  setLoading,
  setErrors,
  clearErrors,
  resetMedicalHistory,
} = medicalHistorySlice.actions;

export default medicalHistorySlice.reducer;