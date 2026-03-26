import { takeLatest, put, select, call } from 'redux-saga/effects';
import {
  setLoading,
  setErrors,
  evaluateEligibilityRequest,
  evaluateEligibilitySuccess,
  evaluateEligibilityFailure,
  setEligibilityResult,
  setEligibilityLoading,
} from './patientSlice';
import { evaluateEligibility } from '../../utils/eligibilityEngine';
import { Patient, EligibilityResult } from './patientTypes';
import { RootState } from '../store';

export const EVALUATE_ELIGIBILITY = 'patient/evaluateEligibility';

export const evaluateEligibilityAction = () => ({
  type: EVALUATE_ELIGIBILITY
});

function* handleEvaluateEligibility(): Generator {
  try {
    // Loading actions from both resources
    yield put(setLoading(true)); // From Resource 1
    yield put(setEligibilityLoading(true)); // From Resource 2

    // State selections combined. Resource 2 provides a more detailed breakdown
    // for eligibility evaluation, which is prioritized for the comprehensive call.
    const state: RootState = yield select();
    const patientData: Patient | null = state.patient.currentPatient.data; // From Resource 2 (primary patient object for evaluation)
    const medicalHistory: any[] = state.medicalHistory?.items || []; // From Resource 2 (with optional chaining for robustness)
    const labResults: any = patientData?.baselineLabs || null; // From Resource 2 (Corrected to baselineLabs)

    // Call evaluateEligibility with the most comprehensive set of arguments from Resource 2,
    // assuming the engine can handle these additional parameters or they are optional.
    const result: EligibilityResult = yield call(
      evaluateEligibility,
      patientData,
      medicalHistory,
      labResults
    );

    // Success actions from both resources
    yield put(evaluateEligibilitySuccess(result)); // From Resource 2
    yield put(setEligibilityResult(result)); // From Resource 2
    yield put(setErrors([])); // Clear errors on success (from Resource 1)

  } catch (error) {
    // Combined error handling from both resources
    const errorMessage =
      error instanceof Error ? error.message : 'Eligibility evaluation failed';

    yield put(setErrors([errorMessage])); // From Resource 1
    yield put(evaluateEligibilityFailure([errorMessage])); // From Resource 2
    yield put(setEligibilityLoading(false)); // From Resource 2 (explicitly sets loading to false on failure)
    console.error('Eligibility evaluation failed:', error); // From Resource 2
  } finally {
    yield put(setLoading(false)); // Ensure general loading state is reset (from Resource 1)
  }
}

export function* patientSaga(): Generator {
  // Combine listeners from both resources for the same handler
  // Assuming EVALUATE_ELIGIBILITY (R1) and evaluateEligibilityRequest.type (R2) are distinct
  // triggers for the same underlying eligibility evaluation logic.
  yield takeLatest(
    [EVALUATE_ELIGIBILITY, evaluateEligibilityRequest.type],
    handleEvaluateEligibility
  );
}