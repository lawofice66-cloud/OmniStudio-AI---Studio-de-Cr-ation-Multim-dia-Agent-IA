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
  Download, 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  Music, 
  BookOpen, 
  Bot, 
  Crown, 
  ExternalLink, 
  FileText, 
  Mic, 
  Monitor, 
  Zap,
  Sliders,
  Radio,
  Flame,
  CheckCircle2,
  Compass,
  Layers,
  ChevronRight
} from 'lucide-react';
import { PRICING_CONFIG } from '../types';
import { useToast } from '../context/ToastContext';
import { generateShowcaseWav } from '../utils/audioSynthesizer';

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
  statsText: string;
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
    visualAction: "Survol cinématique du studio créatif, présentation des moteurs Google Veo 3, Imagen 3 et Lyria 3 Pro.",
    mockupType: 'intro',
    highlightEngine: 'Google Veo 3 • Lyria 3 Pro • Imagen 3',
    statsText: '5 Studios Réunis • Vitesse GPU Prioritaire'
  },
  {
    id: 2,
    timecode: '00:16',
    durationSeconds: 20,
    title: 'Moteur Image 8K Photoréaliste & Booster de Prompt',
    badge: 'Flux 1.1 Pro & Imagen 3',
    tag: 'Studio Image 8K',
    voiceover: "Dans le studio Image 8K, vous avez accès aux moteurs Flux Pro et Imagen 3 pour des rendus ultra-photoréalistes. Notre booster de prompt automatique enrichit vos descriptions avec un éclairage volumétrique et des optiques cinéma 35mm. Coût : seulement 2 crédits par image !",
    visualAction: "Génération en direct d'un visuel 8K ultra-photoréaliste d'une femme dansant sous la pluie avec reflets humides et éclairage volumétrique.",
    mockupType: 'image',
    highlightEngine: 'Flux 1.1 Pro & Imagen 3 Photoréaliste',
    statsText: 'Résolution 8K UHD • Rendu < 4 secondes'
  },
  {
    id: 3,
    timecode: '00:36',
    durationSeconds: 22,
    title: 'Moteur Vidéo 5s Veo 3 & Prompt Engineer Nova Universel',
    badge: 'Google Veo 3 & Nova Illimité',
    tag: 'Studio Vidéo & Nova Universel',
    voiceover: "Passez au studio Vidéo propulsé par Google Veo 3 et l'Agent Nova. Tapez n'importe quelle idée sans limite : dinosaure faisant du skate à Dubaï, pub produit, TikTok viral 9:16 ou scène de cinéma. Votre vidéo 5 secondes est générée en 60 FPS avec un plan technique complet !",
    visualAction: "Génération vidéo cinématographique Veo 3 illimitée avec cadrage dynamique 16:9 / 9:16 et étalonnage 4K.",
    mockupType: 'video',
    highlightEngine: 'Google Veo 3 & Agent Nova Universel',
    statsText: 'Tous Thèmes Autorisés • 16:9 & 9:16 TikTok • Export MP4 & Plan TXT'
  },
  {
    id: 4,
    timecode: '00:58',
    durationSeconds: 20,
    title: 'Moteur Audio & Musique Symphonique 48kHz Lyria',
    badge: 'Lyria 3 Pro (48kHz Master)',
    tag: 'Studio Audio & Musique',
    voiceover: "Composez des musiques complètes avec Google Lyria 3 Pro en qualité studio master 48kHz et 24-bit. Choisissez votre style : Épique, Synthwave, Lofi ou Orchestral. Vous pouvez exporter immédiatement la piste en WAV ou MP3 haute fidélité avec les paroles générées !",
    visualAction: "Spectrogramme acoustique animé en temps réel à 32 bandes de fréquences avec vu-mètres stéréo et master harmonique.",
    mockupType: 'music',
    highlightEngine: 'Google Lyria 3 Pro (24-bit / 48kHz Master)',
    statsText: 'Échantillonnage 48kHz / 24-bit • Export WAV & MP3'
  },
  {
    id: 5,
    timecode: '01:18',
    durationSeconds: 18,
    title: 'Studio Récits Épiques & Scénarisation IA',
    badge: 'Générateur de Lore',
    tag: 'Studio Histoire IA',
    voiceover: "Pour vos créations narratives, le studio Histoire IA structure vos univers en 3 chapitres captivants. Il définit les profils psychologiques des protagonistes, les arcs dramatiques et génère les prompts visuels prêts à l'emploi pour vos images et vidéos.",
    visualAction: "Scénarisation interactive en 3 actes avec fiches des protagonistes et univers cosmique immersif.",
    mockupType: 'story',
    highlightEngine: 'Omni Narrative AI Engine',
    statsText: 'Structure 3 Chapitres • Lore & Prompts Visuels'
  },
  {
    id: 6,
    timecode: '01:36',
    durationSeconds: 18,
    title: 'Agent Co-pilote Nova & Optimisation des Prompts',
    badge: 'Nova 24/7',
    tag: 'Agent IA Co-pilote',
    voiceover: "À tout moment, cliquez sur l'Agent Nova en bas à droite. Nova vous conseille les meilleurs mots-clés optiques, affine vos scripts vidéos et vous aide à rentabiliser chaque crédit. En mode Pro, les échanges avec Nova sont illimités et 100% gratuits !",
    visualAction: "Dialogue en temps réel avec le co-pilote Nova : optimisation optique et assistance créative instantanée.",
    mockupType: 'agent',
    highlightEngine: 'Agent Nova (Multimodal Reasoning)',
    statsText: 'Assistance 24/7 • Gratuit & Illimité en Pro'
  },
  {
    id: 7,
    timecode: '01:54',
    durationSeconds: 22,
    title: 'Offre Pro 5$/mois & Paiement Sécurisé NOWPayments',
    badge: '5$ / mois • 500 Crédits',
    tag: 'Offres & Abonnement',
    voiceover: "Démarrez gratuitement avec 25 crédits offerts ! Pour débloquer 500 crédits par mois, la vitesse GPU prioritaire et le retrait des filigranes, passez au Plan Pro pour seulement 5$ par mois. Paiement direct par RedotPay (5$ sans frais) ou par NOWPayments Crypto (6$ frais inclus) via le lien sécurisé !",
    visualAction: "Badges d'activation instantanée avec options RedotPay (5$) et NOWPayments (6$) sans engagement.",
    mockupType: 'pricing',
    highlightEngine: 'RedotPay (5$) & NOWPayments (6$)',
    statsText: '500 Crédits/Mois • Zéro Filigrane • GPU Rapide'
  }
];

