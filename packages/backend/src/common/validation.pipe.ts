import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AdvancedSanitizerService } from './advanced-sanitizer.service';

/**
 * Custom validation pipe that sanitizes inputs and validates them
 * Uses AdvancedSanitizerService to clean potentially malicious input
 */
@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  private readonly sanitizer: AdvancedSanitizerService;

  constructor() {
    this.sanitizer = new AdvancedSanitizerService();
  }

  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    if (!value) {
      return value;
    }

    // Sanitize the input before validation
    const sanitizedValue = this.sanitizeValue(value, metadata);

    // If there's no metatype, return sanitized value
    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return sanitizedValue;
    }

    // Transform to class instance
    const object = plainToInstance(metatype, sanitizedValue);

    // Validate using class-validator
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    });

    if (errors.length > 0) {
      throw new BadRequestException(this.formatErrors(errors));
    }

    return object;
  }

  /**
   * Sanitize input value based on type
   */
  private sanitizeValue(value: any, metadata: ArgumentMetadata): any {
    const { type } = metadata;

    // Don't sanitize file uploads or other special types
    if (type === 'custom') {
      return value;
    }

    // Sanitize based on data type
    if (typeof value === 'string') {
      return this.sanitizer.sanitizeText(value);
    }

    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }

    if (Array.isArray(value)) {
      return value.map(item => this.sanitizeValue(item, metadata));
    }

    // Return primitives as-is
    return value;
  }

  /**
   * Recursively sanitize object properties
   */
  private sanitizeObject(obj: any): any {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key name
      const sanitizedKey = this.sanitizer.sanitizeText(key, 100);

      // Sanitize value based on type
      if (typeof value === 'string') {
        // Check if it looks like HTML content
        if (this.isHTMLContent(value)) {
          sanitized[sanitizedKey] = this.sanitizer.sanitizeHTML(value);
        } else if (this.isEmailField(sanitizedKey)) {
          try {
            sanitized[sanitizedKey] = this.sanitizer.sanitizeEmail(value);
          } catch {
            sanitized[sanitizedKey] = value; // Let validator handle invalid emails
          }
        } else if (this.isURLField(sanitizedKey)) {
          try {
            sanitized[sanitizedKey] = this.sanitizer.sanitizeURL(value);
          } catch {
            sanitized[sanitizedKey] = value; // Let validator handle invalid URLs
          }
        } else if (this.isPhoneField(sanitizedKey)) {
          try {
            sanitized[sanitizedKey] = this.sanitizer.sanitizePhone(value);
          } catch {
            sanitized[sanitizedKey] = value; // Let validator handle invalid phones
          }
        } else {
          sanitized[sanitizedKey] = this.sanitizer.sanitizeText(value);
        }
      } else if (typeof value === 'number') {
        try {
          sanitized[sanitizedKey] = this.sanitizer.sanitizeNumber(value);
        } catch {
          sanitized[sanitizedKey] = value; // Let validator handle invalid numbers
        }
      } else if (typeof value === 'boolean') {
        try {
          sanitized[sanitizedKey] = this.sanitizer.sanitizeBoolean(value);
        } catch {
          sanitized[sanitizedKey] = value; // Let validator handle invalid booleans
        }
      } else if (Array.isArray(value)) {
        sanitized[sanitizedKey] = value.map(item => {
          if (typeof item === 'object' && item !== null) {
            return this.sanitizeObject(item);
          }
          return item;
        });
      } else if (typeof value === 'object' && value !== null) {
        sanitized[sanitizedKey] = this.sanitizeObject(value);
      } else {
        sanitized[sanitizedKey] = value;
      }
    }

    return sanitized;
  }

  /**
   * Check if value looks like HTML content
   */
  private isHTMLContent(value: string): boolean {
    return /<[a-z][\s\S]*>/i.test(value);
  }

  /**
   * Check if field name suggests it's an email
   */
  private isEmailField(fieldName: string): boolean {
    return /email/i.test(fieldName);
  }

  /**
   * Check if field name suggests it's a URL
   */
  private isURLField(fieldName: string): boolean {
    return /url|link|website|homepage/i.test(fieldName);
  }

  /**
   * Check if field name suggests it's a phone number
   */
  private isPhoneField(fieldName: string): boolean {
    return /phone|tel|mobile|celular/i.test(fieldName);
  }

  /**
   * Check if metatype should be validated
   */
  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  /**
   * Format validation errors into user-friendly messages
   */
  private formatErrors(errors: ValidationError[]): any {
    const formattedErrors: any = {};

    errors.forEach((error) => {
      if (error.constraints) {
        formattedErrors[error.property] = Object.values(error.constraints);
      }

      // Handle nested errors
      if (error.children && error.children.length > 0) {
        formattedErrors[error.property] = this.formatErrors(error.children);
      }
    });

    return {
      message: 'Validation failed',
      errors: formattedErrors,
    };
  }
}
