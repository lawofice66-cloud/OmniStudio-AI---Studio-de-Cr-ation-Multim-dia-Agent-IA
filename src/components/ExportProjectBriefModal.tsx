import React, { useState } from 'react';
import { X, Download, Copy, Check, FileText, Sparkles, Crown, ShieldAlert, CheckCircle2, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { downloadTextWithWatermark } from '../utils/watermark';
import { PRICING_CONFIG } from '../types';

interface ExportProjectBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportProjectBriefModal: React.FC<ExportProjectBriefModalProps> = ({ isOpen, onClose }) => {
  const { user, storyHistory, openSubscriptionModal } = useAuth();
  const { success: toastSuccess, info: toastInfo } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isPro = !!user?.isPro;

  // Build structured creative brief document
  const generateBriefContent = () => {
    const dateStr = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let brief = `CAHIER DES CHARGES CRÉATIF & EXPORTATION DU PROJET
Plateforme : OmniStudio Flare — Studio d'Écriture & Scénarios IA
Date d'exportation : ${dateStr}
Auteur : ${user?.name || 'Azzoula Ali'} (${user?.email || 'lawofice66@gmail.com'})
Formule active : ${isPro ? 'Plan Pro VIP (Rendus sans filigrane)' : 'Plan Free'}
Solde de crédits restant : ${user?.credits || 0} crédits

================================================================================
1. SYNTHÈSE GLOBALE DU BESOIN CRÉATIF & RÉCITS
================================================================================
Ce document rassemble l'ensemble des créations narratives et scénarios spécifiés par l'utilisateur.

Nombre total de récits créés : ${storyHistory.length}

================================================================================
2. HISTOIRES & SCÉNARIOS CINÉMATOGRAPHIQUES IA
================================================================================
`;

    if (storyHistory.length === 0) {
      brief += `Aucune histoire générée pour le moment dans ce projet.\n\n`;
    } else {
      storyHistory.forEach((story, i) => {
        brief += `[HISTOIRE #${i + 1}] : ${story.title.toUpperCase()}
- Genre : ${story.genre} | Tonalité : ${story.tone}
- Accroche (Logline) : ${story.logline}
- Univers : ${story.worldSetting}
- Réalisation : ${story.directorVision || 'Standard Cinéma'}
- Nombre de chapitres : ${story.chapters?.length || 0}
- Personnages : ${story.characters?.map(c => `${c.name} (${c.role})`).join(', ') || 'N/A'}
- Synthèse : ${story.summary}\n\n`;

        story.chapters?.forEach((ch) => {
          brief += `  [Chapitre ${ch.chapterNumber}: ${ch.title}] (Tension: ${ch.tensionLevel}/10)\n`;
          brief += `  ${ch.narrative}\n\n`;
        });
        brief += `--------------------------------------------------------------------------------\n\n`;
      });
    }

    brief += `================================================================================
3. RECOMMANDATIONS TECHNIQUES & PROCHAINES ÉTAPES
================================================================================
- Les éléments validés peuvent être exportés directement en production audiovisuelle ou littéraire.
- Pour une utilisation commerciale haute résolution sans filigrane, veillez à activer le Plan Pro (5 USD/mois).
- Lien direct d'abonnement : ${PRICING_CONFIG.NOWPAYMENTS_URL}
`;

    return brief;
  };

  const handleDownloadTxt = () => {
    const content = generateBriefContent();
    downloadTextWithWatermark(content, 'Cahier des Charges Créatif', isPro, `cahier-des-charges-omnistudio-${Date.now()}.txt`);
    toastSuccess(
      'Cahier des charges exporté !',
      isPro ? 'Fichier HD téléchargé sans filigrane.' : 'Fichier téléchargé avec filigrane Plan Free.',
      'sparkles'
    );
  };

  const handleCopy = () => {
    const content = generateBriefContent();
    navigator.clipboard.writeText(content);
    setCopied(true);
    toastInfo('Copié !', 'Le cahier des charges complet est copié dans votre presse-papiers.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Exportation de Projet & Cahier des Charges</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Exporter Mon Besoin Créatif
          </h2>
          <p className="text-xs text-slate-400">
            Téléchargez un document de spécifications complet regroupant tous vos prompts, storyboards vidéo et analyses audio pour votre équipe ou vos clients.
          </p>
        </div>

        {/* Free Plan Watermark Notice */}
        {!isPro ? (
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                Mode Plan Free : Filigrane Automatique
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openSubscriptionModal();
                }}
                className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />
                Retirer le filigrane (5$)
              </button>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              En mode gratuit, un filigrane discret <em>"Généré avec OmniStudio AI — Plan Free"</em> est automatiquement apposé sur les exports de documents et les images. Pour exporter des fichiers 100% neutres sans filigrane, passez au Plan Pro pour seulement 5 USD.
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Abonné Pro VIP : Vos exports sont 100% professionnels et exempts de tout filigrane !</span>
          </div>
        )}

        {/* Document Preview Box */}
        <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-4 font-mono text-[11px] text-slate-300 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
          {generateBriefContent().slice(0, 900)}...
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={handleCopy}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copié dans le presse-papiers' : 'Copier le texte brut'}</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger mon Cahier des Charges (.TXT)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
