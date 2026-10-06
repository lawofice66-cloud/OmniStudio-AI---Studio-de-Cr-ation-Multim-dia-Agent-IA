import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  Coins, 
  Crown, 
  Image, 
  Video, 
  Play, 
  Wand2, 
  Smartphone,
  Clapperboard,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PRICING_CONFIG, ChatMessage } from '../types';
import { safeFetchJson } from '../utils/apiSafeClient';

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPromptToImage?: (prompt: string) => void;
  onApplyPromptToVideo?: (prompt: string, ratio?: '16:9' | '9:16', autoStart?: boolean) => void;
}

export interface ExtractedPrompt {
  prompt: string;
  variantNum: number;
  label: string;
  ratio: '16:9' | '9:16';
}

// Helper to extract prompts from text with high accuracy
function extractPromptsFromText(content: string): ExtractedPrompt[] {
  const prompts: ExtractedPrompt[] = [];
  // Match PROMPT VEO 3 (EN) or similar patterns
  const regex = /(?:PROMPT(?:\s+VEO\s+3)?(?:\s*\([A-Z]+\))?\s*\*\*?\s*:\s*|PROMPT(?:\s+VEO\s+3)?(?:\s*\([A-Z]+\))?\s*:\s*)(?:[`"']?)([^`"'\n\r]+(?:\n[^`"'\r\n]+)*)(?:[`"']?)/gi;
  let match;
  let idx = 1;
  while ((match = regex.exec(content)) !== null) {
    if (match[1] && match[1].trim().length > 15) {
      const cleanPrompt = match[1].trim().replace(/^[`"']|[`"']$/g, '');
      const isVertical = cleanPrompt.includes('9:16') || cleanPrompt.toLowerCase().includes('tiktok') || cleanPrompt.toLowerCase().includes('vertical');
      const label = idx === 1 
        ? 'Cinématique 16:9' 
        : idx === 2 
        ? 'TikTok 9:16' 
        : 'Style Artistique';

      prompts.push({
        prompt: cleanPrompt,
        variantNum: idx,
        label,
        ratio: isVertical ? '9:16' : '16:9',
      });
      idx++;
    }
  }
  return prompts;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_init',
    role: 'assistant',
    content: `Bonjour ! Je suis **Nova**, votre Prompt Engineer Vidéo & Multimédia mondial pour **Google Veo 3**, Kling 2.1, Luma et Flux 1.1 Pro. 🚀

Donnez-moi **N'IMPORTE QUELLE IDÉE** sans aucune restriction :
- 🎬 Pub produit, TikTok viral 9:16, Reels Instagram, YouTube Shorts
- 🍿 Cinéma : action, romance, sci-fi, horreur, thriller
- 💼 Business : immobilier de luxe, restaurant, mode, supercar, coaching
- 🎨 Anime japonais, 3D Pixar, dessin animé vintage, ultra-réaliste 8K
- 🦖 Concepts insolites ou décalés (*"dinosaure faisant du skate à Dubaï"*, etc.)

Dites-moi simplement : *"Je veux une vidéo de..."* et je vous génère **3 prompts pro cinéma prêts pour Veo 3** !`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

const SUGGESTIONS = [
  "🦖 Dinosaure qui fait du skate à Dubaï",
  "👗 Défilé de mode haute couture à Paris sous la pluie",
  "📱 Vidéo virale TikTok 9:16 pour vendre des sneakers",
  "🏎️ Supercar cyberpunk filant de nuit à 300 km/h",
  "🍣 Gros plan ralenti 120fps sur découpe de sushi",
  "🚀 Vaisseau spatial explorant une nébuleuse pourpre",
];

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  isOpen,
  onClose,
  onApplyPromptToImage,
  onApplyPromptToVideo,
}) => {
  const { user, deductCredits } = useAuth();
  const { success: toastSuccess, info: toastInfo } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const cost = PRICING_CONFIG.CREDIT_COSTS.AGENT_CHAT;

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    // Verify credits (free for pro users)
    const canDeduct = deductCredits(cost, `Agent Nova : ${text.slice(0, 24)}...`, 'agent');
    if (!canDeduct) return;

    const userMessage: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const apiRes = await safeFetchJson<{ reply?: string }>('/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userContext: {
            name: user?.name,
            plan: user?.plan,
            credits: user?.credits,
            isPro: user?.isPro,
          },
        }),
      }, 14000);

      let replyContent = '';
      if (apiRes.ok && apiRes.data?.reply) {
        replyContent = apiRes.data.reply;
      } else {
        // Universal Prompt Engineer fallback for ANY concept
        const cleanIdea = text.replace(/^(je veux|génère|fais|crée|donne-moi|vidéo de|une vidéo de)\s*/i, '').trim() || text;

        replyContent = `Voici 3 prompts cinématographiques professionnels prêts pour **Google Veo 3** pour votre idée : **"${cleanIdea}"**

🎬 **Variante 1 : Cinématique 16:9 (Cinéma / YouTube 4K)**
- **PROMPT VEO 3 (EN)** : \`Cinematic wide tracking shot of ${cleanIdea}, shot on 35mm anamorphic lens, 8K photorealistic textures, volumetric golden hour illumination, subtle atmospheric haze, natural shallow depth of field, award-winning cinematography, immersive spatial ambient sound design, 60fps [16:9]\`
- **EXPLICATION (FR)** : Mise en scène plein écran ultra-réaliste avec éclairage volumétrique et profondeur de champ cinéma.

📱 **Variante 2 : Vertical 9:16 (TikTok Viral / Instagram Reels / Shorts)**
- **PROMPT VEO 3 (EN)** : \`Dynamic vertical 9:16 viral sequence of ${cleanIdea}, explosive action hook from opening second, vibrant high-contrast colors, crisp 4K smartphone clarity, rapid camera momentum, trending sound design effects [9:16]\`
- **EXPLICATION (FR)** : Cadrage vertical ultra-rythmé captant immédiatement le regard sur mobile dès la 1ère seconde.

🎨 **Variante 3 : Style Artistique (3D Pixar / Unreal Engine 5)**
- **PROMPT VEO 3 (EN)** : \`Stylized 3D cinematic animation in Pixar Unreal Engine 5 aesthetic of ${cleanIdea}, heartwarming expressive emotion, whimsical warm lighting, rich volumetric dust particles, charming stylized depth, studio orchestral soundtrack [16:9]\`
- **EXPLICATION (FR)** : Animation 3D stylisée pleine de charme avec éclairage féerique et expressions vivantes.

👇 *Cliquez ci-dessous sur le bouton pour transférer directement votre prompt préféré dans le Studio Vidéo et lancer le rendu Veo 3 !*`;
      }

      const botMessage: ChatMessage = {
        id: 'bot_' + Date.now(),
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.warn('Agent chat fallback:', err);
      const botMessage: ChatMessage = {
        id: 'bot_' + Date.now(),
        role: 'assistant',
        content: `Voici votre prompt cinématique optimisé pour **Google Veo 3** :

**PROMPT VEO 3 (EN)** : \`Cinematic 8K wide shot of ${text}, shot on 35mm lens, volumetric lighting, photorealistic textures, shallow depth of field, award-winning cinematography, atmospheric audio [16:9]\`

Cliquez sur "Utiliser dans le Studio Vidéo" ci-dessous pour lancer la génération !`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toastSuccess('Copié !', 'Prompt copié dans le presse-papier.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyToVideoStudio = (promptText: string, ratio: '16:9' | '9:16' = '16:9', autoStart = false) => {
    if (onApplyPromptToVideo) {
      onApplyPromptToVideo(promptText, ratio, autoStart);
      toastSuccess('Prompt Injecté !', `Transféré au Studio Vidéo Veo 3 (${ratio}). Prêt à générer.`);
      onClose();
    }
  };

  const handleApplyToImageStudio = (promptText: string) => {
    if (onApplyPromptToImage) {
      onApplyPromptToImage(promptText);
      toastSuccess('Prompt Injecté !', 'Transféré au Studio Image 8K.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg h-full glass-panel border-l border-white/10 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-indigo-600 p-0.5 shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Agent IA Nova</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Prompt Engineer Vidéo Universel (Veo 3, Kling, Luma)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user?.isPro ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" />
                Illimité Pro
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-medium flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-400" />
                {cost} cr / msg
              </span>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isBot = msg.role === 'assistant';
            const extractedPrompts = isBot ? extractPromptsFromText(msg.content) : [];
            const hasPrompts = extractedPrompts.length > 0;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                {isBot && (
                  <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-purple-400" />
                  </div>
                )}

                <div
                  className={`relative max-w-[88%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                    isBot
                      ? 'bg-slate-900/90 border border-white/10 text-slate-200 shadow-md'
                      : 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/20'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Direct One-Click Video Injection Actions if prompts are present */}
                  {isBot && hasPrompts && (
                    <div className="pt-2.5 border-t border-white/10 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
                          <span>Prompts Veo 3 prêts à générer :</span>
                        </span>
                        <span className="text-[9px] text-slate-400 font-normal">1-clic pour transférer</span>
                      </div>
                      <div className="space-y-1.5">
                        {extractedPrompts.map((p, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => handleApplyToVideoStudio(p.prompt, p.ratio, false)}
                            className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-pink-600/90 via-rose-600/90 to-amber-600/90 hover:from-pink-500 hover:to-amber-500 text-white text-[11px] font-bold shadow-md transition-all flex items-center justify-between gap-2 cursor-pointer hover:scale-[1.01]"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <Play className="w-3.5 h-3.5 fill-white shrink-0" />
                              <span className="truncate">Utiliser ce prompt pour générer ({p.label})</span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-mono text-amber-200 border border-amber-300/20 shrink-0">
                              {p.ratio}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer actions bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>

                    {isBot && (
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                          title="Copier la réponse"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === msg.id ? 'Copié' : 'Copier'}</span>
                        </button>

                        {onApplyPromptToVideo && (
                          <button
                            onClick={() => {
                              const first = extractedPrompts[0];
                              const promptToUse = first ? first.prompt : msg.content;
                              const ratioToUse = first ? first.ratio : '16:9';
                              handleApplyToVideoStudio(promptToUse, ratioToUse, false);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title="Utiliser ce prompt pour générer avec Veo 3"
                          >
                            <Video className="w-3 h-3 text-pink-400" />
                            <span>Utiliser ce prompt pour générer</span>
                          </button>
                        )}

                        {onApplyPromptToImage && (
                          <button
                            onClick={() => {
                              const promptToUse = extractedPrompts[0]?.prompt || msg.content;
                              handleApplyToImageStudio(promptToUse);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title="Utiliser dans le Studio Image"
                          >
                            <Image className="w-3 h-3 text-indigo-400" />
                            <span>Studio Image</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
              </div>
              <div className="rounded-2xl p-3 bg-slate-900 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>Nova conçoit vos 3 prompts Veo 3 ultra-détaillés...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions Carousel */}
        <div className="px-4 py-2 border-t border-white/5 bg-slate-950/60 overflow-x-auto scrollbar-none flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 font-bold shrink-0">Exemples :</span>
          {SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(sug)}
              className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-[11px] whitespace-nowrap transition-all shrink-0 cursor-pointer"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Input Box Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/60 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tapez n'importe quel sujet vidéo (film, pub, TikTok, anime, absurde)..."
              disabled={loading}
              className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-40 cursor-pointer shadow-lg shadow-purple-600/30 shrink-0"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 px-1 font-mono">
            <span>Moteurs : Veo 3 • Kling 2.1 • Luma • Flux 1.1</span>
            <span>Gratuit & illimité en Pro</span>
          </div>
        </div>

      </div>
    </div>
  );
};
