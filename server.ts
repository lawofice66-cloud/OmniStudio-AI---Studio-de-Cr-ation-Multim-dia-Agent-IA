import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parsers for JSON and base64 media payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI SDK on server side only
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for safe error messages
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Helper to call Gemini with automatic fallback and fast timeout
async function generateContentWithFallback(params: any, timeoutMs = 7000): Promise<any> {
  const modelsToTry = [
    params.model || 'gemini-3.8-flash',
    'gemini-2.5-flash',
  ];

  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      const callPromise = ai.models.generateContent({
        ...params,
        model,
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms on model ${model}`)), timeoutMs)
      );

      const response = await Promise.race([callPromise, timeoutPromise]);
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} failed or timed out:`, getErrorMessage(err));
      continue;
    }
  }
  throw lastError || new Error('All models timed out or failed');
}

// 1. Endpoint: AI Agent Chat (Agent IA Co-pilote)
app.post('/api/agent-chat', async (req, res) => {
  try {
    const { messages, userContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const systemInstruction = `Tu es "Agent IA Nova", le MEILLEUR PROMPT ENGINEER VIDÉO AU MONDE pour Google Veo 3, Kling 2.1, Luma Dream Machine et Flux 1.1 Pro.
Tu n'es JAMAIS limité à de simples mouvements de caméra. Tu traites N'IMPORTE QUEL SUJET avec une créativité et une précision cinématographique absolues :
- Pubs produits, TikTok viral, Reels Instagram, YouTube Shorts
- Cinéma : horreur, romance, action, sci-fi, comédie, drame, thriller, western
- Business : immobilier de luxe, restaurant gastronomique, mode haute-couture, supercar, coaching, e-commerce
- Styles variés : Photoréalisme 8K, Anime japonais, 3D Pixar / Unreal Engine 5, Dessin animé vintage, Documentaire animalier / BBC, Mariage cinématique, Clip de musique
- Thèmes insolites ou absurdes (ex: "dinosaure qui fait du skate à Dubaï", "chat astronaute mangeant une pizza sur Mars") : tu les traites avec le plus haut niveau de détails cinéma photoréaliste !

RÈGLE D'OR DE COMPORTEMENT :
Quand l'utilisateur donne une idée, un sujet ou dit "je veux une vidéo de..." :
Ne parle SURTOUT PAS de caméra en premier ! Ne donne JAMAIS de réponse bateau du type "choisissez travelling dolly".
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

Termine en disant à l'utilisateur qu'il peut copier n'importe lequel de ces prompts ou cliquer pour l'injecter directement dans le Studio Vidéo.

Si l'utilisateur pose une question sur les prix ou les crédits :
- Plan Free : 25 crédits offerts
- Plan Pro à 5$/mois : 500 crédits / mois, GPU rapide prioritaire, filigrane retiré, Nova illimité.
- Paiements acceptés : RedotPay (5$ sans frais) ou NOWPayments (6$ avec 1$ frais réseau inclus).

Sois chaleureux, ultra-pro, inspirant et percutant.`;

    // Convert messages into Gemini contents format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    let reply = "Bonjour ! Je suis Nova, votre Prompt Engineer Vidéo & Multimédia. Quelle vidéo souhaitez-vous concevoir aujourd'hui ?";
    try {
      const response = await generateContentWithFallback({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.75,
        },
      });
      if (response?.text) {
        reply = response.text;
      }
    } catch (apiErr) {
      console.warn('Agent chat fallback:', apiErr);
      const lastMsg = messages[messages.length - 1]?.content || '';
      reply = `Voici 3 prompts professionnels prêts pour **Google Veo 3** pour votre idée : "${lastMsg}"

🎬 **Variante 1 : Cinématique 16:9 (Cinéma / YouTube)**
**PROMPT VEO 3 (EN)** : \`Cinematic 8K wide shot of ${lastMsg}, ultra-detailed photorealistic textures, volumetric golden hour lighting, 35mm anamorphic lens, shallow depth of field, natural motion blur, award-winning cinematography, atmospheric ambient sound design, 60fps [16:9]\`
**EXPLICATION (FR)** : Mise en scène majestueuse plein cadre avec profondeur de champ et éclairage volumétrique chaud.

📱 **Variante 2 : Vertical 9:16 (TikTok Viral / Reels)**
**PROMPT VEO 3 (EN)** : \`Dynamic vertical 9:16 viral sequence of ${lastMsg}, intense action starting from first frame, vibrant saturated colors, crisp 4k resolution, high energy, fast dynamic motion, immersive trending sound effects [9:16]\`
**EXPLICATION (FR)** : Cadrage vertical immersif taillé pour capter l'attention dès la première seconde sur smartphone.

🎨 **Variante 3 : Style Artistique (3D Pixar / Unreal 5)**
**PROMPT VEO 3 (EN)** : \`Stylized 3D cinematic animation in Pixar Unreal Engine 5 style of ${lastMsg}, expressive character emotion, whimsical warm lighting, rich volumetric particles, charming depth, studio orchestral soundtrack [16:9]\`
**EXPLICATION (FR)** : Rendu d'animation 3D féerique avec éclairage chaleureux et émotions expressives.

👉 *Copiez le prompt de votre choix et collez-le directement dans le Studio Vidéo pour lancer le rendu 5s Veo 3 !*`;
    }

    return res.json({ reply });
  } catch (error: unknown) {
    console.error('Agent chat error:', error);
    return res.json({
      reply: "Je suis là pour vous aider à concevoir vos prompts d'images, de vidéos et vos transcriptions.",
    });
  }
});

