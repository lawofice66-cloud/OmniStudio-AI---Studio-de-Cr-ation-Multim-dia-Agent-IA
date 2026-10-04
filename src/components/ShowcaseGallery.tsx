import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Video, 
  Music, 
  BookOpen, 
  Image as ImageIcon, 
  Play, 
  Pause, 
  ArrowRight, 
  Download, 
  Volume2, 
  VolumeX, 
  Eye, 
  Check, 
  Copy, 
  Film, 
  Wand2, 
  Compass, 
  Flame, 
  Layers, 
  Clapperboard, 
  Disc3,
  X
} from 'lucide-react';
import { generateShowcaseWav } from '../utils/audioSynthesizer';
import { useToast } from '../context/ToastContext';

export interface ShowcaseItem {
  id: string;
  type: 'video' | 'music' | 'story' | 'image';
  title: string;
  badge: string;
  categoryLabel: string;
  description: string;
  prompt: string;
  thumbnail: string;
  // Specific data for each type
  videoData?: {
    camera: string;
    style: string;
    duration: string;
    videoUrl: string;
    shots: { number: number; desc: string; lighting: string }[];
  };
  musicData?: {
    model: string;
    styleType: 'cinematic' | 'synthwave' | 'lofi' | 'fantasy';
    styleLabel: string;
    mood: string;
    duration: string;
    lyrics: string;
  };
  storyData?: {
    genre: string;
    tone: string;
    logline: string;
    characters: { name: string; role: string; secret: string }[];
    chapterPreview: { title: string; narrative: string };
  };
  imageData?: {
    style: string;
    aspectRatio: string;
  };
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  // 1. Video Samples
  {
    id: 'vid-1',
    type: 'video',
    title: 'Néo-Tokyo 2099 : Course d\'Ombres',
    badge: 'Veo & Omni Flash 1.1',
    categoryLabel: 'Vidéo Cinématique IA',
    description: 'Travelling immersif dans les rues gorgées de pluie néon d\'une mégalopole cyberpunk.',
    prompt: 'Travelling avant cinématique le long d\'une avenue de Néo-Tokyo sous une pluie battante, reflets d\'enseignes holographiques bleues et violettes sur l\'asphalte mouillé, moto futuriste filant à vive allure, lentille anamorphique 35mm, 8K',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    videoData: {
      camera: 'Travelling Avant (Dolly Forward)',
      style: 'Sci-Fi Cyberpunk Néo-Tokyo',
      duration: '5s • 720p 60fps',
      videoUrl: 'https://assets.mixkit.co/videos/41584/41584-720.mp4',
      shots: [
        { number: 1, desc: 'Plongeon vertical depuis les gratte-ciel vers l\'avenue baignée de néons bleus', lighting: 'Lueurs néon cyan et reflets d\'eau' },
        { number: 2, desc: 'Rapprochement rapide sur la moto profilée en pleine accélération', lighting: 'Faisceaux de phares dorés et étincelles' },
        { number: 3, desc: 'Gros plan sur la visière holographique du pilote affichant les données télémétriques', lighting: 'Reflet tête haute HUD vert émeraude' },
      ],
    },
  },
  {
    id: 'vid-2',
    type: 'video',
    title: 'L\'Éveil du Titan Céleste',
    badge: 'Veo Cinématique',
    categoryLabel: 'Vidéo Aérienne FPV',
    description: 'Survol en drone FPV au-dessus d\'un désert d\'obsidienne découvrant un colosse de pierre.',
    prompt: 'Survol en drone FPV rapide au ras des dunes d\'un désert de sable noir, lumière d\'aurore boréale céleste se reflétant sur les cristaux géants, réveil d\'une gigantesque statue millénaire qui ouvre des yeux dorés, cinématographie épique Denis Villeneuve',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    videoData: {
      camera: 'Drone FPV & Panoramique Aérien',
      style: 'Épopée Mythologique Sci-Fi',
      duration: '5s • 16:9',
      videoUrl: 'https://assets.mixkit.co/videos/41443/41443-720.mp4',
      shots: [
        { number: 1, desc: 'Rase-mottes ultra-rapide sur les dunes de sable noir volcanique', lighting: 'Aurore boréale vert céleste et teintes pourpres' },
        { number: 2, desc: 'Redressement vertical dramatique face au visage de la statue colossale', lighting: 'Soleil rasant créant des ombres gigantesques' },
        { number: 3, desc: 'Activation des pupilles d\'or liquide illuminant la vallée entière', lighting: 'Pulsation lumineuse dorée volumétrique' },
      ],
    },
  },

