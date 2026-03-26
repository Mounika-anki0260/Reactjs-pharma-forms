import React, { useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { setCriterionStatus, setJustification } from '../../features/protocol/protocolSlice';
import { logChange } from '../../features/audit/auditSlice';
import {
  Criterion,
  EligibilityStatus,
  CriteriaType
} from '../../features/protocol/protocolTypes';
import {
  selectInclusionCriteria,
  selectExclusionCriteria,
  selectJustifications,
  selectCompletionPercent,
  selectEligibilityStatus
} from '../../features/protocol/protocolSelectors';
import { motion } from 'framer-motion';
import './ProtocolView.css';

const ProtocolView: React.FC = () => {
  const dispatch = useAppDispatch();
  const inclusionCriteria = useAppSelector(selectInclusionCriteria);
  const exclusionCriteria = useAppSelector(selectExclusionCriteria);
  const justifications = useAppSelector(selectJustifications);
  const completionPercent = useAppSelector(selectCompletionPercent);
  const eligibilityStatus = useAppSelector(selectEligibilityStatus);

  const subjectId = useMemo(() => Math.floor(Math.random() * 9000 + 1000), []);

  const handleSetStatus = useCallback(
    (type: CriteriaType, id: string, status: boolean) => {
      dispatch(setCriterionStatus({ type, id, status }));
    },
    [dispatch]
  );

  const handleJustificationChange = useCallback(
    (id: string, text: string) => {
      dispatch(setJustification({ id, text }));
    },
    [dispatch]
  );

  const handleSaveProtocol = useCallback(() => {
    dispatch(
      logChange({
        entity: 'protocol',
        field: 'criteria',
        oldValue: 'pending',
        newValue: 'submitted'
      })
    );
    alert('Protocol criteria saved and locked for independent monitor review.');
  }, [dispatch]);

  const renderCriteriaCard = (
    criterion: Criterion,
    type: CriteriaType,
    isExclusion: boolean
  ): React.ReactElement => {
    const cardClass = isExclusion
      ? criterion.status === true
        ? 'not-met'
        : criterion.status === false
        ? 'met'
        : ''
      : criterion.status === false
      ? 'not-met'
      : criterion.status === true
      ? 'met'
      : '';

    const showJustification = isExclusion ? criterion.status === true : criterion.status === false;

    return (
      <div key={criterion.id} className={`criteria-card ${cardClass}`}>
        <div className="criteria-main">
          <div className="criteria-text">
            <span className="criteria-id">{criterion.id}</span>
            <p className="criteria-description">{criterion.text}</p>
            {criterion.mandatory && (
              <span className={`pharma-badge ${isExclusion ? 'danger' : 'active'} mt-2`}>
                {isExclusion ? 'Critical Exclusion' : 'Mandatory Inclusion'}
              </span>
            )}
          </div>
          <div className="criteria-actions">
            {isExclusion ? (
              <>
                <button
                  className={`criteria-btn yes-safe ${criterion.status === false ? 'active' : ''}`}
                  onClick={() => handleSetStatus(type, criterion.id, false)}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="btn-icon">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>No</span>
                </button>
                <button
                  className={`criteria-btn no-danger ${criterion.status === true ? 'active' : ''}`}
                  onClick={() => handleSetStatus(type, criterion.id, true)}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="btn-icon">
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Yes (Excl)</span>
                </button>
              </>
            ) : (
              <>
                <button
                  className={`criteria-btn yes ${criterion.status === true ? 'active' : ''}`}
                  onClick={() => handleSetStatus(type, criterion.id, true)}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="btn-icon">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Met</span>
                </button>
                <button
                  className={`criteria-btn no ${criterion.status === false ? 'active' : ''}`}
                  onClick={() => handleSetStatus(type, criterion.id, false)}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="btn-icon">
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Not Met</span>
                </button>
              </>
            )}
          </div>
        </div>

        {showJustification && (
          <div className="justification-area">
            <div className={`alert-strip ${isExclusion ? 'warning' : 'danger'}`}>
              <svg viewBox="0 0 24 24" fill="none" className="alert-icon">
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>
                {isExclusion
                  ? 'Safety Override Justification Required'
                  : 'Deviation Justification Required'}
              </span>
            </div>
            <textarea
              className="pharma-input mt-4"
              value={justifications[criterion.id] || ''}
              onChange={(e) => handleJustificationChange(criterion.id, e.target.value)}
              placeholder={
                isExclusion
                  ? 'Provide safety justification for enrollment despite meeting exclusion criteria...'
                  : 'Explain why the subject is enrolled despite not meeting this criterion...'
              }
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="pharma-view protocol-view animate-slide-up"
    >
      <h1 className="pharma-title">Study Protocol &amp; I/E Criteria</h1>

      <div className="pharma-grid grid-2">
        {/* Inclusion Criteria */}
        <section className="pharma-card pharma-card-elevated">
          <div className="section-title mb-8">
            <div className="icon-wrap inclusion-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2>Inclusion Criteria</h2>
          </div>

          <div className="criteria-list">
            {inclusionCriteria.map((c: Criterion) => renderCriteriaCard(c, 'inclusion', false))}
          </div>
        </section>

        {/* Exclusion Criteria */}
        <section className="pharma-card pharma-card-elevated">
          <div className="section-title mb-8">
            <div className="icon-wrap exclusion-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2>Exclusion Criteria</h2>
          </div>

          <div className="criteria-list">
            {exclusionCriteria.map((c: Criterion) => renderCriteriaCard(c, 'exclusion', true))}
          </div>
        </section>
      </div>

      {/* Eligibility Summary */}
      <div className="pharma-card mt-8 glass-glow eligibility-footer">
        <div className="flex-between">
          <div className="footer-info">
            <h2 className="mb-2">Protocol Completion Status</h2>
            <p className="text-muted">Analyzing subject #{subjectId} against clinical trial parameters.</p>
          </div>
          <div className={`status-box ${eligibilityStatus.class}`}>
            <div className="pulse-ring"></div>
            <span className="status-label">{eligibilityStatus.text}</span>
          </div>
        </div>

        <div className="progress-section mt-8">
          <div className="progress-meta mb-3">
            <span className="progress-label">Screening Progress</span>
            <span className="progress-val">{completionPercent}%</span>
          </div>
          <div className="progress-track-premium">
            <div
              className="progress-bar-glow"
              style={{ width: `${completionPercent}%` }}
            ></div>
          </div>
        </div>

        <button
          className="pharma-btn pharma-btn-primary full-width mt-10"
          onClick={handleSaveProtocol}
        >
          <span>Freeze &amp; Submit Screening Criteria</span>
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
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
    </motion.div>
  );
};

export default ProtocolView;