export async function transcribeAudio(audioUrl: string): Promise<string> {
  console.log('Starting transcription process for:', audioUrl);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;
  
  const attemptTranscription = async (attempt: number): Promise<string> => {
    try {
      console.log(`Transcription attempt ${attempt} starting...`);
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Transcription failed: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Transcription response:', data);
      return data.text || '';
    } catch (error: any) {
      console.error(`Transcription attempt ${attempt} failed:`, error);
      
      const shouldRetry = attempt < MAX_RETRIES && (
        error.name === 'APIConnectionError' || 
        error?.cause?.code === 'ECONNRESET' ||
        error.message.includes('timeout') ||
        error.message.includes('network') ||
        error.message.includes('failed') ||
        (error.status >= 500 && error.status < 600)
      );

      if (shouldRetry) {
        console.log(`Frontend retry attempt ${attempt}, waiting ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return attemptTranscription(attempt + 1);
      }
      
      throw error;
    }
  };

  try {
    return await attemptTranscription(1);
  } catch (error) {
    console.error('Error transcribing audio:', error);
    const message = error instanceof Error 
      ? error.message 
      : 'Failed to transcribe audio. Please try again later.';
    throw new Error(message);
  }
}
