// app/(main)/create/supabase.ts

import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

export const uploadFileToSupabase = async (file: File, userId: string, courseId: string) => {
  try {
    if (!file || !userId || !courseId) {
      throw new Error('Missing required parameters for file upload');
    }

    const filePath = `${userId}/${courseId}/${file.name}`;
    
    // First, check if file exists
    const { data: existingFile } = await supabase.storage
      .from('course-content')
      .list(`${userId}/${courseId}`);

    if (existingFile?.some(f => f.name === file.name)) {
      // If file exists, remove it first
      await supabase.storage
        .from('course-content')
        .remove([filePath]);
    }

    // Upload new file
    const { data, error } = await supabase.storage
      .from('course-content')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from upload');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('course-content')
      .getPublicUrl(filePath);

    return { publicUrl };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
