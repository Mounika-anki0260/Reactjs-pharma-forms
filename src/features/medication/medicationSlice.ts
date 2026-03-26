import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MedicationState, CurrentRegimen, DrugInteraction } from './medicationTypes';
import { Medication } from '../../types/clinical';

const initialState: MedicationState = {
  regimenTemplates: [
    {
      id: 'regimen-a',
      name: 'Regimen A',
      drug: 'Drug A',
      dosePerKg: 2,
      maxDose: 200,
      frequency: 'BID',
    },
    {
      id: 'regimen-b',
      name: 'Regimen B',
      drug: 'Drug B',
      dosePerKg: 1.5,
      maxDose: 150,
      frequency: 'QD',
    },
  ],
  currentRegimen: {
    templateId: null,
    drug: '',
    dosePerKg: null,
    maxDose: null,
    frequency: '',
    totalDose: null,
    interactions: [],
    notes: '',
  },
  studyDrugs: [],
  concomitantMeds: [],
  selectedRegimen: '',
  dosageCalculation: {
    bsa: 0,
    calculatedDose: 0,
    adjustedDose: 0,
    adjustmentReason: '',
  },
  status: {
    loading: false,
    data: null,
    validated: false,
    errors: [],
  },
};

const medicationSlice = createSlice({
  name: 'medication',
  initialState,
  reducers: {
    loadTemplate(state, action: PayloadAction<string>) {
      const tmpl = state.regimenTemplates.find((t) => t.id === action.payload);
      if (!tmpl) return;
      state.currentRegimen.templateId = tmpl.id;
      state.currentRegimen.drug = tmpl.drug;
      state.currentRegimen.dosePerKg = tmpl.dosePerKg;
      state.currentRegimen.maxDose = tmpl.maxDose;
      state.currentRegimen.frequency = tmpl.frequency;
    },
    setField<K extends keyof MedicationState['currentRegimen']>(
      state: MedicationState,
      action: PayloadAction<{ field: K; value: MedicationState['currentRegimen'][K] }>
    ) {
      const { field, value } = action.payload;
      (state.currentRegimen as Record<K, MedicationState['currentRegimen'][K]>)[field] = value;
    },
    setTotalDose(state, action: PayloadAction<number | null>) {
      state.currentRegimen.totalDose = action.payload;
    },
    setInteractions(state, action: PayloadAction<DrugInteraction[]>) {
      state.currentRegimen.interactions = action.payload;
    },
    resetCurrentRegimen(state: MedicationState) {
      state.currentRegimen = initialState.currentRegimen;
      state.status.errors = [];
    },
    setStudyDrugs: (state, action: PayloadAction<Medication[]>) => {
      state.studyDrugs = action.payload;
    },
    addStudyDrug: (state, action: PayloadAction<Medication>) => {
      state.studyDrugs.push(action.payload);
    },
    updateStudyDrug: (state, action: PayloadAction<Medication>) => {
      const index = state.studyDrugs.findIndex((med) => med.id === action.payload.id);
      if (index !== -1) {
        state.studyDrugs[index] = action.payload;
      }
    },
    removeStudyDrug: (state, action: PayloadAction<string>) => {
      state.studyDrugs = state.studyDrugs.filter((med) => med.id !== action.payload);
    },
    setConcomitantMeds: (state, action: PayloadAction<Medication[]>) => {
      state.concomitantMeds = action.payload;
    },
    addConcomitantMed: (state, action: PayloadAction<Medication>) => {
      state.concomitantMeds.push(action.payload);
    },
    removeConcomitantMed: (state, action: PayloadAction<string>) => {
      state.concomitantMeds = state.concomitantMeds.filter((med) => med.id !== action.payload);
    },
    setSelectedRegimen: (state, action: PayloadAction<string>) => {
      state.selectedRegimen = action.payload;
    },
    setDosageCalculation: (state, action: PayloadAction<Partial<MedicationState['dosageCalculation']>>) => {
      state.dosageCalculation = { ...state.dosageCalculation, ...action.payload };
    },
    setMedicationLoading: (state, action: PayloadAction<boolean>) => {
      state.status.loading = action.payload;
    },
    setMedicationErrors: (state, action: PayloadAction<string[]>) => {
      state.status.errors = action.payload;
      state.status.validated = action.payload.length === 0;
    },
    clearMedication: (state) => {
      return initialState;
    },
  },
});

export const {
  loadTemplate,
  setField,
  setTotalDose,
  setInteractions,
  resetCurrentRegimen,
  setStudyDrugs,
  addStudyDrug,
  updateStudyDrug,
  removeStudyDrug,
  setConcomitantMeds,
  addConcomitantMed,
  removeConcomitantMed,
  setSelectedRegimen,
  setDosageCalculation,
  setMedicationLoading,
  setMedicationErrors,
  clearMedication,
} = medicationSlice.actions;

export default medicationSlice.reducer;