import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import {
  loadTemplate,
  setField,
  setTotalDose,
  setInteractions,
} from '../../features/medication/medicationSlice';
import { logChange, markSaved } from '../../features/audit/auditSlice';
import {
  calculateDosePerKg,
  validateDose,
  mockInteractionCheck,
  DrugInteraction,
} from '../../utils/dosageEngine';
import './MedicationConfig.css';
import { motion } from 'framer-motion';

interface FormState {
  drug: string;
  dosePerKg: number | null;
  maxDose: number | null;
  frequency: string;
  administeredDose: number | null;
}

const MedicationConfig: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const templates = useAppSelector((state) => state.medication.regimenTemplates);
  const currentRegimen = useAppSelector((state) => state.medication.currentRegimen);
  const patientWeight = useAppSelector((state) => state.patient.currentPatient.data?.weightKg);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [concomitantMeds, setConcomitantMeds] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>({
    drug: currentRegimen.drug || '',
    dosePerKg: currentRegimen.dosePerKg,
    maxDose: currentRegimen.maxDose,
    frequency: currentRegimen.frequency || '',
    administeredDose: currentRegimen.totalDose,
  });

  const totalDose = useMemo(
    () => calculateDosePerKg(patientWeight, form.dosePerKg),
    [patientWeight, form.dosePerKg]
  );

  const doseValidation = useMemo(
    () => validateDose(form.administeredDose, form.maxDose),
    [form.administeredDose, form.maxDose]
  );

  const interactions = useMemo<DrugInteraction[]>(
    () => mockInteractionCheck(form.drug, concomitantMeds),
    [form.drug, concomitantMeds]
  );

  useEffect(() => {
    if (totalDose != null) {
      setForm((prev) => ({ ...prev, administeredDose: totalDose }));
      dispatch(
        logChange({
          entity: 'medication',
          field: 'administeredDose',
          oldValue: String(form.administeredDose ?? ''),
          newValue: String(totalDose),
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalDose, dispatch]);

  const handleManualChange = (
    field: keyof FormState,
    value: string | number | null
  ) => {
    const oldValue = form[field];
    setForm((prev) => ({ ...prev, [field]: value }));
    dispatch(
      logChange({
        entity: 'medication',
        field,
        oldValue: String(oldValue ?? ''),
        newValue: String(value ?? ''),
      })
    );
  };

  const handleMedsUpdate = () => {
    dispatch(
      logChange({
        entity: 'medication',
        field: 'concomitantMeds',
        oldValue: 'list',
        newValue: 'updated',
      })
    );
  };

  const addMed = () => {
    setConcomitantMeds((prev) => [...prev, '']);
    handleMedsUpdate();
  };

  const removeMed = (index: number) => {
    setConcomitantMeds((prev) => prev.filter((_, i) => i !== index));
    handleMedsUpdate();
  };

  const updateMed = (index: number, value: string) => {
    setConcomitantMeds((prev) =>
      prev.map((m, i) => (i === index ? value : m))
    );
    handleMedsUpdate();
  };

  const handleTemplateChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    const oldDrug = form.drug;
    dispatch(loadTemplate(templateId));

    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl) {
      setForm({
        drug: tmpl.drug,
        dosePerKg: tmpl.dosePerKg,
        maxDose: tmpl.maxDose,
        frequency: tmpl.frequency,
        administeredDose: null,
      });
      dispatch(
        logChange({
          entity: 'medication',
          field: 'template',
          oldValue: oldDrug,
          newValue: tmpl.drug,
        })
      );
    }
  };

  const saveRegimen = () => {
    dispatch(setField({ field: 'drug', value: form.drug }));
    dispatch(setField({ field: 'dosePerKg', value: form.dosePerKg }));
    dispatch(setField({ field: 'maxDose', value: form.maxDose }));
    dispatch(setField({ field: 'frequency', value: form.frequency }));
    dispatch(setTotalDose(form.administeredDose));
    dispatch(setInteractions(interactions));
    dispatch(markSaved());
    navigate('/visits');
  };

  return (
    <motion.div
      className="pharma-view medication-config animate-slide-up"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="pharma-title">Medication &amp; Dosage Configuration</h1>

      <div className="pharma-grid grid-main">
        <div className="config-pane">
          {/* Regimen Selection Section */}
          <section className="pharma-card pharma-card-elevated">
            <div className="section-title mb-6">
              <div className="icon-wrap-sm primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2>Regimen Selection</h2>
            </div>
            <div className="field-row">
              <label className="pharma-label">Protocol Template</label>
              <select
                className="pharma-input"
                value={selectedTemplateId}
                onChange={handleTemplateChange}
              >
                <option value="">Manual Entry / Select Template</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.drug})
                  </option>
                ))}
              </select>
            </div>

            <div className="premium-divider"></div>

            {/* Drug Details Section */}
            <div className="section-title mb-6">
              <div className="icon-wrap-sm secondary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4.879 4.879a3 3 0 114.242 4.242 3 3 0 01-4.242-4.242z" />
                  <path d="M9.121 9.121L19 19" />
                </svg>
              </div>
              <h2>Drug Details</h2>
            </div>
            <div className="field-row">
              <label className="pharma-label">Investigational Drug</label>
              <input
                className="pharma-input"
                value={form.drug}
                onChange={(e) => handleManualChange('drug', e.target.value)}
                placeholder="Enter drug name"
              />
            </div>
            <div className="grid-2 mt-6 gap-6">
              <div className="field-row">
                <label className="pharma-label">Dose per Kg (mg/kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="pharma-input"
                  value={form.dosePerKg ?? ''}
                  onChange={(e) =>
                    handleManualChange(
                      'dosePerKg',
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  placeholder="0.0"
                />
              </div>
              <div className="field-row">
                <label className="pharma-label">Max Allowed Dose (mg)</label>
                <input
                  type="number"
                  className="pharma-input"
                  value={form.maxDose ?? ''}
                  onChange={(e) =>
                    handleManualChange(
                      'maxDose',
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid-2 mt-6 gap-6">
              <div className="field-row">
                <label className="pharma-label">Administration Frequency</label>
                <select
                  className="pharma-input"
                  value={form.frequency}
                  onChange={(e) => handleManualChange('frequency', e.target.value)}
                >
                  <option value="">Select frequency</option>
                  <option value="QD">QD (Once Daily)</option>
                  <option value="BID">BID (Twice Daily)</option>
                  <option value="TID">TID (Three Times Daily)</option>
                  <option value="QW">QW (Weekly)</option>
                </select>
              </div>
              <div className="field-row">
                <label className="pharma-label">Administered Dose (mg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="pharma-input"
                  value={form.administeredDose ?? ''}
                  onChange={(e) =>
                    handleManualChange(
                      'administeredDose',
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  placeholder="Auto-calculated or override"
                />
              </div>
            </div>
          </section>

          {/* Concomitant Medications Section */}
          <section className="pharma-card mt-6 shadow-glow">
            <div className="flex-between mb-6">
              <div className="section-title">
                <div className="icon-wrap-sm accent">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
                  </svg>
                </div>
                <h2>Concomitant Medications</h2>
              </div>
              <button className="pharma-btn pharma-btn-primary btn-sm" onClick={addMed}>
                <span>Add Med</span>
              </button>
            </div>

            <div className="concomitant-list">
              {concomitantMeds.map((med, index) => (
                <div key={index} className="med-item-row mt-3">
                  <div className="med-input-wrapper">
                    <input
                      className="pharma-input"
                      value={med}
                      onChange={(e) => updateMed(index, e.target.value)}
                      placeholder="e.g. Ketoconazole"
                    />
                    <button className="remove-action" onClick={() => removeMed(index)}>
                      <svg viewBox="0 0 24 24" fill="none" style={{ width: 16, height: 16 }}>
                        <path
                          d="M6 18L18 6M6 6l12 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {concomitantMeds.length === 0 && (
              <div className="empty-state-mini mt-4">
                <p>No concomitant medications recorded.</p>
              </div>
            )}
          </section>
        </div>

        {/* Analysis Pane */}
        <aside className="analysis-pane">
          <div className="pharma-card glass-glow sticky-card">
            <div className="section-title mb-8">
              <svg viewBox="0 0 24 24" fill="none" className="title-icon hit">
                <path
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h2>Calculation &amp; Safety</h2>
            </div>

            <div className="calc-box-glass shadow-inner">
              <div className="calc-row-premium">
                <span className="label">Subject Weight</span>
                <span className="value">{patientWeight ?? '--'} kg</span>
              </div>
              <div className="calc-row-premium highlight-row mt-4">
                <div className="flex flex-col">
                  <span className="label">Calculated Dose</span>
                  <span className="text-xs opacity-60">
                    Based on {form.dosePerKg ?? 0} mg/kg
                  </span>
                </div>
                <span className="value main-dose">
                  {totalDose ?? '--'} <small>mg</small>
                </span>
              </div>

              {doseValidation.message && (
                <div
                  className={`safety-alert mt-6 ${!doseValidation.valid ? 'warning' : ''}`}
                >
                  <div className="alert-icon">
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
                      {doseValidation.valid ? (
                        <path
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      ) : (
                        <path
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                    </svg>
                  </div>
                  <div className="alert-text">{doseValidation.message}</div>
                </div>
              )}
            </div>

            <div className="premium-divider"></div>

            <div className="section-title mb-6">
              <svg viewBox="0 0 24 24" fill="none" className="title-icon">
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h2>Clinical Interactions</h2>
            </div>

            {interactions.length > 0 ? (
              <div className="interaction-stack">
                {interactions.map((i) => (
                  <div
                    key={i.med}
                    className={`interaction-glass-card animate-slide-up ${i.severity}`}
                  >
                    <div className="i-header">
                      <strong>{i.med}</strong>
                      <span className="sev-tag">{(i.severity || 'low').toUpperCase()}</span>
                    </div>
                    <p>{i.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="safety-check-clear">
                <div className="check-circle-pulse">
                  <svg viewBox="0 0 24 24" fill="none" className="check-icon">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span>No clinical interactions detected.</span>
              </div>
            )}

            <button
              className="pharma-btn pharma-btn-primary full-width mt-10 shine-effect"
              onClick={saveRegimen}
            >
              <span>Acknowledge &amp; Sync Regimen</span>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </aside>
      </div>
    </motion.div>
  );
};

export default MedicationConfig;