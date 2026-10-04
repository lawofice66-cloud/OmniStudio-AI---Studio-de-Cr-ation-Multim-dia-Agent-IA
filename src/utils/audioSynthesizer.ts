// Client-side pure Web Audio / WAV generator for instant playback of showcase music samples
export function generateShowcaseWav(style: 'cinematic' | 'synthwave' | 'lofi' | 'fantasy', duration = 16): string {
  const sampleRate = 22050;
  const numSamples = sampleRate * duration;
  const numChannels = 2;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // Write ASCII string
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Chords based on style
  let chords: number[][];
  if (style === 'synthwave') {
    chords = [
      [130.81, 196.0, 261.63, 392.0], // C minor / power
      [116.54, 174.61, 233.08, 349.23], // Bb
      [103.83, 155.56, 207.65, 311.13], // Ab
      [116.54, 174.61, 233.08, 349.23], // Bb
    ];
  } else if (style === 'lofi') {
    chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 415.3],   // Am7
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [196.0, 246.94, 293.66, 392.0],   // G7
    ];
  } else if (style === 'fantasy') {
    chords = [
      [220.0, 329.63, 440.0, 523.25], // D dorian / A min
      [196.0, 293.66, 392.0, 493.88], // G
      [174.61, 261.63, 349.23, 440.0], // F
      [164.81, 246.94, 329.63, 392.0], // E min
    ];
  } else {
    // Cinematic
    chords = [
      [220.0, 261.63, 329.63, 440.0], // Am
      [174.61, 220.0, 261.63, 349.23], // F
      [261.63, 329.63, 392.0, 523.25], // C
      [196.0, 246.94, 293.66, 392.0],  // G
    ];
  }

  let offset = 44;
  const chordDuration = duration / chords.length;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const chordIndex = Math.floor(t / chordDuration) % chords.length;
    const chord = chords[chordIndex];

    let sampleL = 0;
    let sampleR = 0;

    chord.forEach((freq, idx) => {
      const vibrato = 1 + 0.0025 * Math.sin(2 * Math.PI * (style === 'synthwave' ? 6 : 4) * t);
      const wave = Math.sin(2 * Math.PI * (freq * vibrato) * t);
      const sub = 0.4 * Math.sin(Math.PI * freq * t);
      const amp = 0.22;
      sampleL += (wave + sub) * amp * (idx % 2 === 0 ? 0.75 : 0.35);
      sampleR += (wave + sub) * amp * (idx % 2 === 1 ? 0.75 : 0.35);
    });

    // Add rhythmic pulse for synthwave or lofi
    if (style === 'synthwave') {
      const beat = Math.sin(2 * Math.PI * 2 * t);
      if (beat > 0.8) {
        sampleL *= 1.2;
        sampleR *= 1.2;
      }
    }

    const fadeIn = Math.min(1, t / 1.2);
    const fadeOut = Math.min(1, (duration - t) / 1.5);
    const env = fadeIn * fadeOut;

    const valL = Math.max(-1, Math.min(1, sampleL * env));
    const valR = Math.max(-1, Math.min(1, sampleR * env));

    view.setInt16(offset, Math.floor(valL * 32767), true);
    view.setInt16(offset + 2, Math.floor(valR * 32767), true);
    offset += 4;
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}
