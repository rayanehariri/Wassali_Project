// ═══════════════════════════════════════════════════════════
// PageTrack.jsx — Track Delivery
// Removed: top-left "Recent Deliverers" and "Chat" buttons
// DelivererHistory accessible via sidebar "View History" link
// ═══════════════════════════════════════════════════════════
import { useRef, useEffect, useState } from 'react';
import { ORDERS, Badge, TopBar } from './Shared';

import DelivererHistory from './track/DelivererHistory';
import TrackChatPanel   from './track/TrackChatPanel';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function LeafletMap({ order }) {
  const mapRef = useRef(null);
  const mapObj = useRef(null);

  useEffect(() => {
    function ensureLeaflet(cb) {
      if (window.L) { cb(); return; }
      if (!document.querySelector('#leaflet-css')) {
        const link = document.createElement('link');
        link.id='leaflet-css'; link.rel='stylesheet';
        link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      const script = document.createElement('script');
      script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload=cb; document.head.appendChild(script);
    }

    ensureLeaflet(() => {
      if (!mapRef.current || mapObj.current) return;
      const L = window.L;
      const map = L.map(mapRef.current, { center:[36.737,3.086], zoom:12, zoomControl:false, attributionControl:false });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom:19 }).addTo(map);
      L.control.zoom({ position:'topleft' }).addTo(map);
      mapObj.current = map;

      if (order) {
        const mk = (color, glow) => L.divIcon({
          className:'',
          html:`<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid #0e3a4a;${glow?`box-shadow:0 0 10px ${glow}`:''}"></div>`,
          iconSize:[14,14], iconAnchor:[7,7],
        });
        const pickup  = [order.lat+0.02, order.lng-0.03];
        const dest    = [order.lat-0.01, order.lng+0.04];
        const courier = [order.lat+0.005, order.lng+0.01];

        L.marker(pickup,  { icon:mk('#4ade80','rgba(74,222,128,.8)')  }).addTo(map).bindPopup(`<b>Pickup:</b> ${escapeHtml(order.from)}`);
        L.marker(dest,    { icon:mk('#f87171')                         }).addTo(map).bindPopup(`<b>Destination:</b> ${escapeHtml(order.to)}`);
        L.marker(courier, { icon:mk('#3b82f6','rgba(59,130,246,.9)') }).addTo(map).bindPopup(`<b>Courier:</b> ${escapeHtml(order.courier)}`);
        L.polyline([pickup,courier,dest], { color:'#3b82f6', weight:3, opacity:0.7, dashArray:'8 5' }).addTo(map);
        map.fitBounds([pickup,dest], { padding:[50,50] });
      }
    });

    return () => { if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; } };
  }, []);

  return <div ref={mapRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:1 }}/>;
}

