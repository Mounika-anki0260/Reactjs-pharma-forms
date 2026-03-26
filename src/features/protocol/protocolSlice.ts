import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ClinicalDataStatus } from './clinicalTypes';

// Define the common fields for criteria
interface CriterionCommon {
  id: string;
  text: string;
  mandatory: boolean;
  notes: string;
}

// Define the merged Inclusion Criterion structure
interface MergedInclusionCriterion extends CriterionCommon {
  status: boolean | null; // From R1 (null: unassessed, true: met, false: not met)
  met: boolean; // From R2 (true: met, false: not met)
}

// Define the merged Exclusion Criterion structure
interface MergedExclusionCriterion extends CriterionCommon {
  status: boolean | null; // From R1 (null: unassessed, true: not excluded, false: excluded)
  triggered: boolean; // From R2 (true: excluded, false: not excluded)
}

// Define the merged ProtocolState
interface ProtocolState {
  inclusionCriteria: MergedInclusionCriterion[];
  exclusionCriteria: MergedExclusionCriterion[];
  justifications: { [key: string]: string };
  screeningProgress: number;
  eligibilitySummary: {
    allInclusionMet: boolean;
    noExclusionTriggered: boolean;
    overallEligible: boolean;
  };
  status: ClinicalDataStatus<null>; // ClinicalDataStatus will encompass loading and errors
}

// Merged action payload for setCriterionStatus, allowing for boolean or null status
interface MergedSetCriterionStatusPayload {
  type: 'inclusion' | 'exclusion';
  id: string;
  status: boolean | null;
}

// R2-specific payload types (for setInclusionCriteria and setExclusionCriteria)
interface R2InclusionCriterionPayload {
    id: string;
    description: string;
    met: boolean;
    notes: string;
}

interface R2ExclusionCriterionPayload {
    id: string;
    description: string;
    triggered: boolean;
    notes: string;
}

const initialState: ProtocolState = {
  inclusionCriteria: [
    { id: 'I1', text: 'Patient is \u2265 18 years of age at the time of signing informed consent.', status: null, mandatory: true, met: false, notes: '' },
    { id: 'I2', text: 'Documented diagnosis of Chronic Clinical Condition (CCC) for at least 6 months.', status: null, mandatory: true, met: false, notes: '' },
    { id: 'I3', text: 'Patient is willing and able to comply with all study procedures.', status: null, mandatory: true, met: false, notes: '' },
    { id: 'I4', text: 'BMI between 18.5 and 30.0 kg/m\u00b2 inclusive.', status: null, mandatory: false, met: false, notes: '' }
  ],
  exclusionCriteria: [
    { id: 'E1', text: 'History of clinically significant hypersensitivity to the study drug.', status: null, mandatory: true, triggered: false, notes: '' },
    { id: 'E2', text: 'Current involvement in another interventional clinical trial.', status: null, mandatory: true, triggered: false, notes: '' },
    { id: 'E3', text: 'Pregnant or breastfeeding participants.', status: null, mandatory: true, triggered: false, notes: '' }
  ],
  justifications: {},
  screeningProgress: 0,
  eligibilitySummary: {
    allInclusionMet: false,
    noExclusionTriggered: true,
    overallEligible: false,
  },
  status: {
    loading: false,
    data: null,
    validated: false,
    errors: [],
  },
};

