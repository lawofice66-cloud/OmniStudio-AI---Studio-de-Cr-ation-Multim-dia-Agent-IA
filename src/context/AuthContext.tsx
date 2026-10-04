import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ImageGeneration, VideoGeneration, TranscriptionItem, StoryGeneration, MusicGeneration, CreditTransaction, PRICING_CONFIG } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  loginDemo: () => void;
  logout: () => void;
  upgradeToPro: () => void;
  deductCredits: (amount: number, reason: string, category?: CreditTransaction['category']) => boolean;
  addCredits: (amount: number, reason?: string) => void;
  imageHistory: ImageGeneration[];
  videoHistory: VideoGeneration[];
  transcriptionHistory: TranscriptionItem[];
  storyHistory: StoryGeneration[];
  musicHistory: MusicGeneration[];
  transactions: CreditTransaction[];
  addImageGeneration: (item: ImageGeneration) => void;
  addVideoGeneration: (item: VideoGeneration) => void;
  addTranscription: (item: TranscriptionItem) => void;
  addStoryGeneration: (item: StoryGeneration) => void;
  addMusicGeneration: (item: MusicGeneration) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  openSubscriptionModal: () => void;
  closeSubscriptionModal: () => void;
  isSubscriptionModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'omnistudio_user',
  IMAGES: 'omnistudio_images',
  VIDEOS: 'omnistudio_videos',
  TRANSCRIPTIONS: 'omnistudio_transcriptions',
  STORIES: 'omnistudio_stories',
  MUSIC: 'omnistudio_music',
  TRANSACTIONS: 'omnistudio_transactions',
};

// Initial default user for seamless instant testing
const DEFAULT_USER: User = {
  id: 'usr_demo_101',
  email: 'lawofice66@gmail.com',
  name: 'Alexandre Studio',
  plan: 'free',
  credits: PRICING_CONFIG.FREE_PLAN_CREDITS,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  createdAt: new Date().toISOString(),
  isPro: false,
};

// Seed historical usage data for the past 7 days to give vibrant immediate charts
const getInitialTransactions = (): CreditTransaction[] => {
  const now = new Date();
  const daysAgo = (days: number, hours = 14) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    d.setHours(hours, 20, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: 'tx_seed_1',
      type: 'addition',
      category: 'bonus',
      actionName: 'Bonus d\'inscription Plan Free',
      amount: 25,
      date: daysAgo(6, 9),
      balanceAfter: 25,
    },
    {
      id: 'tx_seed_2',
      type: 'deduction',
      category: 'image',
      actionName: 'Génération Image : Cyberpunk Neon City',
      amount: 2,
      date: daysAgo(5, 11),
      balanceAfter: 23,
    },
    {
      id: 'tx_seed_3',
      type: 'deduction',
      category: 'agent',
      actionName: 'Co-pilote Nova : Brainstorming Scénario',
      amount: 0.5,
      date: daysAgo(4, 15),
      balanceAfter: 22.5,
    },
    {
      id: 'tx_seed_4',
      type: 'deduction',
      category: 'video',
      actionName: 'Génération Vidéo : Survol Drone Montagnes',
      amount: 5,
      date: daysAgo(3, 17),
      balanceAfter: 17.5,
    },
    {
      id: 'tx_seed_5',
      type: 'deduction',
      category: 'transcribe',
      actionName: 'Transcription Audio : Réunion Marketing',
      amount: 1,
      date: daysAgo(2, 10),
      balanceAfter: 16.5,
    },
    {
      id: 'tx_seed_6',
      type: 'deduction',
      category: 'image',
      actionName: 'Génération Image : Portrait Studio 35mm',
      amount: 2,
      date: daysAgo(1, 19),
      balanceAfter: 14.5,
    },
  ];
};