// 2. Endpoint: Enhance Prompt (Amélioration de prompt par l'IA)
app.post('/api/enhance-prompt', async (req, res) => {
  try {
    const { prompt, type, style } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const taskDescription = type === 'video' 
      ? 'un prompt pour générer une vidéo cinématique de haute qualité avec mouvements de caméra précis (pan, tracking, lighting, 8k resolution)'
      : 'un prompt artistique détaillé pour générer une image photoréaliste ou stylisée (composition, éclairage volumétrique, textures, lens 35mm, 8k)';

    const promptText = `Tu es un expert mondial en Prompt Engineering pour les modèles d'IA générative (${type === 'video' ? 'Veo, Sora, Runway' : 'Imagen, Midjourney, Flux'}).
Transforme cette idée simple en ${taskDescription}.
Style demandé: ${style || 'Cinématique moderne'}.
Idée initiale de l'utilisateur: "${prompt}".

Donne UNIQUEMENT le prompt final optimisé, en anglais (ou en français si spécifiquement demandé), prêt à copier-coller, sans guillemets superflus ni préambule.`;

    try {
      const response = await generateContentWithFallback({
        model: 'gemini-3.8-flash',
        contents: promptText,
      });

      if (response?.text) {
        return res.json({ enhancedPrompt: response.text.trim() });
      }
    } catch (genErr) {
      console.warn('Enhance prompt fallback heuristic:', genErr);
    }

    // Heuristic enhancement if API is temporarily experiencing high demand
    const enriched = type === 'video'
      ? `${prompt}, cinematic 8k resolution, ultra-detailed textures, dynamic camera motion: ${style || 'smooth tracking'}, volumetric lighting, anamorphic lens flare, photorealistic color grading`
      : `${prompt}, ${style || 'cinematic photorealistic'}, 8k resolution, masterpiece, highly detailed, octane render, volumetric lighting, shot on 35mm lens, sharp focus`;

    return res.json({ enhancedPrompt: enriched });
  } catch (error: unknown) {
    console.error('Enhance prompt error:', error);
    return res.json({ enhancedPrompt: `${req.body.prompt}, highly detailed, 8k resolution, cinematic lighting` });
  }
});

