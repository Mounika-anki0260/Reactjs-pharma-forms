import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PhysicalExamState, ClinicalVitalSigns } from './physicalExamTypes';

const initialState: PhysicalExamState = {
  vitalSigns: {
    temperature: 0,
    bloodPressureSystolic: 0,
    bloodPressureDiastolic: 0,
    heartRate: 0,
    respiratoryRate: 0,
    oxygenSaturation: 0,
    weight: 0,
    height: 0,
    systolicBP: 0,
    diastolicBP: 0,
  },
  systemExams: [
    { system: 'cardio', normal: true, findings: '' },
    { system: 'respiratory', normal: true, findings: '' },
    { system: 'neurological', normal: true, findings: '' },
    { system: 'gastrointestinal', normal: true, findings: '' },
    { system: 'skin', normal: true, findings: '' },
  ],
  lastUpdated: null,
  status: {
    loading: false,
    validated: false,
    errors: [],
  },
  examIntegrity: {
    complete: false,
    signedBy: '',
    signedDate: '',
  },
};

const physicalExamSlice = createSlice({
  name: 'physicalExam',
  initialState,
  reducers: {
    updateVitalSigns(state, action: PayloadAction<Partial<ClinicalVitalSigns>>) {
      state.vitalSigns = { ...state.vitalSigns, ...action.payload };
      state.lastUpdated = new Date().toISOString();
    },
    updateSystemExam(state, action: PayloadAction<{ system: string; normal: boolean; findings?: string }>) {
      const exam = state.systemExams.find((e) => e.system === action.payload.system);
      if (exam) {
        exam.normal = action.payload.normal;
        if (action.payload.findings !== undefined) {
          exam.findings = action.payload.findings;
        }
      } else {
        state.systemExams.push({
          system: action.payload.system,
          normal: action.payload.normal,
          findings: action.payload.findings || '',
        });
      }
      state.lastUpdated = new Date().toISOString();
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.status.loading = action.payload;
    },
    setErrors(state, action: PayloadAction<string[]>) {
      state.status.errors = action.payload;
      state.status.validated = action.payload.length === 0;
    },
    resetExam() {
      return initialState;
    },
  },
});

export const {
  updateVitalSigns,
  updateSystemExam,
  setLoading,
  setErrors,
  resetExam,
} = physicalExamSlice.actions;

// Mapping for component compatibility (until component is fully refactored)
export const updateVitalsField = (payload: { field: string; value: any }) => {
  const mapping: Record<string, keyof ClinicalVitalSigns> = {
    temp: 'temperature',
    bp_sys: 'bloodPressureSystolic',
    bp_dia: 'bloodPressureDiastolic',
    hr: 'heartRate',
    rr: 'respiratoryRate',
  };
  const clinicalField = mapping[payload.field];
  return updateVitalSigns({ [clinicalField || payload.field]: payload.value });
};

export const updateSystemField = (payload: { system: string; field: string; value: any }) => {
  if (payload.field === 'status') {
    return updateSystemExam({ system: payload.system, normal: payload.value === 'Normal' });
  }
  if (payload.field === 'findings') {
    return updateSystemExam({ system: payload.system, normal: true, findings: payload.value });
  }
  return { type: 'noop' };
};

export const updateSystem = () => {
  // legacy support if needed
  return { type: 'noop' };
};

export default physicalExamSlice.reducer;