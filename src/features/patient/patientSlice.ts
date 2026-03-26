import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  PatientState,
  Patient,
  EligibilityResult,
  Comorbidity,
  Sex,
  PregnancyStatus,
  BaselineLabs,
} from './patientTypes';

// Definition of initial patient data, combining specificity from Resource 2's initialPatient
// and ensuring all fields from Resource 1's initial patient are present.
const initialPatient: Patient = {
  id: null,
  subjectId: '',
  firstName: '',
  lastName: '',
  dob: '',
  dateOfBirth: '',
  sex: '',
  gender: 'other',
  weightKg: null,
  heightCm: null,
  comorbidities: [],
  pregnancyStatus: null,
  baselineLabs: {
    creatinine: null,
    alt: null,
  },
  status: 'screening',
  enrollmentDate: '',
};

// Initial eligibility data, based on Resource 2's EligibilityResult structure,
// which matches Resource 1's initialState.eligibility content.
const initialEligibilityData: EligibilityResult = {
  isEligible: null,
  reasons: [],
};

// Merged initial state for the patient slice, using Resource 2's comprehensive structure
const initialState: PatientState = {
  currentPatient: {
    loading: false,
    data: initialPatient,
    validated: false,
    errors: [],
  },
  eligibility: {
    loading: false,
    data: initialEligibilityData, // Uses initial data compatible with Resource 1's initial eligibility
    validated: false,
    errors: [],
  },
  enrollmentData: {
    subjectId: '',
    siteId: '',
    enrollmentDate: '',
    consentDate: '',
    consentVersion: '',
  },
};

// Interface for generic patient field setting (from Resource 2, adapted from Resource 1 concept)
interface SetFieldPayload<K extends keyof Patient> {
  field: K;
  value: Patient[K];
}

