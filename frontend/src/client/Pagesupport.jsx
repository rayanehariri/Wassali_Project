// ═══════════════════════════════════════════════════════════
// Pagesupport.jsx — Help Center & Tickets shell
// Modals live in: ./support/SupportHistoryModal
//                 ./support/ChatPanel
// ═══════════════════════════════════════════════════════════
import { useState } from 'react';
import { TICKETS, Badge, TopBar } from './Shared';

import SupportHistoryModal from './support/SupportHistoryModal';
import ChatPanel           from './support/LiveChat';

// ─── CATEGORY CARDS DATA ─────────────────────────────────
const CATS = [
  {
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    title:'Orders',    desc:'Delivery delays, missing items, or order changes.', border:'rgba(59,130,246,.25)',  bg:'linear-gradient(135deg,#1a2a5a,#0d1e3a)',
  },
  {
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8L2 7h20l-6-4z"/></svg>,
    title:'Payments',  desc:'Refund status, wallet issues, and invoicing.',       border:'rgba(37,99,235,.25)',   bg:'linear-gradient(135deg,#0d3a4a,#071828)',
  },
  {
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    title:'Account',   desc:'Profile settings, security, and credentials.',       border:'rgba(99,102,241,.25)', bg:'linear-gradient(135deg,#1a1a4a,#0d0d2a)',
  },
  {
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    title:'Technical', desc:'App bugs, tracking issues, and connectivity.',       border:'rgba(239,68,68,.25)',  bg:'linear-gradient(135deg,#3a1a1a,#2a0d0d)',
  },
];

