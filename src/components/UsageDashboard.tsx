import React, { useState, useMemo } from 'react';
import { 
  Coins, 
  TrendingUp, 
  BarChart3, 
  Sparkles, 
  Crown, 
  ExternalLink, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  Search, 
  Copy, 
  Check, 
  Download, 
  BookOpen, 
  FileText, 
  Filter, 
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  Flame,
  User as UserIcon,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PRICING_CONFIG, StoryGeneration } from '../types';

export const UsageDashboard: React.FC = () => {
  const { 
    user, 
    transactions, 
    storyHistory, 
    deleteStoryGeneration,
    openSubscriptionModal
  } = useAuth();

  const { success: toastSuccess, info: toastInfo } = useToast();

  // Main Dashboard Tab: 'history' vs 'analytics'
  const [dashboardTab, setDashboardTab] = useState<'history' | 'analytics'>('history');

  // Analytics states
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [hoveredDay, setHoveredDay] = useState<{ date: string; amount: number; count: number } | null>(null);

  // Project History states
  const [historySearch, setHistorySearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);
  const [expandedStoryIds, setExpandedStoryIds] = useState<Record<string, boolean>>({});

  // Available genre filters with counts
  const genreFilters = useMemo(() => {
    const counts: Record<string, number> = {};
    storyHistory.forEach((s) => {
      const g = s.genre || 'Général';
      counts[g] = (counts[g] || 0) + 1;
    });

    const standardGenres = [
      'Science-Fiction',
      'Dark Fantasy',
      'Cyberpunk',
      'Thriller & Mystère',
      'Space Opera',
      'Post-Apocalyptique'
    ];

    const list = [
      { id: 'all', label: 'Toutes les histoires', count: storyHistory.length },
    ];

    standardGenres.forEach((g) => {
      list.push({
        id: g,
        label: g,
        count: counts[g] || 0
      });
    });

    // Add any custom genres present in history not in standard list
    Object.keys(counts).forEach((g) => {
      if (!standardGenres.includes(g) && g !== 'all') {
        list.push({
          id: g,
          label: g,
          count: counts[g]
        });
      }
    });

    return list;
  }, [storyHistory]);

  // Filtered stories
  const filteredStories = useMemo(() => {
    return storyHistory.filter((story) => {
      const matchGenre = selectedGenre === 'all' || 
        story.genre.toLowerCase().includes(selectedGenre.toLowerCase()) ||
        selectedGenre.toLowerCase().includes(story.genre.toLowerCase());

      const q = historySearch.toLowerCase().trim();
      if (!q) return matchGenre;

      const matchPrompt = story.prompt?.toLowerCase().includes(q);
      const matchTitle = story.title?.toLowerCase().includes(q);
      const matchLogline = story.logline?.toLowerCase().includes(q);
      const matchWorld = story.worldSetting?.toLowerCase().includes(q);
      const matchCharacters = story.characters?.some(
        (c) => c.name?.toLowerCase().includes(q) || c.role?.toLowerCase().includes(q)
      );
      const matchChapters = story.chapters?.some(
        (ch) => ch.title?.toLowerCase().includes(q) || ch.narrative?.toLowerCase().includes(q)
      );

      return matchGenre && (matchPrompt || matchTitle || matchLogline || matchWorld || matchCharacters || matchChapters);
    });
  }, [storyHistory, selectedGenre, historySearch]);

  const toggleExpandStory = (id: string) => {
    setExpandedStoryIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    toastInfo('Prompt copié !', 'Le prompt a été copié dans votre presse-papiers.');
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleCopyFullText = (id: string, story: StoryGeneration) => {
    let full = `TITRE : ${story.title.toUpperCase()}\n`;
    full += `GENRE : ${story.genre} | TONALITÉ : ${story.tone}\n`;
    full += `ACCROCHE : ${story.logline}\n`;
    full += `UNIVERS : ${story.worldSetting}\n\n`;

    if (story.chapters && story.chapters.length > 0) {
      story.chapters.forEach((ch) => {
        full += `--- CHAPITRE ${ch.chapterNumber} : ${ch.title} ---\n`;
        full += `${ch.narrative}\n\n`;
      });
    }

    if (story.summary) {
      full += `RÉSUMÉ : ${story.summary}\n`;
    }

    navigator.clipboard.writeText(full);
    setCopiedTextId(id);
    toastSuccess('Récit complet copié !', 'Le texte complet a été copié dans votre presse-papiers.');
    setTimeout(() => setCopiedTextId(null), 2000);
  };

  const handleExportStoryTxt = (story: StoryGeneration) => {
    let text = `================================================================================\n`;
    text += `OMNISTUDIO FLARE — RÉCIT & SCÉNARIO COMPLET\n`;
    text += `================================================================================\n\n`;
    text += `TITRE : ${story.title.toUpperCase()}\n`;
    text += `GENRE : ${story.genre} | TONALITÉ : ${story.tone}\n`;
    text += `DATE : ${new Date(story.createdAt).toLocaleDateString('fr-FR')}\n`;
    text += `ACCROCHE (LOGLINE) : ${story.logline}\n`;
    text += `UNIVERS : ${story.worldSetting}\n`;
    if (story.directorVision) {
      text += `VISION DE RÉALISATION : ${story.directorVision}\n`;
    }
    text += `\nPERSONNAGES :\n`;
    story.characters?.forEach((c) => {
      text += `- ${c.name} (${c.role}) : ${c.description} [Motivation: ${c.motivation}]\n`;
    });
    text += `\n================================================================================\n`;
    text += `DÉROULÉ DES CHAPITRES\n`;
    text += `================================================================================\n\n`;

    story.chapters?.forEach((ch) => {
      text += `[CHAPITRE ${ch.chapterNumber}] : ${ch.title.toUpperCase()}\n`;
      if (ch.soundtrackMood) text += `Ambiance sonore : ${ch.soundtrackMood}\n`;
      if (ch.sceneVisualPrompt) text += `Prompt visuel : ${ch.sceneVisualPrompt}\n`;
      text += `\n${ch.narrative}\n\n--------------------------------------------------------------------------------\n\n`;
    });

    if (story.summary) {
      text += `ÉPILOGUE & SYNTHÈSE :\n${story.summary}\n`;
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recit-${story.title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toastSuccess('Fichier téléchargé', `Le récit "${story.title}" a été exporté en .TXT`);
  };

  const handleExportHistoryJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(storyHistory, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `omnistudio-stories-history-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toastSuccess('Historique exporté !', `${storyHistory.length} histoires exportées au format JSON.`);
  };

  // Group transactions by day for the chart
  const chartData = useMemo(() => {
    const daysCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const days: { dateStr: string; label: string; amount: number; count: number }[] = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });

      const dayTxs = transactions.filter((tx) => {
        const txDate = tx.date.split('T')[0];
        return txDate === dateKey && tx.type === 'deduction';
      });

      const amount = dayTxs.reduce((sum, tx) => sum + tx.amount, 0);

      days.push({
        dateStr: dateKey,
        label: dayLabel,
        amount: Math.round(amount * 10) / 10,
        count: dayTxs.length,
      });
    }

    return days;
  }, [transactions, timeRange]);

  const maxDayAmount = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.amount), 5);
    return Math.ceil(max);
  }, [chartData]);

  // Story writing stats
  const narrativeStats = useMemo(() => {
    let totalChapters = 0;
    let totalTension = 0;
    let chaptersWithTension = 0;

    storyHistory.forEach((s) => {
      if (s.chapters) {
        totalChapters += s.chapters.length;
        s.chapters.forEach((ch) => {
          if (ch.tensionLevel) {
            totalTension += ch.tensionLevel;
            chaptersWithTension++;
          }
        });
      }
    });

    const avgTension = chaptersWithTension > 0 ? (totalTension / chaptersWithTension).toFixed(1) : '7.5';
    const totalDeducted = transactions
      .filter((tx) => tx.type === 'deduction')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      totalStories: storyHistory.length,
      totalChapters,
      avgTension,
      totalDeducted: Math.round(totalDeducted * 10) / 10,
    };
  }, [storyHistory, transactions]);

  const handleOpenNowPayments = () => {
    window.open(PRICING_CONFIG.NOWPAYMENTS_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner: Current Balance & Shortcut to Purchase */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-pink-500/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left: Balance info */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Studio d'Écriture & Bibliothèque des Histoires IA</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {user?.credits ?? 500}
              </h1>
              <span className="text-lg font-bold text-slate-400">crédits disponibles</span>
              {user?.isPro && (
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  Membre Pro Actif — Azzoula Ali
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Consultez l'historique complet de vos récits, relisez vos chapitres générés, exportez vos scénarios et suivez votre solde en temps réel.
            </p>
          </div>

          {/* Right: Quick Action Card */}
          <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400 fill-current" />
                Passer au Plan Pro
              </span>
              <span className="text-sm font-black text-amber-400">5 USD / mois</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-tight">
              Obtenez +500 crédits immédiats, débloquez les récits longs multi-actes et téléchargez vos scénarios sans filigrane.
            </p>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleOpenNowPayments}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Souscrire via NOWPayments (5 USD / 6 USD)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Dashboard Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        <button
          type="button"
          onClick={() => setDashboardTab('history')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            dashboardTab === 'history'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-purple-300" />
          <span>Bibliothèque d'Histoires & Scénarios</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-black/40 text-[10px] text-purple-200 border border-white/10">
            {storyHistory.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setDashboardTab('analytics')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            dashboardTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-indigo-300" />
          <span>Statistiques d'Écriture & Crédits</span>
        </button>
      </div>

      {/* TAB 1: STORY LIBRARY & HISTORY */}
      {dashboardTab === 'history' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Search, Filter Bar and Export */}
          <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-white/10 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Rechercher par titre, personnage, mot-clé ou prompt..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
                {historySearch && (
                  <button
                    onClick={() => setHistorySearch('')}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Export JSON Button */}
              <button
                type="button"
                onClick={handleExportHistoryJson}
                disabled={storyHistory.length === 0}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span>Exporter l'Historique (.JSON)</span>
              </button>
            </div>

            {/* Genre Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
              <span className="text-[11px] text-slate-400 font-semibold mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Genre :
              </span>

              {genreFilters.map((c) => {
                const isSelected = selectedGenre === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedGenre(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                        : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>{c.label}</span>
                    <span className="text-[10px] opacity-75">({c.count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stories List */}
          {filteredStories.length === 0 ? (
            <div className="rounded-3xl glass-panel p-12 border border-white/10 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center mx-auto mb-2">
                <Search className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-base font-bold text-slate-300">Aucune histoire trouvée</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {historySearch 
                  ? `Aucun récit ne correspond à "${historySearch}". Réessayez avec un autre terme ou réinitialisez le filtre.` 
                  : 'Aucun récit n\'est disponible dans cette catégorie.'}
              </p>
              {(historySearch || selectedGenre !== 'all') && (
                <button
                  onClick={() => {
                    setHistorySearch('');
                    setSelectedGenre('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredStories.map((story) => {
                const dateObj = new Date(story.createdAt);
                const formattedDate = dateObj.toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const isCopiedPrompt = copiedPromptId === story.id;
                const isCopiedText = copiedTextId === story.id;
                const isExpanded = !!expandedStoryIds[story.id];

                return (
                  <div
                    key={story.id}
                    className="p-5 sm:p-6 rounded-3xl glass-panel border border-white/10 hover:border-purple-500/30 transition-all space-y-5 group"
                  >
                    {/* Header Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 bg-purple-500/20 text-purple-300 border-purple-500/30">
                          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                          <span>Histoire & Scénario IA</span>
                        </span>

                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 border border-white/10 text-[11px] font-semibold text-slate-300">
                          {story.genre}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-semibold text-indigo-300">
                          {story.tone}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {formattedDate}
                        </span>

                        <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-white/10 text-rose-400 font-bold text-[11px]">
                          -{story.creditsUsed || 2} cr
                        </span>
                      </div>
                    </div>

                    {/* Story Title & Logline */}
                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <span>{story.title}</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-white/5">
                        "{story.logline}"
                      </p>
                    </div>

                    {/* Generation Prompt Box with 1-Click Copy */}
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                        <span className="uppercase tracking-wider">Prompt de Génération :</span>
                        <button
                          type="button"
                          onClick={() => handleCopyPrompt(story.id, story.prompt)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {isCopiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopiedPrompt ? 'Copié !' : 'Copier le prompt'}</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-200 font-mono leading-relaxed select-all">
                        "{story.prompt}"
                      </p>
                    </div>

                    {/* Meta Info: World Setting, Director Style & Characters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {story.worldSetting && (
                        <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                            <Compass className="w-3 h-3 text-indigo-400" /> Univers & Décor :
                          </span>
                          <p className="text-slate-200 text-xs">{story.worldSetting}</p>
                        </div>
                      )}

                      {story.directorVision && (
                        <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" /> Vision Réalisation :
                          </span>
                          <p className="text-slate-200 text-xs">{story.directorVision}</p>
                        </div>
                      )}
                    </div>

                    {/* Characters List */}
                    {story.characters && story.characters.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                          <UserIcon className="w-3 h-3 text-purple-400" /> Personnages :
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {story.characters.map((char, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-1 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs"
                            >
                              <strong className="text-purple-300">{char.name}</strong>
                              <span className="text-slate-400 ml-1">({char.role})</span>
                              {char.motivation && (
                                <span className="text-slate-500 text-[10px] ml-1.5">• {char.motivation}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expandable Chapters Breakdown */}
                    {story.chapters && story.chapters.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <button
                          type="button"
                          onClick={() => toggleExpandStory(story.id)}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-purple-400" />
                            <span>
                              {isExpanded ? 'Masquer les chapitres' : `Lire les ${story.chapters.length} chapitres du récit`}
                            </span>
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>

                        {isExpanded && (
                          <div className="space-y-4 pt-2 animate-in fade-in">
                            {story.chapters.map((ch) => (
                              <div
                                key={ch.chapterNumber}
                                className="p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/5">
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center">
                                      {ch.chapterNumber}
                                    </span>
                                    <h4 className="font-bold text-sm text-white">{ch.title}</h4>
                                  </div>

                                  <div className="flex items-center gap-2 text-[10px]">
                                    {ch.soundtrackMood && (
                                      <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-white/5 text-slate-400">
                                        🎵 {ch.soundtrackMood}
                                      </span>
                                    )}
                                    {ch.tensionLevel && (
                                      <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-1 font-semibold">
                                        <Flame className="w-3 h-3 text-rose-400" />
                                        Tension {ch.tensionLevel}/10
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-serif">
                                  {ch.narrative}
                                </p>

                                {ch.sceneVisualPrompt && (
                                  <div className="text-[10px] text-slate-500 font-mono bg-slate-900/60 p-2 rounded-lg border border-white/5">
                                    <strong className="text-slate-400">Prompt visuel :</strong> {ch.sceneVisualPrompt}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyFullText(story.id, story)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {isCopiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                          <span>{isCopiedText ? 'Texte copié !' : 'Copier le texte complet'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExportStoryTxt(story)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-purple-400" />
                          <span>Exporter (.TXT)</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteStoryGeneration(story.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Supprimer ce récit de l'historique"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: ANALYTICS & CONSUMPTION */}
      {dashboardTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in">
          
          {/* KPI Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Total Consommé
              </span>
              <div className="text-2xl font-black text-white">
                {narrativeStats.totalDeducted} <span className="text-xs text-slate-400 font-normal">cr</span>
              </div>
              <span className="text-[10px] text-slate-500">Depuis l'ouverture du compte</span>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                Récits & Scénarios
              </span>
              <div className="text-2xl font-black text-white">
                {narrativeStats.totalStories} <span className="text-xs text-slate-400 font-normal">projets</span>
              </div>
              <span className="text-[10px] text-purple-300 font-medium">
                100% créations narratives
              </span>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Chapitres Écrits
              </span>
              <div className="text-2xl font-black text-white">
                {narrativeStats.totalChapters} <span className="text-xs text-slate-400 font-normal">chapitres</span>
              </div>
              <span className="text-[10px] text-indigo-300 font-medium">
                Structure multi-actes
              </span>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                Tension Dramatique
              </span>
              <div className="text-2xl font-black text-white">
                {narrativeStats.avgTension} <span className="text-xs text-slate-400 font-normal">/ 10</span>
              </div>
              <span className="text-[10px] text-rose-300 font-medium">
                Intensité moyenne
              </span>
            </div>

          </div>

          {/* Historical Usage Chart Section */}
          <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 space-y-6">
            
            {/* Chart Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Consommation Historique des Crédits
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Évolution journalière de vos générations d'histoires et scénarios IA.
                </p>
              </div>

              <div className="flex rounded-xl bg-slate-900 p-1 border border-white/5">
                {(['7d', '14d', '30d'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTimeRange(r)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      timeRange === r ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Bar Chart */}
            <div className="pt-4">
              <div className="h-56 flex items-end justify-between gap-2 sm:gap-3 px-2">
                {chartData.map((day) => {
                  const heightPercent = maxDayAmount > 0 ? (day.amount / maxDayAmount) * 100 : 0;
                  const isHovered = hoveredDay?.date === day.dateStr;

                  return (
                    <div
                      key={day.dateStr}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                      onMouseEnter={() => setHoveredDay({ date: day.dateStr, amount: day.amount, count: day.count })}
                      onMouseLeave={() => setHoveredDay(null)}
                    >
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div className="absolute -top-16 z-20 px-3 py-1.5 rounded-xl bg-slate-900 text-white border border-indigo-500/40 shadow-xl text-center whitespace-nowrap pointer-events-none animate-in fade-in">
                          <p className="font-bold text-xs text-indigo-300">{day.amount} cr consommés</p>
                          <p className="text-[10px] text-slate-400">{day.count} action(s) le {day.dateStr}</p>
                        </div>
                      )}

                      {/* Value tag */}
                      <span className="text-[10px] font-mono text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {day.amount > 0 ? `${day.amount}` : ''}
                      </span>

                      {/* Bar */}
                      <div className="w-full max-w-[48px] bg-slate-900/60 rounded-t-xl overflow-hidden flex items-end h-full">
                        <div
                          className={`w-full rounded-t-xl transition-all duration-300 ${
                            isHovered
                              ? 'bg-gradient-to-t from-indigo-500 to-pink-500 shadow-lg shadow-indigo-500/50'
                              : day.amount > 0
                              ? 'bg-gradient-to-t from-indigo-600 to-purple-500'
                              : 'bg-slate-800/40'
                          }`}
                          style={{ height: `${Math.max(heightPercent, 6)}%` }}
                        />
                      </div>

                      {/* Label */}
                      <span className="text-[10px] text-slate-500 mt-2 truncate w-full text-center">
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Audit Transactions Table */}
          <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Journal des Opérations & Transactions
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="pb-3 font-semibold">Description</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold text-right">Crédits</th>
                    <th className="pb-3 font-semibold text-right">Solde Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.slice(0, 15).map((tx) => {
                    const isAdd = tx.type === 'addition';
                    return (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 font-medium text-white flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isAdd ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {isAdd ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </div>
                          <span className="truncate max-w-xs">{tx.actionName}</span>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-white/10 text-[10px] text-slate-300">
                            {tx.category === 'story'
                              ? 'Histoire IA'
                              : tx.category === 'subscription'
                              ? 'Abonnement'
                              : 'Crédit'}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400">
                          {new Date(tx.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className={`py-3 text-right font-bold ${isAdd ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isAdd ? `+${tx.amount}` : `-${tx.amount}`} cr
                        </td>
                        <td className="py-3 text-right text-slate-300 font-mono">
                          {tx.balanceAfter} cr
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Shortcut Callout Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-pink-500/10 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Besoin de plus d'inspiration pour vos récits ?
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Lancez un nouveau scénario dans le Studio Flare ou rechargez vos crédits en un clic.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNowPayments}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer"
        >
          Recharger mes crédits (5$)
        </button>
      </div>

    </div>
  );
};
