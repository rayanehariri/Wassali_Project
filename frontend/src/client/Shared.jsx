// shared — Mock data + shared components
import { useState, useMemo, useRef, useEffect } from 'react';

export const ORDERS = [
  { id:'#Wq-9928-DZ', status:'in_transit', cat:'PHARMACY',  title:"Boulangerie Ben Aknoun",  sub:'Prescription Refill',  amount:'2.100,00 DZD', date:'Yesterday', courier:'Yassine B.', av:'YB', eta:'14:20', pct:72,  from:"Route d'El Biar, Algiers",  to:'Cité 1200 Logements, Bab Ezzouar', lat:36.742, lng:3.038 },
  { id:'#Wq-9280-DZ', status:'completed',  cat:'GROCERIES', title:'Supermarché Ardis',        sub:'Weekly Essentials',    amount:'8.450,00 DZD', date:'May 12',    courier:'Karim M.',   av:'KM', eta:null,    pct:100, from:'Bab Ezzouar Centre',         to:'Cité 1200 Logements',              lat:36.725, lng:3.188 },
  { id:'#Wq-9177-DZ', status:'completed',  cat:'PACKAGES',  title:'Personal Courier',          sub:'Algiers to Oran',      amount:'3.500,00 DZD', date:'May 10',    courier:'Omar F.',    av:'OF', eta:null,    pct:100, from:'Algiers Centre',             to:'Oran City Hub',                    lat:36.737, lng:3.086 },
  { id:'#Wq-9050-DZ', status:'cancelled',  cat:'PHARMACY',  title:'CityPharma Express',        sub:'Medical Supplies',     amount:'1.200,00 DZD', date:'May 8',     courier:'—',          av:'—',  eta:null,    pct:0,   from:'Hussein Dey',                to:'El Harrach',                       lat:36.688, lng:3.133 },
];

export const TRANSACTIONS = [
  { id:'#TRX-829910', desc:'Community Guidelines Violation',  date:'May 12, 2024', amount:'-2.500,00 DZD', neg:true  },
  { id:'#TRX-829845', desc:'Wallet Top Up',                   date:'May 10, 2024', amount:'+5.000,00 DZD', neg:false },
  { id:'#TRX-829712', desc:'Supermarché Ardis Order',         date:'May 08, 2024', amount:'-8.450,00 DZD', neg:true  },
  { id:'#TRX-829654', desc:'Courier Service – Oran Delivery', date:'May 01, 2024', amount:'-3.500,00 DZD', neg:true  },
];

export const TICKETS = [
  { id:'TK-8821', title:'Missing Item Refund', sub:'Boulangerie Ben Aknoun', amount:'450,00 DZD',    status:'active',   badge:'ACTIVE'    },
  { id:'TK-7540', title:'Wallet Top-up Issue', sub:'Bank Transfer Query',    amount:'10.000,00 DZD', status:'resolved', badge:'2H AGO'    },
  { id:'TK-9012', title:'Address Update',      sub:'Oran Regional Hub',      amount:'0,00 DZD',      status:'active',   badge:'YESTERDAY' },
];

export const BADGE_MAP = {
  in_transit: { text:'IN TRANSIT',  color:'#4ade80', bg:'rgba(74,222,128,.1)',  border:'rgba(74,222,128,.2)'  },
  completed:  { text:'COMPLETED',   color:'#4ade80', bg:'rgba(74,222,128,.1)',  border:'rgba(74,222,128,.2)'  },
  cancelled:  { text:'CANCELLED',   color:'#f87171', bg:'rgba(248,113,113,.1)', border:'rgba(248,113,113,.2)' },
  active:     { text:'IN PROGRESS', color:'#fbbf24', bg:'rgba(251,191,36,.1)',  border:'rgba(251,191,36,.2)'  },
  resolved:   { text:'RESOLVED',    color:'#4ade80', bg:'rgba(74,222,128,.1)',  border:'rgba(74,222,128,.2)'  },
};

export function Badge({ status, label }) {
  const m = BADGE_MAP[status] || BADGE_MAP.active;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:9, fontWeight:700, letterSpacing:'0.1em', padding:'3px 8px', borderRadius:4, color:m.color, background:m.bg, border:`1px solid ${m.border}`, fontFamily:"'DM Sans',system-ui,sans-serif", whiteSpace:'nowrap' }}>
      {label || m.text}
    </span>
  );
}

export function CatIcon({ cat, size = 14, color = 'currentColor' }) {
  const p = { width:size, height:size, fill:'none', stroke:color, strokeWidth:'1.8', viewBox:'0 0 24 24' };
  switch (cat) {
    case 'PHARMACY':
      return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
    case 'GROCERIES':
      return <svg {...p}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
    case 'PACKAGES':
      return <svg {...p}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
    default:
      return <svg {...p}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
  }
}

