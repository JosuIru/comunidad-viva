import { Injectable, BadRequestException } from '@nestjs/common';

/**
 * File validation service using magic numbers (file signatures)
 * Validates actual file content, not just MIME type (which can be spoofed)
 */
@Injectable()
export class FileValidationService {
  // Magic numbers (file signatures) for common file types
  private readonly FILE_SIGNATURES = {
    // Images
    'image/jpeg': [
      Buffer.from([0xFF, 0xD8, 0xFF]), // JPEG magic number
    ],
    'image/png': [
      Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), // PNG magic number
    ],
    'image/gif': [
      Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]), // GIF87a
      Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]), // GIF89a
    ],
    'image/webp': [
      Buffer.from([0x52, 0x49, 0x46, 0x46]), // RIFF (WebP container)
    ],
    'image/bmp': [
      Buffer.from([0x42, 0x4D]), // BMP magic number
    ],
    'image/tiff': [
      Buffer.from([0x49, 0x49, 0x2A, 0x00]), // TIFF little-endian
      Buffer.from([0x4D, 0x4D, 0x00, 0x2A]), // TIFF big-endian
    ],
    // Documents
    'application/pdf': [
      Buffer.from([0x25, 0x50, 0x44, 0x46]), // %PDF
    ],
    // Archives
    'application/zip': [
      Buffer.from([0x50, 0x4B, 0x03, 0x04]), // ZIP
      Buffer.from([0x50, 0x4B, 0x05, 0x06]), // ZIP empty
    ],
    // Office documents (also ZIP-based)
    'application/vnd.openxmlformats-officedocument': [
      Buffer.from([0x50, 0x4B, 0x03, 0x04]), // DOCX, XLSX, PPTX
    ],
  };

  // Maximum bytes to read for signature validation
  private readonly MAX_SIGNATURE_LENGTH = 16;

  /**
   * Validate file by checking its magic number against declared MIME type
   */
  validateFile(buffer: Buffer, declaredMimeType: string): {
    isValid: boolean;
    detectedType?: string;
    message?: string;
  } {
    if (!buffer || buffer.length === 0) {
      return {
        isValid: false,
        message: 'Archivo vacío',
      };
    }

    // Get first bytes for signature check
    const fileHeader = buffer.slice(0, this.MAX_SIGNATURE_LENGTH);

    // Find matching signature
    const detectedType = this.detectFileType(fileHeader);

    if (!detectedType) {
      return {
        isValid: false,
        message: 'Tipo de archivo no reconocido o no permitido',
      };
    }

    // Check if detected type matches declared MIME type
    const isMatch = this.mimeTypesMatch(detectedType, declaredMimeType);

    if (!isMatch) {
      return {
        isValid: false,
        detectedType,
        message: `Tipo de archivo no coincide: declarado como ${declaredMimeType}, pero el contenido es ${detectedType}`,
      };
    }

    return {
      isValid: true,
      detectedType,
      message: 'Archivo válido',
    };
  }

  /**
   * Detect file type by magic number
   */
  private detectFileType(fileHeader: Buffer): string | null {
    for (const [mimeType, signatures] of Object.entries(this.FILE_SIGNATURES)) {
      for (const signature of signatures) {
        if (this.bufferStartsWith(fileHeader, signature)) {
          return mimeType;
        }
      }
    }

    // Special case for WebP: check for WEBP string after RIFF
    if (this.bufferStartsWith(fileHeader, Buffer.from([0x52, 0x49, 0x46, 0x46]))) {
      const webpMarker = fileHeader.slice(8, 12);
      if (webpMarker.equals(Buffer.from('WEBP', 'ascii'))) {
        return 'image/webp';
      }
    }

    return null;
  }

  /**
   * Check if buffer starts with signature
   */
  private bufferStartsWith(buffer: Buffer, signature: Buffer): boolean {
    if (buffer.length < signature.length) {
      return false;
    }

    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if two MIME types match (considering wildcards)
   */
  private mimeTypesMatch(detected: string, declared: string): boolean {
    // Exact match
    if (detected === declared) {
      return true;
    }

    // Office documents are ZIP-based
    if (
      detected === 'application/zip' &&
      declared.startsWith('application/vnd.openxmlformats-officedocument')
    ) {
      return true;
    }

    if (
      declared === 'application/zip' &&
      detected.startsWith('application/vnd.openxmlformats-officedocument')
    ) {
      return true;
    }

    // Check main type match (e.g., image/jpeg vs image/jpg)
    const detectedMain = detected.split('/')[0];
    const declaredMain = declared.split('/')[0];

    return detectedMain === declaredMain;
  }

  /**
   * Validate image file specifically
   */
  validateImage(buffer: Buffer, declaredMimeType: string): void {
    const result = this.validateFile(buffer, declaredMimeType);

    if (!result.isValid) {
      throw new BadRequestException(result.message);
    }

    // Additional check: ensure it's actually an image
    if (!result.detectedType?.startsWith('image/')) {
      throw new BadRequestException(
        `El archivo no es una imagen válida (detectado: ${result.detectedType})`,
      );
    }
  }

  /**
   * Validate document file specifically
   */
  validateDocument(buffer: Buffer, declaredMimeType: string): void {
    const result = this.validateFile(buffer, declaredMimeType);

    if (!result.isValid) {
      throw new BadRequestException(result.message);
    }

    // Additional check: ensure it's a document
    const allowedDocTypes = ['application/pdf', 'application/zip', 'application/vnd.openxmlformats'];
    const isDocument = allowedDocTypes.some(type => result.detectedType?.startsWith(type));

    if (!isDocument) {
      throw new BadRequestException(
        `El archivo no es un documento válido (detectado: ${result.detectedType})`,
      );
    }
  }

  /**
   * Get allowed MIME types for images
   */
  getAllowedImageTypes(): string[] {
    return Object.keys(this.FILE_SIGNATURES).filter(type => type.startsWith('image/'));
  }

  /**
   * Check file size
   */
  validateFileSize(size: number, maxSizeBytes: number): void {
    if (size > maxSizeBytes) {
      const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(2);
      const actualSizeMB = (size / (1024 * 1024)).toFixed(2);
      throw new BadRequestException(
        `Archivo demasiado grande: ${actualSizeMB}MB (máximo: ${maxSizeMB}MB)`,
      );
    }
  }

  /**
   * Validate file extension matches MIME type
   */
  validateFileExtension(filename: string, mimeType: string): void {
    const ext = filename.split('.').pop()?.toLowerCase();

    const validExtensions: { [key: string]: string[] } = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/gif': ['gif'],
      'image/webp': ['webp'],
      'image/bmp': ['bmp'],
      'image/tiff': ['tif', 'tiff'],
      'application/pdf': ['pdf'],
      'application/zip': ['zip'],
    };

    for (const [type, extensions] of Object.entries(validExtensions)) {
      if (mimeType.includes(type)) {
        if (ext && extensions.includes(ext)) {
          return; // Valid extension
        }
      }
    }

    throw new BadRequestException(
      `Extensión de archivo no válida: .${ext} para tipo ${mimeType}`,
    );
  }
}
