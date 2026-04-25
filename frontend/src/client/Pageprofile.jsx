import { useState, useEffect, useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { http } from '../api/http';

// ── Animated counter ──────────────────────────────────────
function useCounter(target, duration = 1400, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null, raf;
    const t = setTimeout(() => {
      function step(ts) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [target, duration, delay]);
  return val;
}

// ── Star rating ───────────────────────────────────────────
function Stars({ rating, size = 13 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? '#fbbf24' : 'rgba(255,255,255,0.12)'} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

// ── Donut chart ───────────────────────────────────────────
function DonutChart({ segments }) {
  return (
    <div style={{ width: 112, height: 112 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={segments}
            dataKey="value"
            nameKey="label"
            innerRadius={34}
            outerRadius={50}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            paddingAngle={2}
          >
            {segments.map((seg, i) => (
              <Cell key={`seg-${i}`} fill={seg.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Order status badge ────────────────────────────────────
function StatusBadge({ status }) {
  const MAP = {
    completed: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.25)',  label: 'Completed'  },
    transit:   { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)',  label: 'In Transit' },
    cancelled: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', label: 'Cancelled'  },
  };
  const s = MAP[status] || MAP.completed;
  return (
    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', padding: '3px 8px', borderRadius: 4, background: s.bg, border: `1px solid ${s.border}`, color: s.color, whiteSpace: 'nowrap', fontFamily: "'DM Sans',sans-serif" }}>
      {s.label}
    </span>
  );
}

// ── Mock data ─────────────────────────────────────────────
const CAT_COLORS = {
  Pharmacy:  '#60a5fa',
  Groceries: '#4ade80',
  Packages:  '#a78bfa',
};

// ══════════════════════════════════════════════════════════
export default function ClientProfile({ currentUser }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [visible,   setVisible]   = useState(false);
  const [orders, setOrders] = useState([]);
  const hasOrders = orders.length > 0;
  const fullName = currentUser?.name || 'Client User';
  const email = currentUser?.email || 'client@wassali.dz';
  const phone = currentUser?.phone || '+213 000 000 000';
  const wilaya = currentUser?.wilaya || 'Not set';
  const initials = (fullName || 'CU')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);
  useEffect(() => {
    let alive = true;
    async function loadOrders() {
      try {
        const me = await http.get('/auth/me/');
        const meUser = me?.data?.user ?? me?.data?.data?.user;
        const clientId = meUser?._id ?? currentUser?._id ?? currentUser?.id ?? currentUser?.client_id;
        if (!clientId) return;
        const res = await http.get(`/client/deliveries/${clientId}`);
        const list = res?.data?.deliveries ?? res?.data?.data?.deliveries ?? [];
        const mapped = list.map((o) => {
          const raw = String(o.status || '').toLowerCase();
          const status = raw === 'accepted' ? 'transit' : raw === 'cancelled' ? 'cancelled' : raw === 'rejected' ? 'cancelled' : 'completed';
          return {
            id: `#${String(o._id || '').slice(0, 8)}`,
            date: o.created_at ? String(o.created_at).slice(0, 10) : '—',
            title: o.description_of_order || 'Delivery',
            cat: 'Packages',
            amount: Number(o.price || 0).toLocaleString(),
            status,
            courier: o.deliverer_name || '—',
          };
        });
        if (alive) setOrders(mapped);
      } catch {
        if (alive) setOrders([]);
      }
    }
    loadOrders();
    return () => { alive = false; };
  }, [currentUser]);

  const ORDERS = useMemo(() => orders, [orders]);
  const PROFILE_TX = useMemo(
    () =>
      ORDERS.map((o) => ({
        desc: o.title,
        date: o.date,
        amount: `-${Number(String(o.amount).replace(/,/g, "") || 0).toLocaleString()} DZD`,
        neg: true,
      })),
    [ORDERS]
  );
  const totalOrdersReal = ORDERS.length;
  const totalSpentReal = ORDERS.reduce((sum, o) => sum + Number(String(o.amount).replace(/,/g, "") || 0), 0);
  const completedReal = ORDERS.filter((o) => o.status === "completed").length;

  const totalOrders  = useCounter(totalOrdersReal,      1400, 300);
  const totalSpent   = useCounter(totalSpentReal,       1800, 450);
  const deliveries   = useCounter(completedReal,        1300, 600);
  const walletBal    = useCounter(12450,   1600, 750);

  const STATS = [
    { label: 'Total Orders',     val: totalOrders,            fmt: v => v,                          suffix: '',     color: '#60a5fa', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg> },
    { label: 'Total Spent',      val: totalSpent,             fmt: v => v.toLocaleString(),         suffix: ' DZD', color: '#f87171', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
    { label: 'Completed',        val: deliveries,             fmt: v => v,                          suffix: '',     color: '#4ade80', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
    { label: 'Wallet Balance',   val: walletBal,              fmt: v => v.toLocaleString(),         suffix: ' DZD', color: '#fbbf24', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8L2 7h20l-6-4z"/></svg> },
  ];

  const TABS = ['overview', 'orders', 'wallet'];

  return (
    <div style={{ minHeight: '100%', background: '#060d1a', fontFamily: "'DM Sans',system-ui,sans-serif", color: 'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes orb     { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-15px)} }
        @keyframes pulse   { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(74,222,128,0.5)} 50%{opacity:.7;box-shadow:0 0 0 6px rgba(74,222,128,0)} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes gradshift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }

        .cp-card { transition: transform .22s ease, box-shadow .22s ease; }
        .cp-card:hover { transform: translateY(-3px); box-shadow: 0 18px 48px rgba(0,0,0,0.4) !important; }
        .cp-row:hover { background: rgba(255,255,255,0.04) !important; }
        .cp-tab:hover { color: rgba(255,255,255,0.85) !important; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .cp-hero-strip { padding: 0 20px 16px !important; }
          .cp-hero-inner { flex-direction: column !important; align-items: flex-start !important; transform: translateY(-26px) !important; margin-bottom: 0 !important; gap: 12px !important; }
          .cp-name-meta { padding-bottom: 0 !important; }
          .cp-action-btns { padding-bottom: 0 !important; }
          .cp-tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .cp-content { padding: 20px 16px 32px !important; }
          .cp-stats-row { grid-template-columns: repeat(2,1fr) !important; }
          .cp-2col { grid-template-columns: 1fr !important; }
          .cp-wallet-tab-grid { grid-template-columns: 1fr !important; }
          .cp-orders-header { display: none !important; }
          .cp-orders-row { grid-template-columns: 1fr 1fr !important; grid-template-rows: auto auto auto !important; gap: 6px 0 !important; padding: 14px 16px !important; }
          .cp-orders-row > span:first-child { grid-column: 1 / -1; }
        }
        @media (max-width: 600px) {
          .cp-stats-row { grid-template-columns: 1fr 1fr !important; }
          .cp-hero-strip { padding: 0 14px 14px !important; }
          .cp-content { padding: 16px 12px 28px !important; }
        }
      `}</style>

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', right: '10%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 70%)', animation: 'orb 14s ease-in-out infinite' }}/>
        <div style={{ position: 'absolute', bottom: '5%',  left: '5%',   width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle,rgba(74,222,128,0.07) 0%,transparent 70%)', animation: 'orb 18s ease-in-out infinite reverse' }}/>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ══ HERO HEADER ══ */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: 0,
            background: 'linear-gradient(180deg, #0d2a50 0%, #0b2344 28%, #091b34 56%, #071426 80%, #060f1e 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Gradient banner */}
          <div style={{
            height: 190,
            background: 'transparent',
            backgroundSize: '300% 300%',
            animation: 'gradshift 10s ease infinite',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Decorative dots */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06, pointerEvents: 'none' }}>
              <defs><pattern id="cp-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#60a5fa"/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#cp-dots)"/>
            </svg>
            {/* Glow orb */}
            <div style={{ position: 'absolute', top: '-40%', left: '30%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(8, 46, 108, 0.2) 0%,transparent 70%)', animation: 'orb 10s ease-in-out infinite' }}/>
            {/* Level badge */}
            <div style={{ position: 'absolute', top: 16, right: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ padding: '5px 12px', background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.35)', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', fontFamily: "'DM Sans',sans-serif" }}>Gold Member</span>
              </div>
            </div>
          </div>

          {/* Profile info strip */}
          <div
            className="cp-hero-strip"
            style={{
              background: 'transparent',
              padding: '0 48px 18px',
              marginTop: -1,
            }}
          >
            <div className="cp-hero-inner" style={{ display: 'flex', alignItems: 'flex-end', gap: 24, transform: 'translateY(-32px)', marginBottom: 0 }}>

              {/* Avatar */}
              <div style={{ position: 'relative', animation: 'float 4s ease-in-out infinite', flexShrink: 0 }}>
                <div style={{
                  width: 100, height: 100, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#0d4a8a,#1a6ecc)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 34, fontWeight: 900, color: 'white',
                  fontFamily: "'Outfit',sans-serif",
                  border: '4px solid #08121e',
                  boxShadow: '0 8px 32px rgba(59,130,246,0.4)',
                  opacity: visible ? 1 : 0,
                  transition: 'opacity .5s ease',
                }}>{initials || 'C'}</div>
                <div style={{ position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: '50%', background: '#4ade80', border: '3px solid #08121e', animation: 'pulse 2.5s ease-in-out infinite' }}/>
              </div>

              {/* Name / meta */}
              <div className="cp-name-meta" style={{ paddingBottom: 20, flex: 1, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(12px)', transition: 'all .55s ease .1s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: 'white', fontFamily: "'Outfit',sans-serif", letterSpacing: '-0.4px' }}>{fullName}</h1>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#3b82f6"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z"/></svg>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{email}</span>
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{phone}</span>
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Algiers, Algeria</span>
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                  {hasOrders ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Stars rating={4.8}/>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>4.8</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>({totalOrdersReal} orders)</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>(No orders yet)</span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="cp-action-btns" style={{ display: 'flex', gap: 10, paddingBottom: 20, opacity: visible ? 1 : 0, transition: 'opacity .6s ease .2s', flexShrink: 0 }}>
                <button style={{ padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', border: 'none', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(37,99,235,0.4)', transition: 'opacity .15s', fontFamily: "'DM Sans',sans-serif" }}
                  onMouseEnter={e => e.currentTarget.style.opacity='0.8'} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                  Edit Profile
                </button>
                <button style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s', fontFamily: "'DM Sans',sans-serif" }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(248,113,113,0.18)'} onMouseLeave={e => e.currentTarget.style.background='rgba(248,113,113,0.1)'}>
                  Suspend
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div
              className="cp-tabs"
              style={{
                display: 'flex',
                gap: 0,
                opacity: visible ? 1 : 0,
                transition: 'opacity .6s ease .25s',
                borderTop: '1px solid rgba(255,255,255,0.14)',
                paddingTop: 8,
              }}
            >
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className="cp-tab"
                  style={{ padding: '12px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab ? '#3b82f6' : 'transparent'}`, color: activeTab === tab ? '#60a5fa' : 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: activeTab === tab ? 700 : 500, cursor: 'pointer', transition: 'all .18s', textTransform: 'capitalize', fontFamily: "'DM Sans',sans-serif" }}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ══ CONTENT ══ */}
        <div className="cp-content" style={{ padding: '28px 48px 48px' }}>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div style={{ animation: 'fadeUp .4s ease both' }}>

              {/* Stats row */}
              <div className="cp-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
                {STATS.map((s, i) => (
                  <div key={i} className="cp-card"
                    style={{ background: 'linear-gradient(145deg,#0d1e3a,#081528)', border: `1px solid ${s.color}22`, borderRadius: 16, padding: '18px 20px', animation: `fadeUp .4s ease ${i * .08}s both`, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: `${s.color}14`, border: `1px solid ${s.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                        {s.icon}
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, color: s.color, letterSpacing: '0.1em', background: `${s.color}12`, border: `1px solid ${s.color}25`, borderRadius: 4, padding: '2px 8px' }}>THIS MONTH</span>
                    </div>
                    <p style={{ margin: '0 0 3px', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
                    <div style={{ fontSize: 24, fontWeight: 800, color: 'white', fontFamily: "'Outfit',sans-serif", lineHeight: 1 }}>
                      {s.fmt(s.val)}<span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginLeft: 2 }}>{s.suffix}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 2-col */}
              <div className="cp-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18 }}>

                {/* Left */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Personal info */}
                  <div className="cp-card" style={{ background: 'linear-gradient(145deg,#0d1e3a,#081528)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 24, animation: 'fadeUp .4s ease .15s both' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 3, height: 16, background: '#60a5fa', borderRadius: 2, display: 'inline-block' }}/>
                      Personal Details
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                      {[
                        { label: 'Full Name',        val: fullName },
                        { label: 'Client ID',        val: currentUser?._id || currentUser?.id || '—', mono: true },
                        { label: 'Email',            val: email },
                        { label: 'Phone',            val: phone },
                        { label: 'Wilaya',           val: wilaya },
                        { label: 'Member Since',     val: '—' },
                        { label: 'Account Status',   val: 'Active ✓', green: true },
                        { label: 'Verification',     val: 'Verified ✓', green: true },
                        { label: 'Preferred Payment',val: 'Wassali Wallet'       },
                        { label: 'Language',         val: 'Arabic / French'      },
                      ].map((row, i) => (
                        <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingRight: i % 2 === 0 ? 22 : 0, paddingLeft: i % 2 === 1 ? 22 : 0, borderLeft: i % 2 === 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                          <p style={{ margin: '0 0 2px', fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.09em', textTransform: 'uppercase' }}>{row.label}</p>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: row.green ? '#4ade80' : 'rgba(255,255,255,0.82)', fontFamily: row.mono ? "'JetBrains Mono',monospace" : 'inherit' }}>{row.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent orders preview */}
                  <div className="cp-card" style={{ background: 'linear-gradient(145deg,#0d1e3a,#081528)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 24, animation: 'fadeUp .4s ease .25s both' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 3, height: 16, background: '#a78bfa', borderRadius: 2, display: 'inline-block' }}/>
                        Recent Orders
                      </h3>
                      <button onClick={() => setActiveTab('orders')} style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>View all →</button>
                    </div>
                    {ORDERS.slice(0, 3).map((o, i) => (
                      <div key={i} className="cp-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 9, transition: 'background .15s', marginBottom: 2 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${CAT_COLORS[o.cat] || '#60a5fa'}14`, border: `1px solid ${CAT_COLORS[o.cat] || '#60a5fa'}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={CAT_COLORS[o.cat] || '#60a5fa'} strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.title}</p>
                          <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{o.id} · {o.date}</p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ margin: '0 0 3px', fontSize: 12, fontWeight: 700, color: 'white', fontFamily: "'JetBrains Mono',monospace" }}>{o.amount} DZD</p>
                          <StatusBadge status={o.status}/>
                        </div>
                      </div>
                    ))}
                    {!hasOrders && (
                      <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                        No recent orders yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Wallet card */}
                  <div className="cp-card" style={{ borderRadius: 18, padding: 22, background: 'linear-gradient(135deg,#0e2a5a,#0a1e40)', border: '1px solid rgba(59,130,246,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', animation: 'fadeUp .4s ease .2s both', position: 'relative', overflow: 'hidden' }}>
                    {/* Decorative circle */}
                    <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.12)', pointerEvents: 'none' }}/>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8L2 7h20l-6-4z"/></svg>
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)' }}>WASSALI WALLET</span>
                    </div>
                    <p style={{ margin: '0 0 3px', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Available Balance</p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, marginBottom: 18 }}>
                      <span style={{ fontSize: 30, fontWeight: 800, color: 'white', lineHeight: 1, fontFamily: "'Outfit',sans-serif" }}>12,450</span>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>DZD</span>
                    </div>
                    {/* Card number style */}
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.18em' }}>•••• •••• 4321</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>12/26</span>
                    </div>
                    <button style={{ width: '100%', padding: '10px', borderRadius: 10, background: '#ADC6FF', border: 'none', color: '#0a1e40', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'opacity .15s', fontFamily: "'DM Sans',sans-serif" }}
                      onMouseEnter={e => e.currentTarget.style.opacity='0.85'} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                      + Top Up Balance
                    </button>
                  </div>

                  {/* Order breakdown donut */}
                  {hasOrders && (
                  <div className="cp-card" style={{ background: 'linear-gradient(145deg,#0d1e3a,#081528)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 22, animation: 'fadeUp .4s ease .3s both' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 3, height: 16, background: '#fbbf24', borderRadius: 2, display: 'inline-block' }}/>
                      Order Breakdown
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <DonutChart segments={[
                        { label: 'Pharmacy', value: 20, color: '#60a5fa' },
                        { label: 'Groceries', value: 18, color: '#4ade80' },
                        { label: 'Packages', value: 6,  color: '#a78bfa' },
                        { label: 'Cancelled', value: 3,  color: '#f87171' },
                      ]}/>
                      <div style={{ flex: 1 }}>
                        {[
                          { label: 'Groceries', val: 20, color: '#4ade80' },
                          { label: 'Pharmacy',  val: 18, color: '#60a5fa' },
                          { label: 'Packages',  val: 6,  color: '#a78bfa' },
                          { label: 'Cancelled', val: 3,  color: '#f87171' },
                        ].map((s, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }}/>
                              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{s.label}</span>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{s.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Trusted deliverers */}
                  {hasOrders && (
                  <div className="cp-card" style={{ background: 'linear-gradient(145deg,#0d1e3a,#081528)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 20, animation: 'fadeUp .4s ease .38s both' }}>
                    <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 3, height: 16, background: '#34d399', borderRadius: 2, display: 'inline-block' }}/>
                      Top Deliverers
                    </h3>
                    {[
                      { name: 'Yassine B.', initials: 'YB', orders: 12, rating: 4.9, color: 'rgba(78,222,163,0.4)'  },
                      { name: 'Karim M.',   initials: 'KM', orders: 8,  rating: 4.7, color: 'rgba(96,165,250,0.4)' },
                      { name: 'Lina M.',    initials: 'LM', orders: 5,  rating: 5.0, color: 'rgba(167,139,250,0.4)'},
                    ].map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#1a4a6a,#0d2a4a)', border: `2px solid ${d.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>{d.initials}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: 'white' }}>{d.name}</p>
                          <Stars rating={d.rating} size={10}/>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 5, padding: '2px 8px' }}>{d.orders} orders</span>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── ORDERS TAB ── */}
          {activeTab === 'orders' && (
            <div style={{ animation: 'fadeUp .4s ease both' }}>
              <div className="cp-card" style={{ background: 'linear-gradient(145deg,#0d1e3a,#081528)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'white' }}>Order History</h3>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '3px 10px' }}>47 total orders</span>
                </div>
                {/* Table header */}
                <div className="cp-orders-header" style={{ display: 'grid', gridTemplateColumns: '130px 1fr 100px 140px 110px 120px', gap: 0, padding: '10px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>
                  <span>ORDER ID</span><span>DESCRIPTION</span><span>CATEGORY</span><span>AMOUNT</span><span>STATUS</span><span style={{ paddingLeft: 14 }}>DATE</span>
                </div>
                {ORDERS.map((o, i) => (
                  <div key={i} className="cp-row cp-orders-row" style={{ display: 'grid', gridTemplateColumns: '130px 1fr 100px 140px 110px 120px', alignItems: 'center', gap: 0, padding: '13px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .15s', animation: `fadeUp .3s ease ${i * .06}s both` }}>
                    <span style={{ fontSize: 11, color: '#60a5fa', fontFamily: "'JetBrains Mono',monospace" }}>{o.id}</span>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: 'white' }}>{o.title}</p>
                      <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Courier: {o.courier}</p>
                    </div>
                    <span style={{ fontSize: 11, color: CAT_COLORS[o.cat] || '#60a5fa', fontWeight: 600 }}>{o.cat}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'white', fontFamily: "'JetBrains Mono',monospace" }}>{o.amount} DZD</span>
                    <StatusBadge status={o.status}/>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', paddingLeft: 14 }}>{o.date}</span>
                  </div>
                ))}
                {!hasOrders && (
                  <p style={{ margin: 0, padding: '14px 22px', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                    No order history yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── WALLET TAB ── */}
          {activeTab === 'wallet' && (
            <div className="cp-wallet-tab-grid" style={{ animation: 'fadeUp .4s ease both', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
              {/* Transactions */}
              <div className="cp-card" style={{ background: 'linear-gradient(145deg,#0d1e3a,#081528)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'white' }}>Transaction History</h3>
                </div>
                <div style={{ display: 'grid', padding: '9px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em', gridTemplateColumns: '1fr 120px 140px' }}>
                  <span>DESCRIPTION</span><span>DATE</span><span>AMOUNT</span>
                </div>
                {PROFILE_TX.map((tx, i) => (
                  <div key={i} className="cp-row" style={{ display: 'grid', alignItems: 'center', padding: '13px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)', gridTemplateColumns: '1fr 120px 140px', transition: 'background .15s', animation: `fadeUp .3s ease ${i * .06}s both` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: tx.neg ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)', border: `1px solid ${tx.neg ? 'rgba(248,113,113,0.25)' : 'rgba(74,222,128,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tx.neg ? '#f87171' : '#4ade80'} strokeWidth="2">
                          {tx.neg ? <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></> : <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>}
                        </svg>
                      </div>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{tx.desc}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>{tx.date}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: tx.neg ? '#f87171' : '#4ade80', fontFamily: "'JetBrains Mono',monospace" }}>{tx.amount}</span>
                  </div>
                ))}
                {PROFILE_TX.length === 0 && (
                  <p style={{ margin: 0, padding: '14px 22px', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                    No transactions yet.
                  </p>
                )}
              </div>

              {/* Wallet summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Available Balance', val: '12,450 DZD', color: '#60a5fa',  bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)'  },
                  { label: 'Total Spent',        val: '142,500 DZD', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
                  { label: 'Total Top-Ups',      val: '155,000 DZD', color: '#4ade80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.2)'  },
                  { label: 'Cashback Earned',    val: '1,250 DZD',   color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)'  },
                ].map((s, i) => (
                  <div key={i} className="cp-card" style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14, padding: '16px 18px', animation: `fadeUp .3s ease ${i * .07}s both` }}>
                    <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</p>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: s.color, fontFamily: "'Outfit',sans-serif" }}>{s.val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}