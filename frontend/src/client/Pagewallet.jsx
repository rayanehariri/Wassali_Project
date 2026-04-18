// ═══════════════════════════════════════════════════════════
// Pagewallet.jsx — Billing & Financials
// ═══════════════════════════════════════════════════════════
import { useState } from 'react';
import { TRANSACTIONS, TxIcon, Badge, TopBar, CityBanner } from './Shared';
const AlgiersImage = null;

import TopUpModal     from './wallet/TopUpModal';
import TxHistoryModal from './wallet/TxHistoryModal';
import AddCardModal   from './wallet/AddCardModal';

const ALGIERS_IMG = AlgiersImage;

export default function PageWallet({ onSettings, setActive, addToast, currentUser }) {
  const [modal, setModal] = useState(null);

  const walletCards = [
    {
      tag:   'REWARDS PROGRAM',
      icon:  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
      title: 'Total Cashback Earned',
      val:   '1.250,00',
      footer: (
        <p style={{ margin:'8px 0 0', fontSize:11, color:'#4ade80', display:'flex', alignItems:'center', gap:4, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          +12% vs last month
        </p>
      ),
    },
    {
      tag:   'SPENDING ANALYSIS',
      icon:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
      title: 'Spending this Month',
      val:   '24.800,00',
      footer: (
        <div style={{ marginTop:10 }}>
          <div style={{ height:5, background:'rgba(255,255,255,.08)', borderRadius:3, overflow:'hidden', marginBottom:5 }}>
            <div style={{ height:'100%', width:'65%', background:'#3b82f6', borderRadius:3 }}/>
          </div>
          <p style={{ margin:0, fontSize:9, color:'rgba(255,255,255,.3)', letterSpacing:'0.1em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>65% OF MONTHLY BUDGET USED</p>
        </div>
      ),
    },
    {
      tag:   'WASSALI WALLET',
      icon:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8L2 7h20l-6-4z"/></svg>,
      title: 'Available Funds',
      val:   '12.450,00',
      footer: (
        <button onClick={() => setModal('topup')} className="cd-primary-btn"
          style={{ marginTop:12, width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:6, border:'none', borderRadius:10, padding:'10px 0', color:'#0a1628', fontSize:12, fontWeight:700, cursor:'pointer', background:'linear-gradient(135deg,#ADC6FF,#7aa8f5)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0a1628" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Top Up Balance
        </button>
      ),
    },
  ];

  return (
    <div style={{ animation:'cdFadeUp .3s ease both' }}>
      <TopBar placeholder="Search transactions, invoices..." onSettings={onSettings} setActive={setActive} addToast={addToast} currentUser={currentUser} />
      <div className="cd-page-wrap">

        <h1 style={{ margin:'0 0 4px', fontSize:24, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Billing &amp; Financials</h1>
        <p style={{ margin:'0 0 22px', fontSize:13, color:'rgba(255,255,255,.5)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>Manage your Wassali Wallet, payment methods, and Your Rewards.</p>

        {/* ── Metric cards — numbers are white as in Figma ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:26 }}>
          {walletCards.map((c, i) => (
            <div key={i} className="cd-card-hover"
              style={{ background:'linear-gradient(145deg,#0e2040,#091830)', border:'1px solid rgba(255,255,255,.07)', borderRadius:16, padding:18, animation:`cdFadeUp .3s ease ${i*.07}s both` }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,.28)', letterSpacing:'0.12em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{c.tag}</span>
                {c.icon}
              </div>
              <p style={{ margin:'0 0 4px', fontSize:11, color:'rgba(255,255,255,.45)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{c.title}</p>
              {/* Numbers are white — matching Figma screenshot */}
              <div style={{ display:'flex', alignItems:'flex-end', gap:5 }}>
                <span style={{ fontSize:24, fontWeight:700, color:'white', lineHeight:1, fontFamily:"'Outfit',system-ui,sans-serif" }}>{c.val}</span>
                <span style={{ fontSize:12, color:'rgba(255,255,255,.35)', marginBottom:1, fontFamily:"'DM Sans',system-ui,sans-serif" }}>DZD</span>
              </div>
              {c.footer}
            </div>
          ))}
        </div>

        {/* ── Saved Payment Methods ── */}
        <h3 style={{ margin:'0 0 12px', fontSize:15, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Saved Payment Methods</h3>

        {/* ── Payment cards — 3-column grid, all same size, matching Figma ── */}
        <div className="cd-wallet-stats">
          {[
            { last4:'4321', holder:'ALEX BENALI', expiry:'12/26', bg:'linear-gradient(145deg,#1a3a6a,#0e2650)' },
            { last4:'8810', holder:'ALEX BENALI', expiry:'09/25', bg:'linear-gradient(145deg,#1a3a5a,#0e2240)' },
          ].map((card, i) => (
            <div key={i} className="cd-card-hover"
              style={{ borderRadius:16, background:card.bg, border:'1px solid rgba(255,255,255,.1)', padding:'18px 20px', cursor:'pointer', display:'flex', flexDirection:'column', justifyContent:'space-between', minHeight:140, transition:'all .2s' }}>
              {/* Top row: chip + menu */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex' }}>
                  <div style={{ width:26, height:18, borderRadius:4, background:'rgba(37,99,235,.85)' }}/>
                  <div style={{ width:26, height:18, borderRadius:4, background:'rgba(29,78,216,.5)', marginLeft:-10 }}/>
                </div>
                <button style={{ background:'none', border:'none', color:'rgba(255,255,255,.35)', cursor:'pointer', padding:0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>
              </div>
              {/* Card number */}
              <p style={{ margin:'16px 0 14px', fontSize:13, color:'rgba(255,255,255,.7)', letterSpacing:'0.22em', fontFamily:"'JetBrains Mono',monospace" }}>•••• •••• •••• {card.last4}</p>
              {/* Holder + Expiry */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                <div>
                  <p style={{ margin:'0 0 3px', fontSize:8, fontWeight:700, color:'rgba(255,255,255,.3)', letterSpacing:'0.12em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>CARD HOLDER</p>
                  <p style={{ margin:0, fontSize:11, fontWeight:700, color:'rgba(255,255,255,.85)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{card.holder}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ margin:'0 0 3px', fontSize:8, fontWeight:700, color:'rgba(255,255,255,.3)', letterSpacing:'0.12em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>EXPIRES</p>
                  <p style={{ margin:0, fontSize:11, fontWeight:700, color:'rgba(255,255,255,.85)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{card.expiry}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Add card — SAME size as payment cards */}
          <div className="cd-card-hover" onClick={() => setModal('addcard')}
            style={{ borderRadius:16, border:'1.5px dashed rgba(173,198,255,0.2)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, cursor:'pointer', minHeight:140, background:'rgba(173,198,255,0.03)', transition:'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(173,198,255,0.45)'; e.currentTarget.style.background='rgba(173,198,255,0.07)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(173,198,255,0.2)'; e.currentTarget.style.background='rgba(173,198,255,0.03)'; }}>
            <div style={{ width:42, height:42, borderRadius:12, background:'rgba(173,198,255,0.1)', border:'1px solid rgba(173,198,255,0.22)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ADC6FF" strokeWidth="1.8">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8L2 7h20l-6-4z"/>
                <line x1="12" y1="13" x2="12" y2="17"/><line x1="10" y1="15" x2="14" y2="15"/>
              </svg>
            </div>
            <span style={{ fontSize:11, color:'rgba(255,255,255,.4)', textAlign:'center', fontFamily:"'DM Sans',system-ui,sans-serif", lineHeight:1.5 }}>Add Payment<br/>Method</span>
          </div>
        </div>

        {/* ── Recent Transactions ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Recent Transaction History</h3>
          <button onClick={() => setModal('history')}
            style={{ background:'none', border:'none', fontSize:12, color:'#60a5fa', cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif", fontWeight:600 }}>
            View Full List
          </button>
        </div>
        <div style={{ borderRadius:14, background:'#0c1e35', border:'1px solid rgba(255,255,255,.07)', overflow:'hidden' }}>
          <div className="cd-wallet-table-wrap">
            <div style={{ minWidth: 720 }}>
          <div style={{ display:'grid', padding:'10px 22px', borderBottom:'1px solid rgba(255,255,255,.06)', fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'rgba(255,255,255,.25)', gridTemplateColumns:'145px 1fr 130px 165px 110px', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
            <span>TRANSACTION ID</span><span>DESCRIPTION</span><span>DATE</span><span>AMOUNT</span><span>STATUS</span>
          </div>
          {TRANSACTIONS.map((tx, i) => (
            <div key={tx.id} className="cd-order-hover"
              style={{ display:'grid', alignItems:'center', padding:'13px 22px', borderBottom:'1px solid rgba(255,255,255,.04)', gridTemplateColumns:'145px 1fr 130px 165px 110px', animation:`cdFadeUp .25s ease ${i*.05}s both` }}>
              <span style={{ fontSize:11, color:'rgba(96,165,250,.8)', fontFamily:"'JetBrains Mono',monospace" }}>{tx.id}</span>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <TxIcon id={tx.id} neg={tx.neg}/>
                <span style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,.8)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{tx.desc}</span>
              </div>
              <span style={{ fontSize:12, color:'rgba(255,255,255,.4)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{tx.date}</span>
              {/* Green for positive, red for negative — matches Figma */}
              <span style={{ fontSize:13, fontWeight:700, color:tx.neg?'#f87171':'#4ade80', fontFamily:"'JetBrains Mono',monospace" }}>{tx.amount}</span>
              <Badge status="completed" label="● COMPLETED"/>
            </div>
          ))}
            </div>
          </div>
        </div>

        <CityBanner
          title="Secure Financial Operations"
          desc="Your financial data is protected by state-of-the-art encryption and bank-grade security protocols, ensuring every transaction within Algiers and beyond is safe and transparent."
          location="FINANCIAL HUB – ALGIERS"
          image={ALGIERS_IMG}
        />
      </div>

      {modal === 'topup'   && <TopUpModal     onClose={() => setModal(null)} balance="12.450,00"/>}
      {modal === 'history' && <TxHistoryModal  onClose={() => setModal(null)}/>}
      {modal === 'addcard' && <AddCardModal    onClose={() => setModal(null)}/>}
    </div>
  );
}