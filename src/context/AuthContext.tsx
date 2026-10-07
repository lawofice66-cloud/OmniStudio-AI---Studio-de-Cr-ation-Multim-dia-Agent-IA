import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ImageGeneration, VideoGeneration, TranscriptionItem, StoryGeneration, MusicGeneration, CreditTransaction, PRICING_CONFIG } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  loginDemo: () => void;
  loginWithAdminSecret: (secret: string) => boolean;
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

export const ADMIN_SECRET_KEY = 'fallen75_secret_2024';
const STORAGE_ADMIN_KEY = 'omnistudio_admin_secret';

// Compte Créateur Invité VIP réservé à l'administrateur avec 500 crédits Pro permanents
export const CREATOR_VIP_USER: User = {
  id: 'usr_createur_invite_500',
  email: 'lawofice66@gmail.com',
  name: 'Créateur Invité',
  plan: 'pro',
  credits: 500, // Toujours 500 crédits
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  createdAt: new Date().toISOString(),
  isPro: true, // Toujours Pro
};

export const ADMIN_USER: User = CREATOR_VIP_USER;

// Compte visiteur public standard (Plan Free, 25 crédits d'essai)
export const DEFAULT_PUBLIC_VISITOR: User = {
  id: 'usr_visiteur_public',
  email: 'visiteur@omnistudio.ai',
  name: 'Visiteur',
  plan: 'free',
  credits: PRICING_CONFIG.FREE_PLAN_CREDITS, // 25 crédits
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  createdAt: new Date().toISOString(),
  isPro: false,
};

export const DEFAULT_GUEST_USER: User = DEFAULT_PUBLIC_VISITOR;

export function isUserAdmin(u?: User | null): boolean {
  if (!u) return false;
  return (
    u.email === 'lawofice66@gmail.com' ||
    u.email === 'createur@omnistudio.ai' ||
    u.email === 'alexandre@studio.com' ||
    u.name === 'Alexandre Studio' ||
    (u.name === 'Créateur Invité' && (u.isPro || u.credits >= 100))
  );
}

// Initial default user fallback (Visiteur public avec 25 crédits)
const DEFAULT_USER: User = DEFAULT_PUBLIC_VISITOR;

