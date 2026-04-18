// ═══════════════════════════════════════════════════════════
// ChooseDelivererPage.jsx — Select a Deliverer
// Flow: choose deliverer → onNext(deliverer) → CheckoutPage
// Click avatar/name → DelivererProfilePage → Accept Delivery
// ═══════════════════════════════════════════════════════════
import { useState, useRef, useEffect } from 'react';
import DelivererProfilePage from './Delivererprofilepage';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── FAKE API ─────────────────────────────────────────────
async function fakeFetchAvailableDeliverers(deliveryData) {
  await new Promise(r => setTimeout(r, 700));
  return [
    { id:1, name:'Yassine B.', initials:'YB', rating:4.9, reviews:1240, distance:'1.2 KM AWAY', distanceKm:1.2, price:250, cats:['GROCERIES','PHARMACY'],  lat:36.762, lng:3.058, vehicle:'Motorcycle', trips:234 },
    { id:2, name:'Lina M.',    initials:'LM', rating:5.0, reviews:89,   distance:'0.8 KM AWAY', distanceKm:0.8, price:150, cats:['PACKAGES','GROCERIES'],   lat:36.748, lng:3.043, vehicle:'Car',        trips:89  },
    { id:3, name:'Karim D.',   initials:'KD', rating:4.7, reviews:412,  distance:'2.1 KM AWAY', distanceKm:2.1, price:200, cats:['PHARMACY','PACKAGES'],    lat:36.770, lng:3.072, vehicle:'Motorcycle', trips:412 },
    { id:4, name:'Amira S.',   initials:'AS', rating:4.8, reviews:203,  distance:'1.6 KM AWAY', distanceKm:1.6, price:180, cats:['GROCERIES'],              lat:36.742, lng:3.030, vehicle:'Car',        trips:203 },
  ];
}

