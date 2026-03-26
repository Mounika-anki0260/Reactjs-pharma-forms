import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { setVisits as setSchedule, setLabValue, setSelectedVisitId as setReduxSelectedVisitId } from '../../features/visits/visitsSlice';
import { logChange, markSaved } from '../../features/audit/auditSlice';
import { generateVisitSchedule, evaluateLabTrends, Visit } from '../../utils/visitScheduler';
import { motion } from 'framer-motion';
import './VisitLabTracking.css';

const VisitLabTracking: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const schedule = useAppSelector((state) => state.visits.visits);
  const labsByVisit = useAppSelector((state) => state.visits.labsByVisit);
  const selectedVisitIdFromStore = useAppSelector((state) => state.visits.selectedVisitId);

  const [baselineDate, setBaselineDate] = useState<string>('');
  const [patternRaw, setPatternRaw] = useState<string>('0, 7, 14, 28, 56, 84');
  const [selectedVisitId, setSelectedVisitId] = useState<string>(selectedVisitIdFromStore || '');
  const [alt, setAlt] = useState<number | null>(null);
  const [creatinine, setCreatinine] = useState<number | null>(null);

  const altTrend = useMemo(() => evaluateLabTrends(labsByVisit as any, 'alt'), [labsByVisit]);

  const selectedVisitName = useMemo(() => {
    const v = schedule.find((s) => s.id === selectedVisitId);
    return v ? (v.name as string) : '';
  }, [schedule, selectedVisitId]);

  useEffect(() => {
    if (!selectedVisitId) return;
    const labs = labsByVisit[selectedVisitId] || {};
    setAlt(labs.alt as number | null);
    setCreatinine(labs.creatinine as number | null);
  }, [selectedVisitId, labsByVisit]);

  useEffect(() => {
    if (selectedVisitIdFromStore && selectedVisitIdFromStore !== selectedVisitId) {
      setSelectedVisitId(selectedVisitIdFromStore);
    } else if (!selectedVisitIdFromStore && selectedVisitId) {
      setSelectedVisitId('');
    }
  }, [selectedVisitIdFromStore, selectedVisitId]);

  const handleGenerateSchedule = (): void => {
    const pattern = patternRaw
      .split(',')
      .map((v) => parseInt(v.trim(), 10))
      .filter((v) => !isNaN(v));
    const sched = generateVisitSchedule(baselineDate, pattern);
    dispatch(setSchedule(sched as any));
    dispatch(
      logChange({
        entity: 'visits',
        field: 'schedule',
        oldValue: 'custom',
        newValue: 'generated'
      })
    );
    dispatch(markSaved());
    if (sched.length) {
      const firstId = sched[0].id || '';
      setSelectedVisitId(firstId);
      dispatch(setReduxSelectedVisitId(firstId));
    }
  };

  const handleLabChange = (name: string, value: number | null): void => {
    if (!selectedVisitId) return;
    const oldValue = (labsByVisit[selectedVisitId] || {})[name];
    dispatch(setLabValue({ visitId: selectedVisitId, labName: name, value }));
    dispatch(
      logChange({
        entity: `labs.${selectedVisitId}`,
        field: name,
        oldValue,
        newValue: value
      })
    );
  };

  const getDayFromVisit = (v: Visit): string | number => {
    return v.day != null ? v.day : '0';
  };

  const handleVisitSelect = (id: string): void => {
    setSelectedVisitId(id);
    dispatch(setReduxSelectedVisitId(id));
  };

  const proceedToAdverseEvents = (): void => {
    navigate('/adverse-events');
  };

  return (
    <motion.div
      className="pharma-view visits-labs animate-slide-up"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="pharma-title">Clinical Visit &amp; Laboratory Tracking</h1>

      <div className="pharma-grid grid-sidebar-left">
        {/* Schedule Configuration */}
        <aside className="schedule-pane">
          <div className="pharma-card pharma-card-elevated sticky-sidebar">
            <div className="section-title mb-8">
              <div className="icon-wrap-sm primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2>Study Schedule</h2>
            </div>

            <div className="form-group mb-6">
              <label className="pharma-label">Baseline Study Date</label>
              <div className="input-with-icon">
                <svg viewBox="0 0 24 24" fill="none" className="input-icon">
                  <path
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="date"
                  className="pharma-input"
                  value={baselineDate}
                  onChange={(e) => setBaselineDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group mb-8">
              <label className="pharma-label">Visit Pattern (Day Offsets)</label>
              <input
                className="pharma-input"
                value={patternRaw}
                onChange={(e) => setPatternRaw(e.target.value)}
                placeholder="e.g. 0, 7, 14, 28"
              />
              <p className="input-hint">Comma-separated days from baseline randomization.</p>
            </div>

            <button className="pharma-btn pharma-btn-primary full-width mb-10" onClick={handleGenerateSchedule}>
              <span>Generate Study Schedule</span>
            </button>

            {schedule.length > 0 && (
              <div className="visit-timeline">
                <h3 className="timeline-title">Study Timeline</h3>
                <div className="timeline-scroll">
                  {schedule.map((v) => (
                    <div
                      key={v.id}
                      className={`visit-card ${v.id === selectedVisitId ? 'active' : ''}`}
                      onClick={() => handleVisitSelect(v.id)}
                    >
                      <div className="visit-marker"></div>
                      <div className="visit-main">
                        <div className="visit-header">
                          <span className="visit-name">{v.name as string}</span>
                          <span className="visit-day">Day {getDayFromVisit(v as any)}</span>
                        </div>
                        <span className="visit-date">{v.date as string}</span>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" className="chevron-icon">
                        <path
                          d="M9 5l7 7-7 7"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Lab Content */}
        <main className="labs-pane">
          {selectedVisitId ? (
            <div className="pharma-card pharma-card-elevated min-h-600">
              <div className="flex-between mb-8">
                <div className="section-title">
                  <div className="icon-wrap-sm secondary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h2>Lab Results: {selectedVisitName}</h2>
                    <p className="text-muted">Recording clinical chemistry for audit compliance.</p>
                  </div>
                </div>
                <div className="status-pill pulse-pill">
                  <span className="pill-dot"></span>
                  LIVE RECORDING
                </div>
              </div>

              <div className="grid-2 gap-8 mt-10">
                <div className="lab-input-card">
                  <div className="lab-meta">
                    <label>ALT (Alanine Aminotransferase)</label>
                    <span className="unit-badge">U/L</span>
                  </div>
                  <input
                    type="number"
                    className="pharma-input pharma-input-large"
                    value={alt ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : Number(e.target.value);
                      setAlt(val);
                      handleLabChange('alt', val);
                    }}
                    placeholder="0"
                  />
                  <div className="range-info mt-3">
                    <span className="range-label">Normal Range:</span>
                    <span className="range-val">7–55 U/L</span>
                  </div>
                </div>

                <div className="lab-input-card">
                  <div className="lab-meta">
                    <label>Serum Creatinine</label>
                    <span className="unit-badge">mg/dL</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    className="pharma-input pharma-input-large"
                    value={creatinine ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : Number(e.target.value);
                      setCreatinine(val);
                      handleLabChange('creatinine', val);
                    }}
                    placeholder="0.00"
                  />
                  <div className="range-info mt-3">
                    <span className="range-label">Normal Range:</span>
                    <span className="range-val">0.7–1.3 mg/dL</span>
                  </div>
                </div>
              </div>

              <div className="premium-divider my-12"></div>

              <div className="section-title mb-8">
                <div className="icon-wrap-sm accent">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 12l3-3 3 3 4-4" />
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2>Biomarker Trend Analysis</h2>
              </div>

              <div className="trend-dashboard glass-glow">
                <div className="trend-meta">
                  <div className="trend-label-group">
                    <span className="trend-subject">ALT Liver Function</span>
                    <span className="trend-period">Current Study Period</span>
                  </div>
                  <div className={`trend-status-badge ${altTrend.trend}`}>
                    {altTrend.trend === 'increasing' && (
                      <svg viewBox="0 0 24 24" fill="none" className="trend-arrow">
                        <path
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    {altTrend.trend === 'decreasing' && (
                      <svg viewBox="0 0 24 24" fill="none" className="trend-arrow">
                        <path
                          d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    <span className="trend-text">{(altTrend.trend || 'stable').toUpperCase()}</span>
                  </div>
                </div>

                <div className="chart-container mt-8">
                  <div className="chart-y-axis">
                    <span>150</span>
                    <span>100</span>
                    <span>50</span>
                    <span>0</span>
                  </div>
                  <div className="chart-bars">
                    {altTrend.points.map((p, idx) => (
                      <div key={p.visitId} className="chart-bar-wrapper">
                        <div className="chart-bar-glow" style={{ height: `${p.value / 1.5}%` }}>
                          <div className="bar-value">{p.value}</div>
                          <div className="bar-tooltip">Visit {idx + 1}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-x-axis">
                  {altTrend.points.map((p) => (
                    <span key={p.visitId}>
                      {p.visitId.split('-')[1] ? `V${p.visitId.split('-')[1]}` : 'B'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="alert-strip mt-10 warning shadow-glow">
                <svg viewBox="0 0 24 24" fill="none" className="alert-icon">
                  <path
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="alert-content">
                  <strong>Clinical Guardrail:</strong> Trends exceeding 20% variance from baseline trigger automatic
                  investigator notification and safety review workflow.
                </div>
              </div>

              <button
                className="pharma-btn pharma-btn-primary full-width mt-10 shine-effect"
                onClick={proceedToAdverseEvents}
              >
                <span>Complete &amp; Continue to Adverse Events</span>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: '18px', height: '18px', marginLeft: '8px' }}>
                  <path
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div className="pharma-card empty-card glass-morph">
              <div className="empty-state-visual">
                <div className="pulse-circle"></div>
                <svg viewBox="0 0 24 24" fill="none" className="empty-icon">
                  <path
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Awaiting Visit Selection</h3>
              <p>
                Please select a visit from the clinical schedule on the left to review or record laboratory
                diagnostics.
              </p>
            </div>
          )}
        </main>
      </div>
    </motion.div>
  );
};

export default VisitLabTracking;