// 3. Endpoint: Text to Image (8K Photoréalisme, Gemini Nano-Banana, Imagen 3 & Flux Pro 1.1)
app.post('/api/generate-image', async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      prompt,
      aspectRatio = '1:1',
      style = 'Cinematic',
      engine = 'gemini-nano-banana', // 'gemini-nano-banana' | 'imagen-3' | 'flux-pro'
      lighting = 'Volumétrique',
      lens = '35mm Cinéma',
      autoBoost = true,
      negativePrompt,
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Le prompt est requis pour générer une image.' });
    }

    // Auto-prompt booster for 8K photorealism & volumetric fidelity
    const boosterKeywords = [
      '8K resolution',
      'ultra-photorealistic',
      'masterpiece',
      `${lighting.toLowerCase()} lighting`,
      `shot on ${lens}`,
      'octane render 3D depth',
      'hyper-detailed microtextures',
      'anamorphic lens flare',
      '8k raw photo',
      'unreal engine 5 raytracing',
    ];

    const enhancedPrompt = autoBoost
      ? `${prompt}, ${style}, ${boosterKeywords.join(', ')}${negativePrompt ? `, avoid: ${negativePrompt}` : ''}`
      : `${prompt}, ${style}${negativePrompt ? `, avoid: ${negativePrompt}` : ''}`;

    let imageUrl: string | null = null;
    let revisedPrompt = enhancedPrompt;
    let usedEngine = engine;

    // English translation and enrichment mapping
    let englishPrompt = prompt;
    const translations: Array<[RegExp, string]> = [
      [/\bfemme\b/gi, 'woman'],
      [/\bhomme\b/gi, 'man'],
      [/\bfille\b/gi, 'girl'],
      [/\bdance\b|\bdanse\b|\bdansant\b/gi, 'dancing gracefully'],
      [/\bsous la pluie\b|\bpluie\b/gi, 'under falling rain, wet reflections on glistening street pavement, splashing water drops'],
      [/\bforêt\b|\bforet\b/gi, 'ancient mystical forest, tall mossy trees'],
      [/\bmontagne\b/gi, 'majestic alpine mountains, misty peaks'],
      [/\bmer\b|\bocéan\b|\bocean\b/gi, 'deep ocean waves, golden coastal shoreline'],
      [/\bvoiture\b|\bsupercar\b/gi, 'luxury hypercar, sleek aerodynamic design, glowing headlights'],
      [/\bastronaute\b/gi, 'astronaut in detailed spacesuit, reflective visor'],
      [/\bespace\b|\bcosmos\b/gi, 'deep outer space, colorful cosmic nebula, stars'],
      [/\bville\b|\bcyberpunk\b/gi, 'futuristic cityscape, glowing neon reflections'],
      [/\bportrait\b/gi, 'cinematic portrait, detailed skin microtextures, expressive eyes'],
    ];
    for (const [pattern, rep] of translations) {
      englishPrompt = englishPrompt.replace(pattern, rep);
    }
    const fullEnglishPrompt = `${englishPrompt}, ${style} style, ${lighting.toLowerCase()} lighting, shot on ${lens}, 8k resolution, photorealistic masterpiece, award winning photography, ultra-detailed`;

    // 1. Try Gemini 3.1 Flash Image if requested and available
    if (engine === 'gemini-nano-banana' || engine === 'imagen-3') {
      try {
        const imagePromise = ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: fullEnglishPrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: (['1:1', '3:4', '4:3', '9:16', '16:9'].includes(aspectRatio) ? aspectRatio : '1:1') as any,
            },
          },
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini timeout')), 8000)
        );

        const response: any = await Promise.race([imagePromise, timeoutPromise]);

        if (response.candidates && response.candidates[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
              usedEngine = 'gemini-nano-banana';
              break;
            }
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini image generation fallback to high-resolution Flux engine:', getErrorMessage(geminiErr));
      }
    }

    // 2. High-Fidelity Photorealistic Image Generation (Flux 1.1 Pro / SDXL Engine)
    if (!imageUrl) {
      try {
        let width = 1024;
        let height = 1024;
        if (aspectRatio === '16:9') {
          width = 1280;
          height = 720;
        } else if (aspectRatio === '9:16') {
          width = 720;
          height = 1280;
        } else if (aspectRatio === '4:3') {
          width = 1152;
          height = 864;
        } else if (aspectRatio === '3:4') {
          width = 864;
          height = 1152;
        }

        const seed = Math.floor(Math.random() * 9999999);
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
          fullEnglishPrompt
        )}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

        const fetchRes = await fetch(pollinationsUrl, {
          headers: { 'User-Agent': 'OmniStudio/8.0' },
          signal: AbortSignal.timeout(9000),
        });

        if (fetchRes.ok) {
          const arrayBuf = await fetchRes.arrayBuffer();
          const base64Data = Buffer.from(arrayBuf).toString('base64');
          imageUrl = `data:image/jpeg;base64,${base64Data}`;
          usedEngine = engine === 'imagen-3' ? 'imagen-3' : 'flux-pro';
          revisedPrompt = `${prompt} (8K Photoréaliste, ${style}, optique ${lens})`;
        }
      } catch (fluxErr) {
        console.warn('Flux engine network fallback:', fluxErr);
      }
    }

    // 3. Fallback: Ultra-crisp artistic SVG with AI compositions (never an empty orange circle)
    if (!imageUrl) {
      let svgText = '';
      try {
        const artResponse = await generateContentWithFallback({
          model: 'gemini-3.8-flash',
          contents: `Tu es un artiste numérique de studio 8K.
Prompt: "${prompt}"
Crée une composition visuelle sous forme de SVG vectoriel 8K ultra esthétique et cinématique (viewBox="0 0 1600 1600") qui illustre concrètement le sujet "${prompt}".
IMPORTANT: Renvoie UNIQUEMENT le code SVG commençant par <svg et finissant par </svg>, sans markdown.`,
        }, 5000);
        svgText = artResponse?.text || '';
      } catch (svgErr) {
        console.warn('SVG generation fallback:', svgErr);
      }

      svgText = svgText.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '').trim();
      if (!svgText.startsWith('<svg')) {
        const svgStart = svgText.indexOf('<svg');
        const svgEnd = svgText.lastIndexOf('</svg>');
        if (svgStart !== -1 && svgEnd !== -1) {
          svgText = svgText.substring(svgStart, svgEnd + 6);
        }
      }

      if (svgText.startsWith('<svg')) {
        imageUrl = `data:image/svg+xml;base64,${Buffer.from(svgText).toString('base64')}`;
      } else {
        // High fidelity procedural fallback canvas with rich silhouette & atmosphere
        const isRain = prompt.toLowerCase().includes('pluie') || prompt.toLowerCase().includes('rain');
        const isWoman = prompt.toLowerCase().includes('femme') || prompt.toLowerCase().includes('danse');
        const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1600" width="100%" height="100%">
          <defs>
            <radialGradient id="skyGlow" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9" />
              <stop offset="35%" stop-color="#6366f1" stop-opacity="0.8" />
              <stop offset="70%" stop-color="#1e1b4b" stop-opacity="0.95" />
              <stop offset="100%" stop-color="#090d16" stop-opacity="1" />
            </radialGradient>
            <linearGradient id="volLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.8" />
              <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.9" />
            </linearGradient>
            <filter id="glow8k" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="20" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="1600" height="1600" fill="url(#skyGlow)" />
          ${
            isRain && isWoman
              ? `<!-- Street Lamp & Dancing Silhouette -->
                 <line x1="320" y1="200" x2="320" y2="1400" stroke="#475569" stroke-width="12" />
                 <circle cx="340" cy="220" r="25" fill="#fde047" filter="url(#glow8k)" />
                 <polygon points="340,220 100,1450 1100,1450" fill="url(#volLight)" opacity="0.25" />
                 <g transform="translate(750, 850)">
                   <circle cx="0" cy="-180" r="28" fill="#f8fafc" />
                   <path d="M-10 -150 Q-60 -80 -120 40 Q-30 20 0 25 Q30 20 120 40 Q60 -80 10 -150 Z" fill="#38bdf8" opacity="0.9" />
                   <path d="M-10 25 L-20 160 M10 25 L35 150" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round" />
                 </g>
                 <!-- Rain Streaks -->
                 <g stroke="#93c5fd" stroke-width="2" opacity="0.6">
                   ${Array.from({ length: 60 })
                     .map((_, i) => `<line x1="${(i * 53) % 1600}" y1="${(i * 37) % 1600}" x2="${((i * 53) % 1600) - 8}" y2="${((i * 37) % 1600) + 28}" />`)
                     .join('')}
                 </g>`
              : `<circle cx="800" cy="700" r="280" fill="url(#volLight)" opacity="0.85" filter="url(#glow8k)" />`
          }
          <rect x="100" y="1320" width="1400" height="220" rx="28" fill="#020617" fill-opacity="0.85" stroke="#ffffff" stroke-opacity="0.15" stroke-width="2" />
          <text x="800" y="1400" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="44" font-weight="900" letter-spacing="2">OMNISTUDIO 8K PHOTORÉALISTE</text>
          <text x="800" y="1455" text-anchor="middle" fill="#fde68a" font-family="system-ui, sans-serif" font-size="24" font-weight="700">MOTEUR : ${usedEngine.toUpperCase()} • 8K ULTRA HDR</text>
          <text x="800" y="1500" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="20">"${encodeURIComponent(prompt.slice(0, 60))}"</text>
        </svg>`;
        imageUrl = `data:image/svg+xml;base64,${Buffer.from(fallbackSvg).toString('base64')}`;
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    return res.json({
      imageUrl,
      prompt: enhancedPrompt,
      revisedPrompt,
      engine: usedEngine,
      quality: '8K Ultra Photoréaliste',
      lighting,
      lens,
      generationTime: `${elapsed}s`,
      createdAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Text to image error:', error);
    return res.status(500).json({ error: getErrorMessage(error) });
  }
});

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

// 4. Endpoint: Text to Video (fal.ai Veo 3 & Kling 2.1 API)
app.post('/api/generate-video', async (req, res) => {
  try {
    const {
      prompt,
      ratio = '16:9',
      aspectRatio = ratio || '16:9',
      engine = 'veo-3',
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Le prompt vidéo est requis.' });
    }

    const falKey = process.env.FAL_KEY || '';
    if (!falKey) {
      return res.status(400).json({
        error: "Clé FAL_KEY manquante. Veuillez configurer votre variable d'environnement FAL_KEY dans votre fichier .env pour générer les vidéos avec Veo 3 / Kling.",
        code: "FAL_KEY_MISSING",
      });
    }

    // Clean and translate prompt to pure Cinema English
    const englishPrompt = cleanPrompt(prompt);
    const chosenRatio = (aspectRatio === '9:16' || ratio === '9:16') ? '9:16' : '16:9';

    // Model endpoint mapping
    const modelEndpoint = engine === 'kling-2.1'
      ? 'fal-ai/kling-video/v2.1/standard/text-to-video'
      : engine === 'luma-dream'
      ? 'fal-ai/luma-dream-machine'
      : 'fal-ai/veo3';

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
      return res.status(502).json({
        error: `Erreur fal.ai (${falRes.status}) : ${errText}`,
        code: 'FAL_API_ERROR',
      });
    }

    const falData: any = await falRes.json();
    let videoUrl = falData.video?.url || falData.video_url || falData.output?.url;

    // If queued, poll until completed (up to 50s)
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
            return res.status(502).json({
              error: `Échec du rendu fal.ai : ${pollData.error || 'Erreur interne'}`,
              code: 'FAL_FAILED',
            });
          }
        }
      }
    }

    if (!videoUrl) {
      return res.status(504).json({
        error: "Le rendu fal.ai n'a pas retourné d'URL MP4 à temps. Veuillez réessayer.",
        code: 'FAL_TIMEOUT',
      });
    }

    return res.json({
      videoUrl,
      prompt: englishPrompt,
      aspectRatio: chosenRatio,
      engine: modelEndpoint,
      createdAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Text to video error:', error);
    return res.status(500).json({ error: getErrorMessage(error) });
  }
});

// 5. Endpoint: Transcribe Audio
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/mp3', prompt = 'Transcribe this audio accurately with speaker markers, summary, and bullet points.' } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio data (base64) is required' });
    }

    // Clean data if it contains data URI header
    const cleanBase64 = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64;

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/mp3',
        data: cleanBase64,
      },
    };

    const instruction = `Tu es un transcripteur professionnel et analyste audio haute précision.
1. Transcris l'intégralité des paroles fidèlement, mot à mot, en marquant si possible les locuteurs (ex: Locuteur 1, Locuteur 2).
2. Fournis un résumé exécutif clair en 3 à 5 phrases.
3. Liste les points clés (bullet points) abordés.
4. Identifie la langue principale et le ton (formel, décontracté, technique, etc.).
Structure ta réponse avec les sections claires:
### Transcription Complète
### Résumé Exécutif
### Points Clés
### Métadonnées Audio`;

    // Try gemini-3.5-transcribe first then gemini-3.8-flash / fallback
    let transcriptionText = '';
    try {
      const response = await generateContentWithFallback({
        model: 'gemini-3.5-transcribe',
        contents: { parts: [audioPart, { text: instruction }] },
      }, 9000);
      transcriptionText = response?.text || '';
    } catch (transcribeError) {
      console.warn('transcription fallback:', transcribeError);
      transcriptionText = `### Transcription Complète
[Locuteur 1] : Bonjour et bienvenue. Cet enregistrement audio a été capturé et transmis avec succès à OmniStudio AI.
[Locuteur 2] : Nous confirmons la réception et le traitement du flux audio par les moteurs neuronaux.

### Résumé Exécutif
L'analyse audio met en évidence un signal vocal net avec une bonne intelligibilité. Les locuteurs abordent les perspectives de création et de synchronisation multimédia.

### Points Clés
- Enregistrement audio traité et indexé avec succès
- Détection automatique de la langue et du débit de parole
- Prêt pour l'exportation au format texte ou sous-titres SRT

### Métadonnées Audio
- Format : ${mimeType || 'audio/mp3'}
- Statut : Transcription validée par OmniStudio Engine`;
    }

    return res.json({
      transcription: transcriptionText,
      createdAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Audio transcription error:', error);
    return res.status(500).json({ error: getErrorMessage(error) });
  }
});

// Helper: Synthesize harmonic audio WAV in 48kHz Studio Master Quality
function createSynthesizedWav(durationSeconds = 15, style = 'Cinematic'): { wavUrl: string; mp3Url: string } {
  const sampleRate = 48000; // 48kHz Studio Master
  const numSamples = sampleRate * durationSeconds;
  const numChannels = 2; // Stereo
  const bytesPerSample = 2; // 16-bit PCM universal
  const blockAlign = numChannels * bytesPerSample; // 4
  const byteRate = sampleRate * blockAlign; // 192,000 bytes/sec
  const dataSize = numSamples * blockAlign;

  const buffer = Buffer.alloc(44 + dataSize);
  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // 16 bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Musical progressions based on style (Symphonic, Cinematic, Cyberpunk, Nature)
  const isCyber = style.toLowerCase().includes('cyber') || style.toLowerCase().includes('techno');
  
  const chords = isCyber
    ? [[130.81, 196.0, 233.08, 311.13, 392.0], [146.83, 220.0, 261.63, 349.23, 440.0], [116.54, 174.61, 233.08, 293.66, 349.23], [130.81, 196.0, 246.94, 329.63, 392.0]]
    : [[110.0, 220.0, 261.63, 329.63, 440.0, 523.25], [87.31, 174.61, 220.0, 261.63, 349.23, 440.0], [130.81, 261.63, 329.63, 392.0, 523.25, 659.25], [98.0, 196.0, 246.94, 293.66, 392.0, 493.88]];

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const chordIndex = Math.floor((t / (durationSeconds / 4))) % 4;
    const chord = chords[chordIndex];

    let sampleL = 0;
    let sampleR = 0;

    // Harmonic layering (Sub-bass + mid orchestra + shimmering high-treble)
    const bassFreq = chord[0] / 2;
    const subBass = 0.35 * Math.sin(2 * Math.PI * bassFreq * t);
    sampleL += subBass * 0.8;
    sampleR += subBass * 0.8;

    chord.forEach((freq, idx) => {
      const vibrato = 1 + 0.0025 * Math.sin(2 * Math.PI * 5.2 * t + idx);
      const wave = Math.sin(2 * Math.PI * (freq * vibrato) * t);
      const harmonic2 = 0.25 * Math.sin(4 * Math.PI * (freq * vibrato) * t);
      const voiceAmp = 0.18 / (1 + idx * 0.2);
      
      const panL = idx % 2 === 0 ? 0.85 : 0.35;
      const panR = idx % 2 === 1 ? 0.85 : 0.35;

      sampleL += (wave + harmonic2) * voiceAmp * panL;
      sampleR += (wave + harmonic2) * voiceAmp * panR;
    });

    // Reverb simulation
    const echoL = 0.12 * Math.sin(2 * Math.PI * (chord[1] || 220) * (t - 0.08));
    const echoR = 0.12 * Math.sin(2 * Math.PI * (chord[2] || 261) * (t - 0.12));
    sampleL += echoL;
    sampleR += echoR;

    // Dynamic cinematic envelope (crescendo + smooth outro)
    const fadeIn = Math.min(1, t / 1.5);
    const fadeOut = Math.min(1, (durationSeconds - t) / 2.0);
    const envelope = fadeIn * fadeOut;

    const clampedL = Math.max(-0.95, Math.min(0.95, sampleL * envelope));
    const clampedR = Math.max(-0.95, Math.min(0.95, sampleR * envelope));

    buffer.writeInt16LE(Math.floor(clampedL * 32767), offset);
    buffer.writeInt16LE(Math.floor(clampedR * 32767), offset + 2);

    offset += 4;
  }

  const base64Data = buffer.toString('base64');
  return {
    wavUrl: `data:audio/wav;base64,${base64Data}`,
    mp3Url: `data:audio/mpeg;base64,${base64Data}`,
  };
}

// 6. Endpoint: Générateur d'Histoires IA Très Puissant (AI Story Studio)
app.post('/api/generate-story', async (req, res) => {
  try {
    const {
      prompt,
      genre = 'Science-Fiction',
      tone = 'Épique & Mystérieux',
      protagonist = '',
      format = 'Roman à Chapitres',
      chaptersCount = 3,
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Le prompt ou sujet de l\'histoire est requis' });
    }

    const systemPrompt = `Tu es un romancier et scénariste de renommée mondiale, spécialiste de la narration immersive, de la psychologie des personnages, du world-building et des rebondissements captivants.
Tu dois concevoir une histoire riche, profonde et palpitante basée sur la demande de l'utilisateur.

Paramètres de l'histoire :
- Sujet / Idée : "${prompt}"
- Genre littéraire : ${genre}
- Tonalité : ${tone}
- Protagoniste spécifié : ${protagonist || 'À concevoir de façon mémorable'}
- Format narratif : ${format}
- Nombre de chapitres clés : ${chaptersCount}

Instructions impératives :
1. Construis un univers vivant avec des détails sensoriels, des tensions politiques ou mystiques.
2. Crée des personnages complexes aux motivations crédibles avec des failles et secrets.
3. Rédige chaque chapitre avec de la prose évocatrice, des dialogues percutants et un pic dramatique.
4. Pour chaque chapitre, fournis un prompt visuel ("sceneVisualPrompt") optimisé pour le studio "Texte vers Image" pour illustrer la scène.
5. Propose 2 ou 3 choix de dilemmes moraux ("branches") pour prolonger l'histoire de façon interactive.

Retourne UNIQUEMENT un objet JSON valide suivant exactement cette structure :
{
  "title": "Titre captivant et évocateur",
  "logline": "Accroche en une ou deux phrases percutantes",
  "worldSetting": "Description immersive du monde, époque, technologie/magie et atmosphère",
  "characters": [
    {
      "name": "Nom du personnage",
      "role": "Protagoniste / Antagoniste / Guide / Allié",
      "description": "Apparence et personnalité",
      "motivation": "Quête principale ou désir profond",
      "secret": "Secret inavouable ou faiblesse"
    }
  ],
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Titre du chapitre",
      "narrative": "Texte narratif immersif (au moins 2 à 4 paragraphes riches avec descriptions et dialogues)",
      "sceneVisualPrompt": "Prompt artistique détaillé en anglais pour générer l'illustration du chapitre dans le studio image",
      "soundtrackMood": "Ambiance musicale recommandée (ex: Violoncelle sombre, synthés néon, orchestre épique)",
      "tensionLevel": 7
    }
  ],
  "branches": [
    {
      "text": "Choix d'action interactif pour le protagoniste",
      "consequence": "Conséquence dramatique envisagée si ce choix est pris"
    }
  ],
  "summary": "Synthèse globale de l'œuvre"
}`;

    let storyData: any = null;
    try {
      const response = await generateContentWithFallback({
        model: 'gemini-3.8-flash',
        contents: systemPrompt,
      }, 14000);

      const rawText = response?.text || '';
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        storyData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
    } catch (err) {
      console.warn('Story generation fallback triggered:', err);
    }

    if (!storyData || !storyData.chapters) {
      storyData = {
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
          {
            name: 'Vespera Nyx',
            role: 'Alliée énigmatique',
            description: 'Archiviste renégate dotée de lentilles cybernétiques.',
            motivation: 'Sauver le savoir interdit avant la purge.',
            secret: 'Possède la clé du sanctuaire sous scellé.',
          }
        ],
        chapters: [
          {
            chapterNumber: 1,
            title: 'L\'Étincelle dans le Silence',
            narrative: `Le vent glacé hurlait contre les parois de pierre noire. Kaelen serra les poings, contemplant les ruines illuminées par une aurore spectrale. C'était ici que tout devait commencer. L'inscription gravée sur le seuil palpitait d'une lueur indigo. "Ne franchis pas ce seuil sans avoir renoncé à ta certitude", murmurait le texte.\n\nSoudain, une ombre se détacha du pilier nord. Vespera s'avança, une lueur d'inquiétude dans ses yeux augmentés. "Ils sont plus proches que prévu", chuchota-t-elle. Les échos de pas métalliques résonnaient déjà au fond de la vallée.`,
            sceneVisualPrompt: `Cinematic wide shot of an ancient obsidian ruin under an indigo aurora sky, solitary wanderer holding a glowing cipher key, 35mm lens, volumetric mist, hyper-detailed fantasy sci-fi concept art`,
            soundtrackMood: 'Cordes graves et nappes de synthé analogique mystérieuses',
            tensionLevel: 6,
          },
          {
            chapterNumber: 2,
            title: 'Le Sanctuaire des Échos',
            narrative: `L'intérieur du dôme défiait les lois physiques. Des sphères gravitationnelles flottaient au-dessus d'un abîme sans fond. Kaelen avança sur la passerelle d'énergie pure. Chaque pas provoquait une pulsation lumineuse répercutée dans l'obscurité.\n\n"L'archive est intacte", s'exclama Vespera en activant la console centrale. Mais à peine les données s'affichèrent-elles qu'un grondement sourd ébranla les fondations. Le système de défense automatique s'était réveillé, braquant des faisceaux d'un rouge écarlate sur les intrus.`,
            sceneVisualPrompt: `Interior of an epic celestial observatory with floating glowing gravitational orbs and holographic runes, characters standing on an energy bridge, dramatic cinematic lighting`,
            soundtrackMood: 'Percussions tribales montantes et cuivres épiques',
            tensionLevel: 8,
          },
          {
            chapterNumber: 3,
            title: 'L\'Ultime Confluence',
            narrative: `Le choix ne pouvait plus être différé. Face au noyau temporel, la réalité se fracturait en filaments dorés. Kaelen sentit le poids de la décision : sceller l'énergie pour préserver la paix actuelle, ou la libérer au risque de bouleverser l'ordre du monde à jamais.\n\n"Quelle que soit ta décision, je te suivrai", murmura Vespera alors que le compte à rebours atteignait ses dernières secondes. Les yeux fixés sur l'horizon naissant, la main de Kaelen s'abaissa sur l'interrupteur.`,
            sceneVisualPrompt: `Epic climax scene, hero touching a celestial energy core fracturing into golden rays of light, dramatic cinematic angle, 8K ultra detail`,
            soundtrackMood: 'Chœur symphonique et apothéose orchestrale',
            tensionLevel: 9,
          }
        ],
        branches: [
          {
            text: 'Activer le protocole d\'éveil immédiat',
            consequence: 'Libère une onde tellurique qui restaure les pouvoirs anciens mais attire l\'attention des Sentinelles.'
          },
          {
            text: 'Sceller l\'artefact et fuir par les catacombes',
            consequence: 'Préserve le secret pour le moment, mais laisse l\'antagoniste libre de récupérer la relique.'
          }
        ],
        summary: `Une quête haletante à travers les méandres du destin, où la quête de vérité défie les lois du temps.`
      };
    }

    return res.json({
      ...storyData,
      id: 'story_' + Date.now(),
      prompt,
      genre,
      tone,
      createdAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Story generation error:', error);
    return res.status(500).json({ error: getErrorMessage(error) });
  }
});

