import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
  Send,
  Paperclip,
  Sparkles,
  Bot,
  User,
  Shield,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  Volume2,
  Stethoscope,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { sendChatMessage, analyzeMedicalDocument } from '../../services/api';
import { VoiceControls } from './VoiceControls';
import { ImageUploadZone } from './ImageUploadZone';
import { DocumentAnalysisCard } from './DocumentAnalysisCard';

export function FloatingAssistant({ onNavigateSection, currentRole = 'Patient' }) {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [autoVoiceEnabled, setAutoVoiceEnabled] = useState(true);

  // Initial welcome message
  const initialGreeting = {
    id: 'welcome-1',
    sender: 'assistant',
    text:
      language === 'kn'
        ? 'ನಮಸ್ಕಾರ! ನಾನು ಕೇರ್‌ಬ್ರಿಡ್ಜ್ AI ಸಹಾಯಕ. ನೀವು ವೈದ್ಯರ ಲಭ್ಯತೆ, ರಕ್ತ ಪರೀಕ್ಷೆಗಳ ಸ್ಥಿತಿ, ಸಿಟಿ/ಎಂಆರ್‌ಐ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬಗ್ಗೆ ಕೇಳಬಹುದು ಅಥವಾ ವೈದ್ಯಕೀಯ ಚೀಟಿ/ವರದಿಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಸರಳ ವಿವರಣೆ ಪಡೆಯಬಹುದು.'
        : language === 'hi'
        ? 'नमस्ते! मैं केयरब्रिज एआई स्मार्ट असिस्टेंट हूँ। आप मुझसे डॉक्टर की उपलब्धता, लैब टेस्ट स्थिति, सीटी/एमआरआई समय या मेडिकल पर्चे/रिपोर्ट का सरल विश्लेषण पूछ सकते हैं।'
        : 'Hello! I am your CareBridge AI Healthcare Assistant. I can help you track lab reports, check doctor schedules, view radiology timelines, and explain medical documents in simple terms. How can I assist you?',
    spokenText:
      language === 'kn'
        ? 'ನಮಸ್ಕಾರ! ನಾನು ಕೇರ್‌ಬ್ರಿಡ್ಜ್ AI ಸಹಾಯಕ. ನೀವು ವೈದ್ಯರ ಲಭ್ಯತೆ, ರಕ್ತ ಪರೀಕ್ಷೆಗಳ ಸ್ಥಿತಿ, ಸಿಟಿ ಅಥವಾ ಎಂಆರ್‌ಐ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬಗ್ಗೆ ಕೇಳಬಹುದು.'
        : language === 'hi'
        ? 'नमस्ते! मैं केयरब्रिज एआई स्मार्ट असिस्टेंट हूँ। आप मुझसे डॉक्टर की उपलब्धता, लैब टेस्ट या मेडिकल पर्चे के बारे में पूछ सकते हैं।'
        : 'Hello! I am your CareBridge AI Healthcare Assistant. How can I assist you with your hospital care today?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState([initialGreeting]);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, showUploadZone]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setHasUnread(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSendMessage = async (textToSend) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.text)
        .slice(-6)
        .map((m) => ({ role: m.sender === 'user' ? 'user' : 'model', content: m.text }));

      const response = await sendChatMessage({
        message: messageContent,
        history,
        language,
        role: currentRole,
      });

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        spokenText: response.spokenText,
        actionSuggestion: response.actionSuggestion,
        clinicalReferral: response.clinicalReferral,
        autoPlay: autoVoiceEnabled,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.warn('Chat request failed, using intelligent offline parser:', err);
      // Client-side fallback if backend network is unreachable
      const fallbackMsg = {
        id: `assistant-fb-${Date.now()}`,
        sender: 'assistant',
        text:
          language === 'kn'
            ? 'ಕೇರ್‌ಬ್ರಿಡ್ಜ್ AI ಸಹಾಯಕ: ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ವೈದ್ಯರ ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ಲ್ಯಾಬ್ ತಪಾಸಣೆಗಾಗಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ.'
            : language === 'hi'
            ? 'केयरब्रिज एआई: आपका संदेश प्राप्त हुआ। डॉक्टर शेड्यूल और लैब स्थिति देखने के लिए डैशबोर्ड का उपयोग करें।'
            : 'CareBridge AI Assistant: Diagnostic tracking and doctor availability are actively coordinated in the priority modules.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeDocument = async (payload) => {
    setIsAnalyzingDoc(true);

    // Immediately display user upload bubble with image preview thumbnail
    const userUploadMsg = {
      id: `user-upload-${Date.now()}`,
      sender: 'user',
      text: `Uploaded Doctor's Record / Image: ${payload.fileName}`,
      imagePreview: payload.fileData,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userUploadMsg]);

    try {
      const result = await analyzeMedicalDocument({
        ...payload,
        language,
        role: currentRole,
      });

      const docMsg = {
        id: `doc-${Date.now()}`,
        sender: 'assistant',
        text:
          language === 'kn'
            ? `ವೈದ್ಯರ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಮತ್ತು ದಾಖಲೆ (${payload.fileName}) ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ:`
            : language === 'hi'
            ? `डॉक्टर के पर्चे एवं मेडिकल दस्तावेज़ (${payload.fileName}) का विश्लेषण:`
            : `Doctor's Prescription & Medical Document (${payload.fileName}) Analysis:`,
        spokenText: result.spokenText,
        analysis: result,
        autoPlay: autoVoiceEnabled,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, docMsg]);
      setShowUploadZone(false);
    } catch (err) {
      console.error('Document analysis failed:', err);
      alert(err.message || 'Failed to analyze document.');
    } finally {
      setIsAnalyzingDoc(false);
    }
  };

  const suggestedQuestions = [
    {
      en: 'Which doctors are available now?',
      kn: 'ಯಾವ ವೈದ್ಯರು ಈಗ ಲಭ್ಯವಿದ್ದಾರೆ?',
      hi: 'वर्तमान में कौन से डॉक्टर उपलब्ध हैं?',
    },
    {
      en: 'What is the status of my blood test?',
      kn: 'ನನ್ನ ರಕ್ತ ಪರೀಕ್ಷೆಯ ಸ್ಥಿತಿ ಏನು?',
      hi: 'मेरी रक्त जांच की स्थिति क्या है?',
    },
    {
      en: 'Explain my prescription medicines',
      kn: 'ನನ್ನ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಔಷಧಿಗಳನ್ನು ವಿವರಿಸಿ',
      hi: 'मेरे पर्चे की दवाइयां समझाएं',
    },
    {
      en: 'How to check CT/MRI appointment?',
      kn: 'CT/MRI ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಹೇಗೆ ತಿಳಿಯುವುದು?',
      hi: 'सीटी / एमआरआई का समय कैसे देखें?',
    },
  ];

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center">
          <button
            type="button"
            onClick={handleOpen}
            aria-label="Open CareBridge AI Assistant"
            className="group relative flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-400/50 hover:scale-105 active:scale-95 transition-all duration-300 border border-cyan-400/40"
          >
            {/* Ambient Pulse Ring */}
            <span className="absolute -inset-1 rounded-full bg-cyan-400/30 blur-sm group-hover:bg-cyan-300/40 animate-pulse transition-all pointer-events-none" />

            {/* Avatar Holographic Glow */}
            <div className="relative w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center border border-cyan-300 shadow-inner">
              <Bot className="w-5 h-5 text-cyan-300 group-hover:rotate-12 transition-transform duration-300" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
            </div>

            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold tracking-wide flex items-center gap-1.5 text-cyan-50">
                <span>CareBridge AI</span>
                <Sparkles className="w-3 h-3 text-cyan-300 animate-spin-slow" />
              </div>
              <div className="text-[10px] text-cyan-200/90 font-medium">
                {language === 'kn' ? 'ಸ್ಮಾರ್ಟ್ ಸಹಾಯಕ' : language === 'hi' ? 'स्मार्ट सहायक' : 'Smart Assistant'}
              </div>
            </div>

            {hasUnread && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute -top-1 -right-1" />
            )}
          </button>
        </div>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex flex-col rounded-2xl bg-[#061122]/95 backdrop-blur-xl border border-cyan-500/40 shadow-2xl shadow-cyan-950/80 transition-all duration-300 overflow-hidden ${
            isMinimized
              ? 'w-80 h-16'
              : 'w-[95vw] sm:w-[440px] h-[640px] max-h-[90vh]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#091a33] via-[#0c2242] to-[#0a1a30] border-b border-cyan-800/40">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-400 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-300" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>CareBridge AI Assistant</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-900/80 text-cyan-300 border border-cyan-700/50 font-mono">
                    v0.3
                  </span>
                </div>
                <div className="text-[10px] text-cyan-300/80">
                  {language === 'kn' ? 'ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶಿ ಮತ್ತು ದಾಖಲೆ ವಿಶ್ಲೇಷಣೆ' : language === 'hi' ? 'स्वास्थ्य गाइड और रिपोर्ट विश्लेषण' : 'Healthcare Guide & Report AI'}
                </div>
              </div>
            </div>

            {/* Language Selector & Controls */}
            <div className="flex items-center gap-1.5">
              {/* Auto Voice Narration Toggle */}
              <button
                type="button"
                onClick={() => setAutoVoiceEnabled(!autoVoiceEnabled)}
                title={autoVoiceEnabled ? 'Auto Voice Narration ON (Click to mute)' : 'Auto Voice Narration OFF (Click to enable auto-speech)'}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                  autoVoiceEnabled
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                <Volume2 className={`w-3 h-3 ${autoVoiceEnabled ? 'text-cyan-400 animate-pulse' : ''}`} />
                <span className="hidden sm:inline">{autoVoiceEnabled ? 'Voice ON' : 'Muted'}</span>
              </button>

              <div className="flex rounded-md bg-slate-900/90 border border-cyan-800/50 p-0.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-1.5 py-0.5 rounded ${language === 'en' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('kn')}
                  className={`px-1.5 py-0.5 rounded ${language === 'kn' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  ಕನ್ನಡ
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`px-1.5 py-0.5 rounded ${language === 'hi' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  हिंदी
                </button>
              </div>

              <button
                type="button"
                onClick={handleMinimize}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleClose}
                title="Close Assistant"
                className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content (Visible when not minimized) */}
          {!isMinimized && (
            <>
              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-3 shadow-md ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-700 to-cyan-700 text-white rounded-tr-none'
                          : 'bg-[#091b33] border border-cyan-800/50 text-slate-200 rounded-tl-none space-y-2'
                      }`}
                    >
                      {/* Uploaded Image Thumbnail Preview */}
                      {msg.imagePreview && (
                        <div className="mb-2.5 max-w-[260px] rounded-xl overflow-hidden border border-cyan-400/50 shadow-lg bg-black/40">
                          <img
                            src={msg.imagePreview}
                            alt="Uploaded Doctor Written Note"
                            className="w-full max-h-52 object-contain bg-slate-950/70"
                          />
                        </div>
                      )}

                      <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>

                      {/* Clinical Doctor Referral Card */}
                      {msg.clinicalReferral && (
                        <div className="mt-2.5 p-3 rounded-xl bg-gradient-to-r from-cyan-950/90 via-blue-950/80 to-[#071322] border border-cyan-500/50 text-xs space-y-1.5 shadow-md">
                          <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-cyan-900/40 pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <Stethoscope className="w-4 h-4 text-cyan-400" />
                              <span>{msg.clinicalReferral.category || 'Specialist Consultation'}</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-900/80 text-cyan-300 border border-cyan-600">
                              {msg.clinicalReferral.priority}
                            </span>
                          </div>
                          <div className="text-slate-100 font-bold text-xs flex items-center gap-1.5">
                            <span className="text-cyan-400 font-medium">Doctor:</span>
                            <span>{msg.clinicalReferral.doctor}</span>
                          </div>
                          <div className="text-[11px] text-slate-300">
                            <span className="text-cyan-400 font-medium">Department:</span> {msg.clinicalReferral.department}
                          </div>
                        </div>
                      )}

                      {/* Document analysis card if attached */}
                      {msg.analysis && (
                        <div className="pt-2">
                          <DocumentAnalysisCard
                            analysis={msg.analysis}
                            language={language}
                            onAskDoctorQuestion={(q) => handleSendMessage(q)}
                          />
                        </div>
                      )}

                      {/* Action suggestion pill */}
                      {msg.actionSuggestion && onNavigateSection && (
                        <button
                          type="button"
                          onClick={() => onNavigateSection(msg.actionSuggestion.section)}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 hover:bg-cyan-900 transition-colors font-medium text-[11px]"
                        >
                          <span>{msg.actionSuggestion.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {/* Voice controls for spoken reply */}
                      {msg.spokenText && msg.sender === 'assistant' && (
                        <div className="pt-1.5">
                          <VoiceControls spokenText={msg.spokenText} language={language} compact autoPlay={msg.autoPlay} />
                        </div>
                      )}

                      <div className="text-[9px] text-slate-400 text-right mt-1 opacity-70">
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#091b33] border border-cyan-800/40 text-cyan-400 text-xs w-fit">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>
                      {language === 'kn' ? 'ಉತ್ತರಿಸಲಾಗುತ್ತಿದೆ...' : language === 'hi' ? 'उत्तर तैयार हो रहा है...' : 'CareBridge AI is thinking...'}
                    </span>
                  </div>
                )}

                {/* Suggested Questions (only show if few messages) */}
                {messages.length <= 2 && (
                  <div className="space-y-1.5 pt-2">
                    <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-cyan-400" />
                      <span>
                        {language === 'kn' ? 'ಶಿಫಾರಸು ಮಾಡಿದ ಪ್ರಶ್ನೆಗಳು:' : language === 'hi' ? 'सुझाए गए प्रश्न:' : 'Suggested questions:'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {suggestedQuestions.map((q, idx) => {
                        const label = q[language] || q.en;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(label)}
                            className="text-left py-1.5 px-2.5 rounded-lg bg-[#07172b] hover:bg-[#0a2342] text-slate-300 hover:text-cyan-300 border border-cyan-900/30 transition-colors text-xs"
                          >
                            • {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Upload Zone Drawer */}
                {showUploadZone && (
                  <div className="pt-2">
                    <ImageUploadZone
                      isAnalyzing={isAnalyzingDoc}
                      onAnalyze={handleAnalyzeDocument}
                      language={language}
                      onClose={() => setShowUploadZone(false)}
                    />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input & Controls Bar */}
              <div className="p-3 bg-[#071426] border-t border-cyan-900/40 space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-1.5"
                >
                  {/* Toggle Upload button */}
                  <button
                    type="button"
                    onClick={() => setShowUploadZone(!showUploadZone)}
                    title="Upload medical image or document"
                    className={`p-2 rounded-lg border transition-colors ${
                      showUploadZone
                        ? 'bg-cyan-600 text-slate-950 border-cyan-400'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Speech to text */}
                  <VoiceControls
                    language={language}
                    onSpeechInput={(transcript) => {
                      setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
                    }}
                    compact
                  />

                  {/* Input field */}
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      language === 'kn'
                        ? 'ಇಲ್ಲಿ ಪ್ರಶ್ನೆ ಕೇಳಿ ಅಥವಾ ವರದಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ...'
                        : language === 'hi'
                        ? 'यहाँ सवाल पूछें या रिपोर्ट अपलोड करें...'
                        : 'Ask a question or upload a document...'
                    }
                    className="flex-1 px-3 py-2 text-xs rounded-lg bg-[#0b1b33] border border-cyan-900/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-bold transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* Safety Micro-notice */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-cyan-500/70" />
                    <span>Non-diagnostic assistant • Consult your doctor</span>
                  </span>
                  <span>CareBridge AI v0.3</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
export default FloatingAssistant;
