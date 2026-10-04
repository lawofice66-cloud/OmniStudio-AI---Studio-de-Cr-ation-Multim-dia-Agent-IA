import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Download, Sparkles, Video as VideoIcon, Film, Clapperboard, Camera, Wand2, RefreshCw, AlertCircle, Coins, Maximize2, Crown, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PRICING_CONFIG, VideoGeneration } from '../types';
import { downloadTextWithWatermark } from '../utils/watermark';

const CAMERA_MOVEMENTS = [
  { id: 'Cinematic Pan', label: 'Panoramique Cinéma', desc: 'Mouvement horizontal lent et fluide' },
  { id: 'Dolly Forward', label: 'Travelling Avant (Dolly)', desc: 'Rapprochement immersif vers le sujet' },
  { id: 'Drone FPV', label: 'Vue Aérienne Drone', desc: 'Plongée cinématique et survol dynamique' },
  { id: 'Orbit 360', label: 'Orbite 360°', desc: 'Rotation fluide autour du sujet' },
  { id: 'Slow Push-in', label: 'Zoom Progressif Dramatique', desc: 'Focalisation intense sur le climax' },
];

const VIDEO_STYLES = [
  { id: 'Hyper-Realistic', label: 'Photoréalisme 8K', desc: 'Style documentaire cinéma de haute précision' },
  { id: 'Sci-Fi Cyberpunk', label: 'Sci-Fi Néo-Tokyo', desc: 'Ambiance néon, reflets et technologies futures' },
  { id: 'Animation 3D', label: 'Animation 3D Pixar', desc: 'Univers chaleureux, textures soignées' },
  { id: 'Film Noir Vintage', label: 'Cinéma Noir & Blanc', desc: 'Fort contraste, ombres portées et mystère' },
  { id: 'Drone Nature Epic', label: 'Grands Espaces Nature', desc: 'Panoramas épiques à couper le souffle' },
];

const QUICK_VIDEO_IDEAS = [
  'Survol en drone d\'une métropole futuriste flottante au-dessus des nuages au coucher du soleil',
  'Travelling avant dans une forêt bioluminescente féerique avec spores lumineuses flottantes',
  'Voiture de sport vintage filant à toute vitesse le long d\'une côte californienne sous la pluie néon',
  'Gros plan cinématique sur un œil mécanique révélant des circuits dorés et des reflets d\'étoiles',
];

const DEFAULT_SAMPLE_VIDEO: VideoGeneration = {
  id: 'vid_sample_default',
  prompt: 'Travelling avant cinématique le long d\'une avenue de Néo-Tokyo sous une pluie battante, reflets néon sur l\'asphalte mouillé',
  cameraMovement: 'Cinematic Pan',
  duration: '5s',
  style: 'Sci-Fi Cyberpunk',
  aspectRatio: '16:9',
  videoUrl: 'https://assets.mixkit.co/videos/41584/41584-720.mp4',
  storyboard: {
    title: 'Néo-Tokyo 2099 : Course d\'Ombres',
    synopsis: 'Travelling ultra-fluide dans les rues cyberpunk sous la pluie avec reflets holographiques',
    shots: [
      { shotNumber: 1, camera: 'Plongeon vertical depuis les gratte-ciel vers l\'avenue baignée de néons', visualDescription: 'Lueurs néon cyan et reflets d\'eau sur l\'asphalte', lighting: 'Néon cyan volumétrique', colorPalette: ['#0f172a', '#1e1b4b', '#4338ca'], duration: '2s' },
      { shotNumber: 2, camera: 'Travelling avant rapide au ras du bitume', visualDescription: 'Faisceaux de phares dorés et étincelles de vitesse', lighting: 'Phares dorés et pluie', colorPalette: ['#1e1b4b', '#4f46e5', '#a855f7'], duration: '3s' },
    ],
    audioDesign: { sfx: 'Pluie battante et vrombissement de moteur électrique', musicMood: 'Synthwave futuriste' }
  },
  createdAt: new Date().toISOString(),
  creditsUsed: 5,
};

