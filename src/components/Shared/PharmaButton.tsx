import React from 'react';

interface PharmaButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
}

const PharmaButton: React.FC<PharmaButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
}) => {
  const variantClass = `pharma-btn-${variant}`;
  const widthClass = fullWidth ? 'full-width' : '';

  return (
    <button
      type={type}
      className={`pharma-btn ${variantClass} ${widthClass} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default PharmaButton;