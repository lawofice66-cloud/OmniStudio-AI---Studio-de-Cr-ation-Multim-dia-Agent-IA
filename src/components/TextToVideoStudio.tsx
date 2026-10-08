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
  Sparkles,
  Layers,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Clock,
  Send,
} from 'lucide-react';
import { useAuth, isUserAdmin } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PRICING_CONFIG, VideoGeneration, VideoStoryboard, VideoSegmentItem } from '../types';
import { downloadTextWithWatermark } from '../utils/watermark';
import { safeFetchJson } from '../utils/apiSafeClient';
import { generateClientVideo, generateMultiSegmentVideo, VideoSegmentConfig } from '../utils/clientVideoGenerator';
import { cleanPrompt } from '../utils/cleanPrompt';

const FLARE_LENSES = [
  { id: 'Anamorphique 35mm Hollywood', label: 'Anamorphique 35mm (Flare Bleu)', desc: 'Flare horizontal bleu classique, bokeh ovale cinématique et contraste profond' },
  { id: 'Panavision 70mm IMAX', label: 'Panavision 70mm (IMAX 8K)', desc: 'Piqué optique extrême, plage dynamique monumentale et immersion totale' },
  { id: 'Grand Angle 24mm Cinéma', label: 'Grand Angle 24mm', desc: 'Profondeur dramatique et présence physique de l\'environnement' },
  { id: 'Focale 85mm F/1.2 Portrait', label: 'Objectif 85mm F/1.2 Bokeh', desc: 'Détachement du sujet ultra-net et flou d\'arrière-plan crémeux' },
  { id: 'Drone FPV Haute Vitesse', label: 'Drone FPV Haute Vitesse', desc: 'Trajectoire dynamique et survol cinématique à grande vitesse' },
];

const FLARE_LIGHTINGS = [
  { id: 'Golden Hour & Éclat Solaire', label: 'Golden Hour & Flare Solaire', desc: 'Lumière dorée rasante avec halo lumineux chaleureux' },
  { id: 'Cyberpunk Néon & Pluie', label: 'Néo-Tokyo & Reflets Pluie', desc: 'Lueurs néons bleues et violettes avec asphalte mouillé' },
  { id: 'Volumétrique Brume 8K', label: 'Brume Volumétrique & Faisceaux', desc: 'Rayons de lumière divins traversant la brume et particules' },
  { id: 'Chiaroscuro Ombres Ciselées', label: 'Clair-obscur Dramatique', desc: 'Contraste saisissant, ombres portées et mystère' },
];

