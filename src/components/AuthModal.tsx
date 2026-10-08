import React from 'react';
import { X, CheckCircle2, Crown, Coins, Video, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, user } = useAuth();

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl glass-panel p-6 sm:p-8 shadow-2xl border border-white/10 overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 p-0.5 mx-auto mb-3 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Crown className="w-7 h-7 text-amber-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Azzoula Ali
          </h2>
          <p className="text-xs text-amber-300 font-semibold mt-1">
            500 crédits permanents actifs
          </p>
        </div>

        {/* Perks Box */}
        <div className="space-y-3 mb-6">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Titulaire :</span>
              <span className="font-bold text-white">Azzoula Ali</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Email :</span>
              <span className="font-mono text-slate-200">lawofice66@gmail.com</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Solde Garanti :</span>
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" />
                {user?.credits ?? 500} crédits
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Validité :</span>
              <span className="font-black text-emerald-400 uppercase text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                Permanent Sans Expiration
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Votre compte est opérationnel, prêt pour toutes vos réalisations vidéo et scénarios.</span>
          </div>
        </div>

        <button
          onClick={closeAuthModal}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-pink-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Video className="w-4 h-4" />
          <span>Accéder au Studio Vidéo Flare</span>
        </button>

      </div>
    </div>
  );
};
