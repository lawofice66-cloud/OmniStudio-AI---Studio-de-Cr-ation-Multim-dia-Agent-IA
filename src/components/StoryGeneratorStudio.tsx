import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Loader2,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PRICING_CONFIG, StoryGeneration } from '../types';
import { safeFetchJson } from '../utils/apiSafeClient';

const THEMES = [
  'Vengeance & Justice',
  'Amour',
  'Aventure',
  'Thriller',
  'Drame',
  'Comédie',
];

export const StoryGeneratorStudio: React.FC = () => {
  const { deductCredits, addStoryGeneration } = useAuth();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const [prompt, setPrompt] = useState('');
  const [theme, setTheme] = useState('Drame');
  const [loading, setLoading] = useState(false);
  const [extending, setExtending] = useState(false);
  const [currentStory, setCurrentStory] = useState<StoryGeneration | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const cost = PRICING_CONFIG.CREDIT_COSTS.STORY_GENERATOR || 1;

  // Arrêter la lecture audio quand le composant est démonté
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const generateStory = async () => {
    // 1. Récupère l'idée directement depuis le DOM au moment du clic
    const ideaEl = document.getElementById('idea') as HTMLTextAreaElement | null;
    const themeEl = document.getElementById('theme') as HTMLSelectElement | null;
    const idea = (ideaEl ? ideaEl.value : prompt).trim();
    const selectedTheme = (themeEl ? themeEl.value : theme).trim();

    if (!idea) {
      toastError('Idée requise', 'Veuillez saisir votre idée de départ pour générer l\'histoire.');
      return;
    }

    // 2. Vide le output avant de générer
    setCurrentStory(null);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }

    // 3. Déduire 1 crédit
    const hasCredits = deductCredits(
      cost,
      `Histoire : ${idea.slice(0, 30)}...`,
      'story'
    );
    if (!hasCredits) return;

    setLoading(true);

    try {
      const apiRes = await safeFetchJson<{
        id?: string;
        title?: string;
        content?: string;
        prompt?: string;
        theme?: string;
        error?: string;
      }>('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          theme: selectedTheme,
        }),
      }, 35000);

      if (apiRes.ok && apiRes.data?.content) {
        const fullContent = apiRes.data.content.trim();
        const storyTitle = (apiRes.data.title || idea.slice(0, 45)).trim();

        const storyData: StoryGeneration = {
          id: apiRes.data.id || 'story_' + Date.now(),
          prompt: idea,
          theme: selectedTheme,
          genre: selectedTheme,
          title: storyTitle,
          content: fullContent,
          createdAt: new Date().toISOString(),
          creditsUsed: cost,
        };

        setCurrentStory(storyData);
        addStoryGeneration(storyData);
        toastSuccess('Histoire générée !', 'Votre histoire a été créée avec succès.');
      } else {
        const errMessage = apiRes.data?.error || 'Erreur lors de la génération. Veuillez réessayer.';
        toastError('Échec de génération', errMessage);
      }
    } catch (err: unknown) {
      console.error('Erreur génération histoire:', err);
      toastError('Erreur de génération', 'Impossible de contacter le moteur IA. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Prolonger l'histoire (+1 crédit, ajoute 300 mots)
  const handleExtendStory = async () => {
    if (!currentStory?.content) return;

    const hasCredits = deductCredits(
      1,
      `Prolongation : ${currentStory.title.slice(0, 25)}...`,
      'story'
    );
    if (!hasCredits) return;

    setExtending(true);
    const fullStory = currentStory.content;

    try {
      const apiRes = await safeFetchJson<{ extension?: string; error?: string }>('/api/extend-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullStory,
        }),
      }, 35000);

      if (apiRes.ok && apiRes.data?.extension) {
        const extension = apiRes.data.extension.trim();
        const updatedContent = `${fullStory}\n\n${extension}`;

        const updatedStory: StoryGeneration = {
          ...currentStory,
          content: updatedContent,
          creditsUsed: (currentStory.creditsUsed || 1) + 1,
        };

        setCurrentStory(updatedStory);
        addStoryGeneration(updatedStory);
        toastSuccess('Histoire prolongée !', '300 mots supplémentaires ont été ajoutés à votre histoire.');
      } else {
        const errMessage = apiRes.data?.error || 'Impossible de prolonger l\'histoire.';
        toastError('Erreur prolongation', errMessage);
      }
    } catch (err: unknown) {
      console.error('Erreur prolongation histoire:', err);
      toastError('Erreur prolongation', 'Impossible de prolonger l\'histoire. Veuillez réessayer.');
    } finally {
      setExtending(false);
    }
  };

  const handleCopy = () => {
    if (!currentStory) return;
    const textToCopy = `${currentStory.title}\n\nThème : ${currentStory.theme || theme}\n\n${currentStory.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toastSuccess('Copié !', 'L\'histoire a été copiée dans votre presse-papiers.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!currentStory) return;
    const fileContent = `================================================================================
${currentStory.title.toUpperCase()}
Thème : ${currentStory.theme || theme}
Date : ${new Date(currentStory.createdAt).toLocaleDateString('fr-FR')}
Idée de départ : ${currentStory.prompt}
================================================================================

${currentStory.content}
`;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = currentStory.title.toLowerCase().replace(/[^a-z0-9]/gi, '_').slice(0, 35);
    link.download = `histoire_${safeTitle || 'recit'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toastSuccess('Téléchargé !', 'Le fichier .txt a été téléchargé.');
  };

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      toastError('Non supporté', 'La synthèse vocale n\'est pas disponible sur votre navigateur.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!currentStory?.content) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentStory.content);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
    toastInfo('Lecture audio en cours', 'Écoute de l\'histoire avec synthèse vocale.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      
      {/* Header simple */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Générateur d'Histoires IA</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Générateur d'Histoires Direct
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Tapez votre idée, choisissez le thème et obtenez directement votre histoire de 500 à 700 mots.
        </p>
      </div>

      {/* Formulaire simplifié : 1 textarea (id="idea") + 1 select (id="theme") + 1 bouton */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6 shadow-2xl bg-slate-900/70">
        
        {/* Champ 1 : Textarea Idée de départ */}
        <div className="space-y-2">
          <label htmlFor="idea" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Idée de départ
          </label>
          <textarea
            id="idea"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Un jeune délinquant qui veut se venger du juge qui l'a condamné par erreur"
            className="w-full p-4 rounded-2xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none"
          />
        </div>

        {/* Champ 2 : Select Thème (id="theme") */}
        <div className="space-y-2">
          <label htmlFor="theme" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Thème
          </label>
          <select
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/50 transition-all cursor-pointer"
          >
            {THEMES.map((t) => (
              <option key={t} value={t} className="bg-slate-900 text-white">
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Bouton Unique : Générer l'histoire (1 crédit) */}
        <button
          type="button"
          onClick={generateStory}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-base font-extrabold shadow-xl shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 group"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Génération directe en cours...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Générer l'histoire ({cost} crédit)</span>
            </>
          )}
        </button>
      </div>

      {/* Zone Histoire avec actions */}
      {currentStory && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/30 bg-slate-900/90 space-y-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          
          {/* En-tête : Titre & Thème */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold mb-2">
                {currentStory.theme || theme}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {currentStory.title}
              </h2>
            </div>

            {/* Boutons d'action : Écouter | Copier | Télécharger */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleToggleSpeech}
                className={`p-2.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10'
                }`}
                title="Écouter l'histoire"
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-4 h-4 text-rose-400" />
                    <span className="hidden sm:inline">Arrêter</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-purple-400" />
                    <span className="hidden sm:inline">Écouter (TTS)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="p-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Copier le texte"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span className="hidden sm:inline">Copier</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="p-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Télécharger en .txt"
              >
                <Download className="w-4 h-4 text-purple-300" />
                <span className="hidden sm:inline">Télécharger .txt</span>
              </button>
            </div>
          </div>

          {/* Corps de l'Histoire complète */}
          <div className="space-y-4 text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-serif">
            {currentStory.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-justify first-letter:text-2xl first-letter:font-bold first-letter:text-purple-400">
                {paragraph.trim()}
              </p>
            ))}
          </div>

          {/* Bouton Prolonger l'histoire (+1 crédit) */}
          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="button"
              onClick={handleExtendStory}
              disabled={extending}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
            >
              {extending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Prolongation en cours (+300 mots)...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 text-amber-300" />
                  <span>Prolonger l'histoire (+1 crédit)</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
