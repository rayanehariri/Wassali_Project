// ═══════════════════════════════════════════════════════════
// CheckoutPage.jsx — Confirm & Pay
// Flow: confirm → onNext() → SuccessPage
// ═══════════════════════════════════════════════════════════
import { useState, useRef, useEffect } from 'react';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── FAKE API (replace with real endpoint later) ──────────
// TODO: POST /api/v1/deliveries/confirm-payment
async function fakeConfirmPayment(deliveryData) {
  await new Promise(r => setTimeout(r, 1400));
  return {
    success:    true,
    orderId:    `WSL-${Math.floor(1000 + Math.random() * 9000)}-QX`,
    totalPaid:  deliveryData?.totalFee || 590,
  };
}

// ─── REAL LEAFLET MAP ─────────────────────────────────────
function CheckoutMap({ pickup, dropoff }) {
  const mapRef = useRef(null);
  const mapObj = useRef(null);

  // Algiers coordinates for pickup / dropoff (fallback)
  const PICKUP_LATLNG  = [36.762, 3.048];
  const DROPOFF_LATLNG = [36.738, 3.072];

  useEffect(() => {
    function init() {
      if (!mapRef.current || mapObj.current) return;
      const L = window.L;

      const map = L.map(mapRef.current, {
        center:           [36.750, 3.060],
        zoom:             13,
        zoomControl:      false,
        attributionControl: false,
        dragging:         true,
        scrollWheelZoom:  true,
      });

      // Dark tile — same theme as Track page
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      // ── Pickup marker (green) ──
      const pickupIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:14px;height:14px;border-radius:50%;
          background:#4EDEA3;
          border:2.5px solid #071828;
          box-shadow:0 0 12px rgba(78,222,163,0.9);
        "></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7],
      });
      L.marker(PICKUP_LATLNG, { icon: pickupIcon })
        .addTo(map)
        .bindPopup(`<b style="font-family:'DM Sans',sans-serif">📦 Pickup</b><br/><span style="font-size:12px">${escapeHtml(pickup || '12 Rue Didouche Mourad, Algiers')}</span>`);

      // ── Drop-off marker (blue) ──
      const dropoffIcon = L.divIcon({
        className: '',
        html: `<div style="display:flex;flex-direction:column;align-items:center">
          <div style="
            width:14px;height:14px;border-radius:50%;
            background:#ADC6FF;
            border:2.5px solid #071828;
            box-shadow:0 0 12px rgba(173,198,255,0.9);
          "></div>
        </div>`,
        iconSize: [14, 14], iconAnchor: [7, 7],
      });
      L.marker(DROPOFF_LATLNG, { icon: dropoffIcon })
        .addTo(map)
        .bindPopup(`<b style="font-family:'DM Sans',sans-serif">🏁 Drop-off</b><br/><span style="font-size:12px">${escapeHtml(dropoff || 'Résidence Sahraoui, Hydra')}</span>`);

      // ── Route line ──
      const midLat = (PICKUP_LATLNG[0] + DROPOFF_LATLNG[0]) / 2;
      const midLng = (PICKUP_LATLNG[1] + DROPOFF_LATLNG[1]) / 2 - 0.01;
      const routeCoords = [PICKUP_LATLNG, [midLat + 0.005, midLng], DROPOFF_LATLNG];

      L.polyline(routeCoords, {
        color:      '#4EDEA3',
        weight:     3,
        opacity:    0.7,
        dashArray:  '8 5',
      }).addTo(map);

      // Fit both markers
      map.fitBounds([PICKUP_LATLNG, DROPOFF_LATLNG], { padding: [60, 60] });

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
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}/>

      {/* Destination badge overlay */}
      <div style={{
        position: 'absolute', bottom: 20, right: 20, zIndex: 999,
        background: 'rgba(7,24,40,0.95)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12, padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 9,
        backdropFilter: 'blur(8px)',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4EDEA3" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <div>
          <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.38)', fontFamily: "'DM Sans',system-ui,sans-serif", fontWeight: 700, letterSpacing: '0.1em' }}>DESTINATION ARRIVAL</p>
          <p style={{ margin: 0, fontSize: 12, color: 'white', fontFamily: "'DM Sans',system-ui,sans-serif", fontWeight: 600 }}>{dropoff || 'Résidence Sahraoui, Hydra'}</p>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', top: 16, left: 16, zIndex: 999,
        background: 'rgba(7,24,40,0.92)', border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 10, padding: '8px 12px', backdropFilter: 'blur(6px)',
      }}>
        {[{ c:'#4EDEA3', l:'Pickup' }, { c:'#ADC6FF', l:'Drop-off' }].map(item => (
          <div key={item.l} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.c, flexShrink: 0 }}/>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontFamily: "'DM Sans',system-ui,sans-serif" }}>{item.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FEE CALCULATOR ───────────────────────────────────────
function calcFees(deliveryData) {
  const base     = deliveryData?.deliverer?.price || 250;
  const distance = Math.round(base * 0.44);
  const pkg      = deliveryData?.fragile ? 180 : 130;
  const tax      = 50;
  return [
    { label: 'Base Delivery Fee', amount: base     },
    { label: 'Distance Fee',      amount: distance },
    { label: 'Package Fee',       amount: pkg      },
    { label: 'Platform Tax',      amount: tax      },
  ];
}

// ═══════════════════════════════════════════════════════════
export default function CheckoutPage({ deliveryData, onNext, onBack }) {
  const [loading,  setLoading]  = useState(false);
  const [payResult, setPayResult] = useState(null);

  const fees  = calcFees(deliveryData);
  const total = fees.reduce((s, f) => s + f.amount, 0);

  const deliverer = deliveryData?.deliverer || { initials:'YB', name:'Yassine B.', rating:4.9, cats:['GROCERIES','PHARMACY'] };
  const pickup    = deliveryData?.pickup  || '12 Rue Didouche Mourad, Algiers';
  const dropoff   = deliveryData?.dropoff || 'Résidence Sahraoui, Hydra';
  const desc      = deliveryData?.desc    || 'Groceries & Household Items';
  const weight    = deliveryData?.weight  || '4.5';

  async function handlePay() {
    setLoading(true);
    try {
      const res = await fakeConfirmPayment({ ...deliveryData, totalFee: total });
      setPayResult(res);
      onNext?.(res);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="cd-checkout-grid">

      {/* ── LEFT — form ── */}
      <div style={{ background: '#07152a', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '32px 32px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        {/* Back */}
        <button
          onClick={() => onBack?.()}
          style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 22, padding: 0, fontFamily: "'DM Sans',system-ui,sans-serif", letterSpacing: '0.03em', transition: 'color .15s', alignSelf: 'flex-start' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ADC6FF'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Deliverer
        </button>

        <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 800, color: 'white', fontFamily: "'Outfit',system-ui,sans-serif" }}>Confirm &amp; Pay</h1>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans',system-ui,sans-serif" }}>Review your trip details before proceeding</p>

        {/* Deliverer card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: 14, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#1a3a5a,#0d2a40)', border: '2px solid rgba(78,222,163,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0, fontFamily: "'DM Sans',system-ui,sans-serif" }}>
            {deliverer.initials}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 700, color: 'white', fontFamily: "'Outfit',system-ui,sans-serif" }}>{deliverer.name}</p>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans',system-ui,sans-serif", letterSpacing: '0.05em' }}>
              {(deliverer.cats || []).join(' • ')}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', fontFamily: "'DM Sans',system-ui,sans-serif" }}>{deliverer.rating}</span>
          </div>
        </div>

        {/* Route */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, marginBottom: 18 }}>
          {[
            { dot: '#4EDEA3', label: 'PICKUP',   addr: pickup  },
            { dot: '#ADC6FF', label: 'DROP-OFF', addr: dropoff },
          ].map((r, i) => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: i === 0 ? 10 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.dot, flexShrink: 0, boxShadow: `0 0 6px ${r.dot}` }}/>
                {i === 0 && <div style={{ width: 2, height: 18, background: 'linear-gradient(180deg,#4EDEA3,#ADC6FF)', borderRadius: 1, margin: '3px 0' }}/>}
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', fontFamily: "'DM Sans',system-ui,sans-serif" }}>{r.label}</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'white', fontFamily: "'DM Sans',system-ui,sans-serif" }}>{r.addr}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Package tag */}
        <div style={{ background: 'rgba(173,198,255,0.07)', border: '1px solid rgba(173,198,255,0.15)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ADC6FF" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/></svg>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#ADC6FF', fontFamily: "'DM Sans',system-ui,sans-serif" }}>{desc || 'Package'}</p>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Sans',system-ui,sans-serif" }}>APPROX. {weight} KG{deliveryData?.fragile ? ' · FRAGILE' : ''}</p>
          </div>
        </div>

        {/* Fee breakdown */}
        <div style={{ marginBottom: 18 }}>
          {fees.map(f => (
            <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: "'DM Sans',system-ui,sans-serif" }}>{f.label}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: "'DM Sans',system-ui,sans-serif" }}>{f.amount} DZD</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'white', fontFamily: "'Outfit',system-ui,sans-serif" }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'white', fontFamily: "'Outfit',system-ui,sans-serif" }}>{total} DZD</span>
          </div>
        </div>

        {/* Payment method */}
        <div
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'border-color .15s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(173,198,255,0.3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 22, borderRadius: 5, background: 'linear-gradient(135deg,#1a54c8,#1a3a8c)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: 'white', fontFamily: 'serif', letterSpacing: '0.02em' }}>VISA</span>
            </div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: "'DM Sans',system-ui,sans-serif" }}>Visa ending in 4242</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>

        {/* Confirm button */}
        <button
          onClick={handlePay}
          disabled={loading}
          style={{ width: '100%', border: 'none', borderRadius: 14, padding: '15px 0', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#ADC6FF,#4EDEA3)', color: '#07152a', fontFamily: "'DM Sans',system-ui,sans-serif", letterSpacing: '0.06em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14, opacity: loading ? 0.75 : 1, transition: 'opacity .2s, transform .15s', boxShadow: '0 4px 24px rgba(173,198,255,0.2)' }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          {loading ? (
            <span style={{ width: 17, height: 17, border: '2px solid rgba(7,21,42,0.3)', borderTopColor: '#07152a', borderRadius: '50%', display: 'inline-block', animation: 'cdSpin .7s linear infinite' }}/>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#07152a" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              CONFIRM AND PAY
            </>
          )}
        </button>

        {/* Security */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(78,222,163,0.6)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', fontFamily: "'DM Sans',system-ui,sans-serif", fontWeight: 600, letterSpacing: '0.06em' }}>SECURED BY SSL</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(78,222,163,0.5)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span style={{ fontSize: 10, color: 'rgba(78,222,163,0.55)', fontFamily: "'DM Sans',system-ui,sans-serif" }}>Encrypted Transaction</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT — real Leaflet map ── */}
      <div style={{ position: 'relative' }}>
        <CheckoutMap pickup={pickup} dropoff={dropoff}/>
      </div>
    </div>
  );
}