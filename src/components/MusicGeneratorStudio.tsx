import React, { useState, useRef, useEffect } from 'react';
import { 
  Volume2, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Sparkles, 
  Wand2, 
  RefreshCw, 
  Coins, 
  FileText, 
  Crown, 
  Radio, 
  Sliders,
  Disc3,
  Waves
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PRICING_CONFIG, MusicGeneration } from '../types';

const SOUND_STYLES = [
  { id: 'Cinematic SFX & Impacts', label: 'Bruitages & Impacts Cinématiques', desc: 'Montées dramatiques, sub-drops et explosions' },
  { id: 'Cyberpunk Soundscape', label: 'Soundscape Cyberpunk & Néon', desc: 'Drones futuristes, vrombissements électriques, pluie néon' },
  { id: 'Nature & Organic Sounds', label: 'Sons de Nature & Forêt', desc: 'Bruissement du vent, pluie battante, faune sauvage' },
  { id: 'Sci-Fi Spatial Drones', label: 'Ambiances Spatiales & Drones', desc: 'Résonances de réacteur, sas sous vide, fréquences profondes' },
  { id: 'Retro Arcade & Glitch', label: 'Effets SFX & Rétro Glitch', desc: 'Bips 8-bit, textures modulaires et balayages stéréo' },
];

const SOUND_MOODS = [
  'Immersif & Profond',
  'Mystérieux & Tendu',
  'Épique & Retentissant',
  'Calme & Naturel',
  'Futuriste & Électrique',
];

const QUICK_SOUND_PROMPTS = [
  'Ambiance sonore de pluie battante sur le métal d\'une base orbitale avec résonances lointaines',
  'Effet sonore cinématique d\'impact lourd avec grondement de basses pour bande-annonce',
  'Soundscape d\'une forêt bioluminescente la nuit avec sifflements de vent et échos cristallins',
  'Son de mise sous tension d\'un réacteur à fusion quantique avec décharge électromagnétique',
];

interface MusicGeneratorStudioProps {
  initialMood?: string;
}

