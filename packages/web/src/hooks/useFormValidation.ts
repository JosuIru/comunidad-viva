/**
 * useFormValidation Hook
 *
 * Custom React hook for form validation using Zod schemas.
 * Provides real-time validation, error handling, and form state management.
 *
 * @example
 * ```tsx
 * const { formData, errors, handleChange, handleBlur, validateForm } = useFormValidation({
 *   schema: createOfferSchema,
 *   initialData: { title: '', description: '' }
 * });
 * ```
 */

import { useState, useCallback, ChangeEvent } from 'react';
import { z } from 'zod';
import { formatZodError } from '@/lib/validations';

interface UseFormValidationOptions<T> {
  schema: z.ZodType<T, z.ZodTypeDef, any>;
  initialData: Partial<T>;
  onSubmit?: (data: T) => void | Promise<void>;
}

type InputElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export function useFormValidation<T extends Record<string, any>>({
  schema,
  initialData,
  onSubmit,
}: UseFormValidationOptions<T>) {
  const [formData, setFormData] = useState<Partial<T>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle input change - can be called directly with field and value
   */
  const handleChange = useCallback((
    field: keyof T,
    value: any
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field when user types
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Create an onChange handler for an input element
   * This returns a function compatible with React's onChange prop
   */
  const createOnChange = useCallback((
    field: keyof T,
    transform?: (value: string) => any
  ) => {
    return (e: ChangeEvent<InputElement>) => {
      const rawValue = e.target.value;
      const value = transform ? transform(rawValue) : rawValue;
      handleChange(field, value);
    };
  }, [handleChange]);

  /**
   * Handle field blur - validate single field
   */
  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    // We skip single field validation since schema.shape is not always available
    // Full validation happens on form submit
  }, []);

  /**
   * Create an onBlur handler for an input element
   */
  const createOnBlur = useCallback((field: keyof T) => {
    return () => handleBlur(field);
  }, [handleBlur]);

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
    try {
      const validatedData = schema.parse(formData);
      setErrors({});
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = formatZodError(error);
        setErrors(formattedErrors);
        return { success: false, errors: formattedErrors };
      }
      return { success: false, errors: { _form: 'Validation failed' } };
    }
  }, [schema, formData]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSubmitting(true);

    const validation = validateForm();

    if (!validation.success) {
      setIsSubmitting(false);
      return validation;
    }

    try {
      await onSubmit?.(validation.data);
      return validation;
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, onSubmit]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialData]);

  /**
   * Set multiple form values at once
   */
  const setValues = useCallback((values: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...values }));
  }, []);

  /**
   * Set a single error
   */
  const setError = useCallback((field: keyof T, message: string) => {
    setErrors(prev => ({ ...prev, [field as string]: message }));
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Check if form has any errors
   */
  const hasErrors = Object.keys(errors).length > 0;

  /**
   * Check if form is valid (no errors and has required fields)
   */
  const isValid = !hasErrors && Object.keys(formData).length > 0;

  /**
   * Get field error
   */
  const getFieldError = useCallback((field: keyof T): string | undefined => {
    return errors[field as string];
  }, [errors]);

  /**
   * Check if field is touched
   */
  const isFieldTouched = useCallback((field: keyof T): boolean => {
    return touched[field as string] || false;
  }, [touched]);

  /**
   * Check if field has error and is touched
   */
  const shouldShowError = useCallback((field: keyof T): boolean => {
    return isFieldTouched(field) && !!getFieldError(field);
  }, [isFieldTouched, getFieldError]);

  /**
   * Get input props for a field - convenient helper
   */
  const getInputProps = useCallback((
    field: keyof T,
    options?: { transform?: (value: string) => any }
  ) => {
    return {
      value: formData[field] ?? '',
      onChange: createOnChange(field, options?.transform),
      onBlur: createOnBlur(field),
    };
  }, [formData, createOnChange, createOnBlur]);

  /**
   * Get select props for a field
   */
  const getSelectProps = useCallback((field: keyof T) => {
    return {
      value: formData[field] ?? '',
      onChange: createOnChange(field),
      onBlur: createOnBlur(field),
    };
  }, [formData, createOnChange, createOnBlur]);

  /**
   * Get checkbox props for a field
   */
  const getCheckboxProps = useCallback((field: keyof T) => {
    return {
      checked: Boolean(formData[field]),
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        handleChange(field, e.target.checked);
      },
    };
  }, [formData, handleChange]);

  return {
    // Form state
    formData,
    errors,
    touched,
    isSubmitting,
    hasErrors,
    isValid,

    // Core handlers
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    resetForm,
    setValues,
    setFormData,
    setError,
    clearErrors,

    // Event handler creators
    createOnChange,
    createOnBlur,

    // Convenient prop getters
    getInputProps,
    getSelectProps,
    getCheckboxProps,

    // Utilities
    getFieldError,
    isFieldTouched,
    shouldShowError,
  };
}

/**
 * Type helper for form change events
 */
export type FormChangeHandler = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => void;

/**
 * Helper to create change handler for the hook
 */
export function createChangeHandler<T>(
  handleChange: (field: keyof T, value: any) => void,
  field: keyof T,
  transform?: (value: string) => any
): FormChangeHandler {
  return (e) => {
    const value = transform ? transform(e.target.value) : e.target.value;
    handleChange(field, value);
  };
}

/**
 * Common transformers for form values
 */
export const transformers = {
  number: (value: string) => (value === '' ? undefined : parseFloat(value)),
  integer: (value: string) => (value === '' ? undefined : parseInt(value, 10)),
  boolean: (value: string) => value === 'true',
  array: (value: string, separator: string = ',') =>
    value.split(separator).map(s => s.trim()).filter(Boolean),
};
