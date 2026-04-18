// ═══════════════════════════════════════════════════════════
// TrackChatPanel.jsx — Chat with couriers panel
// Matches screenshot: left sidebar (Active Couriers),
// right chat area with messages, live location card,
// "..." typing indicator, message input bar
// ═══════════════════════════════════════════════════════════
import { useState, useRef, useEffect } from 'react';

// ─── MOCK COURIERS ────────────────────────────────────────
const COURIERS = [
  {
    id: 'yassine-b',
    name: 'Yassine B.',
    initials: 'YB',
    status: 'NOW',
    statusColor: '#4ade80',
    preview: 'Arriving in 12 mins at War...',
    avatarColor: 'linear-gradient(135deg,#1a4a6a,#0d2a4a)',
    avatarBorder: 'rgba(78,222,163,0.4)',
    rating: 4.9,
    orderId: 'KL-9982-DZ',
    orderStatus: 'IN TRANSIT',
  },
  {
    id: 'ahmed-s',
    name: 'Ahmed S.',
    initials: 'AS',
    status: '14M',
    statusColor: 'rgba(255,255,255,0.35)',
    preview: 'Package delivered to Algie...',
    avatarColor: 'linear-gradient(135deg,#3a2a1a,#2a1a0d)',
    avatarBorder: 'rgba(251,191,36,0.4)',
    rating: 4.7,
    orderId: 'KL-8821-DZ',
    orderStatus: 'DELIVERED',
  },
  {
    id: 'lina-m',
    name: 'Lina M.',
    initials: 'LM',
    status: '2H',
    statusColor: 'rgba(255,255,255,0.35)',
    preview: 'New invoice ready: 45,00...',
    avatarColor: 'linear-gradient(135deg,#4a1a3a,#2a0d2a)',
    avatarBorder: 'rgba(167,139,250,0.4)',
    rating: 5.0,
    orderId: 'KL-7741-DZ',
    orderStatus: 'INVOICE',
  },
];

// ─── MOCK MESSAGES per courier ────────────────────────────
const MOCK_MESSAGES = {
  'yassine-b': [
    { id: 1, from: 'courier', text: "Assalam, I've just picked up the priority shipment from Algiers Port. The cargo is secured and I'm heading towards the northern checkpoint now.", time: '10:42 AM' },
    { id: 2, from: 'user',    text: "Perfect. Please note the delivery fee of 12,500 DZD has been pre-authorized. Is the weather affecting the coastal route?", time: '10:45 AM' },
    { id: 3, from: 'courier', text: "Slight fog near the coast, but the Kinetic Tracking system is showing clear lanes ahead. I should reach Warehouse A by 11:15 AM as planned.", time: '10:48 AM', location: { label: 'LIVE LOCATION SHARED', sub: '3.4 km from destination' } },
    { id: 'typing', from: 'courier', typing: true },
  ],
  'ahmed-s': [
    { id: 1, from: 'courier', text: 'Package has been delivered to the address in El Harrach. Recipient confirmed. All good!', time: 'Oct 8, 09:30 AM' },
    { id: 2, from: 'user',    text: 'Thank you Ahmed, great service as always.', time: 'Oct 8, 09:35 AM' },
  ],
  'lina-m': [
    { id: 1, from: 'courier', text: 'Your invoice for the electronics delivery is ready. Total: 2,100 DZD. Please check your wallet.', time: 'Sep 28, 2:00 PM' },
    { id: 2, from: 'user',    text: 'Got it, thank you Lina!', time: 'Sep 28, 2:05 PM' },
  ],
};

// ─── CHAT DATE DIVIDER ────────────────────────────────────
function DateChip({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '12px 0' }}>
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
        color: 'rgba(255,255,255,0.3)',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 6, padding: '3px 10px',
        fontFamily: "'DM Sans',system-ui,sans-serif",
      }}>{label}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
