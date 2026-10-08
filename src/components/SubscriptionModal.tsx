import React, { useState } from 'react';
import { X, Crown, Check, ExternalLink, ShieldCheck, Zap, Sparkles, Coins, ArrowRight, CheckCircle2, CreditCard, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PRICING_CONFIG } from '../types';

export const SubscriptionModal: React.FC = () => {
  const { isSubscriptionModalOpen, closeSubscriptionModal, user } = useAuth();
  const { success: toastSuccess, info: toastInfo } = useToast();
  const [paymentClicked, setPaymentClicked] = useState(false);
  const [copiedRedotPay, setCopiedRedotPay] = useState(false);
  const [activePaymentMethod, setActivePaymentMethod] = useState<'redotpay' | 'nowpayments'>('redotpay');

  const REDOTPAY_EMAIL = 'lawofice66@gmail.com';

  if (!isSubscriptionModalOpen) return null;

  const handleCopyRedotPayEmail = () => {
    navigator.clipboard.writeText(REDOTPAY_EMAIL);
    setCopiedRedotPay(true);
    toastInfo('Adresse copiée !', 'L\'email RedotPay a été copié dans votre presse-papiers.');
    setTimeout(() => setCopiedRedotPay(false), 2500);
  };

  const handleOpenNowPayments = () => {
    window.open(PRICING_CONFIG.NOWPAYMENTS_URL, '_blank', 'noopener,noreferrer');
    setPaymentClicked(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel p-6 sm:p-8 shadow-2xl border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeSubscriptionModal}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
            <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span>Abonnement OmniStudio Pro</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Boostez votre créativité pour seulement <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">5 USD / mois</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">
            Rechargez 500 crédits Pro pour alimenter vos créations de Récits & Scénarios Cinématographiques.
          </p>
        </div>

        {/* Plan Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          
          {/* Plan Free Card */}
          <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-300">Plan Free</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold">Gratuit</span>
              </div>
              <div className="text-2xl font-black text-white mb-1">
                0 $ <span className="text-xs text-slate-400 font-normal">/ pour toujours</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Idéal pour tester les fonctionnalités de base du studio.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-slate-400 shrink-0" />
                  <span><strong>{PRICING_CONFIG.FREE_PLAN_CREDITS} crédits</strong> offerts à l'inscription</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Accès au Studio d'Écriture Scénaristique & Histoires</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Récits complets multi-chapitres</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <X className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>Génération prioritaire instantanée</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 pt-3 border-t border-white/5 text-center">
              <span className="text-xs text-slate-500">
                {user?.isPro ? 'Vous avez dépassé ce plan' : 'Votre plan actuel'}
              </span>
            </div>
          </div>

          {/* Plan Pro Card */}
          <div className="relative rounded-2xl bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-900 border-2 border-amber-500/40 p-5 flex flex-col justify-between shadow-xl shadow-amber-500/10">
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
              Recommandé
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400 fill-current" />
                  Abonnement Pro
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                  VIP
                </span>
              </div>

              <div className="text-3xl font-black text-white mb-1 flex items-baseline gap-1">
                5 USD <span className="text-xs text-slate-400 font-normal">/ mois</span>
              </div>
              <p className="text-xs text-amber-200/80 mb-4">
                La puissance créative sans compromis pour créateurs exigeants.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>{PRICING_CONFIG.PRO_PLAN_CREDITS} crédits / mois</strong> rechargeables</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>Générations d'histoires illimitées & prioritaires</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Découpage cinématographique Hollywood et fiches personnages</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Sauvegarde et bibliothèque de projets illimitées</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Exports illimités des récits en formats Markdown & TXT</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10">
              <span className="text-[11px] text-amber-300/80 font-medium flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
                Activation instantanée dès le paiement
              </span>
            </div>
          </div>

        </div>

        {/* Credit Cost Reference Grid */}
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-indigo-400" />
              Barème des crédits par action dans OmniStudio AI :
            </p>
            <span className="text-[10px] text-amber-400 font-bold">500 crédits rechargeables</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-purple-500/20">
              <span className="text-purple-300 block text-[11px] font-bold">Récit & Histoire Complète</span>
              <span className="font-extrabold text-white text-base">2 crédits</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Multi-chapitres, univers immersif, dialogues</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-indigo-500/20">
              <span className="text-indigo-300 block text-[11px] font-bold">Scénario Cinématographique</span>
              <span className="font-extrabold text-white text-base">3 crédits</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Découpage de scènes, sluglines, vision réalisateur</span>
            </div>
          </div>
        </div>

        {/* Payment Methods Selection */}
        <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-amber-500/30 space-y-5 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <span>Moyens de Paiement pour l'Abonnement Pro</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                RedotPay Visa Card (5 USD direct, 0 frais) ou NOWPayments Crypto / Cartes (5 USD + 1 USD frais réseau = 6 USD).
              </p>
            </div>
            
            <div className="flex rounded-xl bg-slate-950 p-1 border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setActivePaymentMethod('redotpay')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activePaymentMethod === 'redotpay'
                    ? 'bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>RedotPay (5$)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>

              <button
                type="button"
                onClick={() => setActivePaymentMethod('nowpayments')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activePaymentMethod === 'nowpayments'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>NOWPayments (6$)</span>
              </button>
            </div>
          </div>

          {/* Option 1: RedotPay Visa Card (Direct instructions with lawofice66@gmail.com - 5 USD 0 frais) */}
          {activePaymentMethod === 'redotpay' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-black tracking-wide uppercase">
                      RedotPay Visa Card
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black">
                      5 USD (0 frais en plus)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Transférez exactement <strong>5 USD</strong> sans aucun frais supplémentaire vers l'adresse RedotPay officielle :
                  </p>
                </div>

                {/* Copyable RedotPay Email Box */}
                <div className="w-full md:w-auto flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-red-500/30 font-mono text-xs">
                  <span className="text-white font-bold tracking-wide select-all px-2">
                    {REDOTPAY_EMAIL}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRedotPayEmail}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow"
                    title="Copier l'email RedotPay"
                  >
                    {copiedRedotPay ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRedotPay ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>
              </div>

              {/* Instructions steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-300 font-bold flex items-center justify-center text-[10px] mb-1">
                    1
                  </span>
                  <strong className="text-white block text-[11px]">Ouvrez RedotPay</strong>
                  <p className="text-slate-400 text-[10px] leading-tight">
                    Accédez à votre compte RedotPay ou utilisez votre RedotPay Visa Card.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-300 font-bold flex items-center justify-center text-[10px] mb-1">
                    2
                  </span>
                  <strong className="text-white block text-[11px]">Envoyez 5 USD (0 frais)</strong>
                  <p className="text-slate-400 text-[10px] leading-tight">
                    Transférez 5$ vers l'ID / Email : <strong className="text-red-300">{REDOTPAY_EMAIL}</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-[10px] mb-1">
                    3
                  </span>
                  <strong className="text-white block text-[11px]">Validation Sécurisée</strong>
                  <p className="text-slate-400 text-[10px] leading-tight">
                    Vos 500 crédits Pro sont activés dès réception du transfert.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Paiement sécurisé vérifié par notre équipe
                </span>
                <button
                  type="button"
                  onClick={handleCopyRedotPayEmail}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedRedotPay ? 'ID Copié !' : 'Copier l\'ID RedotPay'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Option 2: NOWPayments Crypto & Gateway (6 USD = 5 USD + 1 USD frais de réseau) */}
          {activePaymentMethod === 'nowpayments' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Passerelle NOWPayments (Crypto & Cartes)</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">6 USD</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    5 USD abonnement + 1 USD de frais réseau inclus pour couvrir la transaction. USDT, BTC, ETH, cartes bancaires acceptés.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleOpenNowPayments}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>Payer 6 USD sur NOWPayments (5$ + 1$ frais)</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {paymentClicked && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    La passerelle sécurisée NOWPayments a été ouverte. Dès validation du paiement, votre compte reçoit ses 500 crédits Pro automatiquement.
                  </span>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
