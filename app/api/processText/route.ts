import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    console.log('=== START OF COMBINED TEXT ===');
    console.log(text);
    console.log('=== END OF COMBINED TEXT ===');
    console.log('Text length:', text.length);
    console.log('Number of sections:', text.split('=== NEW SECTION ===').length);

    return NextResponse.json({ 
      message: 'Text processed successfully',
      textLength: text.length,
      sections: text.split('=== NEW SECTION ===').length,
      preview: text.substring(0, 100) + '...'
    });
  } catch (error: any) {
    console.error('Error processing text:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to process text' },
      { status: 500 }
    );
  }
}