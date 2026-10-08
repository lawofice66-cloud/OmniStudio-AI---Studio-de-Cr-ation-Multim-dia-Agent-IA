import React from 'react';
import { User as UserIcon, CheckCircle2, Crown, Coins, BarChart3, Video, BookOpen, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigateToStudio?: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToPricing?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToStudio,
  onNavigateToDashboard,
  onNavigateToPricing,
}) => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-300 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />
          <span>Compte Propriétaire & Créateur VIP</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Espace Compte — Azzoula Ali
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Votre compte est configuré avec un solde permanent de 500 crédits et accès illimité aux moteurs cinématiques Flare.
        </p>
      </div>

      {/* Account Details Card */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt="Azzoula Ali"
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-amber-500/40 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">Azzoula Ali</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">lawofice66@gmail.com</p>
              <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-amber-300">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{user?.credits ?? 500} crédits disponibles</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Compte Verrouillé & Sécurisé</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={onNavigateToStudio}
            className="p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-left transition-all shadow-lg shadow-purple-600/20 flex flex-col justify-between space-y-2 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                Studio Histoires Flare
              </span>
            </div>
            <p className="text-xs text-purple-100">
              Générez vos récits épiques, scénarios multi-actes et dialogues cinématographiques.
            </p>
          </button>

          <button
            onClick={onNavigateToDashboard}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Tableau de Bord
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Consultez vos créations récentes et l'historique de votre compte.
            </p>
          </button>

          <button
            onClick={onNavigateToPricing}
            className="p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400 fill-current" />
                Statut Permanent
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Votre formule Pro permanente ne s'arrête jamais.
            </p>
          </button>
        </div>

        {/* Benefits list */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-3 text-xs text-slate-300">
          <span className="font-bold text-white block text-sm">Privilèges exclusifs de votre compte Azzoula Ali :</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Statut Pro permanent actif sans expiration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>500 crédits permanents renouvelés automatiquement</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zéro filigrane sur tous les exports vidéo et récits</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Priorité de calcul maximale sur Google Flare 8K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
