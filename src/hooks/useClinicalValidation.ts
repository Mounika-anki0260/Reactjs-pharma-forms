import { useState, useCallback } from 'react';

interface ValidationRule<T> {
  field: keyof T;
  validate: (value: T[keyof T], formData: T) => boolean;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function useClinicalValidation<T extends Record<string, unknown>>(
  rules: ValidationRule<T>[]
) {
  const [errors, setErrors] = useState<string[]>([]);

  const validate = useCallback(
    (formData: T): ValidationResult => {
      const validationErrors: string[] = [];

      rules.forEach((rule) => {
        const value = formData[rule.field];
        if (!rule.validate(value, formData)) {
          validationErrors.push(rule.message);
        }
      });

      setErrors(validationErrors);

      return {
        isValid: validationErrors.length === 0,
        errors: validationErrors,
      };
    },
    [rules]
  );

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    validate,
    clearErrors,
  };
}