
'use server';

import { generateTitleAndDescription } from '@/ai/flows/generate-title-and-description';
import { generateVideoScript } from '@/ai/flows/generate-video-script';
import { generateThumbnail } from '@/ai/flows/generate-thumbnail';
import { generateCaptions } from '@/ai/flows/generate-captions';
import { generateStoryboardFromScript, type StoryboardSceneDescription } from '@/ai/flows/generate-storyboard-from-script';
import { generateImageForScene } from '@/ai/flows/generate-image-for-scene';
import type { VideoProject, StoryboardScene } from '@/types';

interface GeneratedContent {
  title?: string;
  description?: string;
  script?: string;
  thumbnailDataUri?: string;
  captionsSrt?: string;
  storyboard?: StoryboardScene[];
}

export async function generateAllContentAction(prompt: string): Promise<GeneratedContent> {
  if (!prompt || prompt.trim() === "") {
    throw new Error("Prompt cannot be empty.");
  }

  try {
    const generatedContent: GeneratedContent = {};
    let hasErrors = false;
    const errorMessages: string[] = [];

    // Generate Title, Description, Script, and initial Thumbnail
    const [titleDescResult, scriptResult, thumbnailResultInitial] = await Promise.allSettled([
      generateTitleAndDescription({ prompt }),
      generateVideoScript({ prompt }),
      generateThumbnail({ prompt: `A compelling YouTube thumbnail for a video about: "${prompt}". Ensure it's visually appealing, high-resolution (1280x720), and click-worthy for a YouTube video format.` })
    ]);

    if (titleDescResult.status === 'fulfilled') {
      generatedContent.title = titleDescResult.value.title;
      generatedContent.description = titleDescResult.value.description;
    } else {
      hasErrors = true;
      errorMessages.push(`Title/Description generation failed: ${titleDescResult.reason}`);
      console.error("Title/Description generation error:", titleDescResult.reason);
    }

    if (scriptResult.status === 'fulfilled' && scriptResult.value.script) {
      generatedContent.script = scriptResult.value.script;
      // Generate captions if script is available
      try {
        const captionsResult = await generateCaptions({ script: generatedContent.script });
        generatedContent.captionsSrt = captionsResult.captionsSrt;
      } catch (captionError) {
        errorMessages.push(`Captions generation failed: ${captionError instanceof Error ? captionError.message : String(captionError)}`);
        console.error("Captions generation error:", captionError);
      }

      // Generate storyboard from script
      try {
        const storyboardDescriptionsResult = await generateStoryboardFromScript({ script: generatedContent.script, maxScenes: 5 }); // Limiting to 5 scenes for now
        if (storyboardDescriptionsResult.scenes && storyboardDescriptionsResult.scenes.length > 0) {
          const sceneImagePromises = storyboardDescriptionsResult.scenes.map(sceneDesc =>
            generateImageForScene({ sceneDescription: sceneDesc.description, videoTopic: prompt })
              .then(imageResult => ({ ...sceneDesc, imageDataUri: imageResult.imageDataUri }))
              .catch(err => {
                console.error(`Failed to generate image for scene ${sceneDesc.sceneNumber}:`, err);
                errorMessages.push(`Image generation for scene ${sceneDesc.sceneNumber} ("${sceneDesc.description.substring(0,20)}...") failed.`);
                return { ...sceneDesc, imageDataUri: undefined }; // Still include scene description
              })
          );
          
          const settledSceneImages = await Promise.allSettled(sceneImagePromises);
          
          generatedContent.storyboard = settledSceneImages.map(result => {
            if (result.status === 'fulfilled') {
              return result.value as StoryboardScene;
            } else {
              // This case should ideally be handled by the catch within the map,
              // but as a fallback, ensure a scene description is present even if image failed.
              // This assumes the 'result.reason' might contain the original sceneDesc if the promise was constructed that way.
              // For safety, we rely on the inner catch.
              return null; 
            }
          }).filter(scene => scene !== null) as StoryboardScene[];

        }
      } catch (storyboardError) {
        errorMessages.push(`Storyboard generation failed: ${storyboardError instanceof Error ? storyboardError.message : String(storyboardError)}`);
        console.error("Storyboard generation error:", storyboardError);
      }

    } else {
      hasErrors = true;
      errorMessages.push(`Script generation failed: ${scriptResult.reason}`);
      console.error("Script generation error:", scriptResult.reason);
    }
    
    if (thumbnailResultInitial.status === 'fulfilled') {
      generatedContent.thumbnailDataUri = thumbnailResultInitial.value.thumbnailDataUri;
    } else {
      hasErrors = true;
      errorMessages.push(`Thumbnail generation failed: ${thumbnailResultInitial.reason}`);
      console.error("Thumbnail generation error:", thumbnailResultInitial.reason);
    }
    
    if (hasErrors && (!generatedContent.title || !generatedContent.script || !generatedContent.thumbnailDataUri)) {
        // If critical generations (title, script, thumbnail) failed
        throw new Error(`Critical AI content generation failed. Errors: ${errorMessages.join('; ')}`);
    } else if (errorMessages.length > 0) {
      // Non-critical errors occurred (e.g. captions, storyboard images)
      // We can attach these to the content for display or logging
      // For now, they are logged and won't prevent content review if critical parts are there.
      console.warn("Non-critical errors during content generation:", errorMessages.join('; '))
    }
    
    return generatedContent;

  } catch (error) {
    console.error("Error in generateAllContent server action:", error);
    if (error instanceof Error) {
        throw new Error(error.message || "Failed to generate content using AI due to an unexpected error.");
    }
    throw new Error("Failed to generate content using AI due to an unknown error.");
  }
}


export async function regenerateSceneImageAction(
    { sceneDescription, videoTopic }: { sceneDescription: string; videoTopic: string }
  ): Promise<{imageDataUri?: string; error?: string}> {
  if (!sceneDescription || !videoTopic) {
    return { error: "Scene description and video topic are required." };
  }
  try {
    const result = await generateImageForScene({ sceneDescription, videoTopic });
    return { imageDataUri: result.imageDataUri };
  } catch (error) {
    console.error("Scene image regeneration failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Could not regenerate scene image.";
    return { error: errorMessage };
  }
}