export default function TrackChatPanel({ deliverer, onClose }) {
  // If opened from DelivererHistory, pre-select that deliverer
  const defaultId = deliverer?.id || 'yassine-b';
  const [activeCourierId, setActiveCourierId] = useState(defaultId);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(
    Object.fromEntries(COURIERS.map(c => [c.id, [...(MOCK_MESSAGES[c.id] || [])]]))
  );
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);

  const activeCourier = COURIERS.find(c => c.id === activeCourierId);
  const activeMessages = messages[activeCourierId] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeCourierId, messages]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setMessages(m => ({
      ...m,
      [activeCourierId]: [
        ...m[activeCourierId].filter(msg => !msg.typing),
        { id: Date.now(), from: 'user', text, time: 'Just now' },
      ],
    }));
    setInput('');
  }

  const filteredCouriers = COURIERS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'cdFadeUp .2s ease both',
      }}>
      <div className="cd-trackchat-grid" style={{
        width: '86vw', maxWidth: 960, height: '78vh',
        background: '#071828',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 22,
        boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
      }}>

        {/* ══════════════════════════════════════════════
            LEFT SIDEBAR — Active Couriers
        ══════════════════════════════════════════════ */}
        <div style={{
          background: '#050f1e',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Sidebar header */}
          <div style={{ padding: '18px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: 'white', fontFamily: "'Outfit',system-ui,sans-serif" }}>
              Active Couriers
            </h3>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }}
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search shipments..."
                className="cd-input"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  paddingLeft: 28, paddingRight: 10, paddingTop: 7, paddingBottom: 7,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 9, fontSize: 12, color: 'white',
                  fontFamily: "'DM Sans',system-ui,sans-serif", outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Courier list */}
          <div style={{ overflowY: 'auto', flex: 1 }} className="cd-scroll">
            {filteredCouriers.map(c => {
              const isActive = c.id === activeCourierId;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveCourierId(c.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 16px', cursor: 'pointer',
                    background: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
                    borderLeft: `3px solid ${isActive ? '#3b82f6' : 'transparent'}`,
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>

                  {/* Avatar */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: c.avatarColor,
                      border: `1.5px solid ${c.avatarBorder}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: 'white',
                      fontFamily: "'DM Sans',system-ui,sans-serif",
                    }}>
                      {c.initials}
                    </div>
                    {/* Online dot */}
                    {c.status === 'NOW' && (
                      <div style={{
                        position: 'absolute', bottom: 1, right: 1,
                        width: 9, height: 9, borderRadius: '50%',
                        background: '#4ade80', border: '1.5px solid #050f1e',
                      }}/>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'white', fontFamily: "'DM Sans',system-ui,sans-serif" }}>{c.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: c.statusColor, fontFamily: "'DM Sans',system-ui,sans-serif", flexShrink: 0 }}>{c.status}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Sans',system-ui,sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.preview}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            RIGHT — Chat Area
        ══════════════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Chat header */}
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: activeCourier.avatarColor,
                border: `2px solid ${activeCourier.avatarBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: 'white',
                fontFamily: "'DM Sans',system-ui,sans-serif",
              }}>
                {activeCourier.initials}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'white', fontFamily: "'Outfit',system-ui,sans-serif" }}>
                    {activeCourier.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', fontFamily: "'DM Sans',system-ui,sans-serif" }}>{activeCourier.rating}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: activeCourier.status === 'NOW' ? '#4ade80' : 'rgba(255,255,255,0.3)' }}/>
                  <span style={{ fontSize: 10, fontWeight: 700, color: activeCourier.status === 'NOW' ? '#4ade80' : 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
                    {activeCourier.orderStatus}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: "'JetBrains Mono',monospace" }}>
                    ID: {activeCourier.orderId}
                  </span>
                </div>
              </div>
            </div>

            {/* Right icons */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {[
                <svg key="phone" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.77-.77a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17.4v.52z"/></svg>,
                <svg key="info" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
                <svg key="close" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" onClick={onClose} style={{ cursor: 'pointer' }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
              ].map((icon, i) => (
                <button
                  key={i}
                  onClick={i === 2 ? onClose : undefined}
                  style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div
            className="cd-scroll"
            style={{ flex: 1, overflowY: 'auto', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            <DateChip label="TODAY, OCTOBER 24"/>

            {activeMessages.map((msg, i) => {
              if (msg.typing) {
                return (
                  <div key="typing" style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: activeCourier.avatarColor,
                      border: `1.5px solid ${activeCourier.avatarBorder}`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white',
                      fontFamily: "'DM Sans',system-ui,sans-serif", flexShrink: 0,
                    }}>{activeCourier.initials}</div>
                    <div style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '14px 14px 14px 4px',
                      padding: '10px 16px',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      {[0, 1, 2].map(j => (
                        <div key={j} style={{
                          width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.4)',
                          animation: `cdDotPulse 1.2s ease ${j * 0.2}s infinite`,
                        }}/>
                      ))}
                    </div>
                  </div>
                );
              }

              const isCourier = msg.from === 'courier';
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: isCourier ? 'row' : 'row-reverse', alignItems: 'flex-end', gap: 8, animation: `cdFadeUp .2s ease ${i * 0.04}s both` }}>
                  {isCourier && (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: activeCourier.avatarColor,
                      border: `1.5px solid ${activeCourier.avatarBorder}`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white',
                      fontFamily: "'DM Sans',system-ui,sans-serif", flexShrink: 0,
                    }}>{activeCourier.initials}</div>
                  )}

                  <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: isCourier ? 'flex-start' : 'flex-end', gap: 4 }}>
                    <div style={{
                      background: isCourier ? 'rgba(255,255,255,0.07)' : 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                      border: isCourier ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      borderRadius: isCourier ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
                      padding: '11px 15px',
                      fontSize: 13, color: 'rgba(255,255,255,0.88)',
                      fontFamily: "'DM Sans',system-ui,sans-serif",
                      lineHeight: 1.55,
                    }}>
                      {msg.text}

                      {/* Live location card */}
                      {msg.location && (
                        <div style={{
                          marginTop: 10,
                          background: 'rgba(0,0,0,0.25)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 10, padding: '8px 12px',
                          display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: 8,
                            background: 'rgba(59,130,246,0.2)',
                            border: '1px solid rgba(59,130,246,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 1px', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
                              {msg.location.label}
                            </p>
                            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
                              {msg.location.sub}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: "'DM Sans',system-ui,sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
                      {msg.time}
                      {!isCourier && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(96,165,250,0.7)" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef}/>
          </div>

          {/* Input bar */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', gap: 10,
            flexShrink: 0,
          }}>
            {/* + attachment */}
            <button style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
              transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>

            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Type a message..."
              className="cd-input"
              style={{
                flex: 1, padding: '10px 14px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 20, fontSize: 13, color: 'white',
                fontFamily: "'DM Sans',system-ui,sans-serif", outline: 'none',
              }}
            />

            {/* Mic */}
            <button style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
              transition: 'all .15s',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
              </svg>
            </button>

            {/* Send */}
            <button
              onClick={sendMessage}
              style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: input.trim() ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'rgba(255,255,255,0.08)',
                border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'default',
                transition: 'all .2s',
                boxShadow: input.trim() ? '0 2px 12px rgba(59,130,246,0.4)' : 'none',
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? 'white' : 'rgba(255,255,255,0.25)'} strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
