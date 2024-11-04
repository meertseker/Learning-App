import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define allowed file types and their corresponding buckets
const BUCKET_MAPPING = {
  audio: 'course-audio',
  document: 'course-documents',
  text: 'course-text'
};

const getFileType = (file: File): 'audio' | 'document' | 'text' => {
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.includes('pdf') || 
      file.type.includes('doc') || 
      file.type.includes('txt')) return 'document';
  return 'text';
};

export const uploadToSupabase = async (
  file: File,
  userId: string,
  courseId: string
) => {
  try {
    const fileType = getFileType(file);
    const bucket = BUCKET_MAPPING[fileType];
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${courseId}/${Date.now()}.${fileExt}`;

    // Try direct upload without bucket check
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      if (error.message.includes('bucket') || error.message.includes('not found')) {
        throw new Error(`Storage bucket "${bucket}" not found or not accessible. Please check your Supabase configuration.`);
      }
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      publicUrl: urlData.publicUrl,
      bucket,
      filePath
    };
  } catch (error: any) {
    console.error('Supabase upload error:', error);
    throw new Error(error.message || 'Failed to upload file to Supabase');
  }
};

export const uploadTextToSupabase = async (
  text: string,
  userId: string,
  courseId: string
) => {
  const textBlob = new Blob([text], { type: 'text/plain' });
  const file = new File([textBlob], 'course-content.txt', { type: 'text/plain' });
  
  return uploadToSupabase(file, userId, courseId);
};

export const uploadFileToSupabase = async (
  file: File,
  userId: string,
  courseId: string
) => {
  return uploadToSupabase(file, userId, courseId);
};
