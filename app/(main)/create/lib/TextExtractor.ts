import { BaseExtractor } from './BaseExtractor';
import { ExtractorResult } from './types';

export class TextExtractor extends BaseExtractor {
  async extract(file: File): Promise<ExtractorResult> {
    await this.validate(file);
    
    const text = await file.text();
    const wordCount = text.trim().split(/\s+/).length;

    return {
      text,
      metadata: {
        wordCount,
        createdAt: new Date()
      }
    };
  }
}