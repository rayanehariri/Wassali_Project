import { useEffect, useMemo, useState } from 'react';

// ══════════════════════════════════════════════════════════
// NOTE: Import Sidebar and TopBar from your shared layout
// file (e.g. AdminLayout.jsx). They are NOT re-declared
// here. The component below expects to be used inside the
// admin shell that already provides the sidebar + topbar.
//
// Usage in your router:
//   <AdminLayout active="reports">
//     <ReportsPage />
//   </AdminLayout>
//
// If you need a standalone version for testing, uncomment
// the Sidebar/TopBar at the bottom of this file.
// ══════════════════════════════════════════════════════════

// ─── MOCK DATA ────────────────────────────────────────────
const REPORTS = [
  {
    id: 942, priority: 'HIGH', time: '2 min ago',
    title: 'Report #942 - Damaged Item', status: 'under_review',
    issueType: 'deliverer',
    desc: 'Customer claims the package was crushed upon arrival. Photos attached show significant damage.',
    user: 'Sarah Jenkins', userInitials: 'SJ',
    orderId: '#ORD-5592', createdAt: 'Oct 24, 2023 at 10:42 AM',
    complaint: '"The delivery arrived 20 minutes ago. The box was completely crushed on one side, and the contents are spilling out. The delivery person just left it at the door and ran off. I want a refund immediately."',
    images: ['📦', '📫'],
    timeline: [
      { label: 'Created',      time: '10:42 AM', done: true,  current: false },
      { label: 'Assigned',     time: '10:45 AM', done: true,  current: false },
      { label: 'Under Review', time: 'Current',  done: false, current: true  },
      { label: 'Resolved',     time: 'Pending',  done: false, current: false },
    ],
    orderDetails: { status: 'Delivered', orderId: '#ORD-5592', total: '$42.50', payment: 'Credit Card (**** 4242)' },
    items: [{ name: '1x Sandwich Poulet', price: '$12.00' }, { name: '2x Soup', price: '$8.00' }, { name: '1x Box Collector', price: '$18.50' }],
    customer:  { name: 'Sarah Jenkins', initials: 'SJ', rating: 4.8, reports: '3 (High)' },
    deliverer: { name: 'Mike Thompson', initials: 'MT', rating: 4.9, trips: '1,204' },
  },
  {
    id: 941, priority: 'MEDIUM', time: '15 min ago',
    title: 'Report #941 - Late Delivery', status: 'assigned',
    issueType: 'deliverer',
    desc: 'Deliverer took a detour which caused a 45 minute delay. Food arrived cold.',
    user: 'Mike Thompson', userInitials: 'MT',
    orderId: '#ORD-5588', createdAt: 'Oct 24, 2023 at 10:15 AM',
    complaint: '"My order was supposed to arrive at 10 AM. The deliverer took a completely different route and arrived 45 minutes late. My food was cold and inedible."',
    images: [],
    timeline: [
      { label: 'Created',      time: '10:15 AM', done: true,  current: false },
      { label: 'Assigned',     time: '10:22 AM', done: true,  current: true  },
      { label: 'Under Review', time: 'Pending',  done: false, current: false },
      { label: 'Resolved',     time: 'Pending',  done: false, current: false },
    ],
    orderDetails: { status: 'Delivered', orderId: '#ORD-5588', total: '$28.00', payment: 'Wallet' },
    items: [{ name: '1x Burger Meal', price: '$18.00' }, { name: '2x Drinks', price: '$10.00' }],
    customer:  { name: 'Mike Thompson', initials: 'MT', rating: 4.5, reports: '1 (Low)'  },
    deliverer: { name: 'Karim D.',      initials: 'KD', rating: 4.7, trips: '412'         },
  },
  {
    id: 940, priority: 'LOW', time: '1 hr ago',
    title: 'Report #940 - Wrong Item', status: 'under_review',
    issueType: 'user',
    desc: 'Received coke instead of diet coke. User wants a partial refund or credit.',
    user: 'Alex Chen', userInitials: 'AC',
    orderId: '#ORD-5580', createdAt: 'Oct 24, 2023 at 09:30 AM',
    complaint: '"I specifically ordered Diet Coke but received regular Coke. I am diabetic and cannot drink regular soda. I want a refund or store credit."',
    images: [],
    timeline: [
      { label: 'Created',      time: '09:30 AM', done: true,  current: false },
      { label: 'Assigned',     time: '09:38 AM', done: true,  current: false },
      { label: 'Under Review', time: 'Current',  done: false, current: true  },
      { label: 'Resolved',     time: 'Pending',  done: false, current: false },
    ],
    orderDetails: { status: 'Delivered', orderId: '#ORD-5580', total: '$5.50', payment: 'Credit Card (**** 1234)' },
    items: [{ name: '1x Diet Coke (ordered)', price: '$2.50' }, { name: 'Delivery fee', price: '$3.00' }],
    customer:  { name: 'Alex Chen', initials: 'AC', rating: 4.9, reports: '0'       },
    deliverer: { name: 'Amira S.',  initials: 'AS', rating: 4.8, trips: '203'        },
  },
  {
    id: 938, priority: 'RESOLVED', time: 'Yesterday',
    title: 'Report #938 - App Glitch', status: 'resolved',
    issueType: 'user',
    desc: "User couldn't apply coupon code.",
    user: 'Lina M.', userInitials: 'LM',
    orderId: '#ORD-5561', createdAt: 'Oct 23, 2023 at 14:10 PM',
    complaint: '"The coupon code SAVE20 kept showing an error even though it should be valid. I missed out on my discount."',
    images: [],
    timeline: [
      { label: 'Created',      time: '14:10', done: true, current: false },
      { label: 'Assigned',     time: '14:15', done: true, current: false },
      { label: 'Under Review', time: '14:30', done: true, current: false },
      { label: 'Resolved',     time: '15:00', done: true, current: false },
    ],
    orderDetails: { status: 'Delivered', orderId: '#ORD-5561', total: '$15.00', payment: 'Wallet' },
    items: [{ name: '1x Salad Bowl', price: '$12.00' }, { name: '1x Water', price: '$3.00' }],
    customer:  { name: 'Lina M.',    initials: 'LM', rating: 5.0, reports: '1 (Low)' },
    deliverer: { name: 'Yassine B.', initials: 'YB', rating: 4.9, trips: '1,240'     },
  },
];

