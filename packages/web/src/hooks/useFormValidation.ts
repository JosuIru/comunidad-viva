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

import { useState, useCallback } from 'react';
import { z } from 'zod';
import { formatZodError } from '@/lib/validations';

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>;
  initialData: Partial<T>;
  onSubmit?: (data: T) => void | Promise<void>;
}

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
   * Handle input change
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
   * Handle field blur - validate single field
   */
  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    // Validate single field
    try {
      const fieldSchema = schema.shape?.[field as string];
      if (fieldSchema) {
        fieldSchema.parse(formData[field]);
        // Clear error if validation passes
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [field as string]: error.errors[0]?.message || 'Invalid value',
        }));
      }
    }
  }, [schema, formData]);

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

  return {
    // Form state
    formData,
    errors,
    touched,
    isSubmitting,
    hasErrors,
    isValid,

    // Handlers
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    resetForm,
    setValues,
    setError,
    clearErrors,

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
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