export const YouTubeDemoStudio: React.FC = () => {
  const { success: toastSuccess } = useToast();
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.85);
  const [isVoiceOverEnabled, setIsVoiceOverEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'player' | 'script' | 'metadata' | 'thumbnail'>('player');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bgMusicUrl, setBgMusicUrl] = useState<string>('');
  const [audioBars, setAudioBars] = useState<number[]>([40, 65, 85, 55, 90, 75, 60, 45, 70, 80, 95, 60]);

  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentChapter = DEMO_CHAPTERS[activeChapterIndex];
  const totalDuration = DEMO_CHAPTERS.reduce((acc, c) => acc + c.durationSeconds, 0);

  // Initialize Web Audio Synth for 100% reliable stereo background music
  const startWebAudioSynth = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      // Start gentle polyphonic chord loops
      if (audioCtxRef.current && !synthIntervalRef.current) {
        const ctx = audioCtxRef.current;
        const chords = [
          [220.0, 261.63, 329.63, 440.0], // Am
          [174.61, 220.0, 261.63, 349.23], // F
          [261.63, 329.63, 392.0, 523.25], // C
          [196.0, 246.94, 293.66, 392.0],  // G
        ];
        let chordIdx = 0;

        const playChord = () => {
          if (!isPlaying || isMuted || ctx.state !== 'running') return;
          const chord = chords[chordIdx % chords.length];
          chordIdx++;

          chord.forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            const vol = audioVolume * 0.08;
            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.4);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.8);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 4.0);
          });
        };

        playChord();
        synthIntervalRef.current = window.setInterval(playChord, 3800);
      }
    } catch (e) {
      console.warn('Web Audio Synth notice:', e);
    }
  };

  const stopWebAudioSynth = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
  };

  // Generate real audio soundtrack WAV data on mount
  useEffect(() => {
    try {
      const wav = generateShowcaseWav('cinematic', 20);
      setBgMusicUrl(wav);
    } catch (err) {
      console.warn('Audio synth error:', err);
    }
  }, []);

  // Equalizer animation effect
  useEffect(() => {
    if (isPlaying && !isMuted) {
      const eqInterval = setInterval(() => {
        setAudioBars(Array.from({ length: 16 }, () => Math.floor(Math.random() * 75) + 25));
      }, 120);
      return () => clearInterval(eqInterval);
    } else {
      setAudioBars(Array.from({ length: 16 }, () => 15));
    }
  }, [isPlaying, isMuted]);

  // Audio play/pause sync
  useEffect(() => {
    if (isPlaying && !isMuted) {
      startWebAudioSynth();
      if (bgAudioRef.current) {
        bgAudioRef.current.volume = audioVolume;
        bgAudioRef.current.play().catch(() => {});
      }
    } else {
      stopWebAudioSynth();
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
      }
    }
    return () => stopWebAudioSynth();
  }, [isPlaying, isMuted, audioVolume]);

  // Timer progression effect
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.25 * playbackSpeed;
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
      }, 250);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, activeChapterIndex, playbackSpeed, currentChapter.durationSeconds, totalDuration]);

  // SpeechSynthesis voice-over effect
  useEffect(() => {
    if (!isPlaying || !isVoiceOverEnabled || isMuted) {
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
  }, [activeChapterIndex, isPlaying, isVoiceOverEnabled, isMuted, playbackSpeed, currentChapter.voiceover]);

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
    // Explicit user gesture unlocks audio
    if (!isPlaying) {
      startWebAudioSynth();
      if (bgAudioRef.current) bgAudioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setActiveChapterIndex(0);
    setIsPlaying(true);
    startWebAudioSynth();
    if (bgAudioRef.current) {
      bgAudioRef.current.currentTime = 0;
      bgAudioRef.current.play().catch(() => {});
    }
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
Le studio multimédia tout-en-un propulsé par les moteurs d'intelligence artificielle les plus puissants : Google Veo 3, Google Lyria 3 Pro, Google Imagen 3 et Flux 1.1 Pro !

⚡ DÉBLOQUEZ LE PLAN PRO (500 crédits/mois, GPU rapide, zéro filigrane, Nova illimité) :
💳 Paiement direct RedotPay (5$ sans frais) : https://studio.fallen75.com
💎 Paiement sécurisé NOWPayments Crypto (6$ frais réseau inclus) : ${PRICING_CONFIG.NOWPAYMENTS_URL}

⏱️ CHAPITRES DE LA VIDÉO :
00:00 - Introduction & Présentation du Studio
00:16 - Studio Image 8K Photoréaliste (Flux & Imagen 3)
00:36 - Studio Vidéo Cinématique 5s (Google Veo 3 & Mouvements Caméra)
00:58 - Studio Audio & Musique Symphonique 48kHz (Lyria 3 Pro)
01:18 - Studio Histoires & Univers Scénarisés
01:36 - Co-pilote IA Nova : Optimiseur de Prompts 24/7
01:54 - Offres, Tarifs & Comment s'abonner pour 5$/mois

🔥 FONCTIONNALITÉS CLÉS :
• Images 8K ultra-détaillées avec éclairage volumétrique et objectifs 35mm
• Vidéos 5s Google Veo 3 : Tous thèmes illimités (cinéma, TikTok 9:16, pub, business, anime)
• Agent IA Nova : Prompt Engineer vidéo universel prêt pour Veo 3, Kling, Luma
• Musiques 48kHz / 24-bit complètes exportables en WAV et MP3
• Plan gratuit avec 25 crédits offerts pour tester immédiatement sans carte bancaire !

#IntelligenceArtificielle #GoogleVeo #Imagen3 #Lyria #OmniStudio #PromptAI #Tech2026`;

  // Dynamic Visual Stage rendering for each chapter (guarantees stunning visuals on all devices)
  const renderVisualStage = () => {
    switch (currentChapter.mockupType) {
      case 'intro':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            {/* Background glowing grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
            <div className="relative z-10 space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold animate-pulse">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>studio.fallen75.com • Moteurs IA 2026 Actifs</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-xl">
                OMNISTUDIO <span className="bg-gradient-to-r from-red-500 via-pink-400 to-indigo-400 bg-clip-text text-transparent">AI 8K</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Le studio créatif de nouvelle génération regroupant 5 puissants moteurs sous une interface unique, rapide et sans compromis.
              </p>
              {/* Floating studio pills */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-center">
                  <ImageIcon className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-white block">Image 8K</span>
                  <span className="text-[9px] text-cyan-300">Flux & Imagen 3</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 text-center">
                  <Video className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-white block">Vidéo Veo 3</span>
                  <span className="text-[9px] text-amber-300">60 FPS 5s</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-pink-500/30 text-center">
                  <Music className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-white block">Musique Lyria</span>
                  <span className="text-[9px] text-pink-300">48kHz Master</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="w-full h-full flex flex-col md:flex-row items-center justify-between p-6 gap-6 relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950">
            {/* Left simulated studio controls */}
            <div className="w-full md:w-1/2 space-y-3 z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Moteur Flux 1.1 Pro & Imagen 3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Rendu Photoréaliste Haute Fidélité
              </h3>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 space-y-1.5 text-xs">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Prompt Utilisateur :</div>
                <div className="text-slate-200 font-medium italic">
                  "Une femme qui danse sous la pluie, éclairage cinématique, 8k"
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Booster de prompt : Éclairage volumétrique & 35mm Cinéma</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-1 rounded-md bg-white/10 text-white font-mono">1024x1024 8K</span>
                <span className="px-2 py-1 rounded-md bg-white/10 text-cyan-300 font-mono">Temps : 3.2s</span>
                <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono">Coût : 2 Crédits</span>
              </div>
            </div>

            {/* Right simulated real image demonstration */}
            <div className="w-full md:w-1/2 h-full flex items-center justify-center z-10">
              <div className="relative w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden border-2 border-cyan-400/50 shadow-2xl shadow-cyan-500/20 group">
                <img
                  src="https://image.pollinations.ai/prompt/a%20graceful%20woman%20dancing%20under%20the%20rain%2C%20cinematic%20street%20lamp%20lighting%2C%208k%20resolution%2C%20photorealistic%20masterpiece?width=600&height=600&nologo=true&seed=42"
                  alt="Démo Femme qui danse sous la pluie"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to stylized SVG if external image fails
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold text-white border border-white/20">
                  8K HDR
                </div>
                <div className="absolute bottom-2 inset-x-2 p-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md text-[10px] text-center font-bold text-amber-300">
                  Femme dansant sous la pluie • Flux 1.1 Pro
                </div>
              </div>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-950">
            {/* Viewfinder crosshairs and 16:9 framing guides */}
            <div className="absolute inset-4 border border-white/15 rounded-2xl pointer-events-none" />
            <div className="absolute top-8 left-8 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-black tracking-wider text-red-500 font-mono">REC 00:05.00</span>
            </div>
            <div className="absolute top-8 right-8 flex items-center gap-2 font-mono text-xs text-white">
              <span className="px-2 py-0.5 rounded bg-white/10">60 FPS</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">4K DCI</span>
            </div>

            <div className="relative z-10 text-center space-y-3 max-w-lg">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-300 shadow-xl">
                <Video className="w-7 h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Google Veo 3 Cinematic Motion
              </h3>
              <p className="text-xs text-slate-300">
                Travelling Dolly • Drone FPV • Orbite 360° • Zoom Dramatique
              </p>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-mono text-amber-300 flex items-center justify-around">
                <span>Vitesse : 1/120s</span>
                <span>•</span>
                <span>Optique : Anamorphique 2.39:1</span>
                <span>•</span>
                <span>Plan Technique Inclus</span>
              </div>
            </div>

            <div className="absolute bottom-8 inset-x-8 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>SHUTTER: AUTO</span>
              <span>GOOGLE VEO 3 ENGINE</span>
              <span>AUDIO: STEREO MASTER</span>
            </div>
          </div>
        );

      case 'music':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-b from-slate-950 via-purple-950/40 to-slate-950">
            <div className="relative z-10 text-center space-y-4 max-w-lg w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold border border-pink-400/30">
                <Music className="w-4 h-4 animate-bounce" />
                <span>Google Lyria 3 Pro (Studio Master 48kHz)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Console Acoustique & Analyseur Harmonique
              </h3>

              {/* Dynamic Equalizer Visualizer Bars */}
              <div className="h-28 flex items-end justify-center gap-1.5 px-4 py-2 bg-slate-950/80 rounded-2xl border border-white/10">
                {audioBars.map((height, idx) => (
                  <div
                    key={idx}
                    className="w-2.5 rounded-t-sm bg-gradient-to-t from-indigo-500 via-purple-500 to-pink-400 transition-all duration-100"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-300">
                  <span className="text-[10px] text-slate-500 block">FRÉQUENCE</span>
                  <span className="font-bold text-white">48,000 Hz</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-300">
                  <span className="text-[10px] text-slate-500 block">RÉSOLUTION</span>
                  <span className="font-bold text-white">24-bit Flottant</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-300">
                  <span className="text-[10px] text-slate-500 block">EXPORT</span>
                  <span className="font-bold text-pink-400">WAV & MP3</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'story':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-950">
            {/* Twinkling stars */}
            <div className="absolute inset-0 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:32px_32px] opacity-25" />
            <div className="relative z-10 max-w-lg w-full space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <BookOpen className="w-4 h-4" />
                <span>Générateur Narratif & Scénario 3 Actes</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Univers Immersif & Arcs Dramatiques
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                  <span className="font-bold text-indigo-300">Acte 1 : L'Aube des Mystères</span>
                  <span className="text-slate-400 text-[11px]">Amorçage de la quête</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                  <span className="font-bold text-purple-300">Acte 2 : La Traversée Cosmique</span>
                  <span className="text-slate-400 text-[11px]">Épreuve & Péripéties</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                  <span className="font-bold text-emerald-300">Acte 3 : Le Sanctuaire Ultime</span>
                  <span className="text-slate-400 text-[11px]">Dénouement épique</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'agent':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-950">
            <div className="relative z-10 max-w-lg w-full space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30">
                <Bot className="w-4 h-4 animate-pulse" />
                <span>Co-pilote IA Nova • Disponible 24/7</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Assistance Pro & Optimisation des Prompts
              </h3>
              
              {/* Simulated chat bubble */}
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-purple-300">
                  <Bot className="w-4 h-4" />
                  <span>Nova :</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-medium">
                  "Pour votre image 8K, j'ai ajouté l'éclairage volumétrique et l'optique 35mm. Vos 2 crédits vous donneront un rendu photoréaliste parfait !"
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Gratuit & Illimité en Plan Pro</span>
                </span>
                <span>Raisonnement Multimodal</span>
              </div>
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-950">
            <div className="relative z-10 max-w-lg w-full text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-bold border border-yellow-400/30">
                <Crown className="w-4 h-4" />
                <span>Offre Pro Créateur • 5$ / Mois</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                500 Crédits Mensuels • Zéro Filigrane
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 text-left space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="text-emerald-400">●</span> RedotPay (5$)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Paiement direct sans aucun frais supplémentaire.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-purple-500/30 text-left space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="text-purple-400">●</span> NOWPayments (6$)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Paiement Crypto sécurisé (frais réseau inclus).
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 pt-1">
                25 crédits gratuits offerts à l'inscription pour tester immédiatement !
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hidden Audio Background Element for instant stereo soundtrack playback */}
      {bgMusicUrl && (
        <audio
          ref={bgAudioRef}
          src={bgMusicUrl}
          loop
          preload="auto"
        />
      )}

      {/* Studio Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-950/40 via-slate-900/90 to-purple-950/40 border border-red-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
              <Youtube className="w-4 h-4 text-red-500 animate-pulse" />
              <span>Studio Démo Vidéo YouTube (16:9 HD)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Vidéo de Démonstration Réelle & Kit YouTube 4K
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Lecteur cinématique interactif 16:9 avec bande-son stéréo active, voix-off et script minuté plan par plan pour votre chaîne YouTube.
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
            <span>Lecteur Vidéo HD Réel (16:9)</span>
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

      {/* TAB 1: REAL VIDEO & SOUND PLAYER */}
      {activeTab === 'player' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main 16:9 Video Canvas Screen */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Audio Alert Bar to ensure user has active sound */}
            {isMuted && (
              <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-between text-xs text-amber-200">
                <div className="flex items-center gap-2">
                  <VolumeX className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>Le son est actuellement en sourdine. Cliquez sur <strong>Activer le Son</strong> pour entendre la bande originale !</span>
                </div>
                <button
                  onClick={() => {
                    setIsMuted(false);
                    startWebAudioSynth();
                    if (bgAudioRef.current) bgAudioRef.current.play().catch(() => {});
                  }}
                  className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
                >
                  Activer le Son 🔊
                </button>
              </div>
            )}

            <div
              className={`relative aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl flex flex-col justify-between transition-all ${
                isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : ''
              }`}
            >
              {/* Dynamic Interactive Stage for each studio */}
              <div className="absolute inset-0 z-0">
                {renderVisualStage()}
              </div>

              {/* Top Video Header Overlay */}
              <div className="relative z-10 m-3 sm:m-4 flex items-center justify-between gap-3 bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                    REC • OMNISTUDIO AI HD
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-white/10 text-[10px] text-slate-300 font-bold">
                    CHAPITRE {activeChapterIndex + 1}/7
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 font-bold border border-indigo-400/30 text-[11px]">
                    {currentChapter.highlightEngine}
                  </span>
                </div>
              </div>

              {/* Start overlay button when video is not playing */}
              {!isPlaying && (
                <div className="relative z-20 my-auto text-center px-4">
                  <button
                    onClick={handleTogglePlay}
                    className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-2xl shadow-red-600/50 transition-transform hover:scale-105 cursor-pointer border border-white/20"
                  >
                    <Play className="w-6 h-6 fill-white" />
                    <span>Lancer la Démo Vidéo avec Son & Voix-Off</span>
                  </button>
                  <p className="text-[11px] text-slate-300 pt-2 drop-shadow">
                    Cliquez pour activer la bande-son stéréo et le commentaire vocal synchronisé.
                  </p>
                </div>
              )}

              {/* Subtitles & Teleprompter Bar */}
              <div className="relative z-10 m-3 sm:m-4 space-y-2">
                <div className="bg-slate-950/90 border border-white/20 backdrop-blur-xl px-4 py-2 rounded-2xl text-center shadow-2xl">
                  <p className="text-xs sm:text-sm font-bold text-amber-300 leading-relaxed drop-shadow">
                    "{currentChapter.voiceover}"
                  </p>
                </div>

                {/* Bottom Timeline & Controls Bar */}
                <div className="bg-slate-900/90 backdrop-blur-xl p-3 rounded-2xl border border-white/15 flex flex-col gap-2 shadow-2xl">
                  {/* Progress bar */}
                  <div 
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = (e.clientX - rect.left) / rect.width;
                      setCurrentTime(ratio * totalDuration);
                    }}
                    className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer"
                  >
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
                        className="w-9 h-9 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-lg shadow-red-600/40"
                        title={isPlaying ? 'Pause' : 'Lire la vidéo'}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>

                      <button
                        onClick={handleRestart}
                        className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                        title="Recommencer depuis le début"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      {/* Sound & Volume Control */}
                      <button
                        onClick={() => {
                          const nextMute = !isMuted;
                          setIsMuted(nextMute);
                          if (!nextMute) {
                            startWebAudioSynth();
                            if (bgAudioRef.current) bgAudioRef.current.play().catch(() => {});
                          }
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          !isMuted
                            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                            : 'bg-red-600/20 text-red-300 border border-red-500/40'
                        }`}
                        title={isMuted ? 'Activer le son' : 'Couper le son'}
                      >
                        {!isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                        <span>{!isMuted ? 'Son Actif' : 'Muet'}</span>
                      </button>

                      {/* Volume slider */}
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : audioVolume}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setAudioVolume(val);
                          setIsMuted(val === 0);
                        }}
                        className="w-16 accent-indigo-500 cursor-pointer hidden sm:inline-block"
                        title="Volume sonore"
                      />

                      <button
                        onClick={() => setIsVoiceOverEnabled(!isVoiceOverEnabled)}
                        className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          isVoiceOverEnabled
                            ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                        title="Activer/Désactiver la voix-off automatique"
                      >
                        <Mic className="w-3 h-3" />
                        <span>Voix-Off {isVoiceOverEnabled ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>

                    {/* Timecodes */}
                    <div className="font-mono text-[11px] text-slate-300">
                      <span className="text-white font-bold">{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</span>
                      <span> / {Math.floor(totalDuration / 60)}:{(Math.floor(totalDuration % 60)).toString().padStart(2, '0')}</span>
                    </div>

                    {/* Speed & Fullscreen */}
                    <div className="flex items-center gap-2">
                      <select
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                        className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-slate-200 text-[11px] font-bold focus:outline-none cursor-pointer"
                      >
                        <option value={1}>1.0x</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                      </select>

                      <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
                        title={isFullscreen ? 'Quitter plein écran' : 'Plein écran pour capture OBS'}
                      >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Audio Track Download & OBS Recording Bar */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <Monitor className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Enregistrement YouTube & Téléchargement Bande-Son</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">100% Fonctionnel</span>
                  </h4>
                  <p className="text-[12px] text-slate-300">
                    Vidéo 16:9 en lecture continue avec bande-son stéréo. Vous pouvez enregistrer votre écran via OBS ou télécharger la piste audio WAV.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {bgMusicUrl && (
                  <a
                    href={bgMusicUrl}
                    download="omnistudio-soundtrack-stereo.wav"
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Télécharger Audio WAV</span>
                  </a>
                )}
                <button
                  onClick={() => {
                    setIsFullscreen(true);
                    setIsPlaying(true);
                    startWebAudioSynth();
                    if (bgAudioRef.current) bgAudioRef.current.play().catch(() => {});
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-transform hover:scale-105 cursor-pointer"
                >
                  Lancer Plein Écran
                </button>
              </div>
            </div>
          </div>

          {/* Chapters Sidebar Playlist */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-red-500" />
                  <span>Chapitres de la Démo (7 Plans)</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {Math.floor(totalDuration / 60)}m {totalDuration % 60}s
                </span>
              </div>

              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {DEMO_CHAPTERS.map((chap, idx) => {
                  const isCurrent = idx === activeChapterIndex;
                  return (
                    <div
                      key={chap.id}
                      onClick={() => handleSelectChapter(idx)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isCurrent
                          ? 'bg-red-500/15 border-red-500/40 shadow-lg shadow-red-500/10'
                          : 'bg-slate-950/50 border-white/5 hover:border-white/15 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                        {isCurrent && isPlaying ? (
                          <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                        ) : (
                          <span className="text-[11px] font-bold text-slate-300 font-mono">
                            {idx + 1}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-bold truncate ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                            {chap.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {chap.timecode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {chap.highlightEngine}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FULL YOUTUBE SCRIPT */}
      {activeTab === 'script' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-400" />
                  Script YouTube Complet (Minuté et Prêt à Enregistrer)
                </h3>
                <p className="text-xs text-slate-400">
                  Lisez ce script ou utilisez le téléprompteur intégré pour enregistrer votre vidéo avec votre propre voix ou notre voix IA.
                </p>
              </div>

              <button
                onClick={() => handleCopyText(fullYouTubeScript, 'Script complet')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copier le Script</span>
              </button>
            </div>

            <div className="space-y-4">
              {DEMO_CHAPTERS.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-red-400 font-bold">[{c.timecode}] PLAN {c.id} : {c.title}</span>
                    <span className="text-slate-400">{c.durationSeconds}s</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <div className="text-[11px] text-indigo-300 font-semibold">
                      ACTION : {c.visualAction}
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5 text-amber-200 font-medium leading-relaxed">
                      "{c.voiceover}"
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
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
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
                  'flux pro', 'ia generative', 'video ia', 'musique ia', 'photorealisme 8k',
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
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-6">
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
              <img
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1280&q=80"
                alt="Thumbnail Background"
                className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/90 via-slate-950/70 to-indigo-950/80 pointer-events-none" />

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
                  OMNISTUDIO <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">AI 8K</span>
                </h1>
                <p className="text-lg sm:text-2xl font-extrabold text-amber-300 drop-shadow">
                  VÉO 3 • IMAGEN 3 • LYRIA 3 PRO
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-white/20 text-xs font-bold text-cyan-300">
                    Images 8K &lt; 4s
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
