import React, { useState, useRef, useEffect } from 'react';
import { 
  Youtube, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  Music, 
  BookOpen, 
  Bot, 
  Crown, 
  Coins, 
  ExternalLink, 
  Layers, 
  Clapperboard, 
  FileText, 
  Film, 
  Mic, 
  Share2, 
  Monitor, 
  CheckCircle2,
  ChevronRight,
  Zap,
  Info
} from 'lucide-react';
import { PRICING_CONFIG } from '../types';
import { useToast } from '../context/ToastContext';

interface DemoChapter {
  id: number;
  timecode: string;
  durationSeconds: number;
  title: string;
  badge: string;
  tag: string;
  voiceover: string;
  visualAction: string;
  mockupType: 'intro' | 'image' | 'video' | 'music' | 'story' | 'agent' | 'pricing';
  highlightEngine: string;
}

const DEMO_CHAPTERS: DemoChapter[] = [
  {
    id: 1,
    timecode: '00:00',
    durationSeconds: 16,
    title: 'Introduction : Présentation d\'OmniStudio AI',
    badge: 'studio.fallen75.com',
    tag: 'Intro & Hub Créatif',
    voiceover: "Bienvenue sur OmniStudio AI, votre studio multimédia tout-en-un disponible sur studio.fallen75.com. Découvrez comment générer des images 8K ultra-photoréalistes, des vidéos cinématiques avec Google Veo 3, de la musique symphonique 48kHz avec Lyria 3 Pro, et profitez de notre Agent IA Nova pour vous guider pas à pas.",
    visualAction: "Affichage de la page d'accueil d'OmniStudio AI avec les 5 studios créatifs et le co-pilote Nova.",
    mockupType: 'intro',
    highlightEngine: 'Google Veo 3 • Lyria 3 Pro • Imagen 3'
  },
  {
    id: 2,
    timecode: '00:16',
    durationSeconds: 20,
    title: 'Moteur Image 8K Photoréaliste & Booster de Prompt',
    badge: 'Gemini 2.5 & Imagen 3',
    tag: 'Studio Image 8K',
    voiceover: "Dans le studio Image 8K, vous avez accès à Gemini 2.5 Flash Image pour des rendus en moins de 7 secondes, ou à Google Imagen 3 pour une précision chirurgicale. Notre booster de prompt automatique enrichit vos descriptions avec un éclairage volumétrique et des optiques cinéma 35mm. Coût : seulement 2 crédits par image !",
    visualAction: "Saisie d'un prompt, activation du Booster 8K, choix de la lentille 35mm et génération instantanée d'un rendu 8K spectaculaire.",
    mockupType: 'image',
    highlightEngine: 'Gemini 2.5 Flash Image & Imagen 3 Pro'
  },
  {
    id: 3,
    timecode: '00:36',
    durationSeconds: 22,
    title: 'Moteur Vidéo 5s Veo 3 & Mouvements Caméra',
    badge: 'Veo 3 & Kling 2.1',
    tag: 'Studio Vidéo 5s',
    voiceover: "Passez au studio Vidéo propulsé par Google Veo 3 en principal, et Kling 2.1 en secours. Choisissez vos cadrages favoris : Panoramique Cinéma, Travelling Dolly, Drone FPV, Orbite 360° ou Zoom Dramatique. Votre vidéo 5 secondes est générée en 60 FPS avec un plan de tournage technique détaillé téléchargeable !",
    visualAction: "Sélection du mouvement Travelling Dolly, rendu de la vidéo 5s et téléchargement du plan de tournage TXT.",
    mockupType: 'video',
    highlightEngine: 'Google Veo 3 (Cinematic Motion Engine)'
  },
  {
    id: 4,
    timecode: '00:58',
    durationSeconds: 20,
    title: 'Moteur Audio & Musique Symphonique 48kHz Lyria',
    badge: 'Lyria 3 Pro (48kHz Master)',
    tag: 'Studio Audio & Musique',
    voiceover: "Composez des musiques complètes avec Google Lyria 3 Pro en qualité studio master 48kHz et 24-bit. Choisissez votre style : Épique, Synthwave, Lofi ou Orchestral. Vous pouvez exporter immédiatement la piste en WAV ou MP3 haute fidélité avec les paroles générées !",
    visualAction: "Lancement de la composition symphonique, visualisation des ondes acoustiques 48kHz et écoute du morceau masterisé.",
    mockupType: 'music',
    highlightEngine: 'Google Lyria 3 Pro (24-bit / 48kHz Master)'
  },
  {
    id: 5,
    timecode: '01:18',
    durationSeconds: 18,
    title: 'Studio Récits Épiques & Scénarisation IA',
    badge: 'Générateur de Lore',
    tag: 'Studio Histoire IA',
    voiceover: "Pour vos créations narratives, le studio Histoire IA structure vos univers en 3 chapitres captivants. Il définit les profils psychologiques des protagonistes, les arcs dramatiques et génère les prompts visuels prêts à l'emploi pour vos images et vidéos.",
    visualAction: "Affichage d'un récit de science-fiction découpé en 3 chapitres avec choix narratifs et descriptions de scènes.",
    mockupType: 'story',
    highlightEngine: 'Omni Narrative AI Engine'
  },
  {
    id: 6,
    timecode: '01:36',
    durationSeconds: 18,
    title: 'Agent Co-pilote Nova & Optimisation des Prompts',
    badge: 'Nova 24/7',
    tag: 'Agent IA Co-pilote',
    voiceover: "À tout moment, cliquez sur l'Agent Nova en bas à droite. Nova vous conseille les meilleurs mots-clés optiques, affine vos scripts vidéos et vous aide à rentabiliser chaque crédit. En mode Pro, les échanges avec Nova sont illimités et 100% gratuits !",
    visualAction: "Ouverture du tiroir Nova, échange en direct avec l'agent et application du prompt généré dans le studio.",
    mockupType: 'agent',
    highlightEngine: 'Agent Nova (Multimodal Reasoning)'
  },
  {
    id: 7,
    timecode: '01:54',
    durationSeconds: 22,
    title: 'Offre Pro 5$/mois & Paiement Sécurisé NOWPayments',
    badge: '5$ / mois • 500 Crédits',
    tag: 'Offres & Abonnement',
    voiceover: "Démarrez gratuitement avec 25 crédits offerts ! Pour débloquer 500 crédits par mois, la vitesse GPU prioritaire et le retrait des filigranes, passez au Plan Pro pour seulement 5$ par mois. Paiement direct par RedotPay (5$ sans frais) ou par NOWPayments Crypto (6$ frais inclus) via le lien sécurisé !",
    visualAction: "Présentation des tarifs, comparaison Free vs Pro, et ouverture de la modalité de paiement sécurisée NOWPayments / RedotPay.",
    mockupType: 'pricing',
    highlightEngine: 'RedotPay (5$) & NOWPayments (6$)'
  }
];

