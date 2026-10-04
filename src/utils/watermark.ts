import { PRICING_CONFIG } from '../types';

/**
 * Downloads an image with an aesthetic watermark if the user is on the Free plan.
 * Pro users get 100% clean, pristine watermark-free downloads.
 */
export async function downloadImageWithWatermark(
  imageUrl: string,
  isPro: boolean,
  filename = 'omnistudio-creation.png'
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 1024;
        canvas.height = img.naturalHeight || 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas 2D context not available');
        }

        // Draw original visual
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Apply watermark only if NOT Pro
        if (!isPro) {
          const w = canvas.width;
          const h = canvas.height;

          // 1. Subtle diagonal watermark across the center
          ctx.save();
          ctx.translate(w / 2, h / 2);
          ctx.rotate(-Math.PI / 7);
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
          ctx.font = `bold ${Math.max(24, Math.floor(w * 0.038))}px sans-serif`;
          ctx.fillText('OMNISTUDIO AI — VERSION GRATUITE', 0, -10);
          ctx.font = `${Math.max(14, Math.floor(w * 0.02))}px sans-serif`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
          ctx.fillText('Passez Pro (5$/mois) pour exporter sans filigrane', 0, 24);
          ctx.restore();

          // 2. High-contrast pill watermark in bottom right corner
          const badgeW = Math.min(320, w * 0.45);
          const badgeH = Math.min(48, h * 0.08);
          const margin = Math.min(24, w * 0.03);
          const x = w - badgeW - margin;
          const y = h - badgeH - margin;

          // Background card
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, badgeW, badgeH, 12);
          } else {
            ctx.rect(x, y, badgeW, badgeH);
          }
          ctx.fill();
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Text labels
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('✨ OmniStudio AI', x + 14, y + badgeH / 2 + 5);

          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('● PLAN FREE', x + badgeW - 14, y + badgeH / 2 + 4);
        }

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = isPro ? filename : filename.replace(/\.png$/i, '-free-watermark.png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        resolve();
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      // Fallback: direct download
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      resolve();
    };

    img.src = imageUrl;
  });
}

/**
 * Downloads text documents (brief, transcript, storyboard) with Free watermark banner
 */
export function downloadTextWithWatermark(
  content: string,
  title: string,
  isPro: boolean,
  filename = 'cahier-des-charges-omnistudio.txt'
): void {
  let finalContent = content;

  if (!isPro) {
    const watermarkBanner = `================================================================================
[ FILIGRANE : VERSION GRATUITE — OMNISTUDIO AI ]
Document exporté avec le Plan Free. 
Pour débloquer l'export sans filigrane, 500 crédits et l'Agent IA illimité :
Abonnement Pro à 5 USD / mois : ${PRICING_CONFIG.NOWPAYMENTS_URL}
================================================================================\n\n`;

    const watermarkFooter = `\n\n================================================================================
Généré par OmniStudio AI [Plan Free] • Passez Pro pour 5 USD/mois
================================================================================`;

    finalContent = watermarkBanner + content + watermarkFooter;
  }

  const blob = new Blob([finalContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = isPro ? filename : filename.replace(/\.txt$/i, '-free-watermark.txt');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