  // 2. Music Samples
  {
    id: 'mus-1',
    type: 'music',
    title: 'Solar Flare Odyssey',
    badge: 'Lyria 3 Pro (Full Track)',
    categoryLabel: 'Composition Symphonique',
    description: 'Thème orchestral grandiose inspiré de Hans Zimmer avec montées de cuivres et chœurs cosmiques.',
    prompt: 'Composition symphonique spatiale épique, montée progressive de violoncelles dramatiques, percussions tribales puissantes, trompettes impériales et nappes de synthé analogique, ambiance exploration interstellaire et dépassement de soi',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    musicData: {
      model: 'lyria-3-pro-preview',
      styleType: 'cinematic',
      styleLabel: 'Cinématique Épique Orchestral',
      mood: 'Inspirant & Héroïque',
      duration: 'Piste Audio 24kHz',
      lyrics: '[Acte 1 - L\'Envol]\nÀ travers l\'immensité, les moteurs s\'allument\nPar-delà l\'horizon où les nébuleuses s\'embrasent\n[Climax Orchestral]\nLa lumière dorée triomphe du vide infini\nNous sommes les pionniers des mondes de demain...',
    },
  },
  {
    id: 'mus-2',
    type: 'music',
    title: 'Midnight Arcade 1984',
    badge: 'Lyria 3 Clip (30s)',
    categoryLabel: 'Synthwave & Electro',
    description: 'Morceau rétro-électronique énergique avec basse slap analogique et arpèges néon.',
    prompt: 'Piste synthwave 80s percutante avec synthétiseurs vintage Jupiter-8, basse analogique lourde, batterie électronique gated reverb, ambiance virée nocturne en décapotable sous les palmiers de Miami',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
    musicData: {
      model: 'lyria-3-clip-preview',
      styleType: 'synthwave',
      styleLabel: 'Synthwave 80s & Cyberpunk',
      mood: 'Énergique & Nostalgique',
      duration: 'Extrait Clip 24kHz',
      lyrics: '[Verse]\nBande jaune discontinue sur le bitume luisant\nLes néons défilent, le beat bat le tempo\n[Refrain]\nLe futur était déjà là, gravé sur cassette audio\nAccélère encore vers la ligne d\'horizon...',
    },
  },
  {
    id: 'mus-3',
    type: 'music',
    title: 'Café Pluvieux à Kyoto',
    badge: 'Lyria 3 Clip',
    categoryLabel: 'Lo-Fi Chillhop',
    description: 'Douceur mélancolique d\'un piano feutré avec craquements de vinyle et beat feutré.',
    prompt: 'Musique lo-fi hip hop apaisante, accords de piano jazz mélodieux au son feutré, crépitement de vinyle ancien, gouttes de pluie contre la vitre d\'un café japonais, basse ronde et chaleureuse',
    thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
    musicData: {
      model: 'lyria-3-clip-preview',
      styleType: 'lofi',
      styleLabel: 'Lo-Fi Chill & Détente',
      mood: 'Apaisant & Doux',
      duration: 'Extrait Clip 24kHz',
      lyrics: '[Ambiance]\n(Gouttes de pluie sur les lampions de papier)\nLe thé fume doucement tandis que les notes s\'égrènent\nUn instant de sérénité suspendu dans le temps...',
    },
  },

