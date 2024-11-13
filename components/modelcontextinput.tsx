import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Upload, FileText, Plus } from "lucide-react";

const LectureInputModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => setIsOpen(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg" onClick={handleOpenModal}>
          <Plus className="h-4 w-4" />
          Add New Lecture
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Lecture Content</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="record" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="record" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Record
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="record">
            <Card>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Lecture Title</Label>
                  <Input id="title" placeholder="Enter lecture title" />
                </div>
                
                <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-muted/50 rounded-lg">
                  <Button variant="sidebarOutline" size="lg" className="w-full max-w-xs gap-2">
                    <Mic className="h-4 w-4" />
                    Start Recording
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Click to start recording your lecture
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="uploadTitle">Lecture Title</Label>
                  <Input id="uploadTitle" placeholder="Enter lecture title" />
                </div>
                
                <div className="flex flex-col items-center justify-center space-y-4 p-8 border-2 border-dashed rounded-lg">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Drag & drop your files here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse
                    </p>
                  </div>
                  <Input 
                    type="file" 
                    className="hidden" 
                    id="fileUpload"
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <Button variant="sidebarOutline" onClick={() => document.getElementById('fileUpload')?.click()}>
                    Choose File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="text">
            <Card>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="textTitle">Lecture Title</Label>
                  <Input id="textTitle" placeholder="Enter lecture title" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Lecture Content</Label>
                  <Textarea 
                    id="content"
                    placeholder="Enter your lecture content here..."
                    className="min-h-[200px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="danger" type="button" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button type="submit">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LectureInputModal;
