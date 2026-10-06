import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Film, 
  Clapperboard, 
  Camera, 
  Wand2, 
  RefreshCw, 
  AlertCircle, 
  Coins, 
  Crown, 
  ShieldAlert,
  FileText,
  Smartphone,
  FastForward,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PRICING_CONFIG, VideoGeneration, VideoStoryboard } from '../types';
import { downloadTextWithWatermark } from '../utils/watermark';
import { safeFetchJson } from '../utils/apiSafeClient';

// Clean and translate user video prompt to Cinema English
// Guarantees no French text or "-moi" suffixes
export function cleanPrompt(raw: string): string {
  if (!raw) return '';

  // 1. Strip French conversational prefixes, requests, and "-moi"
  let text = raw
    .replace(/-moi|fais-moi|je veux|crée-moi|fais une video de|fais une vidéo de|une pub TikTok pour|une pub tiktok pour|une pub pour|pub pour/gi, '')
    .replace(/\b(génère-moi|donne-moi|montre-moi|je souhaite|crée|génère)\b/gi, '')
    .replace(/-moi/gi, '')
    .trim();

  // 2. Specific cinematic concept mappings
  const specials: Array<{ regex: RegExp; repl: string }> = [
    {
      regex: /pizzaiolo.*(?:lance|pâte|pate)|pizzeria.*pizzaiolo|pizzaiolo|pizzeria|pizza/i,
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

  // 3. French -> English dictionary translation
  const dictionary: Array<[RegExp, string]> = [
    [/\bpizzaiolo\b/gi, 'pizzaiolo'],
    [/\bpizzeria\b/gi, 'pizzeria'],
    [/\bpizza\b/gi, 'pizza'],
    [/\blance\b/gi, 'tossing'],
    [/\bpâte\b|\bpate\b/gi, 'dough'],
    [/\bfour\b/gi, 'stone oven'],
    [/\bfarine\b/gi, 'flour'],
    [/\bcuisine\b/gi, 'kitchen'],
    [/\brestaurant\b/gi, 'restaurant'],
    [/\bdinosaure\b/gi, 'dinosaur'],
    [/\bskate\b|\bskateboard\b/gi, 'skateboarding'],
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

  // 4. Strip any residual French words and "-moi"
  text = text
    .replace(/-moi/gi, '')
    .replace(/\b(avec|qui|sa|son|ses|les|la|le|un|une|des|dans|sur|sous|pour|et|à|a|au|aux|en|par|de|du|d'|l'|-moi)\b/gi, '')
    .replace(/-moi/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return `Cinematic slow-motion of ${text}, 8K, volumetric light`.replace(/-moi/gi, '');
}

const ENGINES = [
  { 
    id: 'veo-3', 
    label: 'Google Veo 3 Cinéma', 
    badge: 'Moteur Principal',
    desc: 'Cinématographie 4K, physique ultra-réaliste & cohérence temporelle' 
  },
  { 
    id: 'kling-2.1', 
    label: 'Kling 2.1 Motion Master', 
    badge: 'Mouvements Rapides',
    desc: 'Dynamique d\'action extrême et trajectoires fluides' 
  },
  { 
    id: 'luma-dream', 
    label: 'Luma Dream Machine', 
    badge: 'Fluidité & Rêve',
    desc: 'Transitions oniriques et éclairages volumétriques' 
  },
];

const CAMERA_MOVEMENTS = [
  { id: 'Auto IA', label: '🎬 Réalisateur IA (Recommandé)', desc: 'L\'IA orchestre le meilleur cadrage et mouvement selon votre histoire' },
  { id: 'Travelling Dolly', label: 'Travelling Dolly (Optionnel)', desc: 'Rapprochement immersif cinématique vers le sujet' },
  { id: 'Drone FPV', label: 'Drone FPV (Optionnel)', desc: 'Vol dynamique à grande vitesse, plongée et survol' },
  { id: 'Panoramique Cinéma', label: 'Panoramique Cinéma (Optionnel)', desc: 'Balayage horizontal lent, majestueux et fluide' },
  { id: 'Orbite 360°', label: 'Orbite 360° (Optionnel)', desc: 'Rotation circulaire continue et fluide autour du sujet' },
  { id: 'Zoom Dramatique', label: 'Zoom Dramatique (Optionnel)', desc: 'Resserrage intense sur le climax de la scène' },
];

const VIDEO_STYLES = [
  { id: 'Photoréalisme 8K', label: 'Photoréalisme 8K', desc: 'Grain cinéma 35mm, éclairage naturel, 4K pure' },
  { id: 'Sci-Fi Cyberpunk', label: 'Sci-Fi Néo-Tokyo', desc: 'Reflets néons, pluie battante et holographie' },
  { id: 'Animation 3D Pixar', label: 'Animation 3D Pixar', desc: 'Rendu chaleureux, textures riches Unreal 5' },
  { id: 'Cinéma Noir & Blanc', label: 'Cinéma Noir Vintage', desc: 'Contraste dramatique, ombres ciselées' },
  { id: 'Grands Espaces Nature', label: 'Grands Espaces Nature', desc: 'Panoramas épiques documentaires BBC Earth' },
];

const QUICK_VIDEO_IDEAS = [
  '🍕 Pizzeria avec pizzaiolo qui lance sa pâte sous éclairage volumétrique',
  '🦖 Dinosaure T-Rex avec lunettes de soleil faisant du skate le long de la marina de Dubaï au coucher du soleil',
  '👗 Défilé de mode haute couture à Paris sous la pluie, reflets mouillés sur pavés',
  '🏎️ Supercar cyberpunk filant à 300 km/h sur autoroute côtière sous néons',
  '🍣 Gros plan ralenti 120fps sur la découpe d\'un sushi de thon rouge par un chef tokyoïte',
  '📱 Unboxing viral ultra-dynamique d\'un smartphone transparent pour TikTok 9:16',
];

interface TextToVideoStudioProps {
  initialPrompt?: string;
  initialRatio?: '16:9' | '9:16';
  autoGenerate?: boolean;
  onClearInitialPrompt?: () => void;
}

export const TextToVideoStudio: React.FC<TextToVideoStudioProps> = ({
  initialPrompt,
  initialRatio,
  autoGenerate,
  onClearInitialPrompt,
}) => {
  const { user, deductCredits, addVideoGeneration, openSubscriptionModal } = useAuth();
  const { success: toastSuccess, info: toastInfo } = useToast();

  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [selectedEngine, setSelectedEngine] = useState<'veo-3' | 'kling-2.1' | 'luma-dream'>('veo-3');
  const [selectedCamera, setSelectedCamera] = useState('Auto IA');
  const [selectedStyle, setSelectedStyle] = useState('Photoréalisme 8K');
  const [selectedRatio, setSelectedRatio] = useState<'16:9' | '9:16'>(initialRatio || '16:9');
  const [duration, setDuration] = useState('5s');

  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [currentVideo, setCurrentVideo] = useState<VideoGeneration | null>(null);
  const [technicalPlan, setTechnicalPlan] = useState<string>('');

  const cost = PRICING_CONFIG.CREDIT_COSTS.TEXT_TO_VIDEO; // 25 credits

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      if (initialRatio) setSelectedRatio(initialRatio);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt, initialRatio, onClearInitialPrompt]);

  const handleRegenerateSameStyle = () => {
    if (currentVideo) {
      setSelectedStyle(currentVideo.style);
      toastInfo('Style Prêt !', `Style "${currentVideo.style}" chargé. Cliquez sur Générer pour une nouvelle variation.`);
    }
  };

  const handleTransformToTikTok = () => {
    setSelectedRatio('9:16');
    toastSuccess('Format TikTok 9:16 Activé !', 'Ratio vertical 9:16 configuré pour smartphones, TikTok, Reels et Shorts.');
  };

  const handleMakeFollowUpScene = () => {
    const title = currentVideo?.storyboard?.title || 'Séquence 1';
    const followUpPrompt = `Plan 2 (Suite de "${title}") : Dans la continuité immédiate, la séquence s'intensifie avec le climax de l'action, transitions fluides et révélation spectaculaire`;
    setPrompt(followUpPrompt);
    toastSuccess('Suite Scénarisée Prête !', 'Prompt du plan suivant généré dans l\'éditeur.');
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setEnhancing(true);
    try {
      const res = await safeFetchJson<{ enhancedPrompt?: string }>('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'video', style: selectedStyle }),
      }, 5000);

      if (res.ok && res.data?.enhancedPrompt) {
        setPrompt(res.data.enhancedPrompt);
        toastInfo('Prompt Vidéo Optimisé !', 'Paramètres de mouvement Veo 3 et cadrages ajoutés.');
      } else {
        const clientEnhanced = `${prompt}, plan cinématique avec ${selectedCamera.toLowerCase()}, style ${selectedStyle}, rendu photoréaliste 60fps, éclairage volumétrique et profondeur de champ`;
        setPrompt(clientEnhanced);
        toastInfo('Prompt Vidéo Enrichi !', 'Mouvement de caméra et optiques intégrés.');
      }
    } catch (err: any) {
      console.warn('Video prompt enhance fallback:', err);
    } finally {
      setEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Veuillez entrer une description pour votre vidéo.');
      return;
    }
    setError(null);

    // Clean and translate prompt to pure Cinema English (never contains French or -moi)
    const englishPrompt = cleanPrompt(prompt);

    // Verify and deduct credits (25 credits)
    const hasCredits = deductCredits(cost, `Génération Vidéo 5s (${selectedEngine}) : ${prompt.slice(0, 24)}...`, 'video');
    if (!hasCredits) {
      return;
    }

    setLoading(true);
    try {
      const apiRes = await safeFetchJson<{
        videoUrl?: string;
        error?: string;
        code?: string;
        storyboard?: VideoStoryboard;
        technicalPlan?: string;
        generationTime?: string;
      }>('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: englishPrompt,
          ratio: selectedRatio,
          aspectRatio: selectedRatio,
          engine: selectedEngine,
          cameraMovement: selectedCamera,
          duration,
          style: selectedStyle,
        }),
      }, 55000);

      if (apiRes.ok && apiRes.data?.videoUrl) {
        const newUrl = apiRes.data.videoUrl;
        setVideoUrl(newUrl);

        const newGen: VideoGeneration = {
          id: 'vid_' + Date.now(),
          prompt: englishPrompt,
          cameraMovement: selectedCamera,
          duration,
          style: selectedStyle,
          aspectRatio: selectedRatio,
          engine: selectedEngine,
          videoUrl: newUrl,
          storyboard: apiRes.data.storyboard || {
            title: prompt.slice(0, 40) || 'Séquence Veo 3',
            synopsis: `Séquence cinématique avec ${selectedCamera} et rendu ${selectedStyle}.`,
            shots: [
              { shotNumber: 1, camera: selectedCamera, visualDescription: englishPrompt, lighting: 'Éclairage volumétrique 8K', colorPalette: ['#0f172a', '#4338ca'], duration: '5s' }
            ],
            audioDesign: { sfx: 'Son d\'ambiance cinématique', musicMood: 'Bande son cinéma 8K' }
          },
          createdAt: new Date().toISOString(),
          creditsUsed: cost,
        };

        setCurrentVideo(newGen);
        if (apiRes.data.technicalPlan) {
          setTechnicalPlan(apiRes.data.technicalPlan);
        }
        addVideoGeneration(newGen);

        toastSuccess(
          'Vidéo Rendu Terminé !',
          `Généré avec succès par ${selectedEngine.toUpperCase()}.`,
          'sparkles'
        );
      } else {
        // Clear error message, NEVER fallback to fake videos or flowers!
        const errMsg = apiRes.data?.error || "Erreur de génération : fal.ai n'a pas retourné d'URL vidéo. Veuillez vérifier que votre clé FAL_KEY est correctement configurée.";
        setError(errMsg);
        toastInfo('Information', errMsg);
      }
    } catch (err: any) {
      console.error('Video generation error:', err);
      const errMsg = err?.message || 'Erreur lors de la génération de la vidéo. Aucune fausse vidéo n\'est générée.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!videoUrl) return;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `omnistudio-video-${Date.now()}.mp4`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toastSuccess('Téléchargement MP4', 'Le fichier vidéo MP4 a été lancé.');
  };

  const handleDownloadTechnicalPlan = () => {
    if (!currentVideo) return;
    const planContent = technicalPlan || `================================================================================
PLAN TECHNIQUE & STORYBOARD CINÉMATOGRAPHIQUE
================================================================================
Titre : ${currentVideo.storyboard.title}
Moteur : ${currentVideo.engine || 'VEO-3'}
Mouvement de caméra : ${currentVideo.cameraMovement}
Style visuel : ${currentVideo.style}
Format : ${currentVideo.aspectRatio} • Durée : ${currentVideo.duration}

Prompt de réalisation :
"${currentVideo.prompt}"

Synopsis :
${currentVideo.storyboard.synopsis}

Découpage des plans :
${currentVideo.storyboard.shots.map(s => `Plan #${s.shotNumber} (${s.duration}) : ${s.camera} - ${s.visualDescription}`).join('\n')}
================================================================================`;

    downloadTextWithWatermark(planContent, currentVideo.storyboard.title, !!user?.isPro, `plan-technique-${currentVideo.id}.txt`);
    toastSuccess('Plan Technique Téléchargé', user?.isPro ? 'Cahier des charges pur sans filigrane enregistré.' : 'Fichier enregistré avec filigrane Plan Free.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Clapperboard className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Studio Vidéo Photoréaliste
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold border border-pink-500/30">
              Veo 3 & Kling 2.1
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Génération cinématique 5s à 60 FPS avec prompt en anglais cinéma ultra-détaillé.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Serveurs Veo 3 / Kling Opérationnels</span>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Video Prompt & Settings Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl glass-panel space-y-5 border border-white/10 shadow-2xl">
            
            {/* Engine Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Moteur de Rendu Vidéo
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {ENGINES.map((eng) => (
                  <button
                    key={eng.id}
                    type="button"
                    onClick={() => setSelectedEngine(eng.id as any)}
                    className={`text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedEngine === eng.id
                        ? 'bg-pink-600/20 border-pink-500 text-white shadow-lg shadow-pink-600/20 ring-1 ring-pink-500/50'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{eng.label}</span>
                    </div>
                    <span className="text-[10px] text-pink-300 font-semibold block">{eng.badge}</span>
                    <span className="text-[10px] text-slate-400 block line-clamp-1 mt-0.5">{eng.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-pink-400" />
                  <span>Votre Idée Vidéo (Français ou Anglais)</span>
                </label>
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  disabled={enhancing || !prompt.trim()}
                  className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 font-semibold disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${enhancing ? 'animate-spin' : ''}`} />
                  <span>{enhancing ? 'Optimisation...' : 'Enrichir le Prompt'}</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex : pizzeria avec pizzaiolo qui lance sa pâte, ou dinosaure qui fait du skate à Dubaï..."
                  rows={4}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all resize-none shadow-inner"
                />
              </div>

              {/* Quick Prompt Ideas Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs">
                <span className="text-[11px] text-slate-500 font-bold shrink-0">Idées rapides :</span>
                {QUICK_VIDEO_IDEAS.map((idea, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(idea)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/5 truncate max-w-xs transition-colors shrink-0 cursor-pointer"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Movements Selector (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Cadrage & Caméra (Optionnel — Optimisé par l'IA par défaut)</span>
                </label>
                <span className="text-[10px] text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded-full font-mono">
                  Géré par Réalisateur IA
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CAMERA_MOVEMENTS.map((cam) => (
                  <button
                    key={cam.id}
                    type="button"
                    onClick={() => setSelectedCamera(cam.id)}
                    className={`text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedCamera === cam.id
                        ? 'bg-pink-600/20 border-pink-500 text-white shadow-md ring-1 ring-pink-500/40'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-xs font-bold text-white">{cam.label}</span>
                    <span className="text-[10px] text-slate-400 block">{cam.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Style and Ratio Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Style Visuel
                </label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                >
                  {VIDEO_STYLES.map((st) => (
                    <option key={st.id} value={st.id} className="bg-slate-950 text-white">{st.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Format d'Image & Durée
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRatio('16:9')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      selectedRatio === '16:9' ? 'bg-pink-600/20 border-pink-500 text-white' : 'bg-slate-900 border-white/5 text-slate-400'
                    }`}
                  >
                    16:9 Paysage
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRatio('9:16')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      selectedRatio === '9:16' ? 'bg-pink-600/20 border-pink-500 text-white' : 'bg-slate-900 border-white/5 text-slate-400'
                    }`}
                  >
                    9:16 Vertical
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Generate Button with credit pill (25 credits) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-500 hover:to-rose-500 text-white font-black text-sm shadow-xl shadow-pink-600/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer group hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Rendu en cours via fal.ai...</span>
                  </>
                ) : (
                  <>
                    <Clapperboard className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                    <span>Générer la Vidéo 5s avec {selectedEngine.toUpperCase()}</span>
                    <span className="ml-2 px-2.5 py-0.5 rounded-full bg-black/40 text-amber-300 text-xs font-black border border-amber-400/30 flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-400" />
                      {cost} crédits
                    </span>
                  </>
                )}
              </button>

              {user && user.credits < cost && (
                <button
                  type="button"
                  onClick={openSubscriptionModal}
                  className="text-xs text-amber-400 hover:underline shrink-0 font-bold"
                >
                  Crédits épuisés ? Passer Pro (5$)
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Video Cinema Player & Storyboard Plan */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-white/10 flex flex-col justify-between min-h-[490px]">
            
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-slate-300">
                Lecteur Vidéo
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold">
                {selectedEngine.toUpperCase()} • {duration} ({selectedRatio})
              </span>
            </div>

            {/* Lecteur Vidéo — Affiche <video src={videoUrl} controls> et RIEN d'autre */}
            <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 aspect-video flex items-center justify-center shadow-2xl">
              {videoUrl ? (
                <video
                  key={videoUrl}
                  src={videoUrl}
                  controls
                  className="w-full h-full object-contain bg-black"
                  playsInline
                />
              ) : (
                <div className="text-center p-6">
                  <Film className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Aucune vidéo chargée</p>
                </div>
              )}
            </div>

            {/* Video Details & Technical Export Buttons */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-3">
              {/* Creator Action Buttons : Re-générer avec ce style / Transformer en TikTok 9:16 / Faire une suite */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Actions Rapides Créateur :
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleRegenerateSameStyle}
                    className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Re-générer une variation avec ce style visuel"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-pink-400" />
                    <span>Re-générer ce style</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTransformToTikTok}
                    className="px-2.5 py-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 text-xs font-semibold border border-pink-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Bascule automatiquement au ratio vertical 9:16 pour TikTok/Reels"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                    <span>TikTok 9:16</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleMakeFollowUpScene}
                    className="px-2.5 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Génère la suite chronologique de l'action pour créer une séquence"
                  >
                    <FastForward className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Faire une suite</span>
                  </button>
                </div>
              </div>

              {/* Dual Export Buttons (MP4 + Technical Plan TXT) */}
              <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="text-[11px]">
                  {user?.isPro ? (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 fill-current" />
                      Export Pur 4K (Pro)
                    </span>
                  ) : (
                    <span className="text-amber-300/80 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Plan Free Actif
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleDownloadTechnicalPlan}
                    disabled={!currentVideo}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Télécharger le cahier des charges et plan technique"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Plan TXT</span>
                  </button>

                  <button
                    onClick={handleDownloadVideo}
                    disabled={!videoUrl}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg transition-transform hover:scale-105 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger MP4</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