// Interface for setting baseline lab values (from Resource 2, adapted to combine R1 and R2 value types)
interface SetBaselineLabPayload {
  name: keyof BaselineLabs;
  value: number | string | null | undefined;
}

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    // Reducer 'setField' (merged from R1 and R2, adapted to R2 state structure and R2's payload interface)
    setField<K extends keyof Patient>(
      state: PatientState,
      action: PayloadAction<SetFieldPayload<K>>
    ) {
      const { field, value } = action.payload;
      // Adapting R1's logic to R2's state structure: state.patient -> state.currentPatient.data
      (state.currentPatient.data![field] as Patient[K]) = value;
    },
    // Reducers exclusively from Resource 2 (specific patient field setters)
    setFirstName(state, action: PayloadAction<string>) {
      state.currentPatient.data!.firstName = action.payload;
    },
    setLastName(state, action: PayloadAction<string>) {
      state.currentPatient.data!.lastName = action.payload;
    },
    setDob(state, action: PayloadAction<string>) {
      state.currentPatient.data!.dob = action.payload;
    },
    setSex(state, action: PayloadAction<Sex>) {
      state.currentPatient.data!.sex = action.payload;
    },
    setWeightKg(state, action: PayloadAction<number | null>) {
      state.currentPatient.data!.weightKg = action.payload;
    },
    setHeightCm(state, action: PayloadAction<number | null>) {
      state.currentPatient.data!.heightCm = action.payload;
    },
    setComorbidities(state, action: PayloadAction<Comorbidity[]>) {
      state.currentPatient.data!.comorbidities = action.payload;
    },
    addComorbidity(state, action: PayloadAction<Comorbidity>) {
      if (!state.currentPatient.data!.comorbidities.includes(action.payload)) {
        state.currentPatient.data!.comorbidities.push(action.payload);
      }
    },
    removeComorbidity(state, action: PayloadAction<Comorbidity>) {
      state.currentPatient.data!.comorbidities = state.currentPatient.data!.comorbidities.filter(
        (c) => c !== action.payload
      );
    },
    setPregnancyStatus(state, action: PayloadAction<PregnancyStatus>) {
      state.currentPatient.data!.pregnancyStatus = action.payload;
    },
    // Reducer 'setBaselineLab' (merged from R1 and R2, using R2's payload structure with combined value types)
    setBaselineLab(state, action: PayloadAction<SetBaselineLabPayload>) {
      const { name, value } = action.payload;
      state.currentPatient.data!.baselineLabs[name] = value;
    },
    // Reducer 'setBaselineLabs' from Resource 2
    setBaselineLabs(state, action: PayloadAction<BaselineLabs>) {
      state.currentPatient.data!.baselineLabs = action.payload;
    },
    setEligibilityResult(state, action: PayloadAction<EligibilityResult>) {
      state.eligibility.data = action.payload;
      state.eligibility.loading = false;
      state.eligibility.validated = true;
      state.eligibility.errors = [];
    },
    // Reducer 'setPatientId' from R2
    setPatientId(state, action: PayloadAction<string | null>) {
      state.currentPatient.data!.id = action.payload;
    },
    // Reducer 'setLoading' (from R2, now controls eligibility.loading as per R2's state structure)
    setLoading(state, action: PayloadAction<boolean>) {
      state.eligibility.loading = action.payload;
    },
    // Reducer 'setErrors' (from R2, now controls eligibility.errors as per R2's state structure)
    setErrors(state, action: PayloadAction<string[]>) {
      state.eligibility.errors = action.payload;
      state.eligibility.validated = action.payload.length === 0;
    },
    clearErrors(state) {
      state.eligibility.errors = [];
      state.eligibility.validated = false;
    },

    // Reducers exclusively from Resource 2 for patient/enrollment state management
    setPatientLoading: (state, action: PayloadAction<boolean>) => {
      state.currentPatient.loading = action.payload;
    },
    // Reducer 'setPatientData' (from R2, replaces any R1 'setPatient' concept, directly setting patient data)
    setPatientData: (state, action: PayloadAction<Patient | null>) => {
      state.currentPatient.data = action.payload;
      state.currentPatient.loading = false;
      state.currentPatient.validated = action.payload !== null;
      state.currentPatient.errors = [];
    },
    setPatientErrors: (state, action: PayloadAction<string[]>) => {
      state.currentPatient.errors = action.payload;
      state.currentPatient.validated = action.payload.length === 0;
    },
    updateEnrollmentData: (state, action: PayloadAction<Partial<PatientState['enrollmentData']>>) => {
      state.enrollmentData = { ...state.enrollmentData, ...action.payload };
    },
    setEligibilityLoading: (state, action: PayloadAction<boolean>) => {
      state.eligibility.loading = action.payload;
    },

    // Reducers from Resource 2 for eligibility evaluation flow
    evaluateEligibilityRequest: (state) => {
      state.eligibility.loading = true;
      state.eligibility.errors = [];
      state.eligibility.validated = false;
    },
    evaluateEligibilitySuccess(state, action: PayloadAction<EligibilityResult>) {
      state.eligibility.loading = false;
      state.eligibility.data = action.payload;
      state.eligibility.validated = true;
      state.eligibility.errors = [];
    },
    evaluateEligibilityFailure(state, action: PayloadAction<string[]>) {
      state.eligibility.loading = false;
      state.eligibility.errors = action.payload;
      state.eligibility.validated = false;
    },

    // Reducer 'clearPatientData' (merged from R1's 'resetPatient' and R2's 'clearPatientData',
    // adopting R2's name and comprehensive state reset which aligns with the merged state structure).
    clearPatientData: (state) => {
      // R1's resetPatient reset state.patient and state.eligibility to initialState values.
      // In the merged structure, this maps to resetting currentPatient and eligibility (including their metadata).
      state.currentPatient = { ...initialState.currentPatient };
      state.eligibility = { ...initialState.eligibility };
      state.enrollmentData = { ...initialState.enrollmentData };
    },
  },
});

export const {
  setField,
  setFirstName,
  setLastName,
  setDob,
  setSex,
  setWeightKg,
  setHeightCm,
  setComorbidities,
  addComorbidity,
  removeComorbidity,
  setPregnancyStatus,
  setBaselineLab,
  setBaselineLabs,
  setEligibilityResult, // Replaces R1's setEligibility
  setPatientId,
  setLoading, // R2's setLoading
  setErrors, // R2's setErrors
  clearErrors,
  setPatientLoading,
  setPatientData,
  setPatientErrors,
  updateEnrollmentData,
  setEligibilityLoading,
  evaluateEligibilityRequest,
  evaluateEligibilitySuccess,
  evaluateEligibilityFailure,
  clearPatientData, // Replaces R1's resetPatient
} = patientSlice.actions;

export default patientSlice.reducer;