"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { Mic, FileText, Type } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useMediaRecorder } from "../create/hooks/useMediaRecorder";
import { toast } from "sonner";
import { uploadToSupabase, uploadTextToSupabase, uploadFileToSupabase } from "@/app/(main)/create/supabase";

const CreateCourse = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [courseText, setCourseText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("voice");

  const {
    isRecording,
    startRecording,
    stopRecording,
    audioBlob
  } = useMediaRecorder();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const tempCourseId = `course-${Date.now()}`;
      const userId = "mertseker3"; // This should come from your auth context

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
          .then(({ publicUrl: audioUrl }) => {
            console.log("Audio uploaded, URL:", audioUrl);
            return createCourse({
              title: "Voice Recording",
              fileUrl: audioUrl,
              userId,
              courseId: tempCourseId,
              type: "audio",
              content: "",
              createdAt: new Date().toISOString()
            });
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
    } finally {
      setIsLoading(false);
    }
  };

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
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
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
    </div>
  );
};

export default CreateCourse;
