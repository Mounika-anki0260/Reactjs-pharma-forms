import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuditState, AuditEntry, SubmissionState, ConfirmDialogState } from './auditTypes';

interface LogChangePayload {
  entity?: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  user?: string;
}

interface RequestConfirmationPayload {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'info' | 'error';
  resolve?: (value: boolean) => void;
  pendingNavigation?: string;
}

const initialState: AuditState = {
  entries: [],
  hasUnsavedChanges: false,
  submissionState: 'draft',
  confirmDialog: {
    show: false,
    title: 'Unsaved Changes',
    message: 'You have unsaved clinical data. Are you sure you want to discard your changes and leave this page?',
    confirmText: 'Discard Changes',
    cancelText: 'Stay on Page',
    type: 'warning',
    resolve: null,
    pendingNavigation: null,
  }
};

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    logChange(state, action: PayloadAction<LogChangePayload>) {
      const { entity, field, oldValue, newValue, user = 'currentUser' } = action.payload;
      const entry: AuditEntry = {
        timestamp: new Date().toISOString(),
        entity: entity ?? 'unknown',
        field,
        oldValue,
        newValue,
        user
      };
      state.entries.push(entry);
      state.hasUnsavedChanges = true;
    },
    markSaved(state) {
      state.hasUnsavedChanges = false;
    },
    clearUnsavedChanges(state) {
      state.hasUnsavedChanges = false;
    },
    requestConfirmation(state, action: PayloadAction<RequestConfirmationPayload | undefined>) {
      state.confirmDialog.show = true;
      const payload = action.payload;

      state.confirmDialog.title = payload?.title ?? initialState.confirmDialog.title;
      state.confirmDialog.message = payload?.message ?? initialState.confirmDialog.message;
      state.confirmDialog.confirmText = payload?.confirmText ?? initialState.confirmDialog.confirmText;
      state.confirmDialog.cancelText = payload?.cancelText ?? initialState.confirmDialog.cancelText;
      state.confirmDialog.type = payload?.type ?? initialState.confirmDialog.type;
      state.confirmDialog.resolve = payload?.resolve ?? null;
      state.confirmDialog.pendingNavigation = payload?.pendingNavigation ?? null;
    },
    confirmDialogResult(state, action: PayloadAction<boolean>) {
      if (state.confirmDialog.resolve) {
        state.confirmDialog.resolve(action.payload);
      }
      state.confirmDialog.show = false;
      state.confirmDialog.resolve = null;
      if (action.payload) {
        state.hasUnsavedChanges = false;
      }
      state.confirmDialog.pendingNavigation = null;
    },
    hideConfirmDialog(state) {
      state.confirmDialog.show = false;
      state.confirmDialog.resolve = null;
      state.confirmDialog.pendingNavigation = null;
    },
    setSubmissionState(state, action: PayloadAction<SubmissionState>) {
      state.submissionState = action.payload;
    },
    clearAuditEntries(state) {
      state.entries = [];
    },
    resetAudit(state) {
      state.entries = [];
      state.hasUnsavedChanges = false;
      state.submissionState = 'draft';
      state.confirmDialog = {
        show: false,
        title: initialState.confirmDialog.title,
        message: initialState.confirmDialog.message,
        confirmText: initialState.confirmDialog.confirmText,
        cancelText: initialState.confirmDialog.cancelText,
        type: initialState.confirmDialog.type,
        resolve: null,
        pendingNavigation: null,
      };
    },
    markUnsaved(state) {
      state.hasUnsavedChanges = true;
    },
    confirmAction(state) {
      state.hasUnsavedChanges = false;
    },
    cancelAction(state) {
      state.confirmDialog.pendingNavigation = null;
    },
    setPendingNavigation(state, action: PayloadAction<string | null>) {
      state.confirmDialog.pendingNavigation = action.payload;
    },
  },
  selectors: {
    selectAuditEntries: (state) => state.entries,
    selectHasUnsavedChanges: (state) => state.hasUnsavedChanges,
    selectSubmissionState: (state) => state.submissionState,
    selectConfirmDialog: (state) => state.confirmDialog,
  },
});

export const {
  logChange,
  markSaved,
  clearUnsavedChanges,
  requestConfirmation,
  confirmDialogResult,
  hideConfirmDialog,
  setSubmissionState,
  clearAuditEntries,
  resetAudit,
  markUnsaved,
  confirmAction,
  cancelAction,
  setPendingNavigation,
} = auditSlice.actions;

export const {
  selectAuditEntries,
  selectHasUnsavedChanges,
  selectSubmissionState,
  selectConfirmDialog,
} = auditSlice.selectors;

export default auditSlice.reducer;