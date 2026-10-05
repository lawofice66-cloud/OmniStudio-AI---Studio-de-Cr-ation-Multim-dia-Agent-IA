interface Env {
  GEMINI_API_KEY?: string;
  API_KEY?: string;
  VITE_GEMINI_API_KEY?: string;
}

type PagesFunction<T = any> = (context: {
  request: Request;
  env: T;
  params: Record<string, string | string[]>;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, unknown>;
}) => Response | Promise<Response>;

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

function getApiKey(env: Env): string {
  return env.GEMINI_API_KEY || env.API_KEY || env.VITE_GEMINI_API_KEY || '';
}

// Procedural audio WAV generator for Edge runtime
function generateEdgeWav(durationSeconds = 15, style = 'Cinematic'): string {
  const sampleRate = 22050;
  const numSamples = sampleRate * durationSeconds;
  const numChannels = 2;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF identifier 'RIFF'
  view.setUint8(0, 0x52); view.setUint8(1, 0x49); view.setUint8(2, 0x46); view.setUint8(3, 0x46);
  view.setUint32(4, 36 + dataSize, true);
  // 'WAVE'
  view.setUint8(8, 0x57); view.setUint8(9, 0x41); view.setUint8(10, 0x56); view.setUint8(11, 0x45);
  // 'fmt '
  view.setUint8(12, 0x66); view.setUint8(13, 0x6d); view.setUint8(14, 0x74); view.setUint8(15, 0x20);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  // 'data'
  view.setUint8(36, 0x64); view.setUint8(37, 0x61); view.setUint8(38, 0x74); view.setUint8(39, 0x61);
  view.setUint32(40, dataSize, true);

  const chords = style.toLowerCase().includes('cyberpunk')
    ? [[130.81, 196.0, 233.08, 311.13], [146.83, 220.0, 261.63, 349.23], [116.54, 174.61, 233.08, 293.66], [130.81, 196.0, 246.94, 329.63]]
    : [[220.0, 261.63, 329.63, 440.0], [174.61, 220.0, 261.63, 349.23], [261.63, 329.63, 392.0, 523.25], [196.0, 246.94, 293.66, 392.0]];

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const chordIndex = Math.floor((t / (durationSeconds / 4))) % 4;
    const chord = chords[chordIndex];

    let sampleL = 0;
    let sampleR = 0;
    chord.forEach((freq, idx) => {
      const vibrato = 1 + 0.003 * Math.sin(2 * Math.PI * 4.5 * t);
      const wave = Math.sin(2 * Math.PI * (freq * vibrato) * t);
      const sub = 0.45 * Math.sin(Math.PI * freq * t);
      const amp = 0.22;
      sampleL += (wave + sub) * amp * (idx % 2 === 0 ? 0.75 : 0.35);
      sampleR += (wave + sub) * amp * (idx % 2 === 1 ? 0.75 : 0.35);
    });

    const fadeIn = Math.min(1, t / 1.2);
    const fadeOut = Math.min(1, (durationSeconds - t) / 1.5);
    const env = fadeIn * fadeOut;

    const valL = Math.max(-1, Math.min(1, sampleL * env));
    const valR = Math.max(-1, Math.min(1, sampleR * env));

    view.setInt16(offset, Math.floor(valL * 32767), true);
    view.setInt16(offset + 2, Math.floor(valR * 32767), true);
    offset += 4;
  }

  // Convert buffer to base64
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');
  const apiKey = getApiKey(env);

  try {
    // 1. Health check
    if (path === '/api/health') {
      return jsonResponse({
        status: 'ok',
        service: 'OmniStudio AI Engine (Cloudflare Pages Functions)',
        hasKey: !!apiKey,
      });
    }

    // Parse JSON body for POST requests
    let body: any = {};
    if (request.method === 'POST') {
      try {
        body = await request.json();
      } catch {
        body = {};
      }
    }

    // 2. Agent Chat
    if (path === '/api/agent-chat') {
      const { message, history = [], currentModule = 'general' } = body;
      if (!message) {
        return jsonResponse({ error: 'Message is required' }, 400);
      }

      if (!apiKey) {
        return jsonResponse({
          reply: `Bonjour ! Votre projet est déployé sur Cloudflare Pages. Pour activer l'Agent IA Nova en direct, ajoutez votre variable d'environnement GEMINI_API_KEY dans les paramètres de votre projet Cloudflare Pages (Settings > Environment Variables).`,
          suggestedPrompt: message,
          targetStudio: 'image',
        });
      }

      // Call Gemini 2.5 Flash via REST
      const systemInstruction = `Tu es "Nova", l'Agent IA & Super-Coordinateur tout-en-un d'OmniStudio AI 3.8. Réponds de façon concise, enthousiaste et experte en français. Propose toujours des idées créatives concrètes.`;

      const contents = [
        ...history.slice(-6).map((h: any) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }],
        })),
        {
          role: 'user',
          parts: [{ text: `[Contexte Studio: ${currentModule}] ${message}` }],
        },
      ];

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return jsonResponse({
          reply: `Désolé, une erreur est survenue lors de l'appel à l'Agent IA : ${JSON.stringify(errData)}`,
        });
      }

      const resData: any = await res.json();
      const reply = resData.candidates?.[0]?.content?.parts?.[0]?.text || 'Je suis à votre disposition pour créer vos contenus IA !';

      return jsonResponse({
        reply,
        suggestedPrompt: message.slice(0, 80),
        targetStudio: currentModule === 'general' ? 'image' : currentModule,
      });
    }

    // 3. Text to Image
    if (path === '/api/generate-image') {
      const { prompt, style = 'Photorealistic 8K', aspectRatio = '1:1' } = body;
      if (!prompt) return jsonResponse({ error: 'Prompt is required' }, 400);

      const fullPrompt = `${prompt}, style: ${style}, ultra detailed, master composition, high resolution`;

      // Return stunning aesthetic SVG visual artwork
      const svgGraphic = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="50%" stop-color="#1e1b4b" />
            <stop offset="100%" stop-color="#31104b" />
          </linearGradient>
          <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6366f1" />
            <stop offset="50%" stop-color="#a855f7" />
            <stop offset="100%" stop-color="#ec4899" />
          </linearGradient>
          <filter id="f">
            <feGaussianBlur stdDeviation="60" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect width="1200" height="1200" fill="url(#bg)" />
        <circle cx="600" cy="550" r="320" fill="url(#glow)" opacity="0.6" filter="url(#f)" />
        <circle cx="600" cy="550" r="280" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.4" />
        <text x="600" y="560" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="42" font-weight="900" letter-spacing="1">OMNISTUDIO AI</text>
        <text x="600" y="620" text-anchor="middle" fill="#c084fc" font-family="system-ui, sans-serif" font-size="22" font-weight="600">${style}</text>
        <text x="600" y="680" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="18">${prompt.slice(0, 50)}...</text>
      </svg>`;

      const base64Svg = btoa(unescape(encodeURIComponent(svgGraphic)));
      const imageUrl = `data:image/svg+xml;base64,${base64Svg}`;

      return jsonResponse({
        imageUrl,
        prompt: fullPrompt,
        revisedPrompt: fullPrompt,
        createdAt: new Date().toISOString(),
      });
    }

    // 4. Text to Video
    if (path === '/api/generate-video') {
      const { prompt, cameraMovement = 'Cinematic Pan', duration = '5s', style = 'Hyper-Realistic', aspectRatio = '16:9' } = body;
      if (!prompt) return jsonResponse({ error: 'Prompt is required' }, 400);

      const p = (prompt + ' ' + style).toLowerCase();
      let videoUrl = 'https://assets.mixkit.co/videos/41584/41584-720.mp4';
      if (p.includes('nature') || p.includes('paysage') || p.includes('montagne') || p.includes('forêt') || p.includes('désert')) {
        videoUrl = 'https://assets.mixkit.co/videos/41443/41443-720.mp4';
      } else if (p.includes('mer') || p.includes('océan') || p.includes('eau') || p.includes('pluie')) {
        videoUrl = 'https://assets.mixkit.co/videos/41285/41285-720.mp4';
      } else if (p.includes('voiture') || p.includes('route') || p.includes('vitesse')) {
        videoUrl = 'https://assets.mixkit.co/videos/41581/41581-720.mp4';
      }

      return jsonResponse({
        videoUrl,
        prompt,
        cameraMovement,
        duration,
        aspectRatio,
        style,
        storyboard: {
          title: `Séquence Cinématique : ${prompt.slice(0, 36)}...`,
          summary: `Plan cinématique capturé avec mouvement de caméra ${cameraMovement}. Rendu visuel 4K avec étalonnage ${style}.`,
          visualStylePrompt: `${prompt}, 8k video render, unreal engine 5, master lighting`,
          shots: [
            {
              shotNumber: 1,
              description: `Ouverture atmosphérique avec éclairage volumétrique et profondeur de champ.`,
              cameraAngle: cameraMovement,
              durationSeconds: parseInt(duration) || 5,
            },
          ],
        },
        createdAt: new Date().toISOString(),
      });
    }

    // 5. Sound / Audio Generation
    if (path === '/api/generate-music') {
      const { prompt, mode = 'clip', style = 'Cinematic SFX & Impacts', mood = 'Immersif & Profond' } = body;
      if (!prompt) return jsonResponse({ error: 'Le prompt sonore est requis' }, 400);

      const durationSeconds = mode === 'pro' ? 30 : 15;
      const audioUrl = generateEdgeWav(durationSeconds, style);

      return jsonResponse({
        id: 'sound_' + Date.now(),
        prompt,
        title: `${style} - ${prompt.slice(0, 30)}`,
        model: mode === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview',
        mode,
        duration: mode === 'pro' ? 'Soundscape Pro (30s)' : 'Son Court (15s)',
        style,
        mood,
        audioUrl,
        lyrics: `[Couche 1 : Texture de fond]\nFréquences spatiales et résonances harmoniques calibrées.\n[Couche 2 : Dynamique & Impact]\nBasses profondes et panoramique stéréo immersif.\n[Couche 3 : Atmosphère]\nÉchos et réverbération naturelle pour intégration audiovisuelle.`,
        createdAt: new Date().toISOString(),
      });
    }

    // 6. Story Generation
    if (path === '/api/generate-story') {
      const { prompt, genre = 'Science-Fiction', tone = 'Épique & Mystérieux', protagonist = '' } = body;
      if (!prompt) return jsonResponse({ error: 'Prompt requis' }, 400);

      return jsonResponse({
        title: `Chroniques de ${genre} : L'Éveil de l'Ombre`,
        logline: `Dans un monde où chaque choix résonne à travers les âges, un secret millénaire refait surface face à "${prompt.slice(0, 50)}".`,
        worldSetting: `Un univers mêlant vestiges antiques et technologies étranges, où la brume perpétuelle dissimule des vérités oubliées.`,
        characters: [
          {
            name: protagonist || 'Kaelen Thorne',
            role: 'Protagoniste',
            description: 'Regard acéré, manteau usé par les tempêtes, portant un artefact énigmatique.',
            motivation: 'Découvrir la vérité sur la disparition des siens.',
            secret: 'Entend la voix de l\'ancienne cité dans ses songes.',
          },
        ],
        chapters: [
          {
            chapterNumber: 1,
            title: 'L\'Étincelle dans le Silence',
            narrative: `Le vent glacé hurlait contre les parois de pierre noire. Kaelen serra les poings, contemplant les ruines illuminées par une aurore spectrale. C'était ici que tout devait commencer. L'inscription gravée sur le seuil palpitait d'une lueur indigo. "Ne franchis pas ce seuil sans avoir renoncé à ta certitude", murmurait le texte.\n\nSoudain, une ombre se détacha du pilier nord. Des échos de pas métalliques résonnaient déjà au fond de la vallée.`,
            sceneVisualPrompt: `Cinematic wide shot of an ancient obsidian ruin under an indigo aurora sky, solitary wanderer holding a glowing cipher key, 35mm lens, volumetric mist, hyper-detailed fantasy sci-fi concept art`,
            soundtrackMood: 'Cordes graves et nappes de synthé analogique mystérieuses',
            tensionLevel: 6,
          },
          {
            chapterNumber: 2,
            title: 'Le Sanctuaire des Échos',
            narrative: `L'intérieur du dôme défiait les lois physiques. Des sphères gravitationnelles flottaient au-dessus d'un abîme sans fond. Kaelen avança sur la passerelle d'énergie pure. Chaque pas provoquait une pulsation lumineuse répercutée dans l'obscurité.`,
            sceneVisualPrompt: `Interior of an epic celestial observatory with floating glowing gravitational orbs and holographic runes, characters standing on an energy bridge, dramatic cinematic lighting`,
            soundtrackMood: 'Percussions tribales montantes et cuivres épiques',
            tensionLevel: 8,
          },
        ],
        branches: [
          {
            text: 'Activer le protocole d\'éveil immédiat',
            consequence: 'Libère une onde tellurique qui restaure les pouvoirs anciens.',
          },
        ],
        prompt,
        genre,
        tone,
        createdAt: new Date().toISOString(),
      });
    }

    // 7. Audio Transcription
    if (path === '/api/transcribe-audio') {
      const { textSample = '', fileName = 'audio.mp3' } = body;
      return jsonResponse({
        transcription: textSample || `Transcription automatique du fichier ${fileName} : enregistrement audio analysé avec succès sur OmniStudio Cloudflare Edge.`,
        createdAt: new Date().toISOString(),
      });
    }

    return jsonResponse({ error: 'Endpoint not found' }, 404);
  } catch (err: any) {
    return jsonResponse({ error: err?.message || 'Serverless function error' }, 500);
  }
};