const TICKET_ICONS = {
  'TK-8821': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  'TK-7540': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8L2 7h20l-6-4z"/></svg>,
  'TK-9012': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
};

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════
export default function PageSupport({ currentUser, setActive, addToast }) {
  const firstName = currentUser?.name?.split(' ')[0] || 'Alex';
  const [showHistory, setShowHistory] = useState(false);
  const [showChat,    setShowChat]    = useState(false);

  return (
    <div style={{ animation:'cdFadeUp .3s ease both' }}>
      <TopBar placeholder="How can we help?" setActive={setActive} addToast={addToast} currentUser={currentUser} />
      <div className="cd-page-wrap">

        {/* ── Hero ── */}
        <div className="cd-home-top-row" style={{ marginBottom: 28 }}>
          <div>
            <h1 style={{ margin:'0 0 6px', fontSize:24, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>
              Hello, {firstName}!{' '}
            </h1>
            <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,.5)', maxWidth:450, lineHeight:1.65, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
              How can our kinetic support team assist you today? Explore help categories or check ticket status.
            </p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {[
              { label:'CHAT',    fn:() => setShowChat(true),    icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
              { label:'HISTORY', fn:() => setShowHistory(true), icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
            ].map(b => (
              <button key={b.label} onClick={b.fn} className="cd-btn-outline"
                style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, width:58, height:58, borderRadius:12, background:'#112040', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.4)', cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:9, fontWeight:700, letterSpacing:'0.12em' }}>
                {b.icon}{b.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Category cards ── */}
        <div className="cd-support-grid-4">
          {CATS.map((c, i) => (
            <div key={c.title} className="cd-cat-hover"
              style={{ borderRadius:18, padding:20, cursor:'pointer', background:c.bg, border:`1px solid ${c.border}`, animation:`cdFadeUp .3s ease ${i*.06}s both` }}>
              <div style={{ width:42, height:42, borderRadius:12, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
                {c.icon}
              </div>
              <h4 style={{ margin:'0 0 6px', fontSize:14, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>{c.title}</h4>
              <p style={{ margin:0, fontSize:12, color:'rgba(255,255,255,.45)', lineHeight:1.6, fontFamily:"'DM Sans',system-ui,sans-serif" }}>{c.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Active Tickets ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Active Support Tickets</h3>
          <button onClick={() => setShowHistory(true)}
            style={{ background:'none', border:'none', fontSize:12, color:'#60a5fa', cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
            View Ticket History
          </button>
        </div>
        <div className="cd-support-grid-3">
          {TICKETS.map((tk, i) => (
            <div key={tk.id} className="cd-order-hover"
              style={{ background:'#0c1e35', border:'1px solid rgba(255,255,255,.07)', borderRadius:18, padding:16, cursor:'pointer', animation:`cdFadeUp .3s ease ${i*.07}s both` }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:32, height:32, borderRadius:10, background:'#112040', border:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {TICKET_ICONS[tk.id]}
                  </div>
                  <div>
                    <p style={{ margin:'0 0 1px', fontSize:11, color:'rgba(255,255,255,.45)', fontFamily:"'JetBrains Mono',monospace" }}>{tk.id}</p>
                    <span style={{ fontSize:9, fontWeight:700, color:tk.status==='resolved'?'#4ade80':'#fbbf24', letterSpacing:'0.1em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{tk.badge}</span>
                  </div>
                </div>
                <Badge status={tk.status} label={tk.status==='resolved'?'RESOLVED':'ACTIVE'}/>
              </div>
              <h4 style={{ margin:'0 0 3px', fontSize:13, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>{tk.title}</h4>
              <p style={{ margin:'0 0 12px', fontSize:11, color:'rgba(255,255,255,.4)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{tk.sub}</p>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:11, color:'rgba(255,255,255,.5)', fontFamily:"'JetBrains Mono',monospace" }}>{tk.amount}</span>
                <span style={{ fontSize:9, fontWeight:700, color:tk.status==='resolved'?'#4ade80':'#fbbf24', letterSpacing:'0.1em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                  {tk.status === 'resolved' ? 'RESOLVED' : 'IN PROGRESS'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Contact Expert ── */}
        <div style={{ borderRadius:18, overflow:'hidden', border:'1px solid rgba(255,255,255,.07)' }}>
          <div className="cd-support-two">
            <div style={{ padding:26, background:'#0c1e35' }}>
              <h3 style={{ margin:'0 0 10px', fontSize:17, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Contact an Expert</h3>
              <p style={{ margin:'0 0 22px', fontSize:13, color:'rgba(255,255,255,.45)', maxWidth:380, lineHeight:1.7, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                Our dedicated support team is ready to help you navigate any logistical challenge. Reach out through our local Algerian hotlines or start an instant conversation.
              </p>
              <div style={{ display:'flex', gap:14, marginBottom:22 }}>
                {[{ label:'ALGIERS HQ', val:'+213 (0) 23 45 67 89' },{ label:'TOLL FREE', val:'0800 123 456' }].map(c => (
                  <div key={c.label} style={{ background:'#112040', border:'1px solid rgba(255,255,255,.08)', borderRadius:12, padding:'12px 16px' }}>
                    <p style={{ margin:'0 0 4px', fontSize:9, fontWeight:700, color:'rgba(255,255,255,.3)', letterSpacing:'0.12em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{c.label}</p>
                    <p style={{ margin:0, fontSize:14, fontWeight:700, color:'white', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{c.val}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowChat(true)} className="cd-track-btn"
                style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#112040', border:'1px solid rgba(59,130,246,.3)', borderRadius:12, padding:'11px 20px', color:'#60a5fa', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Start Live Chat
              </button>
            </div>

            {/* Illustration */}
            <div style={{ position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#0d2a4a,#071828)', borderLeft:'1px solid rgba(255,255,255,.06)', minHeight:220 }}>
              <div
                style={{
                  position:'absolute',
                  left:6,
                  right:6,
                  top:12,
                  bottom:12,
                  borderRadius:16,
                  overflow:'hidden',
                  border:'1px solid rgba(255,255,255,.12)',
                  boxShadow:'0 10px 24px rgba(0,0,0,.35)',
                }}
              >
                <div
                  role="img"
                  aria-label="Kinetic support"
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: 140,
                    background: 'linear-gradient(135deg, #0d2a4a 0%, #1a3a6a 40%, #071828 100%)',
                  }}
                />
              </div>
              <div style={{ position:'absolute', left:24, bottom:24, zIndex:2 }}>
                <p style={{ margin:'0 0 4px', fontSize:13, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>24/7 Kinetic Support</p>
                <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,.4)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>Average Response Time: 2 min</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Sub-components ── */}
      {showHistory && <SupportHistoryModal onClose={() => setShowHistory(false)}/>}
      {showChat    && <ChatPanel           onClose={() => setShowChat(false)}/>}
    </div>
  );
}