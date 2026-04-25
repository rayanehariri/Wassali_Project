// ═══════════════════════════════════════════════════════════
// TxHistoryModal.jsx — Full Transaction History
// Usage: <TxHistoryModal onClose={() => {}} />
// ═══════════════════════════════════════════════════════════
import { useMemo, useState } from 'react';
import { TxIcon } from '../Shared';

const ALL_TX = [
  { id:'#TRX-829910', type:'alert',    desc:'Community Guidelines Violation',  date:'May 12, 2024', amount:'-2.500,00 DZD', neg:true,  status:'completed'  },
  { id:'#TRX-829845', type:'topup',    desc:'Wallet Top Up',                   date:'May 10, 2024', amount:'+5.000,00 DZD', neg:false, status:'completed'  },
  { id:'#TRX-829712', type:'order',    desc:'Supermarché Ardis Order',         date:'May 08, 2024', amount:'-8.450,00 DZD', neg:true,  status:'completed'  },
  { id:'#TRX-829654', type:'delivery', desc:'Courier Service – Oran Delivery', date:'May 05, 2024', amount:'-3.500,00 DZD', neg:true,  status:'processing' },
];

const STATUS_COLOR = { completed:'#4ade80', processing:'#fbbf24' };
const TOTAL_PAGES  = 12;

const FILTERS = [
  { k:'all',    label:'All'     },
  { k:'topups', label:'Top-ups' },
  { k:'orders', label:'Orders'  },
];

export default function TxHistoryModal({ onClose, transactions = [] }) {
  const [filter, setFilter] = useState('all');
  const [page,   setPage]   = useState(1);
  const sourceTx = useMemo(() => (transactions.length > 0 ? transactions : ALL_TX), [transactions]);

  const filtered =
    filter === 'topups' ? sourceTx.filter(t => t.type === 'topup' || t.neg === false) :
    filter === 'orders' ? sourceTx.filter(t => t.type !== 'topup' && t.neg !== false) :
    sourceTx;

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
        borderRadius:20, width:'100%', maxWidth:640,
        maxHeight:'88vh', overflowY:'auto',
        boxShadow:'0 40px 80px rgba(0,0,0,0.6)',
        animation:'cdFadeUp .25s ease both',
        margin:'0 16px',
      }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'22px 24px 0' }}>
          <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Transaction History</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', display:'flex', padding:4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{ padding:'18px 24px 28px' }}>

          {/* Filter + Date */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <div style={{ display:'flex', gap:6 }}>
              {FILTERS.map(f => (
                <button key={f.k} onClick={() => { setFilter(f.k); setPage(1); }}
                  style={{ padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s', fontFamily:"'DM Sans',system-ui,sans-serif", border:`1px solid ${filter===f.k?'rgba(59,130,246,0.5)':'rgba(255,255,255,0.1)'}`, background:filter===f.k?'rgba(59,130,246,0.15)':'rgba(255,255,255,0.04)', color:filter===f.k?'#60a5fa':'rgba(255,255,255,0.5)' }}>
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:8, padding:'6px 12px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.5)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>May 01 – May 31, 2024</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>

          {/* Table header */}
          <div style={{ display:'grid', gridTemplateColumns:'110px 46px 1fr 140px 110px', padding:'8px 12px', borderBottom:'1px solid rgba(255,255,255,0.06)', marginBottom:4 }}>
            {['DATE','TYPE','DESCRIPTION','AMOUNT','STATUS'].map(h => (
              <span key={h} style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', letterSpacing:'0.08em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((tx, i) => (
            <div key={tx.id} className="cd-order-hover"
              style={{ display:'grid', gridTemplateColumns:'110px 46px 1fr 140px 110px', alignItems:'center', padding:'13px 12px', borderBottom:'1px solid rgba(255,255,255,0.04)', borderRadius:8, animation:`cdFadeUp .2s ease ${i*.05}s both` }}>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.5)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{tx.date}</span>
              <TxIcon id={tx.id} neg={tx.neg}/>
              <span style={{ fontSize:13, color:'rgba(255,255,255,0.8)', fontFamily:"'DM Sans',system-ui,sans-serif", paddingLeft:8 }}>{tx.desc}</span>
              <span style={{ fontSize:13, fontWeight:600, color:tx.neg?'#f87171':'#4ade80', fontFamily:"'JetBrains Mono',monospace" }}>{tx.amount}</span>
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700, color:STATUS_COLOR[tx.status]||'#4ade80', background:`${STATUS_COLOR[tx.status]||'#4ade80'}18`, border:`1px solid ${STATUS_COLOR[tx.status]||'#4ade80'}28`, borderRadius:6, padding:'3px 8px', fontFamily:"'DM Sans',system-ui,sans-serif", letterSpacing:'0.06em' }}>
                ● {tx.status === 'processing' ? 'PROCESSING' : 'COMPLETED'}
              </span>
            </div>
          ))}

          {/* Pagination */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginTop:20 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', color:'rgba(255,255,255,0.45)', cursor:page===1?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span style={{ fontSize:13, color:'rgba(255,255,255,0.5)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>Page {page} of {TOTAL_PAGES}</span>
            <button onClick={() => setPage(p => Math.min(TOTAL_PAGES, p+1))} disabled={page===TOTAL_PAGES}
              style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', color:'rgba(255,255,255,0.45)', cursor:page===TOTAL_PAGES?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
