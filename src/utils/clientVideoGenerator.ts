/**
 * Client-Side Cinematic Video Generator & Multi-Segment Video Extender.
 * Generates high-fidelity 5s base video clips and stitches continuous extended videos
 * (10s, 15s, etc.) via HTML5 Canvas and MediaRecorder.
 * Enforces real-time wall-clock pacing (minimum 5.0 seconds), bans "zoom only",
 * and injects dynamic cinematic tracking motion with atmospheric particles.
 */

import { MANDATORY_NEGATIVE_PROMPT, engineerCinematicPrompt } from './cleanPrompt';

export interface VideoSegmentConfig {
  prompt: string;
  cameraMovement?: string;
  baseImageUrl?: string;
  durationSeconds?: number;
}

// Helper to safely load an image as HTMLImageElement
function loadImageElement(url: string, timeoutMs = 15000): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    if (!url.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }

    const timer = setTimeout(() => {
      resolve(null);
    }, timeoutMs);

    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };

    img.src = url;
  });
}

function resolveImageUrl(prompt: string, width: number, height: number, baseImageUrl?: string): string {
  if (baseImageUrl) return baseImageUrl;
  const { prompt: engineeredPrompt } = engineerCinematicPrompt(prompt);
  const cleanKeyword = encodeURIComponent(engineeredPrompt.slice(0, 350));
  const seed = Math.floor(Math.random() * 90000) + 10000;
  const negativeParam = encodeURIComponent(MANDATORY_NEGATIVE_PROMPT);
  return `https://image.pollinations.ai/prompt/${cleanKeyword}?width=${width}&height=${height}&nologo=true&seed=${seed}&model=flux&negative=${negativeParam}`;
}

/**
 * Generates an animated cinematic 5s video clip matching the prompt using
 * canvas MediaRecorder with smooth camera tracking motion.
 */
export async function generateClientVideo(
  prompt: string,
  ratio: '16:9' | '9:16' = '16:9',
  cameraMovement = 'cinematic side tracking shot, smooth dolly',
  baseImageUrl?: string,
  durationSeconds = 5
): Promise<string> {
  return generateMultiSegmentVideo(
    [
      {
        prompt,
        cameraMovement,
        baseImageUrl,
        durationSeconds: Math.max(5, durationSeconds),
      },
    ],
    ratio
  );
}

/**
 * Generates or extends a continuous multi-segment video (5s base, 10s extended, etc.)
 * Strictly timed in real wall-clock milliseconds so MediaRecorder generates a true 5.0s video.
 */