  // 3. Story Samples
  {
    id: 'sty-1',
    type: 'story',
    title: 'Le Dernier Signal d\'Obsidienne',
    badge: 'Récit en 3 Actes • Gemini 3.8',
    categoryLabel: 'Roman de Science-Fiction',
    description: 'Une archiviste de reliques cosmiques réveille par mégarde un esprit cartographique qui réécrit la réalité.',
    prompt: 'Dans un monastère technologique juché sur une lune morte, l\'archiviste Elyra décode une stèle d\'obsidienne dont les glyphes modifient la géométrie des pièces environnantes à chaque lecture.',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    storyData: {
      genre: 'Science-Fiction & Hard Sci-Fi',
      tone: 'Épique & Métaphysique',
      logline: 'Quand une stèle commence à effacer les souvenirs de ceux qui la contemplent, une femme doit choisir entre préserver son identité ou sauver le dernier secteur habité.',
      characters: [
        { name: 'Elyra Thorne', role: 'Protagoniste • Conservatrice stellaire', secret: 'Porte un implant mémoriel illégal qui conserve les souvenirs de son père disparu.' },
        { name: 'Sentinelle Vael', role: 'Guide & Gardien cybernétique', secret: 'Ses protocoles d\'urgence prévoient la destruction de l\'archive si la relique s\'active.' },
      ],
      chapterPreview: {
        title: 'Chapitre 1 : Les Glyphes en Mouvement',
        narrative: 'Le silence de l\'abside n\'était troublé que par le bourdonnement des stabilisateurs gravitationnels. Elyra effleura la surface glacée du monolithe. Sous ses doigts gantés de titane, les inscriptions ne réfléchissaient pas la lumière : elles l\'aspiraient.\n\n"Taux de distorsion spatiale à 14%", annonça la voix métallique de Vael depuis l\'estrade supérieure. "Elyra, recule. La salle commence à perdre sa cohésion euclidienne." Mais il était déjà trop tard : les murs de pierre noire s\'écartaient en silence, dévoilant un ciel étoilé qui n\'appartenait à aucune constellation répertoriée.',
      },
    },
  },
  {
    id: 'sty-2',
    type: 'story',
    title: 'L\'Oracle des Cendres Dorées',
    badge: 'Dark Fantasy Immersive',
    categoryLabel: 'Épopée Dark Fantasy',
    description: 'Un alchimiste renégat s\'aventure dans la forêt pétrifiée pour négocier avec la reine des chimères.',
    prompt: 'Récit dark fantasy où un alchimiste poursuivi par l\'inquisition du Verbe cherche l\'arbre des cendres dorées pour ressusciter sa fille, découvrant que l\'arbre se nourrit des mensonges des hommes.',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    storyData: {
      genre: 'Dark Fantasy & Mystère',
      tone: 'Sombre & Poétique',
      logline: 'Pour ramener ce qu\'il a perdu, un homme doit avouer les crimes les plus inavouables de sa vie à un arbre qui transforme les aveux en sève d\'immortalité.',
      characters: [
        { name: 'Koren de Val-Gris', role: 'Protagoniste • Alchimiste banni', secret: 'A lui-même provoqué l\'incendie de son atelier par soif de découverte.' },
        { name: 'Sylve-Noire', role: 'Esprit millénaire de la forêt', secret: 'Cherche un réceptacle humain pour quitter les terres corrompues.' },
      ],
      chapterPreview: {
        title: 'Chapitre 1 : Le Sentier des Arbres de Verre',
        narrative: 'Les aiguilles de pin crissaient sous les bottes de Koren comme des brisures de cristal. L\'air avait l\'odeur du soufre et du miel sauvage. Devant lui, le tronc monumental de l\'Arbre d\'Or pulsait d\'une luminescence maladive.\n\n"Tu viens chercher la sève", murmura une voix qui semblait monter de l\'humus lui-même. "Mais as-tu apporté la vérité qui déchirera ton âme ?" Koren serra contre lui la fiole d\'argent vide, sachant que le mensonge lui coûterait son dernier battement de cœur.',
      },
    },
  },

