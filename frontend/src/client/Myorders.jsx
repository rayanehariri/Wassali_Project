// ═══════════════════════════════════════════════════════════
// PageHome.jsx — My Orders
// ═══════════════════════════════════════════════════════════
import { useEffect, useMemo, useState } from 'react';
import { Badge, CatIcon, TopBar, CityBanner } from './Shared';
import { http } from '../api/http';

const ALGIERS_IMG = null;

const CAT_COLORS = {
  PHARMACY:  { icon:'rgba(96,165,250,1)',  bg:'rgba(96,165,250,0.12)',  border:'rgba(96,165,250,0.2)'  },
  GROCERIES: { icon:'rgba(74,222,128,1)',  bg:'rgba(74,222,128,0.12)', border:'rgba(74,222,128,0.2)'  },
  PACKAGES:  { icon:'rgba(167,139,250,1)', bg:'rgba(167,139,250,0.12)',border:'rgba(167,139,250,0.2)' },
};

export default function PageHome({ currentUser, setActive, addToast, onNewDelivery, onSettings, isOnline, onToggleOnline }) {
  const [liveActive, setLiveActive] = useState(null);
  const [recentLive, setRecentLive] = useState([]);
  const active = liveActive;
  const recent = recentLive;
  const firstName = currentUser?.name?.split(' ')[0] || currentUser?.username || 'there';
  const hasRecent = recent.length > 0;

  const clientId = useMemo(
    () => currentUser?._id ?? currentUser?.id ?? currentUser?.client_id ?? null,
    [currentUser],
  );

  useEffect(() => {
    let alive = true;
    async function loadActive() {
      try {
        const res = await http.get('/client/deliveries/active');
        const d = res?.data?.delivery ?? res?.data?.data?.delivery ?? null;
        if (!alive || !d) {
          if (alive) setLiveActive(null);
          return;
        }
        const st = String(d.status || '').toLowerCase();
        const isDelivered = st === 'delivered';
        const liveStatus =
          st === 'delivered' ? 'completed' :
          st === 'cancelled' ? 'cancelled' :
          st === 'accepted' ? 'accepted' :
          'in_transit';
        setLiveActive({
          id: `#${String(d._id || '').slice(0, 8)}`,
          status: liveStatus,
          cat: 'PACKAGES',
          title: d.description_of_order || 'Delivery',
          sub: `${d.pickup_address || 'Pickup'} -> ${d.dropoff_address || 'Dropoff'}`,
          amount: `${Number(d.price || 0).toLocaleString()} DZD`,
          date: 'Now',
          courier: d.deliverer_name || 'Deliverer',
          av: (d.deliverer_name || 'DL').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
          eta: isDelivered ? 'Delivered' : 'Live',
          pct: isDelivered ? 100 : 72,
          from: d.pickup_address || 'Pickup',
          to: d.dropoff_address || 'Dropoff',
        });
      } catch {
        if (alive) setLiveActive(null);
      }
    }
    loadActive();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    async function loadRecent() {
      if (!clientId) return;
      try {
        const res = await http.get(`/client/deliveries/${clientId}`);
        const deliveries = res?.data?.deliveries ?? res?.data?.data?.deliveries ?? [];
        const mapped = (deliveries || [])
          .slice(0, 3)
          .map((d) => {
            const statusRaw = String(d.status || '').toLowerCase();
            let badgeStatus = 'active';
            let badgeLabel = null;
            if (statusRaw === 'delivered') {
              badgeStatus = 'completed';
              badgeLabel = 'DELIVERED';
            } else if (statusRaw === 'cancelled' || statusRaw === 'rejected') {
              badgeStatus = 'cancelled';
              badgeLabel = 'CANCELLED';
            } else if (statusRaw === 'in_transit') {
              badgeStatus = 'in_transit';
              badgeLabel = 'IN TRANSIT';
            } else if (statusRaw === 'accepted') {
              badgeStatus = 'accepted';
              badgeLabel = 'ACCEPTED';
            } else {
              badgeStatus = 'in_transit';
              badgeLabel = 'PENDING';
            }
            const courier = d.deliverer_name || '—';
            return {
              id: `#${String(d._id || '').slice(0, 8)}`,
              status: badgeStatus,
              badgeLabel,
              cat: 'PACKAGES',
              title: d.description_of_order || 'Delivery',
              sub: `${d.pickup_address || 'Pickup'} -> ${d.dropoff_address || 'Dropoff'}`,
              amount: `${Number(d.price || 0).toLocaleString()} DZD`,
              date: d.created_at ? String(d.created_at).slice(0, 10) : '—',
              courier,
              av: courier === '—' ? '—' : courier.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
              eta: null,
              pct: badgeStatus === 'completed' ? 100 : badgeStatus === 'in_transit' ? 72 : badgeStatus === 'accepted' ? 35 : 0,
              from: d.pickup_address || 'Pickup',
              to: d.dropoff_address || 'Dropoff',
            };
          });
        if (!alive) return;
        setRecentLive(mapped);
      } catch {
        if (alive) setRecentLive([]);
      }
    }
    loadRecent();
    const t = setInterval(loadRecent, 3000);
    return () => { alive = false; clearInterval(t); };
  }, [clientId]);

  return (
    <div style={{ animation:'cdFadeUp .3s ease both' }}>
      <TopBar
        onSettings={onSettings}
        setActive={setActive}
        addToast={addToast}
        currentUser={currentUser}
        showOnline
        isOnline={isOnline}
        onToggleOnline={onToggleOnline}
      />
      <div className="cd-page-wrap">
        <div className="cd-home-top-row">
          <div>
            <h1 style={{ margin:'0 0 6px', fontSize:26, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif", display:'flex', alignItems:'center', gap:10 }}>
              Hello, {firstName}!
             
            </h1>
            <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,.5)', maxWidth:420, lineHeight:1.6, fontFamily:"'DM Sans',system-ui,sans-serif" }}>Your Dashboard for precise tracking across the vibrant streets of Algiers and beyond.</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {[
              { label:'NEW',   fn: onNewDelivery || (() => addToast?.('info','New Delivery','Coming soon!')), icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> },
              { label:'TRACK', fn:() => setActive('track'), icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
            ].map(b => (
              <button key={b.label} onClick={b.fn} className="cd-btn-outline" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, width:58, height:58, borderRadius:12, background:'#112040', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.45)', cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:9, fontWeight:700, letterSpacing:'0.12em' }}>
                {b.icon}{b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cd-two-col-grid">
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {active ? (
              <div style={{ borderRadius:18, background:'linear-gradient(135deg,#0d2a4a,#0a1e38)', border:'1px solid rgba(59,130,246,.25)', padding:20 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                  <div>
                    <Badge status={active.status} />
                    <h2 style={{ margin:'8px 0 3px', fontSize:19, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>{active.title}</h2>
                    <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,.4)', fontFamily:"'JetBrains Mono',monospace" }}>Order {active.id}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ margin:'0 0 4px', fontSize:10, fontWeight:700, color:'rgba(255,255,255,.35)', letterSpacing:'0.12em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>ESTIMATED ARRIVAL</p>
                    <p style={{ margin:0, fontSize:34, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif", lineHeight:1 }}>{active.eta}</p>
                  </div>
                </div>
                <div style={{ position:'relative', marginBottom:20 }}>
                  <div style={{ width:'100%', height:8, background:'rgba(255,255,255,.08)', borderRadius:9999, overflow:'visible', position:'relative' }}>
                    <div style={{ position:'absolute', top:0, left:0, height:'100%', width:`${active.pct}%`, borderRadius:9999, background:'linear-gradient(90deg,#4EDEA3,#ADC6FF)', transition:'width 1s ease' }}/>
                    <div style={{ position:'absolute', top:'50%', left:`${active.pct}%`, transform:'translate(-50%,-50%)', width:18, height:18, borderRadius:'50%', background:'linear-gradient(135deg,#4EDEA3,#ADC6FF)', border:'2.5px solid #0d2a4a', boxShadow:'0 0 14px rgba(78,222,163,.75)', animation:'cdDotPulse 2s infinite', zIndex:2 }}/>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'white', background:'linear-gradient(135deg,#1a4a6a,#0d2a4a)', border:'1px solid rgba(255,255,255,.15)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{active.av}</div>
                    <div>
                      <p style={{ margin:'0 0 2px', fontSize:9, fontWeight:700, color:'rgba(255,255,255,.3)', letterSpacing:'0.12em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>YOUR COURIER</p>
                      <p style={{ margin:0, fontSize:13, fontWeight:600, color:'white', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{active.courier}</p>
                    </div>
                  </div>
                  <button onClick={() => setActive('track')} className="cd-track-btn" style={{ display:'flex', alignItems:'center', gap:8, background:'#112040', border:'1px solid rgba(59,130,246,.35)', borderRadius:12, padding:'10px 16px', color:'#60a5fa', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    Track on Map
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ borderRadius:18, background:'linear-gradient(135deg,#0d2a4a,#0a1e38)', border:'1px solid rgba(59,130,246,.18)', padding:20 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                  <div>
                    <Badge status="in_transit" label="NO REQUEST"/>
                    <h2 style={{ margin:'8px 0 3px', fontSize:19, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>No active delivery</h2>
                    <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,.4)', fontFamily:"'JetBrains Mono',monospace" }}>Timeline starts when you create your first request</p>
                  </div>
                  <p style={{ margin:0, fontSize:24, fontWeight:700, color:'rgba(255,255,255,.4)', fontFamily:"'Outfit',system-ui,sans-serif" }}>—</p>
                </div>
                <div style={{ width:'100%', height:8, background:'rgba(255,255,255,.08)', borderRadius:9999, marginBottom:14 }}>
                  <div style={{ width:'0%', height:'100%', borderRadius:9999, background:'linear-gradient(90deg,#4EDEA3,#ADC6FF)' }}/>
                </div>
                <button onClick={() => onNewDelivery?.()} className="cd-track-btn" style={{ display:'flex', alignItems:'center', gap:8, background:'#112040', border:'1px solid rgba(59,130,246,.35)', borderRadius:12, padding:'10px 16px', color:'#60a5fa', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                  Create first request
                </button>
              </div>
            )}

            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Recent Observations</h3>
                {/* ✅ "View Recent Deliverers" → navigates to Track page which shows history */}
                <button
                  onClick={() => setActive('deliverer-history')}
                  style={{ background:'none', border:'none', fontSize:12, color:'#ADC6FF', cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif", display:'flex', alignItems:'center', gap:5, transition:'opacity .15s', opacity:0.85 }}
                  onMouseEnter={e => e.currentTarget.style.opacity='1'}
                  onMouseLeave={e => e.currentTarget.style.opacity='0.85'}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  View Recent Deliverers →
                </button>
              </div>
              <div className="cd-recent-grid">
                {(hasRecent ? recent : [{
                  id: 'empty-recent',
                  status: 'completed',
                  cat: 'PACKAGES',
                  title: 'No requests yet',
                  sub: 'Your completed deliveries will appear here.',
                  amount: '0 DZD',
                  date: '—',
                }]).map((o, i) => {
                  const cc = CAT_COLORS[o.cat] || CAT_COLORS.PACKAGES;
                  return (
                    <div key={o.id} className="cd-order-hover" style={{ background:'rgba(45,52,73,0.6)', border:'1px solid rgba(255,255,255,.07)', borderRadius:14, padding:14, cursor:'pointer', backdropFilter:'blur(4px)', animation:`cdFadeUp .3s ease ${i*.07+.15}s both` }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                        <div style={{ width:30, height:30, borderRadius:9, background:cc.bg, border:`1px solid ${cc.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <CatIcon cat={o.cat} size={14} color={cc.icon}/>
                        </div>
                        <div>
                          <p style={{ margin:'0 0 1px', fontSize:9, fontWeight:700, color:'rgba(255,255,255,.35)', letterSpacing:'0.1em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{o.cat}</p>
                          <p style={{ margin:0, fontSize:9, color:'rgba(255,255,255,.25)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{o.date}</p>
                        </div>
                      </div>
                      <p style={{ margin:'0 0 2px', fontSize:13, fontWeight:600, color:'white', fontFamily:"'Outfit',system-ui,sans-serif", lineHeight:1.3 }}>{o.title}</p>
                      <p style={{ margin:'0 0 10px', fontSize:11, color:'rgba(255,255,255,.45)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{o.sub}</p>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <span style={{ fontSize:11, color:'rgba(255,255,255,.6)', fontFamily:"'JetBrains Mono',monospace" }}>{o.amount}</span>
                        {hasRecent ? <Badge status={o.status} label={o.badgeLabel || undefined} /> : <Badge status="in_transit" label="NO ITEM" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ borderRadius:18, padding:22, background:'linear-gradient(145deg,#0e2444,#091830)', border:'1px solid rgba(59,130,246,.2)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:14 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8L2 7h20l-6-4z"/></svg>
                <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.35)', letterSpacing:'0.12em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>WASSALI WALLET</span>
              </div>
              <p style={{ margin:'0 0 2px', fontSize:12, color:'rgba(255,255,255,.45)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>Current Balance</p>
              <div style={{ display:'flex', alignItems:'flex-end', gap:6, marginBottom:16 }}>
                <span style={{ fontSize:28, fontWeight:700, color:'white', lineHeight:1, fontFamily:"'Outfit',system-ui,sans-serif" }}>12.450,00</span>
                <span style={{ fontSize:13, color:'rgba(255,255,255,.4)', marginBottom:2, fontFamily:"'DM Sans',system-ui,sans-serif" }}>DZD</span>
              </div>
              <button onClick={() => setActive('wallet')} className="cd-primary-btn" style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, border:'none', borderRadius:12, padding:'11px 0', color:'#1e3a5f', fontSize:13, fontWeight:600, cursor:'pointer', background:'#ADC6FF', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Balance
              </button>
            </div>
          </div>
        </div>

        <CityBanner title="Powered by Algerian Excellence" desc="Wassali Velocity utilizes advanced geospatial data and local logistical intelligence to navigate the unique urban architecture of Algerian cities, ensuring precision at every turn." location="ALGIERS HQ" image={ALGIERS_IMG}/>
      </div>
    </div>
  );
}