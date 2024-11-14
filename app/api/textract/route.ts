import { NextResponse } from 'next/server';
import { DetectDocumentTextCommand } from "@aws-sdk/client-textract";
import { TextractClient } from "@aws-sdk/client-textract";

const textractClient = new TextractClient({
  region: "us-east-1", 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

export { textractClient };

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const originalFile = formData.get('file') as File;

    if (!originalFile) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type
    const supportedTypes = [
      'application/pdf',
      'application/x-pdf',
      'application/x-bzpdf',
      'application/x-gzpdf',
      'image/jpeg',
      'image/png',
      'image/tiff'
    ];

    let processFile = originalFile;
    if (!supportedTypes.includes(originalFile.type)) {
      // Normalize PDF mime types
      const isPDF = originalFile.type.includes('pdf') || originalFile.name.toLowerCase().endsWith('.pdf');
      if (isPDF) {
        // Create new File object with normalized type
        processFile = new File([originalFile], originalFile.name, { type: 'application/pdf' });
      } else {
        console.error('File type not supported by AWS Textract:', originalFile.type);
        return NextResponse.json({ 
          error: `AWS Textract only supports: PDF, JPEG, PNG, and TIFF formats. Received: ${originalFile.type}`,
          details: 'UnsupportedDocumentType'
        }, { status: 400 });
      }
    }

    const buffer = Buffer.from(await processFile.arrayBuffer());
    
    const command = new DetectDocumentTextCommand({
      Document: {
        Bytes: buffer
      }
    });

    const response = await textractClient.send(command);
    console.log('Textract response:', response);
    
    const text = response.Blocks?.filter(block => block.BlockType === 'LINE')
      .map(block => block.Text)
      .join('\n') || '';

    return NextResponse.json({ 
      text,
      metadata: {
        confidence: response.Blocks?.[0]?.Confidence || 0
      }
    });
  } catch (error: any) {
    console.error('Textract extraction error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to extract text',
      details: error.Code || error.__type || 'Unknown error'
    }, { status: 500 });
  }
}