const PRIORITY_MAP = {
  HIGH:     { bg: 'rgba(239,68,68,0.14)',  border: 'rgba(239,68,68,0.35)',  color: '#f87171', dot: '#ef4444' },
  MEDIUM:   { bg: 'rgba(245,158,11,0.14)', border: 'rgba(245,158,11,0.35)', color: '#fbbf24', dot: '#f59e0b' },
  LOW:      { bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)',  color: '#4ade80', dot: '#4ade80' },
  RESOLVED: { bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.2)',  color: '#4ade80', dot: '#4ade80' },
};

const STATUS_MAP = {
  under_review: { label: 'Under Review', bg: 'rgba(59,130,246,0.14)',  border: 'rgba(59,130,246,0.4)',  color: '#60a5fa' },
  assigned:     { label: 'Assigned',     bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.35)', color: '#fbbf24' },
  resolved:     { label: 'Resolved',     bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.3)',  color: '#4ade80' },
};

const OUTCOMES = [
  { key: 'refund', label: 'Approve Refund', sub: 'Full amount to customer', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.3)',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  { key: 'reject', label: 'Reject Claim',   sub: 'Close without action',   color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> },
  { key: 'info',   label: 'More Info',      sub: 'Contact customer/rider', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
];

// ─── CLEAN TIMELINE COMPONENT ─────────────────────────────
// Connector sits in its own row *below* the circles so it never cuts through icons.
const TRACK_H = 10;
const NODE = 34;

function ResolutionTimeline({ steps }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', padding: '2px 0 6px' }}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;

        const isDone    = step.done && !step.current;
        const isCurrent = step.current;
        const isPending = !step.done && !step.current;

        const nodeColor   = isDone ? '#4ade80' : isCurrent ? '#3b82f6' : 'rgba(255,255,255,0.18)';
        const nodeBg      = isDone ? 'rgba(74,222,128,0.12)' : isCurrent ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)';
        const labelColor  = isDone ? '#4ade80' : isCurrent ? '#60a5fa' : 'rgba(255,255,255,0.35)';
        const timeColor   = isCurrent ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.3)';

        const segStartDone = step.done || step.current;
        const next = steps[i + 1];
        const segEndActive = next && (next.done || next.current);
        const lineLeft  = segStartDone ? '#2563eb' : 'rgba(255,255,255,0.1)';
        const lineRight = segEndActive ? '#2563eb' : 'rgba(255,255,255,0.1)';

        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: NODE,
                height: NODE,
                borderRadius: '50%',
                background: nodeBg,
                border: `2px solid ${nodeColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: isCurrent
                  ? '0 0 0 4px rgba(59,130,246,0.12)'
                  : isDone
                    ? '0 0 0 3px rgba(74,222,128,0.08)'
                    : 'none',
              }}
            >
              {isDone && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {isCurrent && (
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 8px rgba(59,130,246,0.85)' }} />
              )}
              {isPending && (
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
              )}
            </div>

            <div
              style={{
                width: '100%',
                height: TRACK_H,
                position: 'relative',
                flexShrink: 0,
                marginTop: 6,
              }}
            >
              {!isLast && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    right: '-50%',
                    top: '50%',
                    height: 2,
                    marginTop: -1,
                    borderRadius: 1,
                    background: `linear-gradient(90deg, ${lineLeft}, ${lineRight})`,
                  }}
                />
              )}
            </div>

            <p
              style={{
                margin: '8px 0 3px',
                fontSize: 10,
                fontWeight: 700,
                color: labelColor,
                letterSpacing: '0.04em',
                textAlign: 'center',
                lineHeight: 1.3,
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}
            >
              {step.label}
              {isCurrent && (
                <span style={{ display: 'block', fontSize: 9, fontWeight: 400, color: '#60a5fa', letterSpacing: 0, marginTop: 2 }}>
                  Current
                </span>
              )}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 10,
                color: timeColor,
                textAlign: 'center',
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}
            >
              {step.time !== 'Current' ? step.time : ''}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════
export default function ReportsPage() {
  const [activeTab,  setActiveTab]  = useState('all');
  const [selectedId, setSelectedId] = useState(942);
  const [sortBy,     setSortBy]     = useState('Newest First');
  const [outcome,    setOutcome]    = useState(null);

  const tabs = [
    { key: 'all',       label: 'All Reports'      },
    { key: 'user',      label: 'User Issues'      },
    { key: 'deliverer', label: 'Deliverer Issues' },
  ];

  const filtered = useMemo(() => {
    const byTab = activeTab === 'all'
      ? REPORTS
      : REPORTS.filter((r) => r.issueType === activeTab);

    const priorityRank = { HIGH: 3, MEDIUM: 2, LOW: 1, RESOLVED: 0 };
    const sorted = [...byTab];

    if (sortBy === 'Oldest First') {
      sorted.sort((a, b) => a.id - b.id);
    } else if (sortBy === 'High Priority') {
      sorted.sort((a, b) => {
        const prioDelta = (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
        return prioDelta !== 0 ? prioDelta : b.id - a.id;
      });
    } else {
      sorted.sort((a, b) => b.id - a.id);
    }

    return sorted;
  }, [activeTab, sortBy]);

  useEffect(() => {
    if (filtered.length === 0) return;
    if (!filtered.some((r) => r.id === selectedId)) {
      setSelectedId(filtered[0].id);
      setOutcome(null);
    }
  }, [filtered, selectedId]);

  const report = REPORTS.find(r => r.id === selectedId) || REPORTS[0];
  const pc = PRIORITY_MAP[report.priority] || PRIORITY_MAP.LOW;
  const sc = STATUS_MAP[report.status]     || STATUS_MAP.under_review;

  return (
    <>
      {/* ─────────────────────────────────────────────────────
          3-COLUMN CONTENT (NO sidebar here — that lives in
          AdminLayout which wraps this component)
      ───────────────────────────────────────────────────── */}
      <div className="reports-admin-layout">

        {/* ══ LEFT — Report List ══ */}
        <div className="reports-reports-left-col" style={{ borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', background: '#0a1628', overflow: 'hidden' }}>

          <div style={{ padding: '18px 16px 0', flexShrink: 0 }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: 'white', letterSpacing: '-0.2px' }}>Recent Reports</h2>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 12 }}>
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ flex: 1, padding: '8px 4px', fontSize: 11, fontWeight: 600, background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === t.key ? '#3b82f6' : 'transparent'}`, color: activeTab === t.key ? '#60a5fa' : 'rgba(255,255,255,0.4)', cursor: 'pointer', marginBottom: -1, transition: 'all .15s', whiteSpace: 'nowrap' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: '100%', padding: '7px 30px 7px 28px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: "'DM Sans', system-ui, sans-serif", cursor: 'pointer', appearance: 'none', outline: 'none' }}>
                <option>Newest First</option><option>Oldest First</option><option>High Priority</option>
              </select>
              <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 16px' }}>
            {filtered.length === 0 && (
              <p style={{ margin: '8px 4px', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                No reports match the current filter.
              </p>
            )}
            {filtered.map(r => {
              const isSelected = r.id === selectedId;
              const p = PRIORITY_MAP[r.priority] || PRIORITY_MAP.LOW;
              return (
                <div key={r.id} onClick={() => { setSelectedId(r.id); setOutcome(null); }}
                  style={{ padding: '13px 12px', borderRadius: 10, marginBottom: 6, cursor: 'pointer', background: isSelected ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.025)', border: `1px solid ${isSelected ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.06)'}`, transition: 'all .15s' }}
                  onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}}
                  onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}}>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {r.priority === 'RESOLVED'
                        ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        : <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.dot }}/>}
                      <span style={{ fontSize: 10, fontWeight: 700, color: p.color, letterSpacing: '0.07em' }}>
                        {r.priority === 'RESOLVED' ? 'RESOLVED' : r.priority}
                      </span>
                    </div>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{r.time}</span>
                  </div>

                  <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: 'white', lineHeight: 1.35 }}>{r.title}</p>
                  <p style={{ margin: '0 0 9px', fontSize: 11, color: 'rgba(255,255,255,0.42)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{r.desc}</p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#1a4a6a,#0d2a4a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: 'white' }}>{r.userInitials}</div>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{r.user}</span>
                    </div>
                    {isSelected && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ CENTER — Report Detail ══ */}
        <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', background: '#08121e' }}>

          {/* Header */}
          <div style={{ padding: '18px 22px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: '-0.3px' }}>Report #{report.id}</h2>
              <span style={{ padding: '3px 10px', borderRadius: 5, background: pc.bg, border: `1px solid ${pc.border}`, color: pc.color, fontSize: 10, fontWeight: 700, letterSpacing: '0.07em' }}>
                {report.priority === 'RESOLVED' ? 'RESOLVED' : `${report.priority} PRIORITY`}
              </span>
              <span style={{ padding: '3px 10px', borderRadius: 5, background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color, fontSize: 10, fontWeight: 700 }}>
                {sc.label}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 7 }}>
              <span>Regarding Order</span>
              <span style={{ color: '#60a5fa', fontWeight: 600 }}>{report.orderId}</span>
              <span style={{ color: 'rgba(255,255,255,0.18)' }}>•</span>
              <span>Created {report.createdAt}</span>
            </p>
          </div>

          <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* ── Complaint Details ── */}
            <div style={{ background: 'linear-gradient(145deg,#0d1e3a,#081528)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'white' }}>Complaint Details</h3>
              </div>
              <p style={{ margin: '0 0 14px', padding: '13px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 9, borderLeft: '3px solid rgba(251,191,36,0.4)', fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
                {report.complaint}
              </p>
              {report.images.length > 0 && (
                <div style={{ display: 'flex', gap: 10 }}>
                  {report.images.map((img, i) => (
                    <div key={i} style={{ width: 100, height: 72, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, cursor: 'pointer', transition: 'border-color .15s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                      {img}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Report Resolution ── */}
            <div style={{ background: 'linear-gradient(145deg,#0d1e3a,#081528)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'white' }}>Report Resolution</h3>
              </div>

              {/* ✅ Clean timeline */}
              <ResolutionTimeline steps={report.timeline}/>

              {/* Final outcome selection */}
              {report.status !== 'resolved' && (
                <>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0 16px' }}/>
                  <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>SELECT FINAL OUTCOME</p>
                  <div className="reports-outcome-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    {OUTCOMES.map(o => (
                      <button key={o.key} onClick={() => setOutcome(outcome === o.key ? null : o.key)}
                        style={{ padding: '13px 8px', borderRadius: 10, background: outcome === o.key ? o.bg : 'rgba(255,255,255,0.03)', border: `1px solid ${outcome === o.key ? o.border : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, transition: 'all .18s' }}
                        onMouseEnter={e => { if (outcome !== o.key) { e.currentTarget.style.background = o.bg; e.currentTarget.style.borderColor = o.border; }}}
                        onMouseLeave={e => { if (outcome !== o.key) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}}>
                        {o.icon}
                        <span style={{ fontSize: 11, fontWeight: 700, color: outcome === o.key ? o.color : 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 1.3 }}>{o.label}</span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', textAlign: 'center', lineHeight: 1.3 }}>{o.sub}</span>
                      </button>
                    ))}
                  </div>
                  {outcome && (
                    <button style={{ marginTop: 12, width: '100%', padding: '11px', borderRadius: 9, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)', transition: 'opacity .15s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.87'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                      Confirm &amp; Close Report
                    </button>
                  )}
                </>
              )}

              {report.status === 'resolved' && (
                <div style={{ padding: '11px 14px', background: 'rgba(74,222,128,0.07)', borderRadius: 9, border: '1px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', gap: 9 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 600 }}>This report has been resolved.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ RIGHT — Order & People ══ */}
        <div className="reports-reports-right-col" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', background: '#0a1628', overflowY: 'auto' }}>
          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Map */}
            <div style={{ borderRadius: 10, overflow: 'hidden', height: 110, background: '#071020', border: '1px solid rgba(255,255,255,0.07)', position: 'relative' }}>
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 256 110" preserveAspectRatio="xMidYMid slice">
                <rect width="256" height="110" fill="#071020"/>
                {[32,64,96,128,160,192,224].map((x,i) => <line key={i} x1={x} y1="0" x2={x} y2="110" stroke="rgba(59,130,246,0.06)" strokeWidth="1"/>)}
                {[28,56,84].map((y,i) => <line key={i} x1="0" y1={y} x2="256" y2={y} stroke="rgba(59,130,246,0.06)" strokeWidth="1"/>)}
                <path d="M0 65 Q64 48 128 60 T256 52" stroke="rgba(59,130,246,0.18)" strokeWidth="2" fill="none"/>
                <path d="M0 80 Q64 66 128 76 T256 68" stroke="rgba(59,130,246,0.1)" strokeWidth="1.5" fill="none"/>
                <circle cx="128" cy="60" r="14" fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.35)" strokeWidth="1.5"/>
                <circle cx="128" cy="60" r="5" fill="#3b82f6"/>
              </svg>
              <div style={{ position: 'absolute', bottom: 7, left: 10 }}>
                <p style={{ margin: '0 0 1px', fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>ORDER LOCATION</p>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: 'white' }}>123 Market St, Algiers</p>
              </div>
            </div>

            {/* Order Details */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>Order Details</span>
                <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.22)', color: '#4ade80', fontSize: 9, fontWeight: 700 }}>{report.orderDetails.status}</span>
              </div>
              {[
                { label: 'Order ID', val: report.orderDetails.orderId, mono: true },
                { label: 'Total',    val: report.orderDetails.total },
                { label: 'Payment', val: report.orderDetails.payment },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '6px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', flexShrink: 0 }}>{row.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: row.mono ? '#60a5fa' : 'rgba(255,255,255,0.78)', fontFamily: row.mono ? "'JetBrains Mono', monospace" : 'inherit', textAlign: 'right' }}>{row.val}</span>
                </div>
              ))}
              <p style={{ margin: '10px 0 7px', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em' }}>ITEMS</p>
              {report.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{item.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.78)' }}>{item.price}</span>
                </div>
              ))}
            </div>

            {/* Customer */}
            <PersonCard label="CUSTOMER" data={report.customer} extraLabel="REPORTS" extraVal={report.customer.reports} extraColor="#f87171" avatarBg="linear-gradient(135deg,#1a4a6a,#0d2a4a)"/>

            {/* Deliverer */}
            <PersonCard label="DELIVERER" data={report.deliverer} extraLabel="TRIPS" extraVal={report.deliverer.trips} extraColor="#fbbf24" avatarBg="linear-gradient(135deg,#3a2a1a,#2a1a0d)"/>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(.8)} }
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.18);border-radius:2px}
        select option{background:#0d1f38;color:white}
        .reports-admin-layout {
          display: grid;
          grid-template-columns: 320px 1fr 256px;
          min-height: calc(100vh - 57px);
          height: calc(100vh - 57px);
          overflow: hidden;
          font-family: 'DM Sans', system-ui, sans-serif;
          background: #07101f;
        }
        @media (max-width: 1024px) {
          .reports-admin-layout {
            grid-template-columns: 1fr;
            height: auto;
            min-height: calc(100vh - 57px);
            overflow: visible;
          }
          .reports-reports-left-col {
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            max-height: min(420px, 55vh);
          }
          .reports-reports-right-col {
            border-left: none !important;
            border-top: 1px solid rgba(255,255,255,0.06);
          }
        }
        @media (max-width: 640px) {
          .reports-outcome-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

// ─── PERSON CARD (customer / deliverer) ───────────────────
function PersonCard({ label, data, extraLabel, extraVal, extraColor, avatarBg }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.32)', letterSpacing: '0.12em' }}>{label}</span>
        <button style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 0, display: 'flex' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>{data.initials}</div>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{data.name}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
        {[
          { lbl: 'RATING', val: `${data.rating} ★`, color: '#fbbf24' },
          { lbl: extraLabel, val: extraVal, color: extraColor },
        ].map((s, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 7, padding: '8px 10px' }}>
            <p style={{ margin: '0 0 3px', fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em' }}>{s.lbl}</p>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}