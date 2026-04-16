import { useState, useEffect } from 'react';
 
// ── ICONS ─────────────────────────────────────────────────────────────────────
const XIcon       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const CheckIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const FileIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
 
// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const DOC_TABS = [
  { key: 'license', label: "Driver's License",    color: '#3b82f6' },
  { key: 'idCard',  label: 'National ID Card',     color: '#8b5cf6' },
  { key: 'regDoc',  label: 'Vehicle Registration', color: '#10b981' },
];
 
const REJECTION_REASONS = [
  'Document blurry or unreadable',
  'Document expired',
  'Name mismatch between documents',
  'Document appears tampered',
  'Wrong document type submitted',
  'ID number not visible',
  'Other',
];
 
// ── HELPERS ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
 
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}
 
// ── STATUS BADGE ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:  { label: 'Pending',  bg: 'rgba(245,158,11,.12)', color: '#f59e0b', border: 'rgba(245,158,11,.3)'  },
    approved: { label: 'Approved', bg: 'rgba(74,222,128,.12)', color: '#4ade80', border: 'rgba(74,222,128,.3)'  },
    rejected: { label: 'Rejected', bg: 'rgba(248,113,113,.12)',color: '#f87171', border: 'rgba(248,113,113,.3)' },
  };
  const s = map[status] || map.pending;
  return (
    <span className="!inline-flex !items-center !gap-1.5 !text-[11px] !font-semibold !px-2.5 !py-1 !rounded-full !border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      <span className="!w-1.5 !h-1.5 !rounded-full !inline-block" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}
 
// ── SCORE RING ────────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? '#4ade80' : score >= 55 ? '#f59e0b' : '#f87171';
  return (
    <div className="!relative !flex-shrink-0" style={{ width: 56, height: 56 }}>
      <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="4" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset .6s ease' }} />
      </svg>
      <span className="!absolute !inset-0 !flex !items-center !justify-center !text-[12px] !font-bold" style={{ color }}>
        {score}%
      </span>
    </div>
  );
}
 
