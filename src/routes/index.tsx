import React, { useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../hooks/useAppDispatch';
import { requestConfirmation, clearUnsavedChanges, confirmDialogResult } from '../features/audit/auditSlice';

// Lazy load pages for code splitting from Resource 1
const PatientIntake = React.lazy(() => import('../pages/PatientIntake/PatientIntake'));
const MedicationConfig = React.lazy(() => import('../pages/Medication/MedicationConfig'));
const AdverseEvents = React.lazy(() => import('../pages/AdverseEvents/AdverseEvents'));
const VisitLabTracking = React.lazy(() => import('../pages/LabTracking/VisitLabTracking'));
const ProtocolView = React.lazy(() => import('../pages/Protocol/ProtocolView'));
const PhysicalExam = React.lazy(() => import('../pages/PhysicalExam/PhysicalExam'));
const RegulatoryDashboard = React.lazy(() => import('../pages/Dashboard/RegulatoryDashboard'));

// From Resource 1
const pageVariants = {
  initial: {
    opacity: 0,
    y: 10
  },
  animate: {
    opacity: 1,
    y: 0
  },
  exit: {
    opacity: 0,
    y: -10
  }
};

// From Resource 1
const pageTransition = {
  duration: 0.3,
  ease: 'easeInOut'
};

// From Resource 1
interface AnimatedPageProps {
  children: React.ReactNode;
}

// From Resource 1
const AnimatedPage: React.FC<AnimatedPageProps> = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

// From Resource 2 (interface)
interface NavigationGuardProps {
  children: React.ReactNode;
}

const NavigationGuard: React.FC<NavigationGuardProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Combined state selection from Resource 1 and Resource 2
  const { hasUnsavedChanges, confirmDialog } = useAppSelector((state) => state.audit);
  const previousPathRef = React.useRef<string>(location.pathname); // From Resource 2

  // This method is primarily used internally by the NavigationGuard for proactive checks,
  // or by the useNavigationGuard hook for external components to initiate guarded navigation.
  // Merged logic from R1's handleBeforeNavigate and R2's handleBeforeNavigation
  const handleBeforeNavigation = useCallback(
    (targetPath: string) => {
      // Using previousPathRef from R2 for more accurate comparison
      if (hasUnsavedChanges && targetPath !== previousPathRef.current) {
        dispatch(
          requestConfirmation({
            title: 'Unsaved Clinical Data',
            message:
              'You have unsaved changes in this medical form. Discarding changes may impact trial data integrity. Proceed?',
            // Using pendingNavigation as per R2's more explicit state structure
            pendingNavigation: targetPath,
          })
        );
        return false; // Prevent immediate navigation
      }
      return true; // Allow immediate navigation
    },
    [hasUnsavedChanges, dispatch, previousPathRef]
  );

  // This effect handles the actual navigation after the confirmation dialog resolves.
  // It checks the outcome (confirmDialog.result) to decide whether to navigate or clear changes.
  // This useEffect block is primarily from Resource 2, incorporating R1's clearUnsavedChanges logic.
  useEffect(() => {
    // If dialog is not shown, there's a pending navigation, and we have a result
    if (confirmDialog.pendingNavigation && !confirmDialog.show && confirmDialog.result !== undefined) {
      if (confirmDialog.result === true) { // User confirmed (e.g., "Discard Changes")
        dispatch(clearUnsavedChanges()); // Clear changes from R1's logic
        // Only navigate if the pending path is different from the current path
        if (confirmDialog.pendingNavigation !== location.pathname) {
          navigate(confirmDialog.pendingNavigation);
        }
      }
      // If confirmDialog.result is false, user cancelled, so do nothing (stay on current page).

      // Manually clear the dialog result and pending navigation to prevent re-triggering
      // if the auditSlice doesn't handle it immediately after dispatching `confirmDialogResult`
      dispatch(confirmDialogResult({ result: undefined, pendingNavigation: null }));
    }
  }, [
    confirmDialog.pendingNavigation,
    confirmDialog.show,
    confirmDialog.result,
    dispatch,
    navigate,
    location.pathname,
  ]);

  // Effect to keep track of the previous path. (From Resource 2)
  useEffect(() => {
    previousPathRef.current = location.pathname;
  }, [location.pathname]);

  // Effect to handle browser's back/forward button (popstate event). (From Resource 2)
  // Prevents navigation if unsaved changes exist and prompts the user.
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault(); // Prevent default browser back/forward if unsaved changes
        dispatch(
          requestConfirmation({
            title: 'Unsaved Clinical Data',
            message:
              'You have unsaved changes in this medical form. Discarding changes may impact trial data integrity. Proceed?',
            pendingNavigation: window.location.pathname, // Attempt to navigate to the browser's target path
          })
        );
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [hasUnsavedChanges, dispatch]);

  return <>{children}</>;
};

// Custom hook to allow components to trigger navigation with the guard applied. (From Resource 2)
export const useNavigationGuard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const hasUnsavedChanges = useAppSelector((state) => state.audit.hasUnsavedChanges);

  const guardedNavigate = useCallback(
    (to: string) => {
      if (hasUnsavedChanges) {
        dispatch(
          requestConfirmation({
            title: 'Unsaved Clinical Data',
            message:
              'You have unsaved changes in this medical form. Discarding changes may impact trial data integrity. Proceed?',
            pendingNavigation: to,
          })
        );
      } else {
        navigate(to);
      }
    },
    [hasUnsavedChanges, dispatch, navigate]
  );

  return { guardedNavigate };
};

const AppRoutes: React.FC = () => {
  return (
    // React.Suspense from Resource 1, necessary for lazy-loaded components
    <React.Suspense
      fallback={
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      }
    >
      <NavigationGuard>
        <Routes>
          <Route path="/" element={<Navigate to="/intake" replace />} />
          {/* Routes using AnimatedPage wrapper from Resource 1 */}
          <Route
            path="/intake"
            element={
              <AnimatedPage>
                <PatientIntake />
              </AnimatedPage>
            }
          />
          <Route
            path="/medication"
            element={
              <AnimatedPage>
                <MedicationConfig />
              </AnimatedPage>
            }
          />
          <Route
            path="/adverse-events"
            element={
              <AnimatedPage>
                <AdverseEvents />
              </AnimatedPage>
            }
          />
          <Route
            path="/visits"
            element={
              <AnimatedPage>
                <VisitLabTracking />
              </AnimatedPage>
            }
          />
          <Route
            path="/protocol"
            element={
              <AnimatedPage>
                <ProtocolView />
              </AnimatedPage>
            }
          />
          <Route
            path="/physical-exam"
            element={
              <AnimatedPage>
                <PhysicalExam />
              </AnimatedPage>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AnimatedPage>
                <RegulatoryDashboard />
              </AnimatedPage>
            }
          />
        </Routes>
      </NavigationGuard>
    </React.Suspense>
  );
};

export default AppRoutes;