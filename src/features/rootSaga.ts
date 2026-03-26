import { all, fork } from 'redux-saga/effects';
import { patientSaga } from './patient/patientSaga';

export function* rootSaga(): Generator {
  yield all([
    // Add feature sagas here as they are created
    fork(patientSaga),
  ]);
}