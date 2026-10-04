import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Upload, Play, Pause, Copy, Check, Download, Sparkles, FileAudio, RefreshCw, AlertCircle, Coins, FileText, ListChecks, Crown, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PRICING_CONFIG, TranscriptionItem } from '../types';
import { downloadTextWithWatermark } from '../utils/watermark';

export const AudioTranscribeStudio: React.FC = () => {
  const { user, deductCredits, addTranscription, transcriptionHistory, openSubscriptionModal } = useAuth();
  const { success: toastSuccess } = useToast();

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string>('');
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  // Audio Playback
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Transcription state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<TranscriptionItem | null>(null);
  const [copied, setCopied] = useState(false);

  const cost = PRICING_CONFIG.CREDIT_COSTS.TRANSCRIBE;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|ogg|webm|aac)$/i)) {
      setError('Veuillez sélectionner un fichier audio valide (MP3, WAV, M4A, WEBM, OGG).');
      return;
    }

    setError(null);
    setAudioName(file.name);
    setAudioBlob(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  // Start live microphone recording
  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const recordedBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(recordedBlob);
        setAudioName(`Enregistrement_Micro_${new Date().toLocaleTimeString().replace(/:/g, '-')}.webm`);
        const url = URL.createObjectURL(recordedBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setError("Impossible d'accéder au microphone. Vérifiez les autorisations de votre navigateur.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  // Convert Blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Transcribe audio via Gemini API
  const handleTranscribe = async () => {
    if (!audioBlob) {
      setError('Veuillez charger un fichier audio ou enregistrer votre voix.');
      return;
    }
    setError(null);

    const hasCredits = deductCredits(cost, `Transcription : ${audioName || 'Audio'}`, 'transcribe');
    if (!hasCredits) {
      return;
    }

    setLoading(true);
    try {
      const base64Audio = await blobToBase64(audioBlob);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64Audio,
          mimeType: audioBlob.type || 'audio/mp3',
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Erreur lors de la transcription.');
      }

      const newItem: TranscriptionItem = {
        id: 'trans_' + Date.now(),
        fileName: audioName || 'Audio_Transcription',
        audioDuration: `${recordingSeconds > 0 ? recordingSeconds + 's' : 'Fichier importé'}`,
        transcription: data.transcription,
        createdAt: new Date().toISOString(),
        creditsUsed: cost,
      };

      setCurrentResult(newItem);
      addTranscription(newItem);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la transcription audio.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!currentResult) return;
    navigator.clipboard.writeText(currentResult.transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!currentResult) return;
    downloadTextWithWatermark(
      currentResult.transcription,
      currentResult.fileName,
      !!user?.isPro,
      `${currentResult.fileName.replace(/\.[^/.]+$/, '')}_transcription.txt`
    );
    toastSuccess(
      'Transcription exportée !',
      user?.isPro ? 'Fichier texte HD sans filigrane enregistré.' : 'Document enregistré avec filigrane Plan Free.',
      'sparkles'
    );
  };

  const toggleAudioPlay = () => {
    if (!audioElementRef.current) return;
    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Studio Header Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span>Reconnaissance Vocale & Analyse Sémantique</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Studio <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">Transcription Audio</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Importez des podcasts, réunions, mémos vocaux ou enregistrez votre voix en direct. L'IA transcrit mot à mot, sépare les locuteurs et génère un résumé instantané. Coût : <strong>{cost} crédit</strong>.
          </p>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Audio Input & Recording */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-white/10 space-y-6">
            
            {/* Live Recording Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Option 1 : Enregistrement en Direct
              </label>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-center flex flex-col items-center justify-center space-y-3">
                {isRecording ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-rose-400 font-mono text-lg font-bold">
                      <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                      <span>
                        00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                      </span>
                    </div>

                    {/* Waveform Visualizer simulation */}
                    <div className="flex items-center justify-center gap-1 h-8">
                      {[16, 28, 20, 32, 18, 30, 24, 12, 28, 34, 18, 26].map((h, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-rose-500 rounded-full animate-pulse"
                          style={{
                            height: `${h}px`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 mx-auto cursor-pointer"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>Arrêter l'enregistrement</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={startRecording}
                      className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center mx-auto transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                      title="Démarrer l'enregistrement"
                    >
                      <Mic className="w-6 h-6" />
                    </button>
                    <p className="text-xs text-slate-300 font-medium mt-2">Cliquez pour enregistrer</p>
                    <p className="text-[10px] text-slate-500">Microphone HD actif</p>
                  </div>
                )}
              </div>
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Option 2 : Importer un Fichier Audio
              </label>

              <label className="border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-900/40">
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.aac"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-2">
                  <Upload className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-xs font-semibold text-slate-200">
                  Glissez-déposez ou parcourez
                </span>
                <span className="text-[10px] text-slate-500 mt-1">
                  MP3, WAV, M4A, WEBM, OGG (Jusqu'à 50 Mo)
                </span>
              </label>
            </div>

            {/* Loaded Audio Player Card */}
            {audioUrl && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <FileAudio className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-white truncate max-w-[200px]">
                      {audioName}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={toggleAudioPlay}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-all"
                  >
                    {isPlayingAudio ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>
                </div>

                <audio
                  ref={audioElementRef}
                  src={audioUrl}
                  onEnded={() => setIsPlayingAudio(false)}
                  className="w-full h-8 pt-1"
                  controls
                />
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Transcribe Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleTranscribe}
                disabled={loading || !audioBlob}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer group"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Transcription & Analyse en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                    <span>Transcrire l'Audio</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-black/30 text-emerald-200 text-xs font-semibold border border-white/10 flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-400" />
                      {cost} crédit
                    </span>
                  </>
                )}
              </button>

              {user && user.credits < cost && (
                <button
                  type="button"
                  onClick={openSubscriptionModal}
                  className="text-xs text-amber-400 hover:underline shrink-0"
                >
                  Recharger pour 5$ (500 cr)
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Transcription Results */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-white/10 flex flex-col justify-between min-h-[460px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Résultat de la Transcription & Analyse
              </h3>

              {currentResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                    title="Copier le texte"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copié' : 'Copier'}</span>
                  </button>

                  <button
                    onClick={handleDownloadTxt}
                    className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Télécharger en fichier texte"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger TXT</span>
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-slate-900/60 border border-dashed border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 animate-pulse">
                  <Mic className="w-8 h-8 text-emerald-400 animate-bounce" />
                </div>
                <p className="text-sm font-semibold text-white">Analyse audio haute précision...</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Extraction phonétique, détection des locuteurs et synthèse exécutive par Gemini.
                </p>
              </div>
            ) : currentResult ? (
              <div className="flex-1 flex flex-col space-y-4">
                <div className="flex-1 overflow-y-auto max-h-[500px] p-4 rounded-2xl bg-slate-900/90 border border-white/5 space-y-4 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {currentResult.transcription}
                </div>
                
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Fichier: <strong>{currentResult.fileName}</strong></span>
                  <span>{new Date(currentResult.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-slate-900/40 border border-dashed border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center mb-4">
                  <ListChecks className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-sm font-medium text-slate-300">Aucune transcription pour le moment</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Enregistrez votre voix ou déposez un fichier audio à gauche pour générer la transcription complète.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* History */}
      {transcriptionHistory.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Transcriptions Récentes ({transcriptionHistory.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {transcriptionHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => setCurrentResult(item)}
                className="p-4 rounded-2xl glass-panel border border-white/10 cursor-pointer hover:border-emerald-500/40 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                    {item.fileName}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {item.audioDuration}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-3 italic">
                  {item.transcription.slice(0, 150)}...
                </p>
                <div className="text-[10px] text-slate-500 pt-1">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
