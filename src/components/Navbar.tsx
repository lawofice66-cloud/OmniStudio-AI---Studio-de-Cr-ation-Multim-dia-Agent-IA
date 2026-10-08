import React, { useState } from 'react';
import { Crown, Coins, User as UserIcon, Menu, X, BookOpen, BarChart3, FileDown, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: 'story' | 'pricing' | 'dashboard' | 'login';
  setActiveTab: (tab: 'story' | 'pricing' | 'dashboard' | 'login') => void;
  openExportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, openExportModal }) => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('story')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 p-0.5 shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-400 group-hover:text-pink-400 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-purple-100 to-pink-200 bg-clip-text text-transparent">
                  OmniStudio
                </span>
                <span className="text-[10px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Histoires IA
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block -mt-0.5">Générateur de Récits & Scénarios Flare</span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('story')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'story'
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-purple-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>📖 Studio Histoires & Scénarios</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Tableau de bord</span>
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Tarifs (5$)</span>
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          
          {/* Exporter mon besoin button */}
          <button
            onClick={openExportModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold shadow-sm transition-all hover:border-purple-500/50 cursor-pointer"
            title="Exporter tout mon besoin et mes créations (Cahier des charges)"
          >
            <FileDown className="w-3.5 h-3.5 text-purple-400" />
            <span>Exporter mon besoin</span>
          </button>

          {/* Credits Counter Pill */}
          {user && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
              title="Tableau de bord des crédits"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <div className="flex items-baseline gap-1 text-xs font-bold">
                <span>{user.credits ?? 500}</span>
                <span className="text-[10px] text-slate-400 font-normal">crédits</span>
              </div>
            </button>
          )}

          {/* Exclusive User Pill: Azzoula Ali */}
          {user && (
            <button
              onClick={() => setActiveTab('login')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                activeTab === 'login'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-white/10 hover:border-amber-500/40'
              }`}
              title="Espace Azzoula Ali"
            >
              <img
                src={user.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`}
                alt="Azzoula Ali"
                className="w-5 h-5 rounded-md object-cover ring-1 ring-amber-500/40"
              />
              <span className="text-white font-medium">Azzoula Ali</span>
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-slate-950 p-4 space-y-2">
          <button
            onClick={() => {
              setActiveTab('story');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold ${
              activeTab === 'story' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'text-purple-300 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>📖 Histoires & Scénarios Flare</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>Tableau de Bord</span>
          </button>
          <button
            onClick={() => {
              openExportModal();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-900"
          >
            <FileDown className="w-4 h-4 text-purple-400" />
            <span>Exporter mon besoin (Cahier des charges)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('login');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
              activeTab === 'login' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <UserIcon className="w-4 h-4 text-amber-400" />
            <span>Azzoula Ali</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('pricing');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
              activeTab === 'pricing' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Tarifs & Abonnement (5$)</span>
          </button>
        </div>
      )}
    </header>
  );
};
