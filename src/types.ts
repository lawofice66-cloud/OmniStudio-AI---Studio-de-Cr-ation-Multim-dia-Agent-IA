export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro';
  credits: number;
  avatar?: string;
  createdAt: string;
  isPro: boolean;
}

export interface ImageGeneration {
  id: string;
  prompt: string;
  revisedPrompt?: string;
  style: string;
  aspectRatio: string;
  imageUrl: string;
  createdAt: string;
  creditsUsed: number;
}

export interface VideoShot {
  shotNumber: number;
  camera: string;
  visualDescription: string;
  lighting: string;
  colorPalette: string[];
  duration: string;
}

export interface VideoStoryboard {
  title: string;
  synopsis: string;
  shots: VideoShot[];
  audioDesign?: {
    sfx: string;
    musicMood: string;
  };
}

export interface VideoGeneration {
  id: string;
  prompt: string;
  cameraMovement: string;
  duration: string;
  style: string;
  aspectRatio: string;
  videoUrl?: string;
  storyboard: VideoStoryboard;
  createdAt: string;
  creditsUsed: number;
}

export interface TranscriptionItem {
  id: string;
  fileName: string;
  audioDuration?: string;
  transcription: string;
  createdAt: string;
  creditsUsed: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface StoryCharacter {
  name: string;
  role: string;
  description: string;
  motivation: string;
  secret?: string;
}

export interface StoryChapter {
  chapterNumber: number;
  title: string;
  narrative: string;
  sceneVisualPrompt: string;
  soundtrackMood?: string;
  tensionLevel: number; // 1-10
}

export interface StoryBranchChoice {
  text: string;
  consequence: string;
}

export interface StoryGeneration {
  id: string;
  prompt: string;
  genre: string;
  tone: string;
  title: string;
  logline: string;
  worldSetting: string;
  characters: StoryCharacter[];
  chapters: StoryChapter[];
  branches?: StoryBranchChoice[];
  summary: string;
  createdAt: string;
  creditsUsed: number;
}

export interface MusicGeneration {
  id: string;
  prompt: string;
  model: 'lyria-3-clip-preview' | 'lyria-3-pro-preview';
  mode: 'clip' | 'pro';
  duration: string;
  style: string;
  mood: string;
  audioUrl: string;
  lyrics?: string;
  title: string;
  createdAt: string;
  creditsUsed: number;
}

export interface CreditTransaction {
  id: string;
  type: 'deduction' | 'addition';
  category: 'image' | 'video' | 'transcribe' | 'story' | 'music' | 'agent' | 'subscription' | 'bonus';
  actionName: string;
  amount: number;
  date: string;
  balanceAfter: number;
}

export const PRICING_CONFIG = {
  NOWPAYMENTS_URL: 'https://nowpayments.io/payment/?iid=6283011596',
  PRO_PRICE_USD: 5,
  FREE_PLAN_CREDITS: 25,
  PRO_PLAN_CREDITS: 500,
  CREDIT_COSTS: {
    AGENT_CHAT: 0.5, // Free for Pro users
    TRANSCRIBE: 1,
    STORY_GENERATOR: 2,
    TEXT_TO_IMAGE: 2,
    MUSIC_GENERATOR: 3,
    TEXT_TO_VIDEO: 5,
  },
};
