import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Wand2, 
  Download, 
  Copy, 
  Check, 
  Coins, 
  User, 
  Layers, 
  Compass, 
  Volume2, 
  VolumeX, 
  Image as ImageIcon, 
  Music, 
  ChevronRight, 
  Flame, 
  ShieldAlert, 
  Crown, 
  RefreshCw, 
  FileText,
  Split
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PRICING_CONFIG, StoryGeneration } from '../types';
import { downloadTextWithWatermark } from '../utils/watermark';

const STORY_GENRES = [
  { id: 'Science-Fiction', label: 'Science-Fiction', desc: 'Voyage interstellaire, IA et futurs lointains' },
  { id: 'Dark Fantasy', label: 'Dark Fantasy', desc: 'Magie interdite, cités corrompues et monstres' },
  { id: 'Cyberpunk', label: 'Cyberpunk Néon', desc: 'Mégacorporations, hackers et pluie acide' },
  { id: 'Thriller Psychologique', label: 'Thriller & Mystère', desc: 'Enquêtes sombres, manipulations et faux-semblants' },
  { id: 'Space Opera', label: 'Space Opera Épique', desc: 'Guerres galactiques, empires et reliques cosmiques' },
  { id: 'Post-Apocalyptique', label: 'Post-Apocalyptique', desc: 'Survie dans les cendres d\'une civilisation disparue' },
];

const STORY_TONES = [
  { id: 'Épique & Captivant', label: 'Épique & Héroïque' },
  { id: 'Sombre & Réaliste', label: 'Sombre & Mené au scalpel' },
  { id: 'Poétique & Métaphysique', label: 'Poétique & Envoûtant' },
  { id: 'Haletant & Nerveux', label: 'Nerveux & Tendu' },
  { id: 'Mystérieux & Onirique', label: 'Onirique & Mystérieux' },
];

const STORY_INSPIRATIONS = [
  'Une archiviste stellaire découvre un signal encrypté provenant d\'une planète rayée des cartes galactiques',
  'Dans une cité cyberpunk souterraine, un mercenaire cybernétique se voit confier une mémoire volée qui prédit la fin du dôme',
  'Un alchimiste banni brave les steppes gelées pour réveiller le dernier gardien titan capable de vaincre la corruption',
  'Une détective télépathe enquête sur un meurtre dont l\'unique témoin est un automate qui refuse de parler',
];

interface StoryGeneratorStudioProps {
  onNavigateToImageStudio?: (prompt: string) => void;
  onNavigateToMusicStudio?: (mood: string) => void;
}

