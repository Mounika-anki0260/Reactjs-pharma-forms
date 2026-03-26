import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import {
  addEvent,
  updateEvent,
  selectEvent,
  selectAllEvents,
  selectSelectedEventId,
  selectSelectedEvent
} from '../../features/adverseEvents/adverseEventsSlice';
import {
  logChange,
  markSaved,
  clearUnsavedChanges,
  requestConfirmation,
  selectHasUnsavedChanges
} from '../../features/audit/auditSlice';
import {
  gradeSeverity,
  calculateCausalityScore,
  isSerious
} from '../../utils/aeScoringEngine';
import { AdverseEventForm } from '../../features/adverseEvents/adverseEventsTypes';
import ErrorSummary from '../../components/Shared/ErrorSummary';
import './AdverseEvents.css';

const initialFormState: AdverseEventForm = {
  term: '',
  startDate: '',
  outcome: '',
  impactOnDose: '',
  temporalRelation: '',
  dechallenge: '',
  rechallenge: '',
  alternativeCauses: '',
  drugLevel: ''
};

const AdverseEvents: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const events = useAppSelector(selectAllEvents);
  const selectedEventId = useAppSelector(selectSelectedEventId);
  const selectedEvent = useAppSelector(selectSelectedEvent);
  const hasUnsavedChanges = useAppSelector(selectHasUnsavedChanges);

  const [form, setForm] = useState<AdverseEventForm>(initialFormState);
  const [errors, setErrors] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const severity = useMemo(() => gradeSeverity(form), [form]);
  const causality = useMemo(() => calculateCausalityScore(form), [form]);
  const seriousFlag = useMemo(() => isSerious(form, severity.grade), [form, severity.grade]);

  useEffect(() => {
    if (selectedEventId && selectedEvent) {
      setEditingId(selectedEvent.id);
      setForm({
        term: selectedEvent.term,
        startDate: selectedEvent.startDate,
        outcome: selectedEvent.outcome,
        impactOnDose: selectedEvent.impactOnDose,
        temporalRelation: selectedEvent.temporalRelation,
        dechallenge: selectedEvent.dechallenge,
        rechallenge: selectedEvent.rechallenge,
        alternativeCauses: selectedEvent.alternativeCauses,
        drugLevel: selectedEvent.drugLevel
      });
    }
  }, [selectedEventId, selectedEvent]);

  const handleFieldChange = useCallback(
    (field: keyof AdverseEventForm, value: string) => {
      setForm(prev => ({ ...prev, [field]: value }));
      dispatch(
        logChange({
          entity: 'adverseEvent',
          field,
          oldValue: 'previous',
          newValue: value
        })
      );
    },
    [dispatch]
  );

  const validate = useCallback((): boolean => {
    const errs: string[] = [];
    if (!form.term) errs.push('Event term is required for clinical reporting.');
    if (!form.startDate) errs.push('Onset date must be specified.');
    if (!form.outcome) errs.push('Outcome status is required.');
    if (!form.impactOnDose) errs.push('Drug impact must be recorded.');
    setErrors(errs);
    return errs.length === 0;
  }, [form]);

  const resetForm = useCallback(() => {
    setEditingId(null);
    dispatch(selectEvent(null));
    setForm(initialFormState);
    setErrors([]);
    dispatch(clearUnsavedChanges());
  }, [dispatch]);

  const handleAddOrUpdateEvent = useCallback(() => {
    if (!validate()) return;

    const payload = {
      ...form,
      severityGrade: severity.grade,
      severityLabel: severity.label,
      causalityScore: causality.score,
      causalityCategory: causality.category,
      serious: seriousFlag
    };

    if (editingId) {
      dispatch(updateEvent({ id: editingId, patch: payload }));
    } else {
      dispatch(addEvent(payload));
    }

    dispatch(markSaved());
    resetForm();
    navigate('/dashboard');
  }, [form, severity, causality, seriousFlag, editingId, dispatch, navigate, resetForm, validate]);

  const handleSelectEvent = useCallback(
    (id: string) => {
      if (hasUnsavedChanges) {
        dispatch(
          requestConfirmation({
            title: 'Unsaved Changes',
            message: 'You have unsaved changes. Discard and select another event?'
          })
        );
        return;
      }
      dispatch(selectEvent(id));
    },
    [hasUnsavedChanges, dispatch]
  );

  const getGradeClass = (grade: number): string => {
    return `grade-${grade}`;
  };

  return (
    <motion.div
      className="pharma-view adverse-events animate-slide-up"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="pharma-title">Adverse Event Reporting</h1>

      <div className="pharma-grid grid-main">
        {/* Reporting Pane */}
        <section className="report-pane">
          <div className="pharma-card pharma-card-elevated glass-glow">
            <div className="flex-between mb-8">
              <div className="section-title">
                <div className="icon-wrap-sm danger">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2>{editingId ? 'Update Event Record' : 'New Adverse Event Report'}</h2>
              </div>
              {editingId && (
                <button className="pharma-btn pharma-btn-secondary btn-sm" onClick={resetForm}>
                  <span>Cancel Edit</span>
                </button>
              )}
            </div>

            <ErrorSummary errors={errors} />

            <div className="form-section">
              <div className="form-group mb-6">
                <label className="pharma-label">Event Term / Diagnosis</label>
                <input
                  className="pharma-input"
                  value={form.term}
                  onChange={e => handleFieldChange('term', e.target.value)}
                  placeholder="e.g. Grade 2 Persistent Headache"
                />
              </div>

              <div className="grid-2 gap-6 mb-6">
                <div className="form-group">
                  <label className="pharma-label">Onset Date</label>
                  <input
                    type="date"
                    className="pharma-input"
                    value={form.startDate}
                    onChange={e => handleFieldChange('startDate', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="pharma-label">Current Outcome</label>
                  <select
                    className="pharma-input"
                    value={form.outcome}
                    onChange={e => handleFieldChange('outcome', e.target.value)}
                  >
                    <option value="">Select current status</option>
                    <option value="recovered">Recovered/Resolved</option>
                    <option value="recovering">Recovering/Resolving</option>
                    <option value="not_recovered">Not Resolved</option>
                    <option value="hospitalization">Hospitalization</option>
                    <option value="death">Fatal</option>
                  </select>
                </div>
              </div>

              <div className="form-group mb-10">
                <label className="pharma-label">Impact on Investigational Product</label>
                <select
                  className="pharma-input"
                  value={form.impactOnDose}
                  onChange={e => handleFieldChange('impactOnDose', e.target.value)}
                >
                  <option value="">Select action taken</option>
                  <option value="none">Dose not changed</option>
                  <option value="reduction">Dose reduced</option>
                  <option value="interruption">Dose interrupted</option>
                  <option value="permanent_discontinuation">Drug withdrawn</option>
                </select>
              </div>

              <div className="premium-divider mb-10"></div>

              <div className="section-title mb-6">
                <div className="icon-wrap-sm primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2>Causality Assessment</h2>
              </div>

              <div className="grid-3 gap-4 mb-10">
                <div className="form-group">
                  <label className="pharma-label">Temporal Relation</label>
                  <select
                    className="pharma-input"
                    value={form.temporalRelation}
                    onChange={e => handleFieldChange('temporalRelation', e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="plausible">Plausible</option>
                    <option value="unlikely">Unlikely</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="pharma-label">Dechallenge</label>
                  <select
                    className="pharma-input"
                    value={form.dechallenge}
                    onChange={e => handleFieldChange('dechallenge', e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="improved">Positive</option>
                    <option value="no_change">Negative</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="pharma-label">Drug Level</label>
                  <select
                    className="pharma-input"
                    value={form.drugLevel}
                    onChange={e => handleFieldChange('drugLevel', e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="normal">Therapeutic</option>
                    <option value="toxic">Toxic</option>
                  </select>
                </div>
              </div>

              <div className="analysis-dashboard">
                <div className="analysis-item">
                  <span className="label">Severity Grading</span>
                  <span className={`value ${getGradeClass(severity.grade)}`}>
                    Grade {severity.grade}: {severity.label}
                  </span>
                </div>
                <div className="analysis-item">
                  <span className="label">Naranjo Probability</span>
                  <span className="value causality-score">
                    {(causality.category || 'N/A').toUpperCase()} ({causality.score} Pts)
                  </span>
                </div>

                <AnimatePresence>
                  {seriousFlag && (
                    <motion.div
                      className="sae-alert"
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 4 }}
                      transition={{ duration: 0.4, type: 'spring' }}
                    >
                      <div className="sae-icon-wrap">
                        <svg viewBox="0 0 24 24" fill="none" className="sae-svg">
                          <path
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="sae-text">
                        <strong>SERIOUS ADVERSE EVENT (SAE)</strong>
                        <span>Mandatory 24h reporting window triggered.</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button
              className="pharma-btn pharma-btn-primary full-width mt-10"
              onClick={handleAddOrUpdateEvent}
            >
              <span>{editingId ? 'Update Clinical Record' : 'Submit Formal AE Report'}</span>
            </button>
          </div>
        </section>

        {/* History Pane */}
        <aside className="history-pane">
          <div className="pharma-card pharma-card-elevated sticky-history">
            <div className="section-title mb-6">
              <div className="icon-wrap-sm secondary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2>Safety History</h2>
            </div>

            {events.length > 0 ? (
              <div className="ae-timeline">
                {events.map(e => (
                  <div
                    key={e.id}
                    className={`event-card${e.id === selectedEventId ? ' selected' : ''}${e.serious ? ' sae-item' : ''}`}
                    onClick={() => handleSelectEvent(e.id)}
                  >
                    <div className="event-glow"></div>
                    <div className="event-content">
                      <div className="event-header">
                        <span className="event-term">{e.term}</span>
                        <div className="badge-group">
                          <span className="severity-badge">G{e.severityGrade}</span>
                          {e.serious && <span className="sae-mini-pill">SAE</span>}
                        </div>
                      </div>
                      <div className="event-meta">
                        <svg viewBox="0 0 24 24" fill="none" className="meta-icon">
                          <path
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{e.startDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-history">
                <div className="empty-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p>No safety events reported. Data integrity verified.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </motion.div>
  );
};

export default AdverseEvents;