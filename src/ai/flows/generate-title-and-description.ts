// 'use server'
'use server';
/**
 * @fileOverview AI flow for generating video titles and descriptions.
 *
 * generateTitleAndDescription - A function that generates a title and description based on a prompt.
 * GenerateTitleAndDescriptionInput - The input type for the generateTitleAndDescription function.
 * GenerateTitleAndDescriptionOutput - The return type for the generateTitleAndDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTitleAndDescriptionInputSchema = z.object({
  prompt: z.string().describe('A prompt describing the video content.'),
});

export type GenerateTitleAndDescriptionInput = z.infer<typeof GenerateTitleAndDescriptionInputSchema>;

const GenerateTitleAndDescriptionOutputSchema = z.object({
  title: z.string().describe('The generated video title.'),
  description: z.string().describe('The generated video description.'),
});

export type GenerateTitleAndDescriptionOutput = z.infer<typeof GenerateTitleAndDescriptionOutputSchema>;

export async function generateTitleAndDescription(
  input: GenerateTitleAndDescriptionInput
): Promise<GenerateTitleAndDescriptionOutput> {
  return generateTitleAndDescriptionFlow(input);
}

const generateTitleAndDescriptionPrompt = ai.definePrompt({
  name: 'generateTitleAndDescriptionPrompt',
  input: {schema: GenerateTitleAndDescriptionInputSchema},
  output: {schema: GenerateTitleAndDescriptionOutputSchema},
  prompt: `You are a video marketing expert. Generate a compelling title and SEO-optimized description for a video based on the following prompt:

Prompt: {{{prompt}}}

Title:
Description: `,
});

const generateTitleAndDescriptionFlow = ai.defineFlow(
  {
    name: 'generateTitleAndDescriptionFlow',
    inputSchema: GenerateTitleAndDescriptionInputSchema,
    outputSchema: GenerateTitleAndDescriptionOutputSchema,
  },
  async input => {
    const {output} = await generateTitleAndDescriptionPrompt(input);
    return output!;
  }
);
