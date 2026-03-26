import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AdverseEventsState, AdverseEvent } from './adverseEventsTypes';

const initialState: AdverseEventsState = {
  events: [],
  selectedEventId: null,
  currentEvent: null,
  causalityAssessment: {
    temporalRelationship: '',
    dechallenge: '',
    rechallenge: '',
    alternativeCauses: '',
    overallCausality: '',
  },
  status: {
    loading: false,
    data: null,
    validated: false,
    errors: [],
  },
};

const adverseEventsSlice = createSlice({
  name: 'adverseEvents',
  initialState,
  reducers: {
    addEvent(state, action: PayloadAction<Omit<AdverseEvent, 'id'>>) {
      const newEvent: AdverseEvent = {
        ...action.payload,
        id: Date.now().toString()
      };
      state.events.push(newEvent);
    },
    updateEvent(state, action: PayloadAction<{ id: string; patch: Partial<AdverseEvent> }>) {
      const { id, patch } = action.payload;
      const idx = state.events.findIndex(e => e.id === id);
      if (idx >= 0) {
        state.events[idx] = { ...state.events[idx], ...patch };
      }
    },
    removeEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter(e => e.id !== action.payload);
      if (state.selectedEventId === action.payload) {
        state.selectedEventId = null;
      }
    },
    selectEvent(state, action: PayloadAction<string | null>) {
      state.selectedEventId = action.payload;
    },
    clearErrors: (state) => {
      state.status.errors = [];
      state.status.validated = true;
    },
    setAdverseEvents: (state, action: PayloadAction<AdverseEvent[]>) => {
      state.events = action.payload;
      state.status.data = action.payload;
    },
    addAdverseEvent: (state, action: PayloadAction<AdverseEvent>) => {
      state.events.push(action.payload);
    },
    updateAdverseEvent: (state, action: PayloadAction<AdverseEvent>) => {
      const index = state.events.findIndex((event) => event.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },
    setCurrentEvent: (state, action: PayloadAction<AdverseEvent | null>) => {
      state.currentEvent = action.payload;
    },
    setCausalityAssessment: (state, action: PayloadAction<Partial<AdverseEventsState['causalityAssessment']>>) => {
      state.causalityAssessment = { ...state.causalityAssessment, ...action.payload };
    },
    setAdverseEventsLoading: (state, action: PayloadAction<boolean>) => {
      state.status.loading = action.payload;
    },
    setAdverseEventsErrors: (state, action: PayloadAction<string[]>) => {
      state.status.errors = action.payload;
      state.status.validated = action.payload.length === 0;
    },
    clearAdverseEvents: (state) => {
      return initialState;
    },
  }
});

export const {
  addEvent,
  updateEvent,
  removeEvent,
  selectEvent,
  clearErrors,
  setAdverseEvents,
  addAdverseEvent,
  updateAdverseEvent,
  setCurrentEvent,
  setCausalityAssessment,
  setAdverseEventsLoading,
  setAdverseEventsErrors,
  clearAdverseEvents,
} = adverseEventsSlice.actions;

export const selectAllEvents = (state: { adverseEvents: AdverseEventsState }) => state.adverseEvents.events;
export const selectSelectedEventId = (state: { adverseEvents: AdverseEventsState }) => state.adverseEvents.selectedEventId;
export const selectSelectedEvent = (state: { adverseEvents: AdverseEventsState }): AdverseEvent | null => {
  const { events, selectedEventId } = state.adverseEvents;
  return events.find(e => e.id === selectedEventId) || null;
};
export const selectAdverseEventsLoading = (state: { adverseEvents: AdverseEventsState }) => state.adverseEvents.status.loading;
export const selectAdverseEventsErrors = (state: { adverseEvents: AdverseEventsState }) => state.adverseEvents.status.errors;
export const selectCurrentEvent = (state: { adverseEvents: AdverseEventsState }) => state.adverseEvents.currentEvent;
export const selectCausalityAssessment = (state: { adverseEvents: AdverseEventsState }) => state.adverseEvents.causalityAssessment;
export const selectAdverseEventsDataStatus = (state: { adverseEvents: AdverseEventsState }) => state.adverseEvents.status.data;
export const selectAdverseEventsValidatedStatus = (state: { adverseEvents: AdverseEventsState }) => state.adverseEvents.status.validated;

export default adverseEventsSlice.reducer;