  // 4. Image Samples
  {
    id: 'img-1',
    type: 'image',
    title: 'Le Renard Cosmique de Saturne',
    badge: 'Modèle Photoréaliste 8K',
    categoryLabel: 'Art Numérique HD',
    description: 'Créature céleste aux reflets dorés marchant sur les anneaux stellaires.',
    prompt: 'Un renard cosmique aux yeux étincelants marchant gracieusement sur les anneaux de Saturne, nébuleuse violette et dorée en arrière-plan, poussière d\'étoiles brillante, détails microscopiques de fourrure luminescente, 35mm lens, éclairage volumétrique doux, 8K ultra réaliste',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    imageData: {
      style: 'Photoréaliste 8K & Éclairage Volumétrique',
      aspectRatio: '1:1 Format Carré',
    },
  },
  {
    id: 'img-2',
    type: 'image',
    title: 'Sanctuaire Futuriste Flottant',
    badge: 'Art 3D Ultra-Détaillé',
    categoryLabel: 'Architecture Fantastique',
    description: 'Temple japonais suspendu dans les nuages avec cascades d\'énergie céleste.',
    prompt: 'Temple japonais torii futuriste suspendu en apesanteur au-dessus d\'un océan de nuages dorés, cascades d\'eau cristalline flottant vers le ciel, cerisiers en fleurs aux pétales néon rose, rendu cinématique Pixar / Unreal Engine 5, éclairage d\'or couchant',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    imageData: {
      style: '3D Render Vibrant & Épique',
      aspectRatio: '16:9 Format Paysage',
    },
  },
];

interface ShowcaseGalleryProps {
  onSelectSample: (type: 'image' | 'video' | 'music' | 'story', prompt: string, extraData?: any) => void;
}

