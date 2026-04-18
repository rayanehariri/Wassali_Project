// ═══════════════════════════════════════════════════════════
// SupportHistoryModal.jsx — Past support tickets
// Usage: <SupportHistoryModal onClose={() => {}} />
// ═══════════════════════════════════════════════════════════

const HISTORY_TICKETS = [
  { id:'TK-7540', title:'Wallet Top-up Issue',  sub:'Bank Transfer Query',  amount:'10.000,00 DZD', status:'resolved', date:'Oct 31, 2023' },
  { id:'TK-6211', title:'Wrong Item Delivered', sub:'Order #Wq-8120',       amount:'2.450,00 DZD',  status:'closed',   date:'Oct 11, 2023' },
  { id:'TK-5862', title:'Address Verification', sub:'Oran Regional Hub',    amount:'0,00 DZD',      status:'resolved', date:'Sep 26, 2023' },
];

const STATUS_MAP = {
  resolved: {
    color:'#4ade80', bg:'rgba(74,222,128,0.1)', border:'rgba(74,222,128,0.2)',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  },
  closed: {
    color:'#fbbf24', bg:'rgba(251,191,36,0.1)', border:'rgba(251,191,36,0.2)',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  },
};

export default function SupportHistoryModal({ onClose }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position:'fixed', inset:0, zIndex:1000,
        background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        animation:'cdFadeUp .2s ease both',
      }}>
      <div style={{
        background:'linear-gradient(145deg,#0d2040,#091830)',
        border:'1px solid rgba(255,255,255,0.1)',
        borderRadius:20, width:'100%', maxWidth:520,
        maxHeight:'88vh', overflowY:'auto',
        boxShadow:'0 40px 80px rgba(0,0,0,0.6)',
        animation:'cdFadeUp .25s ease both',
        margin:'0 16px',
      }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'22px 24px 18px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3 style={{ margin:0, fontSize:17, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Support History</h3>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', display:'flex', padding:4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Ticket list */}
        <div style={{ padding:'18px 24px 28px', display:'flex', flexDirection:'column', gap:12 }}>
          {HISTORY_TICKETS.map((tk, i) => {
            const s = STATUS_MAP[tk.status] || STATUS_MAP.resolved;
            return (
              <div key={tk.id} className="cd-order-hover"
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:14, cursor:'pointer', animation:`cdFadeUp .25s ease ${i*.07}s both` }}>
                {/* Status icon */}
                <div style={{ width:36, height:36, borderRadius:10, background:s.bg, border:`1px solid ${s.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {s.icon}
                </div>
                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontFamily:"'JetBrains Mono',monospace" }}>#{tk.id}</span>
                    <span style={{ fontSize:9, color:'rgba(255,255,255,0.25)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{tk.date}</span>
                  </div>
                  <p style={{ margin:'0 0 2px', fontSize:14, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>{tk.title}</p>
                  <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.4)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{tk.sub}</p>
                </div>
                {/* Amount + badge */}
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ margin:'0 0 6px', fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.6)', fontFamily:"'JetBrains Mono',monospace" }}>{tk.amount}</p>
                  <span style={{ fontSize:9, fontWeight:700, color:s.color, background:s.bg, border:`1px solid ${s.border}`, borderRadius:5, padding:'2px 8px', fontFamily:"'DM Sans',system-ui,sans-serif", letterSpacing:'0.08em' }}>
                    {tk.status.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}

          <button onClick={onClose} className="cd-primary-btn"
            style={{ marginTop:8, width:'100%', padding:'12px 0', borderRadius:12, border:'none', fontSize:13, fontWeight:600, cursor:'pointer', background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.6)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
