"use client";
// app/(main)/create/page.tsx

import React, { useState, ChangeEvent, useEffect } from 'react';
import { redirect, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useMediaRecorder } from './hooks/useMediaRecorder';
import { uploadFileToSupabase } from './supabase';
import { transcribeAudio } from './speechToText';
import { extractTextFromFile } from './extractText';
import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Type } from 'lucide-react';
import { FileText } from 'lucide-react';
import { Mic } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ContentData {
  userId: string;
  courseId: string;
  type: 'text' | 'audio' | 'file';
  content: string;
  fileUrl?: string;
  title?: string;
}

const CreateCourse = () => {
  const router = useRouter();
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) {
      router.push('/');
    }
  }, [userId, router]);

  if (!userId) {
    return null;
  }

  const [courseText, setCourseText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { isRecording, startRecording, stopRecording, audioBlob, setAudioBlob } = useMediaRecorder();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('voice');
  const [title, setTitle] = useState('');

  // ... (UI code remains the same)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission started");
    
    try {
      if (!title.trim()) {
        toast.error("Please enter a course title");
        return;
      }

      if (!courseText.trim() && !audioBlob && !selectedFile) {
        toast.error("Please provide some content (text, audio, or file)");
        return;
      }

      setIsLoading(true);
      console.log("Processing content...");
      const contentParts: string[] = [];

      if (courseText.trim()) {
        contentParts.push(courseText);
      }

      if (audioBlob) {
        console.log("Processing audio...");
        const audioFile = new File([audioBlob], `${title}-recording.webm`, {
          type: "audio/webm",
        });
        const { publicUrl: audioUrl } = await uploadFileToSupabase(audioFile, userId, title);
        const transcribedText = await transcribeAudio(audioUrl);
        contentParts.push(transcribedText);
      }

      if (selectedFile) {
        console.log("Processing file...");
        const { publicUrl: fileUrl } = await uploadFileToSupabase(selectedFile, userId, title);
        const extractedText = await extractTextFromFile(selectedFile);
        contentParts.push(extractedText);
      }

      const combinedContent = contentParts.join('\n\n==========\n\n');
      console.log("Content combined, saving to database...");

      let savedCourse;
      try {
        savedCourse = await saveContentToDatabase({
          title,
          content: combinedContent,
          userId: userId!,
        });
        console.log("Course saved successfully:", savedCourse);
      } catch (dbError) {
        console.error("Database save error:", dbError);
        toast.error("Failed to save course to database");
        return;
      }

      try {
        await sendCombinedText(combinedContent);
        console.log("Text processing completed");
      } catch (processError) {
        console.error("Text processing error:", processError);
        toast.error("Course saved but text processing failed");
      }

      toast.success("Course created successfully!");
      router.push('/library');
    } catch (error: any) {
      console.error("Error in form submission:", error);
      toast.error(error.message || "Failed to create course");
    } finally {
      setIsLoading(false);
    }
  };

  const saveContentToDatabase = async (courseData: {
    title: string;
    content: string;
    userId: string;
    imageSrc?: string;
  }) => {
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          title: courseData.title,
          content: courseData.content,
          description: courseData.content.substring(0, 200) + "...",
          imageSrc: courseData.imageSrc || "/default-course-image.jpg",
          userId: courseData.userId,
          isActive: true
        })
      });

      // Log full response details
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Check if the response is HTML (indicating an error page)
      if (responseText.trim().toLowerCase().startsWith('<!doctype')) {
        throw new Error('Received HTML instead of JSON. The API endpoint might be throwing a server error.');
      }

      try {
        return JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
      }
    } catch (error) {
      console.error('Error in saveContentToDatabase:', error);
      throw error;
    }
  };

  const sendCombinedText = async (text: string) => {
    try {
      const response = await fetch('/api/processText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      // Log full response details
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Check if the response is HTML (indicating an error page)
      if (responseText.trim().toLowerCase().startsWith('<!doctype')) {
        throw new Error('Received HTML instead of JSON. The API endpoint might be throwing a server error.');
      }

      try {
        return JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
      }
    } catch (error) {
      console.error('Error in sendCombinedText:', error);
      throw error;
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link href="/library" className="flex items-center text-sm hover:opacity-75 transition">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Link>
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter course title"
          className="w-full p-2 mb-4 border rounded"
          required
        />
        
        <Tabs 
          defaultValue="voice" 
          className="w-full"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid grid-cols-3 w-full max-w-[400px] mb-8">
            <TabsTrigger value="voice" className="flex items-center gap-x-2">
              <Mic className="h-4 w-4" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-x-2">
              <FileText className="h-4 w-4" />
              File
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-x-2">
              <Type className="h-4 w-4" />
              Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voice" className="space-y-4">
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <Button
                onClick={isRecording ? stopRecording : startRecording}  
                variant={isRecording ? "danger" : "secondary"}
                size="lg"
                className="rounded-full w-16 h-16"
              >
                <Mic className={`h-6 w-6 ${isRecording ? 'animate-pulse' : ''}`} />
              </Button>
              <p className="mt-4 text-sm text-neutral-600">
                {isRecording ? "Recording... Click to stop" : "Click to start recording"}
              </p>
              {audioBlob && (
                <div className="mt-4">
                  <audio src={URL.createObjectURL(audioBlob)} controls />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <div 
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  setSelectedFile(file);
                }
              }}
            >
              <input
                type="file"
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <FileText className="h-12 w-12 text-neutral-400 mb-4" />
                <span className="text-sm text-neutral-600">
                  {selectedFile 
                    ? `Selected: ${selectedFile.name}`
                    : "Drop your files here or click to browse"
                  }
                </span>
              </label>
              {selectedFile && (
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    Remove file
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <textarea
              className="w-full min-h-[300px] p-4 rounded-xl border-2 border-slate-200 focus:border-slate-300 focus:ring-0 resize-none"
              placeholder="Enter your course content here..."
              value={courseText}
              onChange={(e) => setCourseText(e.target.value)}
            />
          </TabsContent>

          <div className="flex justify-end gap-x-2 mt-8">
            <Button
              type="button"
              variant="ghost"
              disabled={isLoading}
              asChild
            >
              <Link href="/library">
                Cancel
              </Link>
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
            >
              Create Course
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  );
};

// Wrap the export in a client component
export default function CreatePage() {
  return (
    <ClerkProvider>
      <CreateCourse />
    </ClerkProvider>
  );
}
