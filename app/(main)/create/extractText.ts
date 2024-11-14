// app/(main)/create/extractText.ts

import { ExtractorFactory } from './lib/ExtractorFactory';

export const extractTextFromFile = async (file: File): Promise<string> => {
  try {
    const extractor = ExtractorFactory.getExtractor(file);
    const result = await extractor.extract(file);
    return result.text;
  } catch (error) {
    console.error('Text extraction error:', error);
    throw error;
  }
};