const getInitialImageHistory = (): ImageGeneration[] => [
  {
    id: 'img_seed_1',
    prompt: 'Un renard cosmique aux yeux étincelants marchant gracieusement sur les anneaux de Saturne, nébuleuse violette et dorée en arrière-plan, 35mm lens, 8K ultra réaliste',
    style: 'Photoréaliste 8K',
    aspectRatio: '1:1',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    creditsUsed: 2,
  },
  {
    id: 'img_seed_2',
    prompt: 'Temple japonais torii futuriste suspendu en apesanteur au-dessus d\'un océan de nuages dorés, cascades de lumière cristalline, rendu 3D Pixar / Unreal Engine 5',
    style: '3D Render Vibrant',
    aspectRatio: '16:9',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    creditsUsed: 2,
  },
];

const getInitialVideoHistory = (): VideoGeneration[] => [
  {
    id: 'vid_seed_1',
    prompt: 'Travelling avant cinématique le long d\'une avenue de Néo-Tokyo sous une pluie battante, reflets d\'enseignes holographiques bleues et violettes sur l\'asphalte mouillé',
    cameraMovement: 'Travelling Avant (Dolly Forward)',
    duration: '5s',
    style: 'Sci-Fi Cyberpunk Néo-Tokyo',
    aspectRatio: '16:9',
    videoUrl: 'https://assets.mixkit.co/videos/41584/41584-720.mp4',
    storyboard: {
      title: 'Néo-Tokyo 2099 : Course d\'Ombres',
      synopsis: 'Travelling immersif dans les rues cyberpunk sous la pluie avec reflets holographiques',
      shots: [
        { shotNumber: 1, camera: 'Plongeon vertical depuis les gratte-ciel', visualDescription: 'Lueurs néon cyan et reflets d\'eau', lighting: 'Néon cyan volumétrique', colorPalette: ['#0f172a', '#1e1b4b'], duration: '2s' },
        { shotNumber: 2, camera: 'Travelling avant rapide au ras du bitume', visualDescription: 'Faisceaux de phares dorés et étincelles', lighting: 'Phares dorés et pluie', colorPalette: ['#1e1b4b', '#4f46e5'], duration: '3s' },
      ],
    },
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    creditsUsed: 5,
  },
];

const getInitialStoryHistory = (): StoryGeneration[] => [
  {
    id: 'story_seed_1',
    prompt: 'Dans un monastère technologique sur une lune morte, l\'archiviste décode une stèle d\'obsidienne dont les glyphes modifient la réalité à chaque lecture',
    genre: 'Science-Fiction & Hard Sci-Fi',
    tone: 'Épique & Métaphysique',
    title: 'Le Dernier Signal d\'Obsidienne',
    logline: 'Quand une stèle commence à effacer les souvenirs de ceux qui la contemplent, une femme doit choisir entre son identité ou sauver le secteur.',
    worldSetting: 'Une lune abandonnée aux confins de la bordure extérieure où dort une archive millénaire.',
    characters: [
      { name: 'Elyra Thorne', role: 'Protagoniste', description: 'Archiviste stellaire déterminée', motivation: 'Sauver le savoir des Anciens', secret: 'Implant mémoriel clandestin' },
    ],
    chapters: [
      { chapterNumber: 1, title: 'Les Glyphes en Mouvement', narrative: 'Le silence régnait dans l\'abside lorsque la stèle vibra pour la première fois...', sceneVisualPrompt: 'Cinematic shot of ancient glowing alien monolith', tensionLevel: 7 },
    ],
    summary: 'Une odyssée métaphysique captivante sur la nature de la mémoire humaine face au temps.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    creditsUsed: 2,
  },
];

