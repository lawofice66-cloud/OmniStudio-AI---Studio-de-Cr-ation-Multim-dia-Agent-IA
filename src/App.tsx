import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { TextToImageStudio } from './components/TextToImageStudio';
import { TextToVideoStudio } from './components/TextToVideoStudio';
import { AudioTranscribeStudio } from './components/AudioTranscribeStudio';
import { StoryGeneratorStudio } from './components/StoryGeneratorStudio';
import { MusicGeneratorStudio } from './components/MusicGeneratorStudio';
import { ShowcaseGallery } from './components/ShowcaseGallery';
import { PricingPage } from './components/PricingPage';
import { UsageDashboard } from './components/UsageDashboard';
import { LoginPage } from './components/LoginPage';
import { ExportProjectBriefModal } from './components/ExportProjectBriefModal';
import { AgentChatDrawer } from './components/AgentChatDrawer';
import { AuthModal } from './components/AuthModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { Bot, Sparkles, Shield, Heart } from 'lucide-react';
import { PRICING_CONFIG } from './types';

function MainApp() {
  const [activeTab, setActiveTab] = useState<'showcase' | 'image' | 'video' | 'transcribe' | 'story' | 'music' | 'agent' | 'pricing' | 'dashboard' | 'login'>('showcase');
  const [isAgentDrawerOpen, setIsAgentDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [musicMoodContext, setMusicMoodContext] = useState<string>('');

  const handleApplyPromptToImage = (_prompt: string) => {
    setActiveTab('image');
  };

  const handleApplyPromptToVideo = (_prompt: string) => {
    setActiveTab('video');
  };

  const handleNavigateToMusic = (mood: string) => {
    setMusicMoodContext(mood);
    setActiveTab('music');
  };

  const handleSelectSample = (type: 'image' | 'video' | 'music' | 'story', _prompt: string, extraData?: any) => {
    if (type === 'music' && extraData?.mood) {
      setMusicMoodContext(extraData.mood);
    }
    setActiveTab(type);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAgentDrawer={() => setIsAgentDrawerOpen(true)}
        openExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'showcase' && (
          <ShowcaseGallery onSelectSample={handleSelectSample} />
        )}
        {activeTab === 'image' && <TextToImageStudio />}
        {activeTab === 'video' && <TextToVideoStudio />}
        {activeTab === 'transcribe' && <AudioTranscribeStudio />}
        {activeTab === 'story' && (
          <StoryGeneratorStudio
            onNavigateToImageStudio={handleApplyPromptToImage}
            onNavigateToMusicStudio={handleNavigateToMusic}
          />
        )}
        {activeTab === 'music' && (
          <MusicGeneratorStudio initialMood={musicMoodContext} />
        )}
        {activeTab === 'dashboard' && <UsageDashboard />}
        {activeTab === 'pricing' && <PricingPage />}
        {activeTab === 'login' && (
          <LoginPage
            onNavigateToStudio={() => setActiveTab('image')}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
            onNavigateToPricing={() => setActiveTab('pricing')}
          />
        )}
      </main>

      {/* Persistent Floating AI Agent Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAgentDrawerOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-2xl shadow-purple-600/50 border border-purple-400/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>
          <span className="tracking-wide">Agent IA Nova</span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">
            Co-pilote
          </span>
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/80 backdrop-blur-md py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="font-semibold text-slate-300">OmniStudio AI</span>
            <span>— Studio Multimédia Génératif & Assistant IA</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              📦 Exporter mon besoin
            </button>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              Paiements sécurisés via{' '}
              <a
                href={PRICING_CONFIG.NOWPAYMENTS_URL}
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline font-semibold ml-1"
              >
                NOWPayments (5$)
              </a>
            </span>
            <span>•</span>
            <span>Plan Free 25 cr | Plan Pro 500 cr</span>
          </div>
        </div>
      </footer>

      {/* Modals and Slide-overs */}
      <AgentChatDrawer
        isOpen={isAgentDrawerOpen}
        onClose={() => setIsAgentDrawerOpen(false)}
        onApplyPromptToImage={handleApplyPromptToImage}
        onApplyPromptToVideo={handleApplyPromptToVideo}
      />
      <ExportProjectBriefModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
      <AuthModal />
      <SubscriptionModal />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
