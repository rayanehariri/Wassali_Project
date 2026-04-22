// ═══════════════════════════════════════════════════════════
// DelivererHistory.jsx — Past deliverers list
// Re-order Service → triggers new delivery flow
// ═══════════════════════════════════════════════════════════
import { useEffect, useMemo, useState } from 'react';
import ReviewModal    from './ReviewModal';
import TrackChatPanel from './TrackChatPanel';
import { http } from '../../api/http';

function initials(name) {
  return String(name || 'D')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'D';
}

const TAG_STYLE = {
  Express:     { bg:'rgba(96,165,250,0.12)',  border:'rgba(96,165,250,0.25)',  color:'#60a5fa'  },
  Groceries:   { bg:'rgba(74,222,128,0.12)',  border:'rgba(74,222,128,0.25)',  color:'#4ade80'  },
  Fragile:     { bg:'rgba(248,113,113,0.12)', border:'rgba(248,113,113,0.25)', color:'#f87171'  },
  Pharmacy:    { bg:'rgba(96,165,250,0.12)',  border:'rgba(96,165,250,0.25)',  color:'#60a5fa'  },
  Documents:   { bg:'rgba(251,191,36,0.12)',  border:'rgba(251,191,36,0.25)',  color:'#fbbf24'  },
  Gifts:       { bg:'rgba(167,139,250,0.12)', border:'rgba(167,139,250,0.25)', color:'#a78bfa'  },
  Electronics: { bg:'rgba(52,211,153,0.12)',  border:'rgba(52,211,153,0.25)',  color:'#34d399'  },
};

function Stars({ rating }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i<=Math.round(rating)?'#fbbf24':'none'} stroke="#fbbf24" strokeWidth="1.8">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span style={{ fontSize:12, fontWeight:700, color:'#fbbf24', marginLeft:4, fontFamily:"'DM Sans',system-ui,sans-serif" }}>{rating.toFixed(1)}</span>
    </div>
  );
}

