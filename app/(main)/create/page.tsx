"use client";
<<<<<<< HEAD
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
=======

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { Mic, FileText, Type } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMediaRecorder } from "../create/hooks/useMediaRecorder";
import { toast } from "sonner";
import { uploadToSupabase, uploadTextToSupabase, uploadFileToSupabase } from "@/app/(main)/create/supabase";
import { useAuth } from "@clerk/nextjs";
import { transcribeAudio } from "@/app/(main)/create/speechToText";
import { ClerkProvider } from "@clerk/nextjs";

const CreateCourse = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [courseText, setCourseText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("voice");
  const { userId } = useAuth();

  const {
    isRecording,
    startRecording,
    stopRecording,
    audioBlob
  } = useMediaRecorder();

  // Add loading state for auth
  const [authChecked, setAuthChecked] = useState(false);

  // Add useEffect to check auth status
  useEffect(() => {
    if (!userId) {
      router.push('/sign-in');
    } else {
      setAuthChecked(true);
    }
  }, [userId, router]);

  // Return loading state or redirect if not authenticated
  if (!authChecked) {
    return <div>Loading...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const tempCourseId = `course-${Date.now()}`;
      if (!userId) throw new Error("User not authenticated");
        
      // Create an array to store all upload promises
      const uploadPromises = [];

      // Handle text upload
      if (courseText) {
        console.log("Uploading text...");
        const textPromise = uploadTextToSupabase(courseText, userId, tempCourseId)
          .then(({ publicUrl: textUrl }) => {
            console.log("Text uploaded, URL:", textUrl);
            return createCourse({
              title: "Text Course",
              content: courseText,
              fileUrl: textUrl,
              userId,
              courseId: tempCourseId,
              type: "text",
              createdAt: new Date().toISOString()
            });
          });
        uploadPromises.push(textPromise);
      }

      // Handle voice upload
      if (audioBlob) {
        console.log("Creating audio file...");
        const audioFile = new File([audioBlob], "voice-recording.webm", {
          type: "audio/webm",
        });
        console.log("Uploading audio file...");
        const audioPromise = uploadFileToSupabase(audioFile, userId, tempCourseId)
          .then(async ({ publicUrl: audioUrl }) => {
            console.log("Audio uploaded, URL:", audioUrl);
            
            try {
              // Get transcription
              console.log("Starting transcription for URL:", audioUrl);
              const transcript = await transcribeAudio(audioUrl);
              console.log("Transcription completed successfully:", transcript);
              if (!transcript) {
                console.warn("Transcription returned empty result");
              }

              return createCourse({
                title: "Voice Recording",
                fileUrl: audioUrl,
                userId,
                courseId: tempCourseId,
                type: "audio",
                content: transcript || "Transcription failed", // Provide fallback
                createdAt: new Date().toISOString()
              });
            } catch (transcriptionError) {
              console.error("Transcription failed:", transcriptionError);
              // Still create the course even if transcription fails
              return createCourse({
                title: "Voice Recording",
                fileUrl: audioUrl,
                userId,
                courseId: tempCourseId,
                type: "audio",
                content: "Transcription failed - Audio file available",
                createdAt: new Date().toISOString()
              });
            }
          });
        uploadPromises.push(audioPromise);
      }

      // Handle file upload
      if (selectedFile) {
        console.log("Uploading document file...");
        const filePromise = uploadFileToSupabase(selectedFile, userId, tempCourseId)
          .then(({ publicUrl: fileUrl }) => {
            console.log("Document uploaded, URL:", fileUrl);
            return createCourse({
              title: selectedFile.name,
              fileUrl: fileUrl,
              userId,
              courseId: tempCourseId,
              type: "file",
              content: "",
              createdAt: new Date().toISOString()
            });
          });
        uploadPromises.push(filePromise);
      }

      if (uploadPromises.length === 0) {
        throw new Error("Please add content in at least one tab");
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      console.log("All courses created successfully!");
      toast.success("Courses created successfully!");
      router.push(`/library`); // Changed to redirect to library since we're creating multiple courses
    } catch (error: any) {
      console.error("Error creating courses:", error);
      toast.error(error.message);
>>>>>>> 6b53e2b1458913382595d02a92a64f54670453f4
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
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
=======
  const createCourse = async (courseData: any) => {
    console.log("Creating course with data:", courseData);
    const response = await fetch("/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courseData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Server response:", errorData);
      throw new Error(errorData.message || "Failed to create course");
    }

    const result = await response.json();
    console.log("Server response:", result);
    return result;
>>>>>>> 6b53e2b1458913382595d02a92a64f54670453f4
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <div className="max-w-[912px] mx-auto px-3">
      <div className="flex items-center gap-x-4 mb-8">
        <Link href="/library">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-5 w-5 stroke-2 text-neutral-400" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-neutral-700">
          Create New Course
        </h1>
      </div>

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
            onClick={handleSubmit}
            disabled={isLoading}
            variant="primary"
          >
            Create Course
          </Button>
        </div>
      </Tabs>
>>>>>>> 6b53e2b1458913382595d02a92a64f54670453f4
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
