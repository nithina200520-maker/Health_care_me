import React from 'react';
import { FileText, ShieldAlert, CheckCircle2, AlertCircle, HelpCircle, BookOpen, Volume2, Stethoscope, UserCheck } from 'lucide-react';
import { VoiceControls } from './VoiceControls';

export function DocumentAnalysisCard({
  analysis,
  language = 'en',
  onAskDoctorQuestion,
}) {
  if (!analysis) return null;

  const {
    documentType,
    fileName,
    doctorHeader,
    parameters = [],
    summary,
    terminology = [],
    questionsForDoctor = [],
    spokenText,
    disclaimer,
  } = analysis;

  return (
    <div className="rounded-xl bg-[#081528] border border-cyan-800/50 p-4 space-y-4 text-slate-200 shadow-xl">
      {/* Header with Type & Voice */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cyan-900/40">
        <div>
          <span className="inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700/60 mb-1">
            {documentType || 'Medical Record Extraction'}
          </span>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-cyan-500" />
            <span className="font-mono text-slate-300">{fileName}</span>
          </div>
        </div>

        {spokenText && (
          <VoiceControls spokenText={spokenText} language={language} compact autoPlay />
        )}
      </div>

      {/* Doctor & Clinic Header (if prescription/consultation) */}
      {doctorHeader && (
        <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-950/70 via-blue-950/50 to-[#091d38] border border-cyan-700/60 space-y-1.5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <Stethoscope className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{doctorHeader.doctorName}</span>
            </div>
            <span className="text-[10px] text-cyan-300 font-medium px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800">
              {doctorHeader.specialization}
            </span>
          </div>
          <div className="text-[11px] text-slate-300">
            <span className="text-cyan-400 font-medium">Hospital Unit:</span> {doctorHeader.clinic}
          </div>
          {doctorHeader.clinicalNotes && (
            <div className="text-[11px] text-slate-200 bg-cyan-950/40 p-1.5 rounded border border-cyan-900/50">
              <span className="text-cyan-300 font-semibold">Doctor's Diagnosis / Notes:</span> {doctorHeader.clinicalNotes}
            </div>
          )}
        </div>
      )}

      {/* Extracted Parameters / Findings Table */}
      {parameters.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {language === 'kn'
                ? 'ಹೊರತೆಗೆಯಲಾದ ಪರೀಕ್ಷಾ ಮೌಲ್ಯಗಳು ಮತ್ತು ವಿವರಗಳು'
                : language === 'hi'
                ? 'निकाली गई जांच और मान'
                : 'Extracted Clinical Parameters & Values'}
            </span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-cyan-900/30 bg-[#06101f]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b1b33] text-slate-300 text-[11px] uppercase tracking-wider border-b border-cyan-900/40">
                <tr>
                  <th className="py-2 px-3">
                    {language === 'kn' ? 'ಪರೀಕ್ಷೆ / ಔಷಧ' : language === 'hi' ? 'जांच / दवा' : 'Parameter / Item'}
                  </th>
                  <th className="py-2 px-3">
                    {language === 'kn' ? 'ಮೌಲ್ಯ' : language === 'hi' ? 'मान' : 'Extracted Value'}
                  </th>
                  <th className="py-2 px-3">
                    {language === 'kn' ? 'ಸಾಮಾನ್ಯ ಮಿತಿ / ಸೂಚನೆ' : language === 'hi' ? 'संदर्भ सीमा / निर्देश' : 'Reference / Instructions'}
                  </th>
                  <th className="py-2 px-3 text-right">
                    {language === 'kn' ? 'ಸ್ಥಿತಿ' : language === 'hi' ? 'स्थिति' : 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-950/60 font-mono">
                {parameters.map((param, index) => {
                  const isElevated = param.status?.toLowerCase().includes('elevated') || param.status?.toLowerCase().includes('high');
                  const isNormal = param.status?.toLowerCase().includes('normal') || param.status?.toLowerCase().includes('optimal');

                  return (
                    <tr key={index} className="hover:bg-cyan-950/20">
                      <td className="py-2 px-3 font-sans font-medium text-slate-200">{param.name}</td>
                      <td className="py-2 px-3 text-cyan-300 font-bold">{param.value}</td>
                      <td className="py-2 px-3 text-slate-400">{param.range || '—'}</td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                            isElevated
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                              : isNormal
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                              : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          }`}
                        >
                          {param.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plain Language Summary */}
      {summary && (
        <div className="p-3 rounded-lg bg-[#0b1d38]/80 border border-cyan-800/40 text-xs space-y-1">
          <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {language === 'kn' ? 'ಸರಳ ಭಾಷೆಯ ವಿವರಣೆ' : language === 'hi' ? 'सरल भाषा में व्याख्या' : 'Plain-Language Explanation'}
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Terminology definitions */}
      {terminology.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {language === 'kn' ? 'ವೈದ್ಯಕೀಯ ಪದಗಳ ಅರ್ಥ' : language === 'hi' ? 'चिकित्सीय शब्दों का अर्थ' : 'Medical Terminology Guide'}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {terminology.map((t, idx) => (
              <div key={idx} className="p-2.5 rounded bg-[#09182d] border border-cyan-900/30 text-xs">
                <span className="font-semibold text-cyan-300">{t.term}: </span>
                <span className="text-slate-300">{t.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Doctor Questions */}
      {questionsForDoctor.length > 0 && (
        <div className="p-3 rounded-lg bg-[#0a182c] border border-slate-700/50 text-xs space-y-2">
          <div className="font-semibold text-slate-200">
            {language === 'kn'
              ? 'ನಿಮ್ಮ ವೈದ್ಯರನ್ನು ಕೇಳಬೇಕಾದ ಮುಖ್ಯ ಪ್ರಶ್ನೆಗಳು:'
              : language === 'hi'
              ? 'डॉक्टर से परामर्श के समय पूछने योग्य प्रश्न:'
              : 'Recommended Questions for Your Treating Doctor:'}
          </div>
          <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
            {questionsForDoctor.map((q, i) => (
              <li key={i} className="leading-snug">
                <span className="text-slate-200">{q}</span>
                {onAskDoctorQuestion && (
                  <button
                    type="button"
                    onClick={() => onAskDoctorQuestion(q)}
                    className="ml-2 text-[10px] text-cyan-400 hover:text-cyan-300 underline"
                  >
                    {language === 'kn' ? 'ಚಾಟ್‌ನಲ್ಲಿ ಕೇಳಿ' : language === 'hi' ? 'पूछें' : 'Ask in Chat'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Clinical Safety & Non-Diagnostic Banner */}
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-300">
        <ShieldAlert className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
        <p className="leading-tight">
          <strong className="text-cyan-200">
            {language === 'kn' ? 'ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆ: ' : language === 'hi' ? 'सुरक्षा सूचना: ' : 'Safety Disclaimer: '}
          </strong>
          {disclaimer ||
            'CareBridge AI provides automated transcription and terminology assistance. It does NOT diagnose diseases or replace medical decisions. Always consult your qualified healthcare provider.'}
        </p>
      </div>
    </div>
  );
}
