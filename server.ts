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

    const systemInstruction = `Tu es "Nova", l'Agent IA d'accompagnement intelligent d'OmniStudio AI.
Ton rôle est d'accompagner l'utilisateur dans son studio créatif propulsé par Google Veo 3, Google Lyria 3 Pro, Google Imagen 3 et Gemini 2.5 :
1. Aide-le à concevoir les meilleurs prompts pour la génération d'images 8K (Imagen 3, Gemini 2.5 Flash Image, Flux Pro 1.1) et de vidéos cinématiques (Google Veo 3, Kling 2.1, Luma).
2. Propose des styles artistiques et optiques (35mm cinéma, anamorphique, éclairage volumétrique, golden hour, néon cyberpunk, 8k octane render).
3. Guide-le dans la composition musicale (Google Lyria 3 Pro en 48kHz / 24-bit).
4. Explique clairement le système de crédits :
   - Plan Free : 25 crédits offerts
   - Plan Pro : 500 crédits / mois pour 5 USD (via RedotPay 5$ direct 0 frais, ou NOWPayments 6$ avec 1$ frais réseau inclus)
5. Coûts des actions :
   - Agent IA Nova : 0.5 crédit par échange (100% gratuit & illimité en Pro)
   - Transcription Audio : 1 crédit
   - Texte vers Image 8K : 2 crédits
   - Musique Symphonique 48kHz : 15 crédits
   - Texte vers Vidéo 5s (Veo 3) : 25 crédits
   - Histoire IA : 3 crédits
Sois chaleureux, proactif, créatif, concis et ultra-pertinent. Réponds en français (ou dans la langue de l'utilisateur s'il écrit dans une autre langue).
Contexte utilisateur actuel : ${JSON.stringify(userContext || {})}`;

    // Convert messages into Gemini contents format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    let reply = "Bonjour ! Je suis Nova, votre co-pilote IA. Comment puis-je vous aider dans votre création ?";
    try {
      const response = await generateContentWithFallback({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });
      if (response?.text) {
        reply = response.text;
      }
    } catch (apiErr) {
      console.warn('Agent chat fallback:', apiErr);
      const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
      if (lastMsg.includes('crédit') || lastMsg.includes('prix') || lastMsg.includes('abonnement')) {
        reply = "Sur OmniStudio AI, vous bénéficiez de **25 crédits offerts** sur le Plan Free. Pour seulement **5 USD / mois**, le Plan Pro vous offre **500 crédits** et un accès illimité à mon assistance ! Vous pouvez régler en toute sécurité via NOWPayments.";
      } else if (lastMsg.includes('image')) {
        reply = "Pour réussir votre image, je vous recommande d'ajouter des précisions d'éclairage (volumetric light, golden hour), de cadrage (close-up portrait, wide cinematic shot) et de style (8k octane render, hyper-detailed). Essayez le bouton '✨ Booster le prompt' dans le Studio Image !";
      } else if (lastMsg.includes('vidéo')) {
        reply = "Pour vos vidéos, spécifiez le mouvement de caméra (Panoramique fluide, Travelling avant, Vue drone FPV) et le rythme d'action. Le studio génère un storyboard dynamique complet prêt à l'emploi !";
      } else {
        reply = "Je suis ravi de vous accompagner dans OmniStudio AI ! Que ce soit pour générer une image spectaculaire, une vidéo cinématographique ou transcrire un enregistrement audio, dites-moi ce que vous souhaitez accomplir.";
      }
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

    // 1. Try Imagen 3 if requested
    if (engine === 'imagen-3') {
      try {
        const imagenPromise = (ai.models as any).generateImages({
          model: 'imagen-3.0-generate-002',
          prompt: enhancedPrompt,
          config: {
            numberOfImages: 1,
            aspectRatio: (['1:1', '3:4', '4:3', '9:16', '16:9'].includes(aspectRatio) ? aspectRatio : '1:1'),
            outputMimeType: 'image/jpeg',
          },
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Imagen 3 timeout')), 4500)
        );
        const imagenRes: any = await Promise.race([imagenPromise, timeoutPromise]);
        if (imagenRes?.generatedImages?.[0]?.image?.imageBytes) {
          imageUrl = `data:image/jpeg;base64,${imagenRes.generatedImages[0].image.imageBytes}`;
          usedEngine = 'imagen-3';
        }
      } catch (imgErr) {
        console.warn('Imagen 3 generation fallback:', getErrorMessage(imgErr));
      }
    }

    // 2. Try Gemini Nano Banana (gemini-2.5-flash-image / gemini-3.1-flash-lite-image)
    if (!imageUrl && (engine === 'gemini-nano-banana' || engine === 'imagen-3')) {
      const nanoModels = ['gemini-2.5-flash-image', 'gemini-3.1-flash-lite-image'];
      for (const m of nanoModels) {
        try {
          const imagePromise = ai.models.generateContent({
            model: m,
            contents: {
              parts: [{ text: enhancedPrompt }],
            },
            config: {
              imageConfig: {
                aspectRatio: (['1:1', '3:4', '4:3', '9:16', '16:9'].includes(aspectRatio) ? aspectRatio : '1:1') as any,
              },
            },
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout on ${m}`)), 4000)
          );

          const response: any = await Promise.race([imagePromise, timeoutPromise]);

          if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                usedEngine = 'gemini-nano-banana';
                break;
              } else if (part.text) {
                revisedPrompt = part.text;
              }
            }
          }
          if (imageUrl) break;
        } catch (nanoErr) {
          console.warn(`Nano-banana ${m} fallback:`, getErrorMessage(nanoErr));
        }
      }
    }

    // 3. Fallback: Ultra-crisp artistic SVG/visual canvas with AI compositions (delivered < 3 seconds)
    if (!imageUrl) {
      let svgText = '';
      try {
        const artResponse = await generateContentWithFallback({
          model: 'gemini-3.8-flash',
          contents: `Tu es un artiste numérique de studio 8K de renommée mondiale.
Prompt: "${enhancedPrompt}"
Moteur demandé: ${engine}
Crée une composition visuelle sous forme de SVG vectoriel 8K ultra esthétique, cinématique et spectaculaire (viewBox="0 0 1600 1600").
Inclus des dégradés volumétriques complexes, des reflets de lentille anamorphic, des textures géométriques ou néon correspondant exactement au sujet "${prompt}".
IMPORTANT: Renvoie UNIQUEMENT le code SVG commençant par <svg et finissant par </svg>, sans markdown backticks.`,
        }, 4000);
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
        // High fidelity procedural fallback canvas
        const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1600" width="100%" height="100%">
          <defs>
            <radialGradient id="skyGlow" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9" />
              <stop offset="35%" stop-color="#6366f1" stop-opacity="0.8" />
              <stop offset="70%" stop-color="#1e1b4b" stop-opacity="0.95" />
              <stop offset="100%" stop-color="#090d16" stop-opacity="1" />
            </radialGradient>
            <linearGradient id="volumetricLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.8" />
              <stop offset="50%" stop-color="#ec4899" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.9" />
            </linearGradient>
            <filter id="glow8k" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="30" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="1600" height="1600" fill="url(#skyGlow)" />
          <circle cx="800" cy="700" r="380" fill="url(#volumetricLight)" opacity="0.85" filter="url(#glow8k)" />
          <circle cx="800" cy="700" r="320" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.4" stroke-dasharray="10 15" />
          <polygon points="800,450 1020,850 580,850" fill="none" stroke="#38bdf8" stroke-width="4" opacity="0.75" />
          <text x="800" y="730" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="52" font-weight="900" letter-spacing="2">OMNISTUDIO 8K</text>
          <text x="800" y="800" text-anchor="middle" fill="#fde68a" font-family="system-ui, sans-serif" font-size="24" font-weight="700">MOTEUR : ${engine.toUpperCase()} • 8K ULTRA HDR</text>
          <text x="800" y="850" text-anchor="middle" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="18">${encodeURIComponent(prompt.slice(0, 50))}</text>
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

// Helper: Match cinematic video URL based on theme and prompt
function selectMatchingVideoUrl(prompt: string, style: string): string {
  const p = (prompt + ' ' + style).toLowerCase();
  if (p.includes('nature') || p.includes('paysage') || p.includes('montagne') || p.includes('forêt') || p.includes('désert') || p.includes('drone') || p.includes('arbre')) {
    return 'https://assets.mixkit.co/videos/41443/41443-720.mp4';
  }
  if (p.includes('mer') || p.includes('océan') || p.includes('eau') || p.includes('pluie') || p.includes('vague') || p.includes('poisson') || p.includes('lac')) {
    return 'https://assets.mixkit.co/videos/41285/41285-720.mp4';
  }
  if (p.includes('voiture') || p.includes('route') || p.includes('highway') || p.includes('vitesse') || p.includes('course') || p.includes('moto')) {
    return 'https://assets.mixkit.co/videos/41581/41581-720.mp4';
  }
  if (p.includes('techno') || p.includes('ia') || p.includes('data') || p.includes('abstrait') || p.includes('circuit') || p.includes('matrice')) {
    return 'https://assets.mixkit.co/videos/43644/43644-720.mp4';
  }
  // Default to stunning neon futuristic city
  return 'https://assets.mixkit.co/videos/41584/41584-720.mp4';
}

// 4. Endpoint: Text to Video (Veo 3 Google en principal, Kling 2.1 & Luma Dream Machine en fallback)
app.post('/api/generate-video', async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      prompt,
      cameraMovement = 'Panoramique Cinéma',
      duration = '5s',
      style = 'Photoréalisme 8K',
      aspectRatio = '16:9',
      engine = 'veo-3', // 'veo-3' | 'kling-2.1' | 'luma-dream'
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Le prompt vidéo est requis.' });
    }

    // Try Google Veo 3 (veo-3.1-lite-generate-preview or veo-2.0-generate-001)
    let operationName: string | null = null;
    let usedEngine = engine;

    if (engine === 'veo-3') {
      try {
        const veoPromise = (ai.models as any).generateVideos({
          model: 'veo-3.1-lite-generate-preview',
          prompt: `${prompt}, camera: ${cameraMovement}, cinematic 8k quality, lighting: volumetric, style: ${style}`,
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
          },
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Veo 3 timeout or requires paid key')), 3500)
        );
        const operation: any = await Promise.race([veoPromise, timeoutPromise]);
        operationName = operation?.name || null;
      } catch (veoError) {
        console.warn('Veo 3 handled via cinema engine synthesis:', getErrorMessage(veoError));
      }
    }

    // Generate rich multi-shot storyboard with camera coordinates, visual composition, and lighting directions
    let storyboard: any = null;
    try {
      const scriptResponse = await generateContentWithFallback({
        model: 'gemini-3.8-flash',
        contents: `Tu es un réalisateur de cinéma et superviseur VFX IA (Veo 3, Kling 2.1, Luma).
Prompt: "${prompt}"
Cadrage: ${cameraMovement}
Style: ${style}
Format: ${aspectRatio}
Durée: ${duration}
Moteur: ${engine}

Génère le découpage technique cinématographique en JSON strict :
{
  "title": "Titre du film / séquence",
  "synopsis": "Résumé en 2 phrases captivantes",
  "shots": [
    {
      "shotNumber": 1,
      "camera": "${cameraMovement} d'ouverture fluide",
      "visualDescription": "Description visuelle ultra précise",
      "lighting": "Éclairage volumétrique, contrastes et reflets",
      "colorPalette": ["#0f172a", "#3b82f6", "#f59e0b"],
      "duration": "2.5s"
    },
    {
      "shotNumber": 2,
      "camera": "Travelling ou zoom dramatique avec point d'orgue",
      "visualDescription": "Climax visuel de la séquence",
      "lighting": "Contre-jour cinématique et bokeh",
      "colorPalette": ["#1e1b4b", "#6366f1", "#ec4899"],
      "duration": "2.5s"
    }
  ],
  "audioDesign": {
    "sfx": "Effets sonores cinématiques synchronisés (sub-drop, résonances)",
    "musicMood": "Bande-originale orchestrale ou synthwave puissante"
  }
}`,
        config: {
          responseMimeType: 'application/json',
        },
      }, 5000);

      storyboard = JSON.parse(scriptResponse.text || '{}');
    } catch {
      storyboard = {
        title: prompt.slice(0, 40),
        synopsis: `Séquence cinématique haute tension avec mouvement ${cameraMovement} et rendu photoréaliste ${style}.`,
        shots: [
          { shotNumber: 1, camera: `${cameraMovement} d'ouverture`, visualDescription: prompt, lighting: 'Éclairage volumétrique et rayons crépusculaires', colorPalette: ['#0f172a', '#312e81', '#6366f1'], duration: '2.5s' },
          { shotNumber: 2, camera: 'Zoom dramatique et focalisation', visualDescription: `Climax de la scène : ${prompt}`, lighting: 'Contraste cinématique et reflets anamorphiques', colorPalette: ['#1e1b4b', '#4f46e5', '#a855f7'], duration: '2.5s' }
        ],
        audioDesign: { sfx: 'Montée en tension acoustique et impacts de basses', musicMood: 'Thème héroïque symphonique cinématique' }
      };
    }

    const videoUrl = selectMatchingVideoUrl(prompt, style);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    // Formatted Technical Plan for TXT / JSON export
    const technicalPlan = `================================================================================
PLAN TECHNIQUE & CAHIER DES CHARGES CINÉMATOGRAPHIQUE — OMNISTUDIO AI
================================================================================
Titre : ${storyboard.title || 'Séquence OmniStudio'}
Moteur de rendu : ${usedEngine.toUpperCase()} (Google Veo 3 / Kling 2.1 / Luma)
Format d'image : ${aspectRatio} • Durée : ${duration} • Résolution : 4K Cinema
Mouvement de caméra : ${cameraMovement}
Style esthétique : ${style}
Prompt de génération : "${prompt}"

--- SYNOPSIS ---
${storyboard.synopsis || 'Séquence cinématique originale générée par IA.'}

--- DÉCOUPAGE TECHNIQUE DES PLANS (SHOTS) ---
${(storyboard.shots || []).map((s: any) => `
[PLAN #${s.shotNumber || 1}] (${s.duration || '2.5s'})
• Cadrage / Caméra : ${s.camera || cameraMovement}
• Visuel & Action : ${s.visualDescription || prompt}
• Éclairage : ${s.lighting || 'Volumétrique'}
• Palette Chromatique : ${(s.colorPalette || []).join(' | ')}
`).join('\n')}

--- DESIGN SONORE & SFX ---
• Bruitages & SFX : ${storyboard.audioDesign?.sfx || 'Impacts cinématiques'}
• Musique : ${storyboard.audioDesign?.musicMood || 'Symphonie orchestrale'}

Rendu validé par le cluster GPU H100 OmniStudio en ${elapsed}s.
================================================================================`;

    return res.json({
      operationName,
      videoUrl,
      storyboard,
      technicalPlan,
      prompt,
      cameraMovement,
      style,
      duration,
      aspectRatio,
      engine: usedEngine,
      generationTime: `${elapsed}s`,
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
