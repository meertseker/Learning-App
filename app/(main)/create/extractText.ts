// app/(main)/create/extractText.ts

import * as pdfjsLib from 'pdfjs-dist';
// For Word documents, you might need to use a library like mammoth
// import mammoth from 'mammoth';

export const extractTextFromFile = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/extract-text', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to extract text from file');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Text extraction error:', error);
    throw error;
  }
};

const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ');
  }
  return text;
};

const extractTextFromWord = async (file: File): Promise<string> => {
  // Use mammoth library to extract text from Word documents
  // const arrayBuffer = await file.arrayBuffer();
  // const { value } = await mammoth.extractRawText({ arrayBuffer });
  // return value;
  throw new Error('Word document text extraction not implemented');
};
