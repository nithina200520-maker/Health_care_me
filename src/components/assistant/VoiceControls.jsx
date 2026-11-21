import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Mic, MicOff, Radio } from 'lucide-react';

export function VoiceControls({
  spokenText,
  language = 'en',
  onSpeechInput,
  compact = false,
  autoPlay = false,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const utteranceRef = useRef(null);
  const recognitionRef = useRef(null);
  const autoPlayTriggeredRef = useRef(false);

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

  // Handle autoPlay when requested
  useEffect(() => {
    if (autoPlay && spokenText && isSupported && !autoPlayTriggeredRef.current) {
      autoPlayTriggeredRef.current = true;
      const timer = setTimeout(() => {
        handlePlay();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, spokenText, isSupported]);

  const pickVoice = (utterance, lang) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    let targetVoice = null;
    if (lang === 'kn') {
      targetVoice = voices.find((v) => v.lang.toLowerCase().includes('kn')) ||
                    voices.find((v) => v.lang.toLowerCase().includes('in'));
    } else if (lang === 'hi') {
      targetVoice = voices.find((v) => v.lang.toLowerCase().includes('hi')) ||
                    voices.find((v) => v.lang.toLowerCase().includes('in'));
    } else {
      targetVoice = voices.find((v) => v.lang === 'en-IN') ||
                    voices.find((v) => v.lang.startsWith('en'));
    }

    if (targetVoice) {
      utterance.voice = targetVoice;
    }
  };

  const handlePlay = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !spokenText) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text of non-readable symbols
    const cleanSpeech = spokenText.replace(/[*#_•⚠️🩺👨‍⚕️📸🧪📚]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleanSpeech) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utteranceRef.current = utterance;

    if (language === 'kn') {
      utterance.lang = 'kn-IN';
    } else if (language === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-US';
    }

    pickVoice(utterance, language);

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

    utterance.onerror = (e) => {
      // Ignore user cancellation errors
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Speech synthesis error:', e);
      }
      setIsPlaying(false);
      setIsPaused(false);
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('speechSynthesis.speak failed:', err);
    }
  };

  const handlePause = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleReplay = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPaused(false);
    handlePlay();
  };

  const handleStop = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const toggleListening = () => {
    if (!recognitionSupported) {
      alert(
        language === 'kn'
          ? 'ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸ್ಪೀಚ್-ಟು-ಟೆಕ್ಸ್ಟ್ ಬೆಂಬಲವಿಲ್ಲ. ದಯವಿಟ್ಟು ಕ್ರೋಮ್ ಅಥವಾ ಎಡ್ಜ್ ಬ್ರೌಸರ್ ಬಳಸಿ.'
          : language === 'hi'
          ? 'आपके ब्राउज़र में स्पीच-टू-टेक्स्ट समर्थित नहीं है। कृपया क्रोम अथवा एज ब्राउज़र का उपयोग करें।'
          : 'Speech-to-text is not supported in this browser. Please use Chrome or Edge.'
      );
      return;
    }

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

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e);
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

  // Compact Mode (used in chat bubble or input bar)
  if (compact) {
    // If this instance is just for microphone input in the text bar:
    if (onSpeechInput && !spokenText) {
      return (
        <button
          type="button"
          onClick={toggleListening}
          title={isListening ? 'Stop microphone' : 'Speak your symptoms or question'}
          className={`p-2 rounded-lg border transition-all duration-300 flex items-center justify-center ${
            isListening
              ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-500/40 animate-pulse scale-105'
              : 'bg-slate-800/80 hover:bg-slate-700 text-cyan-400 border-slate-700 hover:border-cyan-500/50'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
        </button>
      );
    }

    // Voice playback in message bubble:
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-300">
        {spokenText && isSupported && (
          <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-cyan-950/70 border border-cyan-700/50">
            <button
              type="button"
              onClick={isPlaying ? handlePause : handlePlay}
              title={isPlaying ? 'Pause spoken explanation' : 'Listen to AI voice explanation'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                isPlaying
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-300 hover:text-white'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>{language === 'kn' ? 'ವಿರಾಮ' : language === 'hi' ? 'रोकें' : 'Pause Voice'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{language === 'kn' ? 'ಧ್ವನಿ ಕೇಳಿ' : language === 'hi' ? 'आवाज सुनें' : 'Listen Voice'}</span>
                </>
              )}
            </button>

            {/* Audio wave equalizer bars when playing */}
            {isPlaying && (
              <div className="flex items-center gap-0.5 px-1.5" title="Audio playing">
                <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse" />
                <span className="w-1 h-4 bg-cyan-300 rounded-full animate-bounce" />
                <span className="w-1 h-2 bg-cyan-400 rounded-full animate-pulse" />
              </div>
            )}

            {isPlaying && (
              <button
                type="button"
                onClick={handleStop}
                title="Stop audio"
                className="p-1 rounded text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
            )}

            {!isPlaying && isPaused && (
              <button
                type="button"
                onClick={handleReplay}
                title="Replay"
                className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full Banner Mode
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-r from-[#0a1b32] via-[#0b213f] to-[#071322] border border-cyan-700/50 text-xs shadow-md">
      <div className="flex items-center gap-2.5">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all ${
          isPlaying
            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-500/30'
            : 'bg-cyan-950/60 text-cyan-400 border-cyan-800/60'
        }`}>
          {isPlaying ? (
            <Radio className="w-4 h-4 animate-spin-slow text-cyan-300" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </div>
        <div>
          <div className="font-semibold text-slate-100 flex items-center gap-1.5">
            <span>{language === 'kn' ? 'ಕೇರ್‌ಬ್ರಿಡ್ಜ್ AI ಧ್ವನಿ ಸಹಾಯಕ' : language === 'hi' ? 'केयरब्रिज एआई वॉइस असिस्टेंट' : 'CareBridge AI Voice Assistant'}</span>
            {isPlaying && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 animate-pulse">
                Speaking
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400">
            {isPlaying
              ? (language === 'kn' ? 'ವಿವರಣೆ ಧ್ವನಿಯಲ್ಲಿ ಪ್ಲೇ ಆಗುತ್ತಿದೆ...' : language === 'hi' ? 'ऑडियो विवरण चल रहा है...' : 'Narrating clinical explanation...')
              : (language === 'kn' ? 'ಸ್ಪಷ್ಟ ಆಡಿಯೋ ವಿವರಣೆ ಲಭ್ಯವಿದೆ' : language === 'hi' ? 'ऑडियो विवरण उपलब्ध है' : 'Voice explanation ready')}
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
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'kn' ? 'ಧ್ವನಿ ಕೇಳಿ' : language === 'hi' ? 'सुनें' : 'Play Voice'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePause}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'kn' ? 'ವಿರಾಮ' : language === 'hi' ? 'रोकें' : 'Pause'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReplay}
              title="Replay from start"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleStop}
              title="Stop audio"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-300 transition-colors"
            >
              <VolumeX className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {recognitionSupported && onSpeechInput && (
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? 'Stop microphone' : 'Speak your symptoms or questions'}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border font-medium transition-all ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-800/60'
            }`}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            <span>
              {isListening
                ? (language === 'kn' ? 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ...' : language === 'hi' ? 'सुन रहा है...' : 'Listening...')
                : (language === 'kn' ? 'ಮಾತನಾಡಿ' : language === 'hi' ? 'बोलें' : 'Speak')}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
