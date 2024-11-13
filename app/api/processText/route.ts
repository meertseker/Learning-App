// app/api/processText/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    // Process the combined text as needed
    // For example, send it to an external API or save it to the database

    // Placeholder: Log the text
    console.log('Received combined text:', text);

    return NextResponse.json({ message: 'Text processed successfully' });
  } catch (error: any) {
    console.error('Error processing text:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to process text' },
      { status: 500 }
    );
  }
}
