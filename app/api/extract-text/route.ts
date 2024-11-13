import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    let extractedText = '';

    try {
      if (file.type === 'application/pdf') {
        const pdfDoc = await PDFDocument.load(buffer);
        // Add PDF text extraction logic here
        extractedText = 'PDF text extraction placeholder';
      } else if (file.type === 'text/plain') {
        extractedText = await new Response(file).text();
      } else {
        return NextResponse.json(
          { error: 'Unsupported file type' },
          { status: 400 }
        );
      }
    } catch (extractError: unknown) {
      const errorMessage = extractError instanceof Error 
        ? extractError.message 
        : 'Unknown error occurred';
        
      return NextResponse.json(
        { error: `Failed to process file: ${errorMessage}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ text: extractedText });
  } catch (error) {
    console.error('Error in text extraction:', error);
    return NextResponse.json(
      { error: 'Failed to extract text' },
      { status: 500 }
    );
  }
} 