// ── DOC VIEWER MODAL ─────────────────────────────────────────────────────────
export default function DocViewerModal({ item, onClose, onApprove, onReject }) {
  const [activeDoc,  setActiveDoc]  = useState('license');
  const [side,       setSide]       = useState('front');
  const [reason,     setReason]     = useState('');
  const [comments,   setComments]   = useState('');
  const [confirming, setConfirming] = useState(null); // null | 'approve' | 'reject'
  const [loading,    setLoading]    = useState(false);
  const [imgKey,     setImgKey]     = useState(0);
 
  // Lock body scroll & listen for Escape
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, []);
 
  // Active tab data
  const activeTab     = DOC_TABS.find(t => t.key === activeDoc);
  const activeDocData = item.docs?.[activeDoc] ?? {};
  const extracted     = activeDocData.extracted ?? {};
  const score         = extracted.matchScore ?? 0;
  const currentImg    = activeDocData[side] || activeDocData.front || '';
 
  function switchDoc(key) { setActiveDoc(key); setSide('front'); setImgKey(k => k + 1); }
  function switchSide(s)  { setSide(s); setImgKey(k => k + 1); }
 
  async function handleDecision(decision) {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    if (decision === 'approve') onApprove(item.id);
    else                        onReject(item.id, reason);
    onClose();
  }
 
  return (
    <>
      {/* ── Global keyframe animations ── */}
      <style>{`
        @keyframes dvOverlayIn { from { opacity:0 } to { opacity:1 } }
        @keyframes dvModalIn   { from { opacity:0; transform:translateY(18px) scale(.97) } to { opacity:1; transform:none } }
        @keyframes dvImgSlide  { from { opacity:0; transform:scale(.96) } to { opacity:1; transform:none } }
        @keyframes dvFadeIn    { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:none } }
      `}</style>
 
      {/* ── Overlay ── */}
      <div
        onClick={e => e.target === e.currentTarget && onClose()}
        className="!fixed !inset-0 !z-50 !flex !items-center !justify-center !p-4"
        style={{ background: 'rgba(5,10,20,.85)', backdropFilter: 'blur(8px)', animation: 'dvOverlayIn .2s ease both' }}
      >
        {/* ── Modal shell ── */}
        <div
          className="!w-full !flex !flex-col !overflow-hidden"
          style={{
            maxWidth: 860,
            maxHeight: '90vh',
            background: 'linear-gradient(160deg,#0e1f35 0%,#0a1525 100%)',
            border: '1px solid rgba(255,255,255,.08)',
            borderRadius: 20,
            boxShadow: '0 32px 80px rgba(0,0,0,.6)',
            animation: 'dvModalIn .25s cubic-bezier(.22,1,.36,1) both',
          }}
        >
 
          {/* ══ HEADER ══════════════════════════════════════════════════════ */}
          <div className="!flex !items-center !justify-between !px-6 !py-4 !border-b !border-white/[.06] !flex-shrink-0">
            <div className="!flex !items-center !gap-3">
              {/* Avatar */}
              <div className="!w-10 !h-10 !rounded-full !bg-blue-500/20 !border !border-blue-500/30 !flex !items-center !justify-center !font-bold !text-[15px] !text-blue-300">
                {item.avatar || item.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <div className="!flex !items-center !gap-2.5 !mb-1">
                  <h3 className="!m-0 !text-[15px] !font-bold !tracking-tight">
                    Verification #{8000 + item.id}
                  </h3>
                  <StatusBadge status={item.status} />
                </div>
                <p className="!m-0 !text-[11px] !text-white/35">
                  {item.name} · {item.email} · Submitted {timeAgo(item.submittedAt)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="!w-8 !h-8 !rounded-lg !flex !items-center !justify-center !transition-all !duration-150 !border !border-white/[.07] !bg-white/[.04] hover:!bg-white/[.09] hover:!border-white/20 !text-white/50 hover:!text-white"
            >
              <XIcon />
            </button>
          </div>
 
          {/* ══ BODY ════════════════════════════════════════════════════════ */}
          <div className="!flex !flex-1 !overflow-hidden" style={{ minHeight: 0 }}>
 
            {/* ── LEFT: image viewer ── */}
            <div className="!flex !flex-col !border-r !border-white/[.06]" style={{ width: 340, flexShrink: 0 }}>
 
              {/* Doc tabs */}
              <div className="!flex !border-b !border-white/[.06] !flex-shrink-0">
                {DOC_TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => switchDoc(tab.key)}
                    className="!flex-1 !flex !items-center !justify-center !gap-1.5 !py-3 !text-[12px] !font-medium !transition-all !duration-150 !border-b-2 !-mb-px"
                    style={{
                      borderBottomColor: activeDoc === tab.key ? tab.color : 'transparent',
                      color: activeDoc === tab.key ? tab.color : 'rgba(255,255,255,.3)',
                      background: activeDoc === tab.key ? `${tab.color}08` : 'transparent',
                    }}
                  >
                    <FileIcon />
                    {tab.key === 'license' ? 'License' : tab.key === 'idCard' ? 'ID Card' : 'Vehicle Reg'}
                  </button>
                ))}
              </div>
 
              {/* Doc label */}
              <div className="!flex !items-center !gap-2 !px-4 !pt-3 !pb-1 !flex-shrink-0">
                <FileIcon />
                <span className="!text-[12px] !font-semibold !text-white/60" style={{ color: activeTab?.color }}>
                  {activeTab?.label}
                </span>
                <span className="!text-[11px] !text-white/25">
                  — {side === 'front' ? 'Front Side' : 'Back Side'}
                </span>
              </div>
 
              {/* Image area */}
              <div className="!flex-1 !flex !items-center !justify-center !p-4 !relative !overflow-hidden" style={{ minHeight: 200 }}>
                {currentImg ? (
                  <img
                    key={imgKey}
                    src={currentImg}
                    alt="Document"
                    className="!max-w-full !rounded-xl !object-contain"
                    style={{
                      maxHeight: 240,
                      border: '1px solid rgba(255,255,255,.09)',
                      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
                      animation: 'dvImgSlide .22s ease both',
                    }}
                  />
                ) : (
                  <div className="!flex !flex-col !items-center !gap-3 !text-white/20">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span className="!text-[13px]">No image available</span>
                  </div>
                )}
 
                {/* Active tab pill */}
                <div
                  className="!absolute !bottom-3 !left-4 !flex !items-center !gap-1.5 !text-[11px] !text-white/35 !px-3 !py-1 !rounded-full !border !border-white/[.07]"
                  style={{ background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(6px)' }}
                >
                  <span className="!w-1.5 !h-1.5 !rounded-full" style={{ background: activeTab?.color }} />
                  {activeTab?.label}
                </div>
              </div>
 
              {/* Front / Back toggle */}
              <div className="!flex !gap-2 !px-4 !pb-3 !border-t !border-white/[.06] !pt-3 !flex-shrink-0">
                {['front', 'back'].map(s => (
                  <button
                    key={s}
                    onClick={() => switchSide(s)}
                    className="!flex-1 !py-2.5 !rounded-xl !text-[12px] !font-medium !transition-all !duration-150 !border"
                    style={{
                      background: side === s ? 'rgba(59,130,246,.18)' : 'transparent',
                      borderColor: side === s ? 'rgba(59,130,246,.45)' : 'rgba(255,255,255,.08)',
                      color: side === s ? '#93c5fd' : 'rgba(255,255,255,.35)',
                    }}
                  >
                    {s === 'front' ? '⬜ Front Side' : '⬛ Back Side'}
                  </button>
                ))}
              </div>
 
              {/* Progress dots */}
              <div className="!flex !gap-1.5 !px-4 !pb-4 !flex-shrink-0">
                {DOC_TABS.map(tab => (
                  <div
                    key={tab.key}
                    className="!flex-1 !h-0.5 !rounded-full !transition-all !duration-300"
                    style={{ background: activeDoc === tab.key ? tab.color : 'rgba(255,255,255,.08)' }}
                  />
                ))}
              </div>
            </div>
 
            {/* ── RIGHT: scrollable details + actions ── */}
            <div className="!flex-1 !overflow-y-auto !p-5 !flex !flex-col !gap-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,.1) transparent' }}>
 
              {/* Extracted Data panel */}
              <div className="!bg-white/[.03] !border !border-white/[.07] !rounded-2xl !p-5">
                <div className="!flex !justify-between !items-start !mb-4">
                  <div>
                    <p className="!text-[10px] !font-semibold !tracking-[.08em] !text-white/30 !mb-1">EXTRACTED DATA</p>
                    <p className="!text-[12px] !font-semibold !flex !items-center !gap-1.5" style={{ color: activeTab?.color }}>
                      <FileIcon /> {activeTab?.label}
                    </p>
                  </div>
                  <ScoreRing score={score} />
                </div>
 
                <div className="!flex !flex-col !gap-2">
                  {[
                    { label: 'FULL NAME',       val: extracted.fullName  },
                    { label: 'DOCUMENT TYPE',   val: extracted.docType   },
                    { label: 'ID / DOC NUMBER', val: extracted.idNumber  },
                    { label: 'DATE OF BIRTH',   val: fmtDate(extracted.dob) },
                  ].map(f => (
                    <div key={f.label} className="!bg-white/[.03] !border !border-white/[.05] !rounded-xl !px-3.5 !py-2.5">
                      <p className="!m-0 !text-[10px] !font-semibold !tracking-[.07em] !text-white/30 !mb-0.5">{f.label}</p>
                      <p className="!m-0 !text-[13px] !font-medium !text-white/80">{f.val || '—'}</p>
                    </div>
                  ))}
 
                  {/* Expiry with validity badge */}
                  <div className="!bg-white/[.03] !border !border-white/[.05] !rounded-xl !px-3.5 !py-2.5">
                    <p className="!m-0 !text-[10px] !font-semibold !tracking-[.07em] !text-white/30 !mb-0.5">EXPIRATION DATE</p>
                    <div className="!flex !items-center !justify-between">
                      <p className="!m-0 !text-[13px] !font-medium !text-white/80">{fmtDate(extracted.expiry)}</p>
                      <span
                        className="!text-[11px] !font-semibold !px-2.5 !py-1 !rounded-full !border"
                        style={{
                          background: extracted.valid ? 'rgba(74,222,128,.15)' : 'rgba(248,113,113,.15)',
                          color:      extracted.valid ? '#4ade80'               : '#f87171',
                          borderColor:extracted.valid ? 'rgba(74,222,128,.3)'  : 'rgba(248,113,113,.3)',
                        }}
                      >
                        {extracted.valid ? '✓ Valid' : '✕ Expired'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
 
              {/* Documents checklist panel */}
              <div className="!bg-white/[.03] !border !border-white/[.07] !rounded-2xl !p-5">
                <p className="!text-[10px] !font-semibold !tracking-[.08em] !text-white/30 !mb-3">DOCUMENTS CHECKLIST</p>
                <div className="!flex !flex-col !gap-2">
                  {DOC_TABS.map(tab => {
                    const tabScore = item.docs?.[tab.key]?.extracted?.matchScore ?? 0;
                    const tabValid = item.docs?.[tab.key]?.extracted?.valid;
                    const isActive = activeDoc === tab.key;
                    return (
                      <div
                        key={tab.key}
                        onClick={() => switchDoc(tab.key)}
                        className="!flex !items-center !gap-3 !px-3.5 !py-2.5 !rounded-xl !cursor-pointer !transition-all !duration-150 !border"
                        style={{
                          background:   isActive ? `${tab.color}12` : 'rgba(255,255,255,.02)',
                          borderColor:  isActive ? `${tab.color}35` : 'rgba(255,255,255,.06)',
                        }}
                      >
                        <div
                          className="!w-7 !h-7 !rounded-lg !flex !items-center !justify-center !flex-shrink-0"
                          style={{ background: `${tab.color}18`, color: tab.color }}
                        >
                          <FileIcon />
                        </div>
                        <div className="!flex-1 !min-w-0">
                          <p className="!m-0 !text-[13px] !font-medium" style={{ color: isActive ? 'white' : 'rgba(255,255,255,.55)' }}>
                            {tab.label}
                          </p>
                          <p className="!m-0 !text-[11px] !text-white/30">{tabScore}% match</p>
                        </div>
                        <span
                          className="!text-[10px] !font-semibold !px-2 !py-0.5 !rounded-full !border"
                          style={{
                            background:  tabValid ? 'rgba(74,222,128,.12)' : 'rgba(248,113,113,.12)',
                            color:       tabValid ? '#4ade80'               : '#f87171',
                            borderColor: tabValid ? 'rgba(74,222,128,.25)' : 'rgba(248,113,113,.25)',
                          }}
                        >
                          {tabValid ? 'Valid' : 'Expired'}
                        </span>
                        {isActive && (
                          <span className="!text-[10px] !font-bold" style={{ color: tab.color }}>● Viewing</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
 
              {/* Applicant info panel */}
              <div className="!bg-white/[.03] !border !border-white/[.07] !rounded-2xl !p-5">
                <p className="!text-[10px] !font-semibold !tracking-[.08em] !text-white/30 !mb-3">APPLICANT INFO</p>
                <div className="!flex !flex-col">
                  {[
                    { label: 'Full Name', val: item.name },
                    { label: 'Email',     val: item.email },
                    { label: 'Phone',     val: '+213 555 000 000' },
                    { label: 'ID Type',   val: item.idType },
                    { label: 'Submitted', val: fmtDate(item.submittedAt) },
                  ].map((row, i, arr) => (
                    <div
                      key={row.label}
                      className="!flex !justify-between !items-center !py-2.5"
                      style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}
                    >
                      <span className="!text-[12px] !text-white/35">{row.label}</span>
                      <span className="!text-[12px] !font-medium !text-white/75">{row.val || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
 
              {/* Decision notes — pending only */}
              {item.status === 'pending' && (
                <div className="!bg-white/[.03] !border !border-white/[.07] !rounded-2xl !p-5">
                  <p className="!text-[10px] !font-semibold !tracking-[.08em] !text-white/30 !mb-3">DECISION NOTES</p>
 
                  <label className="!block !text-[11px] !font-semibold !text-white/40 !mb-1.5">
                    Rejection Reason <span className="!text-white/20">(if rejecting)</span>
                  </label>
                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="!w-full !bg-white/[.05] !border !border-white/[.09] !rounded-xl !px-3.5 !py-2.5 !text-[13px] !text-white/70 !outline-none !mb-3 !transition-all focus:!border-blue-500/50 focus:!bg-white/[.07]"
                    style={{ appearance: 'none', cursor: 'pointer' }}
                  >
                    <option value="" style={{ background: '#0e1f35' }}>Select a reason…</option>
                    {REJECTION_REASONS.map(r => (
                      <option key={r} value={r} style={{ background: '#0e1f35' }}>{r}</option>
                    ))}
                  </select>
 
                  <label className="!block !text-[11px] !font-semibold !text-white/40 !mb-1.5">
                    Additional Comments
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Add notes about this verification…"
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    className="!w-full !bg-white/[.05] !border !border-white/[.09] !rounded-xl !px-3.5 !py-2.5 !text-[13px] !text-white/70 !outline-none !resize-none !transition-all focus:!border-blue-500/50 focus:!bg-white/[.07]"
                    style={{ scrollbarWidth: 'thin' }}
                  />
                </div>
              )}
 
              {/* Action buttons — pending only */}
              {item.status === 'pending' && (
                confirming === null ? (
                  <div className="!flex !gap-3">
                    {/* Reject */}
                    <button
                      onClick={() => setConfirming('reject')}
                      className="!flex-1 !flex !items-center !justify-center !gap-2 !py-3 !rounded-xl !font-semibold !text-[14px] !transition-all !duration-150 !border"
                      style={{ background: 'rgba(239,68,68,.1)', borderColor: 'rgba(239,68,68,.3)', color: '#f87171' }}
                    >
                      <XIcon /> Reject
                    </button>
                    {/* Approve */}
                    <button
                      onClick={() => setConfirming('approve')}
                      className="!flex-1 !flex !items-center !justify-center !gap-2 !py-3 !rounded-xl !font-semibold !text-[14px] !transition-all !duration-150 !shadow-[0_4px_14px_rgba(22,163,74,0.3)] hover:!shadow-[0_6px_20px_rgba(22,163,74,0.4)] hover:!-translate-y-0.5"
                      style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', border: '1px solid rgba(22,163,74,.5)' }}
                    >
                      <CheckIcon /> Approve
                    </button>
                  </div>
                ) : (
                  /* Confirm step */
                  <div
                    className="!rounded-2xl !p-4 !border"
                    style={{
                      background:   confirming === 'approve' ? 'rgba(22,163,74,.07)'  : 'rgba(239,68,68,.07)',
                      borderColor:  confirming === 'approve' ? 'rgba(22,163,74,.22)'  : 'rgba(239,68,68,.22)',
                      animation: 'dvFadeIn .18s ease both',
                    }}
                  >
                    <p className="!text-[13px] !text-white/60 !text-center !leading-relaxed !mb-4">
                      {confirming === 'approve'
                        ? '✓ Confirm approval? The deliverer will be notified and their account activated.'
                        : '✕ Confirm rejection? The account will be flagged and the deliverer notified.'}
                    </p>
                    <div className="!flex !gap-3">
                      {/* Cancel */}
                      <button
                        onClick={() => setConfirming(null)}
                        disabled={loading}
                        className="!flex-1 !py-2.5 !rounded-xl !text-[13px] !font-medium !transition-all !duration-150 !border !border-white/[.1] !bg-white/[.05] !text-white/50 hover:!bg-white/[.09] hover:!text-white/70"
                      >
                        Cancel
                      </button>
                      {/* Confirm */}
                      <button
                        onClick={() => handleDecision(confirming)}
                        disabled={loading}
                        className="!flex-1 !flex !items-center !justify-center !gap-2 !py-2.5 !rounded-xl !text-[13px] !font-semibold !transition-all !duration-150 !border"
                        style={{
                          opacity: loading ? 0.7 : 1,
                          background:  confirming === 'approve' ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'rgba(239,68,68,.18)',
                          borderColor: confirming === 'approve' ? 'rgba(22,163,74,.5)'  : 'rgba(239,68,68,.4)',
                          color:       confirming === 'approve' ? 'white' : '#f87171',
                        }}
                      >
                        {loading
                          ? <span className="!w-4 !h-4 !border-2 !border-white/30 !border-t-white !rounded-full !inline-block !animate-spin" />
                          : confirming === 'approve'
                            ? <><CheckIcon /> Yes, Approve</>
                            : <><XIcon /> Yes, Reject</>
                        }
                      </button>
                    </div>
                  </div>
                )
              )}
 
              {/* Close link */}
              <button
                onClick={onClose}
                className="!text-[12px] !text-white/25 hover:!text-white/50 !transition-colors !text-center !py-1"
              >
                Close preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}