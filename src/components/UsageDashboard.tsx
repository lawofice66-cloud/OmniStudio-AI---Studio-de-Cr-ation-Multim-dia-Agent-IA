import React, { useState, useMemo } from 'react';
import { 
  Coins, 
  TrendingUp, 
  BarChart3, 
  Sparkles, 
  Crown, 
  ExternalLink, 
  Zap, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Mic, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Layers,
  History,
  Search,
  Copy,
  Check,
  Download,
  BookOpen,
  Music,
  FileText,
  Filter,
  Eye,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PRICING_CONFIG } from '../types';

export interface ProjectHistoryItem {
  id: string;
  category: 'image' | 'video' | 'story' | 'music' | 'transcribe';
  categoryLabel: string;
  title: string;
  prompt: string;
  createdAt: string;
  creditsUsed: number;
  metadata: Record<string, string | undefined>;
  thumbnailUrl?: string;
  mediaUrl?: string;
}

export const UsageDashboard: React.FC = () => {
  const { 
    user, 
    transactions, 
    imageHistory, 
    videoHistory, 
    storyHistory, 
    musicHistory, 
    transcriptionHistory, 
    openSubscriptionModal, 
    upgradeToPro 
  } = useAuth();

  const { success: toastSuccess, info: toastInfo } = useToast();

  // Main Dashboard Tab: 'analytics' vs 'history'
  const [dashboardTab, setDashboardTab] = useState<'analytics' | 'history'>('history');

  // Analytics states
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [hoveredDay, setHoveredDay] = useState<{ date: string; amount: number; count: number } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [quickTopupSuccess, setQuickTopupSuccess] = useState(false);

  // Project History states
  const [historySearch, setHistorySearch] = useState('');
  const [historyCategory, setHistoryCategory] = useState<'all' | 'image' | 'video' | 'story' | 'music' | 'transcribe'>('all');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Aggregated Project History items
  const allProjects = useMemo<ProjectHistoryItem[]>(() => {
    const list: ProjectHistoryItem[] = [];

    imageHistory.forEach((img) => {
      list.push({
        id: img.id,
        category: 'image',
        categoryLabel: 'Texte vers Image',
        title: img.prompt.slice(0, 48) + (img.prompt.length > 48 ? '...' : ''),
        prompt: img.prompt,
        createdAt: img.createdAt,
        creditsUsed: img.creditsUsed || 2,
        metadata: {
          'Style': img.style,
          'Format': img.aspectRatio,
        },
        thumbnailUrl: img.imageUrl,
        mediaUrl: img.imageUrl,
      });
    });

    videoHistory.forEach((vid) => {
      list.push({
        id: vid.id,
        category: 'video',
        categoryLabel: 'Texte vers Vidéo',
        title: vid.storyboard?.title || (vid.prompt.slice(0, 48) + '...'),
        prompt: vid.prompt,
        createdAt: vid.createdAt,
        creditsUsed: vid.creditsUsed || 5,
        metadata: {
          'Caméra': vid.cameraMovement,
          'Style': vid.style,
          'Durée': vid.duration,
          'Format': vid.aspectRatio,
        },
        thumbnailUrl: vid.videoUrl,
        mediaUrl: vid.videoUrl,
      });
    });

    storyHistory.forEach((sty) => {
      list.push({
        id: sty.id,
        category: 'story',
        categoryLabel: 'Histoire IA',
        title: sty.title || (sty.prompt.slice(0, 48) + '...'),
        prompt: sty.prompt,
        createdAt: sty.createdAt,
        creditsUsed: sty.creditsUsed || 2,
        metadata: {
          'Genre': sty.genre,
          'Tonalité': sty.tone,
          'Chapitres': `${sty.chapters?.length || 3} chapitres`,
        },
      });
    });

    musicHistory.forEach((mus) => {
      list.push({
        id: mus.id,
        category: 'music',
        categoryLabel: 'Générateur de Sons IA',
        title: mus.title || (mus.prompt.slice(0, 48) + '...'),
        prompt: mus.prompt,
        createdAt: mus.createdAt,
        creditsUsed: mus.creditsUsed || 3,
        metadata: {
          'Type de Son': mus.style,
          'Ambiance': mus.mood,
          'Modèle Audio': mus.model,
          'Durée': mus.duration,
        },
        mediaUrl: mus.audioUrl,
      });
    });

    transcriptionHistory.forEach((tr) => {
      list.push({
        id: tr.id,
        category: 'transcribe',
        categoryLabel: 'Transcription Audio',
        title: tr.fileName,
        prompt: tr.transcription.slice(0, 150) + '...',
        createdAt: tr.createdAt,
        creditsUsed: tr.creditsUsed || 1,
        metadata: {
          'Fichier source': tr.fileName,
          'Durée audio': tr.audioDuration || 'Audio indexé',
        },
      });
    });

    // Sort descending by creation date
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [imageHistory, videoHistory, storyHistory, musicHistory, transcriptionHistory]);

  // Filtered Project History items
  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      const matchCategory = historyCategory === 'all' || p.category === historyCategory;
      const q = historySearch.toLowerCase().trim();
      const matchSearch = !q || 
        p.prompt.toLowerCase().includes(q) || 
        p.title.toLowerCase().includes(q) ||
        Object.values(p.metadata).some((v) => v?.toLowerCase().includes(q));

      return matchCategory && matchSearch;
    });
  }, [allProjects, historyCategory, historySearch]);

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    toastInfo('Prompt copié !', 'Le prompt a été copié dans votre presse-papiers.');
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleExportHistoryJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allProjects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `omnistudio-project-history-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toastSuccess('Historique exporté !', `${allProjects.length} projets exportés au format JSON.`);
  };

  // Group transactions by day for the chart
  const chartData = useMemo(() => {
    const daysCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const days: { dateStr: string; label: string; amount: number; count: number; byCat: Record<string, number> }[] = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });

      const dayTxs = transactions.filter((tx) => {
        const txDate = tx.date.split('T')[0];
        const matchCat = categoryFilter === 'all' || tx.category === categoryFilter;
        return txDate === dateKey && tx.type === 'deduction' && matchCat;
      });

      const amount = dayTxs.reduce((sum, tx) => sum + tx.amount, 0);
      const byCat: Record<string, number> = {};
      dayTxs.forEach((tx) => {
        byCat[tx.category] = (byCat[tx.category] || 0) + tx.amount;
      });

      days.push({
        dateStr: dateKey,
        label: dayLabel,
        amount: Math.round(amount * 10) / 10,
        count: dayTxs.length,
        byCat,
      });
    }

    return days;
  }, [transactions, timeRange, categoryFilter]);

  const maxDayAmount = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.amount), 5);
    return Math.ceil(max);
  }, [chartData]);

  const categoryStats = useMemo(() => {
    const totals: Record<string, number> = {
      image: 0,
      video: 0,
      transcribe: 0,
      agent: 0,
    };
    let totalDeducted = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'deduction' && totals[tx.category] !== undefined) {
        totals[tx.category] += tx.amount;
        totalDeducted += tx.amount;
      }
    });

    return {
      totals,
      totalDeducted: Math.round(totalDeducted * 10) / 10,
      imagePct: totalDeducted > 0 ? Math.round((totals.image / totalDeducted) * 100) : 0,
      videoPct: totalDeducted > 0 ? Math.round((totals.video / totalDeducted) * 100) : 0,
      transcribePct: totalDeducted > 0 ? Math.round((totals.transcribe / totalDeducted) * 100) : 0,
      agentPct: totalDeducted > 0 ? Math.round((totals.agent / totalDeducted) * 100) : 0,
    };
  }, [transactions]);

  const handleOpenNowPayments = () => {
    window.open(PRICING_CONFIG.NOWPAYMENTS_URL, '_blank', 'noopener,noreferrer');
  };

  const handleQuickActivate = () => {
    upgradeToPro();
    setQuickTopupSuccess(true);
    setTimeout(() => setQuickTopupSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner: Current Balance & Shortcut to Purchase */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/15 via-purple-500/10 to-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left: Balance info */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tableau de Bord, Historique & Gestion des Crédits</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {user?.credits ?? 0}
              </h1>
              <span className="text-lg font-bold text-slate-400">crédits disponibles</span>
              {user?.isPro && (
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  Membre Pro Actif
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Consultez l'historique complet de vos prompts, auditez vos dépenses en temps réel et rechargez vos crédits instantanément via NOWPayments.
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
              Obtenez +500 crédits immédiats, débloquez l'Agent IA illimité et téléchargez vos créations sans filigrane.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleOpenNowPayments}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Payer 5$</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={handleQuickActivate}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Activer mon statut Pro"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Activer Pro</span>
              </button>
            </div>

            {quickTopupSuccess && (
              <p className="text-[11px] text-emerald-400 font-semibold text-center animate-pulse">
                ✨ Statut Pro activé ! +500 crédits ajoutés à votre compte.
              </p>
            )}
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
          <History className="w-4 h-4 text-purple-300" />
          <span>Project History (Historique des Projets)</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-black/40 text-[10px] text-purple-200 border border-white/10">
            {allProjects.length}
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
          <span>Consommation & Statistiques</span>
        </button>
      </div>

      {/* TAB 1: PROJECT HISTORY */}
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
                  placeholder="Rechercher par mot-clé dans les prompts passés..."
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
                disabled={allProjects.length === 0}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exporter l'Historique (.JSON)</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
              <span className="text-[11px] text-slate-400 font-semibold mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filtre :
              </span>

              {[
                { id: 'all', label: 'Tous les projets', count: allProjects.length },
                { id: 'image', label: 'Images', count: imageHistory.length, icon: ImageIcon },
                { id: 'video', label: 'Vidéos', count: videoHistory.length, icon: VideoIcon },
                { id: 'story', label: 'Histoires', count: storyHistory.length, icon: BookOpen },
                { id: 'music', label: 'Sons & Audio', count: musicHistory.length, icon: Music },
                { id: 'transcribe', label: 'Transcriptions', count: transcriptionHistory.length, icon: Mic },
              ].map((c) => {
                const IconComponent = c.icon;
                const isSelected = historyCategory === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setHistoryCategory(c.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                        : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {IconComponent && <IconComponent className="w-3 h-3" />}
                    <span>{c.label}</span>
                    <span className="text-[10px] opacity-75">({c.count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Projects List */}
          {filteredProjects.length === 0 ? (
            <div className="rounded-3xl glass-panel p-12 border border-white/10 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center mx-auto mb-2">
                <Search className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-base font-bold text-slate-300">Aucun projet trouvé</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {historySearch 
                  ? `Aucun projet ne correspond à "${historySearch}". Essayez un autre mot-clé ou réinitialisez le filtre.` 
                  : 'Aucune génération n\'a encore été effectuée dans cette catégorie.'}
              </p>
              {historySearch && (
                <button
                  onClick={() => {
                    setHistorySearch('');
                    setHistoryCategory('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project) => {
                const dateObj = new Date(project.createdAt);
                const formattedDate = dateObj.toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const isCopied = copiedPromptId === project.id;

                return (
                  <div
                    key={project.id}
                    className="p-5 sm:p-6 rounded-3xl glass-panel border border-white/10 hover:border-purple-500/30 transition-all space-y-4 group"
                  >
                    {/* Header Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                          project.category === 'image'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : project.category === 'video'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : project.category === 'story'
                            ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                            : project.category === 'music'
                            ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {project.category === 'image' && <ImageIcon className="w-3 h-3" />}
                          {project.category === 'video' && <VideoIcon className="w-3 h-3" />}
                          {project.category === 'story' && <BookOpen className="w-3 h-3" />}
                          {project.category === 'music' && <Music className="w-3 h-3" />}
                          {project.category === 'transcribe' && <Mic className="w-3 h-3" />}
                          <span>{project.categoryLabel}</span>
                        </span>

                        <span className="text-xs font-bold text-white truncate max-w-sm">
                          {project.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {formattedDate}
                        </span>

                        <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-white/10 text-rose-400 font-bold text-[11px]">
                          -{project.creditsUsed} cr
                        </span>
                      </div>
                    </div>

                    {/* Exact Prompt Box with 1-Click Copy */}
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                        <span className="uppercase tracking-wider">Prompt de Génération :</span>
                        <button
                          type="button"
                          onClick={() => handleCopyPrompt(project.id, project.prompt)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'Copié !' : 'Copier le prompt'}</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-200 font-mono leading-relaxed select-all">
                        "{project.prompt}"
                      </p>
                    </div>

                    {/* Metadata tags & Thumbnail Preview */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      
                      {/* Parameter tags */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {Object.entries(project.metadata).map(([key, value]) => {
                          if (!value) return null;
                          return (
                            <span
                              key={key}
                              className="px-2.5 py-1 rounded-lg bg-slate-900/60 border border-white/5 text-[10px] text-slate-300"
                            >
                              <strong className="text-slate-400 font-medium">{key}:</strong> {value}
                            </span>
                          );
                        })}
                      </div>

                      {/* Optional media link / preview */}
                      {project.thumbnailUrl && project.category === 'image' && (
                        <div className="flex items-center gap-2">
                          <img
                            src={project.thumbnailUrl}
                            alt="Preview"
                            className="w-8 h-8 rounded-lg object-cover border border-white/10"
                          />
                          <a
                            href={project.thumbnailUrl}
                            download="image.png"
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Image HD</span>
                          </a>
                        </div>
                      )}

                      {project.mediaUrl && project.category === 'video' && (
                        <a
                          href={project.mediaUrl}
                          download="video.mp4"
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-purple-400 hover:underline flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Vidéo MP4</span>
                        </a>
                      )}
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
                {categoryStats.totalDeducted} <span className="text-xs text-slate-400 font-normal">cr</span>
              </div>
              <span className="text-[10px] text-slate-500">Depuis l'ouverture du compte</span>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                Texte vers Image
              </span>
              <div className="text-2xl font-black text-white">
                {categoryStats.totals.image} <span className="text-xs text-slate-400 font-normal">cr</span>
              </div>
              <span className="text-[10px] text-indigo-300 font-medium">
                {categoryStats.imagePct}% de votre utilisation
              </span>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <VideoIcon className="w-3.5 h-3.5 text-purple-400" />
                Texte vers Vidéo
              </span>
              <div className="text-2xl font-black text-white">
                {categoryStats.totals.video} <span className="text-xs text-slate-400 font-normal">cr</span>
              </div>
              <span className="text-[10px] text-purple-300 font-medium">
                {categoryStats.videoPct}% de votre utilisation
              </span>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                Transcription Audio
              </span>
              <div className="text-2xl font-black text-white">
                {categoryStats.totals.transcribe} <span className="text-xs text-slate-400 font-normal">cr</span>
              </div>
              <span className="text-[10px] text-emerald-300 font-medium">
                {categoryStats.transcribePct}% de votre utilisation
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
                  Évolution journalière de vos générations et requêtes IA.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Toutes fonctionnalités</option>
                  <option value="image">Texte vers Image</option>
                  <option value="video">Texte vers Vidéo</option>
                  <option value="transcribe">Transcription Audio</option>
                  <option value="agent">Agent IA Nova</option>
                </select>

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
                          style={{ height: `${Math.max(6, heightPercent)}%` }}
                        />
                      </div>

                      {/* Label */}
                      <span className="text-[10px] text-slate-400 mt-2 font-medium truncate max-w-full">
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Transaction & Activity Feed */}
          <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Journal des Transactions & Déductions ({transactions.length})
              </h3>
              <span className="text-xs text-slate-400">Temps réel</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 pb-2">
                    <th className="pb-3 font-semibold">Action / Description</th>
                    <th className="pb-3 font-semibold">Catégorie</th>
                    <th className="pb-3 font-semibold">Date & Heure</th>
                    <th className="pb-3 font-semibold text-right">Crédits</th>
                    <th className="pb-3 font-semibold text-right">Solde Restant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.slice(0, 10).map((tx) => {
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
                            {tx.category === 'image'
                              ? 'Image'
                              : tx.category === 'video'
                              ? 'Vidéo'
                              : tx.category === 'transcribe'
                              ? 'Audio'
                              : tx.category === 'story'
                              ? 'Histoire'
                              : tx.category === 'music'
                              ? 'Musique'
                              : tx.category === 'agent'
                              ? 'Agent IA'
                              : tx.category === 'subscription'
                              ? 'Abonnement'
                              : 'Bonus'}
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
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-red-500/10 to-indigo-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 fill-current" />
            Besoin de plus de crédits pour vos créations ?
          </h4>
          <p className="text-xs text-slate-300 mt-1">
            Passez au Plan Pro pour 5 USD / mois (500 crédits immédiats). Moyens acceptés : <strong>RedotPay Visa Card (lawofice66@gmail.com)</strong> & NOWPayments.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={openSubscriptionModal}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Paiement RedotPay & Offres
          </button>
          <button
            onClick={handleOpenNowPayments}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Payer 5 USD (NOWPayments)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
