import React, { useState, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import {
  updateVitalSigns,
  updateSystemExam,
} from '../../features/physicalExam/physicalExamSlice';
import { logChange } from '../../features/audit/auditSlice';
import {
  SystemKey,
  SystemsConfig,
  ClinicalVitalSigns,
} from '../../features/physicalExam/physicalExamTypes';
import './PhysicalExam.css';
import { motion } from 'framer-motion';

const systems: SystemsConfig = {
  vitals: { label: 'Vital Signs' },
  cardio: { label: 'Cardiovascular' },
  respiratory: { label: 'Respiratory' },
  neurological: { label: 'Neurological' },
  gastrointestinal: { label: 'Gastrointestinal' },
  skin: { label: 'Skin & Integumentary' },
};

const PhysicalExam: React.FC = () => {
  const dispatch = useAppDispatch();
  const vitalSigns = useAppSelector((state) => state.physicalExam.vitalSigns);
  const systemExams = useAppSelector((state) => state.physicalExam.systemExams);
  const lastUpdated = useAppSelector((state) => state.physicalExam.lastUpdated);

  const [activeSystem, setActiveSystem] = useState<SystemKey | null>('vitals');

  const completionPercent = useMemo(() => {
    const keys = Object.keys(systems) as SystemKey[];
    const filled = keys.filter((k) => {
      if (k === 'vitals') {
        return vitalSigns.temperature !== 0 && vitalSigns.bloodPressureSystolic !== 0;
      }
      const exam = systemExams.find((e) => e.system === k);
      return exam ? !exam.normal || exam.findings !== '' : false;
    }).length;
    return Math.round((filled / keys.length) * 100);
  }, [vitalSigns, systemExams]);

  const formatTime = useCallback((iso: string): string => {
    return new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, []);

  const handleSystemToggle = useCallback((key: SystemKey) => {
    setActiveSystem((prev) => (prev === key ? null : key));
  }, []);

  const handleVitalsChange = useCallback(
    (field: keyof ClinicalVitalSigns, value: string) => {
      const numValue = value === '' ? 0 : parseFloat(value);
      dispatch(updateVitalSigns({ [field]: numValue }));
    },
    [dispatch]
  );

  const handleSystemStatusChange = useCallback(
    (system: Exclude<SystemKey, 'vitals'>, value: string) => {
      dispatch(updateSystemExam({ system, normal: value === 'Normal' }));
    },
    [dispatch]
  );

  const handleSystemFindingsChange = useCallback(
    (system: Exclude<SystemKey, 'vitals'>, value: string) => {
      dispatch(updateSystemExam({ system, normal: true, findings: value }));
    },
    [dispatch]
  );

  const saveSystem = useCallback(
    (key: SystemKey) => {
      dispatch(
        logChange({
          entity: 'exam',
          field: key,
          oldValue: 'previous',
          newValue: 'updated',
        })
      );
    },
    [dispatch]
  );

  const submitFinalExam = useCallback(() => {
    alert(
      'Full Physical Exam timestamped and submitted to Clinical Data Repository.'
    );
  }, []);

  const getStatusClass = (status: string): string => {
    return status.toLowerCase().replace(' ', '-');
  };

  const isSystemCompleted = useCallback(
    (key: SystemKey): boolean => {
      if (key === 'vitals') {
        return vitalSigns.temperature !== 0 || vitalSigns.bloodPressureSystolic !== 0;
      }
      const exam = systemExams.find((e) => e.system === key);
      return !!exam && (!exam.normal || exam.findings !== '');
    },
    [vitalSigns, systemExams]
  );

  const strokeDashoffset = 314.159 - (completionPercent / 100) * 314.159;

  return (
    <motion.div
      className="pharma-view physical-exam animate-slide-up"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-between mb-8">
        <h1 className="pharma-title">Physical Examination</h1>
        {lastUpdated && (
          <div className="last-updated">Last Sync: {formatTime(lastUpdated)}</div>
        )}
      </div>

      <div className="pharma-grid grid-sidebar">
        {/* Main Exam Area */}
        <div className="exam-content">
          {(Object.keys(systems) as SystemKey[]).map((key) => {
            const system = systems[key];
            const isActive = activeSystem === key;
            const exam = systemExams.find((e) => e.system === key);
            const currentStatus = key === 'vitals'
              ? 'Normal'
              : (exam?.normal ? 'Normal' : 'Abnormal');

            return (
              <div
                key={key}
                className={`pharma-card system-card mb-4 ${isActive ? 'card-active' : ''}`}
              >
                <div
                  className="system-header"
                  onClick={() => handleSystemToggle(key)}
                >
                  <div className="system-info">
                    <div className="system-icon-wrapper">
                      {key === 'vitals' ? (
                        <svg viewBox="0 0 24 24" fill="none" className="system-icon">
                          <path
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" className="system-icon">
                          <path
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="system-label">{system.label}</span>
                    <span className={`system-status-badge ${getStatusClass(currentStatus)}`}>
                      {currentStatus}
                    </span>
                  </div>
                  <div className={`chevron ${isActive ? 'open' : ''}`}>
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: '16px', height: '16px' }}>
                      <path
                        d="M19 9l-7 7-7-7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {isActive && (
                  <div className="system-details expand-enter">
                    {key === 'vitals' ? (
                      <div className="vitals-grid">
                        <div className="field-row">
                          <label>Temp (°C)</label>
                          <input
                            type="number"
                            step="0.1"
                            className="pharma-input"
                            value={vitalSigns.temperature || ''}
                            onChange={(e) => handleVitalsChange('temperature', e.target.value)}
                            placeholder="36.5"
                          />
                        </div>
                        <div className="field-row">
                          <label>BP (Systolic)</label>
                          <input
                            type="number"
                            className="pharma-input"
                            value={vitalSigns.bloodPressureSystolic || ''}
                            onChange={(e) => handleVitalsChange('bloodPressureSystolic', e.target.value)}
                            placeholder="120"
                          />
                        </div>
                        <div className="field-row">
                          <label>BP (Diastolic)</label>
                          <input
                            type="number"
                            className="pharma-input"
                            value={vitalSigns.bloodPressureDiastolic || ''}
                            onChange={(e) => handleVitalsChange('bloodPressureDiastolic', e.target.value)}
                            placeholder="80"
                          />
                        </div>
                        <div className="field-row">
                          <label>Heart Rate (bpm)</label>
                          <input
                            type="number"
                            className="pharma-input"
                            value={vitalSigns.heartRate || ''}
                            onChange={(e) => handleVitalsChange('heartRate', e.target.value)}
                            placeholder="72"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="general-system-grid">
                        <div className="field-row">
                          <label>Assessment Status</label>
                          <select
                            className="pharma-input"
                            value={exam?.normal ? 'Normal' : 'Abnormal'}
                            onChange={(e) =>
                              handleSystemStatusChange(
                                key as Exclude<SystemKey, 'vitals'>,
                                e.target.value
                              )
                            }
                          >
                            <option value="Normal">Normal / Unremarkable</option>
                            <option value="Abnormal">Abnormal / Significant Finding</option>
                            <option value="Not Done">Not Performed</option>
                          </select>
                        </div>
                        <div className="field-row full-width mt-6">
                          <label>Clinical Findings / Comments</label>
                          <textarea
                            className="pharma-input"
                            value={exam?.findings || ''}
                            onChange={(e) =>
                              handleSystemFindingsChange(
                                key as Exclude<SystemKey, 'vitals'>,
                                e.target.value
                              )
                            }
                            placeholder="Specific observations, murmurs, bruits, or neurological deficits..."
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex-end mt-6">
                      <button
                        className="pharma-btn pharma-btn-primary btn-sm"
                        onClick={() => saveSystem(key)}
                      >
                        <span>Sync {system.label}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Summary Sidebar */}
        <aside className="exam-summary">
          <div className="pharma-card pharma-card-elevated sticky-card glass-glow">
            <div className="section-title mb-8">
              <svg viewBox="0 0 24 24" fill="none" className="title-icon hit">
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h2>Exam Integrity</h2>
            </div>

            <div className="integrity-metric">
              <div className="metric-circle-container">
                <svg className="progress-ring" width="120" height="120">
                  <circle
                    className="progress-ring__bg"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="8"
                    fill="transparent"
                    r="50"
                    cx="60"
                    cy="60"
                  />
                  <circle
                    className="progress-ring__circle"
                    stroke="var(--pharma-primary)"
                    strokeWidth="8"
                    strokeDasharray="314.159"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    r="50"
                    cx="60"
                    cy="60"
                  />
                </svg>
                <div className="percent-display">
                  <span className="percent-val">{completionPercent}%</span>
                  <span className="percent-label">DONE</span>
                </div>
              </div>
              <p className="integrity-status mt-4">
                Physical exam is {completionPercent}% documented.
              </p>
            </div>

            <div className="status-list mt-8">
              {(Object.keys(systems) as SystemKey[]).map((key) => (
                <div
                  key={key}
                  className={`status-row ${isSystemCompleted(key) ? 'completed' : ''}`}
                >
                  <div className="status-dot" />
                  <span className="status-text">{systems[key].label}</span>
                  {isSystemCompleted(key) && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="status-check"
                    >
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              ))}
            </div>

            <button
              className="pharma-btn pharma-btn-primary full-width mt-10"
              onClick={submitFinalExam}
            >
              <span>Commit Full Exam</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                style={{ width: '18px', height: '18px' }}
              >
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  strokeWidth="2"
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

export default PhysicalExam;