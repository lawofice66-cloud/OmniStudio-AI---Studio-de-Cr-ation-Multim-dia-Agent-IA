import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, RefreshCw, Copy, Check, ArrowRight, Coins, Crown, MessageSquare, Image, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PRICING_CONFIG, ChatMessage } from '../types';

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPromptToImage?: (prompt: string) => void;
  onApplyPromptToVideo?: (prompt: string) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_init',
    role: 'assistant',
    content: "Bonjour ! Je suis **Nova**, votre Agent IA d'accompagnement sur OmniStudio AI. 🚀\n\nJe suis là pour vous aider à :\n- Concevoir des **prompts ultra-efficaces** pour vos images et vidéos,\n- Structurer vos idées de scénarios,\n- Exploiter au mieux vos crédits (Plan Free ou Pro 5$/mois).\n\nQue souhaitez-vous créer aujourd'hui ?",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

const SUGGESTIONS = [
  "Aide-moi à créer un prompt d'image photoréaliste",
  "Écris un script vidéo pour TikTok de 5 secondes",
  "Comment optimiser mes crédits ?",
  "Idées de visuels pour une marque de luxe",
];

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  isOpen,
  onClose,
  onApplyPromptToImage,
  onApplyPromptToVideo,
}) => {
  const { user, deductCredits, openSubscriptionModal } = useAuth();
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
    const canDeduct = deductCredits(cost, `Agent IA : ${text.slice(0, 25)}...`, 'agent');
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
      const response = await fetch('/api/agent-chat', {
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
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Erreur de l\'agent.');
      }

      const botMessage: ChatMessage = {
        id: 'bot_' + Date.now(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content: "Désolé, une erreur est survenue lors de la communication. Veuillez réessayer.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg h-full glass-panel border-l border-white/10 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 p-0.5 shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Agent IA Nova</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-400">Co-pilote créatif & Guide OmniStudio</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user?.isPro ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" />
                Illimité
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-medium flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-400" />
                {cost} cr / msg
              </span>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isBot = msg.role === 'assistant';
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
                  className={`relative max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                    isBot
                      ? 'bg-slate-900 border border-white/10 text-slate-200 shadow-md'
                      : 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/20'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>

                    {isBot && (
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-white transition-colors"
                          title="Copier la réponse"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>

                        {onApplyPromptToImage && (
                          <button
                            onClick={() => {
                              onApplyPromptToImage(msg.content);
                              onClose();
                            }}
                            className="hover:text-indigo-300 transition-colors flex items-center gap-0.5"
                            title="Envoyer vers Texte vers Image"
                          >
                            <Image className="w-3 h-3 text-indigo-400" />
                          </button>
                        )}

                        {onApplyPromptToVideo && (
                          <button
                            onClick={() => {
                              onApplyPromptToVideo(msg.content);
                              onClose();
                            }}
                            className="hover:text-purple-300 transition-colors flex items-center gap-0.5"
                            title="Envoyer vers Texte vers Vidéo"
                          >
                            <Video className="w-3 h-3 text-purple-400" />
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
              <div className="rounded-2xl p-3 bg-slate-900 border border-white/10 text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>Nova réfléchit à votre demande...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-900/40 border-t border-white/5 overflow-x-auto flex gap-1.5 scrollbar-none">
          {SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(sug)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] text-slate-300 border border-white/5 whitespace-nowrap transition-colors shrink-0"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900/80 border-t border-white/10">
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
              placeholder="Posez une question ou demandez un prompt..."
              disabled={loading}
              className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 transition-colors shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {user && !user.isPro && (
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
              <span>Solde : <strong>{user.credits} crédits</strong></span>
              <button
                type="button"
                onClick={openSubscriptionModal}
                className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Crown className="w-3 h-3 text-amber-400" />
                Passer Pro (5$) pour l'Agent illimité
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
