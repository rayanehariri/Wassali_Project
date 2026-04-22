// ═══════════════════════════════════════════════════════════
// DelivererProfilePage.jsx — Deliverer Profile
// Features: real Leaflet map, empty vehicle image slot,
//           smooth animations, Accept Delivery button
// ═══════════════════════════════════════════════════════════
import { useState, useRef, useEffect } from 'react';

// ─── REAL LEAFLET MAP ─────────────────────────────────────
function DelivererMap({ deliverer }) {
  const mapRef = useRef(null);
  const mapObj = useRef(null);

  // Use deliverer lat/lng if available, fallback to Algiers Central
  const lat = deliverer?.lat || 36.737;
  const lng = deliverer?.lng || 3.086;

  useEffect(() => {
    function init() {
      if (!mapRef.current || mapObj.current) return;
      const L = window.L;

      const map = L.map(mapRef.current, {
        center:           [lat, lng],
        zoom:             14,
        zoomControl:      true,
        attributionControl: false,
        dragging:         true,
        scrollWheelZoom:  false,
      });

      // Dark CartoDB tiles — same as rest of app
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Deliverer position marker
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          display:flex;flex-direction:column;align-items:center;
          animation:cdFadeUp .3s ease both;
        ">
          <div style="
            width:20px;height:20px;border-radius:50%;
            background:#4EDEA3;
            border:3px solid #071828;
            box-shadow:0 0 16px rgba(78,222,163,0.8);
          "></div>
          <div style="
            width:0;height:0;
            border-left:5px solid transparent;
            border-right:5px solid transparent;
            border-top:8px solid #4EDEA3;
            margin-top:-1px;
          "></div>
        </div>`,
        iconSize:   [20, 28],
        iconAnchor: [10, 28],
      });

      L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`<b style="font-family:'DM Sans',sans-serif">${deliverer?.name || 'Deliverer'}</b><br/><span style="font-size:11px;color:#888">Algiers Central</span>`)
        .openPopup();

      // Pulse ring
      const pulseIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:60px;height:60px;border-radius:50%;
          background:rgba(78,222,163,0.08);
          border:1.5px solid rgba(78,222,163,0.25);
          animation:cdDotPulse 2s ease-in-out infinite;
        "></div>`,
        iconSize:   [60, 60],
        iconAnchor: [30, 30],
      });
      L.marker([lat, lng], { icon: pulseIcon, zIndexOffset: -1 }).addTo(map);

      mapObj.current = map;
    }

    function ensureLeaflet() {
      if (window.L) { init(); return; }
      if (!document.querySelector('#leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css'; link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = init;
      document.head.appendChild(script);
    }

    ensureLeaflet();
    return () => { if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; } };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }}/>
      {/* Location badge overlay */}
      <div style={{
        position: 'absolute', bottom: 10, left: 10, zIndex: 999,
        background: 'rgba(7,24,40,0.92)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10, padding: '7px 12px',
        display: 'flex', alignItems: 'center', gap: 7,
        backdropFilter: 'blur(8px)',
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4EDEA3" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <div>
          <p style={{ margin: 0, fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Sans',system-ui,sans-serif", letterSpacing: '0.1em' }}>CURRENT LOCATION</p>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'white', fontFamily: "'DM Sans',system-ui,sans-serif" }}>Algiers Central</p>
        </div>
      </div>
    </div>
  );
}

// ─── STAR RATING ──────────────────────────────────────────
function Stars({ rating, size = 13 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= Math.floor(rating) ? '#fbbf24' : 'rgba(255,255,255,0.15)'} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────
function StatCard({ icon, value, label, valColor, bg, delay = '0s' }) {
  return (
    <div style={{
      borderRadius: 14, padding: '18px 16px',
      background: bg || 'linear-gradient(145deg,#0e2040,#091830)',
      border: '1px solid rgba(255,255,255,0.07)',
      animation: `cdFadeUp .35s ease ${delay} both`,
      transition: 'transform .2s, border-color .2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.14)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}>
      <div style={{ marginBottom: 10 }}>{icon}</div>
      <p style={{ margin: '0 0 3px', fontSize: 22, fontWeight: 800, color: valColor || 'white', fontFamily: "'Outfit',system-ui,sans-serif", lineHeight: 1 }}>{value}</p>
      <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', fontFamily: "'DM Sans',system-ui,sans-serif" }}>{label}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
export default function DelivererProfilePage({ deliverer, onAccept, onBack }) {
  const [accepting, setAccepting] = useState(false);
  const [visible,   setVisible]   = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  if (!deliverer) return null;
  const d = deliverer;

  async function handleAccept() {
    if (accepting) return;
    setAccepting(true);
    try {
      await new Promise((r) => setTimeout(r, 280));
      await onAccept?.(d);
    } finally {
      setAccepting(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060c18',
      fontFamily: "'DM Sans',system-ui,sans-serif",
      opacity:    visible ? 1 : 0,
      transform:  visible ? 'translateY(0)' : 'translateY(10px)',
      transition: 'opacity .4s ease, transform .4s ease',
    }}>

      {/* ── Sticky top bar ── */}
      <div style={{
        background: 'rgba(6,12,24,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 28px', position: 'sticky', top: 0, zIndex: 20,
      }}>
        <button onClick={onBack}
          style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', color:'rgba(255,255,255,0.55)', fontSize:12, fontWeight:700, cursor:'pointer', padding:0, letterSpacing:'0.08em', transition:'color .15s' }}
          onMouseEnter={e => e.currentTarget.style.color='white'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.55)'}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          RETURN TO DASHBOARD
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(173,198,255,0.06)', border:'1px solid rgba(173,198,255,0.15)', borderRadius:20, padding:'4px 12px' }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 6px #4ade80' }}/>
          <span style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.5)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>Deliverer Profile</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="cd-deliverer-profile-grid">

        {/* ══ LEFT COLUMN ══ */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Avatar card */}
          <div style={{
            background: 'linear-gradient(145deg,#0d2040,#091830)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 20, padding: '28px 20px 22px',
            display: 'flex', flexDirection:'column', alignItems:'center', textAlign:'center',
            animation: 'cdFadeUp .35s ease both',
          }}>
            {/* Avatar */}
            <div style={{ position:'relative', marginBottom:14 }}>
              <div style={{
                width:100, height:100, borderRadius:'50%',
                background:'linear-gradient(135deg,#ADC6FF,#7aa8f5)',
                border:'3px solid rgba(173,198,255,0.4)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:30, fontWeight:800, color:'#0a1628',
                fontFamily:"'Outfit',system-ui,sans-serif",
                boxShadow:'0 0 32px rgba(173,198,255,0.2)',
              }}>
                {d.initials}
              </div>
              {/* Online dot */}
              <div style={{ position:'absolute', bottom:4, right:4, width:18, height:18, borderRadius:'50%', background:'#4ade80', border:'2.5px solid #091830', boxShadow:'0 0 10px rgba(74,222,128,0.7)' }}/>
            </div>

            <h2 style={{ margin:'0 0 4px', fontSize:21, fontWeight:800, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>{d.name.replace('.','')}</h2>
            <p style={{ margin:'0 0 6px', fontSize:10, fontWeight:700, color:'#ADC6FF', letterSpacing:'0.14em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>MASTER DELIVERER</p>

            {/* Stars */}
            <div style={{ display:'flex', alignItems:'center', gap:6, justifyContent:'center', marginBottom:14 }}>
              <Stars rating={d.rating}/>
              <span style={{ fontSize:12, fontWeight:700, color:'#fbbf24' }}>{d.rating}</span>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>({d.reviews.toLocaleString()})</span>
            </div>

            {/* Category tags */}
            <div style={{ display:'flex', gap:6, justifyContent:'center', flexWrap:'wrap', marginBottom:20 }}>
              {(d.cats || ['GROCERIES','PHARMACY']).map(tag => (
                <span key={tag} style={{ fontSize:9, fontWeight:700, color:'rgba(173,198,255,0.75)', background:'rgba(173,198,255,0.1)', border:'1px solid rgba(173,198,255,0.2)', borderRadius:5, padding:'2px 8px', fontFamily:"'DM Sans',system-ui,sans-serif", letterSpacing:'0.06em' }}>{tag}</span>
              ))}
            </div>

            {/* Year + Incident badges */}
            <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:22 }}>
              <span style={{ fontSize:10, fontWeight:700, color:'#ADC6FF', background:'rgba(173,198,255,0.1)', border:'1px solid rgba(173,198,255,0.22)', borderRadius:6, padding:'3px 10px', fontFamily:"'DM Sans',system-ui,sans-serif" }}>3+ Years</span>
              <span style={{ fontSize:10, fontWeight:700, color:'#4ade80', background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.22)', borderRadius:6, padding:'3px 10px', fontFamily:"'DM Sans',system-ui,sans-serif" }}>0 Incidents</span>
            </div>

            {/* Accept Delivery */}
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="cd-primary-btn"
              style={{ width:'100%', border:'none', borderRadius:13, padding:'13px 0', fontSize:14, fontWeight:700, cursor:accepting?'not-allowed':'pointer', background:'linear-gradient(135deg,#ADC6FF,#7aa8f5)', color:'#0a1628', fontFamily:"'DM Sans',system-ui,sans-serif", letterSpacing:'0.04em', display:'flex', alignItems:'center', justifyContent:'center', gap:9, opacity:accepting?0.75:1, transition:'all .2s', boxShadow:'0 4px 20px rgba(173,198,255,0.25)' }}
              onMouseEnter={e => { if(!accepting){ e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 28px rgba(173,198,255,0.35)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(173,198,255,0.25)'; }}>
              {accepting ? (
                <span style={{ width:16, height:16, border:'2px solid rgba(10,22,40,0.3)', borderTopColor:'#0a1628', borderRadius:'50%', display:'inline-block', animation:'cdSpin .7s linear infinite' }}/>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0a1628" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Accept Delivery
                </>
              )}
            </button>
          </div>

          {/* Personal Identification */}
          <div style={{ background:'#0b1d33', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:18, animation:'cdFadeUp .35s ease 0.1s both' }}>
            <p style={{ margin:'0 0 14px', fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'0.14em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>PERSONAL IDENTIFICATION</p>

            <div style={{ marginBottom:10 }}>
              <p style={{ margin:'0 0 3px', fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.25)', letterSpacing:'0.1em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>FULL NAME</p>
              <p style={{ margin:0, fontSize:14, fontWeight:600, color:'white', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{d.name.replace('.','').trim()} N.</p>
            </div>

            <div style={{ marginBottom:14 }}>
              <p style={{ margin:'0 0 3px', fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.25)', letterSpacing:'0.1em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>DELIVERER ID</p>
              <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#ADC6FF', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.05em' }}>DZ-2022-{d.initials}N-{(d.id||1)*7+35}</p>
            </div>

            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'14px 16px', display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <p style={{ margin:0, fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.2)', letterSpacing:'0.1em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>CONFIDENTIAL IDENTITY</p>
            </div>
          </div>
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Stats row */}
          <div className="cd-deliverer-inner-3">
            <StatCard delay="0s"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
              value={d.rating?.toFixed(1)} label={`${(d.reviews||0).toLocaleString()} REVIEWS`}
              valColor="#fbbf24" bg="linear-gradient(145deg,#1a2a40,#0e1c30)"/>
            <StatCard delay="0.07s"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ADC6FF" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8L2 7h20l-6-4z"/></svg>}
              value={(d.trips||d.reviews||0).toLocaleString()} label="TOTAL DELIVERIES"
              bg="linear-gradient(145deg,#0e2040,#091830)"/>
            <StatCard delay="0.14s"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
              value="Excellent" label="SAFETY RECORD"
              valColor="#4ade80" bg="linear-gradient(145deg,#0a2a1a,#061810)"/>
          </div>

          {/* Vehicle + Map row */}
          <div className="cd-deliverer-inner-2">

            {/* Assigned Vehicle */}
            <div style={{ background:'#0b1d33', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:18, animation:'cdFadeUp .35s ease 0.18s both' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <p style={{ margin:0, fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'0.12em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>ASSIGNED VEHICLE</p>
                <span style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.3)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.06em' }}>
                  {`0${(d.id||1)*4+1}552-120-${(d.id||1)*3+10}`}
                </span>
              </div>

              {/* Empty vehicle image slot — replace with real photo */}
              <div style={{
                borderRadius:12, overflow:'hidden', marginBottom:14,
                border:'1.5px dashed rgba(173,198,255,0.2)',
                height:110,
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8,
                background:'rgba(173,198,255,0.03)',
                cursor:'pointer', transition:'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(173,198,255,0.4)'; e.currentTarget.style.background='rgba(173,198,255,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(173,198,255,0.2)'; e.currentTarget.style.background='rgba(173,198,255,0.03)'; }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(173,198,255,0.3)" strokeWidth="1.2">
                  <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                <p style={{ margin:0, fontSize:10, color:'rgba(255,255,255,0.25)', fontFamily:"'DM Sans',system-ui,sans-serif", textAlign:'center', lineHeight:1.5 }}>
                  Vehicle Photo<br/>
                  <span style={{ fontSize:9, color:'rgba(255,255,255,0.15)' }}>Add image here</span>
                </p>
              </div>

              <div>
                <p style={{ margin:'0 0 6px', fontSize:16, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>
                  {d.vehicle === 'Motorcycle' ? 'Peugeot 103 1971' : 'Renault Clio 2019'}
                </p>
                <div style={{ display:'flex', gap:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80' }}/>
                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>0 Recent Violations</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>Standard Safety Gear</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── REAL LEAFLET MAP ── */}
            <div style={{ background:'#0b1d33', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden', display:'flex', flexDirection:'column', minHeight:240, animation:'cdFadeUp .35s ease 0.22s both' }}>
              <div style={{ padding:'12px 14px 10px', flexShrink:0 }}>
                <p style={{ margin:0, fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'0.12em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>CURRENT LOCATION</p>
              </div>
              <div style={{ flex:1, minHeight:180 }}>
                <DelivererMap deliverer={d}/>
              </div>
            </div>
          </div>

          {/* Operations & Billing */}
          <div style={{ background:'#0b1d33', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'18px 20px', animation:'cdFadeUp .35s ease 0.26s both' }}>
            <p style={{ margin:'0 0 16px', fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'0.12em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>OPERATIONS &amp; BILLING</p>

            <div className="cd-deliverer-inner-5">
              {[
                { label:'INITIAL FEE',   val:d.price||250,  unit:'DZD'     },
                { label:'FEE / KM',      val:'90',           unit:'DZD'     },
                { label:'FEE / KG',      val:'40',           unit:'DZD'     },
                { label:'AVAILABILITY',  val:'Tue–Sat',      unit:null       },
                { label:'HOURS',         val:'08:00–15:00',  unit:null, small:true },
              ].map((f, i) => (
                <div key={i}>
                  <p style={{ margin:'0 0 4px', fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.28)', letterSpacing:'0.1em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{f.label}</p>
                  <div style={{ display:'flex', alignItems:'baseline', gap:3 }}>
                    <span style={{ fontSize: f.small||!f.unit ? 14 : 20, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif", lineHeight:1 }}>{f.val}</span>
                    {f.unit && <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{f.unit}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Active badge */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.22)', borderRadius:8, padding:'6px 12px' }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 6px rgba(74,222,128,0.8)' }}/>
              <span style={{ fontSize:10, fontWeight:700, color:'#4ade80', letterSpacing:'0.1em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                ACTIVE NOW IN ALGIERS CENTRAL
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}