const getInitialMusicHistory = (): MusicGeneration[] => [
  {
    id: 'mus_seed_1',
    prompt: 'Composition symphonique spatiale épique, violoncelles dramatiques, trompettes impériales et nappes de synthé analogique',
    title: 'Solar Flare Odyssey',
    model: 'lyria-3-pro-preview',
    mode: 'pro',
    duration: 'Piste Complète (30s)',
    style: 'Cinématique Épique Orchestral',
    mood: 'Inspirant & Héroïque',
    audioUrl: '',
    lyrics: '[Climax Orchestral]\nLa lumière dorée triomphe du vide infini...',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    creditsUsed: 3,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { success: toastSuccess, info: toastInfo, warning: toastWarning } = useToast();

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [imageHistory, setImageHistory] = useState<ImageGeneration[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IMAGES);
      return saved ? JSON.parse(saved) : getInitialImageHistory();
    } catch {
      return getInitialImageHistory();
    }
  });

  const [videoHistory, setVideoHistory] = useState<VideoGeneration[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      return saved ? JSON.parse(saved) : getInitialVideoHistory();
    } catch {
      return getInitialVideoHistory();
    }
  });

  const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSCRIPTIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [storyHistory, setStoryHistory] = useState<StoryGeneration[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STORIES);
      return saved ? JSON.parse(saved) : getInitialStoryHistory();
    } catch {
      return getInitialStoryHistory();
    }
  });

  const [musicHistory, setMusicHistory] = useState<MusicGeneration[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MUSIC);
      return saved ? JSON.parse(saved) : getInitialMusicHistory();
    } catch {
      return getInitialMusicHistory();
    }
  });

  const [transactions, setTransactions] = useState<CreditTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
      return getInitialTransactions();
    } catch {
      return getInitialTransactions();
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Persist user
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  // Persist history & transactions
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(imageHistory));
  }, [imageHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videoHistory));
  }, [videoHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSCRIPTIONS, JSON.stringify(transcriptionHistory));
  }, [transcriptionHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(storyHistory));
  }, [storyHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MUSIC, JSON.stringify(musicHistory));
  }, [musicHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  const login = async (email: string, _pass: string): Promise<boolean> => {
    const existingName = email.split('@')[0];
    const newUser: User = {
      id: 'usr_' + Date.now(),
      email,
      name: existingName.charAt(0).toUpperCase() + existingName.slice(1),
      plan: 'free',
      credits: PRICING_CONFIG.FREE_PLAN_CREDITS,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      createdAt: new Date().toISOString(),
      isPro: false,
    };
    setUser(newUser);
    setTransactions([
      {
        id: 'tx_' + Date.now(),
        type: 'addition',
        category: 'bonus',
        actionName: 'Création de compte (Plan Free)',
        amount: PRICING_CONFIG.FREE_PLAN_CREDITS,
        date: new Date().toISOString(),
        balanceAfter: PRICING_CONFIG.FREE_PLAN_CREDITS,
      },
    ]);
    setIsAuthModalOpen(false);
    toastSuccess('Connexion réussie', `Ravi de vous revoir, ${newUser.name} !`);
    return true;
  };

  const register = async (name: string, email: string, _pass: string): Promise<boolean> => {
    const newUser: User = {
      id: 'usr_' + Date.now(),
      email,
      name,
      plan: 'free',
      credits: PRICING_CONFIG.FREE_PLAN_CREDITS,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      createdAt: new Date().toISOString(),
      isPro: false,
    };
    setUser(newUser);
    setTransactions([
      {
        id: 'tx_' + Date.now(),
        type: 'addition',
        category: 'bonus',
        actionName: 'Bonus d\'inscription Plan Free',
        amount: PRICING_CONFIG.FREE_PLAN_CREDITS,
        date: new Date().toISOString(),
        balanceAfter: PRICING_CONFIG.FREE_PLAN_CREDITS,
      },
    ]);
    setIsAuthModalOpen(false);
    toastSuccess('Compte créé avec succès', `Bienvenue ! +${PRICING_CONFIG.FREE_PLAN_CREDITS} crédits de bienvenue offerts.`, 'coins');
    return true;
  };

  const loginDemo = () => {
    setUser(DEFAULT_USER);
    setIsAuthModalOpen(false);
    toastSuccess('Mode Démo Activé', `Connecté avec succès (${DEFAULT_USER.credits} crédits disponibles).`, 'sparkles');
  };

  const logout = () => {
    setUser(null);
    toastInfo('Session terminée', 'Vous avez été déconnecté avec succès.');
  };

  const upgradeToPro = () => {
    if (!user) return;
    const newBalance = user.credits + PRICING_CONFIG.PRO_PLAN_CREDITS;
    const updated: User = {
      ...user,
      plan: 'pro',
      isPro: true,
      credits: newBalance,
    };
    setUser(updated);

    const tx: CreditTransaction = {
      id: 'tx_' + Date.now(),
      type: 'addition',
      category: 'subscription',
      actionName: 'Abonnement Pro (5 USD via NOWPayments)',
      amount: PRICING_CONFIG.PRO_PLAN_CREDITS,
      date: new Date().toISOString(),
      balanceAfter: newBalance,
    };
    setTransactions((prev) => [tx, ...prev]);
    setIsSubscriptionModalOpen(false);
    toastSuccess(
      'Souscription Pro Activée !',
      `👑 Félicitations ! +${PRICING_CONFIG.PRO_PLAN_CREDITS} crédits ajoutés, Agent IA illimité & exports sans filigrane débloqués.`,
      'crown'
    );
  };

  const deductCredits = (amount: number, reason: string, category: CreditTransaction['category'] = 'image'): boolean => {
    if (!user) {
      setIsAuthModalOpen(true);
      toastWarning('Connexion requise', 'Veuillez vous connecter pour utiliser les outils d\'IA.');
      return false;
    }

    // Pro users get free agent chat
    if (user.isPro && amount === PRICING_CONFIG.CREDIT_COSTS.AGENT_CHAT) {
      return true;
    }

    if (user.credits < amount) {
      setIsSubscriptionModalOpen(true);
      toastWarning('Crédits insuffisants', `Cette action nécessite ${amount} crédit(s). Passez au Plan Pro pour 5 USD ou rechargez vos crédits.`);
      return false;
    }

    const newCredits = Math.max(0, Math.round((user.credits - amount) * 10) / 10);
    setUser({
      ...user,
      credits: newCredits,
    });

    const tx: CreditTransaction = {
      id: 'tx_' + Date.now(),
      type: 'deduction',
      category,
      actionName: reason,
      amount,
      date: new Date().toISOString(),
      balanceAfter: newCredits,
    };
    setTransactions((prev) => [tx, ...prev]);
    toastInfo('Solde mis à jour', `-${amount} crédit(s) utilisé(s). Solde restant : ${newCredits} cr.`, 'coins');

    return true;
  };

  const addCredits = (amount: number, reason = 'Recharge de crédits') => {
    if (!user) return;
    const newCredits = user.credits + amount;
    setUser({
      ...user,
      credits: newCredits,
    });

    const tx: CreditTransaction = {
      id: 'tx_' + Date.now(),
      type: 'addition',
      category: 'subscription',
      actionName: reason,
      amount,
      date: new Date().toISOString(),
      balanceAfter: newCredits,
    };
    setTransactions((prev) => [tx, ...prev]);
    toastSuccess('Crédits ajoutés', `+${amount} crédit(s) crédité(s) sur votre compte. Nouveau solde : ${newCredits} cr.`, 'coins');
  };

  const addImageGeneration = (item: ImageGeneration) => {
    setImageHistory((prev) => [item, ...prev]);
  };

  const addVideoGeneration = (item: VideoGeneration) => {
    setVideoHistory((prev) => [item, ...prev]);
  };

  const addTranscription = (item: TranscriptionItem) => {
    setTranscriptionHistory((prev) => [item, ...prev]);
  };

  const addStoryGeneration = (item: StoryGeneration) => {
    setStoryHistory((prev) => [item, ...prev]);
  };

  const addMusicGeneration = (item: MusicGeneration) => {
    setMusicHistory((prev) => [item, ...prev]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        loginDemo,
        logout,
        upgradeToPro,
        deductCredits,
        addCredits,
        imageHistory,
        videoHistory,
        transcriptionHistory,
        storyHistory,
        musicHistory,
        transactions,
        addImageGeneration,
        addVideoGeneration,
        addTranscription,
        addStoryGeneration,
        addMusicGeneration,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isAuthModalOpen,
        openSubscriptionModal: () => setIsSubscriptionModalOpen(true),
        closeSubscriptionModal: () => setIsSubscriptionModalOpen(false),
        isSubscriptionModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
