
'use server';
/**
 * @fileOverview AI flow for generating an image for a specific video scene.
 *
 * - generateImageForScene - Generates an image based on a scene description and video topic.
 * - GenerateImageForSceneInput - Input type.
 * - GenerateImageForSceneOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageForSceneInputSchema = z.object({
  sceneDescription: z.string().describe('The textual description of the scene to visualize.'),
  videoTopic: z.string().describe('The overall topic or original prompt for the video, providing context.'),
});
export type GenerateImageForSceneInput = z.infer<typeof GenerateImageForSceneInputSchema>;

const GenerateImageForSceneOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The generated image for the scene as a data URI (e.g., 'data:image/png;base64,...')."
    ),
});
export type GenerateImageForSceneOutput = z.infer<typeof GenerateImageForSceneOutputSchema>;

export async function generateImageForScene(
  input: GenerateImageForSceneInput
): Promise<GenerateImageForSceneOutput> {
  return generateImageForSceneFlow(input);
}

// Note: The Gemini image generation model does not officially support explicit resolution control via prompt alone.
// However, including it in the prompt can sometimes influence the aspect ratio and style.
// The actual output resolution is determined by the model.
const generateImageForSceneFlow = ai.defineFlow(
  {
    name: 'generateImageForSceneFlow',
    inputSchema: GenerateImageForSceneInputSchema,
    outputSchema: GenerateImageForSceneOutputSchema,
  },
  async input => {
    const imagePrompt = `Create a visually compelling, HD-quality image (aiming for 1280x720 aspect ratio) for a video scene.
Scene description: "${input.sceneDescription}"
The overall video is about: "${input.videoTopic}"
The image should be suitable as a visual in a YouTube video. Cinematic style.`;

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: imagePrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed or did not return a media URL.');
    }
    return {imageDataUri: media.url};
  }
);
