import React, { useState } from 'react';
import { Sparkles, Download, Copy, Check, Eye, Wand2, RefreshCw, AlertCircle, Image as ImageIcon, Coins, Crown, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PRICING_CONFIG, ImageGeneration } from '../types';
import { downloadImageWithWatermark } from '../utils/watermark';

const STYLES = [
  { id: 'Cinematic', label: 'Cinématique', desc: 'Éclairage volumétrique, 35mm lens' },
  { id: 'Photorealistic', label: 'Photoréaliste', desc: 'Détails 8K, texture ultra-nette' },
  { id: 'Cyberpunk', label: 'Cyberpunk', desc: 'Néons futuristes, reflets de pluie' },
  { id: '3D Render', label: '3D Disney / Pixar', desc: 'Animation 3D douce et vibrante' },
  { id: 'Anime Manga', label: 'Anime Studio Ghibli', desc: 'Aquarelle poétique japonaise' },
  { id: 'Digital Art', label: 'Art Numérique Fantasy', desc: 'Peinture épique concept art' },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Carré', desc: 'Instagram, Avatar' },
  { id: '16:9', label: '16:9 Paysage', desc: 'YouTube, Fond d\'écran' },
  { id: '9:16', label: '9:16 Portrait', desc: 'TikTok, Reels, Story' },
  { id: '4:3', label: '4:3 Classique', desc: 'Format standard' },
];

const QUICK_PROMPTS = [
  'Un renard cosmique aux yeux étincelants marchant sur les anneaux de Saturne, nébuleuse violette et dorée',
  'Portrait cyberpunk d\'une femme aux cheveux néon bleu sous une pluie tokyoïte avec reflets holographiques',
  'Un café chaleureux dans les ruelles pavées de Paris au coucher du soleil, style peinture à l\'huile impressionniste',
  'Un robot vintage préparant un cappuccino avec de la vapeur volumétrique, studio d\'art 3D ultra détaillé',
];

