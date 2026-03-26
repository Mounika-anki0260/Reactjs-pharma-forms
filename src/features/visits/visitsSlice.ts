import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Merged type definitions. In a real application, these would typically reside in a shared file
// (e.g., './visitsTypes') and imported from there.

// Interface for setting a lab value directly into `labsByVisit`, which stores primitive values.
// This combines R1's `setLabValue` payload structure and R2's explicit `value` type.
interface SetLabValuePayload {
  visitId: string;
  labName: string;
  value: number | string | null;
}

// Unified type for visits. This type encompasses both 'ScheduledVisit' from R1 and 'Visit' from R2.
// It must include at least an 'id' property, which is used in several reducers.
// Additional properties from the original `ScheduledVisit` and `Visit` types should be added here
// if their full definitions were available and needed for specific reducer logic.
export interface Visit {
  id: string;
  name?: string;
  date?: string;
  day?: number;
  [key: string]: any;
}

type LabValue = number | string | null | undefined;

// Type for a complete lab result record. This is an object that typically includes an ID
// and the actual `LabValue`, and potentially other metadata (e.g., unit, reference range).
// This type is used for the `labResults` array and related actions (add, update).
export interface LabResult { // Retains the name 'LabResult' as used in R2 for the object type
  id: string;
  value: LabValue; // The actual lab result value
  // Example: unit?: string; referenceRange?: string; dateCollected?: string;
  // (Add any other properties found in LabResult definition from R2 if it had more)
}

// ClinicalDataStatus interface from R2, providing a structured way to manage loading, data, validation, and errors.
export interface ClinicalDataStatus<T> {
  loading: boolean;
  data: T | null;
  validated: boolean;
  errors: string[];
}

// Merged VisitsState interface, combining all relevant properties from both input resources.
export interface VisitsState {
  visits: Visit[]; // Combines R1's 'schedule' and R2's 'visits'
  labsByVisit: Record<string, Record<string, LabValue>>; // Stores primitive LabValue, as explicitly typed in R2
  selectedVisitId: string | null; // From R2
  labResults: LabResult[]; // Stores an array of LabResult objects, from R2
  currentVisit: Visit | null; // From R2
  biomarkerTrends: Record<string, number[]>; // From R2
  status: ClinicalDataStatus<Visit[]>; // From R2, replaces R1's top-level `loading` and `errors`
}

const initialState: VisitsState = {
  visits: [],
  labsByVisit: {},
  selectedVisitId: null,
  labResults: [],
  currentVisit: null,
  biomarkerTrends: {},
  status: {
    loading: false,
    data: null,
    validated: false,
    errors: [],
  },
};

const visitsSlice = createSlice({
  name: 'visits',
  initialState,
  reducers: {
    // Merged from R1's `setSchedule` and R2's `setVisits`.
    // R2's implementation is more comprehensive as it also updates the `status` object.
    // The state property is named `visits` as in R2.
    setVisits: (state, action: PayloadAction<Visit[]>) => {
      state.visits = action.payload;
      state.status.data = action.payload;
      state.status.validated = true;
    },
    // Merged from R1's `addVisit` and R2's `addVisit`.
    // Signature aligned to use the unified `Visit` type. Implementation is identical.
    addVisit: (state, action: PayloadAction<Visit>) => {
      state.visits.push(action.payload);
    },
    // Merged from R1's `updateVisit` and R2's `updateVisit`.
    // Adopting R1's payload structure for partial updates (`patch`), as it's more flexible.
    // R2's `updateVisit` behavior (full replacement) can be achieved by providing a full `patch` object.
    updateVisit: (
      state,
      action: PayloadAction<{ id: string; patch: Partial<Visit> }>
    ) => {
      const idx = state.visits.findIndex(v => v.id === action.payload.id);
      if (idx >= 0) {
        state.visits[idx] = { ...state.visits[idx], ...action.payload.patch };
      }
    },
    // Merged from R1's `setLabValue` and R2's `setLabValue`.
    // Both inputs implicitly or explicitly set a primitive value in `labsByVisit`.
    // Using R2's explicit `SetLabValuePayload` interface and `value` property for clarity and type safety.
    setLabValue: (state, action: PayloadAction<SetLabValuePayload>) => {
      const { visitId, labName, value } = action.payload;
      if (!state.labsByVisit[visitId]) {
        state.labsByVisit[visitId] = {};
      }
      state.labsByVisit[visitId][labName] = value;
    },
    // Merged from R1's `setLoading` and R2's `setLoading`.
    // Adopting R2's implementation which updates the `status.loading` property.
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.status.loading = action.payload;
    },
    // Merged from R1's `setErrors` and R2's `setErrors`.
    // Adopting R2's more comprehensive implementation which updates both `status.errors` and `status.validated`.
    setErrors: (state, action: PayloadAction<string[]>) => {
      state.status.errors = action.payload;
      state.status.validated = action.payload.length === 0;
    },
    // Merged from R1's `resetVisits` and R2's `resetVisitsState`.
    // Adopting R2's name and comprehensive implementation (resets the entire slice state to initial state).
    resetVisitsState: () => {
      return initialState;
    },

    // --- Reducers that were only present in Resource 2 ---

    setSelectedVisitId: (state, action: PayloadAction<string | null>) => {
      state.selectedVisitId = action.payload;
    },
    setCurrentVisit: (state, action: PayloadAction<Visit | null>) => {
      state.currentVisit = action.payload;
    },
    setLabResults: (state, action: PayloadAction<LabResult[]>) => {
      state.labResults = action.payload;
    },
    addLabResult: (state, action: PayloadAction<LabResult>) => {
      state.labResults.push(action.payload);
    },
    updateLabResult: (state, action: PayloadAction<LabResult>) => {
      const index = state.labResults.findIndex((lab) => lab.id === action.payload.id);
      if (index !== -1) {
        state.labResults[index] = action.payload;
      }
    },
    setBiomarkerTrends: (state, action: PayloadAction<Record<string, number[]>>) => {
      state.biomarkerTrends = action.payload;
    },
    clearLabsByVisit: (state) => {
      state.labsByVisit = {};
    },
    clearErrors: (state) => {
      state.status.errors = [];
      state.status.validated = true;
    },
  },
});

export const {
  setVisits,
  addVisit,
  updateVisit,
  setLabValue,
  setLoading,
  setErrors,
  resetVisitsState,
  setSelectedVisitId,
  setCurrentVisit,
  setLabResults,
  addLabResult,
  updateLabResult,
  setBiomarkerTrends,
  clearLabsByVisit,
  clearErrors,
} = visitsSlice.actions;

export default visitsSlice.reducer;