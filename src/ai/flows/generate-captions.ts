
'use server';
/**
 * @fileOverview AI flow for generating video captions (SRT format) from a script.
 *
 * - generateCaptions - A function that generates SRT captions from a video script.
 * - GenerateCaptionsInput - The input type for the generateCaptions function.
 * - GenerateCaptionsOutput - The return type for the generateCaptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCaptionsInputSchema = z.object({
  script: z.string().describe('The video script to generate captions from.'),
  // Optional: estimatedDurationMinutes: z.number().optional().describe('Optional estimated duration of the video in minutes to help with timing.'),
});

export type GenerateCaptionsInput = z.infer<typeof GenerateCaptionsInputSchema>;

const GenerateCaptionsOutputSchema = z.object({
  captionsSrt: z
    .string()
    .describe('The generated video captions in SRT (SubRip Text) format.'),
});

export type GenerateCaptionsOutput = z.infer<typeof GenerateCaptionsOutputSchema>;

export async function generateCaptions(
  input: GenerateCaptionsInput
): Promise<GenerateCaptionsOutput> {
  return generateCaptionsFlow(input);
}

const generateCaptionsPrompt = ai.definePrompt({
  name: 'generateCaptionsPrompt',
  input: {schema: GenerateCaptionsInputSchema},
  output: {schema: GenerateCaptionsOutputSchema},
  prompt: `You are an expert in video production and captioning.
Given the following video script, convert it into SRT (SubRip Text) format.

Video Script:
{{{script}}}

Instructions for SRT generation:
1.  Break the script into logical caption segments. Each segment should represent a few seconds of speech.
2.  Assign a sequence number to each caption block, starting from 1.
3.  Assign plausible start and end timestamps for each caption block in the format HH:MM:SS,mmm (hours:minutes:seconds,milliseconds).
    - Assume a normal speaking pace for the script. Estimate the timings based on the length of the script segments.
    - Ensure timestamps are sequential and do not overlap significantly in a way that makes captions unreadable.
4.  The final output must be a valid SRT formatted string. Each entry should look like:
    sequence_number
    HH:MM:SS,mmm --> HH:MM:SS,mmm
    Caption text line 1
    (Optional caption text line 2)

    (Blank line separating entries)

Ensure the entire script is covered.
Make reasonable estimations for the timing of each caption block.
If the script is very short, the total duration will be short. If it's long, the total duration will be longer.
Do not add any commentary or explanations outside of the SRT formatted text itself.
Output only the SRT formatted string.
`,
});

const generateCaptionsFlow = ai.defineFlow(
  {
    name: 'generateCaptionsFlow',
    inputSchema: GenerateCaptionsInputSchema,
    outputSchema: GenerateCaptionsOutputSchema,
  },
  async input => {
    const {output} = await generateCaptionsPrompt(input);
    return output!;
  }
);
