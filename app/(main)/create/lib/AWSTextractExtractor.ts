import { BaseExtractor } from './BaseExtractor';
import { ExtractorResult } from './types';

export class AWSTextractExtractor extends BaseExtractor {
  private readonly SUPPORTED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/tiff',
    'application/x-pdf',
    'application/x-bzpdf',
    'application/x-gzpdf'
  ];

  async extract(file: File): Promise<ExtractorResult> {
    console.log('Attempting to extract text from file:', {
      type: file.type,
      size: file.size,
      name: file.name
    });

    if (!this.SUPPORTED_TYPES.includes(file.type.toLowerCase())) {
      throw new Error(`Unsupported file type for AWS Textract: ${file.type}. Supported types: ${this.SUPPORTED_TYPES.join(', ')}`);
    }

    await this.validate(file);
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/textract', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to extract text from document');
    }

    const { text, metadata } = await response.json();
    const wordCount = text.trim().split(/\s+/).length;

    return {
      text,
      metadata: {
        ...metadata,
        wordCount,
        createdAt: new Date()
      }
    };
  }
}