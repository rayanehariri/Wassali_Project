// ═══════════════════════════════════════════════════════════
// TopUpModal.jsx — Wallet Top Up
// Usage: <TopUpModal onClose={() => {}} balance="12.450,00" />
// ═══════════════════════════════════════════════════════════
import { useState } from 'react';

const AMOUNTS = [1000, 2500, 5000, 10000];

export default function TopUpModal({ onClose, balance }) {
  const [selected,   setSelected]   = useState(null);
  const [custom,     setCustom]     = useState('');
  const [payMethod,  setPayMethod]  = useState('card_4321');
  const [confirming, setConfirming] = useState(false);
  const [done,       setDone]       = useState(false);

  const amt = selected || parseFloat(custom) || 0;

  async function handleConfirm() {
    if (!amt || amt <= 0) return;
    setConfirming(true);
    await new Promise(r => setTimeout(r, 1400));
    setConfirming(false);
    setDone(true);
    setTimeout(onClose, 1600);
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
          <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Top Up Wallet</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', display:'flex', padding:4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{ padding:'20px 24px 28px' }}>
          {done ? (
            /* ── Success state ── */
            <div style={{ textAlign:'center', padding:'30px 0' }}>
              <div style={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg,#4ade80,#22c55e)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p style={{ margin:'0 0 6px', fontSize:18, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Top Up Successful!</p>
              <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.5)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>Your wallet has been credited.</p>
            </div>
          ) : (
            <>
              {/* Current Balance */}
              <div style={{ background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:14, padding:'16px 20px', marginBottom:22 }}>
                <p style={{ margin:'0 0 4px', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:'0.1em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>CURRENT BALANCE</p>
                <p style={{ margin:0, fontSize:24, fontWeight:800, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>
                  {balance} <span style={{ fontSize:14, fontWeight:500, color:'rgba(255,255,255,0.4)' }}>DZD</span>
                </p>
              </div>

              {/* Preset amounts */}
              <p style={{ margin:'0 0 12px', fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'0.08em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>Select Amount</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18 }}>
                {AMOUNTS.map(a => (
                  <button key={a} onClick={() => { setSelected(a); setCustom(''); }}
                    style={{
                      padding:'13px 0', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer',
                      fontFamily:"'DM Sans',system-ui,sans-serif", transition:'all .15s',
                      background: selected===a ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${selected===a ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.09)'}`,
                      color: selected===a ? '#60a5fa' : 'rgba(255,255,255,0.7)',
                    }}>
                    {a.toLocaleString('fr-DZ')} DZD
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <p style={{ margin:'0 0 10px', fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'0.08em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>Or Enter Custom Amount</p>
              <div style={{ position:'relative', marginBottom:18 }}>
                <input
                  type="number" placeholder="0.00" value={custom}
                  onChange={e => { setCustom(e.target.value); setSelected(null); }}
                  className="cd-input"
                  style={{ width:'100%', boxSizing:'border-box', padding:'12px 60px 12px 14px', fontSize:15, fontWeight:600, color:'white', borderRadius:12, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', fontFamily:"'DM Sans',system-ui,sans-serif", outline:'none' }}
                />
                <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.4)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>DZD</span>
              </div>

              {/* Payment method */}
              <p style={{ margin:'0 0 10px', fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'0.08em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>Payment Method</p>
              <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
                className="cd-input"
                style={{ width:'100%', padding:'12px 14px', fontSize:13, color:'white', borderRadius:12, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', fontFamily:"'DM Sans',system-ui,sans-serif", outline:'none', marginBottom:22, cursor:'pointer' }}>
                <option value="card_4321">Card ending in 4321</option>
                <option value="card_8810">Card ending in 8810</option>
              </select>

              {/* Confirm */}
              <button onClick={handleConfirm} disabled={confirming || amt <= 0}
                className="cd-primary-btn"
                style={{ width:'100%', padding:'14px 0', borderRadius:12, border:'none', fontSize:14, fontWeight:700, cursor:amt>0?'pointer':'not-allowed', fontFamily:"'DM Sans',system-ui,sans-serif", background:amt>0?'#ADC6FF':'rgba(173,198,255,0.3)', color:amt>0?'#1e3a5f':'rgba(30,58,95,0.5)', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {confirming
                  ? <><span style={{ width:15, height:15, border:'2px solid rgba(30,58,95,0.3)', borderTopColor:'#1e3a5f', borderRadius:'50%', display:'inline-block', animation:'cdSpin .7s linear infinite' }}/> Processing…</>
                  : `Confirm Top Up${amt>0 ? ` — ${amt.toLocaleString('fr-DZ')} DZD` : ''}`}
              </button>
              <button onClick={onClose}
                style={{ width:'100%', padding:'12px 0', background:'none', border:'none', fontSize:13, color:'rgba(255,255,255,0.4)', cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
