import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Clapperboard, 
  Film, 
  Wand2, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Download, 
  Smartphone, 
  Monitor,
  Coins,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { PRICING_CONFIG } from '../types';

interface TutorialVideoSectionProps {
  onStartFreeVideo: (prompt?: string) => void;
}

export const TutorialVideoSection: React.FC<TutorialVideoSectionProps> = ({ onStartFreeVideo }) => {
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
      title: "1. Tapez votre idée dans l'éditeur de prompt",
      desc: "Exprimez votre vision brute en français (ex : pizzeria avec pizzaiolo). L'optimiseur cinématique calibre l'éclairage et les mouvements.",
      badge: "Étape 1 : Idée Brute",
      tag: "Éditeur de Scène",
      icon: Wand2,
      color: "from-blue-500 to-indigo-500",
    },
    {
      step: 2,
      title: "2. L'IA génère 3 prompts cinéma optimisés",
      desc: "L'IA transforme l'idée en 3 prompts professionnels prêts au tournage : 16:9 Paysage, 9:16 TikTok vertical et Master 8K.",
      badge: "Étape 2 : Optimisation IA",
      tag: "Moteur 8K & Veo 3",
      icon: Wand2,
      color: "from-purple-500 to-pink-500",
    },
    {
      step: 3,
      title: "3. Clic sur 'Utiliser ce prompt pour générer (16:9)'",
      desc: "Un simple clic injecte les paramètres caméra, le format et le prompt enrichi directement dans le studio vidéo Veo 3.",
      badge: "Étape 3 : Injection Studio",
      tag: "1 Clic Automatique",
      icon: Clapperboard,
      color: "from-amber-500 to-orange-500",
    },
    {
      step: 4,
      title: "4. Rendu 5s Veo 3 & Téléchargement MP4",
      desc: "Le moteur Google Veo 3 calcule le plan cinématique 60fps avec physique des fluides ultra-réaliste. Téléchargement MP4 immédiat !",
      badge: "Étape 4 : Rendu & Export MP4",
      tag: "Google Veo 3 (4K)",
      icon: Film,
      color: "from-emerald-500 to-teal-500",
    },
  ];

  // Animation ticker for screen recording (16 seconds total: 4s per step)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setStepProgress((prev) => {
        if (prev >= 100) {
          setCurrentStep((s) => (s + 1) % 4);
          return 0;
        }
        return prev + 2.5; // ~4 seconds per step
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

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
          <span>Tutoriel Vidéo Officiel • Démo Complète Logiciel</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Comment créer votre première vidéo en 30 secondes ? <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-amber-300 bg-clip-text text-transparent">(Tutoriel)</span>
        </h2>

        <p className="text-xs sm:text-sm text-slate-300">
          Regardez la démo complète : de l'idée brute dans l'éditeur de prompt jusqu'au fichier MP4 cinématique généré par Google Veo 3.
        </p>
      </div>

      {/* Screen Recording Video Mockup 16:9 Screen */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl p-3 sm:p-4 bg-slate-950/90 max-w-4xl mx-auto">
        
        {/* Top Browser / Studio Frame Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-slate-400 px-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
            </div>
            <span className="ml-2 font-mono text-[11px] text-slate-300 hidden sm:inline">
              OmniStudio AI • Screen Recording Tutoriel Officiel
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-pink-300 bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/20">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
            <span>Étape {currentStep + 1} / 4 : {TUTORIAL_STEPS[currentStep].tag}</span>
          </div>
        </div>

        {/* Video Player Display Container */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900/90 border border-white/5 my-3 shadow-inner">
          
          <div className="w-full h-full p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            
            {/* Step Content */}
            <div className="flex-1 flex flex-col justify-center">
              
              {/* STEP 1: Typing Idea */}
              {currentStep === 0 && (
                <div className="max-w-xl mx-auto w-full space-y-4 animate-in fade-in duration-300">
                  <div className="text-center space-y-1">
                    <span className="text-[11px] text-indigo-400 font-mono uppercase tracking-wider font-bold">
                      Studio Vidéo • Étape 1
                    </span>
                    <h3 className="text-base sm:text-xl font-bold text-white">
                      Saisie de l'idée en français dans l'éditeur
                    </h3>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/40 shadow-xl space-y-2">
                    <label className="text-xs text-slate-400 font-semibold block">
                      Description de votre vidéo :
                    </label>
                    <div className="relative p-3 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-xs sm:text-sm min-h-[50px] flex items-center">
                      <span>{typedIdea}</span>
                      <span className="w-2 h-4 bg-indigo-400 animate-pulse ml-1 inline-block" />
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <span className="text-[11px] text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30 font-medium">
                      ✓ Analyse du sujet, mouvement et éclairage en cours...
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 2: 3 Prompts Generated */}
              {currentStep === 1 && (
                <div className="max-w-2xl mx-auto w-full space-y-3 animate-in fade-in duration-300">
                  <div className="text-center space-y-0.5">
                    <span className="text-[11px] text-purple-400 font-mono uppercase tracking-wider font-bold">
                      Génération Cinématographique • Étape 2
                    </span>
                    <h3 className="text-sm sm:text-lg font-bold text-white">
                      3 Prompts cinéma Veo 3 générés instantanément
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-1 ring-1 ring-purple-500/30">
                      <div className="flex items-center gap-1.5 text-purple-300 text-xs font-bold">
                        <Monitor className="w-3.5 h-3.5" />
                        <span>16:9 Cinéma</span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-mono line-clamp-3">
                        Cinematic 8K wide shot of Italian pizzaiolo chef tossing pizza dough, volumetric flour particles, golden stone oven lighting, 60fps.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-pink-950/40 border border-pink-500/40 space-y-1">
                      <div className="flex items-center gap-1.5 text-pink-300 text-xs font-bold">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>9:16 TikTok</span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-mono line-clamp-3">
                        Vertical viral sequence, extreme slow-motion dough spin, dynamic camera tracking, mozzarella stretch, neon pizzeria vibes.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-1">
                      <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Style Artistique</span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-mono line-clamp-3">
                        Pixar 3D animated master chef smiling, warm flour dust, whimsical glowing oven fire, rich stylized textures.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Click to Inject */}
              {currentStep === 2 && (
                <div className="max-w-xl mx-auto w-full space-y-4 animate-in fade-in duration-300 text-center">
                  <div className="space-y-1">
                    <span className="text-[11px] text-amber-400 font-mono uppercase tracking-wider font-bold">
                      Injection Studio • Étape 3
                    </span>
                    <h3 className="text-base sm:text-xl font-bold text-white">
                      Clic sur "Utiliser ce prompt pour générer (16:9)"
                    </h3>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 shadow-2xl max-w-md mx-auto space-y-3">
                    <div className="p-3 rounded-xl bg-slate-950 text-left font-mono text-[11px] text-amber-200 border border-white/10">
                      Format : 16:9 Paysage • Moteur : Google Veo 3 • Durée : 5s
                    </div>

                    <button
                      type="button"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 animate-pulse"
                    >
                      <Clapperboard className="w-4 h-4" />
                      <span>Utiliser ce prompt pour générer (16:9)</span>
                    </button>
                  </div>

                  <div className="text-xs text-amber-300 font-medium">
                    ✓ Configuration chargée dans le Studio de Rendu
                  </div>
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

        </div>

      </div>

      {/* Mandatory Official Copyright Notice Box */}
      <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-slate-900/90 border border-white/10 text-xs text-slate-300 space-y-1 text-center font-mono shadow-xl">
        <p className="font-bold text-white flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>© 2024 OmniStudio AI - Tous droits réservés</span>
        </p>
        <p className="text-slate-400">Logiciel créé par Alexandre Studio</p>
        <p className="text-slate-400">Musique : Libre de droits (YouTube Audio Library) • Aucun contenu sous copyright de tiers utilisé</p>
        <p className="text-pink-300 font-bold">
          Tutoriel officiel OmniStudio AI — <a href="https://studio.fallen75.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">studio.fallen75.com</a>
        </p>
      </div>

      {/* 3 Step Icons Feature Box (En dessous de la vidéo) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 max-w-4xl mx-auto">
        {/* Step 1 */}
        <div className="rounded-2xl p-4 sm:p-5 glass-panel border border-white/10 hover:border-indigo-500/40 transition-all space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 font-black text-sm flex items-center justify-center border border-indigo-500/30">
              1
            </span>
            <Wand2 className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-white">1. Décrivez votre idée</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tapez simplement votre idée brute en français (ex : <em>"pizzeria avec pizzaiolo qui lance sa pâte"</em>). L'IA prend en charge la mise en scène.
          </p>
        </div>

        {/* Step 2 */}
        <div className="rounded-2xl p-4 sm:p-5 glass-panel border border-white/10 hover:border-pink-500/40 transition-all space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-300 font-black text-sm flex items-center justify-center border border-pink-500/30">
              2
            </span>
            <Clapperboard className="w-5 h-5 text-pink-400" />
          </div>
          <h3 className="text-sm font-bold text-white">2. Choisissez votre format</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Sélectionnez 16:9 Cinéma pour YouTube ou 9:16 Vertical pour TikTok, Reels et Shorts. L'angle de caméra et l'éclairage sont calculés en 8K.
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
          <h3 className="text-sm font-bold text-white">3. Téléchargez votre MP4</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Le moteur Google Veo 3 génère votre vidéo 5 secondes à 60 FPS. Téléchargez immédiatement le fichier MP4 haute définition.
          </p>
        </div>
      </div>

      {/* Call to Action Button */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => onStartFreeVideo('pizzeria avec pizzaiolo qui lance sa pâte sous éclairage volumétrique')}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-500 hover:to-rose-500 text-white font-black text-sm sm:text-base shadow-2xl shadow-pink-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        >
          <Film className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
          <span>Créer ma première vidéo gratuitement</span>
          <span className="px-2.5 py-0.5 rounded-full bg-black/40 text-amber-300 text-xs font-mono border border-amber-400/30 flex items-center gap-1">
            <Coins className="w-3 h-3" />
            25 crédits offerts
          </span>
        </button>
      </div>

    </div>
  );
};
