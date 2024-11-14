export interface ExtractorResult {
    text: string;
    metadata?: {
      title?: string;
      author?: string;
      createdAt?: Date;
      pageCount?: number;
      wordCount?: number;
      confidence?: number;
    }
  }
  
  export interface FileValidator {
    maxSize: number;
    allowedTypes: string[];
    allowedExtensions: string[];
  }
  
  export const FILE_VALIDATORS: Record<string, FileValidator> = {
    document: {
      maxSize: 50 * 1024 * 1024, // 50MB
      allowedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
        'text/rtf',
        'image/jpeg',
        'image/png',
        'image/tiff',
        'image/bmp',
        'image/webp',
        'application/x-latex',
        'application/x-tex',
        'application/postscript',
        'application/x-pdf',
        'application/x-bzpdf',
        'application/x-gzpdf'
      ],
      allowedExtensions: [
        '.pdf', '.doc', '.docx', '.txt', '.rtf',
        '.ppt', '.pptx', '.xls', '.xlsx',
        '.csv', '.odt', '.ods', '.odp',
        '.jpg', '.jpeg', '.png', '.tiff',
        '.bmp', '.webp',
        '.tex', '.latex', '.ps', '.eps'
      ]
    }
  };