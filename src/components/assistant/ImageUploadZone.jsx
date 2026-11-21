import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, X, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function ImageUploadZone({
  onAnalyze,
  isAnalyzing,
  language = 'en',
  onClose,
}) {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [consentGiven, setConsentGiven] = useState(true);
  const fileInputRef = useRef(null);

  const validateAndSetFile = (selectedFile) => {
    setError(null);
    if (!selectedFile) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError(
        language === 'kn'
          ? 'ಕೇವಲ JPG, PNG ಅಥವಾ PDF ಫೈಲ್‌ಗಳನ್ನು ಮಾತ್ರ ಬೆಂಬಲಿಸಲಾಗುತ್ತದೆ.'
          : language === 'hi'
          ? 'केवल JPG, PNG या PDF फाइलें ही समर्थित हैं।'
          : 'Only JPG, PNG, and PDF formats are supported.'
      );
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(
        language === 'kn'
          ? 'ಫೈಲ್ ಗಾತ್ರವು 10MB ಮೀರಬಾರದು.'
          : language === 'hi'
          ? 'फ़ाइल का आकार 10MB से अधिक नहीं होना चाहिए।'
          : 'File size must be 10MB or less.'
      );
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      // PDF representation
      setFilePreview(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setFilePreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadAndAnalyze = () => {
    if (!file) return;
    if (!consentGiven) {
      setError(
        language === 'kn'
          ? 'ದಯವಿಟ್ಟು ಮುಂದುವರಿಯಲು ಸಮ್ಮತಿ ಚೆಕ್‌ಬಾಕ್ಸ್ ಆಯ್ಕೆಮಾಡಿ.'
          : language === 'hi'
          ? 'आगे बढ़ने के लिए कृपया सहमति बॉक्स को चेक करें।'
          : 'Please accept user consent to proceed with document parsing.'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onAnalyze({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData: reader.result,
        language,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 rounded-xl bg-[#071322] border border-cyan-800/40 text-slate-200 space-y-3.5 shadow-xl">
      <div className="flex items-center justify-between pb-2 border-b border-cyan-900/40">
        <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400">
          <UploadCloud className="w-4 h-4 text-cyan-400" />
          <span>
            {language === 'kn'
              ? 'ವೈದ್ಯಕೀಯ ದಾಖಲೆ ಅಥವಾ ವರದಿ ಅಪ್‌ಲೋಡ್'
              : language === 'hi'
              ? 'मेडिकल पर्चा या जांच रिपोर्ट अपलोड'
              : 'Upload Medical Image or Document'}
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Drop area */}
      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            dragActive
              ? 'border-cyan-400 bg-cyan-950/40 scale-[1.01]'
              : 'border-slate-700 hover:border-cyan-500/60 bg-[#081729]/70 hover:bg-[#0a1e36]/70'
          }`}
        >
          <UploadCloud className="w-10 h-10 text-cyan-400 mb-2.5 animate-bounce-short" />
          <p className="text-sm font-medium text-slate-200 text-center">
            {language === 'kn'
              ? 'ಇಲ್ಲಿ ಫೈಲ್ ಎಳೆಯಿರಿ ಅಥವಾ ಹುಡುಕಲು ಕ್ಲಿಕ್ ಮಾಡಿ'
              : language === 'hi'
              ? 'यहाँ फ़ाइल खींचें या ब्राउज़ करने के लिए क्लिक करें'
              : 'Drag & drop your file here, or click to browse'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'kn'
              ? 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್, ರಕ್ತ ಪರೀಕ್ಷಾ ವರದಿ, ಲ್ಯಾಬ್ ದಾಖಲೆಗಳು (JPG, PNG, PDF ≤ 10MB)'
              : language === 'hi'
              ? 'पर्चे, ब्लड टेस्ट रिपोर्ट, लैब डॉक्यूमेंट (JPG, PNG, PDF ≤ 10MB)'
              : 'Prescriptions, Blood reports, Lab documents (JPG, PNG, PDF ≤ 10MB)'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        /* File Selected View */
        <div className="space-y-3 p-3 rounded-lg bg-[#0a1b30] border border-cyan-800/40">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Document Preview"
                  className="w-14 h-14 object-cover rounded-md border border-cyan-600/40"
                />
              ) : (
                <div className="w-14 h-14 rounded-md bg-cyan-950/70 border border-cyan-700/40 flex items-center justify-center text-cyan-400">
                  <FileText className="w-7 h-7" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-slate-100 line-clamp-1">{file.name}</p>
                <p className="text-xs text-slate-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Document'}
                </p>
                <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {language === 'kn' ? 'ಫೈಲ್ ಸಿದ್ಧವಾಗಿದೆ' : language === 'hi' ? 'फ़ाइल तैयार है' : 'Ready for AI parsing'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Replace file"
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                title="Remove file"
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Patient Consent Notice */}
      <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-300">
        <input
          type="checkbox"
          id="patient-consent"
          checked={consentGiven}
          onChange={(e) => setConsentGiven(e.target.checked)}
          className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
        />
        <label htmlFor="patient-consent" className="cursor-pointer leading-tight text-slate-400">
          <span className="font-semibold text-slate-200">
            {language === 'kn' ? 'ಸಮ್ಮತಿ: ' : language === 'hi' ? 'सहमति: ' : 'Consent: '}
          </span>
          {language === 'kn'
            ? 'ಈ ವೈದ್ಯಕೀಯ ದಾಖಲೆಯನ್ನು ಸರಳ ಭಾಷೆಯಲ್ಲಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಮತ್ತು ಪರೀಕ್ಷಾ ಮೌಲ್ಯಗಳನ್ನು ಹೊರತೆಗೆಯಲು ನಾನು ಸಮ್ಮತಿಸುತ್ತೇನೆ. ಇದು ರೋಗನಿರ್ಣಯವಲ್ಲ ಎಂಬುದನ್ನು ಅರಿತಿದ್ದೇನೆ.'
            : language === 'hi'
            ? 'मैं इस मेडिकल दस्तावेज़ को सरल भाषा में समझने और टेक्स्ट निकालने के लिए सहमति देता हूँ। यह स्वचालित रोग निदान नहीं है।'
            : 'I consent to extracting and summarizing this medical record for non-diagnostic translation and explanation. AI does not replace doctor evaluation.'}
        </label>
      </div>

      {/* Action CTA */}
      {file && (
        <button
          type="button"
          disabled={isAnalyzing || !consentGiven}
          onClick={handleUploadAndAnalyze}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition-all"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>
                {language === 'kn'
                  ? 'ದಾಖಲೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...'
                  : language === 'hi'
                  ? 'दस्तावेज़ का विश्लेषण हो रहा है...'
                  : 'Analyzing Document with AI...'}
              </span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>
                {language === 'kn'
                  ? 'AI ವಿಶ್ಲೇಷಣೆ ಪ್ರಾರಂಭಿಸಿ'
                  : language === 'hi'
                  ? 'एआई विश्लेषण शुरू करें'
                  : 'Analyze Document Now'}
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