// ✅ onNewDelivery — starts the new delivery flow from ClientDashboard
export default function DelivererHistory({ onBack, onNewDelivery }) {
  const [reviewTarget, setReviewTarget] = useState(null);
  const [chatTarget,   setChatTarget]   = useState(null);
  const [deliverers, setDeliverers] = useState([]);
  const [loading, setLoading] = useState(true);

  const mapped = useMemo(() => {
    return (deliverers || []).map((d, idx) => {
      const name = d.name || 'Deliverer';
      const init = initials(name);
      // stable-ish palette
      const palettes = [
        { avatarColor: 'linear-gradient(135deg,#1a4a6a,#0d2a4a)', avatarBorder: 'rgba(78,222,163,0.4)' },
        { avatarColor: 'linear-gradient(135deg,#3a2a1a,#2a1a0d)', avatarBorder: 'rgba(251,191,36,0.4)' },
        { avatarColor: 'linear-gradient(135deg,#4a1a3a,#2a0d2a)', avatarBorder: 'rgba(167,139,250,0.4)' },
      ];
      const p = palettes[idx % palettes.length];
      return {
        id: d.deliverer_id || String(idx),
        name,
        initials: init,
        reviews: 0,
        rating: 5.0,
        lastOrderAmount: `${Number(d.lastOrderAmount || 0).toLocaleString()} DZD`,
        lastOrderDate: (d.lastOrderDate || '').slice(0, 10) || '—',
        tags: ['Express'],
        ...p,
      };
    });
  }, [deliverers]);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        const res = await http.get('/client/deliverers/history');
        const list = res?.data?.deliverers ?? res?.data?.data?.deliverers ?? [];
        if (!alive) return;
        setDeliverers(list);
      } catch {
        if (alive) setDeliverers([]);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  return (
    <div style={{ minHeight:'100%', background:'linear-gradient(180deg,#071828 0%,#08172a 100%)', padding:'32px 40px', animation:'cdFadeUp .3s ease both' }}>

      <button onClick={onBack}
        style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', color:'rgba(255,255,255,0.55)', fontSize:12, fontWeight:700, cursor:'pointer', padding:0, marginBottom:32, letterSpacing:'0.08em', fontFamily:"'DM Sans',system-ui,sans-serif", transition:'color .15s' }}
        onMouseEnter={e => e.currentTarget.style.color='white'}
        onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.55)'}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        RETURN TO DASHBOARD
      </button>

      <div style={{ textAlign:'center', marginBottom:32 }}>
        <p style={{ margin:'0 auto', maxWidth:460, fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.65, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
          Review your recent interactions and quickly re-book your favorite Deliverers.
        </p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:14, maxWidth:680, margin:'0 auto' }}>
        {loading ? (
          <div style={{ textAlign:'center', color:'rgba(255,255,255,0.45)', fontSize:12, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
            Loading deliverers…
          </div>
        ) : mapped.length === 0 ? (
          <div style={{ textAlign:'center', color:'rgba(255,255,255,0.45)', fontSize:12, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
            No deliverer history yet.
          </div>
        ) : mapped.map((d, idx) => (
          <div key={d.id}
            style={{ background:'linear-gradient(135deg,rgba(13,42,74,0.9),rgba(9,28,52,0.9))', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, padding:'18px 20px', display:'grid', gridTemplateColumns:'auto 1fr auto', alignItems:'center', gap:16, animation:`cdFadeUp .3s ease ${idx*0.08}s both`, transition:'border-color .2s, transform .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(59,130,246,0.3)'; e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.transform='translateY(0)'; }}>

            {/* Avatar */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{ width:58, height:58, borderRadius:'50%', background:d.avatarColor, border:`2.5px solid ${d.avatarBorder}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'white', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{d.initials}</div>
              <div style={{ position:'absolute', bottom:-2, right:-2, background:'#1a3a1a', border:'1.5px solid rgba(74,222,128,0.5)', borderRadius:8, padding:'1px 5px', display:'flex', alignItems:'center', gap:3 }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="#4ade80"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span style={{ fontSize:9, fontWeight:700, color:'#4ade80', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{d.rating.toFixed(1)}</span>
              </div>
            </div>

            {/* Info */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>{d.name}</h3>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,.35)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{d.reviews} Reviews</span>
                </div>
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {d.tags.map(tag => {
                  const ts = TAG_STYLE[tag] || TAG_STYLE.Express;
                  return <span key={tag} style={{ fontSize:10, fontWeight:600, letterSpacing:'0.05em', padding:'3px 9px', borderRadius:6, background:ts.bg, border:`1px solid ${ts.border}`, color:ts.color, fontFamily:"'DM Sans',system-ui,sans-serif" }}>{tag}</span>;
                })}
              </div>
            </div>

            {/* Last order + actions */}
            <div style={{ display:'flex', gap:20, alignItems:'center', flexShrink:0 }}>
              <div style={{ textAlign:'right' }}>
                <p style={{ margin:'0 0 2px', fontSize:9, fontWeight:700, color:'rgba(255,255,255,.3)', letterSpacing:'0.1em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>LAST ORDER</p>
                <p style={{ margin:'0 0 1px', fontSize:15, fontWeight:800, color:'white', fontFamily:"'Outfit',system-ui,sans-serif", lineHeight:1.2 }}>{d.lastOrderAmount}</p>
                <p style={{ margin:0, fontSize:10, color:'rgba(255,255,255,.35)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{d.lastOrderDate}</p>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                {/* ✅ Re-order Service → starts new delivery flow */}
                <button
                  onClick={() => onNewDelivery?.()}
                  style={{ background:'linear-gradient(135deg,#3b82f6,#2563eb)', border:'none', borderRadius:9, padding:'9px 18px', fontSize:12, fontWeight:700, color:'white', cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif", letterSpacing:'0.03em', whiteSpace:'nowrap', transition:'opacity .15s, transform .15s', boxShadow:'0 2px 12px rgba(59,130,246,0.35)' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity='0.85'; e.currentTarget.style.transform='translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)'; }}>
                  Re-order Service
                </button>

                <button
                  onClick={() => setChatTarget(d)}
                  style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:9, padding:'8px 18px', fontSize:12, fontWeight:600, color:'rgba(255,255,255,.65)', cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif", whiteSpace:'nowrap', transition:'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(255,255,255,.65)'; }}>
                  View Old Chat
                </button>

                <button
                  onClick={() => setReviewTarget(d)}
                  style={{ background:'none', border:'none', padding:'4px 0', fontSize:11, fontWeight:600, color:'rgba(255,255,255,.3)', cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif", textAlign:'center', transition:'color .15s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#fbbf24'}
                  onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.3)'}>
                  Review Deliverer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reviewTarget && <ReviewModal    deliverer={reviewTarget} onClose={() => setReviewTarget(null)}/>}
      {chatTarget   && <TrackChatPanel deliverer={chatTarget}   onClose={() => setChatTarget(null)}/>}
    </div>
  );
}