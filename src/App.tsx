import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { StoryGeneratorStudio } from './components/StoryGeneratorStudio';
import { PricingPage } from './components/PricingPage';
import { UsageDashboard } from './components/UsageDashboard';
import { LoginPage } from './components/LoginPage';
import { ExportProjectBriefModal } from './components/ExportProjectBriefModal';
import { AuthModal } from './components/AuthModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { BookOpen, Shield } from 'lucide-react';
import { PRICING_CONFIG } from './types';

function MainApp() {
  const [activeTab, setActiveTab] = useState<'story' | 'pricing' | 'dashboard' | 'login'>('story');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'story' && <StoryGeneratorStudio />}
        {activeTab === 'dashboard' && <UsageDashboard />}
        {activeTab === 'pricing' && <PricingPage />}
        {activeTab === 'login' && (
          <LoginPage
            onNavigateToStudio={() => setActiveTab('story')}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
            onNavigateToPricing={() => setActiveTab('pricing')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/80 backdrop-blur-md py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <span className="font-semibold text-slate-300">OmniStudio Flare</span>
            <span>— Studio d'Écriture & Générateur de Récits et Scénarios IA</span>
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
            <span className="text-slate-300 font-medium">Azzoula Ali</span>
          </div>
        </div>
      </footer>

      {/* Modals and Slide-overs */}
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
