import React, { useState } from 'react';
import { Crown, Check, ExternalLink, ShieldCheck, Zap, Sparkles, Coins, ArrowRight, CheckCircle2, HelpCircle, CreditCard, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PRICING_CONFIG } from '../types';

export const PricingPage: React.FC = () => {
  const { user, upgradeToPro, openSubscriptionModal } = useAuth();
  const { info: toastInfo, success: toastSuccess } = useToast();
  const [activatedSuccess, setActivatedSuccess] = useState(false);
  const [copiedRedotPay, setCopiedRedotPay] = useState(false);

  const REDOTPAY_EMAIL = 'lawofice66@gmail.com';

  const handleCopyRedotPay = () => {
    navigator.clipboard.writeText(REDOTPAY_EMAIL);
    setCopiedRedotPay(true);
    toastInfo('Adresse copiée !', 'L\'email RedotPay a été copié dans votre presse-papiers.');
    setTimeout(() => setCopiedRedotPay(false), 2500);
  };

  const handleOpenNowPayments = () => {
    window.open(PRICING_CONFIG.NOWPAYMENTS_URL, '_blank', 'noopener,noreferrer');
  };

  const handleActivatePro = () => {
    upgradeToPro();
    setActivatedSuccess(true);
    toastSuccess('Abonnement Pro Activé !', '500 crédits ont été crédités sur votre compte.');
    setTimeout(() => setActivatedSuccess(false), 4000);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300 max-w-6xl mx-auto py-4">
      
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Crown className="w-4 h-4 text-amber-400 fill-current" />
          <span>Tarifs Transparents & Accessibles</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Un abonnement unique à <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">5 USD / mois</span>
        </h1>
        <p className="text-base text-slate-400">
          Démarrez gratuitement avec {PRICING_CONFIG.FREE_PLAN_CREDITS} crédits sans engagement. Passez à la formule Pro pour débloquer 500 crédits et l'Agent IA Nova en illimité.
        </p>
      </div>

      {activatedSuccess && (
        <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-center font-bold text-sm animate-bounce flex items-center justify-center gap-2">
          <Crown className="w-5 h-5 text-amber-400 fill-current" />
          <span>Félicitations ! Votre abonnement Pro (500 crédits) est maintenant actif ! 🎉</span>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* Free Plan */}
        <div className="rounded-3xl glass-panel p-8 border border-white/10 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Plan Découverte (Free)</h3>
                <p className="text-xs text-slate-400 mt-1">Pour explorer nos 4 technologies IA</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                Gratuit
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">0 $</span>
              <span className="text-sm text-slate-400 font-normal">/ mois</span>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>{PRICING_CONFIG.FREE_PLAN_CREDITS} crédits offerts</strong> dès votre inscription</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Accès complet au Studio Texte vers Image</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Accès complet au Studio Texte vers Vidéo</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Accès au Studio Transcription Audio</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Agent IA Nova d'accompagnement (0.5 cr/msg)</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-500">
                <Check className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                <span>Résolution standard</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              disabled
              className="w-full py-3.5 rounded-2xl bg-slate-800/80 text-slate-400 text-xs font-bold border border-white/5 cursor-default"
            >
              {user?.isPro ? 'Plan précédent' : 'Votre formule active'}
            </button>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="relative rounded-3xl bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-900 border-2 border-amber-500/50 p-8 flex flex-col justify-between shadow-2xl shadow-amber-500/10">
          <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg">
            Meilleure Offre Créateur
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-amber-300 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400 fill-current" />
                  Abonnement OmniStudio Pro
                </h3>
                <p className="text-xs text-amber-200/70 mt-1">Puissance maximale & productivité sans limite</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                5 USD / mois
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-white">5 $</span>
              <span className="text-sm text-slate-300 font-normal">USD / mois</span>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-200">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>{PRICING_CONFIG.PRO_PLAN_CREDITS} crédits / mois</strong> inclus et rechargeables</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Agent IA Nova illimité</strong> (0 crédit déduit pour vos conversations)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Générations prioritaires sur GPU haute vitesse</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Rendus haute résolution HD / 4K sans filigrane</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Exportation illimitée des vidéos, scripts et sous-titres SRT</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Support prioritaire VIP 7j/7</span>
              </li>
            </ul>
          </div>

          <div className="pt-8 space-y-3">
            {/* RedotPay Visa Card Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-red-500/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-red-300 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-red-400" />
                  RedotPay Visa Card
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-semibold">
                  5 USD
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">
                Paiement direct par RedotPay Visa Card ou virement RedotPay :
              </p>
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-white/10 font-mono text-xs">
                <span className="text-white font-bold select-all truncate">
                  {REDOTPAY_EMAIL}
                </span>
                <button
                  type="button"
                  onClick={handleCopyRedotPay}
                  className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                >
                  {copiedRedotPay ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedRedotPay ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
            </div>

            {/* NOWPayments Button */}
            <button
              onClick={handleOpenNowPayments}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Payer 5 USD sur NOWPayments (Crypto & Cartes)</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* Instant Activation */}
            <button
              onClick={handleActivatePro}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>J'ai déjà payé : Activer mes 500 crédits Pro</span>
            </button>
          </div>
        </div>

      </div>

      {/* Credit Consumption Breakdown Table */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-indigo-400" />
              Barème des crédits par fonctionnalité
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Chaque outil consomme un nombre fixe de crédits. Aucun frais caché.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
            <span className="text-xs font-semibold text-purple-400">Agent IA Nova</span>
            <div className="text-2xl font-black text-white">0.5 crédit</div>
            <p className="text-[11px] text-slate-400">Par échange ou prompt rédigé.</p>
            <span className="inline-block text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              100% Gratuit pour les abonnés Pro
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
            <span className="text-xs font-semibold text-emerald-400">Transcription Audio</span>
            <div className="text-2xl font-black text-white">1 crédit</div>
            <p className="text-[11px] text-slate-400">Par audio importé ou enregistré.</p>
            <span className="inline-block text-[10px] text-slate-400">
              Jusqu'à 500 transcriptions / mois en Pro
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
            <span className="text-xs font-semibold text-indigo-400">Texte vers Image</span>
            <div className="text-2xl font-black text-white">2 crédits</div>
            <p className="text-[11px] text-slate-400">Par image haute définition générée.</p>
            <span className="inline-block text-[10px] text-slate-400">
              Jusqu'à 250 images HD / mois en Pro
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
            <span className="text-xs font-semibold text-pink-400">Texte vers Vidéo</span>
            <div className="text-2xl font-black text-white">5 crédits</div>
            <p className="text-[11px] text-slate-400">Par rendu vidéo cinématique & storyboard.</p>
            <span className="inline-block text-[10px] text-slate-400">
              Jusqu'à 100 vidéos / mois en Pro
            </span>
          </div>
        </div>
      </div>

      {/* NOWPayments Gateway Guarantee Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Paiement Garanti & Sécurisé par NOWPayments</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Lien officiel de facturation : <span className="font-mono text-amber-300">{PRICING_CONFIG.NOWPAYMENTS_URL}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenNowPayments}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shrink-0 transition-transform hover:scale-105"
        >
          <span>Ouvrir NOWPayments (5$)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
