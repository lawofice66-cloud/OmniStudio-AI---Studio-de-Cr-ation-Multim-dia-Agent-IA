import React, { useState } from 'react';
import { Sparkles, Crown, Coins, User as UserIcon, LogOut, ArrowRight, Zap, Menu, X, Video, Image, Mic, Bot, BarChart3, FileDown, BookOpen, Volume2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PRICING_CONFIG } from '../types';

interface NavbarProps {
  activeTab: 'showcase' | 'image' | 'video' | 'transcribe' | 'story' | 'music' | 'agent' | 'pricing' | 'dashboard' | 'login';
  setActiveTab: (tab: 'showcase' | 'image' | 'video' | 'transcribe' | 'story' | 'music' | 'agent' | 'pricing' | 'dashboard' | 'login') => void;
  openAgentDrawer: () => void;
  openExportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, openAgentDrawer, openExportModal }) => {
  const { user, isAuthenticated, logout, openAuthModal, openSubscriptionModal } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('showcase')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 group-hover:text-pink-400 transition-colors animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                  OmniStudio
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI 3.8
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block -mt-0.5">Studio Créatif & Agent IA</span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('showcase')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'showcase'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20'
                  : 'text-pink-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
              <span>Démos</span>
            </button>

            <button
              onClick={() => setActiveTab('image')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'image'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>Image</span>
            </button>

            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Vidéo</span>
            </button>

            <button
              onClick={() => setActiveTab('transcribe')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'transcribe'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Audio</span>
            </button>

            <button
              onClick={() => setActiveTab('story')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'story'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Histoire IA</span>
            </button>

            <button
              onClick={() => setActiveTab('music')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'music'
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Volume2 className="w-4 h-4 text-pink-400" />
              <span>Sons IA</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Usage</span>
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Tarifs (5$)</span>
            </button>

            <button
              onClick={() => setActiveTab('login')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <UserIcon className="w-4 h-4 text-indigo-400" />
              <span>{isAuthenticated ? 'Mon Compte' : 'Connexion / Inscription'}</span>
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          
          {/* Exporter mon besoin button */}
          <button
            onClick={openExportModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold shadow-sm transition-all hover:border-indigo-500/50 cursor-pointer"
            title="Exporter tout mon besoin et mes créations (Cahier des charges)"
          >
            <FileDown className="w-3.5 h-3.5 text-indigo-400" />
            <span>Exporter mon besoin</span>
          </button>

          {/* Agent IA Quick Trigger */}
          <button
            onClick={openAgentDrawer}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold shadow-sm transition-all hover:scale-105 cursor-pointer"
            title="Ouvrir l'Agent IA d'accompagnement"
          >
            <Bot className="w-4 h-4 text-purple-400 animate-bounce" />
            <span>Agent IA Nova</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>

          {/* Credits Counter Pill -> Click to view Dashboard */}
          {isAuthenticated && user && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                  : user.isPro
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-slate-900 border-white/10 text-slate-300 hover:border-indigo-500/50'
              }`}
              title="Voir mon tableau de bord et l'historique des crédits"
            >
              <Coins className={`w-4 h-4 ${user.isPro ? 'text-amber-400' : 'text-indigo-400'}`} />
              <div className="flex items-baseline gap-1 text-xs font-bold">
                <span>{user.credits}</span>
                <span className="text-[10px] text-slate-400 font-normal">crédits</span>
              </div>
              {user.isPro ? (
                <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  PRO
                </span>
              ) : (
                <span className="hidden sm:inline-block text-[10px] text-indigo-400 group-hover:underline">
                  + Usage
                </span>
              )}
            </button>
          )}

          {/* Upgrade / Subscription CTA button */}
          {(!user || !user.isPro) ? (
            <button
              onClick={openSubscriptionModal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-slate-950 fill-current" />
              <span>Passer Pro (5$)</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Abonné VIP</span>
            </div>
          )}

          {/* User Profile or Login */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/80 transition-colors focus:outline-none cursor-pointer"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/40"
                />
              </button>

              {showProfileMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setShowProfileMenu(false)}
                >
                  <div className="p-3 border-b border-white/10">
                    <p className="font-semibold text-sm text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Statut:</span>
                      <span className={`font-bold px-2 py-0.5 rounded-full ${user.isPro ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-800 text-slate-300'}`}>
                        {user.isPro ? 'Abonnement Pro (500 cr)' : 'Plan Free (25 cr)'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setActiveTab('login');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                        Page de Connexion / Profil
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setActiveTab('dashboard');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                        Tableau de bord & Usage
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        openSubscriptionModal();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        Gérer l'abonnement
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('login')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Connexion</span>
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-slate-950 p-4 space-y-2">
          <button
            onClick={() => {
              setActiveTab('showcase');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold ${
              activeTab === 'showcase' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' : 'text-pink-300 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>✨ Démos & Vitrine Créative</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('image');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
              activeTab === 'image' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Texte vers Image</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('video');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
              activeTab === 'video' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Texte vers Vidéo</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('transcribe');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
              activeTab === 'transcribe' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Transcrire Audio</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('story');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
              activeTab === 'story' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>Générateur d'Histoire IA</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('music');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
              activeTab === 'music' ? 'bg-pink-600 text-white' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <Volume2 className="w-4 h-4 text-pink-400" />
            <span>Générateur de Sons IA</span>
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
            <FileDown className="w-4 h-4 text-indigo-400" />
            <span>Exporter mon besoin (Cahier des charges)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('login');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
              activeTab === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <UserIcon className="w-4 h-4 text-indigo-400" />
            <span>Page de Connexion / Inscription</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('pricing');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
              activeTab === 'pricing' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Tarifs & Abonnement (5$)</span>
          </button>
          <button
            onClick={() => {
              openAgentDrawer();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-purple-300 bg-purple-500/10 border border-purple-500/30"
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>Agent IA Nova d'accompagnement</span>
          </button>
        </div>
      )}
    </header>
  );
};


