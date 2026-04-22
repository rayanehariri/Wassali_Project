import { useState, useEffect, useRef } from 'react';

// ── Animated counter hook ──────────────────────────────────
function useCounter(target, duration = 1400, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    let raf;
    const timeout = setTimeout(() => {
      function step(ts) {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setVal(Math.floor(ease * target));
        if (progress < 1) raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf); };
  }, [target, duration, delay]);
  return val;
}

// ── Sparkline SVG ─────────────────────────────────────────
function Sparkline({ data, color, height = 36 }) {
  const w = 100, h = height;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const area = `M${data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' L')} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace('#','')})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Radial progress ring ──────────────────────────────────
function RingProgress({ pct, size = 64, stroke = 5, color, label, sublabel }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(pct), 200);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - animated / 100)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.22,.9,.36,1)' }}/>
      </svg>
      <div style={{ textAlign: 'center', position: 'absolute', top: 0, left: 0, width: size, height: size, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'white', fontFamily: "'Outfit',sans-serif" }}>{pct}%</span>
      </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans',sans-serif" }}>{label}</p>
        {sublabel && <p style={{ margin: '2px 0 0', fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Sans',sans-serif" }}>{sublabel}</p>}
      </div>
    </div>
  );
}

// ── Activity item ─────────────────────────────────────────
const ACTIVITY = [
  { icon: <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><rect x='1' y='3' width='15' height='13'/><polygon points='16 8 20 8 23 11 23 16 16 16 16 8'/><circle cx='5.5' cy='18.5' r='2.5'/><circle cx='18.5' cy='18.5' r='2.5'/></svg>, text: 'Resolved report #942 — Damaged Item',     time: '2 min ago',   color: '#4ade80' },
  { icon: <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>, text: 'Approved deliverer verification for Yassine B.', time: '18 min ago',  color: '#60a5fa' },
  { icon: <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><line x1='12' y1='1' x2='12' y2='23'/><path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'/></svg>, text: 'Processed refund of 2,500 DZD to Sarah J.', time: '1 hr ago',    color: '#fbbf24' },
  { icon: <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'/></svg>, text: 'Updated platform fee structure',           time: '3 hrs ago',   color: '#a78bfa' },
  { icon: <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><line x1='18' y1='20' x2='18' y2='10'/><line x1='12' y1='20' x2='12' y2='4'/><line x1='6' y1='20' x2='6' y2='14'/></svg>, text: 'Generated weekly analytics report',        time: 'Yesterday',   color: '#34d399' },
  { icon: <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'/><line x1='12' y1='9' x2='12' y2='13'/><line x1='12' y1='17' x2='12.01' y2='17'/></svg>, text: 'Flagged user account for suspicious activity', time: 'Yesterday', color: '#f87171' },
  { icon: <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><circle cx='12' cy='12' r='3'/><path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'/></svg>, text: 'Modified notification dispatch settings',  time: '2 days ago',  color: '#60a5fa' },
];

const PERMISSIONS = [
  { label: 'User Management',        granted: true  },
  { label: 'Financial Operations',   granted: true  },
  { label: 'Report Resolution',      granted: true  },
  { label: 'System Configuration',   granted: true  },
  { label: 'Deliverer Verification', granted: true  },
  { label: 'Super Admin Access',     granted: false },
];

// ══════════════════════════════════════════════════════════
export default function AdminProfile({ currentUser }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [visible,   setVisible]   = useState(false);
  const headerRef = useRef(null);
  const fullName = currentUser?.name || 'Admin User';
  const email = currentUser?.email || 'admin@wassali.com';
  const initials = (fullName || 'AD')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const orders     = useCounter(1284, 1600, 300);
  const resolved   = useCounter(347,  1400, 450);
  const users      = useCounter(5820, 1800, 600);
  const revenue    = useCounter(284,  1600, 750);

  const STATS = [
    { label: 'Orders Managed',    val: orders.toLocaleString(),  unit: '',   icon: <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/><polyline points='3.27 6.96 12 12.01 20.73 6.96'/></svg>, color: '#60a5fa', spark: [40,55,48,72,60,85,78,92,88,95], bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.18)'  },
    { label: 'Reports Resolved',  val: resolved.toLocaleString(),unit: '',   icon: <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'/><polyline points='22 4 12 14.01 9 11.01'/></svg>, color: '#4ade80', spark: [20,35,28,42,55,48,62,58,70,75], bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.18)'  },
    { label: 'Active Users',      val: users.toLocaleString(),   unit: '',   icon: <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/></svg>, color: '#a78bfa', spark: [60,72,68,80,78,85,82,90,88,95], bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.18)' },
    { label: 'Revenue (M DZD)',   val: revenue.toLocaleString(), unit: 'M',  icon: <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><polyline points='23 6 13.5 15.5 8.5 10.5 1 18'/><polyline points='17 6 23 6 23 12'/></svg>, color: '#fbbf24', spark: [30,42,38,55,50,65,60,72,70,82], bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.18)'  },
  ];

  const TABS = ['overview', 'activity', 'permissions'];

  return (
    <div style={{
      minHeight: '100%',
      background: '#060d1a',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: 'white',
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes shimmer  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes orb      { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.05)} 66%{transform:translate(-20px,10px) scale(0.96)} }
        @keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.85)} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }

        .ap-card { transition: transform .22s ease, box-shadow .22s ease; }
        .ap-card:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,0.4) !important; }
        .ap-tab:hover { color: rgba(255,255,255,0.9) !important; }
        .ap-perm:hover { background: rgba(255,255,255,0.05) !important; }
        .ap-act:hover  { background: rgba(255,255,255,0.04) !important; }
      `}</style>

      {/* ── Ambient background orbs ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', animation: 'orb 12s ease-in-out infinite' }}/>
        <div style={{ position: 'absolute', bottom: '10%', right: '5%',  width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)', animation: 'orb 16s ease-in-out infinite reverse' }}/>
        <div style={{ position: 'absolute', top: '40%',  left: '-5%',    width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)', animation: 'orb 20s ease-in-out infinite' }}/>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ══════════════════════════════════════════════
            HERO HEADER
        ══════════════════════════════════════════════ */}
        <div ref={headerRef} style={{
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #0a1930 0%, #0d2448 50%, #0a1930 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '48px 48px 0',
        }}>
          {/* Decorative grid */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }}>
            <defs><pattern id="ap-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke="#60a5fa" strokeWidth="0.5"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#ap-grid)"/>
          </svg>

          {/* Horizontal scan line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.6), transparent)', animation: 'fadeIn 1.5s ease .5s both' }}/>

          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 32,
            opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)',
            transition: 'opacity .6s ease, transform .6s ease',
          }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 110, height: 110, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e40af, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 38, fontWeight: 900, color: 'white',
                fontFamily: "'Outfit', sans-serif",
                border: '3px solid rgba(255,255,255,0.15)',
                boxShadow: '0 0 40px rgba(59,130,246,0.4), 0 0 80px rgba(59,130,246,0.15)',
                position: 'relative',
              }}>
                {initials || 'A'}
                {/* Rotating border */}
                <div style={{
                  position: 'absolute', inset: -5, borderRadius: '50%',
                  background: 'conic-gradient(from 0deg, #3b82f6, #7c3aed, #3b82f6)',
                  zIndex: -1, opacity: 0.4,
                  mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))',
                  WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))',
                }}/>
              </div>
              {/* Online indicator */}
              <div style={{ position: 'absolute', bottom: 6, right: 6, width: 18, height: 18, borderRadius: '50%', background: '#4ade80', border: '3px solid #0a1930', boxShadow: '0 0 10px rgba(74,222,128,0.7)', animation: 'pulse 2.5s ease-in-out infinite' }}/>
            </div>

            {/* Name + meta */}
            <div style={{ flex: 1, paddingBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: '#60a5fa', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 4, padding: '3px 9px' }}>SUPER ADMIN</span>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 4, padding: '3px 9px' }}>● ONLINE</span>
              </div>
              <h1 style={{ margin: '0 0 4px', fontSize: 32, fontWeight: 900, color: 'white', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                {fullName}
              </h1>
              <p style={{ margin: '0 0 12px', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                {email} &nbsp;·&nbsp; Algiers, Algeria &nbsp;·&nbsp; Member since Jan 2023
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['Platform Management', 'Financial Control', 'User Oversight', 'Report Review'].map((tag, i) => (
                  <span key={i} style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '3px 10px' }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ display: 'flex', gap: 10, paddingBottom: 20, flexShrink: 0 }}>
              {[
                { label: 'Edit Profile', bg: 'linear-gradient(135deg,#2563eb,#1d4ed8)', border: 'none', color: 'white', shadow: '0 4px 18px rgba(37,99,235,0.4)' },
                { label: 'Export Data',  bg: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', shadow: 'none' },
              ].map((b, i) => (
                <button key={i} style={{ padding: '10px 20px', borderRadius: 10, background: b.bg, border: b.border, color: b.color, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: b.shadow, transition: 'all .18s', fontFamily: "'DM Sans',sans-serif" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginTop: 24, opacity: visible ? 1 : 0, transition: 'opacity .6s ease .2s' }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className="ap-tab"
                style={{ padding: '12px 22px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab ? '#3b82f6' : 'transparent'}`, color: activeTab === tab ? '#60a5fa' : 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: activeTab === tab ? 700 : 500, cursor: 'pointer', transition: 'all .18s', fontFamily: "'DM Sans',sans-serif", letterSpacing: '0.02em', textTransform: 'capitalize' }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            CONTENT
        ══════════════════════════════════════════════ */}
        <div style={{ padding: '32px 48px 80px' }}>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div style={{ animation: 'fadeUp .4s ease both' }}>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                {STATS.map((s, i) => (
                  <div key={i} className="ap-card"
                    style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 16, padding: '18px 20px', animation: `fadeUp .4s ease ${i * .08}s both`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 20 }}>{s.icon}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: `${s.bg}`, border: `1px solid ${s.border}`, borderRadius: 5, padding: '2px 8px', letterSpacing: '0.08em', fontFamily: "'DM Sans',sans-serif" }}>+12%</span>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'white', lineHeight: 1, fontFamily: "'Outfit',sans-serif", marginBottom: 3 }}>
                      {s.val}<span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginLeft: 2 }}>{s.unit}</span>
                    </div>
                    <p style={{ margin: '0 0 10px', fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans',sans-serif" }}>{s.label}</p>
                    <Sparkline data={s.spark} color={s.color} height={32}/>
                  </div>
                ))}
              </div>

              {/* Main 2-col */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

                {/* Left */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                  {/* About */}
                  <div className="ap-card" style={{ background: 'linear-gradient(145deg,#0d1e3a,#081528)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 24, animation: 'fadeUp .4s ease .2s both', boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'white', letterSpacing: '-0.2px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 3, height: 16, background: '#3b82f6', borderRadius: 2, display: 'inline-block' }}/>
                      Account Information
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                      {[
                        { label: 'Full Name',       val: fullName },
                        { label: 'Role',            val: 'Super Administrator' },
                        { label: 'Email',           val: email },
                        { label: 'Username',        val: (email?.split('@')[0] || 'admin').toLowerCase(), mono: true },
                        { label: 'Location',        val: 'Algiers, Algeria' },
                        { label: 'Timezone',        val: 'GMT+1 (CET)' },
                        { label: 'Last Login',      val: 'Today at 09:14 AM' },
                        { label: 'Account ID',      val: 'ADM-00001', mono: true },
                        { label: 'Two-Factor Auth', val: 'Enabled ✓', green: true },
                        { label: 'Session Timeout', val: '8 hours' },
                      ].map((row, i) => (
                        <div key={i} style={{ padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingRight: i % 2 === 0 ? 24 : 0, paddingLeft: i % 2 === 1 ? 24 : 0, borderLeft: i % 2 === 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                          <p style={{ margin: '0 0 3px', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif" }}>{row.label}</p>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: row.green ? '#4ade80' : 'rgba(255,255,255,0.85)', fontFamily: row.mono ? "'JetBrains Mono',monospace" : "'DM Sans',sans-serif" }}>{row.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance rings */}
                  <div className="ap-card" style={{ background: 'linear-gradient(145deg,#0d1e3a,#081528)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 24, animation: 'fadeUp .4s ease .3s both', boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}>
                    <h3 style={{ margin: '0 0 22px', fontSize: 14, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 3, height: 16, background: '#a78bfa', borderRadius: 2, display: 'inline-block' }}/>
                      Performance Metrics
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                      <RingProgress pct={94} color="#4ade80" label="Report Rate"    sublabel="Resolution"/>
                      <RingProgress pct={87} color="#60a5fa" label="Response Time"  sublabel="Avg 4 min"/>
                      <RingProgress pct={99} color="#fbbf24" label="Uptime"         sublabel="This month"/>
                      <RingProgress pct={78} color="#a78bfa" label="User Satisf."   sublabel="Score"/>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                  {/* Recent activity mini */}
                  <div className="ap-card" style={{ background: 'linear-gradient(145deg,#0d1e3a,#081528)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 22, animation: 'fadeUp .4s ease .25s both', boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 3, height: 16, background: '#fbbf24', borderRadius: 2, display: 'inline-block' }}/>
                      Recent Activity
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {ACTIVITY.slice(0, 5).map((a, i) => (
                        <div key={i} className="ap-act" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 8px', borderRadius: 8, transition: 'background .15s', cursor: 'pointer' }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: `${a.color}18`, border: `1px solid ${a.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{a.icon}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: '0 0 2px', fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.text}</p>
                            <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{a.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveTab('activity')} style={{ width: '100%', marginTop: 10, padding: '9px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#60a5fa', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s', fontFamily: "'DM Sans',sans-serif" }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
                      View all activity →
                    </button>
                  </div>

                  {/* System status */}
                  <div className="ap-card" style={{ background: 'linear-gradient(145deg,#0d1e3a,#081528)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 22, animation: 'fadeUp .4s ease .35s both', boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}>
                    <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 3, height: 16, background: '#34d399', borderRadius: 2, display: 'inline-block' }}/>
                      System Status
                    </h3>
                    {[
                      { label: 'API Server',      status: 'Operational', pct: 99.9, color: '#4ade80' },
                      { label: 'Database',        status: 'Operational', pct: 98.2, color: '#4ade80' },
                      { label: 'Payment Gateway', status: 'Degraded',    pct: 82.1, color: '#fbbf24' },
                      { label: 'Notifications',   status: 'Operational', pct: 100,  color: '#4ade80' },
                    ].map((s, i) => (
                      <div key={i} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{s.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }}/>
                            <span style={{ fontSize: 10, color: s.color, fontWeight: 600 }}>{s.status}</span>
                          </div>
                        </div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${s.pct}%`, background: s.color, borderRadius: 2, transition: 'width 1s ease' }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ACTIVITY TAB ── */}
          {activeTab === 'activity' && (
            <div style={{ animation: 'fadeUp .4s ease both', maxWidth: 720 }}>
              <div style={{ background: 'linear-gradient(145deg,#0d1e3a,#081528)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 28 }}>
                <h3 style={{ margin: '0 0 22px', fontSize: 15, fontWeight: 700, color: 'white' }}>Full Activity Log</h3>
                <div style={{ position: 'relative' }}>
                  {/* Vertical line */}
                  <div style={{ position: 'absolute', left: 13, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.07)' }}/>
                  {ACTIVITY.map((a, i) => (
                    <div key={i} className="ap-act" style={{ display: 'flex', gap: 16, padding: '12px 10px 12px 0', borderRadius: 10, transition: 'background .15s', position: 'relative', animation: `fadeUp .35s ease ${i * .06}s both` }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${a.color}15`, border: `2px solid ${a.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, position: 'relative', zIndex: 1 }}>{a.icon}</div>
                      <div style={{ flex: 1, paddingTop: 3 }}>
                        <p style={{ margin: '0 0 3px', fontSize: 13, color: 'rgba(255,255,255,0.82)', lineHeight: 1.45 }}>{a.text}</p>
                        <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {a.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PERMISSIONS TAB ── */}
          {activeTab === 'permissions' && (
            <div style={{ animation: 'fadeUp .4s ease both', maxWidth: 680 }}>
              <div style={{ background: 'linear-gradient(145deg,#0d1e3a,#081528)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 28 }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: 'white' }}>Access Permissions</h3>
                <p style={{ margin: '0 0 22px', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Roles and capabilities assigned to this admin account.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {PERMISSIONS.map((p, i) => (
                    <div key={i} className="ap-perm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${p.granted ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)'}`, transition: 'background .15s', animation: `fadeUp .3s ease ${i * .06}s both` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: p.granted ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${p.granted ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {p.granted
                            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: p.granted ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)' }}>{p.label}</span>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', padding: '3px 10px', borderRadius: 5, background: p.granted ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${p.granted ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`, color: p.granted ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>
                        {p.granted ? 'GRANTED' : 'RESTRICTED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}