export const TextToImageStudio: React.FC = () => {
  const { user, deductCredits, addImageGeneration, imageHistory, openSubscriptionModal } = useAuth();
  const { success: toastSuccess, info: toastInfo } = useToast();
  
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Cinematic');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [showNegative, setShowNegative] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<ImageGeneration | null>(null);
  const [copied, setCopied] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const cost = PRICING_CONFIG.CREDIT_COSTS.TEXT_TO_IMAGE;

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setEnhancing(true);
    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'image', style: selectedStyle }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Veuillez entrer une description pour votre image.');
      return;
    }
    setError(null);

    // Verify and deduct credits
    const hasCredits = deductCredits(cost, `Génération Image : ${prompt.slice(0, 28)}...`, 'image');
    if (!hasCredits) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio: selectedRatio,
          style: selectedStyle,
          negativePrompt: showNegative ? negativePrompt : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Erreur lors de la génération.');
      }

      const newGen: ImageGeneration = {
        id: 'img_' + Date.now(),
        prompt,
        revisedPrompt: data.revisedPrompt,
        style: selectedStyle,
        aspectRatio: selectedRatio,
        imageUrl: data.imageUrl,
        createdAt: new Date().toISOString(),
        creditsUsed: cost,
      };

      setCurrentResult(newGen);
      addImageGeneration(newGen);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la génération d\'image.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async (dataUrl: string, filename = 'omnistudio-image.png') => {
    try {
      await downloadImageWithWatermark(dataUrl, !!user?.isPro, filename);
      toastSuccess(
        'Image téléchargée !',
        user?.isPro ? 'Version haute résolution sans filigrane enregistrée.' : 'Fichier enregistré avec filigrane Plan Free.',
        'sparkles'
      );
    } catch (err) {
      console.error('Download error:', err);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Studio Header Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Moteur Visuel Haute Définition</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Studio <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Texte vers Image</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Transformez vos descriptions en images stupéfiantes avec l'assistance de l'Agent IA. Coût par image : <strong>{cost} crédits</strong>.
          </p>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Generator Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-white/10 space-y-5">
            
            {/* Prompt Input Box */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Description de l'image (Prompt)
                </label>
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  disabled={enhancing || !prompt.trim()}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-40 transition-colors font-medium cursor-pointer"
                  title="L'Agent IA reformule votre prompt pour un résultat optimal"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${enhancing ? 'animate-spin' : ''}`} />
                  <span>{enhancing ? 'Optimisation par Nova...' : '✨ Booster le prompt avec l\'IA'}</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Décrivez votre image dans les moindres détails (sujet, éclairage, atmosphère, arrière-plan)..."
                  rows={4}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
                />
              </div>

              {/* Quick inspiration chips */}
              <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                <span className="text-slate-500 shrink-0">Inspirations :</span>
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(qp)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/5 truncate max-w-xs transition-colors shrink-0"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2.5">
                Style Artistique
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STYLES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStyle(st.id)}
                    className={`text-left p-3 rounded-2xl border transition-all ${
                      selectedStyle === st.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-xs font-bold text-white">{st.label}</span>
                    <span className="text-[10px] text-slate-400 block line-clamp-1">{st.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2.5">
                Format & Ratio
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setSelectedRatio(ratio.id)}
                    className={`text-center p-3 rounded-2xl border transition-all ${
                      selectedRatio === ratio.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-xs font-bold text-white">{ratio.label}</span>
                    <span className="text-[10px] text-slate-400 block">{ratio.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Prompt Collapsible */}
            <div>
              <button
                type="button"
                onClick={() => setShowNegative(!showNegative)}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 font-medium"
              >
                <span>{showNegative ? '− Masquer le prompt négatif' : '+ Ajouter un prompt négatif (éléments à exclure)'}</span>
              </button>

              {showNegative && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="Ex: flou, basse qualité, déformé, filigrane, texte..."
                    className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}
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
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer group"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Génération de l'image en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                    <span>Générer l'Image</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-black/30 text-indigo-200 text-xs font-semibold border border-white/10 flex items-center gap-1">
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
                  className="text-xs text-amber-400 hover:underline shrink-0"
                >
                  Crédits insuffisants ? Passer Pro (5$)
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Active Preview & High-Res Viewer */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-white/10 flex flex-col justify-between min-h-[460px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                Rendu Actuel
              </h3>
              {currentResult && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Généré avec succès
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-slate-900/60 border border-dashed border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-4 animate-pulse">
                  <Wand2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
                <p className="text-sm font-semibold text-white">Génération haute fidélité...</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Notre modèle applique l'éclairage, la composition et le style {selectedStyle}.
                </p>
              </div>
            ) : currentResult ? (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="relative group rounded-2xl overflow-hidden bg-slate-900 border border-white/10 aspect-square flex items-center justify-center">
                  <img
                    src={currentResult.imageUrl}
                    alt={currentResult.prompt}
                    className="w-full h-full object-contain cursor-pointer transition-transform group-hover:scale-105 duration-300"
                    onClick={() => setLightboxImage(currentResult.imageUrl)}
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => setLightboxImage(currentResult.imageUrl)}
                      className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-transform hover:scale-110"
                      title="Plein écran"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDownload(currentResult.imageUrl)}
                      className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white backdrop-blur-md shadow-lg transition-transform hover:scale-110"
                      title="Télécharger l'image"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Style: <strong>{currentResult.style}</strong> ({currentResult.aspectRatio})</span>
                    <button
                      onClick={() => handleCopyPrompt(currentResult.prompt)}
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copié' : 'Copier le prompt'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 italic">
                    "{currentResult.prompt}"
                  </p>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <div className="text-[11px]">
                      {user?.isPro ? (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5 fill-current" />
                          Rendu HD sans filigrane (Pro VIP)
                        </span>
                      ) : (
                        <span className="text-amber-300/80 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          Filigrane Plan Free inclus
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDownload(currentResult.imageUrl, `omnistudio-${currentResult.id}.png`)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger {user?.isPro ? 'PNG' : '(avec filigrane)'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-slate-900/40 border border-dashed border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center mb-4">
                  <ImageIcon className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-sm font-medium text-slate-300">Aucune image générée pour le moment</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Saisissez un prompt ou choisissez une inspiration à gauche puis cliquez sur Générer.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* History Gallery */}
      {imageHistory.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Vos Créations Récentes ({imageHistory.length})
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {imageHistory.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden glass-panel border border-white/10 aspect-square cursor-pointer"
                onClick={() => setLightboxImage(item.imageUrl)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.prompt}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                  <p className="text-[10px] text-white line-clamp-2 font-medium">{item.prompt}</p>
                  <span className="text-[9px] text-slate-400 mt-1 block">{item.style}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden glass-panel border border-white/20 p-2" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage}
              alt="Zoom"
              className="max-h-[80vh] w-auto object-contain rounded-2xl mx-auto"
            />
            <div className="mt-3 flex items-center justify-between px-3">
              <button
                onClick={() => handleDownload(lightboxImage)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{user?.isPro ? 'Télécharger PNG HD (Sans filigrane)' : 'Télécharger PNG (Avec filigrane Plan Free)'}</span>
              </button>

              <button
                onClick={() => setLightboxImage(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
