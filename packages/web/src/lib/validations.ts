/**
 * Zod Validation Schemas
 *
 * Centralized validation schemas for forms and data validation.
 * Uses Zod for runtime type checking and validation.
 */

import { z } from 'zod';

/**
 * Common validation helpers
 */

// String validations
export const requiredString = (fieldName: string = 'Este campo') =>
  z.string().min(1, `${fieldName} es requerido`);

export const optionalString = z.string().optional();

export const email = z
  .string()
  .email('Email inválido')
  .min(1, 'Email es requerido');

export const url = z
  .string()
  .url('URL inválida')
  .optional()
  .or(z.literal(''));

// Number validations
export const positiveNumber = (fieldName: string = 'Este valor') =>
  z.number().positive(`${fieldName} debe ser positivo`);

export const nonNegativeNumber = (fieldName: string = 'Este valor') =>
  z.number().nonnegative(`${fieldName} debe ser mayor o igual a 0`);

export const optionalPositiveNumber = z.number().positive().optional();

// Array validations
export const stringArray = z.array(z.string());
export const nonEmptyStringArray = (fieldName: string = 'Este campo') =>
  z.array(z.string()).min(1, `${fieldName} debe tener al menos un elemento`);

// Coordinates
export const latitude = z
  .number()
  .min(-90, 'Latitud debe estar entre -90 y 90')
  .max(90, 'Latitud debe estar entre -90 y 90');

export const longitude = z
  .number()
  .min(-180, 'Longitud debe estar entre -180 y 180')
  .max(180, 'Longitud debe estar entre -180 y 180');

/**
 * Offer Validation Schema
 */
export const createOfferSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres'),

  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres'),

  category: requiredString('Categoría'),

  type: z.enum(['PRODUCT', 'SERVICE', 'SKILL', 'TIME_BANK', 'GROUP_BUY', 'EVENT'], {
    errorMap: () => ({ message: 'Tipo de oferta inválido' }),
  }),

  priceEur: z
    .number()
    .nonnegative('El precio en euros debe ser mayor o igual a 0')
    .optional(),

  priceCredits: z
    .number()
    .nonnegative('El precio en créditos debe ser mayor o igual a 0')
    .optional(),

  stock: z
    .number()
    .int('El stock debe ser un número entero')
    .nonnegative('El stock debe ser mayor o igual a 0')
    .optional(),

  address: z.string().optional(),

  lat: latitude.optional(),

  lng: longitude.optional(),

  tags: stringArray.default([]),

  images: z
    .array(z.any())
    .max(5, 'Máximo 5 imágenes permitidas')
    .optional()
    .default([]),
}).refine(
  (data) => {
    // At least one price must be set
    if (!data.priceEur && !data.priceCredits) {
      return false;
    }
    return true;
  },
  {
    message: 'Debes establecer un precio en euros o créditos',
    path: ['priceEur'],
  }
);

export type CreateOfferFormData = z.infer<typeof createOfferSchema>;

/**
 * Event Validation Schema
 */
export const createEventSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres'),

  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres'),

  address: requiredString('Dirección'),

  lat: latitude,

  lng: longitude,

  startsAt: z
    .string()
    .min(1, 'Fecha de inicio es requerida')
    .refine(
      (date) => new Date(date) > new Date(),
      'La fecha de inicio debe ser en el futuro'
    ),

  endsAt: z.string().optional(),

  capacity: z
    .number()
    .int('La capacidad debe ser un número entero')
    .positive('La capacidad debe ser mayor a 0')
    .optional(),

  category: z.string().optional(),

  type: z.enum(['VIRTUAL', 'IN_PERSON', 'HYBRID'], {
    errorMap: () => ({ message: 'Tipo de evento inválido' }),
  }).default('IN_PERSON'),

  creditsReward: nonNegativeNumber('Recompensa en créditos').optional(),

  tags: stringArray.default([]),

  requirements: stringArray.default([]),

  image: z.any().optional(),
}).refine(
  (data) => {
    // If endsAt is provided, it must be after startsAt
    if (data.endsAt && new Date(data.endsAt) <= new Date(data.startsAt)) {
      return false;
    }
    return true;
  },
  {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['endsAt'],
  }
);

export type CreateEventFormData = z.infer<typeof createEventSchema>;

/**
 * Housing Solution Validation Schema
 */
