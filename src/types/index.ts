
export interface StoryboardScene {
  sceneNumber: number;
  description: string;
  imageDataUri?: string; // base64 data URI for the scene's image
  // estimatedDurationSeconds?: number; // Future enhancement
}

export interface VideoProject {
  id: string;
  prompt: string;
  title?: string;
  description?: string;
  script?: string;
  thumbnailDataUri?: string; // base64 data URI
  captionsSrt?: string; // SRT formatted captions
  storyboard?: StoryboardScene[]; // Array of storyboard scenes
  status: 'idle' | 'generating' | 'review' | 'scheduled' | 'published' | 'failed';
  scheduledAt?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  error?: string; // To store error messages if generation fails
}