// Seed clean initial transactions (25 credits for Free user)
const getInitialTransactions = (): CreditTransaction[] => [
  {
    id: 'tx_seed_1',
    type: 'addition',
    category: 'bonus',
    actionName: "Bonus d'inscription Plan Free (25 crédits offerts)",
    amount: 25,
    date: new Date().toISOString(),
    balanceAfter: 25,
  },
];

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
      // 1. Check URL for secret admin parameter (?admin=fallen75_secret_2024 or #admin=fallen75_secret_2024)
      let hasUrlAdmin = false;
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') === ADMIN_SECRET_KEY || window.location.hash.includes(ADMIN_SECRET_KEY)) {
          hasUrlAdmin = true;
          localStorage.setItem(STORAGE_ADMIN_KEY, ADMIN_SECRET_KEY);
        }
      }

      // 2. Check secret key in localStorage
      const storedSecret = localStorage.getItem(STORAGE_ADMIN_KEY);
      if (hasUrlAdmin || storedSecret === ADMIN_SECRET_KEY) {
        return { ...CREATOR_VIP_USER, credits: 500, isPro: true, plan: 'pro' };
      }

      // 3. For normal users, read standard user or fallback to guest
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        const parsed: User = JSON.parse(saved);
        // Security: If account is VIP but secret is missing, do NOT grant admin
        if (isUserAdmin(parsed)) {
          if (storedSecret !== ADMIN_SECRET_KEY) {
            return DEFAULT_PUBLIC_VISITOR;
          }
          return { ...CREATOR_VIP_USER, credits: 500, isPro: true, plan: 'pro' };
        }
        // If a standard Free user had old fractional seed credits (like 22.5 or 14.5), reset to 25
        if (!parsed.isPro && (parsed.credits === 22.5 || parsed.credits === 14.5 || parsed.credits === 23 || parsed.credits === 17.5 || parsed.credits === 16.5)) {
          return { ...parsed, credits: 25 };
        }
        return parsed;
      }
      return DEFAULT_PUBLIC_VISITOR;
    } catch {
      return DEFAULT_PUBLIC_VISITOR;
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

  // Enforce Créateur Invité is ALWAYS Pro and 500 credits
  useEffect(() => {
    if (user && isUserAdmin(user)) {
      if (!user.isPro || user.plan !== 'pro' || user.credits < 25) {
        setUser({
          ...user,
          name: 'Créateur Invité',
          isPro: true,
          plan: 'pro',
          credits: 500,
        });
      }
    }
  }, [user]);

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

  const login = async (email: string, pass: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Vérification des identifiants exclusifs du compte Créateur Invité (500 crédits Pro)
    const isOwnerEmail = cleanEmail === 'lawofice66@gmail.com' || cleanEmail === 'createur@omnistudio.ai' || cleanEmail === 'alexandre@studio.com';
    const isSecretPass = cleanPass === ADMIN_SECRET_KEY;

    if (isOwnerEmail || isSecretPass) {
      if (!isSecretPass && cleanPass.length < 4) {
        toastWarning('Mot de passe requis', 'Veuillez saisir votre mot de passe pour accéder au compte Créateur Invité.');
        return false;
      }

      localStorage.setItem(STORAGE_ADMIN_KEY, ADMIN_SECRET_KEY);
      const vipUser: User = {
        ...CREATOR_VIP_USER,
        email: cleanEmail.includes('@') ? cleanEmail : CREATOR_VIP_USER.email,
        name: 'Créateur Invité',
        credits: 500,
        isPro: true,
        plan: 'pro',
      };
      setUser(vipUser);
      setTransactions([
        {
          id: 'tx_vip_' + Date.now(),
          type: 'addition',
          category: 'subscription',
          actionName: 'Solde Créateur Invité (500 crédits Pro)',
          amount: 500,
          date: new Date().toISOString(),
          balanceAfter: 500,
        },
      ]);
      setIsAuthModalOpen(false);
      toastSuccess('Session Créateur Débloquée', '👑 Bienvenue Créateur Invité ! Vos 500 crédits Pro sont disponibles.', 'crown');
      return true;
    }

    // Utilisateur public normal
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
        actionName: 'Connexion (Plan Free)',
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

  const loginWithAdminSecret = (secret: string): boolean => {
    if (secret.trim() === ADMIN_SECRET_KEY) {
      localStorage.setItem(STORAGE_ADMIN_KEY, ADMIN_SECRET_KEY);
      const admin: User = {
        ...CREATOR_VIP_USER,
        name: 'Créateur Invité',
        credits: 500,
        isPro: true,
        plan: 'pro',
      };
      setUser(admin);
      setTransactions([
        {
          id: 'tx_vip_' + Date.now(),
          type: 'addition',
          category: 'subscription',
          actionName: 'Accès Compte Créateur Invité VIP (500 crédits Pro)',
          amount: 500,
          date: new Date().toISOString(),
          balanceAfter: 500,
        },
      ]);
      setIsAuthModalOpen(false);
      toastSuccess('Accès Administrateur Débloqué', '👑 Bienvenue Créateur Invité ! Compte Pro permanent (500 crédits).', 'crown');
      return true;
    }
    toastWarning('Code Incorrect', 'Accès administrateur refusé.');
    return false;
  };

  const loginDemo = () => {
    // Normal guest login, 25 credits
    setUser(DEFAULT_PUBLIC_VISITOR);
    setIsAuthModalOpen(false);
    toastSuccess('Session Démarée', `Connecté en mode visiteur (${DEFAULT_PUBLIC_VISITOR.credits} crédits d'essai disponibles).`, 'sparkles');
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_ADMIN_KEY);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(DEFAULT_PUBLIC_VISITOR);
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

    // 1. Compte ADMIN (Alexandre Studio) : toujours Pro, 500 crédits, ne descend jamais en négatif
    if (isUserAdmin(user)) {
      let currentCredits = user.credits;
      if (typeof currentCredits !== 'number' || currentCredits < 25) {
        currentCredits = 500;
      }
      const newCredits = Math.max(25, Math.round((currentCredits - amount) * 10) / 10);
      setUser({
        ...user,
        isPro: true,
        plan: 'pro',
        credits: newCredits < 25 ? 500 : newCredits,
      });

      const tx: CreditTransaction = {
        id: 'tx_' + Date.now(),
        type: 'deduction',
        category,
        actionName: `[Admin] ${reason}`,
        amount,
        date: new Date().toISOString(),
        balanceAfter: newCredits < 25 ? 500 : newCredits,
      };
      setTransactions((prev) => [tx, ...prev]);
      return true;
    }

    // Pro users get free agent chat
    if (user.isPro && amount === PRICING_CONFIG.CREDIT_COSTS.AGENT_CHAT) {
      return true;
    }

    // 2. Utilisateurs normaux : bloque si crédits insuffisants, jamais en négatif
    if (user.credits < amount) {
      setIsSubscriptionModalOpen(true);
      toastWarning('Crédits insuffisants', `Crédits insuffisants. Vous avez ${user.credits} crédits. 1 vidéo = ${amount} crédits. Passez Pro pour 500 crédits à 5$.`);
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
        loginWithAdminSecret,
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
