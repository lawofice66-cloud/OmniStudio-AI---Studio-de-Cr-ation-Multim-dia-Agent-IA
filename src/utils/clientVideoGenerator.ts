/**
 * Generates an animated cinematic 5s video clip matching the prompt using
 * Pollinations AI image rendering and HTML5 Canvas MediaRecorder with
 * camera movement (Travelling Dolly, Pan, Zoom).
 */
export async function generateClientVideo(
  prompt: string,
  ratio: '16:9' | '9:16' = '16:9',
  cameraMovement = 'Travelling Dolly',
  baseImageUrl?: string
): Promise<string> {
  const width = ratio === '16:9' ? 1280 : 720;
  const height = ratio === '16:9' ? 720 : 1280;

  // 1. Use provided base image (from server with 0 CORS issues) or fetch Flux AI frame matching prompt
  const cleanKeyword = encodeURIComponent(prompt.slice(0, 350));
  const seed = Math.floor(Math.random() * 90000) + 10000;
  const imageUrl = baseImageUrl || `https://image.pollinations.ai/prompt/${cleanKeyword}?width=${width}&height=${height}&nologo=true&seed=${seed}&model=flux`;

  return new Promise((resolve) => {
    const img = new Image();
    if (!imageUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }

    // Timeout safety
    const timeout = setTimeout(() => {
      resolve(imageUrl);
    }, 12000);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          clearTimeout(timeout);
          resolve(imageUrl);
          return;
        }

        // Test MediaRecorder support
        if (typeof MediaRecorder === 'undefined' || !canvas.captureStream) {
          clearTimeout(timeout);
          resolve(imageUrl);
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
          clearTimeout(timeout);
          const finalMime = mimeType || 'video/webm';
          const blob = new Blob(chunks, { type: finalMime });
          const videoObjectUrl = URL.createObjectURL(blob);
          resolve(videoObjectUrl);
        };

        recorder.start();

        // Animate 5 seconds (150 frames at 30 fps)
        const totalFrames = 150;
        let frame = 0;

        const renderFrame = () => {
          const progress = frame / totalFrames; // 0 to 1
          frame++;

          ctx.clearRect(0, 0, width, height);

          // Apply cinematic camera motion
          ctx.save();
          let scale = 1.0;
          let dx = 0;
          let dy = 0;

          if (cameraMovement.includes('Dolly') || cameraMovement.includes('Zoom')) {
            // Smooth zoom-in (1.0 -> 1.15)
            scale = 1.0 + progress * 0.15;
            dx = (width * (1 - scale)) / 2;
            dy = (height * (1 - scale)) / 2;
          } else if (cameraMovement.includes('Pan')) {
            // Smooth horizontal pan
            scale = 1.08;
            dx = -progress * (width * 0.08);
            dy = (height * (1 - scale)) / 2;
          } else {
            // Gentle cinematic drift
            scale = 1.0 + progress * 0.08;
            dx = (width * (1 - scale)) / 2;
            dy = (height * (1 - scale)) / 2;
          }

          ctx.drawImage(img, dx, dy, width * scale, height * scale);

          // Subtle cinematic film grain & volumetric glow overlay
          const gradient = ctx.createRadialGradient(
            width / 2, height / 2, width * 0.2,
            width / 2, height / 2, width * 0.7
          );
          gradient.addColorStop(0, 'rgba(0,0,0,0)');
          gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);

          ctx.restore();

          if (frame < totalFrames) {
            requestAnimationFrame(renderFrame);
          } else {
            recorder.stop();
          }
        };

        renderFrame();
      } catch {
        clearTimeout(timeout);
        resolve(imageUrl);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(imageUrl);
    };

    img.src = imageUrl;
  });
}
