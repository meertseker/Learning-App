import { BaseExtractor } from './BaseExtractor';
import { AWSTextractExtractor } from './AWSTextractExtractor';
import { TextExtractor } from './TextExtractor';
import { FILE_VALIDATORS } from './types';

export class ExtractorFactory {
  static getExtractor(file: File): BaseExtractor {
    const fileType = file.type.toLowerCase();
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

    if (!file) {
      throw new Error('No file provided');
    }

    // Text files use TextExtractor
    const textTypes = ['text/plain', 'text/csv', 'text/rtf'];
    const textExtensions = ['.txt', '.csv', '.rtf'];
    if (textTypes.includes(fileType) || textExtensions.includes(fileExtension)) {
      return new TextExtractor(FILE_VALIDATORS.document);
    }

    // AWS Textract supported formats only
    const textractTypes = [
      'application/pdf',
      'application/x-pdf',
      'application/x-bzpdf',
      'application/x-gzpdf',
      'image/jpeg',
      'image/png',
      'image/tiff'
    ];
    const textractExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff'];

    if (textractTypes.includes(fileType) || textractExtensions.includes(fileExtension)) {
      return new AWSTextractExtractor(FILE_VALIDATORS.document);
    }

    // For other document types, throw an error with supported formats
    throw new Error(
      'Unsupported file type. Currently supported formats:\n' +
      '- Text files: TXT, CSV, RTF\n' +
      '- Documents & Images: PDF, JPEG, PNG, TIFF'
    );
  }
}