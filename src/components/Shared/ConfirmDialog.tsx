import React, { useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppDispatch';
import {
  confirmDialogResult,
  hideConfirmDialog,
  confirmAction,
  cancelAction
} from '../../features/audit/auditSlice';
import './ConfirmDialog.css';

type DialogType = 'warning' | 'info';

interface ConfirmDialogConfig {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: DialogType;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20
  }
};

const ConfirmDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showConfirmDialog, confirmDialogConfig } = useAppSelector(
    (state) => state.audit
  );

  const {
    title = 'Unsaved Changes',
    message = 'You have unsaved clinical data. Are you sure you want to discard your changes and leave this page?',
    confirmText = 'Discard Changes',
    cancelText = 'Stay on Page',
    type = 'warning',
    onConfirm,
    onCancel
  } = confirmDialogConfig || {};

  const handleConfirm = useCallback(() => {
    dispatch(confirmAction());
    dispatch(confirmDialogResult(true));
    if (onConfirm) {
      onConfirm();
    }
    dispatch(hideConfirmDialog());
  }, [dispatch, onConfirm]);

  const handleCancel = useCallback(() => {
    dispatch(cancelAction());
    dispatch(confirmDialogResult(false));
    if (onCancel) {
      onCancel();
    }
    dispatch(hideConfirmDialog());
  }, [dispatch, onCancel]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        handleCancel();
      }
    },
    [handleCancel]
  );

  const confirmBtnClass =
    type === 'warning' ? 'pharma-btn pharma-btn-danger' : 'pharma-btn pharma-btn-primary';

  return (
    <AnimatePresence>
      {showConfirmDialog && (
        <motion.div
          className="confirm-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.3 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className="confirm-modal glass-glow"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-header">
              <div className={`confirm-icon-wrap ${type}`}>
                {type === 'warning' ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <h3 className="confirm-title">{title}</h3>
            </div>

            <div className="confirm-content">
              <p>{message}</p>
            </div>

            <div className="confirm-footer">
              <button
                className="pharma-btn pharma-btn-secondary"
                onClick={handleCancel}
              >
                <span>{cancelText}</span>
              </button>
              <button className={confirmBtnClass} onClick={handleConfirm}>
                <span>{confirmText}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;