export const MusicGeneratorStudio: React.FC<MusicGeneratorStudioProps> = ({ initialMood }) => {
  const { user, deductCredits, addMusicGeneration, openSubscriptionModal } = useAuth();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Cinematic SFX & Impacts');
  const [selectedMood, setSelectedMood] = useState(initialMood || 'Immersif & Profond');
  const [mode, setMode] = useState<'clip' | 'pro'>('clip');

  const [loading, setLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicGeneration | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cost = PRICING_CONFIG.CREDIT_COSTS.MUSIC_GENERATOR;

  useEffect(() => {
    if (initialMood) {
      setSelectedMood(initialMood);
    }
  }, [initialMood]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toastError('Prompt requis', 'Veuillez saisir une description du son ou choisir une idée inspirante.');
      return;
    }

    const hasCredits = deductCredits(
      cost,
      `Son IA (${mode === 'pro' ? 'Sound Pro' : 'Son Court'}) : ${prompt.slice(0, 24)}...`,
      'music'
    );
    if (!hasCredits) return;

    setLoading(true);
    setIsPlaying(false);
    try {
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          mode,
          style: selectedStyle,
          mood: selectedMood,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de la synthèse sonore.');
      }

      const trackData: MusicGeneration = await response.json();
      setCurrentTrack(trackData);
      addMusicGeneration(trackData);
      toastSuccess(
        'Fichier son généré !',
        `"${trackData.title}" est prêt à l'écoute (${trackData.duration}).`,
        'sparkles'
      );
    } catch (err: any) {
      toastError('Erreur de synthèse', err?.message || 'Impossible de générer le son.');
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDownloadWav = () => {
    if (!currentTrack) return;
    const link = document.createElement('a');
    link.href = currentTrack.audioUrl;
    link.download = `omnistudio-sound-${currentTrack.id}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toastSuccess(
      'Fichier son téléchargé !',
      'Format WAV stéréo haute définition enregistré.',
      'sparkles'
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Studio Header Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-pink-500/15 via-purple-500/10 to-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold">
            <Volume2 className="w-3.5 h-3.5 text-pink-400" />
            <span>Moteur Audio & Sons IA (Bruitages, SFX & Soundscapes)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Générateur de Sons, SFX & Ambiances Audio IA
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Synthétisez des bruitages d'action, des ambiances sonores immersives, des nappes audio spatiales, des impacts de cinéma et des soundscapes d'après vos descriptions textuelles avec l'IA.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-pink-300">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              Coût : {cost} crédits par génération sonore
            </span>
            <span>•</span>
            <span>Audio WAV Stéréo 24kHz</span>
            <span>•</span>
            <span>Effets sonores (SFX), Drones & Ambiances</span>
          </div>
        </div>
      </div>

      {/* Main Studio Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Composition Settings */}
        <div className="lg:col-span-5 rounded-3xl glass-panel p-6 border border-white/10 space-y-5">
          
          {/* Sound Mode Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Format du Son
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('clip')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  mode === 'clip'
                    ? 'bg-pink-600/20 border-pink-500 text-white shadow-lg shadow-pink-500/10'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">Son Court / SFX</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-mono">15s</span>
                </div>
                <span className="text-[10px] text-slate-500 block">Idéal pour bruitages, impacts et transitions</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('pro')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  mode === 'pro'
                    ? 'bg-pink-600/20 border-pink-500 text-white shadow-lg shadow-pink-500/10'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">Soundscape Pro</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">30s+</span>
                </div>
                <span className="text-[10px] text-slate-500 block">Ambiance sonore continue et détaillée</span>
              </button>
            </div>
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Description du son souhaité *
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Son d'ambiance d'orage nocturne dans une ruelle cyberpunk avec gouttes de pluie, éclairs et bourdonnements de néon..."
              rows={4}
              className="w-full bg-slate-900/90 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors resize-none"
            />
          </div>

          {/* Quick Inspirations */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 mb-2">
              ✨ Exemples d'ambiances et sons prêts à l'emploi :
            </span>
            <div className="space-y-1.5">
              {QUICK_SOUND_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-900/50 hover:bg-pink-500/10 border border-white/5 hover:border-pink-500/30 text-xs text-slate-300 hover:text-white transition-all line-clamp-1 cursor-pointer"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>

          {/* Style Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Catégorie Sonore
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SOUND_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedStyle(s.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedStyle === s.id
                      ? 'bg-pink-600/20 border-pink-500 text-white shadow-lg'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold text-xs block">{s.label}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mood Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Tonalité & Ambiance
            </label>
            <div className="flex flex-wrap gap-2">
              {SOUND_MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMood(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    selectedMood === m
                      ? 'bg-pink-600 text-white border-pink-500 shadow'
                      : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-pink-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthèse audio en cours ({mode === 'pro' ? 'Soundscape Pro' : 'Son Court'})...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Générer le Son IA ({cost} cr)</span>
              </>
            )}
          </button>

        </div>

        {/* Right Area: Player & Waveform Display */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="rounded-3xl glass-panel p-10 border border-white/10 flex flex-col items-center justify-center text-center space-y-4 min-h-[460px]">
              <div className="w-16 h-16 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center animate-pulse">
                <Waves className="w-8 h-8 text-pink-400 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white">Synthèse du son et des fréquences en cours...</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                L'IA assemble les couches spectrales, calibre les basses et calibre la spatialisation audio 3D.
              </p>
            </div>
          ) : currentTrack ? (
            <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 space-y-6 animate-in fade-in">
              
              {/* Hidden HTML audio element */}
              <audio
                ref={audioRef}
                src={currentTrack.audioUrl}
                onTimeUpdate={() => {
                  if (audioRef.current) {
                    setCurrentTime(audioRef.current.currentTime);
                    setDuration(audioRef.current.duration || 0);
                  }
                }}
                onEnded={() => setIsPlaying(false)}
              />

              {/* Player Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold">
                      {currentTrack.model}
                    </span>
                    <span className="text-xs text-slate-400">
                      {currentTrack.style} • {currentTrack.duration}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{currentTrack.title}</h3>
                  <p className="text-xs text-slate-400 italic">"{currentTrack.prompt}"</p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadWav}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger WAV</span>
                </button>
              </div>

              {/* Visual Audio Spectrogram Simulation */}
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-white/5 space-y-4">
                <div className="flex items-end justify-between gap-1 h-24 px-2">
                  {Array.from({ length: 36 }).map((_, i) => {
                    const progress = duration > 0 ? currentTime / duration : 0;
                    const isActive = i / 36 <= progress;
                    const barHeight = Math.sin(i * 0.4) * 40 + Math.cos(i * 0.8) * 30 + 35;
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-t-sm transition-all duration-150 ${
                          isActive
                            ? 'bg-gradient-to-t from-pink-500 to-indigo-400 shadow-sm shadow-pink-500/50'
                            : 'bg-slate-800/60'
                        }`}
                        style={{ height: `${Math.max(12, isPlaying ? barHeight : 20)}%` }}
                      />
                    );
                  })}
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div
                    onClick={(e) => {
                      if (!audioRef.current || !duration) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickPos = (e.clientX - rect.left) / rect.width;
                      audioRef.current.currentTime = clickPos * duration;
                      setCurrentTime(clickPos * duration);
                    }}
                    className="h-2 rounded-full bg-slate-800 cursor-pointer overflow-hidden relative"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-indigo-500"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Audio Controls */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-3.5 rounded-full bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/30 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = 0;
                          setCurrentTime(0);
                        }
                      }}
                      className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="Recommencer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs font-mono text-slate-400">
                    {Math.floor(currentTime)}s / {Math.floor(duration || 15)}s
                  </div>
                </div>
              </div>

              {/* Generated Sound Notes & Layers */}
              {currentTrack.lyrics && (
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
                  <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-pink-400" />
                    Notes de Conception & Couches Sonores :
                  </span>
                  <div className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-white/5">
                    {currentTrack.lyrics}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="rounded-3xl glass-panel p-10 border border-white/10 flex flex-col items-center justify-center text-center space-y-3 min-h-[460px]">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center mb-2">
                <Volume2 className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-base font-bold text-slate-300">Aucun son généré pour le moment</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Saisissez votre intention ou votre effet sonore dans le panneau de gauche puis cliquez sur Générer le Son IA.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
