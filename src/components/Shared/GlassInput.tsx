import React from 'react';

interface GlassInputProps {
  label: string;
  name: string;
  value: string | number;
  type?: 'text' | 'number' | 'date' | 'email' | 'tel';
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
}

const GlassInput: React.FC<GlassInputProps> = ({
  label,
  name,
  value,
  type = 'text',
  placeholder,
  readOnly = false,
  required = false,
  onChange,
  onBlur,
  error,
}) => {
  return (
    <div className="field-row">
      <label htmlFor={name}>
        {label}
        {required && <span style={{ color: 'var(--pharma-danger)' }}> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        onChange={onChange}
        onBlur={onBlur}
        className={`pharma-input ${error ? 'input-error' : ''}`}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
};

export default GlassInput;