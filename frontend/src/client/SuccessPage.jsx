// ═══════════════════════════════════════════════════════════
// SuccessPage.jsx — Order Successful
// Theme: #ADC6FF33 accent throughout
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';

// ── tiny confetti burst on mount ──────────────────────────
function Confetti() {
  const pieces = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left:  `${8 + (i * 5.2) % 84}%`,
    delay: `${(i * 0.09).toFixed(2)}s`,
    dur:   `${1.4 + (i % 4) * 0.3}s`,
    color: i % 3 === 0 ? '#ADC6FF' : i % 3 === 1 ? 'rgba(173,198,255,0.5)' : 'rgba(255,255,255,0.3)',
    size:  3 + (i % 3),
  }));
  return (
    <>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', top: '-6px', left: p.left,
          width: p.size, height: p.size, borderRadius: '50%',
          background: p.color, pointerEvents: 'none',
          animation: `confettiFall ${p.dur} ${p.delay} ease-in forwards`,
        }}/>
      ))}
    </>
  );
}

export default function SuccessPage({ deliveryData, onDone, setActive, onOpenTrackChat }) {
  const [visible,  setVisible]  = useState(false);
  const [confetti, setConfetti] = useState(false);

  const orderRef  = deliveryData?.orderId   ? `#${deliveryData.orderId}`        : '#WSL-8829-QX';
  const totalPaid = deliveryData?.totalPaid ? `${deliveryData.totalPaid} DZD`   : '590 DZD';
  const deliverer = deliveryData?.deliverer?.name || 'Yassine B.';

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true),   80);
    const t2 = setTimeout(() => setConfetti(true),  300);
    const t3 = setTimeout(() => setConfetti(false), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // #ADC6FF33 = rgba(173,198,255, 0.2)
  const ACCENT       = '#ADC6FF';
  const ACCENT_20    = 'rgba(173,198,255,0.20)';
  const ACCENT_12    = 'rgba(173,198,255,0.12)';
  const ACCENT_08    = 'rgba(173,198,255,0.08)';
  const ACCENT_35    = 'rgba(173,198,255,0.35)';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 10%, #0c1e3d 0%, #07111e 50%, #040c17 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      animation: 'cdFadeUp .35s ease both',
    }}>

      {/* Keyframe for confetti */}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(220px) rotate(720deg); opacity: 0; }
        }
        @keyframes iconPop {
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.12); }
          80%  { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ringPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(173,198,255,0.25); }
          50%       { box-shadow: 0 0 0 14px rgba(173,198,255,0); }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 40; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* Ambient glows */}
      <div style={{ position:'absolute', top:'5%', left:'50%', transform:'translateX(-50%)', width:600, height:500, borderRadius:'50%', background:`radial-gradient(circle,${ACCENT_08},transparent 65%)`, pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'0%', right:'5%', width:320, height:320, borderRadius:'50%', background:`radial-gradient(circle,rgba(173,198,255,0.04),transparent 65%)`, pointerEvents:'none' }}/>

      {/* ── Card ── */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${ACCENT_20}`,
        borderRadius: 28,
        padding: '36px 32px 28px',
        width: '100%', maxWidth: 380,
        textAlign: 'center',
        backdropFilter: 'blur(20px)',
        boxShadow: `0 40px 90px rgba(0,0,0,0.55), 0 0 0 1px ${ACCENT_08}`,
        transform:  visible ? 'translateY(0) scale(1)'       : 'translateY(24px) scale(0.96)',
        opacity:    visible ? 1                               : 0,
        transition: 'transform .6s cubic-bezier(.22,.9,.36,1), opacity .5s ease',
        position: 'relative', zIndex: 1, overflow: 'hidden',
      }}>

        {/* Confetti burst from top of card */}
        {confetti && <Confetti/>}

        {/* Subtle top shimmer line */}
        <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:1, background:`linear-gradient(90deg, transparent, ${ACCENT_35}, transparent)` }}/>

        {/* ── Icon ── */}
        <div style={{
          display: 'inline-flex', marginBottom: 24, position: 'relative',
          animation: visible ? 'iconPop .65s .1s cubic-bezier(.34,1.56,.64,1) both' : 'none',
        }}>
          {/* Outer pulse ring */}
          <div style={{
            width: 78, height: 78, borderRadius: '50%',
            background: `radial-gradient(circle, ${ACCENT_12} 0%, transparent 70%)`,
            border: `1.5px solid ${ACCENT_20}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: visible ? 'ringPulse 2.5s 0.8s ease-in-out infinite' : 'none',
          }}>
            {/* Inner filled circle — #ADC6FF33 tinted */}
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: `linear-gradient(135deg, rgba(173,198,255,0.28) 0%, rgba(173,198,255,0.14) 100%)`,
              border: `1.5px solid ${ACCENT_35}`,
              boxShadow: `0 0 32px rgba(173,198,255,0.22), inset 0 1px 0 rgba(255,255,255,0.15)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke={ACCENT} strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ filter: `drop-shadow(0 0 6px rgba(173,198,255,0.7))` }}>
                <polyline points="20 6 9 17 4 12"
                  strokeDasharray="40"
                  style={{ animation: visible ? 'checkDraw .5s .4s ease both' : 'none' }}/>
              </svg>
            </div>
          </div>
        </div>

        {/* ── Title ── */}
        <h1 style={{
          margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: 'white',
          fontFamily: "'Outfit',system-ui,sans-serif",
          letterSpacing: '-0.3px',
        }}>
          Order Successful!
        </h1>
        <p style={{
          margin: '0 0 8px', fontSize: 13, color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.65, fontFamily: "'DM Sans',system-ui,sans-serif",
          maxWidth: 270, marginLeft: 'auto', marginRight: 'auto',
        }}>
          Your delivery is being prepared and will be with you shortly.
        </p>
        {/* Deliverer name pill */}
        <div style={{ marginBottom: 26, display: 'inline-flex', alignItems: 'center', gap: 6, background: ACCENT_08, border: `1px solid ${ACCENT_20}`, borderRadius: 20, padding: '4px 12px' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }}/>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: "'DM Sans',system-ui,sans-serif" }}>Deliverer: <strong style={{ color: ACCENT, fontWeight: 600 }}>{deliverer}</strong></span>
        </div>

        {/* ── Summary card ── */}
        <div style={{
          background: ACCENT_08,
          border: `1px solid ${ACCENT_20}`,
          borderRadius: 16, marginBottom: 22, textAlign: 'left', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${ACCENT_12}` }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans',system-ui,sans-serif", fontWeight: 700, letterSpacing: '0.08em' }}>TOTAL PAID</span>
            <span style={{ fontSize: 21, fontWeight: 800, color: 'white', fontFamily: "'Outfit',system-ui,sans-serif" }}>{totalPaid}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans',system-ui,sans-serif" }}>Order Reference</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT, fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.04em' }}>{orderRef}</span>
          </div>
        </div>

        {/* ── Track on Map ── */}
        <button
          onClick={() => { onDone?.(); setActive?.('track'); }}
          style={{
            width: '100%', border: `1px solid ${ACCENT_35}`, borderRadius: 13,
            padding: '13px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: ACCENT_12, color: ACCENT,
            fontFamily: "'DM Sans',system-ui,sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            marginBottom: 9, transition: 'all .2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = ACCENT_20; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 16px rgba(173,198,255,0.15)`; }}
          onMouseLeave={e => { e.currentTarget.style.background = ACCENT_12; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          Track on Map
        </button>

        {/* ── Chat with Deliverer ── */}
        <button
          onClick={() => { onOpenTrackChat?.(); }}
          style={{
            width: '100%', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 13,
            padding: '13px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.55)',
            fontFamily: "'DM Sans',system-ui,sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            marginBottom: 20, transition: 'all .2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Chat with Deliverer
        </button>

        {/* ── Back to Dashboard ── */}
        <button
          onClick={() => { onDone?.(); setActive?.('home'); }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            width: '100%', background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.32)', fontSize: 12, cursor: 'pointer',
            fontFamily: "'DM Sans',system-ui,sans-serif", transition: 'color .2s',
            letterSpacing: '0.03em',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.32)'}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}