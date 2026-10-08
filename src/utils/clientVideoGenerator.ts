/**
 * Client-Side Cinematic Video Generator & Multi-Segment Video Extender.
 * Generates high-fidelity 5s base video clips and stitches continuous extended videos
 * (10s, 15s, etc.) via HTML5 Canvas and MediaRecorder.
 */

export interface VideoSegmentConfig {
  prompt: string;
  cameraMovement?: string;
  baseImageUrl?: string;
  durationSeconds?: number;
}

// Helper to safely load an image as HTMLImageElement
function loadImageElement(url: string, timeoutMs = 12000): Promise<HTMLImageElement | null> {
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
  const cleanKeyword = encodeURIComponent(prompt.slice(0, 350));
  const seed = Math.floor(Math.random() * 90000) + 10000;
  return `https://image.pollinations.ai/prompt/${cleanKeyword}?width=${width}&height=${height}&nologo=true&seed=${seed}&model=flux`;
}

/**
 * Generates an animated cinematic 5s video clip matching the prompt using
 * canvas MediaRecorder with smooth camera movement.
 */
export async function generateClientVideo(
  prompt: string,
  ratio: '16:9' | '9:16' = '16:9',
  cameraMovement = 'Travelling Dolly',
  baseImageUrl?: string,
  durationSeconds = 5
): Promise<string> {
  return generateMultiSegmentVideo(
    [
      {
        prompt,
        cameraMovement,
        baseImageUrl,
        durationSeconds,
      },
    ],
    ratio
  );
}

/**
 * Generates or extends a continuous multi-segment video (e.g. 5s + 5s = 10s total, or 15s total)
 * with seamless transitions, continuous motion, and high-definition canvas rendering.
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

  // Resolve image URLs for each segment
  const segmentItems = segments.map((seg) => {
    const dur = seg.durationSeconds && seg.durationSeconds > 0 ? seg.durationSeconds : 5;
    const url = resolveImageUrl(seg.prompt, width, height, seg.baseImageUrl);
    return {
      prompt: seg.prompt,
      cameraMovement: seg.cameraMovement || 'Travelling Dolly',
      durationSeconds: dur,
      frames: Math.round(dur * 30),
      url,
    };
  });

  // Load all images in parallel
  const loadedImages = await Promise.all(
    segmentItems.map((item) => loadImageElement(item.url))
  );

  // If even the first image fails to load, return the URL as fallback
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

      const stream = canvas.captureStream(30);
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = '';
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
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

      recorder.start();

      const totalFrames = segmentItems.reduce((acc, cur) => acc + cur.frames, 0);
      let globalFrame = 0;

      const drawSegmentFrame = (
        img: HTMLImageElement,
        cameraMovement: string,
        progress: number,
        alpha = 1.0
      ) => {
        ctx.save();
        ctx.globalAlpha = alpha;

        let scale = 1.0;
        let dx = 0;
        let dy = 0;

        if (cameraMovement.includes('Dolly') || cameraMovement.includes('Zoom')) {
          scale = 1.0 + progress * 0.16;
          dx = (width * (1 - scale)) / 2;
          dy = (height * (1 - scale)) / 2;
        } else if (cameraMovement.includes('Pan')) {
          scale = 1.08;
          dx = -progress * (width * 0.08);
          dy = (height * (1 - scale)) / 2;
        } else if (cameraMovement.includes('Orbite') || cameraMovement.includes('Drone')) {
          scale = 1.05 + Math.sin(progress * Math.PI) * 0.08;
          dx = (Math.cos(progress * Math.PI * 0.5) - 0.5) * (width * 0.05);
          dy = (height * (1 - scale)) / 2;
        } else {
          scale = 1.0 + progress * 0.08;
          dx = (width * (1 - scale)) / 2;
          dy = (height * (1 - scale)) / 2;
        }

        ctx.drawImage(img, dx, dy, width * scale, height * scale);

        // Volumetric cinematic vignette & lighting
        const gradient = ctx.createRadialGradient(
          width / 2, height / 2, width * 0.2,
          width / 2, height / 2, width * 0.72
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.28)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.restore();
      };

      const renderLoop = () => {
        // Find active segment
        let accumulated = 0;
        let activeIdx = 0;
        let segFrame = 0;

        for (let i = 0; i < segmentItems.length; i++) {
          if (globalFrame < accumulated + segmentItems[i].frames) {
            activeIdx = i;
            segFrame = globalFrame - accumulated;
            break;
          }
          accumulated += segmentItems[i].frames;
        }

        const currentSeg = segmentItems[activeIdx];
        const currentImg = loadedImages[activeIdx] || firstImg;
        const segProgress = segFrame / currentSeg.frames;

        ctx.clearRect(0, 0, width, height);

        // Check if we are in crossfade transition with next segment (last 15 frames = 0.5s)
        const transitionWindow = 15;
        const framesRemaining = currentSeg.frames - segFrame;
        const nextIdx = activeIdx + 1;

        if (framesRemaining < transitionWindow && nextIdx < segmentItems.length) {
          const nextImg = loadedImages[nextIdx] || currentImg;
          const nextSeg = segmentItems[nextIdx];
          const crossfadeProgress = 1 - framesRemaining / transitionWindow; // 0 to 1

          // Draw base current segment
          drawSegmentFrame(currentImg, currentSeg.cameraMovement, segProgress, 1 - crossfadeProgress * 0.5);
          // Blend in next segment
          drawSegmentFrame(nextImg, nextSeg.cameraMovement, 0, crossfadeProgress);
        } else {
          drawSegmentFrame(currentImg, currentSeg.cameraMovement, segProgress, 1.0);
        }

        globalFrame++;

        if (globalFrame < totalFrames) {
          requestAnimationFrame(renderLoop);
        } else {
          recorder.stop();
        }
      };

      renderLoop();
    } catch {
      resolve(fallbackUrl);
    }
  });
}
