import React from 'react';
import { Activity, HeartPulse, ScanLine, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const points = [
  [153, 134], [188, 163], [231, 135], [272, 155], [115, 192], [158, 207],
  [205, 197], [255, 206], [302, 198], [105, 243], [151, 256], [198, 248],
  [247, 260], [292, 246], [128, 296], [175, 306], [222, 300], [269, 286],
  [160, 340], [209, 343], [247, 326],
];
const edges = [[0,1],[1,2],[2,3],[0,4],[0,5],[1,5],[1,6],[2,6],[2,7],[3,7],[3,8],[4,5],[4,9],[5,6],[5,10],[6,7],[6,11],[7,8],[7,12],[8,13],[9,10],[9,14],[10,11],[10,14],[10,15],[11,12],[11,15],[11,16],[12,13],[12,16],[12,17],[13,17],[14,15],[14,18],[15,16],[15,18],[15,19],[16,17],[16,19],[16,20],[17,20],[18,19],[19,20]];

export default function HologramHeart() {
  const { t } = useLanguage();
  return <div className="hologram-panel relative isolate mx-auto w-full max-w-[560px] overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[#06142c] shadow-[0_24px_80px_-28px_rgba(0,140,255,.42)]" role="img" aria-label={t('CareBridge AI holographic heart preview')}>
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_48%_42%,rgba(0,115,255,.22),transparent_56%),linear-gradient(150deg,#0b2043,#06142c_62%,#041024)]" />
    <div className="absolute inset-x-0 bottom-[-14%] h-[48%] rounded-[50%] border border-blue-400/15 bg-[radial-gradient(ellipse_at_center,rgba(0,87,255,.12),transparent_62%)]" />
    <div className="absolute inset-x-[13%] bottom-[6%] h-[27%] rounded-[50%] border border-cyan-300/20" />
    <div className="absolute inset-x-[23%] bottom-[9%] h-[21%] rounded-[50%] border border-blue-400/25" />
    <div className="absolute inset-x-[32%] bottom-[12%] h-[15%] rounded-[50%] border-2 border-cyan-300/30 shadow-[0_0_30px_rgba(0,212,255,.3)]" />
    <div className="absolute bottom-[9%] left-1/2 h-24 w-56 -translate-x-1/2 rounded-full bg-blue-500/15 blur-2xl" />

    <svg viewBox="0 0 420 460" className="relative z-[1] mx-auto block h-auto w-full max-w-[470px] overflow-visible px-5 pb-10 pt-7" aria-hidden="true">
      <defs>
        <linearGradient id="heartFill" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#00e5ff" stopOpacity=".5" /><stop offset=".48" stopColor="#1479ff" stopOpacity=".24" /><stop offset="1" stopColor="#052b78" stopOpacity=".68" /></linearGradient>
        <linearGradient id="heartStroke" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a8f8ff" /><stop offset=".38" stopColor="#00d4ff" /><stop offset="1" stopColor="#438aff" /></linearGradient>
        <radialGradient id="heartGlow"><stop stopColor="#16cfff" stopOpacity=".42" /><stop offset="1" stopColor="#1479ff" stopOpacity="0" /></radialGradient>
        <clipPath id="heartClip"><path d="M207 370c-32-24-98-72-123-139-24-64-11-123 36-143 37-16 72 5 89 39 20-38 59-62 99-41 53 28 59 92 26 151-33 60-85 103-127 133Z" /></clipPath>
      </defs>
      <circle cx="210" cy="228" r="174" fill="url(#heartGlow)" className="heart-glow" />
      <g className="heart-float">
        <g className="heart-beat">
          <path d="M207 370c-32-24-98-72-123-139-24-64-11-123 36-143 37-16 72 5 89 39 20-38 59-62 99-41 53 28 59 92 26 151-33 60-85 103-127 133Z" fill="url(#heartFill)" stroke="url(#heartStroke)" strokeWidth="3" />
          <g clipPath="url(#heartClip)" stroke="#53e9ff" strokeOpacity=".56" strokeWidth="1.1" fill="none">
            {edges.map(([a, b]) => <line key={`${a}-${b}`} x1={points[a][0]} y1={points[a][1]} x2={points[b][0]} y2={points[b][1]} />)}
            <path d="M89 202 155 134l76 1 62 63M81 238l70-31 54-10 50 9 78-8M98 278l53-22 47-8 49 12 45-14M126 314l49-8 47-6 47-14M157 349l18-43 47-6 47-14M130 119l28 88-7 49 24 50 34 37 24-37 13-40 4-48 12-52M186 127l19 70-7 51 24 48 0 47M238 111l-7 24 24 71-8 54 22 26" />
          </g>
          <path d="M207 370c-32-24-98-72-123-139-24-64-11-123 36-143 37-16 72 5 89 39 20-38 59-62 99-41 53 28 59 92 26 151-33 60-85 103-127 133Z" fill="none" stroke="#9af7ff" strokeOpacity=".82" strokeWidth="1.1" />
          <g fill="#b7fbff" filter="drop-shadow(0 0 5px #00d4ff)">{points.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.7 : 1.8} />)}</g>
          <path d="M193 141c-8-28-4-61 9-77m20 69c5-29 24-47 43-59m-72 58-20-48" fill="none" stroke="#21dcff" strokeWidth="8" strokeLinecap="round" opacity=".65" />
          <path d="M193 141c-8-28-4-61 9-77m20 69c5-29 24-47 43-59m-72 58-20-48" fill="none" stroke="#a4f6ff" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
      <g className="holo-pulse" fill="none" stroke="#00d4ff" strokeOpacity=".65"><circle cx="209" cy="375" r="121" /><circle cx="209" cy="375" r="137" strokeDasharray="3 9" /><path d="M45 366h85l13-7 9 18 11-34 10 23h75l10-8 9 11h100" strokeWidth="1.3" /></g>
      <g fill="#41eaff" opacity=".8"><circle cx="52" cy="366" r="2" /><circle cx="369" cy="369" r="2" /><path d="M71 91h26v38H71zM328 183h34v34h-34zM55 291h29v29H55z" fill="none" stroke="#00d4ff" strokeWidth="1.4" rx="5" /><path d="M83 101h3v17h-3zm7 4h3v13h-3zm248 87h12v3h-12zm0 8h17v3h-17zm-276 99h13v13H62z" /></g>
      <g fill="#00d4ff"><circle cx="107" cy="94" r="2"/><circle cx="315" cy="139" r="2"/><circle cx="91" cy="269" r="2"/><circle cx="335" cy="231" r="2"/></g>
    </svg>

    <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-[#071a35]/85 px-3 py-2 shadow-lg backdrop-blur sm:left-6 sm:top-6"><span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-300/10 text-accent-cyan"><HeartPulse size={18} /></span><span><span className="block text-[10px] font-semibold uppercase tracking-[.16em] text-cyan-100">{t('CareBridge AI')}</span><span className="mt-0.5 block text-[9px] text-sky-200/65">{t('Holographic health signal')}</span></span></div>
    <div className="absolute right-4 top-[34%] z-10 hidden rounded-xl border border-cyan-300/20 bg-[#071a35]/85 p-3 shadow-lg backdrop-blur sm:block"><div className="mb-2 flex items-center gap-2 text-[10px] font-medium text-sky-100"><Activity size={14} className="text-accent-cyan" />{t('Live care signal')}</div><svg width="104" height="32" viewBox="0 0 104 32" fill="none"><path className="ecg-line" d="M1 17h20l5-2 4 7 7-18 7 22 7-11 5 2h47" stroke="#15d8ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg><div className="mt-1 flex items-center gap-1 text-[9px] text-emerald-300"><ShieldCheck size={11} />{t('Care journey connected')}</div></div>
    <div className="absolute bottom-5 left-4 z-10 flex items-center gap-2 rounded-full border border-blue-300/20 bg-[#071a35]/85 px-3 py-1.5 text-[10px] text-blue-100/80 backdrop-blur sm:bottom-7 sm:left-7"><ScanLine size={13} className="text-accent-cyan" />{t('Smart care coordination')}</div>
  </div>;
}