export const ShowcaseGallery: React.FC<ShowcaseGalleryProps> = ({ onSelectSample }) => {
  const { success: toastSuccess, info: toastInfo } = useToast();
  const [filter, setFilter] = useState<'all' | 'video' | 'music' | 'story' | 'image'>('all');
  
  // Audio playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioElementsRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Active modal details
  const [activeStoryModal, setActiveStoryModal] = useState<ShowcaseItem | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<ShowcaseItem | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Initialize synthesized audio files on mount
  useEffect(() => {
    SHOWCASE_ITEMS.forEach((item) => {
      if (item.type === 'music' && item.musicData) {
        const wavUrl = generateShowcaseWav(item.musicData.styleType, 16);
        const audio = new Audio(wavUrl);
        audio.onended = () => setPlayingAudioId(null);
        audioElementsRef.current[item.id] = audio;
      }
    });

    return () => {
      Object.values(audioElementsRef.current).forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  const togglePlayAudio = (item: ShowcaseItem) => {
    const audio = audioElementsRef.current[item.id];
    if (!audio) return;

    if (playingAudioId === item.id) {
      audio.pause();
      setPlayingAudioId(null);
      toastInfo('Lecture en pause', item.title);
    } else {
      // Pause any previously playing audio
      if (playingAudioId && audioElementsRef.current[playingAudioId]) {
        audioElementsRef.current[playingAudioId].pause();
      }
      audio.currentTime = 0;
      audio.play().catch(() => {});
      setPlayingAudioId(item.id);
      toastSuccess('Écoute de l\'échantillon musical', `"${item.title}" (${item.musicData?.styleLabel})`, 'sparkles');
    }
  };

  const handleCopyPrompt = (item: ShowcaseItem) => {
    navigator.clipboard.writeText(item.prompt);
    setCopiedPromptId(item.id);
    toastInfo('Prompt copié !', 'Collez-le dans le studio de votre choix ou cliquez sur Tester.');
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const filteredItems = filter === 'all' 
    ? SHOWCASE_ITEMS 
    : SHOWCASE_ITEMS.filter((item) => item.type === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Showcase Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-10 border border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-pink-500/15 blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-pink-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
            <span>Vitrine Créative & Galerie Démonstration</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Découvrez la Puissance d'OmniStudio AI
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Explorez des créations complètes générées par nos moteurs : bandes originales orchestrales, storyboards vidéo découpés, récits littéraires immersifs et visuels 8K. Cliquez sur un échantillon pour l'écouter, le lire ou le cloner instantanément dans votre studio !
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-slate-950 shadow-lg shadow-white/20 scale-105'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-white/5'
              }`}
            >
              Tous les Échantillons ({SHOWCASE_ITEMS.length})
            </button>

            <button
              onClick={() => setFilter('video')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'video'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-white/5'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-purple-400" />
              <span>Vidéos IA (2)</span>
            </button>

            <button
              onClick={() => setFilter('music')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'music'
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30 scale-105'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-white/5'
              }`}
            >
              <Music className="w-3.5 h-3.5 text-pink-400" />
              <span>Sons & Audio IA (3)</span>
            </button>

            <button
              onClick={() => setFilter('story')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'story'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Histoires IA (2)</span>
            </button>

            <button
              onClick={() => setFilter('image')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'image'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-white/5'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Images 8K (2)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const isPlayingThisAudio = playingAudioId === item.id;

          return (
            <div
              key={item.id}
              className="rounded-3xl glass-panel border border-white/10 overflow-hidden flex flex-col justify-between group hover:border-indigo-500/50 transition-all duration-300 shadow-xl hover:-translate-y-1"
            >
              {/* Card Image Thumbnail & Overlay */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Top Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/10 flex items-center gap-1.5">
                    {item.type === 'video' && <Video className="w-3 h-3 text-purple-400" />}
                    {item.type === 'music' && <Music className="w-3 h-3 text-pink-400" />}
                    {item.type === 'story' && <BookOpen className="w-3 h-3 text-indigo-400" />}
                    {item.type === 'image' && <ImageIcon className="w-3 h-3 text-emerald-400" />}
                    <span>{item.categoryLabel}</span>
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/20">
                    {item.badge}
                  </span>
                </div>

                {/* Action Floating Buttons over Thumbnail */}
                {item.type === 'music' && (
                  <button
                    type="button"
                    onClick={() => togglePlayAudio(item)}
                    className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-pink-600/90 hover:bg-pink-500 text-white flex items-center justify-center shadow-2xl shadow-pink-600/50 backdrop-blur-md transition-transform hover:scale-110 active:scale-95 cursor-pointer z-10"
                    title={isPlayingThisAudio ? 'Mettre en pause' : 'Écouter l\'échantillon'}
                  >
                    {isPlayingThisAudio ? (
                      <Pause className="w-6 h-6 fill-current animate-pulse" />
                    ) : (
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    )}
                  </button>
                )}

                {item.type === 'video' && (
                  <button
                    type="button"
                    onClick={() => setActiveVideoModal(item)}
                    className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white flex items-center justify-center shadow-2xl shadow-purple-600/50 backdrop-blur-md transition-transform hover:scale-110 active:scale-95 cursor-pointer z-10"
                    title="Voir le plan cinématique et le découpage technique"
                  >
                    <Clapperboard className="w-6 h-6 text-white" />
                  </button>
                )}

                {item.type === 'story' && (
                  <button
                    type="button"
                    onClick={() => setActiveStoryModal(item)}
                    className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/50 backdrop-blur-md transition-transform hover:scale-110 active:scale-95 cursor-pointer z-10"
                    title="Lire les chapitres complets"
                  >
                    <BookOpen className="w-6 h-6 text-white" />
                  </button>
                )}

                {/* Animated Waveform Indicator if playing */}
                {isPlayingThisAudio && (
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-1 bg-slate-950/80 backdrop-blur-md py-1 px-3 rounded-full border border-pink-500/30">
                    <span className="text-[10px] text-pink-300 font-bold mr-1">Lecture en cours :</span>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-1 bg-pink-400 rounded-full animate-bounce"
                        style={{
                          height: `${8 + (i % 4) * 4}px`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-lg text-white group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Prompt Preview Snippet */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                    <span>Prompt utilisé :</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(item)}
                      className="text-indigo-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPromptId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPromptId === item.id ? 'Copié' : 'Copier'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 italic line-clamp-2 font-mono">
                    "{item.prompt}"
                  </p>
                </div>

                {/* Specific Meta Footer per type */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400">
                    {item.type === 'video' && <span>🎬 {item.videoData?.shots.length} plans • {item.videoData?.duration}</span>}
                    {item.type === 'music' && <span>🔊 {item.musicData?.styleLabel}</span>}
                    {item.type === 'story' && <span>📖 {item.storyData?.genre}</span>}
                    {item.type === 'image' && <span>🖼️ {item.imageData?.style}</span>}
                  </div>

                  {/* 1-Click Action to Clone into Studio */}
                  <button
                    type="button"
                    onClick={() => {
                      if (item.type === 'video') onSelectSample('video', item.prompt, item.videoData);
                      else if (item.type === 'music') onSelectSample('music', item.prompt, item.musicData);
                      else if (item.type === 'story') onSelectSample('story', item.prompt, item.storyData);
                      else onSelectSample('image', item.prompt, item.imageData);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 hover:scale-105 transition-all cursor-pointer shrink-0"
                  >
                    <span>Tester ce modèle</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Modal Details */}
      {activeVideoModal && activeVideoModal.videoData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setActiveVideoModal(null)}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveVideoModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                Échantillon Découpage Vidéo
              </span>
              <h2 className="text-2xl font-black text-white">{activeVideoModal.title}</h2>
              <p className="text-xs text-slate-400">{activeVideoModal.description}</p>
            </div>

            {/* Real Interactive Video Player */}
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black group shadow-2xl">
              <video
                src={activeVideoModal.videoData.videoUrl}
                poster={activeVideoModal.thumbnail}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            {/* Shot List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Découpage Technique des Plans :
              </h4>
              <div className="space-y-2">
                {activeVideoModal.videoData.shots.map((shot) => (
                  <div key={shot.number} className="p-3.5 rounded-xl bg-slate-900 border border-white/5 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-purple-300">
                      <span>Plan {shot.number}</span>
                      <span className="text-[10px] text-slate-500 font-normal">Éclairage : {shot.lighting}</span>
                    </div>
                    <p className="text-slate-200">{shot.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setActiveVideoModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  onSelectSample('video', activeVideoModal.prompt, activeVideoModal.videoData);
                  setActiveVideoModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Wand2 className="w-4 h-4" />
                <span>Ouvrir et Générer dans le Studio Vidéo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Modal Details */}
      {activeStoryModal && activeStoryModal.storyData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setActiveStoryModal(null)}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveStoryModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                Échantillon Roman & Narration
              </span>
              <h2 className="text-2xl font-black text-white">{activeStoryModal.title}</h2>
              <p className="text-xs text-indigo-300 italic">"{activeStoryModal.storyData.logline}"</p>
            </div>

            {/* Characters dossier */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Personnages Principaux :
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeStoryModal.storyData.characters.map((c, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-white/5 text-xs space-y-1">
                    <span className="font-bold text-white block">{c.name}</span>
                    <span className="text-[10px] text-indigo-400 block">{c.role}</span>
                    <p className="text-[11px] text-slate-400">Secret : {c.secret}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chapter extract */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
              <h3 className="font-bold text-sm text-white">
                {activeStoryModal.storyData.chapterPreview.title}
              </h3>
              <p className="font-serif text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {activeStoryModal.storyData.chapterPreview.narrative}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setActiveStoryModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  onSelectSample('story', activeStoryModal.prompt, activeStoryModal.storyData);
                  setActiveStoryModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Ouvrir dans le Générateur d'Histoires</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