export function TxIcon({ id, neg }) {
  if (id.includes('829910')) return (
    <div style={{ width:28, height:28, borderRadius:8, background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div>
  );
  if (!neg) return (
    <div style={{ width:28, height:28, borderRadius:8, background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8L2 7h20l-6-4z"/></svg>
    </div>
  );
  return (
    <div style={{ width:28, height:28, borderRadius:8, background:'rgba(96,165,250,0.1)', border:'1px solid rgba(96,165,250,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <CatIcon cat={id.includes('712') ? 'GROCERIES' : 'PACKAGES'} size={13} color="#60a5fa"/>
    </div>
  );
}

function buildClientSearchResults(query, setActive, addToast) {
  const s = query.trim().toLowerCase();
  if (!s) return [];
  const seen = new Set();
  const out = [];
  const push = (item) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    out.push(item);
  };

  ORDERS.forEach((o) => {
    const hay = `${o.id} ${o.title} ${o.courier} ${o.from} ${o.to} ${o.sub} ${o.cat}`.toLowerCase();
    if (hay.includes(s)) {
      push({
        id: `order-${o.id}`,
        title: o.title,
        sub: `${o.id} · ${o.courier}`,
        category: 'Order',
        onSelect: () => {
          setActive?.('home');
          addToast?.('info', 'Order', o.title);
        },
      });
    }
  });

  TRANSACTIONS.forEach((tx) => {
    const hay = `${tx.id} ${tx.desc} ${tx.date}`.toLowerCase();
    if (hay.includes(s)) {
      push({
        id: `tx-${tx.id}`,
        title: tx.desc,
        sub: tx.id,
        category: 'Transaction',
        onSelect: () => {
          setActive?.('wallet');
          addToast?.('info', 'Wallet', tx.desc);
        },
      });
    }
  });

  TICKETS.forEach((tk) => {
    const hay = `${tk.id} ${tk.title} ${tk.sub}`.toLowerCase();
    if (hay.includes(s)) {
      push({
        id: `tk-${tk.id}`,
        title: tk.title,
        sub: tk.id,
        category: 'Support',
        onSelect: () => {
          setActive?.('support');
          addToast?.('info', 'Support', tk.title);
        },
      });
    }
  });

  const pages = [
    { tab: 'home', label: 'My Orders', hint: 'Dashboard home', keys: ['order', 'dashboard', 'parcel', 'delivery'] },
    { tab: 'track', label: 'Track Delivery', hint: 'Map & live status', keys: ['track', 'map', 'gps', 'transit'] },
    { tab: 'wallet', label: 'Wallet', hint: 'Balance & history', keys: ['wallet', 'money', 'balance', 'dzd', 'pay', 'payment'] },
    { tab: 'settings', label: 'Settings', hint: 'Account & security', keys: ['setting', 'account', 'profile', 'password'] },
    { tab: 'support', label: 'Support', hint: 'Help center', keys: ['support', 'help', 'ticket', 'faq'] },
  ];

  if (s.length >= 2) {
    pages.forEach((p) => {
      const blob = `${p.label} ${p.hint} ${p.keys.join(' ')}`.toLowerCase();
      if (blob.includes(s) || p.keys.some((k) => k.includes(s))) {
        push({
          id: `page-${p.tab}`,
          title: p.label,
          sub: p.hint,
          category: 'Page',
          onSelect: () => setActive?.(p.tab),
        });
      }
    });
  }

  return out.slice(0, 12);
}

export function TopBar({ placeholder = 'Search deliveries, tracking IDs...', onSettings, setActive, addToast, currentUser }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const results = useMemo(() => buildClientSearchResults(q, setActive, addToast), [q, setActive, addToast]);

  useEffect(() => {
    function onDoc(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const initial = (currentUser?.name ?? 'A').charAt(0).toUpperCase();

  return (
    <div className="cd-topbar" style={{ background:'#060c18', borderBottom:'1px solid rgba(255,255,255,.06)', display:'flex', alignItems:'center', gap:16, padding:'10px 28px', position:'sticky', top:0, zIndex:20 }}>
      <div ref={wrapRef} style={{ position:'relative', flex:1, maxWidth:420 }}>
        <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', zIndex:1 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="cd-input"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          style={{ width:'100%', boxSizing:'border-box', paddingLeft:36, paddingRight:14, paddingTop:8, paddingBottom:8, fontSize:13, color:'white', borderRadius:10, background:'#112040', border:'1px solid rgba(255,255,255,.09)', fontFamily:"'DM Sans',system-ui,sans-serif", outline:'none' }}
        />
        {open && q.trim() && (
          <div
            className="cd-search-results cd-scroll"
            style={{
              position:'absolute', top:'calc(100% + 6px)', left:0, right:0,
              maxHeight:320, overflowY:'auto', background:'#0c1828', border:'1px solid rgba(255,255,255,.1)',
              borderRadius:12, boxShadow:'0 16px 40px rgba(0,0,0,.45)', zIndex:50,
            }}
          >
            {results.length === 0 ? (
              <div style={{ padding:'14px 16px', fontSize:12, color:'rgba(255,255,255,.45)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                No matches. Try an order ID, place name, or “wallet”, “track”, “support”…
              </div>
            ) : (
              results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { r.onSelect(); setOpen(false); setQ(''); }}
                  style={{
                    display:'block', width:'100%', textAlign:'left', padding:'11px 14px', border:'none',
                    borderBottom:'1px solid rgba(255,255,255,.06)', background:'transparent', cursor:'pointer',
                    color:'white', fontFamily:"'DM Sans',system-ui,sans-serif",
                  }}
                >
                  <span style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'rgba(255,255,255,.35)', marginBottom:4 }}>{r.category}</span>
                  <span style={{ display:'block', fontSize:13, fontWeight:600 }}>{r.title}</span>
                  <span style={{ display:'block', fontSize:11, color:'rgba(255,255,255,.45)', marginTop:2 }}>{r.sub}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginLeft:'auto' }}>
        <button type="button" className="cd-icon-btn" style={{ position:'relative', width:34, height:34, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', background:'#112040', border:'1px solid rgba(255,255,255,.08)', color:'rgba(255,255,255,.45)', cursor:'pointer' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span style={{ position:'absolute', top:5, right:5, width:6, height:6, borderRadius:'50%', background:'#3b82f6', border:'1px solid #0b1e38' }}/>
        </button>
        <button
          type="button"
          className="cd-icon-btn"
          onClick={onSettings}
          title="Settings"
          style={{ width:34, height:34, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', background:'#112040', border:'1px solid rgba(255,255,255,.08)', color:'rgba(255,255,255,.45)', cursor:'pointer' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
        <div style={{ width:34, height:34, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'white', background:'linear-gradient(135deg,#2563eb,#1d4ed8)', border:'1px solid rgba(59,130,246,.35)', cursor:'default', fontFamily:"'DM Sans',system-ui,sans-serif" }} title={currentUser?.name ?? 'Account'}>{initial}</div>
      </div>
    </div>
  );
}

export function CityBanner({ title, desc, location, image }) {
  return (
    <div style={{ marginTop:28, borderRadius:16, overflow:'hidden', display:'flex', border:'1px solid rgba(255,255,255,.06)', minHeight:130 }}>
      <div style={{ flex:1, padding:'20px 24px', display:'flex', flexDirection:'column', justifyContent:'center', background:'rgba(9,18,34,0.95)', borderRight:'1px solid rgba(255,255,255,.06)', borderRadius:'16px 0 0 16px' }}>
        <p style={{ margin:'0 0 7px', fontSize:15, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>{title}</p>
        <p style={{ margin:0, fontSize:12, color:'rgba(255,255,255,.45)', lineHeight:1.65, maxWidth:460, fontFamily:"'DM Sans',system-ui,sans-serif" }}>{desc}</p>
      </div>
      <div style={{ width:260, flexShrink:0, position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#0d2a4a,#071828)' }}>
        {image ? (
          <>
            <img src={image} alt={location} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }} onError={e => { e.target.style.display='none'; }}/>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(5,10,20,0.6) 0%, rgba(5,10,20,0.15) 60%, transparent 100%)' }}/>
          </>
        ) : (
          <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 220 115" preserveAspectRatio="xMidYMid slice">
            <rect width="220" height="115" fill="#0d2a3a"/>
            <rect x="0" y="58" width="220" height="57" fill="#081828"/>
            {[[8,44,14,71],[26,34,12,81],[44,48,14,67],[62,28,16,87],[86,38,14,77],[108,24,18,90],[132,42,13,73],[152,32,16,83],[174,46,11,69],[194,36,14,79]].map(([x,y,w,h],i) => (
              <rect key={i} x={x} y={y} width={w} height={h} fill={i%3===0?'#1a4a6a':i%3===1?'#163a5a':'#122e4a'} rx="1"/>
            ))}
          </svg>
        )}
        <div style={{ position:'absolute', bottom:10, left:12, display:'flex', alignItems:'center', gap:5 }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#ADC6FF" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', color:'#ADC6FF', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{location}</span>
        </div>
      </div>
    </div>
  );
}

export function WassaliLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" style={{ display:'inline-block', verticalAlign:'middle', flexShrink:0 }}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}
