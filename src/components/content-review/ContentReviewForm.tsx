
"use client";

import { useState, useEffect, useCallback }  from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Save, UploadCloud, Clock, AlertTriangle, Loader2, Sparkles, FileText, Youtube, Image as ImageIcon, RefreshCw } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import type { VideoProject, StoryboardScene } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { generateThumbnail } from "@/ai/flows/generate-thumbnail";
import { generateCaptions } from "@/ai/flows/generate-captions";
import { regenerateSceneImageAction } from "@/app/actions"; // New action


const reviewFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long.").max(100, "Title cannot exceed 100 characters."),
  description: z.string().min(20, "Description must be at least 20 characters long.").max(5000, "Description cannot exceed 5000 characters."),
  script: z.string().min(50, "Script must be at least 50 characters long."),
  captionsSrt: z.string().optional().describe("SRT formatted captions for the video."),
  scheduledAt: z.date().optional(),
  // Storyboard data is managed outside the form for direct updates
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ContentReviewFormProps {
  project: VideoProject;
  onUpdateProject: (updatedProject: Partial<VideoProject> & { id: string }) => void;
}

export function ContentReviewForm({ project, onUpdateProject }: ContentReviewFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [thumbnail, setThumbnail] = useState(project.thumbnailDataUri);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [storyboard, setStoryboard] = useState<StoryboardScene[]>(project.storyboard || []);
  const [generatingSceneImage, setGeneratingSceneImage] = useState<number | null>(null);


  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      title: project.title || "",
      description: project.description || "",
      script: project.script || "",
      captionsSrt: project.captionsSrt || "",
      scheduledAt: project.scheduledAt ? parseISO(project.scheduledAt) : undefined,
    },
  });
  
  useEffect(() => {
    form.reset({
      title: project.title || "",
      description: project.description || "",
      script: project.script || "",
      captionsSrt: project.captionsSrt || "",
      scheduledAt: project.scheduledAt ? parseISO(project.scheduledAt) : undefined,
    });
    setThumbnail(project.thumbnailDataUri);
    setStoryboard(project.storyboard || []);
  }, [project, form]);


  const handleSaveChanges: SubmitHandler<ReviewFormValues> = async (data) => {
    setIsSaving(true);
    const updatedData: Partial<VideoProject> = {
      id: project.id,
      title: data.title,
      description: data.description,
      script: data.script,
      captionsSrt: data.captionsSrt,
      thumbnailDataUri: thumbnail,
      storyboard: storyboard, // Include updated storyboard
      status: project.status === 'failed' || project.status === 'generating' || project.status === 'idle' ? 'review' : project.status,
    };
    if (data.scheduledAt && project.status === 'scheduled') { 
      updatedData.scheduledAt = data.scheduledAt.toISOString();
    } else if (!data.scheduledAt && project.status === 'scheduled') { 
        updatedData.status = 'review';
        updatedData.scheduledAt = undefined;
    }

    onUpdateProject(updatedData as Partial<VideoProject> & { id: string });
    toast({ title: "Changes Saved", description: "Your content has been updated." });
    setIsSaving(false);
  };

  const handleSchedule = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
        toast({ variant: "destructive", title: "Validation Failed", description: "Please fix the errors in the form before scheduling." });
        return;
    }
    const data = form.getValues();
    if (!data.scheduledAt) {
      toast({ variant: "destructive", title: "Scheduling Failed", description: "Please select a date and time to schedule." });
      return;
    }
    setIsScheduling(true);
    onUpdateProject({
      id: project.id,
      title: data.title,
      description: data.description,
      script: data.script,
      captionsSrt: data.captionsSrt,
      thumbnailDataUri: thumbnail,
      storyboard: storyboard,
      scheduledAt: data.scheduledAt.toISOString(),
      status: 'scheduled',
    });
    toast({ title: "Video Scheduled!", description: `Your video is scheduled for ${format(data.scheduledAt, "PPP p")}. (YouTube API integration is a future feature)` });
    setIsScheduling(false);
  };

  const handlePublishNow = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
        toast({ variant: "destructive", title: "Validation Failed", description: "Please fix the errors in the form before publishing." });
        return;
    }
    setIsPublishing(true);
    const data = form.getValues();
     onUpdateProject({
      id: project.id,
      title: data.title,
      description: data.description,
      script: data.script,
      captionsSrt: data.captionsSrt,
      thumbnailDataUri: thumbnail,
      storyboard: storyboard,
      status: 'published', 
      scheduledAt: new Date().toISOString(), 
    });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate publishing
    toast({ 
        title: project.status === 'published' ? "Already Published" : "Marked as Published!", 
        description: "Actual YouTube upload and publishing requires API integration (future feature)." 
    });
    setIsPublishing(false);
  };

  const handleRegenerateThumbnail = async () => {
    setIsGeneratingThumbnail(true);
    try {
      const currentTitle = form.getValues("title") || project.title;
      const basePrompt = project.prompt || "the video content";
      
      let thumbnailPrompt = `A compelling YouTube thumbnail (1280x720 pixels)`;
      if (currentTitle) {
        thumbnailPrompt += ` for a video titled "${currentTitle}"`;
      }
      thumbnailPrompt += ` based on the topic: "${basePrompt}". Ensure it's visually appealing, high-resolution, and click-worthy for a YouTube video format.`;

      const result = await generateThumbnail({ prompt: thumbnailPrompt });
      setThumbnail(result.thumbnailDataUri);
      // No need to call onUpdateProject here if main "Save Changes" handles it, or call it partially:
      // onUpdateProject({ id: project.id, thumbnailDataUri: result.thumbnailDataUri }); 
      toast({ title: "Thumbnail Regenerated!", description: "New thumbnail is ready. Save changes to persist." });
    } catch (error) {
      console.error("Thumbnail regeneration failed:", error);
      toast({ variant: "destructive", title: "Thumbnail Regeneration Failed", description: error instanceof Error ? error.message : "Could not regenerate thumbnail." });
    }
    setIsGeneratingThumbnail(false);
  };

  const handleRegenerateCaptions = async () => {
    const currentScript = form.getValues("script");
    if (!currentScript || currentScript.trim().length < 10) {
      toast({ variant: "destructive", title: "Script too short", description: "Please ensure the script has enough content to generate captions." });
      return;
    }
    setIsGeneratingCaptions(true);
    try {
      const result = await generateCaptions({ script: currentScript });
      form.setValue("captionsSrt", result.captionsSrt, { shouldValidate: true });
      // onUpdateProject({ id: project.id, captionsSrt: result.captionsSrt });
      toast({ title: "Captions Regenerated!", description: "New captions are ready. Save changes to persist." });
    } catch (error) {
      console.error("Caption regeneration failed:", error);
      toast({ variant: "destructive", title: "Caption Regeneration Failed", description: error instanceof Error ? error.message : "Could not regenerate captions." });
    }
    setIsGeneratingCaptions(false);
  };

  const handleRegenerateSceneImage = useCallback(async (sceneNumber: number, sceneDescription: string) => {
    setGeneratingSceneImage(sceneNumber);
    try {
      const result = await regenerateSceneImageAction({
        sceneDescription: sceneDescription,
        videoTopic: project.prompt || "general video topic"
      });
      if (result.imageDataUri) {
        setStoryboard(prevStoryboard => 
          prevStoryboard.map(scene => 
            scene.sceneNumber === sceneNumber ? { ...scene, imageDataUri: result.imageDataUri } : scene
          )
        );
        toast({ title: `Scene ${sceneNumber} Image Regenerated!`, description: "New image is ready. Save changes to persist." });
      } else {
        throw new Error(result.error || "Failed to get image data.");
      }
    } catch (error) {
      console.error(`Scene ${sceneNumber} image regeneration failed:`, error);
      toast({ variant: "destructive", title: `Scene ${sceneNumber} Image Failed`, description: error instanceof Error ? error.message : "Could not regenerate image." });
    }
    setGeneratingSceneImage(null);
  }, [project.prompt, toast]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSaveChanges)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1 & 2: Main Content Editing */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Details Card */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Video Details</CardTitle>
                <CardDescription>Review and edit the AI-generated title, description, and script.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="Enter video title" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="Enter video description" {...field} rows={6} className="min-h-[120px] resize-y" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="script" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Script</FormLabel>
                    <FormControl><Textarea placeholder="Enter video script" {...field} rows={15} className="min-h-[300px] resize-y" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
            
            {/* Captions Card */}
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Captions (SRT)</CardTitle>
                  <CardDescription>Review and edit the AI-generated SRT captions. You can regenerate them based on the current script.</CardDescription>
                </div>
                 <Button type="button" variant="outline" size="sm" onClick={handleRegenerateCaptions} disabled={isGeneratingCaptions || isSaving || isScheduling || isPublishing}>
                  {isGeneratingCaptions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                  Regenerate Captions
                </Button>
              </CardHeader>
              <CardContent>
                <FormField control={form.control} name="captionsSrt" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">SRT Captions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="1\n00:00:01,000 --> 00:00:03,500\nHello and welcome!\n\n2\n00:00:04,000 --> 00:00:06,000\nToday we're talking about..."
                        {...field} 
                        rows={15} 
                        className="min-h-[300px] resize-y font-mono text-xs" 
                        disabled={isGeneratingCaptions}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            {/* Storyboard Card */}
            {storyboard && storyboard.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ImageIcon className="h-6 w-6 text-primary"/> Visual Storyboard</CardTitle>
                  <CardDescription>AI-generated visual ideas for your video scenes. Regenerate images as needed.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {storyboard.map((scene) => (
                    <div key={scene.sceneNumber} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg">Scene {scene.sceneNumber}</h4>
                          <p className="text-sm text-muted-foreground">{scene.description}</p>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRegenerateSceneImage(scene.sceneNumber, scene.description)}
                          disabled={generatingSceneImage === scene.sceneNumber || isSaving || isScheduling || isPublishing}
                        >
                          {generatingSceneImage === scene.sceneNumber ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                          Regenerate Image
                        </Button>
                      </div>
                      <div className="aspect-video w-full relative bg-muted rounded-md overflow-hidden">
                        {generatingSceneImage === scene.sceneNumber ? (
                           <div className="flex h-full w-full items-center justify-center bg-secondary">
                              <Loader2 className="h-10 w-10 animate-spin text-primary" />
                           </div>
                        ) : scene.imageDataUri ? (
                          <Image src={scene.imageDataUri} alt={`Scene ${scene.sceneNumber} - ${scene.description}`} layout="fill" objectFit="cover" data-ai-hint="video scene" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                            <ImageIcon className="h-12 w-12 opacity-50" />
                            <span className="ml-2">No image generated or generation failed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

          </div>

          {/* Column 3: Thumbnail & Scheduling */}
          <div className="space-y-6">
            {/* Thumbnail Card */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Thumbnail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video w-full relative bg-muted rounded-md overflow-hidden">
                  {isGeneratingThumbnail ? (
                     <div className="flex h-full w-full items-center justify-center bg-secondary">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                     </div>
                  ) : thumbnail ? (
                    <Image src={thumbnail} alt="Video thumbnail" layout="fill" objectFit="cover" data-ai-hint="video thumbnail" />
                  ) : (
                    <Image src="https://placehold.co/1280x720.png?text=No+Thumbnail" alt="Placeholder thumbnail" layout="fill" objectFit="cover" data-ai-hint="placeholder video" />
                  )}
                </div>
                <Button type="button" variant="outline" className="w-full" onClick={handleRegenerateThumbnail} disabled={isGeneratingThumbnail || isSaving || isScheduling || isPublishing}>
                  {isGeneratingThumbnail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Regenerate Thumbnail
                </Button>
              </CardContent>
            </Card>

            {/* Scheduling Card */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Scheduling & Publishing</CardTitle>
                 <CardDescription>Prepare your video for YouTube.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="scheduledAt" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Schedule Date & Time (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isSaving || isScheduling || isPublishing || project.status === 'published'}
                          >
                            {field.value ? format(field.value, "PPP p") : <span>Pick a date & time</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                             const currentDate = field.value || new Date();
                             const newDate = date ? new Date(date) : new Date();
                             newDate.setHours(currentDate.getHours(), currentDate.getMinutes());
                             field.onChange(newDate);
                          }}
                          disabled={(date) => date < new Date(new Date().setDate(new Date().getDate()-1)) || isSaving || isScheduling || isPublishing}
                          initialFocus
                        />
                        <div className="p-2 border-t">
                          <Input type="time" 
                            defaultValue={field.value ? format(field.value, "HH:mm") : "12:00"}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              const newDateWithTime = field.value ? new Date(field.value) : new Date();
                              newDateWithTime.setHours(hours, minutes);
                              field.onChange(newDateWithTime);
                            }}
                            disabled={isSaving || isScheduling || isPublishing || project.status === 'published'}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
                 <Button onClick={handleSchedule} className="w-full" disabled={!form.getValues("scheduledAt") || isSaving || isScheduling || isPublishing || project.status === 'published'}>
                  {isScheduling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
                  {project.status === 'scheduled' && form.getValues("scheduledAt") ? 'Reschedule on YouTube' : 'Schedule on YouTube'}
                </Button>
                <Button onClick={handlePublishNow} variant="default" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isSaving || isScheduling || isPublishing || project.status === 'published'}>
                 {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Youtube className="mr-2 h-4 w-4" />}
                  {project.status === 'published' ? 'Published' : 'Publish Now to YouTube'}
                </Button>
                 <p className="text-xs text-muted-foreground text-center">(Actual YouTube API integration is a future feature)</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Sticky Footer Buttons */}
        <div className="sticky bottom-0 py-4 bg-background/90 backdrop-blur-sm border-t z-10 flex flex-wrap justify-end gap-3 px-4 md:px-0">
            <Button type="button" variant="outline" onClick={() => router.push('/')} disabled={isSaving || isScheduling || isPublishing}>
                Back to Dashboard
            </Button>
            <Button type="submit" disabled={isSaving || isScheduling || isPublishing || project.status === 'published'}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
            </Button>
        </div>

        {/* Generation Error Display */}
        {project.status === 'failed' && project.error && (
             <Card className="border-destructive bg-destructive/10 shadow-md">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle /> Generation Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive-foreground">{project.error}</p>
                    <p className="text-sm text-muted-foreground mt-2">You can edit the content and try saving again, or regenerate parts like the thumbnail, captions, or storyboard images.</p>
                </CardContent>
            </Card>
        )}
      </form>
    </Form>
  );
}
