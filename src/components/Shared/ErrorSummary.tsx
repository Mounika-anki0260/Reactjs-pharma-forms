import React from 'react';
import { CSSTransition } from 'react-transition-group';
import { motion, AnimatePresence } from 'framer-motion';
import './ErrorSummary.css';

interface ErrorSummaryProps {
  errors: string[];
  title?: string;
}

const ErrorSummary: React.FC<ErrorSummaryProps> = ({ errors, title = 'Validation Errors' }) => {
  const nodeRef = React.useRef<HTMLDivElement>(null); // Variable from Resource 1, retained.

  return (
    <AnimatePresence>
      {errors && errors.length > 0 && (
        <motion.div
          className="error-summary"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          // Note: nodeRef from Resource 1 is kept as a variable, but framer-motion handles refs internally for animation.
          // If direct DOM access for other purposes was intended, ref={nodeRef} could be added here.
        >
          <div className="error-header">
            {/* SVG icon from Resource 2, chosen for consistency with the 'title' prop usage */}
            <svg viewBox="0 0 24 24" fill="none" className="error-icon">
              <path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {/* Heading and title prop from Resource 2 */}
            <h4>{title}</h4>
          </div>
          {/* Unordered list with class from Resource 2 */}
          <ul className="error-list">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorSummary;