import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Crown, LogOut, Coins, BarChart3, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PRICING_CONFIG } from '../types';

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
  const { user, isAuthenticated, login, register, loginDemo, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setError('Veuillez renseigner votre nom ou pseudonyme.');
          setLoading(false);
          return;
        }
        await register(name, email, password);
        setSuccessMsg(`Bienvenue ${name} ! Votre compte a été créé avec ${PRICING_CONFIG.FREE_PLAN_CREDITS} crédits offerts.`);
      } else {
        await login(email, password);
        setSuccessMsg('Connexion réussie ! Bon retour sur OmniStudio.');
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l\'authentification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-300 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
          <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Espace Membre & Authentification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Page de Connexion & Inscription
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Accédez à votre espace de travail créatif, vos {PRICING_CONFIG.FREE_PLAN_CREDITS} crédits de bienvenue et l'historique complet de vos médias IA.
        </p>
      </div>

      {/* If User is Already Logged In */}
      {isAuthenticated && user ? (
        <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-xl"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{user.name}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${
                      user.isPro
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                        : 'bg-slate-800 text-slate-300 border-white/10'
                    }`}
                  >
                    {user.isPro ? '👑 Plan Pro VIP' : 'Plan Free'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-amber-300">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>{user.credits} crédits disponibles</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Se déconnecter</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={onNavigateToStudio}
              className="p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-left transition-all shadow-lg shadow-indigo-600/20 flex flex-col justify-between space-y-2 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">Studio de Création</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-indigo-100">
                Générez des images, vidéos ou transcriptions.
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
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-slate-400">
                Suivez votre consommation et vos transactions.
              </p>
            </button>

            <button
              onClick={onNavigateToPricing}
              className="p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400 fill-current" />
                  Recharge (5$)
                </span>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-slate-400">
                Abonnement 500 crédits via NOWPayments.
              </p>
            </button>
          </div>
        </div>
      ) : (
        /* Login / Register Form Card */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Form */}
          <div className="md:col-span-7 rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 space-y-6">
            
            {/* Mode Switcher */}
            <div className="flex p-1 rounded-xl bg-slate-900 border border-white/5">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Se connecter
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Créer un compte (+25 cr gratuits)
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nom ou Nom du Studio
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alexandre Dupont"
                      required
                      className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Adresse Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@exemple.com"
                    required
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer group disabled:opacity-50"
              >
                <span>{loading ? 'Traitement en cours...' : mode === 'login' ? 'Se connecter' : 'Valider & Recevoir 25 crédits'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Quick Demo Login */}
            <div className="pt-4 border-t border-white/10 text-center space-y-2">
              <span className="text-xs text-slate-400 block">Vous voulez tester immédiatement ?</span>
              <button
                type="button"
                onClick={loginDemo}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>⚡ Connexion instantanée avec le Compte Démo</span>
              </button>
            </div>

          </div>

          {/* Right Column: Perks and Information */}
          <div className="md:col-span-5 space-y-4">
            
            <div className="p-5 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 space-y-3">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>25 Crédits Inclus Immédiatement</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Chaque nouvel utilisateur bénéficie automatiquement du <strong>Plan Free avec 25 crédits offerts</strong> pour tester la génération d'images, de vidéos, la transcription et l'Agent IA.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 space-y-3 text-xs text-slate-300">
              <span className="font-bold text-white block text-sm">Ce que comprend votre compte :</span>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Accès complet aux 4 moteurs d'IA</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Historique persistant de vos créations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Export de vos besoins et storyboards</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Passage en mode Pro sans filigrane en 1 clic</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
