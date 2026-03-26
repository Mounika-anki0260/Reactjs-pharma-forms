import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppDispatch';
import { setSubmissionState } from '../../features/audit/auditSlice';
import { SubmissionState, AuditEntry } from '../../features/audit/auditTypes';
import './RegulatoryDashboard.css';

interface CompletenessStatus {
  patient_enrollment: string;
  medication_regimen: string;
  adverse_events: string;
  visit_schedule: string;
}

const RegulatoryDashboard: React.FC = () => {
  const dispatch = useAppDispatch();

  const patient = useAppSelector(state => state.patient.currentPatient.data);
  const currentRegimen = useAppSelector(state => state.medication.currentRegimen);
  const adverseEvents = useAppSelector(state => state.adverseEvents.events);
  const visitSchedule = useAppSelector(state => state.visits.visits);
  const submissionState = useAppSelector(state => state.audit.submissionState);
  const entries = useAppSelector(state => state.audit.entries);

  const completeness: CompletenessStatus = useMemo(() => {
    const patientComplete =
      !!patient?.firstName &&
      !!patient?.lastName &&
      !!patient?.dob &&
      !!patient?.sex &&
      patient?.weightKg != null;

    const medicationComplete =
      !!currentRegimen?.drug &&
      !!currentRegimen?.dosePerKg &&
      !!currentRegimen?.maxDose &&
      !!currentRegimen?.frequency;

    return {
      patient_enrollment: patientComplete ? 'Complete' : 'Incomplete',
      medication_regimen: medicationComplete ? 'Complete' : 'Incomplete',
      adverse_events: adverseEvents.length > 0 ? 'Complete' : 'No Events',
      visit_schedule: visitSchedule.length > 0 ? 'Complete' : 'Incomplete'
    };
  }, [patient, currentRegimen, adverseEvents, visitSchedule]);

  const sortedEntries = useMemo(() => {
    return [...entries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [entries]);

  const handleSetState = (state: SubmissionState): void => {
    dispatch(setSubmissionState(state));
  };

  const formatLabel = (key: string): string => {
    return key
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const formatTime = (ts: string): string => {
    return new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="pharma-view regulatory-dashboard animate-slide-up"
    >
      <h1 className="pharma-title">Regulatory & Study Oversight Dashboard</h1>

      <div className="pharma-grid grid-main">
        {/* Metrics Section */}
        <section className="metrics-section">
          <div className="pharma-card pharma-card-elevated mb-8">
            <div className="section-title mb-8">
              <div className="icon-wrap-sm primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2>Readiness Metrics</h2>
            </div>

            <div className="readiness-stack">
              {Object.entries(completeness).map(([key, status]) => (
                <div
                  key={key}
                  className={`readiness-card ${status === 'Complete' ? 'is-complete' : ''}`}
                >
                  <div className="readiness-indicator">
                    <div className="indicator-dot"></div>
                    <div className="indicator-glow"></div>
                  </div>
                  <div className="readiness-info">
                    <span className="readiness-label">{formatLabel(key)}</span>
                    <span className="readiness-value">{status}</span>
                  </div>
                  {status === 'Complete' && (
                    <div className="complete-check">
                      <svg viewBox="0 0 24 24" fill="none" className="check-svg">
                        <path
                          d="M5 13l4 4L19 7"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pharma-card pharma-card-elevated glass-glow">
            <div className="flex-between mb-6">
              <div className="section-title">
                <div className="icon-wrap-sm secondary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 12l2 2 4-4m5.618-4.016A9 9 0 1121 12c0 .38-.024.755-.071 1.125" />
                  </svg>
                </div>
                <h2>Workflow State</h2>
              </div>
              <div className={`state-chip ${submissionState}`}>
                {(submissionState || 'draft').replace('_', ' ').toUpperCase()}
              </div>
            </div>

            <div className="workflow-actions">
              <button
                className={`pharma-btn pharma-btn-secondary ${submissionState === 'draft' ? 'state-active' : ''}`}
                onClick={() => handleSetState('draft')}
              >
                <span>Return to Draft</span>
              </button>
              <button
                className={`pharma-btn pharma-btn-secondary ${submissionState === 'ready_for_review' ? 'state-active' : ''}`}
                onClick={() => handleSetState('ready_for_review')}
              >
                <span>Submit for Review</span>
              </button>
              <button
                className={`pharma-btn pharma-btn-primary ${submissionState === 'submitted' ? 'state-active' : ''}`}
                onClick={() => handleSetState('submitted')}
              >
                <span>Final Clinical Submit</span>
              </button>
            </div>

            <div className="lock-advisory mt-8">
              <div className="lock-visual">
                <svg viewBox="0 0 24 24" fill="none" className="lock-svg">
                  <path
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p>
                Final signature locks all source data for monitoring. This action is auditable and
                non-reversible.
              </p>
            </div>
          </div>
        </section>

        {/* Audit Section */}
        <section className="audit-section">
          <div className="pharma-card pharma-card-elevated h-full">
            <div className="section-title mb-8">
              <div className="icon-wrap-sm accent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2>Clinical Audit Trail</h2>
            </div>

            <div className="audit-container">
              {entries.length > 0 ? (
                <table className="audit-premium-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Entity</th>
                      <th>Change Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedEntries.map((e: AuditEntry, idx: number) => (
                      <tr key={idx} className="audit-row">
                        <td className="time-cell">
                          <span className="time-val">{formatTime(e.timestamp)}</span>
                        </td>
                        <td className="entity-cell">
                          <div className="entity-badge">{e.entity}</div>
                        </td>
                        <td className="change-cell">
                          <div className="change-detail">
                            <span className="field-name">{e.field}</span>
                            <div className="value-transition">
                              <span className="old-val">{e.oldValue || '\u2205'}</span>
                              <svg viewBox="0 0 24 24" fill="none" className="arrow-icon">
                                <path
                                  d="M13 7l5 5-5 5M6 7l5 5-5 5"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span className="new-val">{e.newValue}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-audit-state">
                  <div className="integrity-shield">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m5.618-4.016A9 9 0 1121 12c0 .38-.024.755-.071 1.125" />
                    </svg>
                  </div>
                  <p>No audit events recorded. Data integrity check confirmed.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default RegulatoryDashboard;