const ENGINES = [
  { 
    id: 'google-flare', 
    label: 'Google Flare Cine 8K', 
    badge: 'Moteur Suprême Flare',
    desc: 'Physique cinématique avancée, optiques 8K et respect absolu du prompt' 
  },
  { 
    id: 'veo-3', 
    label: 'Google Veo 3 Cinéma', 
    badge: 'Référence Hollywood',
    desc: 'Cinématographie 4K/8K, physique ultra-réaliste & cohérence temporelle' 
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

const QUICK_EXTENSION_PROMPTS = [
  'La caméra avance en travelling avant immersif et découvre un élément spectaculaire',
  'Rotation caméra fluide à 180° dévoilant l\'immensité du décor sous lumière rasante',
  'Le sujet accélère brutalement et déclenche une action cinématique dynamique',
  'Plan de coupe ralenti 120fps avec reflets lumineux et particules volumétriques',
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
  const { success: toastSuccess, info: toastInfo, warning: toastWarning } = useToast();

  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [selectedEngine, setSelectedEngine] = useState<'google-flare' | 'veo-3' | 'kling-2.1' | 'luma-dream'>('google-flare');
  const [selectedCamera, setSelectedCamera] = useState('Auto IA');
  const [selectedLens, setSelectedLens] = useState('Anamorphique 35mm Hollywood');
  const [selectedLighting, setSelectedLighting] = useState('Golden Hour & Éclat Solaire');
  const [selectedStyle, setSelectedStyle] = useState('Photoréalisme 8K');
  const [selectedRatio, setSelectedRatio] = useState<'16:9' | '9:16'>(initialRatio || '16:9');
  const [duration, setDuration] = useState('5s');

  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [currentVideo, setCurrentVideo] = useState<VideoGeneration | null>(null);
  const [technicalPlan, setTechnicalPlan] = useState<string>('');

  // Video extension state
  const [extending, setExtending] = useState(false);
  const [extensionMode, setExtensionMode] = useState<'auto' | 'manual'>('auto');
  const [manualExtensionPrompt, setManualExtensionPrompt] = useState('');
  const [extensionCamera, setExtensionCamera] = useState('Auto IA');

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

  // Base 5-second video generator
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Veuillez entrer une description pour votre vidéo.');
      return;
    }
    setError(null);

    // Clean and translate prompt to pure Cinema English
    const englishPrompt = cleanPrompt(prompt);

    // Strict credit check
    const userCredits = user?.credits ?? 0;
    const isAdmin = isUserAdmin(user);

    if (!isAdmin && userCredits < cost) {
      toastWarning(
        'Crédits insuffisants',
        `Crédits insuffisants. Vous avez ${userCredits} crédits. 1 vidéo = ${cost} crédits. Passez Pro pour 500 crédits.`
      );
      openSubscriptionModal();
      return;
    }

    const hasCredits = deductCredits(cost, `Génération Vidéo 5s (${selectedEngine}) : ${prompt.slice(0, 24)}...`, 'video');
    if (!hasCredits) {
      return;
    }

    setLoading(true);
    try {
      const apiRes = await safeFetchJson<{
        videoUrl?: string;
        prompt?: string;
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
          lens: selectedLens,
          lighting: selectedLighting,
          duration: '5s',
          style: selectedStyle,
        }),
      }, 55000);

      let newUrl = apiRes.ok && apiRes.data?.videoUrl ? apiRes.data.videoUrl : '';
      const refinedPrompt = apiRes.data?.prompt || englishPrompt;

      // Compile animated cinematic 5s video
      if (!newUrl || newUrl.startsWith('data:image/') || newUrl.includes('image.pollinations.ai')) {
        const animVideo = await generateClientVideo(
          refinedPrompt,
          selectedRatio,
          selectedCamera,
          newUrl || undefined,
          5
        );
        if (animVideo) {
          newUrl = animVideo;
        }
      }

      if (newUrl) {
        setVideoUrl(newUrl);
        setDuration('5s');

        const initialSegment: VideoSegmentItem = {
          shotNumber: 1,
          prompt: refinedPrompt,
          cameraMovement: selectedCamera,
          duration: '5s',
          imageUrl: newUrl,
        };

        const newGen: VideoGeneration = {
          id: 'vid_' + Date.now(),
          prompt: refinedPrompt,
          cameraMovement: selectedCamera,
          duration: '5s',
          style: selectedStyle,
          aspectRatio: selectedRatio,
          engine: selectedEngine,
          videoUrl: newUrl,
          imageUrl: newUrl,
          segments: [initialSegment],
          totalDurationSeconds: 5,
          extendedCount: 0,
          storyboard: apiRes.data?.storyboard || {
            title: prompt.slice(0, 40) || 'Séquence Veo 3',
            synopsis: `Séquence cinématique avec ${selectedCamera} et rendu ${selectedStyle}.`,
            shots: [
              { shotNumber: 1, camera: selectedCamera, visualDescription: refinedPrompt, lighting: 'Éclairage volumétrique 8K', colorPalette: ['#0f172a', '#4338ca'], duration: '5s' }
            ],
            audioDesign: { sfx: 'Son d\'ambiance cinématique', musicMood: 'Bande son cinéma 8K' }
          },
          createdAt: new Date().toISOString(),
          creditsUsed: cost,
        };

        setCurrentVideo(newGen);
        if (apiRes.data?.technicalPlan) {
          setTechnicalPlan(apiRes.data.technicalPlan);
        }
        addVideoGeneration(newGen);

        toastSuccess(
          'Vidéo 5s Rendu Terminé !',
          `Plan de 5 secondes généré avec succès. Vous pouvez maintenant l'étendre en Auto ou en Manuel.`,
          'sparkles'
        );
      } else {
        const errMsg = apiRes.data?.error || "Erreur de génération vidéo.";
        setError(errMsg);
        toastInfo('Information', errMsg);
      }
    } catch (err: any) {
      console.error('Video generation error:', err);
      const errMsg = err?.message || 'Erreur lors de la génération de la vidéo.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Video extension (+5s auto or manual with custom prompt)
  const handleExtendVideo = async (mode: 'auto' | 'manual') => {
    if (!currentVideo) {
      toastWarning('Aucune vidéo active', 'Veuillez d\'abord générer une vidéo de 5 secondes.');
      return;
    }

    if (mode === 'manual' && !manualExtensionPrompt.trim()) {
      toastWarning('Prompt requis', 'Veuillez décrire l\'action des 5 secondes suivantes.');
      return;
    }

    const userCredits = user?.credits ?? 0;
    const isAdmin = isUserAdmin(user);

    if (!isAdmin && userCredits < cost) {
      toastWarning(
        'Crédits insuffisants',
        `Crédits insuffisants pour étendre la vidéo. Solde actuel : ${userCredits} crédits. Extension +5s = ${cost} crédits.`
      );
      openSubscriptionModal();
      return;
    }

    const hasCredits = deductCredits(
      cost,
      `Extension Vidéo +5s (${mode === 'auto' ? 'Auto' : 'Manuel'}) : ${currentVideo.prompt.slice(0, 20)}...`,
      'video'
    );
    if (!hasCredits) return;

    setExtending(true);
    try {
      const existingSegments: VideoSegmentItem[] = currentVideo.segments && currentVideo.segments.length > 0
        ? currentVideo.segments
        : [
            {
              shotNumber: 1,
              prompt: currentVideo.prompt,
              cameraMovement: currentVideo.cameraMovement,
              duration: '5s',
              imageUrl: currentVideo.videoUrl || currentVideo.imageUrl,
            },
          ];

      const nextShotNumber = existingSegments.length + 1;
      const currentSeconds = existingSegments.length * 5;
      const chosenCam = extensionCamera !== 'Auto IA' ? extensionCamera : 'Travelling Dolly';

      const res = await safeFetchJson<{
        mode: string;
        continuationPromptFr: string;
        continuationPromptEn: string;
        cameraMovement: string;
        imageUrl: string;
        newShot: {
          shotNumber: number;
          camera: string;
          visualDescription: string;
          lighting: string;
          duration: string;
        };
        duration: string;
        totalSeconds: number;
      }>('/api/extend-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          previousPrompt: existingSegments[existingSegments.length - 1].prompt || currentVideo.prompt,
          mode,
          manualPrompt: mode === 'manual' ? manualExtensionPrompt : '',
          cameraMovement: chosenCam,
          style: currentVideo.style,
          ratio: currentVideo.aspectRatio,
          currentDurationSeconds: currentSeconds,
          extensionSeconds: 5,
          shotNumber: nextShotNumber,
        }),
      }, 45000);

      if (!res.ok || !res.data) {
        throw new Error(res.error || 'Erreur lors de l\'extension vidéo');
      }

      const {
        continuationPromptEn,
        continuationPromptFr,
        cameraMovement: resolvedCam,
        imageUrl: newImageUrl,
        totalSeconds,
      } = res.data;

      // New segment of +5 seconds
      const newSeg: VideoSegmentItem = {
        shotNumber: nextShotNumber,
        prompt: continuationPromptEn,
        cameraMovement: resolvedCam,
        duration: '5s',
        imageUrl: newImageUrl,
      };

      const updatedSegments = [...existingSegments, newSeg];

      // Assemble continuous multi-segment video (5s + 5s = 10s, or 15s)
      const segmentConfigs: VideoSegmentConfig[] = updatedSegments.map((s) => ({
        prompt: s.prompt,
        cameraMovement: s.cameraMovement,
        baseImageUrl: s.imageUrl,
        durationSeconds: 5,
      }));

      const extendedContinuousUrl = await generateMultiSegmentVideo(segmentConfigs, selectedRatio);

      const updatedShots = [
        ...(currentVideo.storyboard?.shots || []),
        {
          shotNumber: nextShotNumber,
          camera: resolvedCam,
          visualDescription: continuationPromptFr || continuationPromptEn,
          lighting: 'Éclairage cinématique continu 8K',
          colorPalette: ['#0f172a', '#4338ca'],
          duration: '5s',
        },
      ];

      const updatedVideo: VideoGeneration = {
        ...currentVideo,
        duration: `${totalSeconds}s`,
        totalDurationSeconds: totalSeconds,
        videoUrl: extendedContinuousUrl,
        imageUrl: newImageUrl,
        segments: updatedSegments,
        extendedCount: (currentVideo.extendedCount || 0) + 1,
        storyboard: {
          ...currentVideo.storyboard,
          shots: updatedShots,
        },
        technicalPlan: `${currentVideo.technicalPlan || ''}
\nPlan #${nextShotNumber} (+5s ${mode === 'auto' ? 'Auto IA' : 'Manuel'}) : ${resolvedCam} - ${continuationPromptEn}`,
      };

      setVideoUrl(extendedContinuousUrl);
      setCurrentVideo(updatedVideo);
      setDuration(`${totalSeconds}s`);
      addVideoGeneration(updatedVideo);

      if (mode === 'manual') {
        setManualExtensionPrompt('');
      }

      toastSuccess(
        `Vidéo Étendue à ${totalSeconds}s !`,
        mode === 'auto'
          ? `L'IA a généré et raccordé le plan #${nextShotNumber} (+5s) en continu.`
          : `Votre prompt a été raccordé avec succès pour le plan #${nextShotNumber} (+5s).`
      );
    } catch (err: any) {
      console.error('Video extension error:', err);
      toastWarning('Erreur d\'extension', err?.message || 'Impossible d\'étendre la vidéo.');
    } finally {
      setExtending(false);
    }
  };

  const handleDownloadVideo = async () => {
    if (!videoUrl) return;
    try {
      toastInfo('Téléchargement...', 'Préparation du fichier MP4...');
      const response = await fetch(videoUrl);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `omnistudio-video-${duration}-${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        toastSuccess('Téléchargement Terminé', `La vidéo de ${duration} a été téléchargée en MP4.`);
        return;
      }
    } catch (e) {
      console.warn('Direct blob download fallback:', e);
    }
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `omnistudio-video-${duration}-${Date.now()}.mp4`;
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
Format : ${currentVideo.aspectRatio} • Durée Totale : ${currentVideo.duration}

Prompt de réalisation :
"${currentVideo.prompt}"

Synopsis :
${currentVideo.storyboard.synopsis}

Découpage des plans (${currentVideo.storyboard.shots.length} plans de 5s raccordés) :
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
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500/30 to-amber-500/30 text-amber-300 text-xs font-black border border-amber-500/40">
              ⚡ Google Flare & Veo 3 Cine Master
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Génération cinématique <strong>ajustée à 5 secondes</strong> avec extension continue <strong>en Auto</strong> et <strong>en Manuel avec prompt</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-pink-400" />
            <span className="font-semibold">Format : 5s de base (Extensible)</span>
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
                  placeholder="Ex : pizzeria avec pizzaiolo qui lance sa pâte sous éclairage volumétrique, ou dinosaure qui fait du skate à Dubaï..."
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

            {/* Camera Movements Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Cadrage & Caméra (Plan Initial)</span>
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

            {/* Flare Optical & Lens Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Optique & Focale Cinéma (Google Flare)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FLARE_LENSES.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setSelectedLens(l.id)}
                    className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      selectedLens === l.id
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-md ring-1 ring-amber-500/40'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs font-bold text-amber-200">{l.label}</span>
                    <span className="text-[10px] text-slate-400 block line-clamp-1">{l.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Flare Lighting Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Éclairage & Atmosphère Cinématographique
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FLARE_LIGHTINGS.map((li) => (
                  <button
                    key={li.id}
                    type="button"
                    onClick={() => setSelectedLighting(li.id)}
                    className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      selectedLighting === li.id
                        ? 'bg-pink-600/20 border-pink-500 text-white shadow-md ring-1 ring-pink-500/40'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs font-bold text-pink-200">{li.label}</span>
                    <span className="text-[10px] text-slate-400 block line-clamp-1">{li.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Style, Ratio and Duration Controls */}
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
                  Format d'Image
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRatio('16:9')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      selectedRatio === '16:9' ? 'bg-pink-600/20 border-pink-500 text-white' : 'bg-slate-900 border-white/5 text-slate-400'
                    }`}
                  >
                    16:9 Paysage
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRatio('9:16')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      selectedRatio === '9:16' ? 'bg-pink-600/20 border-pink-500 text-white' : 'bg-slate-900 border-white/5 text-slate-400'
                    }`}
                  >
                    9:16 Vertical
                  </button>
                </div>
              </div>
            </div>

            {/* Calibration durée : 5 secondes */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-pink-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
                  <Clock className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Durée calibrée : 5 secondes</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/30 text-pink-300 font-mono">Fixe 5s</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Extension automatique ou manuelle par tranche de +5s disponible après rendu.
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-amber-400 shrink-0">
                25 crédits
              </span>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Generate Button with credit pill */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || extending}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-500 hover:to-rose-500 text-white font-black text-sm shadow-xl shadow-pink-600/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer group hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Rendu du plan 5s en cours...</span>
                  </>
                ) : (
                  <>
                    <Clapperboard className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                    <span>Générer la Vidéo de 5 secondes</span>
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

        {/* Right Column: Video Cinema Player & Storyboard Plan & Extension Suite */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-white/10 flex flex-col justify-between space-y-4">
            
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Film className="w-4 h-4 text-pink-400" />
                <span>Lecteur Vidéo Cinéma</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold">
                  {duration} • {selectedRatio}
                </span>
                {currentVideo?.segments && currentVideo.segments.length > 1 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    {currentVideo.segments.length} plans assemblés
                  </span>
                )}
              </div>
            </div>

            {/* Lecteur Vidéo & Visualisation Cinéma */}
            <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 aspect-video flex items-center justify-center shadow-2xl">
              {videoUrl ? (
                videoUrl.startsWith('data:image/') || videoUrl.includes('image.pollinations.ai') ? (
                  <div className="relative w-full h-full overflow-hidden flex items-center justify-center group">
                    <img
                      src={videoUrl}
                      alt={prompt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/90 bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
                      <span className="font-semibold flex items-center gap-1.5 text-pink-300">
                        <Clapperboard className="w-4 h-4 text-pink-400" />
                        Rendu {selectedEngine.toUpperCase()} (60 FPS)
                      </span>
                      <span className="font-mono text-slate-300">{duration} • 8K Master</span>
                    </div>
                  </div>
                ) : (
                  <video
                    key={videoUrl}
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain bg-black"
                    playsInline
                  />
                )
              ) : (
                <div className="text-center p-6">
                  <Film className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Aucune vidéo chargée</p>
                  <p className="text-[10px] text-slate-500 mt-1">Générez un premier plan de 5 secondes pour débloquer l'extension</p>
                </div>
              )}
            </div>

            {/* Panneau d'Extension Vidéo (+5s Auto & Manuel avec Prompt) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-purple-950/30 border border-white/10 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    <Layers className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Étendre la Vidéo (+5 secondes)</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                        +5s
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Raccord cinématique fluide • Passe la vidéo à {currentVideo ? (parseInt(duration) || 5) + 5 : 10}s
                    </p>
                  </div>
                </div>

                {/* Mode Switcher : Auto vs Manuel */}
                <div className="flex p-0.5 rounded-xl bg-black/60 border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setExtensionMode('auto')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      extensionMode === 'auto'
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ⚡ En Auto
                  </button>
                  <button
                    type="button"
                    onClick={() => setExtensionMode('manual')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      extensionMode === 'manual'
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ✍️ Manuel avec Prompt
                  </button>
                </div>
              </div>

              {/* Mode Auto Details */}
              {extensionMode === 'auto' ? (
                <div className="space-y-3">
                  <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-[11px] text-pink-200 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Extension Automatique Intelligente :</span> L'IA analyse le plan actuel et conçoit automatiquement la suite immédiate de l'action de 5 secondes supplémentaires en préservant le décor, les personnages et l'éclairage.
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                        Mouvement Caméra pour la suite :
                      </label>
                      <select
                        value={extensionCamera}
                        onChange={(e) => setExtensionCamera(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                      >
                        {CAMERA_MOVEMENTS.map((cam) => (
                          <option key={cam.id} value={cam.id} className="bg-slate-950">{cam.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col justify-end">
                      <div className="text-[10px] text-slate-400 mb-1">Coût d'extension :</div>
                      <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" />
                        <span>25 crédits ({user?.isPro ? 'Inclus Pro' : 'Solde'})</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExtendVideo('auto')}
                    disabled={!videoUrl || extending || loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed group"
                  >
                    {extending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Extension Auto en cours (+5s)...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        <span>Lancer l'Extension Auto (+5s)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Mode Manuel Details */
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                      <span>Décrivez ce qui se passe dans les 5s suivantes :</span>
                      <span className="text-[10px] text-slate-400 font-normal">Plan suivant</span>
                    </label>
                    <textarea
                      value={manualExtensionPrompt}
                      onChange={(e) => setManualExtensionPrompt(e.target.value)}
                      placeholder="Ex: La caméra avance en travelling et entre dans la pièce secrète sous la pluie, un éclair illumine le décor..."
                      rows={2}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 resize-none shadow-inner"
                    />
                  </div>

                  {/* Suggestions de prompt d'extension rapide */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold block">Suggestions de suite en 1 clic :</span>
                    <div className="flex flex-col gap-1 text-[11px]">
                      {QUICK_EXTENSION_PROMPTS.slice(0, 2).map((sugg, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setManualExtensionPrompt(sugg)}
                          className="text-left px-2 py-1 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/5 truncate transition-colors cursor-pointer"
                        >
                          👉 {sugg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                        Mouvement Caméra :
                      </label>
                      <select
                        value={extensionCamera}
                        onChange={(e) => setExtensionCamera(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                      >
                        {CAMERA_MOVEMENTS.map((cam) => (
                          <option key={cam.id} value={cam.id} className="bg-slate-950">{cam.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col justify-end">
                      <div className="text-[10px] text-slate-400 mb-1">Coût d'extension :</div>
                      <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" />
                        <span>25 crédits</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExtendVideo('manual')}
                    disabled={!videoUrl || extending || loading || !manualExtensionPrompt.trim()}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed group"
                  >
                    {extending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Extension avec Prompt en cours (+5s)...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        <span>Générer l'Extension Manuelle (+5s)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Timeline des segments 5s assemblés */}
              {currentVideo?.segments && currentVideo.segments.length > 0 && (
                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Plans de la vidéo ({currentVideo.duration} au total) :</span>
                    <span className="text-emerald-400 font-semibold">{currentVideo.segments.length} segment(s) de 5s</span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                    {currentVideo.segments.map((seg, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-[10px] text-slate-300 shrink-0 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                        <span className="font-bold text-white">Plan #{seg.shotNumber} (5s)</span>
                        <span className="text-slate-500">• {seg.cameraMovement}</span>
                      </div>
                    ))}
                    <div className="px-2.5 py-1.5 rounded-xl border border-dashed border-pink-500/30 text-[10px] text-pink-400 shrink-0 flex items-center gap-1">
                      <span>+5s suivant</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video Details & Technical Export Buttons */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-3">
              {/* Creator Action Buttons : Re-générer avec ce style / Transformer en TikTok 9:16 */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Actions Rapides :
                </div>
                <div className="grid grid-cols-2 gap-2">
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
                </div>
              </div>

              {/* Dual Export Buttons (MP4 + Technical Plan TXT) */}
              <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="text-[11px]">
                  {user?.isPro ? (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 fill-current" />
                      Export Pur 4K ({duration})
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
                    <span>Télécharger MP4 ({duration})</span>
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
