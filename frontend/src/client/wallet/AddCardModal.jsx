// ═══════════════════════════════════════════════════════════
// AddCardModal.jsx — Add Payment Method (Edahabia / Bank)
// Usage: <AddCardModal onClose={() => {}} />
// ═══════════════════════════════════════════════════════════
import { useState } from 'react';

const METHODS = [
  {
    key: 'edahabia',
    label: 'EDAHABIA / CCP',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8L2 7h20l-6-4z"/>
      </svg>
    ),
  },
  {
    key: 'bank',
    label: 'BANK (BEA)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="3" y1="22" x2="21" y2="22"/>
        <line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/>
        <line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/>
        <polygon points="12 2 20 7 4 7"/>
      </svg>
    ),
  },
];

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '12px 14px',
  fontSize: 13, color: 'white', borderRadius: 12,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  fontFamily: "'DM Sans',system-ui,sans-serif", outline: 'none',
};

const labelStyle = {
  display: 'block', fontSize: 10, fontWeight: 700,
  color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em',
  marginBottom: 7, fontFamily: "'DM Sans',system-ui,sans-serif",
};

export default function AddCardModal({ onClose, onSaved, storageKey = "wallet_cards_default" }) {
  const [method,     setMethod]     = useState('edahabia');
  const [fullName,   setFullName]   = useState('');
  const [cardNum,    setCardNum]    = useState('');
  const [cvc,        setCvc]        = useState('');
  const [expiry,     setExpiry]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);

  async function handleAdd() {
    if (!fullName || !cardNum) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    const digits = cardNum.replace(/\D/g, "");
    const card = {
      last4: digits.slice(-4) || "0000",
      holder: fullName.toUpperCase(),
      expiry: expiry || "--/--",
      bg: method === "bank" ? "linear-gradient(145deg,#1a3a5a,#0e2240)" : "linear-gradient(145deg,#1a3a6a,#0e2650)",
    };
    try {
      const raw = localStorage.getItem(storageKey);
      const old = raw ? JSON.parse(raw) : [];
      const next = Array.isArray(old) ? [...old, card] : [card];
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
    onSaved?.(card);
    setSubmitting(false);
    setDone(true);
    setTimeout(onClose, 1400);
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'cdFadeUp .2s ease both',
      }}>
      <div style={{
        background: 'linear-gradient(145deg,#0d2040,#091830)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, width: '100%', maxWidth: 460,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        animation: 'cdFadeUp .25s ease both',
        margin: '0 16px',
      }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'22px 24px 0' }}>
          <div>
            <h3 style={{ margin:'0 0 4px', fontSize:18, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Add Payment Method</h3>
            <p style={{ margin:0, fontSize:12, color:'rgba(255,255,255,0.4)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>Select your preferred method to continue</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', display:'flex', padding:4, flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{ padding:'20px 24px 28px' }}>
          {done ? (
            /* ── Success state ── */
            <div style={{ textAlign:'center', padding:'30px 0' }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg,#4ade80,#22c55e)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p style={{ margin:'0 0 6px', fontSize:17, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Card Added!</p>
              <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.45)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>Your payment method has been saved.</p>
            </div>
          ) : (
            <>
              {/* Method toggle */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:22 }}>
                {METHODS.map(m => (
                  <button key={m.key} onClick={() => setMethod(m.key)}
                    style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'16px 12px', borderRadius:14, cursor:'pointer', transition:'all .15s', fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:11, fontWeight:700, letterSpacing:'0.06em', background:method===m.key?'rgba(59,130,246,0.15)':'rgba(255,255,255,0.04)', border:`1px solid ${method===m.key?'rgba(59,130,246,0.5)':'rgba(255,255,255,0.09)'}`, color:method===m.key?'#60a5fa':'rgba(255,255,255,0.5)' }}>
                    {m.icon}
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Full Name */}
              <div style={{ marginBottom:14 }}>
                <label style={labelStyle}>FULL NAME</label>
                <input className="cd-input" placeholder="e.g. Mostafa Echelfaoul" value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle}/>
              </div>

              {/* Card / CCP Number */}
              <div style={{ marginBottom:14 }}>
                <label style={labelStyle}>{method === 'edahabia' ? 'CCP NUMBER / CARD NUMBER' : 'CARD NUMBER'}</label>
                <input className="cd-input" placeholder="0000 0000 0000 0000" value={cardNum} onChange={e => setCardNum(e.target.value)} style={inputStyle}/>
              </div>

              {/* CVC + Expiry */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:22 }}>
                <div>
                  <label style={labelStyle}>CVC</label>
                  <input className="cd-input" placeholder="000" value={cvc} onChange={e => setCvc(e.target.value)} style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>EXPIRY DATE</label>
                  <input className="cd-input" placeholder="MM/YYYY" value={expiry} onChange={e => setExpiry(e.target.value)} style={inputStyle}/>
                </div>
              </div>

              {/* Submit */}
              <button onClick={handleAdd} disabled={submitting || !fullName || !cardNum}
                className="cd-primary-btn"
                style={{ width:'100%', padding:'13px 0', borderRadius:12, border:'none', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif", background:'#ADC6FF', color:'#1e3a5f', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {submitting
                  ? <><span style={{ width:14, height:14, border:'2px solid rgba(30,58,95,0.3)', borderTopColor:'#1e3a5f', borderRadius:'50%', display:'inline-block', animation:'cdSpin .7s linear infinite' }}/> Adding…</>
                  : 'ADD PAYMENT METHOD'}
              </button>
              <button onClick={onClose}
                style={{ width:'100%', padding:'11px 0', background:'none', border:'none', fontSize:13, color:'rgba(255,255,255,0.4)', cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