export async function generateMultiSegmentVideo(
  segments: VideoSegmentConfig[],
  ratio: '16:9' | '9:16' = '16:9'
): Promise<string> {
  if (!segments || segments.length === 0) {
    throw new Error('Au moins un segment est requis pour générer une vidéo.');
  }

  const width = ratio === '16:9' ? 1280 : 720;
  const height = ratio === '16:9' ? 720 : 1280;

  // Resolve image URLs for each segment with engineered prompt & negative prompt
  const segmentItems = segments.map((seg) => {
    const dur = seg.durationSeconds && seg.durationSeconds >= 5 ? seg.durationSeconds : 5;
    const url = resolveImageUrl(seg.prompt, width, height, seg.baseImageUrl);
    return {
      prompt: seg.prompt,
      cameraMovement: seg.cameraMovement || 'cinematic side tracking shot, smooth dolly',
      durationSeconds: dur,
      durationMs: dur * 1000,
      url,
    };
  });

  // Load all images in parallel
  const loadedImages = await Promise.all(
    segmentItems.map((item) => loadImageElement(item.url))
  );

  const fallbackUrl = segmentItems[0].url;
  const firstImg = loadedImages[0];
  if (!firstImg) {
    return fallbackUrl;
  }

  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx || typeof MediaRecorder === 'undefined' || !canvas.captureStream) {
        resolve(fallbackUrl);
        return;
      }

      // 24 or 30 FPS stream
      const stream = canvas.captureStream(24);
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = '';
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8000000 }) : new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalMime = mimeType || 'video/webm';
        const blob = new Blob(chunks, { type: finalMime });
        const videoObjectUrl = URL.createObjectURL(blob);
        resolve(videoObjectUrl);
      };

      // Generate seed particles for realistic airborne dust, soil & cinematic atmosphere
      const particles = Array.from({ length: 45 }, () => ({
        x: Math.random() * width,
        y: (Math.random() * 0.7 + 0.2) * height,
        radius: Math.random() * 2.5 + 0.8,
        speedX: Math.random() * 1.8 + 0.8,
        speedY: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.6 + 0.25,
        color: Math.random() > 0.4 ? 'rgba(217, 119, 6, ' : 'rgba(245, 158, 11, ', // Golden dust & soil particles
      }));

      // Total duration in wall-clock ms (e.g. 5000ms for 5s, 10000ms for 10s)
      const totalDurationMs = segmentItems.reduce((acc, cur) => acc + cur.durationMs, 0);

      recorder.start(250); // Emit chunk every 250ms
      const startWallClockTime = performance.now();

      const drawSegmentFrame = (
        img: HTMLImageElement,
        cameraMovement: string,
        progress: number,
        alpha = 1.0
      ) => {
        ctx.save();
        ctx.globalAlpha = alpha;

        // BAN "ZOOM ONLY" - Enforce realistic side tracking shot, smooth dolly, ground vibration
        let scale = 1.08;
        let dx = 0;
        let dy = 0;

        const isSideTracking = cameraMovement.includes('tracking') || cameraMovement.includes('Dolly') || cameraMovement.includes('glisse');
        const isDrone = cameraMovement.includes('Drone') || cameraMovement.includes('FPV');
        const isPan = cameraMovement.includes('Pan') || cameraMovement.includes('Panoramique');

        if (isSideTracking) {
          // Dynamic horizontal tracking shot (travels horizontally alongside the moving subject)
          scale = 1.09 + Math.sin(progress * Math.PI) * 0.02; // Subtle depth breathing, NOT a static zoom!
          dx = (0.5 - progress) * (width * 0.12); // Smooth horizontal camera travel
          dy = (height * (1 - scale)) / 2 + Math.sin(progress * 24) * 1.5; // Vehicle & chassis ground vibration
        } else if (isDrone) {
          scale = 1.12 - progress * 0.04;
          dx = (Math.cos(progress * Math.PI) - 0.5) * (width * 0.08);
          dy = (height * (1 - scale)) / 2 + (progress - 0.5) * (height * 0.06);
        } else if (isPan) {
          scale = 1.09;
          dx = (progress - 0.5) * (width * 0.14);
          dy = (height * (1 - scale)) / 2;
        } else {
          // Default cinematic tracking shot & forward dolly
          scale = 1.07 + Math.sin(progress * Math.PI) * 0.02;
          dx = (0.5 - progress) * (width * 0.10);
          dy = (height * (1 - scale)) / 2 + Math.sin(progress * 20) * 1.2;
        }

        ctx.drawImage(img, dx, dy, width * scale, height * scale);

        // 1. Dynamic soil turning & ground speed blur effect in the lower 22% of frame
        const groundHeight = height * 0.22;
        const groundY = height - groundHeight;
        const groundGrad = ctx.createLinearGradient(0, groundY, 0, height);
        groundGrad.addColorStop(0, 'rgba(0,0,0,0)');
        groundGrad.addColorStop(1, 'rgba(15, 23, 42, 0.45)');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, groundY, width, groundHeight);

        // Horizontal motion streaks simulating plowed soil / rolling tires speed
        ctx.strokeStyle = 'rgba(180, 83, 9, 0.18)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
          const streakY = groundY + 15 + i * 14;
          const streakOffset = (progress * width * 1.4 + i * 220) % (width + 200) - 100;
          ctx.beginPath();
          ctx.moveTo(streakOffset, streakY);
          ctx.lineTo(streakOffset + 80, streakY);
          ctx.stroke();
        }

        // 2. Realistic dynamic airborne particles (dust, soil clods turning in golden hour)
        particles.forEach((p, idx) => {
          const currentX = (p.x + progress * p.speedX * width * 0.5) % width;
          const currentY = p.y + Math.sin(progress * 12 + idx) * 8;
          ctx.beginPath();
          ctx.arc(currentX, currentY, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.alpha * alpha})`;
          ctx.fill();

          // Motion streak behind particle
          ctx.strokeStyle = `${p.color}${p.alpha * 0.4 * alpha})`;
          ctx.lineWidth = p.radius * 0.8;
          ctx.beginPath();
          ctx.moveTo(currentX, currentY);
          ctx.lineTo(currentX - p.speedX * 8, currentY - p.speedY * 4);
          ctx.stroke();
        });

        // 3. Volumetric cinematic vignette & golden hour illumination
        const vignette = ctx.createRadialGradient(
          width / 2, height * 0.45, width * 0.25,
          width / 2, height * 0.5, width * 0.72
        );
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.32)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        ctx.restore();
      };

      // REAL-TIME WALL-CLOCK PACED RENDER LOOP
      // Guarantees MediaRecorder runs for full totalDurationMs (5000ms minimum)
      const renderLoop = () => {
        const elapsedWallClockMs = performance.now() - startWallClockTime;

        // Check if finished
        if (elapsedWallClockMs >= totalDurationMs) {
          // Draw final stabilized frame
          const lastSeg = segmentItems[segmentItems.length - 1];
          const lastImg = loadedImages[segmentItems.length - 1] || firstImg;
          drawSegmentFrame(lastImg, lastSeg.cameraMovement, 1.0, 1.0);
          recorder.stop();
          return;
        }

        // Identify active segment based on elapsed time
        let accumulatedMs = 0;
        let activeIdx = 0;
        let segElapsedMs = 0;

        for (let i = 0; i < segmentItems.length; i++) {
          if (elapsedWallClockMs < accumulatedMs + segmentItems[i].durationMs) {
            activeIdx = i;
            segElapsedMs = elapsedWallClockMs - accumulatedMs;
            break;
          }
          accumulatedMs += segmentItems[i].durationMs;
        }

        const currentSeg = segmentItems[activeIdx];
        const currentImg = loadedImages[activeIdx] || firstImg;
        const segProgress = Math.min(1.0, segElapsedMs / currentSeg.durationMs);

        ctx.clearRect(0, 0, width, height);

        // Crossfade in last 600ms of current segment if next segment exists
        const transitionMs = 600;
        const msRemaining = currentSeg.durationMs - segElapsedMs;
        const nextIdx = activeIdx + 1;

        if (msRemaining < transitionMs && nextIdx < segmentItems.length) {
          const nextImg = loadedImages[nextIdx] || currentImg;
          const nextSeg = segmentItems[nextIdx];
          const crossfadeRatio = 1 - msRemaining / transitionMs; // 0 to 1

          drawSegmentFrame(currentImg, currentSeg.cameraMovement, segProgress, 1 - crossfadeRatio * 0.5);
          drawSegmentFrame(nextImg, nextSeg.cameraMovement, 0, crossfadeRatio);
        } else {
          drawSegmentFrame(currentImg, currentSeg.cameraMovement, segProgress, 1.0);
        }

        requestAnimationFrame(renderLoop);
      };

      requestAnimationFrame(renderLoop);
    } catch {
      resolve(fallbackUrl);
    }
  });
}
