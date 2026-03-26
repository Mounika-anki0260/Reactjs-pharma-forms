import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { setField, setBaselineLab, setEligibilityResult } from '../../features/patient/patientSlice';
import { logChange, markSaved } from '../../features/audit/auditSlice';
import { evaluateEligibility } from '../../utils/eligibilityEngine';
import ClinicalStepper from '../../components/Shared/ClinicalStepper';
import ErrorSummary from '../../components/Shared/ErrorSummary';
import { Step } from '../../types/clinical';
import { Patient, BaselineLabs, EligibilityResult, Comorbidity, PregnancyStatus } from '../../features/patient/patientTypes';
import { motion } from 'framer-motion';
import './PatientIntake.css';

const steps: Step[] = [
  { id: 1, label: 'Demographics' },
  { id: 2, label: 'Medical History' },
  { id: 3, label: 'Baseline Labs' }
];

const PatientIntake: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const patient = useAppSelector((state) => state.patient.currentPatient.data);
  const eligibility = useAppSelector((state) => state.patient.eligibility.data as EligibilityResult);

  if (!patient) {
    console.error('[PatientIntake] Patient data is missing from Redux state');
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="mt-4 text-muted">Initializing clinical state...</p>
      </div>
    );
  }

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [creatinine, setCreatinine] = useState<number | null>(
    patient?.baselineLabs?.creatinine ?? null
  );
  const [alt, setAlt] = useState<number | null>(patient?.baselineLabs?.alt ?? null);

  const showPregnancySection = useMemo(() => {
    if (!patient?.dob) return false;
    const birthYear = new Date(patient.dob).getFullYear();
    const age = new Date().getFullYear() - birthYear;
    return patient.sex === 'F' && age >= 18 && age <= 50;
  }, [patient?.dob, patient?.sex]);

  const handleFieldChange = useCallback(
    <K extends keyof Patient>(field: K, value: Patient[K]) => {
      const oldValue = patient[field];
      dispatch(setField({ field, value }));
      dispatch(
        logChange({
          entity: 'patient',
          field: field as string,
          oldValue,
          newValue: value
        })
      );
    },
    [dispatch, patient]
  );

  const handleBaselineLabChange = useCallback(
    (name: keyof BaselineLabs, value: string) => {
      const numeric = value === '' ? null : Number(value);
      const oldValue = patient.baselineLabs[name];
      if (name === 'creatinine') {
        setCreatinine(numeric);
      } else if (name === 'alt') {
        setAlt(numeric);
      }
      dispatch(setBaselineLab({ name, value: numeric }));
      dispatch(
        logChange({
          entity: 'patient.baselineLabs',
          field: name as string,
          oldValue,
          newValue: numeric
        })
      );
    },
    [dispatch, patient.baselineLabs]
  );

  const validateStep = useCallback(
    (step: number): boolean => {
      const errors: string[] = [];
      if (step === 1) {
        if (!patient.firstName) errors.push('First name initials are required.');
        if (!patient.lastName) errors.push('Last name is required for legal documentation.');
        if (!patient.dob) errors.push('Subject date of birth must be specified.');
        if (!patient.sex) errors.push('Biological sex is a mandatory enrollment field.');
        if (!patient.weightKg) errors.push('Subject weight is required for dosage calculations.');
      }
      if (step === 3) {
        if (creatinine == null) errors.push('Serum Creatinine is required for safety screening.');
      }
      setGlobalErrors(errors);
      return errors.length === 0;
    },
    [patient, creatinine]
  );

  const nextStep = useCallback(() => {
    if (!validateStep(currentStep)) return;
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const handleStepChange = useCallback(
    (stepId: string | number) => {
      const numericStep = typeof stepId === 'string' ? parseInt(stepId, 10) : stepId;
      if (numericStep < currentStep || validateStep(currentStep)) {
        setCurrentStep(numericStep);
      }
    },
    [currentStep, validateStep]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateStep(currentStep)) return;
      const result = evaluateEligibility(patient);
      dispatch(setEligibilityResult(result));
      dispatch(markSaved());

      if (result.isEligible) {
        navigate('/medication');
      }
    },
    [currentStep, dispatch, navigate, patient, validateStep]
  );

  const handleComorbidityChange = useCallback(
    (value: string, checked: boolean) => {
      const oldComorbidities = [...patient.comorbidities];
      let newComorbidities: Comorbidity[];
      if (checked) {
        newComorbidities = [...oldComorbidities, value as Comorbidity];
      } else {
        newComorbidities = oldComorbidities.filter((c) => c !== value);
      }
      dispatch(setField({ field: 'comorbidities', value: newComorbidities }));
      dispatch(
        logChange({
          entity: 'patient',
          field: 'comorbidities',
          oldValue: oldComorbidities,
          newValue: newComorbidities
        })
      );
    },
    [dispatch, patient.comorbidities]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      // animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="pharma-view patient-intake animate-slide-up"
    >
      <h1 className="pharma-title">Subject Enrollment &amp; Intake</h1>

      <div className="pharma-grid grid-main">
        {/* Left Column: Intake Flow */}
        <div className="intake-column">
          <ClinicalStepper
            steps={steps}
            currentStep={currentStep}
            onStepChange={handleStepChange}
          />

          <ErrorSummary errors={globalErrors} />

          <form onSubmit={handleSubmit}>
            {/* Step 1: Demographics */}
            {currentStep === 1 && (
              <section className="pharma-card pharma-card-elevated animate-fade-in shadow-glow">
                <div className="flex-between mb-8">
                  <div className="section-title">
                    <div className="icon-wrap-sm primary">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h2>Subject Demographics</h2>
                  </div>
                  <div className="pharma-badge active">Step 1 of 3</div>
                </div>

                <div className="grid-2 gap-8">
                  <div className="field-row">
                    <label className="pharma-label">First Name (Initials)</label>
                    <input
                      className="pharma-input"
                      value={patient?.firstName || ''}
                      onChange={(e) => handleFieldChange('firstName', e.target.value)}
                      placeholder="e.g. JD"
                    />
                  </div>
                  <div className="field-row">
                    <label className="pharma-label">Last Name / Surname</label>
                    <input
                      className="pharma-input"
                      value={patient?.lastName || ''}
                      onChange={(e) => handleFieldChange('lastName', e.target.value)}
                      placeholder="e.g. Doe"
                    />
                  </div>
                </div>

                <div className="grid-3 gap-6 mt-8">
                  <div className="field-row">
                    <label className="pharma-label">Date of Birth</label>
                    <input
                      type="date"
                      className="pharma-input"
                      value={patient?.dob || ''}
                      onChange={(e) => handleFieldChange('dob', e.target.value)}
                    />
                  </div>
                  <div className="field-row">
                    <label className="pharma-label">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="pharma-input"
                      value={patient.weightKg ?? ''}
                      onChange={(e) =>
                        handleFieldChange(
                          'weightKg',
                          e.target.value === '' ? null : Number(e.target.value)
                        )
                      }
                      placeholder="00.0"
                    />
                  </div>
                  <div className="field-row">
                    <label className="pharma-label">Height (cm)</label>
                    <input
                      type="number"
                      step="1"
                      className="pharma-input"
                      value={patient.heightCm ?? ''}
                      onChange={(e) =>
                        handleFieldChange(
                          'heightCm',
                          e.target.value === '' ? null : Number(e.target.value)
                        )
                      }
                      placeholder="000"
                    />
                  </div>
                </div>

                <div className="field-row mt-8">
                  <label className="pharma-label">Biological Sex</label>
                  <div className="radio-group">
                    <label className={`radio-tab${patient?.sex === 'M' ? ' active' : ''}`}>
                      <input
                        type="radio"
                        checked={patient?.sex === 'M'}
                        onChange={() => handleFieldChange('sex', 'M')}
                      />
                      <span className="tab-label">Male</span>
                    </label>
                    <label className={`radio-tab${patient?.sex === 'F' ? ' active' : ''}`}>
                      <input
                        type="radio"
                        checked={patient?.sex === 'F'}
                        onChange={() => handleFieldChange('sex', 'F')}
                      />
                      <span className="tab-label">Female</span>
                    </label>
                    <label className={`radio-tab${patient?.sex === 'O' ? ' active' : ''}`}>
                      <input
                        type="radio"
                        checked={patient?.sex === 'O'}
                        onChange={() => handleFieldChange('sex', 'O')}
                      />
                      <span className="tab-label">Other</span>
                    </label>
                  </div>
                </div>
              </section>
            )}

            {/* Step 2: Medical History */}
            {currentStep === 2 && (
              <section className="pharma-card pharma-card-elevated animate-fade-in shadow-glow">
                <div className="flex-between mb-8">
                  <div className="section-title">
                    <div className="icon-wrap-sm secondary">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h2>Medical History &amp; Conditions</h2>
                  </div>
                  <div className="pharma-badge active">Step 2 of 3</div>
                </div>

                <div className="comorbidity-grid">
                  <label
                    className={`comorbidity-item glass-item${patient?.comorbidities?.includes('severe_renal_impairment') ? ' active' : ''
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={patient?.comorbidities?.includes('severe_renal_impairment')}
                      onChange={(e) =>
                        handleComorbidityChange('severe_renal_impairment', e.target.checked)
                      }
                    />
                    <div className="check-box" />
                    <span>Severe Renal Impairment</span>
                  </label>

                  <label
                    className={`comorbidity-item glass-item${patient?.comorbidities?.includes('hepatic_impairment') ? ' active' : ''
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={patient?.comorbidities?.includes('hepatic_impairment')}
                      onChange={(e) =>
                        handleComorbidityChange('hepatic_impairment', e.target.checked)
                      }
                    />
                    <div className="check-box" />
                    <span>Hepatic Impairment</span>
                  </label>
                </div>

                {showPregnancySection && (
                  <div className="field-row mt-10 p-6 glass-layer-2 rounded-2xl border border-glass expand-section">
                    <label className="pharma-label">Pregnancy Status (Clinical Screening)</label>
                    <select
                      className="pharma-input"
                      value={patient.pregnancyStatus ?? ''}
                      onChange={(e) =>
                        handleFieldChange(
                          'pregnancyStatus',
                          (e.target.value === '' ? null : e.target.value) as PregnancyStatus
                        )
                      }
                    >
                      <option value="">Select status</option>
                      <option value="negative">Negative / Non-childbearing</option>
                      <option value="positive">Positive</option>
                      <option value="unknown">Unknown / Awaiting Test</option>
                    </select>
                    <p className="input-hint mt-2">
                      Mandatory for women of childbearing potential (18-50y).
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Step 3: Baseline Labs */}
            {currentStep === 3 && (
              <section className="pharma-card pharma-card-elevated animate-fade-in shadow-glow">
                <div className="flex-between mb-8">
                  <div className="section-title">
                    <div className="icon-wrap-sm accent">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.718 2.154a2 2 0 01-1.911 1.363H9.428" />
                        <path d="M3 13.125V15a2 2 0 002 2h3.125" />
                        <path d="M14 6V5a2 2 0 00-2-2h-3a2 2 0 00-2 2v1" />
                        <path d="M14 6h4a1 1 0 011 1v2a1 1 0 01-1 1h-4V6z" />
                        <path d="M6 6H2a1 1 0 00-1 1v2a1 1 0 001 1h4V6z" />
                      </svg>
                    </div>
                    <h2>Baseline Laboratory Results</h2>
                  </div>
                  <div className="pharma-badge active">Step 3 of 3</div>
                </div>

                <p className="text-muted mb-8">
                  Initial screening values used for protocol eligibility verification.
                </p>

                <div className="grid-2 gap-8">
                  <div className="field-row">
                    <label className="pharma-label">Serum Creatinine (mg/dL)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="pharma-input"
                      value={creatinine ?? ''}
                      onChange={(e) => handleBaselineLabChange('creatinine', e.target.value)}
                      placeholder="0.00"
                    />
                    <div className="range-hint">Target: &lt; 2.0 mg/dL</div>
                  </div>
                  <div className="field-row">
                    <label className="pharma-label">ALT (U/L)</label>
                    <input
                      type="number"
                      className="pharma-input"
                      value={alt ?? ''}
                      onChange={(e) => handleBaselineLabChange('alt', e.target.value)}
                      placeholder="0"
                    />
                    <div className="range-hint">Standard Range: 7-55 U/L</div>
                  </div>
                </div>
              </section>
            )}

            {/* Form Actions */}
            <div className="intake-actions mt-10">
              <button
                type="button"
                className="pharma-btn pharma-btn-secondary"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <svg viewBox="0 0 24 24" fill="none" className="btn-icon-left">
                  <path
                    d="M11 17l-5-5m0 0l5-5m-5 5h12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Previous</span>
              </button>
              {currentStep < steps.length ? (
                <button
                  type="button"
                  className="pharma-btn pharma-btn-primary"
                  onClick={nextStep}
                >
                  <span>Next Step</span>
                  <svg viewBox="0 0 24 24" fill="none" className="btn-icon-right">
                    <path
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ) : (
                <button type="submit" className="pharma-btn pharma-btn-primary shine-effect">
                  <span>Finalize &amp; Evaluate Eligibility</span>
                  <svg viewBox="0 0 24 24" fill="none" className="btn-icon-right">
                    <path
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Eligibility Result & Guidelines */}
        <aside className="intake-summary">
          <div className="pharma-card glass-glow sticky-card h-full">
            <div className="section-title mb-8">
              <svg viewBox="0 0 24 24" fill="none" className="title-icon">
                <path
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h2>Clinical Verification</h2>
            </div>

            {eligibility && eligibility.isEligible !== null ? (
              <div
                className={`result-display animate-slide-up ${eligibility.isEligible ? 'pass' : 'fail'
                  }`}
              >
                <div className="result-header">
                  <div className="status-icon">
                    {eligibility.isEligible ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div className="status-text">
                    <h3>{eligibility.isEligible ? 'Subject Eligible' : 'Subject Ineligible'}</h3>
                    <p>
                      {eligibility.isEligible
                        ? 'Technically approved for enrollment.'
                        : 'Protocol exclusions triggered.'}
                    </p>
                  </div>
                </div>

                {!eligibility.isEligible && (
                  <div className="reason-list mt-6">
                    {eligibility.reasons.map((reason: string, index: number) => (
                      <div key={index} className="reason-item">
                        <span className="dot" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-result">
                <div className="circular-progress">
                  <div className="inner-circle">
                    <span>{currentStep * 33}%</span>
                  </div>
                </div>
                <p>Verification pending completion of clinical intake flow.</p>
              </div>
            )}

            <div className="clinical-guardrails mt-10 p-6 glass-layer-2 rounded-2xl border border-glass">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted mb-4 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-accent">
                  <path
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  />
                </svg>
                Core Protocol Guards
              </h4>
              <div className="guard-item">
                <strong>Age Constraint:</strong> 18+ Years required
              </div>
              <div className="guard-item">
                <strong>Weight Floor:</strong> 40.0 kg absolute minimum
              </div>
              <div className="guard-item">
                <strong>Renal Function:</strong> Creatinine &lt; 2.0 mg/dL
              </div>
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
};

export default PatientIntake;