import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Mic, MicOff } from 'lucide-react';

export function VoiceControls({
  spokenText,
  language = 'en',
  onSpeechInput,
  compact = false,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const utteranceRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (SpeechRecognition) {
      setRecognitionSupported(true);
    }
  }, []);

  // Cancel any active speech when spokenText changes or unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [spokenText]);

  const handlePlay = () => {
    if (!isSupported || !spokenText) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utteranceRef.current = utterance;

    // Pick appropriate voice tag
    if (language === 'kn') {
      utterance.lang = 'kn-IN';
    } else if (language === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (!isSupported) return;
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleReplay = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPaused(false);
    handlePlay();
  };

  const handleStop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const toggleListening = () => {
    if (!recognitionSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;

      if (language === 'kn') {
        recognition.lang = 'kn-IN';
      } else if (language === 'hi') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-US';
      }

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript && onSpeechInput) {
          onSpeechInput(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      setIsListening(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-300">
        {spokenText && isSupported && (
          <button
            type="button"
            onClick={isPlaying ? handlePause : handlePlay}
            title={isPlaying ? 'Pause spoken explanation' : 'Listen to explanation'}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-400 border border-cyan-800/50 transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Voice' : 'Play Voice'}</span>
          </button>
        )}
        {isPlaying && (
          <button
            type="button"
            onClick={handleStop}
            title="Stop audio"
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <VolumeX className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-[#0a1628]/80 border border-cyan-900/40 text-xs">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          {isPlaying ? <Volume2 className="w-4 h-4 animate-pulse text-cyan-300" /> : <Volume2 className="w-4 h-4" />}
        </div>
        <div>
          <div className="font-medium text-slate-200">
            {language === 'kn' ? 'ಧ್ವನಿ ಸಹಾಯಕ' : language === 'hi' ? 'आवाज सहायक' : 'Voice Assistant'}
          </div>
          <div className="text-[10px] text-slate-400">
            {isPlaying ? (language === 'kn' ? 'ಧ್ವನಿ ಪ್ಲೇ ಆಗುತ್ತಿದೆ...' : language === 'hi' ? 'आवाज चल रही है...' : 'Speaking explanation...') : (language === 'kn' ? 'ಸ್ಪಷ್ಟ ಆಡಿಯೋ ವಿವರಣೆ ಲಭ್ಯವಿದೆ' : language === 'hi' ? 'ऑडियो विवरण उपलब्ध है' : 'Audio response available')}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {spokenText && isSupported && (
          <>
            {!isPlaying ? (
              <button
                type="button"
                onClick={handlePlay}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'kn' ? 'ಪ್ಲೇ' : language === 'hi' ? 'सुनें' : 'Play'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePause}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold transition-colors"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'kn' ? 'ವಿರಾಮ' : language === 'hi' ? 'रोकें' : 'Pause'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReplay}
              title="Replay"
              className="p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleStop}
              title="Stop"
              className="p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 transition-colors"
            >
              <VolumeX className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {recognitionSupported && onSpeechInput && (
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? 'Stop microphone' : 'Speak your question'}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border transition-colors ${
              isListening
                ? 'bg-rose-600/90 hover:bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{isListening ? (language === 'kn' ? 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ...' : language === 'hi' ? 'सुन रहा है...' : 'Listening...') : (language === 'kn' ? 'ಮಾತನಾಡಿ' : language === 'hi' ? 'बोलें' : 'Speak')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
