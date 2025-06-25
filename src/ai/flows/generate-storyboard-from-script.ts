
'use server';
/**
 * @fileOverview AI flow for generating a storyboard (list of scene descriptions) from a video script.
 *
 * - generateStoryboardFromScript - A function that generates storyboard scenes from a script.
 * - GenerateStoryboardInput - The input type for the generateStoryboardFromScript function.
 * - GenerateStoryboardOutput - The return type for the generateStoryboardFromScript function.
 * - StoryboardSceneDescription - Represents a single scene with its description.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryboardInputSchema = z.object({
  script: z.string().describe('The video script to generate a storyboard from.'),
  maxScenes: z.number().optional().default(10).describe('Maximum number of scenes to generate for the storyboard. Default is 10.'),
});

export type GenerateStoryboardInput = z.infer<typeof GenerateStoryboardInputSchema>;

const StoryboardSceneDescriptionSchema = z.object({
  sceneNumber: z.number().describe('The sequential number of the scene.'),
  description: z.string().describe('A concise visual description of the scene. This will be used to generate an image for the scene.'),
});
export type StoryboardSceneDescription = z.infer<typeof StoryboardSceneDescriptionSchema>;

const GenerateStoryboardOutputSchema = z.object({
  scenes: z.array(StoryboardSceneDescriptionSchema).describe('An array of storyboard scene descriptions.'),
});

export type GenerateStoryboardOutput = z.infer<typeof GenerateStoryboardOutputSchema>;

export async function generateStoryboardFromScript(
  input: GenerateStoryboardInput
): Promise<GenerateStoryboardOutput> {
  return generateStoryboardFromScriptFlow(input);
}

const generateStoryboardPrompt = ai.definePrompt({
  name: 'generateStoryboardPrompt',
  input: {schema: GenerateStoryboardInputSchema},
  output: {schema: GenerateStoryboardOutputSchema},
  prompt: `You are an expert storyboard artist for video production.
Given the following video script, break it down into a sequence of distinct visual scenes.
For each scene:
1. Assign a sequential 'sceneNumber', starting from 1.
2. Provide a concise 'description' of what should be visually represented in that scene. This description should be suitable for an AI image generator to create a compelling visual for that part of the script. Focus on key actions, characters, settings, or objects.
Limit the number of scenes to a maximum of {{{maxScenes}}}. If the script is short, generate fewer scenes.

Video Script:
{{{script}}}

Generate a list of scenes based on these instructions.
Output ONLY the structured list of scenes.
`,
});

const generateStoryboardFromScriptFlow = ai.defineFlow(
  {
    name: 'generateStoryboardFromScriptFlow',
    inputSchema: GenerateStoryboardInputSchema,
    outputSchema: GenerateStoryboardOutputSchema,
  },
  async input => {
    const {output} = await generateStoryboardPrompt(input);
    return output!;
  }
);