export const TextToVideoStudio: React.FC = () => {
  const { user, deductCredits, addVideoGeneration, videoHistory, openSubscriptionModal } = useAuth();
  const { success: toastSuccess } = useToast();

  const [prompt, setPrompt] = useState('');
  const [selectedCamera, setSelectedCamera] = useState('Cinematic Pan');
  const [selectedStyle, setSelectedStyle] = useState('Hyper-Realistic');
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const [duration, setDuration] = useState('5s');

  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState<VideoGeneration>(DEFAULT_SAMPLE_VIDEO);

  // Video element ref
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const cost = PRICING_CONFIG.CREDIT_COSTS.TEXT_TO_VIDEO;

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setEnhancing(true);
    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'video', style: selectedStyle }),
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
      setError('Veuillez entrer une description pour votre vidéo.');
      return;
    }
    setError(null);

    const hasCredits = deductCredits(cost, `Génération Vidéo : ${prompt.slice(0, 28)}...`, 'video');
    if (!hasCredits) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          cameraMovement: selectedCamera,
          style: selectedStyle,
          duration,
          aspectRatio: selectedRatio,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Erreur lors de la génération vidéo.');
      }

      const newVideo: VideoGeneration = {
        id: 'vid_' + Date.now(),
        prompt,
        cameraMovement: selectedCamera,
        duration,
        style: selectedStyle,
        aspectRatio: selectedRatio,
        videoUrl: data.videoUrl || 'https://assets.mixkit.co/videos/41584/41584-720.mp4',
        storyboard: data.storyboard,
        createdAt: new Date().toISOString(),
        creditsUsed: cost,
      };

      setCurrentVideo(newVideo);
      addVideoGeneration(newVideo);
      setIsPlaying(true);
      setPlaybackProgress(0);
      setCurrentShotIndex(0);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la génération de la vidéo.');
    } finally {
      setLoading(false);
    }
  };

  // Canvas visual motion renderer for the video scenes
  useEffect(() => {
    let startTime: number | null = null;
    const totalDurationMs = duration === '3s' ? 3000 : duration === '10s' ? 10000 : 5000;

    const renderFrame = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / totalDurationMs);
      setPlaybackProgress(progress);

      const canvas = canvasRef.current;
      if (canvas && currentVideo?.storyboard?.shots) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;
          const shots = currentVideo.storyboard.shots;
          const shotIndex = Math.min(shots.length - 1, Math.floor(progress * shots.length));
          setCurrentShotIndex(shotIndex);
          const currentShot = shots[shotIndex];

          // Clear
          ctx.clearRect(0, 0, width, height);

          // Background gradient based on current shot's color palette
          const colors = currentShot?.colorPalette || ['#0f172a', '#1e1b4b', '#4338ca'];
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, colors[0] || '#0f172a');
          grad.addColorStop(0.5, colors[1] || '#1e1b4b');
          grad.addColorStop(1, colors[2] || '#4338ca');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Simulated camera motion (Zoom & Pan)
          ctx.save();
          const shotProgress = (progress * shots.length) - shotIndex;
          const zoom = 1 + shotProgress * 0.15;
          const panX = Math.sin(shotProgress * Math.PI) * 20;
          const panY = Math.cos(shotProgress * Math.PI) * 10;
          
          ctx.translate(width / 2 + panX, height / 2 + panY);
          ctx.scale(zoom, zoom);
          ctx.translate(-width / 2, -height / 2);

          // Geometric abstract cinematic artwork representing the scene
          ctx.beginPath();
          ctx.arc(width / 2, height / 2, 160, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Atmospheric light particles
          for (let i = 0; i < 25; i++) {
            const px = ((i * 73 + elapsed * 0.05) % width);
            const py = ((i * 127 + Math.sin(elapsed * 0.002 + i) * 30) % height);
            ctx.beginPath();
            ctx.arc(px, py, 2 + (i % 3), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + (i % 4) * 0.15})`;
            ctx.fill();
          }

          // Central subject representation
          ctx.shadowColor = colors[1] || '#818cf8';
          ctx.shadowBlur = 30;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 22px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(currentVideo.storyboard.title || 'OmniStudio AI Video', width / 2, height / 2 - 20);

          ctx.font = '14px system-ui, sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.fillText(currentShot?.camera || 'Travelling Cinématique', width / 2, height / 2 + 15);

          ctx.font = '12px system-ui, sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          const shortDesc = currentShot?.visualDescription ? currentShot.visualDescription.slice(0, 50) + '...' : '';
          ctx.fillText(shortDesc, width / 2, height / 2 + 45);

          ctx.restore();

          // Cinematic letterbox bars
          ctx.fillStyle = '#020617';
          ctx.fillRect(0, 0, width, 25);
          ctx.fillRect(0, height - 25, width, 25);

          // Timestamp overlay
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = '10px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`REC ● 00:0${Math.floor(elapsed / 1000)}:${Math.floor((elapsed % 1000) / 100)}`, 20, 17);
          ctx.textAlign = 'right';
          ctx.fillText(`SCENE ${shotIndex + 1}/${shots.length} | ${currentVideo.aspectRatio}`, width - 20, 17);
        }
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(renderFrame);
      } else {
        setIsPlaying(false);
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentVideo, duration]);

  const togglePlay = () => {
    if (playbackProgress >= 1) {
      setPlaybackProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setPlaybackProgress(0);
    setIsPlaying(true);
  };

  const handleDownloadStoryboard = () => {
    if (!currentVideo) return;
    const content = `STORYBOARD & DÉCOUPAGE VIDÉO
Titre : ${currentVideo.storyboard.title}
Prompt : ${currentVideo.prompt}
Mouvement de Caméra : ${currentVideo.cameraMovement}
Style Visuel : ${currentVideo.style}
Durée : ${currentVideo.duration} | Format : ${currentVideo.aspectRatio}
Synopsis : ${currentVideo.storyboard.synopsis}

PLANS TECHNIQUES :
${currentVideo.storyboard.shots.map((s) => `Plan ${s.shotNumber} (${s.duration}): ${s.camera} - ${s.visualDescription} [Éclairage: ${s.lighting}]`).join('\n')}

AUDIO & SFX :
Bruitages : ${currentVideo.storyboard.audioDesign?.sfx || 'Ambiance cinématique'}
Musique : ${currentVideo.storyboard.audioDesign?.musicMood || 'Synthétique'}`;

    downloadTextWithWatermark(content, currentVideo.storyboard.title, !!user?.isPro, `storyboard-video-${currentVideo.id}.txt`);
    toastSuccess(
      'Storyboard exporté !',
      user?.isPro ? 'Scénario technique complet exporté sans filigrane.' : 'Fichier exporté avec filigrane Plan Free.',
      'sparkles'
    );
  };

  const handleDownloadVideoMp4 = () => {
    if (!currentVideo?.videoUrl) return;
    const link = document.createElement('a');
    link.href = currentVideo.videoUrl;
    link.download = `omnistudio-video-${currentVideo.id}.mp4`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toastSuccess(
      'Vidéo MP4 téléchargée !',
      'Le fichier vidéo haute résolution a été enregistré.',
      'sparkles'
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Studio Header Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
            <VideoIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Génération Vidéo Cinématique & Storyboard</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Studio <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">Texte vers Vidéo</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Donnez vie à vos idées avec des mouvements de caméra cinématiques, un découpage en scènes et des animations immersives. Coût par vidéo : <strong>{cost} crédits</strong>.
          </p>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-white/10 space-y-5">
            
            {/* Prompt Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-purple-400" />
                  Description de la Vidéo (Prompt)
                </label>
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  disabled={enhancing || !prompt.trim()}
                  className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 disabled:opacity-40 transition-colors font-medium cursor-pointer"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${enhancing ? 'animate-spin' : ''}`} />
                  <span>{enhancing ? 'Optimisation...' : '✨ Booster le script avec l\'IA'}</span>
                </button>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Décrivez l'action, l'environnement, les éclairages et les émotions de la vidéo..."
                rows={4}
                className="w-full bg-slate-900/90 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
              />

              {/* Ideas */}
              <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                <span className="text-slate-500 shrink-0">Idées :</span>
                {QUICK_VIDEO_IDEAS.map((idea, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(idea)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/5 truncate max-w-xs transition-colors shrink-0"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Movement */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-purple-400" />
                Mouvement de Caméra
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CAMERA_MOVEMENTS.map((cam) => (
                  <button
                    key={cam.id}
                    type="button"
                    onClick={() => setSelectedCamera(cam.id)}
                    className={`text-left p-2.5 rounded-xl border transition-all ${
                      selectedCamera === cam.id
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-xs font-bold text-white">{cam.label}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{cam.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Ambiance & Style Visuel
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {VIDEO_STYLES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStyle(st.id)}
                    className={`text-left p-2.5 rounded-xl border transition-all ${
                      selectedStyle === st.id
                        ? 'bg-purple-600/20 border-purple-500 text-white'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-xs font-bold text-white truncate">{st.label}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{st.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration and Ratio */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Durée</label>
                <div className="flex rounded-xl bg-slate-900 p-1 border border-white/5">
                  {['3s', '5s', '10s'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        duration === d ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Format</label>
                <div className="flex rounded-xl bg-slate-900 p-1 border border-white/5">
                  {[
                    { id: '16:9', label: '16:9 Ciné' },
                    { id: '9:16', label: '9:16 Réseaux' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRatio(r.id)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        selectedRatio === r.id ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer group"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Création du rendu cinématographique...</span>
                  </>
                ) : (
                  <>
                    <Clapperboard className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                    <span>Générer la Vidéo</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-black/30 text-purple-200 text-xs font-semibold border border-white/10 flex items-center gap-1">
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
                  Passer Pro pour 500 crédits
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Video Player Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-white/10 flex flex-col justify-between min-h-[460px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clapperboard className="w-4 h-4 text-purple-400" />
                Lecteur Vidéo Interactif
              </h3>
              {currentVideo && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {currentVideo.duration} • {currentVideo.aspectRatio}
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-slate-900/60 border border-dashed border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4 animate-pulse">
                  <Film className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
                <p className="text-sm font-semibold text-white">Génération des plans vidéo...</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Synthèse cinématique des mouvements de caméra {selectedCamera} et éclairages {selectedStyle}.
                </p>
              </div>
            ) : currentVideo ? (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                
                {/* Real HTML5 Interactive Video Player */}
                <div className="relative group rounded-2xl overflow-hidden bg-black border border-white/10 aspect-video flex items-center justify-center shadow-2xl">
                  <video
                    ref={videoRef}
                    key={currentVideo.videoUrl}
                    src={currentVideo.videoUrl || 'https://assets.mixkit.co/videos/41584/41584-720.mp4'}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    onTimeUpdate={(e) => {
                      const v = e.currentTarget;
                      if (v.duration) {
                        const progress = v.currentTime / v.duration;
                        setPlaybackProgress(progress);
                        const shots = currentVideo.storyboard.shots;
                        if (shots?.length) {
                          const sIdx = Math.min(shots.length - 1, Math.floor(progress * shots.length));
                          setCurrentShotIndex(sIdx);
                        }
                      }
                    }}
                  />
                </div>

                {/* Video Info and Controls Bar */}
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-xs">
                        {currentVideo.storyboard.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {currentVideo.storyboard.synopsis}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDownloadVideoMp4}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                        title="Télécharger la vidéo au format MP4"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Télécharger MP4</span>
                      </button>

                      <button
                        onClick={handleDownloadStoryboard}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Exporter le scénario et découpage technique"
                      >
                        <span>Plan (.TXT)</span>
                      </button>
                    </div>
                  </div>

                  {/* Scene breakdown mini-cards */}
                  {currentVideo.storyboard.shots && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                      {currentVideo.storyboard.shots.map((shot, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-xl border text-[11px] transition-all ${
                            currentShotIndex === idx
                              ? 'bg-purple-500/20 border-purple-500/50 text-white'
                              : 'bg-slate-950/50 border-white/5 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold mb-0.5">
                            <span>Plan {shot.shotNumber}</span>
                            <span className="text-[9px] text-purple-300">{shot.duration}</span>
                          </div>
                          <p className="line-clamp-1">{shot.camera}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-slate-900/40 border border-dashed border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center mb-4">
                  <VideoIcon className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-sm font-medium text-slate-300">Aucune vidéo générée pour le moment</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Entrez votre idée à gauche pour générer une séquence vidéo avec storyboard dynamique.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Video Generation History */}
      {videoHistory.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Film className="w-4 h-4 text-purple-400" />
            Vidéos Récentes ({videoHistory.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {videoHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setCurrentVideo(item);
                  setIsPlaying(true);
                }}
                className="p-4 rounded-2xl glass-panel border border-white/10 cursor-pointer hover:border-purple-500/40 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                    {item.storyboard.title}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                    {item.duration}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 italic">
                  "{item.prompt}"
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>{item.cameraMovement}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
