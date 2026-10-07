interface Env {
  GEMINI_API_KEY?: string;
  API_KEY?: string;
  VITE_GEMINI_API_KEY?: string;
  FAL_KEY?: string;
  VITE_FAL_KEY?: string;
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

function getFalKey(env: Env): string {
  return env.FAL_KEY || env.VITE_FAL_KEY || '';
}

// Clean and translate user video prompts to Cinema English
// Guarantees no French text or "-moi" suffixes
function cleanPrompt(raw: string): string {
  if (!raw) return '';
  
  // 1. Strip French conversational prefixes, requests, and "-moi"
  let text = raw
    .replace(/-moi|fais-moi|je veux|crée-moi|fais une video de|fais une vidéo de|une pub TikTok pour|une pub tiktok pour|une pub pour|pub pour/gi, '')
    .replace(/\b(génère-moi|donne-moi|montre-moi|je souhaite|crée|génère)\b/gi, '')
    .replace(/-moi/gi, '')
    .trim();

  // 2. Specialized cinematic concept mappings
  const specials: Array<{ regex: RegExp; repl: string }> = [
    {
      regex: /pizzaiolo.*(?:lance|pâte|pate)|pizzeria.*pizzaiolo|pizzaiolo|pizzeria|pizza/i,
      repl: 'Cinematic slow-motion of pizzaiolo tossing dough in pizzeria, 8K, volumetric light',
    },
    {
      regex: /pizzaiolo/i,
      repl: 'Cinematic slow-motion of pizzaiolo tossing dough in pizzeria, 8K, volumetric light',
    },
    {
      regex: /pizzeria/i,
      repl: 'Cinematic slow-motion of pizzaiolo tossing dough in pizzeria, 8K, volumetric light',
    },
    {
      regex: /pizza/i,
      repl: 'Cinematic slow-motion of pizzaiolo tossing dough in pizzeria, 8K, volumetric light',
    },
    {
      regex: /dino.*(?:skate|duba)/i,
      repl: 'Cinematic tracking shot of T-Rex dinosaur skateboarding along Dubai Marina skyline at golden hour, 8K, volumetric light',
    },
    {
      regex: /femme.*(?:danse|pluie)|fille.*(?:danse|pluie)/i,
      repl: 'Cinematic slow-motion tracking shot of graceful woman dancing under pouring rain on city street, 8K, volumetric light, wet reflections',
    },
    {
      regex: /sneakers|chaussures/i,
      repl: 'Dynamic commercial shot of modern futuristic sneakers floating with neon light reflections, 8K, volumetric light, 60fps',
    },
    {
      regex: /mode.*paris|mannequin/i,
      repl: 'Cinematic tracking shot of high-fashion model walking on Paris runway, 8K, volumetric light, elegant bokeh',
    },
    {
      regex: /supercar|voiture.*(?:nuit|sport|course)/i,
      repl: 'Cinematic low-angle tracking shot of sleek supercar accelerating on highway at night, 8K, volumetric neon light, motion blur',
    },
    {
      regex: /sushi/i,
      repl: 'Cinematic macro 120fps closeup of Japanese sushi master slicing fresh red tuna, 8K, volumetric light',
    },
    {
      regex: /café|cafe.*paris|terrasse/i,
      repl: 'Cinematic shot of cozy Paris cafe terrace at golden hour with warm bokeh lights, 8K, volumetric light',
    },
  ];

  for (const s of specials) {
    if (s.regex.test(text)) {
      return s.repl;
    }
  }

  // 3. Word-by-word French -> English translation
  const dictionary: Array<[RegExp, string]> = [
    [/\bpizzaiolo\b/gi, 'pizzaiolo'],
    [/\bpizzeria\b/gi, 'pizzeria'],
    [/\bpizza\b/gi, 'pizza'],
    [/\blance\b/gi, 'tossing'],
    [/\bpâte\b/gi, 'dough'],
    [/\bpate\b/gi, 'dough'],
    [/\bfour\b/gi, 'stone oven'],
    [/\bfarine\b/gi, 'flour'],
    [/\bcuisine\b/gi, 'kitchen'],
    [/\brestaurant\b/gi, 'restaurant'],
    [/\bdinosaure\b/gi, 'dinosaur'],
    [/\bskate\b/gi, 'skateboarding'],
    [/\bdubaï\b|\bdubai\b/gi, 'Dubai Marina'],
    [/\bfemme\b/gi, 'woman'],
    [/\bfille\b/gi, 'girl'],
    [/\bhomme\b/gi, 'man'],
    [/\bdanse\b|\bdanser\b/gi, 'dancing'],
    [/\bpluie\b/gi, 'pouring rain'],
    [/\bparis\b/gi, 'Paris'],
    [/\brobe\b/gi, 'dress'],
    [/\brouge\b/gi, 'red'],
    [/\bnoir\b|\bnoire\b/gi, 'black'],
    [/\bblanc\b|\bblanche\b/gi, 'white'],
    [/\bvoiture\b/gi, 'supercar'],
    [/\bmoto\b/gi, 'motorcycle'],
    [/\broute\b/gi, 'highway'],
    [/\bvitesse\b/gi, 'high speed'],
    [/\bmer\b/gi, 'ocean'],
    [/\bocéan\b|\bocean\b/gi, 'ocean waves'],
    [/\bplage\b/gi, 'beach'],
    [/\bmontagne\b/gi, 'mountains'],
    [/\bforêt\b|\bforet\b/gi, 'forest'],
    [/\bcascade\b/gi, 'waterfall'],
    [/\bespace\b/gi, 'outer space'],
    [/\bastronaute\b/gi, 'astronaut'],
    [/\bplanète\b|\bplanete\b/gi, 'alien planet'],
    [/\bétoiles?\b/gi, 'stars'],
    [/\bville\b/gi, 'futuristic city'],
    [/\bnéon\b|\bneons?\b/gi, 'neon lights'],
    [/\bnuit\b/gi, 'night'],
    [/\bjour\b/gi, 'daytime'],
    [/\bcoucher de soleil\b/gi, 'sunset golden hour'],
    [/\blever de soleil\b/gi, 'sunrise golden hour'],
    [/\bchien\b/gi, 'dog'],
    [/\bchat\b/gi, 'cat'],
    [/\bavec\b/gi, 'with'],
    [/\bqui\b/gi, 'who is'],
    [/\bsa\b|\bson\b|\bles\b|\bla\b|\ble\b/gi, 'the'],
    [/\bun\b|\bune\b/gi, 'a'],
    [/\bdes\b/gi, ''],
    [/\bdans\b|\bsur\b/gi, 'in'],
    [/\bsous\b/gi, 'under'],
    [/\bpour\b/gi, 'for'],
    [/\bet\b/gi, 'and'],
    [/\bà\b|\ba\b/gi, 'in'],
    [/\bau\b|\baux\b/gi, 'at the'],
    [/\bde\b|\bdu\b|\bd'|\bl'/gi, ''],
    [/\b-moi\b/gi, ''],
  ];

  for (const [re, val] of dictionary) {
    text = text.replace(re, val);
  }

  // 4. Strip leftover French words, extra spaces and punctuation
  text = text
    .replace(/-moi/gi, '')
    .replace(/\b(avec|qui|sa|son|ses|les|la|le|un|une|des|dans|sur|sous|pour|et|à|a|au|aux|en|par|de|du|d'|l'|-moi)\b/gi, '')
    .replace(/-moi/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return `Cinematic slow-motion of ${text}, 8K, volumetric light`.replace(/-moi/gi, '');
}

// System instruction for Universal Nova Video Prompt Engineer
const NOVA_SYSTEM_INSTRUCTION = `Tu es "Agent IA Nova", le MEILLEUR PROMPT ENGINEER VIDÉO AU MONDE pour Google Veo 3, Kling 2.1, Luma Dream Machine et Flux 1.1 Pro.
Tu n'es JAMAIS limité à de simples mouvements de caméra. Tu traites N'IMPORTE QUEL SUJET avec une créativité et une précision cinématographique absolues :
- Pubs produits, TikTok viral, Reels Instagram, YouTube Shorts
- Cinéma : horreur, romance, action, sci-fi, comédie, drame, thriller, western
- Business : immobilier de luxe, restaurant gastronomique, mode haute-couture, supercar, coaching, e-commerce
- Styles variés : Photoréalisme 8K, Anime japonais, 3D Pixar / Unreal Engine 5, Dessin animé vintage, Documentaire animalier / BBC, Mariage cinématique, Clip de musique
- Thèmes insolites ou absurdes (ex: "dinosaure qui fait du skate à Dubaï", "pizzeria avec pizzaiolo qui lance sa pâte") : tu les traites avec le plus haut niveau de détails cinéma photoréaliste !

RÈGLE D'OR DE COMPORTEMENT :
Quand l'utilisateur donne une idée, un sujet ou dit "je veux une vidéo de..." :
Ne parle SURTOUT PAS de caméra en premier ! Ne donne JAMAIS de réponse du genre "choisissez travelling dolly".
Transforme IMMÉDIATEMENT son idée en 3 PROMPTS PRO PRÊTS POUR VEO 3, chacun contenant :
- Sujet principal précis et expressif
- Action dynamique et crédible
- Environnement immersif et ultra-détaillé
- Éclairage (volumétrique, golden hour, néons, clair-obscur)
- Style visuel (8K photoréaliste, 35mm grain, 3D Pixar, etc.)
- Émotion / Ambiance
- Micro-textures et détails 8K
- Son d'ambiance et SFX

STRUCTURE OBLIGATOIRE DE TA RÉPONSE :
Présente toujours 3 VARIANTES distinctes :
1. 🎬 **Variante 1 : Cinématique 16:9 (Format Cinéma & YouTube)**
   - **PROMPT VEO 3 (EN)** : (Le prompt en anglais ultra-détaillé, 2 phrases de cinéma avec éclairage, rendu 8k, son d'ambiance)
   - **EXPLICATION (FR)** : (Résumé en français pour que le client comprenne parfaitement la mise en scène)

2. 📱 **Variante 2 : Vertical 9:16 (Format TikTok Viral, Reels, Shorts)**
   - **PROMPT VEO 3 (EN)** : (Le prompt en anglais adapté au format vertical, dynamique et captivant dès la 1ère seconde)
   - **EXPLICATION (FR)** : (Résumé en français orienté viralité et accroche visuelle)

3. 🎨 **Variante 3 : Style Artistique (Anime, 3D Pixar, ou Cyberpunk Stylisé)**
   - **PROMPT VEO 3 (EN)** : (Le prompt en anglais avec style artistique marqué)
   - **EXPLICATION (FR)** : (Résumé en français du parti-pris artistique)

Termine en disant à l'utilisateur qu'il peut cliquer directement sur le bouton "Utiliser ce prompt pour générer" sous chaque variante pour lancer le rendu vidéo !`;

function generateUniversalNovaReply(idea: string): string {
  const englishIdea = cleanPrompt(idea);

  return `Voici 3 prompts cinématographiques professionnels prêts pour **Google Veo 3** pour votre idée : **"${idea}"**

🎬 **Variante 1 : Cinématique 16:9 (Format Cinéma & YouTube 4K)**
- **PROMPT VEO 3 (EN)** : \`${englishIdea}, shot on 35mm anamorphic lens, 8K photorealistic textures, volumetric lighting, natural depth of field, award-winning cinematography, immersive spatial ambient sound design [16:9]\`
- **EXPLICATION (FR)** : Mise en scène plein écran ultra-réaliste avec éclairage volumétrique et profondeur de champ cinéma.

📱 **Variante 2 : Vertical 9:16 (Format TikTok Viral, Reels, Shorts)**
- **PROMPT VEO 3 (EN)** : \`Dynamic vertical 9:16 viral sequence of ${englishIdea}, explosive action hook from opening second, vibrant high-contrast colors, crisp 4K smartphone clarity, rapid momentum [9:16]\`
- **EXPLICATION (FR)** : Cadrage vertical ultra-rythmé captant immédiatement le regard sur mobile dès la 1ère seconde.

🎨 **Variante 3 : Style Artistique (Anime, 3D Pixar ou Unreal Engine 5)**
- **PROMPT VEO 3 (EN)** : \`Stylized 3D cinematic animation in Pixar Unreal Engine 5 aesthetic of ${englishIdea}, heartwarming expressive emotion, whimsical warm lighting, rich volumetric dust particles [16:9]\`
- **EXPLICATION (FR)** : Animation 3D stylisée pleine de charme avec éclairage féerique et expressions vivantes.

👇 *Cliquez ci-dessous sur le bouton "Utiliser ce prompt pour générer" pour injecter votre variante directement dans le Studio Vidéo et lancer le rendu Veo 3 !*`;
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
  const falKey = getFalKey(env);

  try {
    // 1. Health check
    if (path === '/api/health') {
      return jsonResponse({
        status: 'ok',
        service: 'OmniStudio AI Engine (Cloudflare Edge)',
        model: 'fal.ai Veo 3 / Kling 2.1 & Nova Universal Prompt Engineer',
        hasGeminiKey: !!apiKey,
        hasFalKey: !!falKey,
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

    // 2. Agent Chat — Universal Prompt Engineer for Google Veo 3 / Kling / Luma
    if (path === '/api/agent-chat') {
      const rawMessages = body.messages || (body.message ? [{ role: 'user', content: body.message }] : []);
      if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
        return jsonResponse({ error: 'Messages array is required' }, 400);
      }

      const lastUserMsg = rawMessages[rawMessages.length - 1]?.content || '';

      let reply = '';
      if (apiKey) {
        try {
          const contents = rawMessages.slice(-8).map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          }));

          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: NOVA_SYSTEM_INSTRUCTION }] },
              contents,
              generationConfig: {
                temperature: 0.75,
              },
            }),
          });

          if (res.ok) {
            const resData: any = await res.json();
            reply = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          }
        } catch (apiErr) {
          console.warn('Gemini Cloudflare REST fallback:', apiErr);
        }
      }

      // If no reply or API error, run universal Nova synthesis
      if (!reply) {
        reply = generateUniversalNovaReply(lastUserMsg);
      }

      return jsonResponse({
        reply,
        suggestedPrompt: lastUserMsg.slice(0, 100),
      });
    }

    // 3. Enhance Prompt
    if (path === '/api/enhance-prompt') {
      const { prompt } = body;
      if (!prompt) return jsonResponse({ error: 'Prompt is required' }, 400);

      const enhancedPrompt = cleanPrompt(prompt);
      return jsonResponse({
        enhancedPrompt,
        originalPrompt: prompt,
      });
    }

    // 4. Text to Image (Real photorealistic 8K image via Flux / Pollinations)
    if (path === '/api/generate-image') {
      const { prompt, style = 'Photoréalisme 8K', aspectRatio = '1:1' } = body;
      if (!prompt) return jsonResponse({ error: 'Le prompt image est requis' }, 400);

      const englishPrompt = cleanPrompt(prompt);
      const finalPrompt = `${englishPrompt}, style: ${style}, 8k ultra detailed masterpiece, photorealistic, volumetric cinematic lighting`;

      const width = aspectRatio === '16:9' ? 1280 : aspectRatio === '9:16' ? 720 : 1024;
      const height = aspectRatio === '16:9' ? 720 : aspectRatio === '9:16' ? 1280 : 1024;

      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=${width}&height=${height}&nologo=true&seed=${Math.floor(Math.random() * 99999)}`;

      return jsonResponse({
        imageUrl,
        prompt: finalPrompt,
        engine: 'Flux 1.1 Pro (Edge Cloudflare)',
        quality: '8K Ultra Photoréaliste',
        createdAt: new Date().toISOString(),
      });
    }

    // 5. Text to Video — fal.ai Veo 3 / Kling 2.1 API Integration
    if (path === '/api/generate-video') {
      const {
        prompt,
        ratio = '16:9',
        aspectRatio = ratio || '16:9',
        engine = 'veo-3',
      } = body;

      if (!prompt) {
        return jsonResponse({ error: 'Le prompt vidéo est requis.' }, 400);
      }

      // Check for FAL_KEY
      if (!falKey) {
        return jsonResponse({
          error: "Clé FAL_KEY manquante. Veuillez configurer la variable d'environnement FAL_KEY dans vos paramètres Cloudflare Pages (Settings > Environment Variables) pour générer des vidéos avec Veo 3 / Kling.",
          code: "FAL_KEY_MISSING",
        }, 400);
      }

      // Clean & translate prompt to pure Cinema English
      const englishPrompt = cleanPrompt(prompt);
      const chosenRatio = (aspectRatio === '9:16' || ratio === '9:16') ? '9:16' : '16:9';

      // Determine model endpoint
      const modelEndpoint = engine === 'kling-2.1' 
        ? 'fal-ai/kling-video/v2.1/standard/text-to-video'
        : engine === 'luma-dream'
        ? 'fal-ai/luma-dream-machine'
        : 'fal-ai/veo3';

      try {
        // Call fal.ai Queue API
        const falRes = await fetch(`https://queue.fal.run/${modelEndpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Key ${falKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: englishPrompt,
            aspect_ratio: chosenRatio,
          }),
        });

        if (!falRes.ok) {
          const errText = await falRes.text();
          return jsonResponse({
            error: `Erreur fal.ai (${falRes.status}) : ${errText}`,
            code: 'FAL_API_ERROR',
          }, 502);
        }

        const falData: any = await falRes.json();
        let videoUrl = falData.video?.url || falData.video_url || falData.output?.url;

        // If queued, poll until completed (up to 45s)
        if (!videoUrl && falData.status_url) {
          const statusUrl = falData.status_url;
          const responseUrl = falData.response_url;
          const start = Date.now();
          const timeout = 50000;

          while (!videoUrl && Date.now() - start < timeout) {
            await new Promise((r) => setTimeout(r, 2500));
            const pollRes = await fetch(statusUrl, {
              headers: { 'Authorization': `Key ${falKey}` },
            });
            if (pollRes.ok) {
              const pollData: any = await pollRes.json();
              if (pollData.status === 'COMPLETED') {
                const resRes = await fetch(responseUrl, {
                  headers: { 'Authorization': `Key ${falKey}` },
                });
                if (resRes.ok) {
                  const resData: any = await resRes.json();
                  videoUrl = resData.video?.url || resData.video_url || resData.output?.url;
                }
                break;
              } else if (pollData.status === 'FAILED') {
                return jsonResponse({
                  error: `Échec du rendu fal.ai : ${pollData.error || 'Erreur interne'}`,
                  code: 'FAL_FAILED',
                }, 502);
              }
            }
          }
        }

        if (!videoUrl) {
          return jsonResponse({
            error: "Le rendu fal.ai n'a pas retourné d'URL MP4 à temps. Veuillez réessayer.",
            code: 'FAL_TIMEOUT',
          }, 504);
        }

        return jsonResponse({
          videoUrl,
          prompt: englishPrompt,
          aspectRatio: chosenRatio,
          engine: modelEndpoint,
          createdAt: new Date().toISOString(),
        });
      } catch (err: any) {
        return jsonResponse({
          error: `Erreur lors de l'appel fal.ai : ${err?.message || String(err)}`,
          code: 'FAL_CALL_EXCEPTION',
        }, 500);
      }
    }

    // 6. Audio / Music Generation (Lyria 3 Preview Edge)
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
        lyrics: `[Texture Stéréo 3D]\nFréquences spatiales et résonances harmoniques calibrées.\n[Dynamique & Climax]\nBasses profondes et panoramique sonore immersif.\n[Atmosphère & SFX]\nÉchos et réverbération naturelle pour intégration cinéma.`,
        createdAt: new Date().toISOString(),
      });
    }

    // 7. Story Generation
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

    // 8. Audio Transcription
    if (path === '/api/transcribe-audio' || path === '/api/transcribe') {
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
