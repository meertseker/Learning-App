import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const MAX_CHUNK_SIZE = 25 * 1024 * 1024; // 25MB chunks

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function transcribeWithRetry(audioUrl: string, attempt = 1): Promise<string> {
  try {
    const audioResponse = await fetch(audioUrl);
    const audioBlob = await audioResponse.blob();
    
    if (audioBlob.size > MAX_CHUNK_SIZE) {
      throw new Error("File too large - max size is 25MB");
    }

    const file = new File([audioBlob], "audio.mp3", {
      type: audioResponse.headers.get("content-type") || "audio/mpeg",
      lastModified: Date.now(),
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 60000)
    );

    const transcriptionPromise = openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "json",
      temperature: 0.2
    });

    const response = await Promise.race([transcriptionPromise, timeoutPromise]) as OpenAI.Audio.Transcription;
    return response.text;

  } catch (error: any) {
    console.error(`Transcription attempt ${attempt} failed:`, error);

    const shouldRetry = attempt < MAX_RETRIES && (
      error.name === 'APIConnectionError' || 
      error?.cause?.code === 'ECONNRESET' ||
      error.message === 'Request timeout' ||
      error.type === 'system' ||
      error.code === 'ECONNRESET' ||
      error.message.includes('timeout') ||
      error.message.includes('network') ||
      (error.status >= 500 && error.status < 600)
    );

    if (shouldRetry) {
      const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await sleep(delay);
      return transcribeWithRetry(audioUrl, attempt + 1);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { audioUrl } = await request.json();
    console.log('Transcription request received for URL:', audioUrl);
    
    const transcription = await transcribeWithRetry(audioUrl);
    console.log('Transcription result:', transcription);
    
    return NextResponse.json({ text: transcription });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        type: error.name,
        code: error?.cause?.code 
      }, 
      { status: 503 }
    );
  }
} 