export const createHousingSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres'),

  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres'),

  location: requiredString('Ubicación'),

  lat: latitude,

  lng: longitude,

  solutionType: z.enum(
    ['SPACE_BANK', 'TEMPORARY_HOUSING', 'HOUSING_COOP', 'COMMUNITY_GUARANTEE'],
    { errorMap: () => ({ message: 'Tipo de solución inválido' }) }
  ),

  accommodationType: z
    .enum(['PRIVATE_ROOM', 'SHARED_ROOM', 'ENTIRE_PLACE'], {
      errorMap: () => ({ message: 'Tipo de acomodación inválido' }),
    })
    .optional(),

  capacity: z
    .number()
    .int('La capacidad debe ser un número entero')
    .positive('La capacidad debe ser mayor a 0')
    .optional(),

  beds: nonNegativeNumber('Número de camas').optional(),

  bathrooms: nonNegativeNumber('Número de baños').optional(),

  availableFrom: z.string().optional(),

  availableUntil: z.string().optional(),

  pricePerNight: nonNegativeNumber('Precio por noche').optional(),

  minStay: nonNegativeNumber('Estancia mínima').optional(),

  maxStay: nonNegativeNumber('Estancia máxima').optional(),

  amenities: stringArray.default([]),

  houseRules: stringArray.default([]),

  images: z
    .array(z.any())
    .max(10, 'Máximo 10 imágenes permitidas')
    .optional()
    .default([]),
}).refine(
  (data) => {
    // If both min and max stay are provided, min must be less than max
    if (data.minStay && data.maxStay && data.minStay > data.maxStay) {
      return false;
    }
    return true;
  },
  {
    message: 'La estancia mínima debe ser menor que la máxima',
    path: ['maxStay'],
  }
);

export type CreateHousingFormData = z.infer<typeof createHousingSchema>;

/**
 * Mutual Aid Need Validation Schema
 */
export const createNeedSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres'),

  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres'),

  scope: z.enum(['INDIVIDUAL', 'FAMILY', 'COMMUNITY'], {
    errorMap: () => ({ message: 'Alcance inválido' }),
  }),

  type: requiredString('Tipo de necesidad'),

  urgencyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    errorMap: () => ({ message: 'Nivel de urgencia inválido' }),
  }),

  resourceTypes: nonEmptyStringArray('Tipos de recursos'),

  targetEur: nonNegativeNumber('Objetivo en euros').optional(),

  targetCredits: nonNegativeNumber('Objetivo en créditos').optional(),

  targetHours: nonNegativeNumber('Objetivo en horas').optional(),

  neededSkills: stringArray.default([]),

  location: z.string().optional(),

  lat: latitude.optional(),

  lng: longitude.optional(),

  images: z
    .array(z.any())
    .max(5, 'Máximo 5 imágenes permitidas')
    .optional()
    .default([]),
}).refine(
  (data) => {
    // At least one target must be set
    if (!data.targetEur && !data.targetCredits && !data.targetHours) {
      return false;
    }
    return true;
  },
  {
    message: 'Debes establecer al menos un objetivo (euros, créditos o horas)',
    path: ['targetEur'],
  }
);

export type CreateNeedFormData = z.infer<typeof createNeedSchema>;

/**
 * Mutual Aid Project Validation Schema
 */
export const createProjectSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres'),

  description: z
    .string()
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(5000, 'La descripción no puede exceder 5000 caracteres'),

  vision: z
    .string()
    .min(10, 'La visión debe tener al menos 10 caracteres')
    .max(1000, 'La visión no puede exceder 1000 caracteres')
    .optional(),

  type: requiredString('Tipo de proyecto'),

  location: requiredString('Ubicación'),

  country: requiredString('País'),

  lat: latitude,

  lng: longitude,

  targetEur: nonNegativeNumber('Objetivo en euros').optional(),

  targetCredits: nonNegativeNumber('Objetivo en créditos').optional(),

  beneficiaries: z
    .number()
    .int('Número de beneficiarios debe ser entero')
    .positive('Debe haber al menos un beneficiario')
    .optional(),

  volunteersNeeded: z
    .number()
    .int('Número de voluntarios debe ser entero')
    .positive('Debe necesitar al menos un voluntario')
    .optional(),

  estimatedMonths: z
    .number()
    .int('Duración estimada debe ser entero')
    .positive('La duración debe ser mayor a 0')
    .optional(),

  impactGoals: nonEmptyStringArray('Objetivos de impacto'),

  sdgGoals: z
    .array(z.number().int().min(1).max(17))
    .min(1, 'Debes seleccionar al menos un ODS')
    .max(17, 'Máximo 17 ODS'),

  tags: stringArray.default([]),

  images: z
    .array(z.any())
    .max(10, 'Máximo 10 imágenes permitidas')
    .optional()
    .default([]),
}).refine(
  (data) => {
    // At least one target must be set
    if (!data.targetEur && !data.targetCredits) {
      return false;
    }
    return true;
  },
  {
    message: 'Debes establecer al menos un objetivo financiero',
    path: ['targetEur'],
  }
);

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;

/**
 * User Registration Validation Schema
 */
export const registerSchema = z.object({
  email: email,

  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),

  confirmPassword: z.string(),

  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  location: z.string().optional(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  }
);

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Helper function to format Zod errors for display
 */
export function formatZodError(error: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    formattedErrors[path] = err.message;
  });

  return formattedErrors;
}

/**
 * Helper function to validate form data and show toast on error
 */
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  onError?: (errors: Record<string, string>) => void
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = formatZodError(result.error);
    onError?.(errors);
    return { success: false, errors };
  }

  return { success: true, data: result.data };
}
