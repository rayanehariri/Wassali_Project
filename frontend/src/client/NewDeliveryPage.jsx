// ═══════════════════════════════════════════════════════════
// NewDeliveryPage.jsx — Submit Request
// Flow: fill form → onNext(formData) → ChooseDelivererPage
// ═══════════════════════════════════════════════════════════
import { useState } from 'react';
import { CityBanner } from './Shared';
import { http } from '../api/http';

async function submitDeliveryRequest(payload) {
  const res = await http.post('/client/requests', payload);
  return res?.data;
}

const IS = { // inputStyle
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, padding: '10px 14px',
  color: 'white', fontSize: 13,
  fontFamily: "'DM Sans',system-ui,sans-serif",
  outline: 'none', transition: 'border-color .2s',
};

const LS = { // labelStyle
  display: 'block', fontSize: 10, fontWeight: 700,
  letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)',
  marginBottom: 7, fontFamily: "'DM Sans',system-ui,sans-serif",
};

function BgGrid() {
  return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', opacity:0.07 }}>
      <defs>
        <pattern id="ndGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#60a5fa" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ndGrid)"/>
    </svg>
  );
}

// ─── ENTER/MAP TAB SWITCHER ───────────────────────────────
function ModeTab({ label, active, onClick, accent }) {
  const rgb = accent === '#4EDEA3' ? '78,222,163' : '173,198,255';
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
        padding: '3px 10px', borderRadius: 5, cursor: 'pointer',
        fontFamily: "'DM Sans',system-ui,sans-serif", border: 'none', outline: 'none',
        color:      active ? accent : 'rgba(255,255,255,0.38)',
        background: active ? `rgba(${rgb},0.14)` : 'rgba(255,255,255,0.06)',
        boxShadow:  active ? `inset 0 0 0 1px rgba(${rgb},0.32)` : 'inset 0 0 0 1px rgba(255,255,255,0.1)',
        transition: 'all .15s',
      }}>
      {label}
    </button>
  );
}

// ─── FAKE MAP PIN-DROP ────────────────────────────────────
async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    const data = await res.json();
    return data?.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