const protocolSlice = createSlice({
  name: 'protocol',
  initialState,
  reducers: {
    setCriterionStatus(state, action: PayloadAction<MergedSetCriterionStatusPayload>) {
      const { type, id, status } = action.payload;
      if (type === 'inclusion') {
        const item = state.inclusionCriteria.find(i => i.id === id);
        if (item) {
          item.status = status;
          item.met = status === true; // R2's met flag is boolean
        }
      } else { // exclusion
        const item = state.exclusionCriteria.find(i => i.id === id);
        if (item) {
          item.status = status;
          item.triggered = status === false; // R2's triggered flag is true if status is false (i.e., excluded)
        }
      }
    },
    setJustification(state, action: PayloadAction<{ id: string; text: string }>) {
      state.justifications[action.payload.id] = action.payload.text;
    },
    resetProtocol(state) {
      // Deep copy initial state for criteria to reset all fields, including status, met/triggered, and notes
      state.inclusionCriteria = initialState.inclusionCriteria.map(c => ({ ...c }));
      state.exclusionCriteria = initialState.exclusionCriteria.map(c => ({ ...c }));
      state.justifications = {};
      // R1's errors reset is handled by clearProtocol or setProtocolErrors([])
      // Other R2 state parts (screeningProgress, eligibilitySummary, status) are reset by clearProtocol.
    },
    setInclusionCriteria: (state, action: PayloadAction<R2InclusionCriterionPayload[]>) => {
      action.payload.forEach(payloadItem => {
        const criterion = state.inclusionCriteria.find(c => c.id === payloadItem.id);
        if (criterion) {
          criterion.met = payloadItem.met;
          criterion.notes = payloadItem.notes;
          criterion.text = payloadItem.description; // Update text if description is newer
          criterion.status = payloadItem.met; // Update R1's status based on R2's met
        }
      });
    },
    updateInclusionCriterion: (state, action: PayloadAction<{ id: string; met: boolean; notes?: string }>) => {
      const criterion = state.inclusionCriteria.find((c) => c.id === action.payload.id);
      if (criterion) {
        criterion.met = action.payload.met;
        if (action.payload.notes !== undefined) {
          criterion.notes = action.payload.notes;
        }
        criterion.status = action.payload.met; // Update R1's status based on R2's met
      }
    },
    setExclusionCriteria: (state, action: PayloadAction<R2ExclusionCriterionPayload[]>) => {
      action.payload.forEach(payloadItem => {
        const criterion = state.exclusionCriteria.find(c => c.id === payloadItem.id);
        if (criterion) {
          criterion.triggered = payloadItem.triggered;
          criterion.notes = payloadItem.notes;
          criterion.text = payloadItem.description; // Update text if description is newer
          criterion.status = !payloadItem.triggered; // Update R1's status based on R2's triggered (inverse)
        }
      });
    },
    updateExclusionCriterion: (state, action: PayloadAction<{ id: string; triggered: boolean; notes?: string }>) => {
      const criterion = state.exclusionCriteria.find((c) => c.id === action.payload.id);
      if (criterion) {
        criterion.triggered = action.payload.triggered;
        if (action.payload.notes !== undefined) {
          criterion.notes = action.payload.notes;
        }
        criterion.status = !action.payload.triggered; // Update R1's status based on R2's triggered (inverse)
      }
    },
    setScreeningProgress: (state, action: PayloadAction<number>) => {
      state.screeningProgress = action.payload;
    },
    calculateEligibilitySummary: (state) => {
      const allInclusionMet = state.inclusionCriteria.every((c) => c.met);
      const noExclusionTriggered = state.exclusionCriteria.every((c) => !c.triggered);
      state.eligibilitySummary = {
        allInclusionMet,
        noExclusionTriggered,
        overallEligible: allInclusionMet && noExclusionTriggered,
      };
    },
    setProtocolLoading: (state, action: PayloadAction<boolean>) => {
      state.status.loading = action.payload;
    },
    setProtocolErrors: (state, action: PayloadAction<string[]>) => {
      state.status.errors = action.payload;
      state.status.validated = action.payload.length === 0;
    },
    clearProtocol: (state) => {
      // This reducer fully resets the state to its initial definition.
      return initialState;
    },
  },
});

export const {
  setCriterionStatus,
  setJustification,
  resetProtocol,
  setInclusionCriteria,
  updateInclusionCriterion,
  setExclusionCriteria,
  updateExclusionCriterion,
  setScreeningProgress,
  calculateEligibilitySummary,
  setProtocolLoading,
  setProtocolErrors,
  clearProtocol,
} = protocolSlice.actions;

export default protocolSlice.reducer;