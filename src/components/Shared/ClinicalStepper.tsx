import React from 'react';
import './ClinicalStepper.css';

interface Step {
  id: string | number;
  label: string;
  completed?: boolean;
  active?: boolean;
}

interface ClinicalStepperProps {
  steps: Step[];
  currentStep?: string | number;
  onStepChange?: (stepId: string | number) => void;
  onStepClick?: (stepId: string | number) => void;
}

const ClinicalStepper: React.FC<ClinicalStepperProps> = ({
  steps,
  currentStep,
  onStepChange,
  onStepClick,
}) => {
  return (
    <div className="clinical-stepper">
      {steps.map((step, index) => {
        let isActive = false;
        let isCompleted = false;

        // Determine status based on currentStep prop
        if (currentStep !== undefined) {
          if (step.id === currentStep) {
            isActive = true;
          }
          // For numeric IDs, a step is completed if its ID is less than the currentStep's ID
          if (typeof step.id === 'number' && typeof currentStep === 'number' && step.id < currentStep) {
            isCompleted = true;
          }
        }

        // Allow explicit 'active' and 'completed' properties on the step object to override
        if (step.active !== undefined) {
          isActive = step.active;
        }
        if (step.completed !== undefined) {
          isCompleted = step.completed;
        }

        const stepClassName = `stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;

        const handleStepAction = () => {
          onStepClick?.(step.id);
          onStepChange?.(step.id);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleStepAction();
            e.preventDefault();
          }
        };

        return (
          <React.Fragment key={step.id}>
            <div
              className={stepClassName}
              onClick={handleStepAction}
              role="button"
              tabIndex={0}
              onKeyDown={handleKeyDown}
            >
              <div className="step-indicator">
                {isCompleted ? (
                  // Using SVG for checkmark from Resource 2 for better styling flexibility
                  <svg viewBox="0 0 24 24" fill="none" className="check-icon">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  // Using index + 1 for step number, a common UI pattern
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
            {index < steps.length - 1 && <div className="stepper-connector" />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ClinicalStepper;