export default function PageTrack({ onNewDelivery, onSettings, startPanel = null, setActive, addToast, currentUser }) {
  const order = ORDERS.find(o => o.status === 'in_transit');
  const [panel, setPanel] = useState(null); // null | 'history' | 'chat'
  useEffect(() => {
    if (startPanel) setPanel(startPanel);
  }, [startPanel]);

  if (panel === 'history') {
    return <DelivererHistory onBack={() => setPanel(null)} onNewDelivery={onNewDelivery}/>;
  }

  return (
    <div style={{ animation:'cdFadeUp .3s ease both', display:'flex', flexDirection:'column', height:'100%' }}>
      <TopBar placeholder="Search deliveries, tracking IDs..." onSettings={onSettings} setActive={setActive} addToast={addToast} currentUser={currentUser} />

      <div style={{ position:'relative', flex:1, minHeight:'calc(100vh - 57px)', overflow:'hidden' }}>
        <LeafletMap order={order}/>

        {/* Distance badge — top right only */}
        <div style={{ position:'absolute', top:16, right:16, zIndex:999, display:'flex', alignItems:'center', gap:6, background:'rgba(11,30,56,.92)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'6px 12px' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span style={{ fontSize:11, color:'rgba(255,255,255,.45)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>DISTANCE</span>
          <span style={{ fontSize:12, fontWeight:700, color:'white', fontFamily:"'DM Sans',system-ui,sans-serif" }}>3.2 km</span>
        </div>

        {/* Delivery info card */}
        {order && (
          <div className="cd-track-floating-card" style={{ background:'rgba(9,22,42,.96)', border:'1px solid rgba(255,255,255,.1)', borderRadius:18, backdropFilter:'blur(8px)', padding:16 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <Badge status="in_transit"/>
              <div style={{ textAlign:'right' }}>
                <p style={{ margin:'0 0 2px', fontSize:9, color:'rgba(255,255,255,.3)', letterSpacing:'0.1em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>ETA</p>
                <p style={{ margin:0, fontSize:22, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif", lineHeight:1 }}>{order.eta}</p>
              </div>
            </div>
            <h3 style={{ margin:'0 0 2px', fontSize:15, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>{order.title}</h3>
            <p style={{ margin:'0 0 12px', fontSize:10, color:'rgba(255,255,255,.35)', fontFamily:"'JetBrains Mono',monospace" }}>Order {order.id}</p>

            <div style={{ height:8, background:'rgba(255,255,255,.1)', borderRadius:9999, marginBottom:12, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${order.pct}%`, background:'linear-gradient(90deg,#4EDEA3,#ADC6FF)', borderRadius:9999 }}/>
            </div>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'#1a3a5a', border:'1px solid rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'white', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{order.av}</div>
                <div>
                  <p style={{ margin:'0 0 2px', fontSize:9, color:'rgba(255,255,255,.25)', letterSpacing:'0.1em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>YOUR COURIER</p>
                  <p style={{ margin:0, fontSize:12, fontWeight:600, color:'white', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{order.courier}</p>
                </div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {[
                  { icon:<svg key="c" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.77-.77a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17.4v.52z"/></svg>, fn:null, label:'Call coming soon' },
                  { icon:<svg key="m" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, fn:() => setPanel('chat') },
                ].map((b,i) => (
                  <button key={i} onClick={b.fn || undefined} disabled={!b.fn} title={b.label || ''}
                    style={{ width:28, height:28, borderRadius:8, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.45)', cursor:b.fn ? 'pointer' : 'not-allowed', transition:'all .15s', opacity:b.fn ? 1 : 0.55 }}
                    onMouseEnter={e => { if (b.fn) { e.currentTarget.style.background='rgba(59,130,246,0.15)'; e.currentTarget.style.color='#60a5fa'; }}}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.06)'; e.currentTarget.style.color='rgba(255,255,255,.45)'; }}>
                    {b.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Pickup / Dropoff */}
            {[{ dot:'rgba(255,255,255,.4)', label:'PICKUP', val:order.from },{ dot:'#3b82f6', label:'DROPOFF', val:order.to }].map(r => (
              <div key={r.label} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:6 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:r.dot, marginTop:4, flexShrink:0 }}/>
                <div>
                  <p style={{ margin:'0 0 1px', fontSize:9, color:'rgba(255,255,255,.25)', letterSpacing:'0.1em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{r.label}</p>
                  <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,.65)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{r.val}</p>
                </div>
              </div>
            ))}

            {/* View Deliverer History link */}
            <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid rgba(255,255,255,.06)' }}>
              <button
                onClick={() => setPanel('history')}
                style={{ background:'none', border:'none', fontSize:11, color:'#60a5fa', cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif", display:'flex', alignItems:'center', gap:5, padding:0, width:'100%', justifyContent:'center' }}
                onMouseEnter={e => e.currentTarget.style.opacity='0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                View Deliverer History
              </button>
            </div>
          </div>
        )}
      </div>

      {panel === 'chat' && <TrackChatPanel onClose={() => setPanel(null)}/>}
    </div>
  );
}