import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import auditReducer from './audit/auditSlice';
import patientReducer from './patient/patientSlice';
import medicationReducer from './medication/medicationSlice';
import adverseEventsReducer from './adverseEvents/adverseEventsSlice';
import visitsReducer from './visits/visitsSlice';
import medicalHistoryReducer from './medicalHistory/medicalHistorySlice';
import physicalExamReducer from './physicalExam/physicalExamSlice';
import protocolReducer from './protocol/protocolSlice';
import { rootSaga } from './rootSaga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    audit: auditReducer,
    patient: patientReducer,
    medication: medicationReducer,
    adverseEvents: adverseEventsReducer,
    visits: visitsReducer,
    medicalHistory: medicalHistoryReducer,
    physicalExam: physicalExamReducer,
    protocol: protocolReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false
    }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production'
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;