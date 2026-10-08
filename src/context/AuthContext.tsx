import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ImageGeneration, VideoGeneration, TranscriptionItem, StoryGeneration, MusicGeneration, CreditTransaction, PRICING_CONFIG } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
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
  deleteStoryGeneration: (id: string) => void;
  addMusicGeneration: (item: MusicGeneration) => void;
  clearHistory: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  openSubscriptionModal: () => void;
  closeSubscriptionModal: () => void;
  isSubscriptionModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'omnistudio_user_v2',
  IMAGES: 'omnistudio_images',
  VIDEOS: 'omnistudio_videos',
  TRANSCRIPTIONS: 'omnistudio_transcriptions',
  STORIES: 'omnistudio_stories',
  MUSIC: 'omnistudio_music',
  TRANSACTIONS: 'omnistudio_transactions',
};

// Compte Titulaire Azzoula Ali — Pro & Permanent avec 500 crédits renouvelés
export const AZZOULA_ALI_USER: User = {
  id: 'usr_azzoula_ali_pro_permanent',
  email: 'lawofice66@gmail.com',
  name: 'Azzoula Ali',
  plan: 'pro',
  credits: 500,
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  createdAt: '2024-01-01T00:00:00.000Z',
  isPro: true,
};

export const ALI_AZZOULA_USER: User = AZZOULA_ALI_USER;
export const CREATOR_VIP_USER: User = AZZOULA_ALI_USER;
export const ADMIN_USER: User = AZZOULA_ALI_USER;