function MapPicker({ accent, onConfirm }) {
  const [state,   setState]   = useState('idle');   // idle | locating | pinned
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState(null); // [lat, lng]
  const rgb = accent === '#4EDEA3' ? '78,222,163' : '173,198,255';
  const mapRef = useState(() => ({ current: null }))[0];
  const mapObj = useState(() => ({ current: null }))[0];
  const markerRef = useState(() => ({ current: null }))[0];

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
    script.onload=cb;
    document.head.appendChild(script);
  }

  function handleReset() {
    setState('idle');
    setAddress('');
    setCoords(null);
  }

  return (
    <div>
      {/* Map area */}
      <div
        style={{
          borderRadius: state === 'pinned' ? '12px 12px 0 0' : 12,
          border: `1px solid rgba(${rgb},0.22)`,
          borderBottom: state === 'pinned' ? 'none' : undefined,
          position: 'relative', height: 110,
          background: 'linear-gradient(135deg,#0c2540,#071828)',
          cursor: state === 'locating' ? 'wait' : 'crosshair',
          overflow: 'hidden',
        }}>
        <div
          ref={(el) => { mapRef.current = el; }}
          style={{ position: 'absolute', inset: 0 }}
        />
        {/* dot grid */}
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.13, pointerEvents:'none' }}>
          <defs><pattern id={`dp-${rgb}`} width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.8" fill={accent}/></pattern></defs>
          <rect width="100%" height="100%" fill={`url(#dp-${rgb})`}/>
        </svg>
        {/* faux roads */}
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.15, pointerEvents:'none' }}>
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke={accent} strokeWidth="1" strokeDasharray="7 5"/>
          <line x1="42%" y1="0" x2="42%" y2="100%" stroke={accent} strokeWidth="1" strokeDasharray="7 5"/>
          <line x1="68%" y1="0" x2="68%" y2="100%" stroke={accent} strokeWidth="0.5" strokeDasharray="4 6"/>
        </svg>

        {/* Pinned marker dot */}
        {state === 'pinned' && coords && (
          <div style={{ position:'absolute', top:'38%', left:'42%', transform:'translate(-50%,-50%)', zIndex:2 }}>
            <div style={{ width:16, height:16, borderRadius:'50%', background:accent, border:'2.5px solid #071828', boxShadow:`0 0 10px ${accent}` }}/>
            <div style={{ width:6, height:6, background:accent, clipPath:'polygon(50% 100%,0 0,100% 0)', margin:'-2px auto 0', opacity:0.8 }}/>
          </div>
        )}

        <div style={{ position:'relative', zIndex:1, height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:5 }}>
          {state === 'idle' && (
            <>
              <div style={{ width:30, height:30, borderRadius:'50%', background:`rgba(${rgb},0.16)`, border:`1.5px solid ${accent}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <span style={{ fontSize:11, fontWeight:600, color:accent, fontFamily:"'DM Sans',system-ui,sans-serif", letterSpacing:'0.04em' }}>CLICK TO PIN LOCATION</span>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.28)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>Tap anywhere on the map</span>
            </>
          )}
          {state === 'locating' && (
            <>
              <span style={{ width:22, height:22, border:`2px solid rgba(${rgb},0.3)`, borderTopColor:accent, borderRadius:'50%', display:'inline-block', animation:'cdSpin .7s linear infinite' }}/>
              <span style={{ fontSize:11, color:accent, fontFamily:"'DM Sans',system-ui,sans-serif" }}>Fetching address…</span>
            </>
          )}
          {state === 'pinned' && (
            <span style={{ fontSize:10, color:`rgba(${rgb},0.6)`, fontFamily:"'DM Sans',system-ui,sans-serif" }}>Click map to repin</span>
          )}
        </div>
      </div>

      {/* Address result + confirm bar — appears when pinned */}
      {state === 'pinned' && (
        <div style={{
          background:`rgba(${rgb},0.08)`,
          border:`1px solid rgba(${rgb},0.25)`, borderTop:'none',
          borderRadius:'0 0 12px 12px',
          padding:'10px 14px',
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:8,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, flex:1, minWidth:0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" style={{ flexShrink:0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.8)', fontFamily:"'DM Sans',system-ui,sans-serif", whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{address}</span>
          </div>
          <div style={{ display:'flex', gap:6, flexShrink:0 }}>
            <button
              onClick={handleReset}
              style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.4)', background:'none', border:'1px solid rgba(255,255,255,0.12)', borderRadius:6, padding:'4px 9px', cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif", transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='rgba(255,255,255,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; }}>
              Repin
            </button>
            <button
              onClick={() => coords && onConfirm({ address, coords })}
              style={{ fontSize:10, fontWeight:700, color:'#071828', background:accent, border:'none', borderRadius:6, padding:'4px 11px', cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif", letterSpacing:'0.04em' }}>
              USE THIS ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADDRESS FIELD (ENTER + MAP tabs) ─────────────────────
function AddressField({ accent, label, value, onChange, mode, onModeChange, onCoordsChange }) {
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:accent, flexShrink:0, boxShadow:`0 0 7px ${accent}` }}/>
          <span style={{ ...LS, marginBottom:0 }}>{label}</span>
        </div>
        <div style={{ display:'flex', gap:5 }}>
          <ModeTab label="ENTER" active={mode==='enter'} onClick={() => onModeChange('enter')} accent={accent}/>
          <ModeTab label="MAP"   active={mode==='map'}   onClick={() => onModeChange('map')}   accent={accent}/>
        </div>
      </div>

      {mode === 'enter' ? (
        <input
          className="cd-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={label.includes('PICKUP') ? 'e.g. 12 Rue Didouche Mourad, Algiers…' : 'e.g. Résidence Sahraoui, Hydra…'}
          style={IS}
        />
      ) : (
        <MapPicker
          accent={accent}
          onConfirm={async ({ address, coords }) => {
            onChange(address);
            onCoordsChange?.(coords);
            onModeChange('enter');
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
export default function NewDeliveryPage({ currentUser, addToast, onNext, onBack }) {
  const [desc,        setDesc]        = useState('');
  const [size,        setSize]        = useState('30×20×15 cm');
  const [weight,      setWeight]      = useState('4.5');
  const [fragile,     setFragile]     = useState(true);
  const [photo,       setPhoto]       = useState(null);
  const [pickup,      setPickup]      = useState('');
  const [dropoff,     setDropoff]     = useState('');
  const [pickupMode,  setPickupMode]  = useState('enter');
  const [dropoffMode, setDropoffMode] = useState('map');
  const [pickupCoords, setPickupCoords] = useState(null);   // [lat,lng]
  const [dropoffCoords, setDropoffCoords] = useState(null); // [lat,lng]
  const [schedule,    setSchedule]    = useState('Immediate Dispatch');
  const [loading,     setLoading]     = useState(false);

  async function handleSubmit() {
    if (!desc.trim())    { addToast?.('error','Missing field','Please enter a package description.'); return; }
    if (!pickup.trim())  { addToast?.('error','Missing field','Please enter a pickup address.');  return; }
    if (!dropoff.trim()) { addToast?.('error','Missing field','Please enter a drop-off address.'); return; }
    setLoading(true);
    try {
      const clientId = currentUser?._id ?? currentUser?.id ?? currentUser?.client_id;
      if (!clientId) throw new Error('Missing client id');

      const res = await submitDeliveryRequest({
        client_id: clientId,
        pickup,
        dropoff,
        description: desc,
        price: 250,
        pickup_lat: pickupCoords?.[0] ?? null,
        pickup_lng: pickupCoords?.[1] ?? null,
        dropoff_lat: dropoffCoords?.[0] ?? null,
        dropoff_lng: dropoffCoords?.[1] ?? null,
      });

      const requestId = res?.requestId ?? res?.data?.requestId;
      if (!requestId) throw new Error(res?.message || 'No request id returned');

      onNext?.({
        desc,
        size,
        weight,
        fragile,
        pickup,
        dropoff,
        pickupCoords,
        dropoffCoords,
        schedule,
        requestId,
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit. Please try again.';
      addToast?.('error', 'Error', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#060f1e 0%,#0a1628 50%,#071020 100%)', position:'relative', overflow:'hidden', animation:'cdFadeUp .3s ease both' }}>
      <BgGrid/>
      <div style={{ position:'absolute', top:'10%', right:'15%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(37,99,235,0.12),transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'20%', left:'5%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(78,222,163,0.07),transparent 70%)', pointerEvents:'none' }}/>

      {/* ── RETURN TO DASHBOARD — sits at true page-left, outside centered column ── */}
      <div style={{ position:'relative', zIndex:2, padding:'24px 40px 0' }}>
        <button onClick={() => onBack?.()}
          style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', color:'rgba(255,255,255,0.5)', fontSize:12, fontWeight:700, letterSpacing:'0.1em', cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif", padding:0, transition:'color .15s' }}
          onMouseEnter={e => e.currentTarget.style.color='white'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.5)'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          RETURN TO DASHBOARD
        </button>
      </div>

      <div style={{ position:'relative', zIndex:1, padding:'18px 40px 28px', maxWidth:1000, margin:'0 auto' }}>

        {/* Title */}
        <div style={{ marginBottom:32 }}>
          <h1 style={{ margin:'0 0 8px', fontSize:36, fontWeight:800, fontFamily:"'Outfit',system-ui,sans-serif", lineHeight:1.1 }}>
            <span style={{ color:'white' }}>Submit </span><span style={{ color:'#ADC6FF' }}>Request</span>
          </h1>
          <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.45)', maxWidth:440, lineHeight:1.65, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
            Configure your delivery parameters with precision. All requests are processed and routed directly to available deliverers via Wassali's engine.
          </p>
        </div>

        {/* 2-col */}
        <div className="cd-newdelivery-2col">

          {/* LEFT — Package */}
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:18, padding:26, backdropFilter:'blur(8px)', display:'flex', flexDirection:'column', gap:18 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:34, height:34, borderRadius:10, background:'rgba(59,130,246,0.15)', border:'1px solid rgba(59,130,246,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                </div>
                <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Package Details</h3>
              </div>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>

            <div>
              <label style={LS}>
                PACKAGE DESCRIPTION
                <span style={{ color:'#f87171', marginLeft:4 }}>*</span>
              </label>
              <input
                className="cd-input"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="e.g. Groceries, fragile glass, medical supplies… (required)"
                style={{ ...IS, borderColor: !desc.trim() ? 'rgba(248,113,113,0.3)' : undefined }}
              />
            </div>

            <div className="cd-newdelivery-subgrid">
              <div>
                <label style={LS}>SIZE (DIMENSIONS)</label>
                <div style={{ position:'relative' }}>
                  <input className="cd-input" value={size} onChange={e => setSize(e.target.value)} style={IS} placeholder="30×20×15 cm"/>
                  <svg style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                </div>
              </div>
              <div>
                <label style={LS}>WEIGHT (KG)</label>
                <div style={{ position:'relative' }}>
                  <input className="cd-input" type="number" min="0" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} style={IS} placeholder="4.5"/>
                  <svg style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>
                </div>
              </div>
            </div>

            {/* Fragile */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.15)', borderRadius:12, padding:'12px 16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:'rgba(251,191,36,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div>
                  <p style={{ margin:0, fontSize:13, fontWeight:600, color:'white', fontFamily:"'DM Sans',system-ui,sans-serif" }}>Fragile Content</p>
                  <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.4)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>Extra padding &amp; gentle handling required</p>
                </div>
              </div>
              <label style={{ cursor:'pointer', userSelect:'none', flexShrink:0 }}>
                <input type="checkbox" checked={fragile} onChange={e => setFragile(e.target.checked)} style={{ display:'none' }}/>
                <div style={{ width:44, height:24, borderRadius:12, background:fragile?'linear-gradient(135deg,#4EDEA3,#ADC6FF)':'rgba(255,255,255,0.15)', position:'relative', transition:'background .25s' }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:'white', position:'absolute', top:3, left:3, transform:fragile?'translateX(20px)':'translateX(0)', transition:'transform .25s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }}/>
                </div>
              </label>
            </div>

            {/* Photo */}
            <div>
              <label style={LS}>PACKAGE VISUALS</label>
              <div
                onClick={() => document.getElementById('photoInput').click()}
                style={{ border:`1.5px dashed ${photo?'rgba(78,222,163,0.4)':'rgba(255,255,255,0.14)'}`, borderRadius:12, padding:'22px 20px', textAlign:'center', cursor:'pointer', transition:'all .2s', background:photo?'rgba(78,222,163,0.04)':'rgba(255,255,255,0.02)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor=photo?'rgba(78,222,163,0.6)':'rgba(173,198,255,0.35)'}
                onMouseLeave={e => e.currentTarget.style.borderColor=photo?'rgba(78,222,163,0.4)':'rgba(255,255,255,0.14)'}>
                <input id="photoInput" type="file" accept="image/*" style={{ display:'none' }} onChange={e => setPhoto(e.target.files[0])}/>
                {photo ? (
                  <>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4EDEA3" strokeWidth="2" style={{ marginBottom:6 }}><polyline points="20 6 9 17 4 12"/></svg>
                    <p style={{ margin:'0 0 2px', fontSize:13, color:'#4EDEA3', fontFamily:"'DM Sans',system-ui,sans-serif", fontWeight:600 }}>{photo.name}</p>
                    <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.35)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>Click to replace</p>
                  </>
                ) : (
                  <>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(173,198,255,0.4)" strokeWidth="1.5" style={{ marginBottom:6 }}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                    <p style={{ margin:'0 0 2px', fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.5)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>Upload Photo</p>
                    <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.28)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>JPG, PNG up to 10 MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — Location + Submit */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:18, padding:26, backdropFilter:'blur(8px)', flex:1, display:'flex', flexDirection:'column', gap:0 }}>
              {/* Card header */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:22 }}>
                <div style={{ width:34, height:34, borderRadius:10, background:'rgba(78,222,163,0.12)', border:'1px solid rgba(78,222,163,0.22)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4EDEA3" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Location Details</h3>
              </div>

              {/* Pickup */}
              <AddressField accent="#4EDEA3" label="PICKUP ADDRESS" value={pickup} onChange={setPickup} mode={pickupMode} onModeChange={setPickupMode} onCoordsChange={setPickupCoords}/>

              {/* Route connector — clean vertical line with dots */}
              <div style={{ display:'flex', gap:0, margin:'12px 0 12px 4px', alignItems:'stretch' }}>
                <div style={{ width:10, display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div style={{ flex:1, width:2, background:'linear-gradient(180deg,#4EDEA3 0%,rgba(78,222,163,0.4) 40%,rgba(173,198,255,0.4) 70%,#ADC6FF 100%)', borderRadius:2, minHeight:28 }}/>
                </div>
                <div style={{ flex:1, paddingLeft:10, display:'flex', alignItems:'center' }}>
                  <span style={{ fontSize:10, color:'rgba(255,255,255,0.22)', fontFamily:"'DM Sans',system-ui,sans-serif", fontStyle:'italic' }}>
                    {pickup && dropoff
                      ? `${pickup.split(',')[0]} → ${dropoff.split(',')[0]}`
                      : 'Route will be calculated'}
                  </span>
                </div>
              </div>

              {/* Drop-off */}
              <div style={{ marginBottom:20 }}>
                <AddressField accent="#ADC6FF" label="DROP-OFF ADDRESS" value={dropoff} onChange={setDropoff} mode={dropoffMode} onModeChange={setDropoffMode} onCoordsChange={setDropoffCoords}/>
              </div>

              {/* Schedule */}
              <div>
                <label style={LS}>PREFERRED PICKUP SCHEDULE</label>
                <div style={{ position:'relative' }}>
                  <select value={schedule} onChange={e => setSchedule(e.target.value)} style={{ ...IS, appearance:'none', paddingRight:36, cursor:'pointer' }}>
                    <option>Immediate Dispatch</option>
                    <option>Within 1 hour</option>
                    <option>Within 2 hours</option>
                    <option>Schedule for later</option>
                  </select>
                  <svg style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ width:'100%', border:'none', borderRadius:14, padding:'16px 0', fontSize:15, fontWeight:700, color:'#0a1628', cursor:loading?'not-allowed':'pointer', background:'linear-gradient(135deg,#4EDEA3,#ADC6FF)', fontFamily:"'DM Sans',system-ui,sans-serif", letterSpacing:'0.03em', display:'flex', alignItems:'center', justifyContent:'center', gap:10, opacity:loading?0.75:1, transition:'opacity .2s, transform .15s', boxShadow:'0 4px 24px rgba(78,222,163,0.25)' }}
              onMouseEnter={e => { if(!loading) e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
              {loading
                ? <span style={{ width:18, height:18, border:'2.5px solid rgba(10,22,40,0.3)', borderTopColor:'#0a1628', borderRadius:'50%', display:'inline-block', animation:'cdSpin .7s linear infinite' }}/>
                : <>Submit Request <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a1628" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
              }
            </button>
            <p style={{ margin:0, textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.27)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
              NOTE: Spamming requests may result in extra fees during payment.
            </p>
          </div>
        </div>

        <CityBanner
          title="Powered by Algerian Excellence"
          desc="Wassali Velocity utilizes advanced geospatial data and local logistical intelligence to navigate the unique urban architecture of Algerian cities."
          location="ALGIERS HQ"
        />
      </div>
    </div>
  );
}