// ─── LEAFLET MAP ──────────────────────────────────────────
function LeafletMap({ deliverers, selectedId, pickup, dropoff }) {
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    function init() {
      if (!mapRef.current || mapObj.current) return;
      const L = window.L;
      const map = L.map(mapRef.current, { center:[36.755,3.055], zoom:13, zoomControl:false, attributionControl:false });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom:19 }).addTo(map);
      L.control.zoom({ position:'topright' }).addTo(map);
      mapObj.current = map;

      const pickupIcon = L.divIcon({ className:'', html:`<div style="width:14px;height:14px;border-radius:50%;background:#4EDEA3;border:2.5px solid #0e3a4a;box-shadow:0 0 10px rgba(78,222,163,0.8)"></div>`, iconSize:[14,14], iconAnchor:[7,7] });
      L.marker([36.758,3.048], { icon:pickupIcon }).addTo(map).bindPopup(`<b>Pickup:</b> ${escapeHtml(pickup || 'Your location')}`);

      const dropoffIcon = L.divIcon({ className:'', html:`<div style="width:14px;height:14px;border-radius:50%;background:#ADC6FF;border:2.5px solid #0e3a4a;box-shadow:0 0 10px rgba(173,198,255,0.8)"></div>`, iconSize:[14,14], iconAnchor:[7,7] });
      L.marker([36.742,3.068], { icon:dropoffIcon }).addTo(map).bindPopup(`<b>Drop-off:</b> ${escapeHtml(dropoff || 'Destination')}`);
      L.polyline([[36.758,3.048],[36.742,3.068]], { color:'#ADC6FF', weight:2.5, opacity:0.5, dashArray:'8 5' }).addTo(map);
    }

    function ensureLeaflet() {
      if (window.L) { init(); return; }
      if (!document.querySelector('#leaflet-css')) {
        const link = document.createElement('link'); link.id='leaflet-css'; link.rel='stylesheet';
        link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link);
      }
      const script = document.createElement('script');
      script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.onload=init; document.head.appendChild(script);
    }

    ensureLeaflet();
    return () => { if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; } };
  }, []);

  useEffect(() => {
    if (!mapObj.current || !window.L || !deliverers.length) return;
    const L = window.L; const map = mapObj.current;
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    deliverers.forEach(d => {
      const isSelected = d.id === selectedId;
      const icon = L.divIcon({
        className: '',
        html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
          <div style="width:${isSelected?38:32}px;height:${isSelected?38:32}px;border-radius:50%;
            background:${isSelected?'linear-gradient(135deg,#4EDEA3,#ADC6FF)':'rgba(11,30,56,0.95)'};
            border:2px solid ${isSelected?'#4EDEA3':'rgba(173,198,255,0.5)'};
            display:flex;align-items:center;justify-content:center;
            font-size:${isSelected?12:10}px;font-weight:700;color:${isSelected?'#071828':'white'};
            font-family:'DM Sans',sans-serif;box-shadow:0 2px 12px ${isSelected?'rgba(78,222,163,0.6)':'rgba(0,0,0,0.4)'};">
            ${d.initials}
          </div>
          <div style="background:rgba(7,24,40,0.95);border:1px solid rgba(255,255,255,0.12);border-radius:4px;padding:2px 5px;font-size:9px;font-weight:700;color:${isSelected?'#4EDEA3':'rgba(255,255,255,0.7)'};font-family:'DM Sans',sans-serif;white-space:nowrap">
            ${d.price} DZD
          </div>
        </div>`,
        iconSize:[isSelected?38:32,50], iconAnchor:[isSelected?19:16,50],
      });
      const marker = L.marker([d.lat,d.lng], { icon }).addTo(map)
        .bindPopup(`<b>${escapeHtml(d.name)}</b><br/>⭐ ${escapeHtml(d.rating)} · ${escapeHtml(d.distance)}<br/>${escapeHtml(d.price)} DZD`);
      markersRef.current.push(marker);
    });
  }, [deliverers, selectedId]);

  return <div ref={mapRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:1 }}/>;
}

// ─── STAR RATING ──────────────────────────────────────────
function Stars({ rating }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i<=Math.floor(rating)?'#fbbf24':'rgba(255,255,255,0.15)'} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
export default function ChooseDelivererPage({ deliveryData, onNext, onBack }) {
  const [deliverers,   setDeliverers]   = useState([]);
  const [loadingList,  setLoadingList]  = useState(true);
  const [selected,     setSelected]     = useState(null);
  const [confirming,   setConfirming]   = useState(false);
  // null | deliverer object — when set, show profile page
  const [profileView,  setProfileView]  = useState(null);

  useEffect(() => {
    fakeFetchAvailableDeliverers(deliveryData).then(list => {
      setDeliverers(list);
      setLoadingList(false);
    });
  }, []);

  async function handleSelect(d) {
    if (confirming) return;
    setSelected(d.id);
    setConfirming(true);
    await new Promise(r => setTimeout(r, 600));
    setConfirming(false);
    onNext?.(d);
  }

  // Show profile page overlay
  if (profileView) {
    return (
      <DelivererProfilePage
        deliverer={profileView}
        onAccept={(d) => handleSelect(d)}
        onBack={() => setProfileView(null)}
      />
    );
  }

  return (
    <div className="cd-choose-grid">

      {/* ── LEFT — deliverer list ── */}
      <div style={{ background:'#07152a', borderRight:'1px solid rgba(255,255,255,0.06)', padding:'28px 28px', display:'flex', flexDirection:'column', overflowY:'auto' }}>

        {/* Back */}
        <button
          onClick={() => onBack?.()}
          style={{ display:'flex', alignItems:'center', gap:7, background:'none', border:'none', color:'rgba(255,255,255,0.45)', fontSize:12, fontWeight:600, cursor:'pointer', marginBottom:24, padding:0, fontFamily:"'DM Sans',system-ui,sans-serif", letterSpacing:'0.03em', transition:'color .15s' }}
          onMouseEnter={e => e.currentTarget.style.color='#ADC6FF'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.45)'}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Edit Details
        </button>

        <h1 style={{ margin:'0 0 4px', fontSize:26, fontWeight:800, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Select a Deliverer</h1>
        <p style={{ margin:'0 0 22px', fontSize:13, color:'rgba(255,255,255,0.45)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
          {loadingList ? 'Finding partners near you…' : `${deliverers.length} available partners near your location`}
        </p>

        {/* Route summary */}
        {deliveryData?.pickup && (
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'10px 14px', marginBottom:18, display:'flex', alignItems:'center', gap:10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'#4EDEA3', flexShrink:0 }}/>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.6)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{deliveryData.pickup}</span>
              </div>
              <div style={{ width:1, height:8, background:'linear-gradient(180deg,#4EDEA3,#ADC6FF)', marginLeft:3 }}/>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'#ADC6FF', flexShrink:0 }}/>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.6)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{deliveryData.dropoff}</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loadingList && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:18, animation:`cdFadeUp .4s ease ${i*.1}s both` }}>
                <div style={{ display:'flex', gap:12, marginBottom:14 }}>
                  <div style={{ width:46, height:46, borderRadius:'50%', background:'rgba(255,255,255,0.07)', flexShrink:0 }}/>
                  <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8, justifyContent:'center' }}>
                    <div style={{ height:12, borderRadius:6, background:'rgba(255,255,255,0.07)', width:'55%' }}/>
                    <div style={{ height:9, borderRadius:5, background:'rgba(255,255,255,0.05)', width:'75%' }}/>
                  </div>
                  <div style={{ height:14, borderRadius:6, background:'rgba(255,255,255,0.07)', width:60 }}/>
                </div>
                <div style={{ height:36, borderRadius:10, background:'rgba(255,255,255,0.04)' }}/>
              </div>
            ))}
          </div>
        )}

        {/* Deliverer cards */}
        {!loadingList && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {deliverers.map((d, idx) => {
              const isSelected = selected === d.id;
              const isLoading  = isSelected && confirming;
              return (
                <div key={d.id}
                  style={{
                    background: isSelected ? 'rgba(78,222,163,0.06)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isSelected?'rgba(78,222,163,0.3)':'rgba(255,255,255,0.09)'}`,
                    borderRadius: 16, padding: 18, transition: 'all .2s',
                    animation: `cdFadeUp .3s ease ${idx*.07}s both`,
                  }}>

                  {/* Header — avatar is clickable to open profile */}
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                    <div
                      onClick={() => setProfileView(d)}
                      style={{ width:46, height:46, borderRadius:'50%', background:'linear-gradient(135deg,#1a3a5a,#0d2a40)', border:`2px solid ${isSelected?'rgba(78,222,163,0.5)':'rgba(255,255,255,0.12)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'white', fontFamily:"'DM Sans',system-ui,sans-serif", flexShrink:0, transition:'all .2s', cursor:'pointer' }}
                      title="View profile"
                      onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(173,198,255,0.55)'; e.currentTarget.style.boxShadow='0 0 14px rgba(173,198,255,0.25)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor=isSelected?'rgba(78,222,163,0.5)':'rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow='none'; }}>
                      {d.initials}
                    </div>
                    <div style={{ flex:1 }}>
                      {/* Name — also clickable */}
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                        <p
                          onClick={() => setProfileView(d)}
                          style={{ margin:0, fontSize:15, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif", cursor:'pointer', transition:'color .15s' }}
                          onMouseEnter={e => e.currentTarget.style.color='#ADC6FF'}
                          onMouseLeave={e => e.currentTarget.style.color='white'}>
                          {d.name}
                        </p>
                        <span style={{ fontSize:9, fontWeight:700, color:'rgba(173,198,255,0.7)', background:'rgba(173,198,255,0.1)', border:'1px solid rgba(173,198,255,0.2)', borderRadius:4, padding:'1px 6px', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{d.vehicle.toUpperCase()}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <Stars rating={d.rating}/>
                        <span style={{ fontSize:11, fontWeight:700, color:'#fbbf24', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{d.rating}</span>
                        <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>({d.reviews.toLocaleString()})</span>
                        <span style={{ fontSize:11, color:'rgba(255,255,255,0.2)' }}>·</span>
                        <span style={{ fontSize:11, color:'rgba(255,255,255,0.45)', fontFamily:"'DM Sans',system-ui,sans-serif", fontWeight:600 }}>{d.distance}</span>
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ margin:0, fontSize:18, fontWeight:800, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>{d.price}</p>
                      <p style={{ margin:0, fontSize:10, color:'rgba(255,255,255,0.35)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>DZD</p>
                    </div>
                  </div>

                  {/* Categories */}
                  <div style={{ display:'flex', gap:5, marginBottom:12 }}>
                    {d.cats.map(c => (
                      <span key={c} style={{ fontSize:9, fontWeight:700, color:'rgba(173,198,255,0.65)', background:'rgba(173,198,255,0.08)', border:'1px solid rgba(173,198,255,0.18)', borderRadius:5, padding:'2px 8px', letterSpacing:'0.08em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{c}</span>
                    ))}
                    <span style={{ fontSize:9, color:'rgba(255,255,255,0.25)', fontFamily:"'DM Sans',system-ui,sans-serif", marginLeft:'auto', display:'flex', alignItems:'center' }}>{d.trips} trips</span>
                  </div>

                  {/* Action buttons row */}
                  <div style={{ display:'flex', gap:8 }}>
                    {/* View Profile button */}
                    <button
                      onClick={() => setProfileView(d)}
                      style={{
                        flex:1, border:'1px solid rgba(255,255,255,0.12)',
                        borderRadius:10, padding:'9px 0', fontSize:12, fontWeight:600, cursor:'pointer',
                        fontFamily:"'DM Sans',system-ui,sans-serif",
                        background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.5)',
                        transition:'all .2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(173,198,255,0.08)'; e.currentTarget.style.borderColor='rgba(173,198,255,0.3)'; e.currentTarget.style.color='#ADC6FF'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; e.currentTarget.style.color='rgba(255,255,255,0.5)'; }}>
                      View Profile
                    </button>

                    {/* Select button */}
                    <button
                      onClick={() => handleSelect(d)}
                      disabled={confirming}
                      style={{
                        flex:2, border:`1px solid ${isSelected?'rgba(78,222,163,0.4)':'rgba(173,198,255,0.22)'}`,
                        borderRadius:10, padding:'9px 0', fontSize:13, fontWeight:600, cursor:confirming?'not-allowed':'pointer',
                        fontFamily:"'DM Sans',system-ui,sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                        background: isSelected ? 'linear-gradient(135deg,#4EDEA3,#ADC6FF)' : 'rgba(173,198,255,0.07)',
                        color:      isSelected ? '#0a1628' : '#ADC6FF',
                        transition:'all .2s',
                      }}
                      onMouseEnter={e => { if(!isSelected && !confirming) { e.currentTarget.style.background='rgba(173,198,255,0.14)'; e.currentTarget.style.borderColor='rgba(173,198,255,0.4)'; }}}
                      onMouseLeave={e => { if(!isSelected) { e.currentTarget.style.background='rgba(173,198,255,0.07)'; e.currentTarget.style.borderColor='rgba(173,198,255,0.22)'; }}}>
                      {isLoading ? (
                        <span style={{ width:15, height:15, border:'2px solid rgba(10,22,40,0.3)', borderTopColor:'#0a1628', borderRadius:'50%', display:'inline-block', animation:'cdSpin .7s linear infinite' }}/>
                      ) : isSelected ? (
                        <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0a1628" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Selected — Continuing…</>
                      ) : 'Select & Continue'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── RIGHT — map ── */}
      <div style={{ position:'relative' }}>
        <LeafletMap deliverers={deliverers} selectedId={selected} pickup={deliveryData?.pickup} dropoff={deliveryData?.dropoff}/>
        <div style={{ position:'absolute', bottom:20, left:20, zIndex:999, background:'rgba(7,24,40,0.95)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'10px 14px', backdropFilter:'blur(8px)' }}>
          <p style={{ margin:'0 0 8px', fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.1em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>MAP LEGEND</p>
          {[{ color:'#4EDEA3', label:'Pickup point' },{ color:'#ADC6FF', label:'Drop-off point' },{ color:'white', label:'Deliverer' }].map(l => (
            <div key={l.label} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:l.color, flexShrink:0 }}/>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.55)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}