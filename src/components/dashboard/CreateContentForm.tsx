
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { generateAllContentAction } from "@/app/actions";
import type { VideoProject } from "@/types";
import { Sparkles, Loader2 } from "lucide-react";

const formSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters long."),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateContentFormProps {
  onContentGenerated: (project: VideoProject) => void;
}

export function CreateContentForm({ onContentGenerated }: CreateContentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    const newProjectId = `proj_${Date.now()}`; 
    const currentTime = new Date().toISOString();

    // Create a 'generating' state project to add to list immediately
    const generatingProject: VideoProject = {
      id: newProjectId,
      prompt: data.prompt,
      status: 'generating',
      createdAt: currentTime,
      updatedAt: currentTime,
      storyboard: [], // Initialize storyboard
    };
    onContentGenerated(generatingProject);

    let generatedContentForFailureCase: Awaited<ReturnType<typeof generateAllContentAction>> | undefined = undefined;

    try {
      const generatedContent = await generateAllContentAction(data.prompt);
      generatedContentForFailureCase = generatedContent; // Store for potential use in catch block
      
      const finalProject: VideoProject = {
        id: newProjectId, // Use the same ID
        prompt: data.prompt,
        title: generatedContent.title,
        description: generatedContent.description,
        script: generatedContent.script,
        thumbnailDataUri: generatedContent.thumbnailDataUri,
        captionsSrt: generatedContent.captionsSrt,
        storyboard: generatedContent.storyboard || [], // Add storyboard
        status: 'review', 
        createdAt: currentTime, // Keep original creation time
        updatedAt: new Date().toISOString(),
      };
      onContentGenerated(finalProject); // Update with generated content

      toast({
        title: "Content Generated!",
        description: "Your video assets are ready for review.",
      });
      form.reset();
    } catch (error) {
      console.error("Content generation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      
      const failedProject: VideoProject = {
        id: newProjectId, // Use the same ID
        prompt: data.prompt,
        status: 'failed',
        error: errorMessage,
        createdAt: currentTime, // Keep original creation time
        updatedAt: new Date().toISOString(),
        // Store partially generated content if available
        title: generatedContentForFailureCase?.title,
        description: generatedContentForFailureCase?.description,
        script: generatedContentForFailureCase?.script,
        thumbnailDataUri: generatedContentForFailureCase?.thumbnailDataUri,
        captionsSrt: generatedContentForFailureCase?.captionsSrt,
        storyboard: generatedContentForFailureCase?.storyboard || [],
      };
      onContentGenerated(failedProject); 

      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: `Could not generate content: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Sparkles className="h-6 w-6 text-primary" />
          Create New Video Content
        </CardTitle>
        <CardDescription>
          Enter a prompt for your video, and our AI will generate a script, title, description, thumbnail, captions, and a visual storyboard.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="prompt" className="text-lg font-semibold">Video Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      id="prompt"
                      placeholder="e.g., 'A 5-minute tutorial on how to make the perfect sourdough bread at home'"
                      rows={5}
                      className="resize-none text-base"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full md:w-auto" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Content
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
