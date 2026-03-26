export interface AuditEntry {
  timestamp: string;
  entity?: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  user?: string;
}

export interface ConfirmDialogState {
  show: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'info';
  pendingNavigationPath: string | null;
  pendingNavigation: string | null;
  resolve?: ((value: boolean) => void) | null;
}

export type SubmissionState = 'draft' | 'submitted' | 'approved' | 'rejected' | 'pending' | 'ready_for_review';

export interface AuditLogEntry {
  timestamp: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  userId?: string;
}

export interface AuditState {
  entries: AuditEntry[];
  hasUnsavedChanges: boolean;
  submissionState: SubmissionState;
  confirmDialog: ConfirmDialogState;
  pendingNavigationPath: string | null;
  pendingNavigation?: string | null;
  auditLog?: AuditLogEntry[];
}

export interface LogChangePayload {
  entity: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  user?: string;
}

export interface RequestConfirmationPayload {
  title: string;
  message: string;
}