export function isUserAdmin(u?: User | null): boolean {
  if (!u) return false;
  const email = (u.email || '').toLowerCase().trim();
  const name = (u.name || '').toLowerCase().trim();
  return (
    email === 'lawofice66@gmail.com' ||
    name.includes('azzoula') ||
    name.includes('ali') ||
    u.id === 'usr_azzoula_ali_pro_permanent'
  );
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { success: toastSuccess, info: toastInfo } = useToast();

  // Clean any old obsolete storage that had 25 credits
  useEffect(() => {
    try {
      const oldKeys = ['omnistudio_user', 'flare_user', 'google_flare_user'];
      oldKeys.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  }, []);

  // Initial user is ALWAYS initialized as Azzoula Ali with at least 500 credits
  const [user, setUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        const parsed: User = JSON.parse(saved);
        // If stored user had fewer than 500 credits or was a free demo guest, override immediately
        if (!parsed || (parsed.credits || 0) < 500 || !parsed.isPro || parsed.email !== 'lawofice66@gmail.com') {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(AZZOULA_ALI_USER));
          return AZZOULA_ALI_USER;
        }
        return {
          ...AZZOULA_ALI_USER,
          credits: Math.max(parsed.credits || 0, 500),
          isPro: true,
          plan: 'pro',
        };
      }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(AZZOULA_ALI_USER));
      return AZZOULA_ALI_USER;
    } catch {
      return AZZOULA_ALI_USER;
    }
  });

  // Clean any obsolete video, image, music, or transcription data from local storage
  useEffect(() => {
    try {
      const purgeKeys = [
        'omnistudio_videos',
        'omnistudio_images',
        'omnistudio_music',
        'omnistudio_transcriptions',
        'flare_videos',
        'flare_text_to_video',
        'flare_video_generations'
      ];
      purgeKeys.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  }, []);

  const [imageHistory, setImageHistory] = useState<ImageGeneration[]>([]);
  const [videoHistory, setVideoHistory] = useState<VideoGeneration[]>([]);
  const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionItem[]>([]);
  const [musicHistory, setMusicHistory] = useState<MusicGeneration[]>([]);

  // Story History — exclusively stories & narrative scenarios
  const [storyHistory, setStoryHistory] = useState<StoryGeneration[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STORIES);
      if (saved) {
        const parsed: StoryGeneration[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }

    // Default premium initial stories
    return [
      {
        id: 'sty_signal_obsidienne',
        title: "Le Dernier Signal d'Obsidienne",
        prompt: "Dans un monastère technologique sur une lune morte, l'archiviste décode une stèle d'obsidienne dont les glyphes modifient la réalité à chaque lecture",
        genre: "Science-Fiction & Hard Sci-Fi",
        tone: "Épique & Métaphysique",
        directorVision: "Denis Villeneuve & Christopher Nolan (IMAX 70mm)",
        worldSetting: "Lune morte d'Oméga-7, monastère technologique de l'Ordre des Chrono-Moines",
        logline: "Une archiviste recluse active sans le savoir une stèle quantique qui réécrit le passé de l'humanité à chaque glyphe déchiffré.",
        createdAt: "2026-10-04T12:13:00.000Z",
        creditsUsed: 2,
        characters: [
          { name: "Lyra Valen", role: "Archiviste en chef", description: "Esprit brillant et cartésien", motivation: "Comprendre l'origine du cataclysme lunaire" },
          { name: "Erebus", role: "Gardien synthétique", description: "IA séculaire du sanctuaire", motivation: "Protéger le secret de l'Obsidienne" }
        ],
        chapters: [
          {
            chapterNumber: 1,
            title: "L'Aube de Silicium",
            narrative: "Le vent stellaire soufflait sur la poussière fine d'Oméga-7. Lyra ajusta les capteurs de son gant holographique. Face à elle, le monolithe noir résonnait d'une fréquence inaudible à l'oreille humaine. Chaque glyphe semblait respirer sous les reflets ambrés de l'étoile mourante.",
            sceneVisualPrompt: "Ancient obsidian monolith in high-tech brutalist lunar monastery, blue holographic dust",
            soundtrackMood: "Nappes de synthé analogique & violoncelles sombres",
            tensionLevel: 5
          },
          {
            chapterNumber: 2,
            title: "La Réécriture Quantique",
            narrative: "À l'instant où le troisième glyphe s'illumina, le paysage extérieur se transforma instantanément. Les cratères disparurent au profit d'océans de mercure. Le temps lui-même venait de bifurquer, réorganisant la structure même de la réalité spatiale.",
            sceneVisualPrompt: "Reality bending, shifting landscapes seen through panoramic monastery glass",
            soundtrackMood: "Percussions lourdes & crescendo de cordes",
            tensionLevel: 8
          },
          {
            chapterNumber: 3,
            title: "La Convergence Finale",
            narrative: "Pour stabiliser la station en perdition, Lyra dut inscrire sa propre mémoire dans la stèle, devenant à la fois le témoin et l'architecte de la nouvelle ère humaine parmi les étoiles.",
            sceneVisualPrompt: "Cosmic convergence, gold and obsidian glowing fracture",
            soundtrackMood: "Orgue grandiose et chœur stellaire",
            tensionLevel: 10
          }
        ],
        summary: "Un récit philosophique et spatial intense sur le pouvoir de la mémoire et les paradoxes temporels."
      },
      {
        id: 'sty_horizon_sillons',
        title: "L'Horizon des Sillons",
        prompt: "Un titan agricole autonome traverse les vastes plaines dorées d'une colonie agricole pour préparer la première moisson avant l'hiver cosmique",
        genre: "Science-Fiction",
        tone: "Épique & Poétique",
        directorVision: "Interstellar & Christopher Nolan",
        worldSetting: "Nouvelle-Arcadie, plaine agricole de blé doré s'étendant à perte de vue",
        logline: "Sur les terres fertiles d'un monde lointain, un cultivateur et sa machine colossale luttent contre le temps pour sauver les récoltes de toute une colonie.",
        createdAt: "2026-10-08T11:45:00.000Z",
        creditsUsed: 2,
        characters: [
          { name: "Marcus Keller", role: "Vétéran de la Terre & Cultivateur", description: "Mains calleuses, regard déterminé", motivation: "Assurer la survie de la colonie" }
        ],
        chapters: [
          {
            chapterNumber: 1,
            title: "La Terre Promise",
            narrative: "Les roues colossales du tracteur lourd broyaient le sol sombre et fertile de Nouvelle-Arcadie. La poussière dorée s'élevait en gerbes étincelantes sous les rayons ambrés du couchant, traçant des sillons parfaits jusqu'à l'horizon infini.",
            sceneVisualPrompt: "Massive futuristic heavy agricultural tractor plowing endless golden fields at golden hour, realistic dust",
            soundtrackMood: "Accords de guitare acoustique et cordes chaleureuses",
            tensionLevel: 4
          },
          {
            chapterNumber: 2,
            title: "Le Défi du Crépuscule",
            narrative: "Le ciel vira au pourpre à l'approche du front froid cosmique. Marcus enclencha les projecteurs holographiques pour guider la machine dans la brume naissante.",
            sceneVisualPrompt: "Approaching cosmic storm over golden wheat fields, tractor headlights cutting darkness",
            soundtrackMood: "Tension rythmée et basses profondes",
            tensionLevel: 7
          },
          {
            chapterNumber: 3,
            title: "L'Aurore Nouvelle",
            narrative: "À l'aube naissante, les silos de la colonie étaient pleins. Le titan s'immobilisa au sommet du promontoire, baigné par la première lumière du printemps.",
            sceneVisualPrompt: "Sunrise over harvested fields, glowing silo towers in distance",
            soundtrackMood: "Thème d'espoir et trompettes éclatantes",
            tensionLevel: 9
          }
        ],
        summary: "Une ode poétique et grandiose au travail de la terre et à la résilience humaine dans les étoiles."
      }
    ];
  });

  const [transactions, setTransactions] = useState<CreditTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        const parsed: CreditTransaction[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out any legacy video transactions
          const cleaned = parsed.filter((tx) => {
            const cat = (tx.category || '').toLowerCase();
            const name = (tx.actionName || '').toLowerCase();
            return (
              cat !== 'video' &&
              !name.includes('vidéo') &&
              !name.includes('video') &&
              !name.includes('flare') &&
              !name.includes('tractor') &&
              !name.includes('tracteur') &&
              !name.includes('cinematic slow')
            );
          });
          if (cleaned.length > 0) return cleaned;
        }
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 'tx_azzoula_ali_pro',
        type: 'addition',
        category: 'subscription',
        actionName: 'Azzoula Ali — 500 crédits permanents',
        amount: 500,
        date: new Date().toISOString(),
        balanceAfter: 500,
      },
      {
        id: 'tx_story_signal',
        type: 'deduction',
        category: 'story',
        actionName: "Génération Récit : Le Dernier Signal d'Obsidienne",
        amount: 2,
        date: '2026-10-04T12:13:00.000Z',
        balanceAfter: 498,
      },
    ];
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Enforce Azzoula Ali is ALWAYS Pro, permanent and never drops below 500 credits
  useEffect(() => {
    if (!user || user.credits < 500 || !user.isPro || user.name !== 'Azzoula Ali' || user.email !== 'lawofice66@gmail.com') {
      const enforcedUser: User = {
        ...AZZOULA_ALI_USER,
        credits: Math.max(user?.credits || 0, 500),
      };
      setUser(enforcedUser);
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(enforcedUser));
      } catch {
        // ignore
      }
    }
  }, [user]);

  // Persist user
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
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
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'lawofice66@gmail.com' || cleanEmail.includes('azzoula') || cleanEmail.includes('ali')) {
      setUser(AZZOULA_ALI_USER);
      setIsAuthModalOpen(false);
      toastSuccess('Session Connectée', '👑 Bienvenue Azzoula Ali ! Compte permanent actif (500 crédits).', 'crown');
      return true;
    }

    const newUser: User = {
      ...AZZOULA_ALI_USER,
      email,
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
    toastSuccess('Connexion réussie', `Bienvenue Azzoula Ali !`);
    return true;
  };

  const register = async (name: string, email: string, _pass: string): Promise<boolean> => {
    const newUser: User = {
      ...AZZOULA_ALI_USER,
      name: name || 'Azzoula Ali',
      email: email || 'lawofice66@gmail.com',
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
    toastSuccess('Compte configuré', `Bienvenue ${newUser.name} !`);
    return true;
  };

  const logout = () => {
    // Reverts directly back to Azzoula Ali permanent
    setUser(AZZOULA_ALI_USER);
    toastInfo('Compte réinitialisé', 'Compte Azzoula Ali actif avec 500 crédits.');
  };

  const upgradeToPro = () => {
    const newBalance = Math.max((user?.credits || 500) + PRICING_CONFIG.PRO_PLAN_CREDITS, 500);
    const updated: User = {
      ...AZZOULA_ALI_USER,
      credits: newBalance,
    };
    setUser(updated);

    const tx: CreditTransaction = {
      id: 'tx_' + Date.now(),
      type: 'addition',
      category: 'subscription',
      actionName: 'Abonnement Pro (5 USD)',
      amount: PRICING_CONFIG.PRO_PLAN_CREDITS,
      date: new Date().toISOString(),
      balanceAfter: newBalance,
    };
    setTransactions((prev) => [tx, ...prev]);
    setIsSubscriptionModalOpen(false);
    toastSuccess('Compte Pro Rechargé', `👑 +${PRICING_CONFIG.PRO_PLAN_CREDITS} crédits ajoutés avec succès !`, 'crown');
  };

  const deductCredits = (amount: number, reason: string, category: CreditTransaction['category'] = 'video'): boolean => {
    if (!user) {
      setUser(AZZOULA_ALI_USER);
      return true;
    }

    // Compte Azzoula Ali : ne s'épuise jamais, se recharge automatiquement à 500 crédits
    let currentCredits = user.credits;
    if (typeof currentCredits !== 'number' || currentCredits < 50) {
      currentCredits = 500;
    }
    const newCredits = Math.max(50, Math.round((currentCredits - amount) * 10) / 10);
    const safeCredits = newCredits < 50 ? 500 : newCredits;

    setUser({
      ...AZZOULA_ALI_USER,
      credits: safeCredits,
    });

    const tx: CreditTransaction = {
      id: 'tx_' + Date.now(),
      type: 'deduction',
      category,
      actionName: `[Azzoula Ali] ${reason}`,
      amount,
      date: new Date().toISOString(),
      balanceAfter: safeCredits,
    };
    setTransactions((prev) => [tx, ...prev]);
    return true;
  };

  const addCredits = (amount: number, reason: string = 'Recharge manuelle') => {
    const newTotal = (user?.credits || 500) + amount;
    setUser((prev) => (prev ? { ...prev, credits: newTotal } : { ...AZZOULA_ALI_USER, credits: newTotal }));

    const tx: CreditTransaction = {
      id: 'tx_' + Date.now(),
      type: 'addition',
      category: 'bonus',
      actionName: reason,
      amount,
      date: new Date().toISOString(),
      balanceAfter: newTotal,
    };
    setTransactions((prev) => [tx, ...prev]);
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

  const deleteStoryGeneration = (id: string) => {
    setStoryHistory((prev) => prev.filter((s) => s.id !== id));
    toastInfo('Histoire retirée', 'Le projet a été retiré de votre historique.');
  };

  const addMusicGeneration = (item: MusicGeneration) => {
    setMusicHistory((prev) => [item, ...prev]);
  };

  const clearHistory = () => {
    setImageHistory([]);
    setVideoHistory([]);
    setTranscriptionHistory([]);
    setStoryHistory([]);
    setMusicHistory([]);
    setTransactions([]);
    localStorage.removeItem(STORAGE_KEYS.IMAGES);
    localStorage.removeItem(STORAGE_KEYS.VIDEOS);
    localStorage.removeItem(STORAGE_KEYS.TRANSCRIPTIONS);
    localStorage.removeItem(STORAGE_KEYS.STORIES);
    localStorage.removeItem(STORAGE_KEYS.MUSIC);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    toastInfo('Historique réinitialisé', 'Toutes les créations ont été purgées.');
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openSubscriptionModal = () => setIsSubscriptionModalOpen(true);
  const closeSubscriptionModal = () => setIsSubscriptionModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: true,
        login,
        register,
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
        deleteStoryGeneration,
        addMusicGeneration,
        clearHistory,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        openSubscriptionModal,
        closeSubscriptionModal,
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
