import { ExtractorResult, FileValidator } from './types';

export abstract class BaseExtractor {
  protected validator: FileValidator;

  constructor(validator: FileValidator) {
    this.validator = validator;
  }

  async validate(file: File): Promise<void> {
    if (file.size > this.validator.maxSize) {
      throw new Error(`File size exceeds maximum limit of ${this.validator.maxSize / (1024 * 1024)}MB`);
    }

    const fileType = file.type.toLowerCase();
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

    if (!this.validator.allowedTypes.includes(fileType) && 
        !this.validator.allowedExtensions.includes(fileExtension)) {
      throw new Error('Unsupported file type');
    }
  }

  abstract extract(file: File): Promise<ExtractorResult>;
}