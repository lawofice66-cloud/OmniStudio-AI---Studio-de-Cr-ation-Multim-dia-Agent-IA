import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Youtube, 
  Sparkles, 
  Clapperboard, 
  Film, 
  Wand2, 
  Bot, 
  ArrowRight, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Download, 
  Smartphone, 
  Monitor,
  Coins
} from 'lucide-react';
import { PRICING_CONFIG } from '../types';

interface TutorialVideoSectionProps {
  onStartFreeVideo: (prompt?: string) => void;
}

export const TutorialVideoSection: React.FC<TutorialVideoSectionProps> = ({ onStartFreeVideo }) => {
  // Player mode: 'screen-recording' | 'youtube'
  const [playerMode, setPlayerMode] = useState<'screen-recording' | 'youtube'>('screen-recording');
  
  // Screen recording animation state (4 steps: 0, 1, 2, 3)
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepProgress, setStepProgress] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Animated text typing effect for Step 1
  const [typedIdea, setTypedIdea] = useState<string>('');
  const fullIdea = 'pizzeria avec pizzaiolo qui lance sa pâte sous éclairage cinéma';

  // 4 Tutorial Steps Data
  const TUTORIAL_STEPS = [
    {
      step: 1,
      title: "1. Tapez votre idée dans Agent Nova",
      desc: "Exprimez votre vision brute en français. Nova comprend instantanément le contexte, les cadrages et l'ambiance recherchée.",
      badge: "Étape 1 : Idée Brute",
      tag: "Agent IA Nova",
      icon: Bot,
      color: "from-blue-500 to-indigo-500",
    },
    {
      step: 2,
      title: "2. Nova génère 3 prompts cinéma optimisés",
      desc: "L'IA transforme l'idée en 3 prompts professionnels prêts au tournage : 16:9 Paysage, 9:16 TikTok vertical et Master 8K.",
      badge: "Étape 2 : Optimisation IA",
      tag: "Moteur 8K & Veo 3",
      icon: Wand2,
      color: "from-purple-500 to-pink-500",
    },
    {
      step: 3,
      title: "3. Clic sur 'Utiliser ce prompt pour générer'",
      desc: "Un simple clic injecte les paramètres caméra, le format et le prompt enrichi directement dans le studio vidéo Veo 3.",
      badge: "Étape 3 : Injection Studio",
      tag: "1 Clic Automatique",
      icon: Clapperboard,
      color: "from-amber-500 to-orange-500",
    },
    {
      step: 4,
      title: "4. Rendu 5s Veo 3 & Téléchargement MP4",
      desc: "Le moteur Google Veo 3 calcule le plan cinématique 60fps avec physique des fluides ultra-réaliste. Téléchargez en 1 clic !",
      badge: "Étape 4 : Rendu & Export MP4",
      tag: "Google Veo 3 (4K)",
      icon: Film,
      color: "from-emerald-500 to-teal-500",
    },
  ];

  // Animation ticker for screen recording (40 seconds total: 10s per step)
  useEffect(() => {
    if (playerMode !== 'screen-recording' || !isPlaying) return;

    const interval = setInterval(() => {
      setStepProgress((prev) => {
        if (prev >= 100) {
          setCurrentStep((s) => (s + 1) % 4);
          return 0;
        }
        return prev + 2.5; // ~4 seconds per step cycle
      });
    }, 100);

    return () => clearInterval(interval);
  }, [playerMode, isPlaying]);

  // Typing effect when Step 0 is active
  useEffect(() => {
    if (currentStep === 0) {
      const charCount = Math.floor((stepProgress / 100) * fullIdea.length);
      setTypedIdea(fullIdea.slice(0, charCount));
    } else {
      setTypedIdea(fullIdea);
    }
  }, [currentStep, stepProgress]);

  const handleStepJump = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setStepProgress(0);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setStepProgress(0);
    setIsPlaying(true);
  };

  return (
    <div className="space-y-6 pt-2 pb-6">
      
      {/* Tutorial Header */}
      <div className="text-center space-y-2 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 border border-pink-500/40 text-pink-300 text-xs font-black uppercase tracking-wider shadow-lg shadow-pink-500/10">
          <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Tutoriel Vidéo Officiel • Démo Complète 4K</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Comment créer votre première vidéo en 30 secondes ? <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-amber-300 bg-clip-text text-transparent">(Tutoriel)</span>
        </h2>

        <p className="text-xs sm:text-sm text-slate-300">
          Regardez la démo complète : de l'idée brute dans l'Agent Nova jusqu'au fichier MP4 cinématique généré par Google Veo 3.
        </p>
      </div>

      {/* Mode Switcher Pills */}
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            setPlayerMode('screen-recording');
            setIsPlaying(true);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            playerMode === 'screen-recording'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/30 ring-1 ring-pink-400'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Clapperboard className="w-3.5 h-3.5 text-pink-300" />
          <span>🎬 Démo Animée Interactive (Écran Réel)</span>
        </button>

        <button
          type="button"
          onClick={() => setPlayerMode('youtube')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            playerMode === 'youtube'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 ring-1 ring-red-400'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Youtube className="w-3.5 h-3.5 text-red-400" />
          <span>▶️ Lecteur YouTube 16:9</span>
        </button>
      </div>

      {/* Main Video Screen Container with Glowing Neon Border */}
      <div className="relative rounded-3xl p-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-[0_0_50px_rgba(236,72,153,0.35)] overflow-hidden transition-all">
        <div className="relative aspect-video w-full rounded-[22px] bg-slate-950 overflow-hidden flex flex-col justify-between">
          
          {/* MODE 1: Interactive Screen Recording Walkthrough */}
          {playerMode === 'screen-recording' && (
            <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 bg-radial from-slate-900 via-slate-950 to-black select-none">
              
              {/* Top Bar of the Mockup Interface */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 pl-2 hidden sm:inline">
                    OmniStudio AI • studio.fallen75.com/video
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30 text-[10px]">
                    {TUTORIAL_STEPS[currentStep].badge}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/60 text-slate-400 text-[10px] font-mono">
                    Étape {currentStep + 1} / 4
                  </span>
                </div>
              </div>

              {/* Dynamic Center Simulation according to currentStep */}
              <div className="my-auto py-2">
                
                {/* STEP 1: Agent Nova Typing Simulation */}
                {currentStep === 0 && (
                  <div className="max-w-xl mx-auto space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                      <Bot className="w-4 h-4 text-indigo-400 animate-bounce" />
                      <span>Agent IA Nova : Brainstorming du Prompt Vidéo</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/40 shadow-xl space-y-2">
                      <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                        Saisie utilisateur en temps réel :
                      </div>
                      <div className="font-mono text-sm sm:text-base text-white font-medium min-h-[48px] flex items-center bg-black/50 p-3 rounded-xl border border-white/5">
                        <span>"{typedIdea}"</span>
                        <span className="w-2 h-5 bg-pink-400 ml-1 animate-pulse" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Compréhension sémantique activée</span>
                      </span>
                      <span className="text-pink-400 animate-pulse font-bold">
                        Optimisation des optiques cinéma en cours...
                      </span>
                    </div>
                  </div>
                )}

                {/* STEP 2: Nova Generates 3 Pro Formats */}
                {currentStep === 1 && (
                  <div className="max-w-2xl mx-auto space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-pink-300 flex items-center gap-1.5">
                        <Wand2 className="w-4 h-4 text-pink-400" />
                        <span>3 Déclinaisons Optimisées par Nova</span>
                      </span>
                      <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full font-mono">
                        Prêt pour Google Veo 3
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-1 ring-1 ring-purple-500/30">
                        <span className="text-[10px] font-black text-purple-300 uppercase block">1. Format 16:9 Cinéma</span>
                        <p className="text-[10px] text-slate-300 leading-tight">
                          "Cinematic slow-motion of pizzaiolo tossing dough in pizzeria, 8K, volumetric light"
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-pink-950/40 border border-pink-500/40 space-y-1">
                        <span className="text-[10px] font-black text-pink-300 uppercase block">2. Format 9:16 TikTok</span>
                        <p className="text-[10px] text-slate-300 leading-tight">
                          "Vertical commercial closeup of Italian pizzaiolo spinning pizza dough with flour dust, 60fps"
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-1">
                        <span className="text-[10px] font-black text-indigo-300 uppercase block">3. Masterpiece 8K</span>
                        <p className="text-[10px] text-slate-300 leading-tight">
                          "Masterpiece shallow depth of field shot of stone-fired pizzeria with golden flames"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Automatic Studio Injection */}
                {currentStep === 2 && (
                  <div className="max-w-xl mx-auto space-y-4 animate-in fade-in duration-300 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold">
                      <Clapperboard className="w-4 h-4 text-amber-400" />
                      <span>Configuration automatique du Studio Vidéo</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 text-left space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Moteur sélectionné :</span>
                        <span className="font-bold text-pink-400">Google Veo 3 Cinéma (4K)</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Format d'image :</span>
                        <span className="font-bold text-white">16:9 Paysage (60 FPS)</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Cadrage caméra :</span>
                        <span className="font-bold text-indigo-400">Travelling Dolly & Ralenti</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white font-black text-xs shadow-xl animate-pulse cursor-default"
                    >
                      ✓ Paramètres injectés avec succès dans Veo 3
                    </button>
                  </div>
                )}

                {/* STEP 4: Render & MP4 Video Preview */}
                {currentStep === 3 && (
                  <div className="max-w-xl mx-auto space-y-3 animate-in fade-in duration-300 text-center">
                    <div className="relative rounded-2xl overflow-hidden bg-black border border-emerald-500/50 shadow-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-emerald-300">
                        <span className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Rendu Veo 3 Terminé (5s • 4K)</span>
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                          Prêt au téléchargement
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300">
                        <Film className="w-8 h-8 text-pink-400 mx-auto mb-1 animate-bounce" />
                        <span className="block font-bold text-white">Pizzaiolo tournoyant sa pâte sous éclairage volumétrique</span>
                        <span className="text-[10px] text-slate-400">Qualité cinématique 8K • 60 FPS • Audio d'ambiance</span>
                      </div>

                      <div className="flex items-center justify-center gap-3 pt-1">
                        <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black shadow-lg flex items-center gap-2">
                          <Download className="w-3.5 h-3.5" />
                          <span>omnistudio-pizzaiolo-8k.mp4 téléchargé</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Control Bar of the Interactive Screen Recording */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                
                {/* Progress bar */}
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 transition-all duration-100 ease-linear rounded-full"
                    style={{ width: `${stepProgress}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  
                  {/* Step Buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                    {TUTORIAL_STEPS.map((st, idx) => (
                      <button
                        key={st.step}
                        type="button"
                        onClick={() => handleStepJump(idx)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          currentStep === idx
                            ? 'bg-pink-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        Étape {st.step}
                      </button>
                    ))}
                  </div>

                  {/* Play / Pause / Reset Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                      title={isPlaying ? "Mettre en pause" : "Lire"}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                      title="Recommencer depuis le début"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                      title={isMuted ? "Activer les sons" : "Couper le son"}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-pink-400" />}
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* MODE 2: Real YouTube Embed 16:9 Responsive */}
          {playerMode === 'youtube' && (
            <div className="relative w-full h-full bg-black">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0&modestbranding=1"
                title="OmniStudio AI Tutoriel Officiel"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

        </div>
      </div>

      {/* Button to view on YouTube */}
      <div className="flex items-center justify-center gap-3">
        <a
          href="https://www.youtube.com/results?search_query=OmniStudio+AI+Tutoriel"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold transition-all hover:scale-105"
        >
          <Youtube className="w-4 h-4 text-red-400" />
          <span>Voir le tutoriel complet sur YouTube</span>
          <ExternalLink className="w-3 h-3 text-red-300" />
        </a>
      </div>

      {/* 3 Step Icons Feature Box (En dessous de la vidéo) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Step 1 */}
        <div className="rounded-2xl p-4 sm:p-5 glass-panel border border-white/10 hover:border-indigo-500/40 transition-all space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 font-black text-sm flex items-center justify-center border border-indigo-500/30">
              1
            </span>
            <Bot className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-white">1. Décrivez votre idée</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tapez simplement votre idée brute en français (ex : <em>"pizzeria avec pizzaiolo qui lance sa pâte"</em>). L'Agent Nova prend en charge la mise en scène.
          </p>
        </div>

        {/* Step 2 */}
        <div className="rounded-2xl p-4 sm:p-5 glass-panel border border-white/10 hover:border-pink-500/40 transition-all space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-300 font-black text-sm flex items-center justify-center border border-pink-500/30">
              2
            </span>
            <Wand2 className="w-5 h-5 text-pink-400" />
          </div>
          <h3 className="text-sm font-bold text-white">2. Nova optimise</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            L'IA génère automatiquement 3 prompts professionnels (16:9 Cinéma, 9:16 TikTok et Masterpiece 8K) avec éclairage volumétrique et mouvements de caméra.
          </p>
        </div>

        {/* Step 3 */}
        <div className="rounded-2xl p-4 sm:p-5 glass-panel border border-white/10 hover:border-amber-500/40 transition-all space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 font-black text-sm flex items-center justify-center border border-amber-500/30">
              3
            </span>
            <Film className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-sm font-bold text-white">3. Générez en 5s</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Google Veo 3 calcule votre scène cinématique 60fps en ultra-haute résolution. Vous pouvez la visionner immédiatement et télécharger votre MP4 !
          </p>
        </div>
      </div>

      {/* Main Call To Action Button (Essayer maintenant gratuitement - 25 crédits offerts) */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={() => onStartFreeVideo("pizzeria avec pizzaiolo qui lance sa pâte sous éclairage volumétrique")}
          className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-500 hover:to-rose-500 text-white font-black text-sm sm:text-base shadow-2xl shadow-pink-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        >
          <Clapperboard className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
          <span>Essayer maintenant gratuitement - 25 crédits offerts</span>
          <span className="px-2 py-0.5 rounded-full bg-black/40 text-amber-300 text-xs font-bold border border-amber-400/30 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            25 cr
          </span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
        </button>
        <p className="text-[11px] text-slate-400 mt-2">
          Aucune carte bancaire requise • Vos 25 crédits de bienvenue sont immédiatement disponibles
        </p>
      </div>

    </div>
  );
};
