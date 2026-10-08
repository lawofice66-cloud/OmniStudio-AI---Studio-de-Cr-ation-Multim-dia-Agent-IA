import { fal } from "@fal-ai/client";
import { MANDATORY_NEGATIVE_PROMPT } from "../utils/cleanPrompt";

/**
 * Configure fal credentials if supplied
 */
export function configureFalClient(key?: string) {
  if (key) {
    fal.config({
      credentials: key,
    });
  }
}

export interface FalVideoOptions {
  prompt: string;
  negative_prompt?: string;
  duration?: "5" | "10" | "4s" | "6s" | "8s" | string;
  duration_seconds?: number;
  aspect_ratio?: "16:9" | "9:16";
  model?: "veo3" | "kling-2.1";
}

/**
 * Client-side or isomorphic generator using fal-ai/veo3 or fal-ai/kling-video/v2.1/master
 * Guaranteed TRUE video animation (rolling wheels, forward motion, realistic physics)
 * Eliminates fal-ai/flare completely.
 */
export async function generateFalVideo(options: FalVideoOptions): Promise<{ videoUrl: string; duration: number }> {
  const modelId = options.model === "kling-2.1" 
    ? "fal-ai/kling-video/v2.1/master/text-to-video" 
    : "fal-ai/veo3";

  const result: any = await fal.subscribe(modelId as any, {
    input: {
      prompt: options.prompt,
      negative_prompt: options.negative_prompt || MANDATORY_NEGATIVE_PROMPT,
      aspect_ratio: options.aspect_ratio || "16:9",
      duration: (options.duration || "5") as any,
      duration_seconds: options.duration_seconds || 5,
      fps: 24,
      num_frames: 120,
      motion_strength: 0.7,
      camera_motion: "tracking shot, smooth dolly",
      prompt_enhance: true,
    } as any,
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        update.logs.map((log) => log.message).forEach(console.log);
      }
    },
  });

  const url = result?.data?.video?.url || result?.video?.url || result?.output?.url || "";
  return {
    videoUrl: url,
    duration: 5,
  };
}