export const StoryGeneratorStudio: React.FC<StoryGeneratorStudioProps> = ({
  onNavigateToImageStudio,
  onNavigateToMusicStudio,
}) => {
  const { user, deductCredits, addStoryGeneration, openSubscriptionModal } = useAuth();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('Science-Fiction');
  const [tone, setTone] = useState('Épique & Captivant');
  const [protagonist, setProtagonist] = useState('');
  const [format, setFormat] = useState('Roman à Chapitres (3 Actes)');
  const [chaptersCount, setChaptersCount] = useState(3);

  const [loading, setLoading] = useState(false);
  const [currentStory, setCurrentStory] = useState<StoryGeneration | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isReadingSpeech, setIsReadingSpeech] = useState(false);

  const cost = PRICING_CONFIG.CREDIT_COSTS.STORY_GENERATOR;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toastError('Prompt requis', 'Veuillez saisir une idée de récit ou choisir une inspiration.');
      return;
    }

    const hasCredits = deductCredits(
      cost,
      `Histoire IA : ${prompt.slice(0, 28)}...`,
      'story'
    );
    if (!hasCredits) return;

    setLoading(true);
    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          genre,
          tone,
          protagonist,
          format,
          chaptersCount,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de la génération de l\'histoire.');
      }

      const storyData: StoryGeneration = await response.json();
      setCurrentStory(storyData);
      addStoryGeneration(storyData);
      setActiveChapterIndex(0);
      toastSuccess(
        'Récit épique généré !',
        `"${storyData.title}" est prêt avec ses ${storyData.chapters?.length || 3} chapitres détaillés.`,
        'sparkles'
      );
    } catch (err: any) {
      toastError('Erreur de génération', err?.message || 'Impossible de créer le récit.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadStory = () => {
    if (!currentStory) return;
    const isPro = !!user?.isPro;

    let content = `TITRE : ${currentStory.title.toUpperCase()}
Genre : ${currentStory.genre} | Tonalité : ${currentStory.tone}
Accroche : ${currentStory.logline}

UNIVERS & LORE :
${currentStory.worldSetting}

================================================================================
PERSONNAGES PRINCIPAUX
================================================================================
`;

    currentStory.characters?.forEach((c, idx) => {
      content += `[${c.role.toUpperCase()}] ${c.name}
Description : ${c.description}
Motivation : ${c.motivation}
Secret / Faille : ${c.secret || 'Néant'}\n\n`;
    });

    content += `================================================================================
RÉCIT COMPLET PAR CHAPITRES
================================================================================
`;

    currentStory.chapters?.forEach((ch) => {
      content += `--- CHAPITRE ${ch.chapterNumber} : ${ch.title} ---
Tension dramatique : ${ch.tensionLevel}/10
Ambiance sonore : ${ch.soundtrackMood || 'N/A'}

${ch.narrative}

[Prompt Visuel Suggéré] : ${ch.sceneVisualPrompt}\n\n`;
    });

    if (currentStory.branches && currentStory.branches.length > 0) {
      content += `================================================================================
EMBRANCHEMENTS & DILEMMES INTERACTIFS
================================================================================
`;
      currentStory.branches.forEach((b, idx) => {
        content += `Option ${idx + 1} : ${b.text}\nConséquence : ${b.consequence}\n\n`;
      });
    }

    content += `SYNTHÈSE : ${currentStory.summary}`;

    downloadTextWithWatermark(content, currentStory.title, isPro, `histoire-${currentStory.id}.txt`);
    toastSuccess(
      'Histoire exportée !',
      isPro ? 'Récit complet téléchargé sans filigrane.' : 'Fichier téléchargé avec filigrane Plan Free.',
      'sparkles'
    );
  };

  const handleCopy = () => {
    if (!currentStory) return;
    const textToCopy = `${currentStory.title}\n\n${currentStory.logline}\n\n` +
      currentStory.chapters.map(c => `Chapitre ${c.chapterNumber} : ${c.title}\n${c.narrative}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toastInfo('Copié !', 'L\'intégralité du texte a été copiée dans votre presse-papiers.');
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeechRead = () => {
    if (!('speechSynthesis' in window)) {
      toastError('Non supporté', 'La synthèse vocale n\'est pas supportée sur ce navigateur.');
      return;
    }

    if (isReadingSpeech) {
      window.speechSynthesis.cancel();
      setIsReadingSpeech(false);
      return;
    }

    if (!currentStory) return;
    const activeChapter = currentStory.chapters[activeChapterIndex];
    if (!activeChapter) return;

    const utterance = new SpeechSynthesisUtterance(
      `${activeChapter.title}. ${activeChapter.narrative}`
    );
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    utterance.onend = () => setIsReadingSpeech(false);
    utterance.onerror = () => setIsReadingSpeech(false);

    window.speechSynthesis.speak(utterance);
    setIsReadingSpeech(true);
    toastInfo('Lecture audio en cours', `Lecture du Chapitre ${activeChapter.chapterNumber}...`, 'sparkles');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Studio Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>Moteur Narratif Haute Puissance • Gemini 3.8</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Générateur d'Histoires IA Très Puissant
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Donnez vie à des romans immersifs, univers de science-fiction, épopées dark fantasy et scénarios interactifs. Notre moteur conçoit l'univers, la psychologie des personnages, l'arc dramatique et les prompts visuels associés.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-purple-300">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              Coût : {cost} crédits par histoire complète
            </span>
            <span>•</span>
            <span>World-building & Dossiers Personnages</span>
            <span>•</span>
            <span>Découpage en chapitres & choix interactifs</span>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Story Configuration */}
        <div className="lg:col-span-5 rounded-3xl glass-panel p-6 border border-white/10 space-y-5">
          
          {/* Prompt Seed */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
              <span>Idée de départ ou Thème central *</span>
              <span className="text-[10px] text-slate-400 lowercase font-normal">Sujet de votre quête</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Une station orbitale isolée capte le signal d'un vaisseau d'exploration disparu depuis un siècle..."
              rows={4}
              className="w-full bg-slate-900/90 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>

          {/* Quick Inspirations */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 mb-2">
              💡 Idées d'intrigues percutantes en 1 clic :
            </span>
            <div className="space-y-1.5">
              {STORY_INSPIRATIONS.map((idea, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(idea)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-900/50 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 text-xs text-slate-300 hover:text-white transition-all line-clamp-1 cursor-pointer"
                >
                  "{idea}"
                </button>
              ))}
            </div>
          </div>

          {/* Genre Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Genre Littéraire
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STORY_GENRES.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGenre(g.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    genre === g.id
                      ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold text-xs block">{g.label}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{g.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Tonalité & Atmosphère
            </label>
            <div className="flex flex-wrap gap-2">
              {STORY_TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    tone === t.id
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                      : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Protagonist Field */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Héros / Protagoniste (Optionnel)</span>
              <span className="text-[10px] text-slate-500">Nom ou métier</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={protagonist}
                onChange={(e) => setProtagonist(e.target.value)}
                placeholder="Ex: Maya Vance, crypto-archéologue rebelle"
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Action Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Génération du récit en cours (Gemini 3.8)...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Générer l'Histoire Complète ({cost} cr)</span>
              </>
            )}
          </button>

        </div>

        {/* Right Area: Story Viewer */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="rounded-3xl glass-panel p-10 border border-white/10 flex flex-col items-center justify-center text-center space-y-4 min-h-[500px]">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center animate-bounce">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Écriture de l'épopée en cours...</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Le modèle Gemini tisse les intrigues, affine la psychologie des protagonistes et compose les décors narratifs.
              </p>
            </div>
          ) : currentStory ? (
            <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 space-y-6 animate-in fade-in">
              
              {/* Story Header */}
              <div className="space-y-3 pb-6 border-b border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                      {currentStory.genre}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-900 text-slate-300 border border-white/10 text-xs">
                      {currentStory.tone}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleSpeechRead}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title={isReadingSpeech ? 'Arrêter la lecture' : 'Écouter le chapitre actif (Lecture vocale)'}
                    >
                      {isReadingSpeech ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
                      <span className="text-[11px] hidden sm:inline">{isReadingSpeech ? 'Stop' : 'Écouter'}</span>
                    </button>

                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Copier le texte"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span className="text-[11px] hidden sm:inline">{copied ? 'Copié' : 'Copier'}</span>
                    </button>

                    <button
                      onClick={handleDownloadStory}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger</span>
                    </button>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {currentStory.title}
                </h2>
                <p className="text-sm font-medium text-purple-200/90 italic">
                  "{currentStory.logline}"
                </p>
              </div>

              {/* World Lore Box */}
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-1.5">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-purple-400" />
                  Univers & Contexte de l'Œuvre :
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentStory.worldSetting}
                </p>
              </div>

              {/* Characters Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  Dossier des Personnages Clés :
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentStory.characters?.map((char, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{char.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-indigo-500/20">
                          {char.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{char.description}</p>
                      <div className="text-[10px] text-slate-500 pt-1 border-t border-white/5 flex flex-col gap-0.5">
                        <span><strong>Désir :</strong> {char.motivation}</span>
                        {char.secret && <span className="text-purple-300"><strong>Secret :</strong> {char.secret}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chapter Tabs & Narrative Body */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {currentStory.chapters?.map((ch, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveChapterIndex(idx);
                          if (isReadingSpeech) window.speechSynthesis.cancel();
                          setIsReadingSpeech(false);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                          activeChapterIndex === idx
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>Chapitre {ch.chapterNumber}</span>
                        <span className="text-[10px] opacity-75">({ch.tensionLevel}/10)</span>
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-slate-400 hidden sm:inline">
                    Tension : <strong className="text-amber-400">{currentStory.chapters[activeChapterIndex]?.tensionLevel}/10</strong>
                  </span>
                </div>

                {/* Active Chapter Card */}
                {currentStory.chapters[activeChapterIndex] && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <h3 className="text-base font-bold text-white">
                        {currentStory.chapters[activeChapterIndex].title}
                      </h3>
                      {currentStory.chapters[activeChapterIndex].soundtrackMood && (
                        <span className="text-[11px] text-pink-300 flex items-center gap-1">
                          <Volume2 className="w-3 h-3 text-pink-400" />
                          Ambiance sonore : {currentStory.chapters[activeChapterIndex].soundtrackMood}
                        </span>
                      )}
                    </div>

                    <div className="font-serif text-sm text-slate-200 leading-relaxed whitespace-pre-wrap space-y-3">
                      {currentStory.chapters[activeChapterIndex].narrative}
                    </div>

                    {/* Scene Illustration Shortcut */}
                    <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <span className="text-slate-400 italic text-[11px] line-clamp-1 max-w-sm">
                        🎨 Prompt d'illustration : "{currentStory.chapters[activeChapterIndex].sceneVisualPrompt}"
                      </span>

                      <div className="flex flex-wrap items-center gap-2">
                        {onNavigateToImageStudio && (
                          <button
                            type="button"
                            onClick={() => onNavigateToImageStudio(currentStory.chapters[activeChapterIndex].sceneVisualPrompt)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Illustrer (Image)</span>
                          </button>
                        )}

                        {onNavigateToMusicStudio && (
                          <button
                            type="button"
                            onClick={() => onNavigateToMusicStudio(currentStory.chapters[activeChapterIndex].soundtrackMood || currentStory.tone)}
                            className="px-3 py-1.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 text-pink-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Générer le Son d'Ambiance</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Branching choices (Interactive dilemma) */}
              {currentStory.branches && currentStory.branches.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Split className="w-4 h-4 text-purple-400" />
                    Dilemmes & Choix Interactifs pour continuer :
                  </span>

                  <div className="space-y-2">
                    {currentStory.branches.map((b, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs space-y-1">
                        <span className="font-bold text-purple-300 block">
                          👉 Choix {idx + 1} : {b.text}
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {b.consequence}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="rounded-3xl glass-panel p-10 border border-white/10 flex flex-col items-center justify-center text-center space-y-3 min-h-[460px]">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center mb-2">
                <BookOpen className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-base font-bold text-slate-300">Votre roman n'est pas encore commencé</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Saisissez un sujet dans le panneau de gauche ou choisissez l'une de nos inspirations pour lancer la narration complète.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