export const YouTubeDemoStudio: React.FC = () => {
  const { success: toastSuccess, info: toastInfo } = useToast();
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isVoiceOverEnabled, setIsVoiceOverEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'player' | 'script' | 'metadata' | 'thumbnail'>('player');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentChapter = DEMO_CHAPTERS[activeChapterIndex];
  const totalDuration = DEMO_CHAPTERS.reduce((acc, c) => acc + c.durationSeconds, 0);

  // Time tracker effect
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.2 * playbackSpeed;
          // Check if current chapter ended
          const chapterStart = DEMO_CHAPTERS.slice(0, activeChapterIndex).reduce((acc, c) => acc + c.durationSeconds, 0);
          const chapterEnd = chapterStart + currentChapter.durationSeconds;
          
          if (next >= chapterEnd) {
            if (activeChapterIndex < DEMO_CHAPTERS.length - 1) {
              setActiveChapterIndex((idx) => idx + 1);
            } else {
              setIsPlaying(false);
              return totalDuration;
            }
          }
          return next;
        });
      }, 200);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, activeChapterIndex, playbackSpeed, currentChapter.durationSeconds, totalDuration]);

  // Voiceover speech effect
  useEffect(() => {
    if (!isPlaying || !isVoiceOverEnabled) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentChapter.voiceover);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.05 * playbackSpeed;
      utterance.pitch = 1.0;

      // Try to find French voice
      const voices = window.speechSynthesis.getVoices();
      const frenchVoice = voices.find((v) => v.lang.startsWith('fr'));
      if (frenchVoice) {
        utterance.voice = frenchVoice;
      }

      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeChapterIndex, isPlaying, isVoiceOverEnabled, playbackSpeed, currentChapter.voiceover]);

  const handleSelectChapter = (index: number) => {
    setActiveChapterIndex(index);
    const startOffset = DEMO_CHAPTERS.slice(0, index).reduce((acc, c) => acc + c.durationSeconds, 0);
    setCurrentTime(startOffset);
  };

  const handleTogglePlay = () => {
    if (!isPlaying && currentTime >= totalDuration) {
      setCurrentTime(0);
      setActiveChapterIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setActiveChapterIndex(0);
    setIsPlaying(true);
  };

  const handleCopyText = (text: string, sectionName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    toastSuccess('Copié dans le presse-papier !', sectionName);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  // Full YouTube Script text
  const fullYouTubeScript = `================================================================================
SCRIPT VIDÉO YOUTUBE COMPLET — OMNISTUDIO AI (studio.fallen75.com)
DURÉE ESTIMÉE : 2 MINUTES 15 SECONDES
OBJECTIF : DÉMONSTRATION COMPLÈTE & CONVERSION ABONNEMENT PRO 5$/MOIS
================================================================================

${DEMO_CHAPTERS.map((c) => `--------------------------------------------------------------------------------
[TIMECODE ${c.timecode}] ${c.title.toUpperCase()}
Moteur à l'écran : ${c.highlightEngine}
--------------------------------------------------------------------------------
ACTION À L'ÉCRAN :
${c.visualAction}

VOIX-OFF (À LIRE À HAUTE VOIX) :
"${c.voiceover}"
`).join('\n')}
================================================================================
FIN DU SCRIPT — APPEL À L'ACTION :
N'oubliez pas de liker la vidéo, de vous abonner et de tester OmniStudio AI dès maintenant sur studio.fallen75.com !
================================================================================`;

  // YouTube Description text
  const youTubeDescription = `🚀 Découvrez OmniStudio AI : https://studio.fallen75.com
Le studio multimédia tout-en-un propulsé par les moteurs d'intelligence artificielle les plus puissants : Google Veo 3, Google Lyria 3 Pro, Google Imagen 3 et Gemini 2.5 Flash Image !

⚡ DÉBLOQUEZ LE PLAN PRO (500 crédits/mois, GPU rapide, zéro filigrane, Nova illimité) :
💳 Paiement direct RedotPay (5$ sans frais) : https://studio.fallen75.com
💎 Paiement sécurisé NOWPayments Crypto (6$ frais réseau inclus) : ${PRICING_CONFIG.NOWPAYMENTS_URL}

⏱️ CHAPITRES DE LA VIDÉO :
00:00 - Introduction & Présentation du Studio
00:16 - Studio Image 8K Photoréaliste (Gemini 2.5 & Imagen 3)
00:36 - Studio Vidéo Cinématique 5s (Google Veo 3 & Mouvements Caméra)
00:58 - Studio Audio & Musique Symphonique 48kHz (Lyria 3 Pro)
01:18 - Studio Histoires & Univers Scénarisés
01:36 - Co-pilote IA Nova : Optimiseur de Prompts 24/7
01:54 - Offres, Tarifs & Comment s'abonner pour 5$/mois

🔥 FONCTIONNALITÉS CLÉS :
• Images 8K ultra-détaillées avec éclairage volumétrique et objectifs 35mm
• Vidéos 5s en Travelling Dolly, Drone FPV, Panoramique Cinéma et Orbite 360°
• Musiques 48kHz / 24-bit complètes exportables en WAV et MP3
• Plan gratuit avec 25 crédits offerts pour tester immédiatement sans carte bancaire !

#IntelligenceArtificielle #GoogleVeo #Imagen3 #Lyria #OmniStudio #PromptAI #Tech2026`;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Studio Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-950/40 via-slate-900/90 to-purple-950/40 border border-red-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
              <Youtube className="w-4 h-4 text-red-500 animate-pulse" />
              <span>Studio Démo Vidéo YouTube</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Vidéo de Présentation & Kit YouTube 4K
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Voici votre vidéo de démonstration interactive prête pour YouTube expliquant le fonctionnement complet d'OmniStudio AI, accompagnée du script voix-off minuté et de la description prête à publier.
            </p>
          </div>

          {/* Quick actions badge */}
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="https://studio.fallen75.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold border border-white/10 transition-all hover:scale-105"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              <span>studio.fallen75.com</span>
            </a>
            <button
              onClick={() => handleCopyText(youTubeDescription, 'Description YouTube')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-105 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copier Pack YouTube</span>
            </button>
          </div>
        </div>

        {/* Studio Navigation Tabs */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('player')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'player'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Lecteur Démo Interactif (16:9)</span>
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'script'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Script Voix-Off Plan par Plan</span>
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'metadata'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Youtube className="w-4 h-4" />
            <span>Titre & Description YouTube</span>
          </button>
          <button
            onClick={() => setActiveTab('thumbnail')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'thumbnail'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Miniature YouTube 8K</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE DEMO PLAYER */}
      {activeTab === 'player' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main 16:9 Video Canvas Screen */}
          <div className="lg:col-span-8 space-y-4">
            <div
              ref={videoContainerRef}
              className={`relative aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl flex flex-col justify-between p-4 sm:p-6 transition-all ${
                isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : ''
              }`}
            >
              {/* Dynamic Animated Canvas Background depending on chapter */}
              <div className="absolute inset-0 pointer-events-none">
                {currentChapter.mockupType === 'intro' && (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute w-80 h-80 bg-pink-500/15 rounded-full blur-2xl top-10 right-10" />
                  </div>
                )}
                {currentChapter.mockupType === 'image' && (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-950 via-slate-950 to-indigo-950 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.2)_0%,transparent_70%)] animate-pulse" />
                  </div>
                )}
                {currentChapter.mockupType === 'video' && (
                  <div className="w-full h-full bg-gradient-to-br from-amber-950 via-slate-950 to-red-950 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.25)_0%,transparent_70%)]" />
                  </div>
                )}
                {currentChapter.mockupType === 'music' && (
                  <div className="w-full h-full bg-gradient-to-br from-fuchsia-950 via-slate-950 to-purple-950 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.25)_0%,transparent_70%)] animate-pulse" />
                  </div>
                )}
                {currentChapter.mockupType === 'story' && (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-950 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.2)_0%,transparent_70%)]" />
                  </div>
                )}
                {currentChapter.mockupType === 'agent' && (
                  <div className="w-full h-full bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.25)_0%,transparent_70%)] animate-pulse" />
                  </div>
                )}
                {currentChapter.mockupType === 'pricing' && (
                  <div className="w-full h-full bg-gradient-to-br from-yellow-950 via-slate-950 to-amber-950 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.25)_0%,transparent_70%)]" />
                  </div>
                )}
              </div>

              {/* Top Video Header Overlay */}
              <div className="relative z-10 flex items-center justify-between gap-3 bg-slate-900/70 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-black tracking-wider text-white uppercase">
                    OMNISTUDIO AI • DÉMO YOUTUBE
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-white/10 text-[10px] text-slate-300 font-bold">
                    CHAPITRE {activeChapterIndex + 1}/7
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    {currentChapter.highlightEngine}
                  </span>
                </div>
              </div>

              {/* Center Cinematic Stage Simulation */}
              <div className="relative z-10 my-auto text-center px-4 max-w-2xl mx-auto space-y-4">
                {/* Visual Icon Badge */}
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-900/80 border border-white/20 shadow-2xl backdrop-blur-xl">
                  {currentChapter.mockupType === 'intro' && <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />}
                  {currentChapter.mockupType === 'image' && <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />}
                  {currentChapter.mockupType === 'video' && <Video className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />}
                  {currentChapter.mockupType === 'music' && <Music className="w-8 h-8 sm:w-10 sm:h-10 text-pink-400 animate-bounce" />}
                  {currentChapter.mockupType === 'story' && <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />}
                  {currentChapter.mockupType === 'agent' && <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400 animate-pulse" />}
                  {currentChapter.mockupType === 'pricing' && <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />}
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {currentChapter.tag}
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                    {currentChapter.title}
                  </h2>
                </div>

                {/* Simulated live visual action preview box */}
                <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md text-left text-xs text-slate-300 space-y-1 shadow-lg">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold border-b border-white/5 pb-1">
                    <span className="flex items-center gap-1.5">
                      <Clapperboard className="w-3.5 h-3.5 text-indigo-400" />
                      Action filmée à l'écran :
                    </span>
                    <span className="text-emerald-400 font-mono">60 FPS Ultra HD</span>
                  </div>
                  <p className="font-medium text-slate-200 text-xs sm:text-sm">
                    {currentChapter.visualAction}
                  </p>
                </div>
              </div>

              {/* Subtitles & Teleprompter Bar */}
              <div className="relative z-10 space-y-2">
                <div className="bg-slate-950/90 border border-white/15 backdrop-blur-xl px-4 py-3 rounded-2xl text-center shadow-2xl">
                  <p className="text-xs sm:text-sm font-semibold text-amber-300 leading-relaxed italic">
                    "{currentChapter.voiceover}"
                  </p>
                </div>

                {/* Bottom Timeline & Controls Bar */}
                <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex flex-col gap-2">
                  {/* Progress bar */}
                  <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 via-pink-500 to-indigo-500 transition-all duration-200"
                      style={{ width: `${Math.min(100, (currentTime / totalDuration) * 100)}%` }}
                    />
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTogglePlay}
                        className="w-8 h-8 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-md shadow-red-600/30"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                      <button
                        onClick={handleRestart}
                        className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                        title="Recommencer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setIsVoiceOverEnabled(!isVoiceOverEnabled)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isVoiceOverEnabled
                            ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                        title="Activer/Désactiver la voix-off automatique"
                      >
                        {isVoiceOverEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Voix-Off {isVoiceOverEnabled ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>

                    {/* Timecodes */}
                    <div className="font-mono text-[11px] text-slate-400">
                      <span className="text-white font-bold">{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</span>
                      <span> / {Math.floor(totalDuration / 60)}:{(Math.floor(totalDuration % 60)).toString().padStart(2, '0')}</span>
                    </div>

                    {/* Speed & Fullscreen */}
                    <div className="flex items-center gap-2">
                      <select
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                        className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-slate-300 text-[11px] font-bold focus:outline-none cursor-pointer"
                      >
                        <option value={1}>1.0x</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                      </select>

                      <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                        title={isFullscreen ? 'Quitter plein écran' : 'Plein écran pour capture OBS'}
                      >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recording Instructions Banner */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <Monitor className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Comment enregistrer cette démo pour YouTube ?
                  </h4>
                  <p className="text-[12px] text-slate-400">
                    Cliquez sur <strong>Plein Écran</strong>, lancez votre enregistreur d'écran (OBS Studio, Windows Game Bar <kbd className="px-1 py-0.5 bg-slate-800 rounded text-[10px]">Win+G</kbd>, ou QuickTime), puis appuyez sur <strong>Play</strong>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsFullscreen(true);
                  setIsPlaying(true);
                }}
                className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-transform hover:scale-105 cursor-pointer"
              >
                Lancer en Plein Écran
              </button>
            </div>
          </div>

          {/* Chapters Sidebar Playlist */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-red-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Chapitres de la Démo
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  7 chapitres • 2m15s
                </span>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {DEMO_CHAPTERS.map((chap, idx) => {
                  const isCurrent = activeChapterIndex === idx;
                  return (
                    <button
                      key={chap.id}
                      onClick={() => handleSelectChapter(idx)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 group ${
                        isCurrent
                          ? 'bg-red-500/15 border-red-500/40 shadow-lg shadow-red-500/10'
                          : 'bg-slate-950/40 border-white/5 hover:bg-slate-800/40 hover:border-white/10'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-transform ${
                        isCurrent ? 'bg-red-600 text-white scale-105' : 'bg-slate-800 text-slate-400 group-hover:text-white'
                      }`}>
                        {isCurrent && isPlaying ? (
                          <div className="flex items-center gap-0.5">
                            <span className="w-1 h-3 bg-white rounded-full animate-pulse" />
                            <span className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                            <span className="w-1 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                          </div>
                        ) : (
                          chap.timecode
                        )}
                      </div>

                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {chap.tag}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {chap.durationSeconds}s
                          </span>
                        </div>
                        <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-red-300' : 'text-slate-200'}`}>
                          {chap.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {chap.voiceover}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pro offer promotion card in playlist */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/30 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Plan Pro 5$/mois</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    500 crédits • Veo 3 • Lyria 3 • Sans filigrane
                  </p>
                </div>
                <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/30">
                  5 USD
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FULL YOUTUBE SCRIPT */}
      {activeTab === 'script' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-400" />
                  Script YouTube Complet (Minuté et Prêt à Enregistrer)
                </h3>
                <p className="text-xs text-slate-400">
                  Ce script mot à mot a été optimisé pour capter l'attention dans les 5 premières secondes et convertir les spectateurs en abonnés à 5$/mois.
                </p>
              </div>

              <button
                onClick={() => handleCopyText(fullYouTubeScript, 'Script complet')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-transform hover:scale-105 cursor-pointer"
              >
                {copiedSection === 'Script complet' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>Copier Tout le Script</span>
              </button>
            </div>

            {/* Script Breakdown scene by scene */}
            <div className="space-y-4">
              {DEMO_CHAPTERS.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 font-mono text-xs font-bold border border-red-500/30">
                        {c.timecode}
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {c.title}
                      </h4>
                    </div>
                    <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-md">
                      Moteur : {c.highlightEngine}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                        Ce qu'il faut montrer à l'écran :
                      </span>
                      <p className="text-slate-200">
                        {c.visualAction}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/20 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-amber-400" />
                        Voix-off (Ce que vous dites) :
                      </span>
                      <p className="text-amber-100 italic leading-relaxed">
                        "{c.voiceover}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: YOUTUBE METADATA & DESCRIPTION */}
      {activeTab === 'metadata' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-500" />
                  Pack Référencement & Description YouTube Prête à Publier
                </h3>
                <p className="text-xs text-slate-400">
                  Collez ces informations directement dans votre gestionnaire de vidéo YouTube Studio.
                </p>
              </div>

              <button
                onClick={() => handleCopyText(youTubeDescription, 'Description YouTube')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-transform hover:scale-105 cursor-pointer"
              >
                {copiedSection === 'Description YouTube' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>Copier la Description</span>
              </button>
            </div>

            {/* Title Suggestions */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Titres YouTube Recommandés (Fort Taux de Clic CTR) :
              </label>
              <div className="space-y-2">
                {[
                  "OmniStudio AI : Créer des Images 8K, Vidéos Veo 3 et Musiques 48kHz en Secondes ! (Tuto 2026)",
                  "J'ai testé Google Veo 3 & Lyria 3 Pro sur OmniStudio AI : C'est bluffant ! (Démo Complète)",
                  "Générer des Vidéos Cinématiques & Musiques IA Pro pour 5$/mois avec OmniStudio AI"
                ].map((title, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 hover:border-white/20 transition-all text-xs"
                  >
                    <span className="font-semibold text-slate-200">
                      {title}
                    </span>
                    <button
                      onClick={() => handleCopyText(title, `Titre ${i + 1}`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] cursor-pointer"
                    >
                      Copier
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Description Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Description Complète avec Liens & Chapitres :
              </label>
              <textarea
                readOnly
                value={youTubeDescription}
                rows={12}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-300 leading-relaxed focus:outline-none focus:border-red-500/50"
              />
            </div>

            {/* Tags Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tags YouTube (SEO) :
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-950 rounded-2xl border border-white/5">
                {[
                  'omnistudio ai', 'studio.fallen75.com', 'google veo 3', 'imagen 3', 'lyria 3 pro',
                  'gemini 2.5 flash image', 'ia generative', 'video ia', 'musique ia', 'photorealisme 8k',
                  'travelling dolly', 'drone fpv', 'nowpayments crypto', 'redotpay'
                ].map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 text-xs border border-white/5 font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: YOUTUBE THUMBNAIL GENERATOR */}
      {activeTab === 'thumbnail' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-400" />
                Miniature YouTube 8K (Format 16:9 - 1280x720)
              </h3>
              <p className="text-xs text-slate-400">
                Une miniature à fort contraste spécialement conçue pour attirer le regard dans le flux YouTube.
              </p>
            </div>

            {/* Thumbnail Canvas Preview */}
            <div className="relative aspect-video max-w-3xl mx-auto rounded-3xl overflow-hidden border-2 border-indigo-500/40 shadow-2xl bg-slate-950 p-6 flex flex-col justify-between">
              {/* Background gradient & glows */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-950 via-slate-950 to-indigo-950 pointer-events-none" />
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

              {/* Top badging */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/50">
                  <Youtube className="w-4 h-4" />
                  <span>DÉMO OFFICIELLE 2026</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-amber-300 font-black text-xs border border-amber-400/30">
                  5$ / MOIS • 500 CRÉDITS
                </div>
              </div>

              {/* Central Title Headline */}
              <div className="relative z-10 my-auto text-left space-y-2">
                <span className="px-2.5 py-1 rounded-md bg-indigo-500 text-white text-[11px] font-black uppercase tracking-wider">
                  studio.fallen75.com
                </span>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
                  OMNISTUDIO <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">AI 3.8</span>
                </h1>
                <p className="text-lg sm:text-2xl font-extrabold text-amber-300 drop-shadow">
                  VÉO 3 • IMAGEN 3 • LYRIA 3 PRO
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-white/20 text-xs font-bold text-cyan-300">
                    Images 8K &lt; 7s
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-white/20 text-xs font-bold text-amber-300">
                    Vidéos Veo 5s
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-white/20 text-xs font-bold text-pink-300">
                    Audio Master 48kHz
                  </span>
                </div>
              </div>

              {/* Bottom footer bar */}
              <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-xs font-semibold text-slate-400">
                  Co-pilote IA Nova inclus 24/7
                </span>
                <span className="text-xs font-black text-emerald-400">
                  Plan Gratuit 25 crédits offerts
                </span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  toastSuccess('Miniature prête !', 'Faites une capture d\'écran (16:9) pour YouTube Studio.');
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-transform hover:scale-105 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Utiliser cette Miniature pour YouTube</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
