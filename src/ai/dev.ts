
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-thumbnail.ts';
import '@/ai/flows/generate-title-and-description.ts';
import '@/ai/flows/generate-video-script.ts';
import '@/ai/flows/generate-captions.ts';
import '@/ai/flows/generate-storyboard-from-script.ts'; // New
import '@/ai/flows/generate-image-for-scene.ts'; // New