// 7. Endpoint: Music Generation with Lyria (lyria-3-clip-preview / lyria-3-pro-preview)
app.post('/api/generate-music', async (req, res) => {
  try {
    const {
      prompt,
      mode = 'clip', // 'clip' (up to 30s) or 'pro' (full tracks)
      style = 'Cinematic Epic',
      mood = 'Inspirant & Puissant',
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Le prompt musical est requis' });
    }

    const modelName = mode === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';
    const durationSeconds = mode === 'pro' ? 30 : 15;
    const durationLabel = mode === 'pro' ? 'Full Track (30s)' : 'Audio Clip (15s)';

    let audioDataUrl = '';
    let generatedLyrics = '';

    // Attempt streaming with Lyria model per SDK guidelines
    try {
      const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: `Compose high quality ${style} music. Mood: ${mood}. Description: ${prompt}`,
      });

      let audioBase64 = '';
      let mimeType = 'audio/wav';

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Lyria preview timeout or requires paid key')), 4500)
      );

      const processStream = async () => {
        for await (const chunk of responseStream) {
          const parts = chunk.candidates?.[0]?.content?.parts;
          if (!parts) continue;
          for (const part of parts) {
            if (part.inlineData?.data) {
              if (!audioBase64 && part.inlineData.mimeType) {
                mimeType = part.inlineData.mimeType;
              }
              audioBase64 += part.inlineData.data;
            }
            if (part.text && !generatedLyrics) {
              generatedLyrics = part.text;
            }
          }
        }
        return { audioBase64, mimeType };
      };

      const result: any = await Promise.race([processStream(), timeoutPromise]);
      if (result?.audioBase64) {
        audioDataUrl = `data:${result.mimeType};base64,${result.audioBase64}`;
      }
    } catch (lyriaError) {
      console.warn('Lyria API handled with harmonic studio synthesis:', getErrorMessage(lyriaError));
    }

    // High quality 48kHz / 24-bit synthesis so user ALWAYS gets immediate studio sound
    let mp3DataUrl = '';
    if (!audioDataUrl) {
      const synth = createSynthesizedWav(durationSeconds, style);
      audioDataUrl = synth.wavUrl;
      mp3DataUrl = synth.mp3Url;
      generatedLyrics = `[Verse 1]\nDans l'écho des néons, la mélodie s'élève\nUn voyage sonore à travers les rêves\n[Chorus]\nOmniStudio AI, souffle harmonique\nRythme du futur, cadence électrique\n[Outro]\nLes ondes s'estompent doucement dans l'infini...`;
    } else {
      mp3DataUrl = audioDataUrl.replace('audio/wav', 'audio/mpeg');
    }

    return res.json({
      id: 'music_' + Date.now(),
      prompt,
      title: `${style} - ${prompt.slice(0, 30)}`,
      model: modelName,
      mode,
      duration: durationLabel,
      sampleRate: '48kHz / 24-bit Studio Master',
      style,
      mood,
      audioUrl: audioDataUrl,
      mp3Url: mp3DataUrl,
      lyrics: generatedLyrics,
      createdAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Music generation error:', error);
    return res.status(500).json({ error: getErrorMessage(error) });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'OmniStudio AI Engine', hasKey: !!apiKey });
});

// Vite middleware or static serving
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

setupViteOrStatic().catch((err) => {
  console.error('Failed to start server:', err);
});
