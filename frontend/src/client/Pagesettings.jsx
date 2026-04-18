// ═══════════════════════════════════════════════════════════
// PageSettings.jsx — Profile Information (fixed)
// ═══════════════════════════════════════════════════════════
import { useState } from 'react';
import { TopBar } from './Shared';
const AlgiersImage = null;

// ─── ALGIERS IMAGE ────────────────────────────────────────
const ALGIERS_IMG = AlgiersImage;

// ─── CLEAN TOGGLE ─────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 38, height: 21, borderRadius: 11,
        background: checked ? '#2563eb' : 'rgba(255,255,255,0.12)',
        position: 'relative', cursor: 'pointer',
        transition: 'background .2s',
        flexShrink: 0,
      }}>
      <div style={{
        width: 15, height: 15, borderRadius: '50%', background: 'white',
        position: 'absolute', top: 3,
        left: checked ? 20 : 3,
        transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }}/>
    </div>
  );
}

export default function PageSettings({ currentUser, setActive, addToast }) {
  const [firstName,   setFirstName]   = useState(currentUser?.name?.split(' ')[0] || 'Mohamed');
  const [lastName,    setLastName]    = useState(currentUser?.name?.split(' ')[1] || 'Benali');
  const [email,       setEmail]       = useState('m.benali@wassali.dz');
  const [pubProfile,  setPubProfile]  = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [curPwd,  setCurPwd]  = useState('');
  const [newPwd,  setNewPwd]  = useState('');
  const [confPwd, setConfPwd] = useState('');
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saved,   setSaved]   = useState(false);

  const inputStyle = {
    width:'100%', boxSizing:'border-box', padding:'9px 12px', fontSize:12,
    color:'white', borderRadius:10, background:'#112040',
    border:'1px solid rgba(255,255,255,.09)',
    fontFamily:"'DM Sans',system-ui,sans-serif", outline:'none',
  };
  const labelStyle = {
    display:'block', fontSize:9, fontWeight:700,
    color:'rgba(255,255,255,.28)', letterSpacing:'0.1em',
    marginBottom:5, fontFamily:"'DM Sans',system-ui,sans-serif",
  };

  return (
    <div style={{ animation:'cdFadeUp .3s ease both' }}>
      <TopBar placeholder="Search security logs, active sessions..." onSettings={() => setActive?.('settings')} setActive={setActive} addToast={addToast} currentUser={currentUser} />
      <div className="cd-page-wrap" style={{ paddingTop: 24 }}>

        <h1 style={{ margin:'0 0 3px', fontSize:22, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Profile Information</h1>
        <p style={{ margin:'0 0 20px', fontSize:12, color:'rgba(255,255,255,.45)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
          Manage your personal details and authentication preferences.
        </p>

        <div className="cd-settings-layout">

          {/* ── LEFT ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Personal Info */}
            <div style={{ borderRadius:16, padding:20, background:'linear-gradient(145deg,#0e2040,#091830)', border:'1px solid rgba(255,255,255,.07)' }}>
              <div style={{ marginBottom:16 }}>
                <span style={{ fontSize:9, fontWeight:700, color:'#60a5fa', background:'rgba(59,130,246,.1)', border:'1px solid rgba(59,130,246,.18)', padding:'2px 9px', borderRadius:4, letterSpacing:'0.12em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>ACCOUNT IDENTITY</span>
                <h3 style={{ margin:'10px 0 2px', fontSize:15, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Personal Info</h3>
                <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,.35)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>Last profile change 12 days ago</p>
              </div>

              {/* Avatar */}
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
                <div style={{ position:'relative' }}>
                  <div style={{ width:56, height:56, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, fontWeight:700, color:'white', background:'linear-gradient(135deg,#1a4a6a,#0d2a4a)', border:'2px solid rgba(59,130,246,.28)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                    {firstName.charAt(0)}
                  </div>
                  <div style={{ position:'absolute', bottom:0, right:0, width:18, height:18, borderRadius:'50%', background:'#2563eb', border:'2px solid #0e2040', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </div>
                </div>
                <div>
                  <p style={{ margin:'0 0 3px', fontSize:13, fontWeight:600, color:'white', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{firstName} {lastName}</p>
                  <button style={{ background:'none', border:'none', fontSize:10, color:'#60a5fa', cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif", padding:0, letterSpacing:'0.06em' }}>UPLOAD NEW PHOTO</button>
                </div>
              </div>

              {/* Name fields */}
              <div className="cd-settings-form-2">
                {[{ label:'FIRST NAME', val:firstName, set:setFirstName },{ label:'LAST NAME', val:lastName, set:setLastName }].map(f => (
                  <div key={f.label}>
                    <label style={labelStyle}>{f.label}</label>
                    <input className="cd-input" value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle}/>
                  </div>
                ))}
              </div>

              {/* Email */}
              <div style={{ marginBottom:16 }}>
                <label style={labelStyle}>EMAIL ADDRESS</label>
                <div style={{ position:'relative' }}>
                  <input className="cd-input" value={email} onChange={e => setEmail(e.target.value)} style={{ ...inputStyle, paddingRight:34 }}/>
                  <svg style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>

              {/* Footer */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:14, borderTop:'1px solid rgba(255,255,255,.05)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:26, height:26, borderRadius:7, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <p style={{ margin:0, fontSize:11, fontWeight:500, color: saved ? '#4ade80' : 'rgba(255,255,255,.5)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                    {saved ? 'Changes Saved' : 'Details Unsaved'}
                  </p>
                </div>
                <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }} className="cd-primary-btn"
                  style={{ display:'flex', alignItems:'center', gap:7, border:'none', borderRadius:10, padding:'9px 18px', color:'#1e3a5f', fontSize:12, fontWeight:700, cursor:'pointer', background:'#ADC6FF', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Save Changes
                </button>
              </div>
            </div>

            {/* Login Credentials */}
            <div style={{ borderRadius:16, padding:18, background:'#0c1e35', border:'1px solid rgba(255,255,255,.06)' }}>
              <h3 style={{ margin:'0 0 14px', fontSize:14, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Login Credentials</h3>
              <div className="cd-settings-form-3">
                {[
                  { label:'CURRENT PASSWORD',    val:curPwd,  set:setCurPwd,  show:showCur, toggle:() => setShowCur(!showCur) },
                  { label:'NEW PASSWORD',         val:newPwd,  set:setNewPwd,  show:showNew, toggle:() => setShowNew(!showNew) },
                  { label:'CONFIRM NEW PASSWORD', val:confPwd, set:setConfPwd, show:false,   toggle:null },
                ].map(f => (
                  <div key={f.label}>
                    <label style={labelStyle}>{f.label}</label>
                    <div style={{ position:'relative' }}>
                      <input type={f.show ? 'text' : 'password'} className="cd-input" value={f.val} onChange={e => f.set(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingRight: f.toggle ? 32 : 12 }}/>
                      {f.toggle && (
                        <button onClick={f.toggle} style={{ position:'absolute', right:9, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(255,255,255,.28)', cursor:'pointer', padding:0 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {f.show
                              ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></>
                              : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button className="cd-btn-outline" style={{ background:'transparent', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'9px 18px', color:'rgba(255,255,255,.5)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                  Update Security Credentials
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Notifications / Preferences */}
            <div style={{ borderRadius:16, padding:18, background:'#0c1e35', border:'1px solid rgba(255,255,255,.06)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <span style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,.28)', letterSpacing:'0.12em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>PREFERENCES</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>

              <p style={{ margin:'0 0 2px', fontSize:10, color:'rgba(255,255,255,.3)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>Primary Region</p>
              <p style={{ margin:'0 0 14px', fontSize:16, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Algiers District</p>

              {/* Toggles — clean, no check icon */}
              {[
                { label:'Public Profile',  sub:'Visible to other users',  val:pubProfile,  set:setPubProfile },
                { label:'Email Alerts',    sub:'Delivery notifications',   val:emailAlerts, set:setEmailAlerts },
              ].map((t, i) => (
                <div key={t.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 0', borderBottom: i === 0 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                  <div>
                    <p style={{ margin:'0 0 1px', fontSize:12, color:'rgba(255,255,255,.7)', fontFamily:"'DM Sans',system-ui,sans-serif", fontWeight:500 }}>{t.label}</p>
                    <p style={{ margin:0, fontSize:10, color:'rgba(255,255,255,.28)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>{t.sub}</p>
                  </div>
                  <Toggle checked={t.val} onChange={t.set}/>
                </div>
              ))}
            </div>

            {/* Wallet balance */}
            <div style={{ borderRadius:16, padding:18, background:'linear-gradient(145deg,#0e2040,#091830)', border:'1px solid rgba(59,130,246,.18)' }}>
              <p style={{ margin:'0 0 3px', fontSize:9, fontWeight:700, color:'rgba(255,255,255,.28)', letterSpacing:'0.12em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>WALLET BALANCE</p>
              <div style={{ display:'flex', alignItems:'flex-end', gap:5 }}>
                <span style={{ fontSize:22, fontWeight:700, color:'white', lineHeight:1, fontFamily:"'Outfit',system-ui,sans-serif" }}>45.500,00</span>
                <span style={{ fontSize:11, color:'rgba(255,255,255,.35)', marginBottom:1, fontFamily:"'DM Sans',system-ui,sans-serif" }}>DZD</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── City Banner with real Algiers image ── */}
        <div style={{ marginTop:28, borderRadius:16, overflow:'hidden', display:'flex', border:'1px solid rgba(255,255,255,.06)', minHeight:130 }}>
          <div style={{ flex:1, padding:'18px 22px', display:'flex', flexDirection:'column', justifyContent:'center', background:'#0b1c30', borderRight:'1px solid rgba(255,255,255,.05)', borderRadius:'16px 0 0 16px' }}>
            <p style={{ margin:'0 0 6px', fontSize:14, fontWeight:700, color:'white', fontFamily:"'Outfit',system-ui,sans-serif" }}>Security of Algerian Excellence</p>
            <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,.4)', lineHeight:1.65, maxWidth:440, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
              Wassali Velocity utilizes bank-grade encryption and regional identity verification to secure your logistics data across the entire Algerian territory.
            </p>
          </div>
          <div style={{ width:260, flexShrink:0, position:'relative', overflow:'hidden' }}>
            {ALGIERS_IMG ? (
              <img
                src={ALGIERS_IMG}
                alt="Algiers"
                style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }}
                onError={e => { e.target.style.display='none'; }}
              />
            ) : (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.3)', fontSize:11, letterSpacing:'0.08em', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                ALGIERS DISTRICT
              </div>
            )}
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg, rgba(11,28,48,0.65) 0%, rgba(11,28,48,0.15) 100%)' }}/>
            <div style={{ position:'absolute', bottom:10, left:12, display:'flex', alignItems:'center', gap:5 }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', color:'#60a5fa', fontFamily:"'DM Sans',system-ui,sans-serif" }}>SECURE HQ – ALGIERS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}