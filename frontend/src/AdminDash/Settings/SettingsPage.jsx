import { useState, useRef } from 'react';

function TopBar({ title, subtitle }) {
  return (
    <div className="admin-settings-topbar" style={{ background: '#0d1f38', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'white' }}>{title}</h1>
        {subtitle && <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={{ position: 'relative', width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', background: '#ef4444', border: '1.5px solid #0d1f38' }}/>
        </button>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer' }}>A</div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder = '', icon, rightEl }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: '0.02em' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {icon && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', display: 'flex' }}>{icon}</span>}
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ width: '100%', boxSizing: 'border-box', padding: `10px ${rightEl ? 38 : 14}px 10px ${icon ? 38 : 14}px`, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'white', fontSize: 13, fontFamily: "'DM Sans', system-ui, sans-serif", outline: 'none', transition: 'border-color .2s' }}
          onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.6)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
        />
        {rightEl && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>{rightEl}</span>}
      </div>
    </div>
  );
}

function SectionRow({ sideTitle, sideDesc, children }) {
  return (
    <div className="settings-section-row" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32, padding: '32px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: 'white' }}>{sideTitle}</h2>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{sideDesc}</p>
      </div>
      <div style={{ background: 'linear-gradient(145deg,#0e2040,#091830)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 24 }}>
        {children}
      </div>
    </div>
  );
}

function NotifRow({ label, sub, defaultOn, isLast }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '13px 0', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>{label}</p>
        <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{sub}</p>
      </div>
      <div onClick={() => setOn(v => !v)} style={{ width: 42, height: 23, borderRadius: 12, background: on ? '#2563eb' : 'rgba(255,255,255,0.12)', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
        <div style={{ width: 17, height: 17, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: on ? 22 : 3, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}/>
      </div>
    </div>
  );
}

const NOTIF_PREFS = [
  { label: 'New order alerts',           sub: 'Get notified when a new order is placed',          def: true  },
  { label: 'Delivery status updates',    sub: 'Alerts when deliveries change status',             def: true  },
  { label: 'User reports & complaints',  sub: 'Notifications for new reports submitted',          def: true  },
  { label: 'Weekly summary digest',      sub: 'Receive a weekly analytics email every Monday',    def: false },
  { label: 'System maintenance alerts',  sub: 'Be informed of scheduled downtime',                def: false },
];

export default function SettingsPage() {
  const [firstName,  setFirstName]  = useState('Admin');
  const [lastName,   setLastName]   = useState('User');
  const [email,      setEmail]      = useState('admin@wassali.com');
  const [curPwd,     setCurPwd]     = useState('');
  const [newPwd,     setNewPwd]     = useState('');
  const [confPwd,    setConfPwd]    = useState('');
  const [showCur,    setShowCur]    = useState(false);
  const [showNew,    setShowNew]    = useState(false);
  const [showConf,   setShowConf]   = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [pwdSaved,   setPwdSaved]   = useState(false);
  const [avatar,     setAvatar]     = useState(null);
  const fileRef = useRef(null);

  function handleSaveProfile() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleSavePwd() {
    if (!curPwd || !newPwd || !confPwd) return;
    if (newPwd !== confPwd) return;
    setPwdSaved(true);
    setCurPwd(''); setNewPwd(''); setConfPwd('');
    setTimeout(() => setPwdSaved(false), 2500);
  }

  const EyeIcon = ({ show, toggle }) => (
    <button onClick={toggle} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 0, display: 'flex' }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {show
          ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></>
          : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
      </svg>
    </button>
  );

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .admin-settings-topbar { flex-wrap: wrap; gap: 12px; padding: 12px 16px !important; }
          .settings-section-row {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
            padding: 24px 0 !important;
          }
          .settings-danger-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .settings-danger-actions {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
          }
          .settings-danger-actions button { margin-left: 0 !important; width: 100%; }
          .settings-form-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div style={{ minHeight: '100%', width: '100%', background: '#07101f', fontFamily: "'DM Sans', system-ui, sans-serif", display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar title="Settings" subtitle="Manage your account preferences and security"/>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 48px', maxWidth: 960, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

          <SectionRow
            sideTitle="Profile Information"
            sideDesc="Update your public profile details and avatar.">

            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24, padding: '16px 18px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: avatar ? 'transparent' : 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'white', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.15)' }}>
                  {avatar
                    ? <img src={URL.createObjectURL(avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                </div>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: 'white' }}>Profile Photo</p>
                <p style={{ margin: '0 0 10px', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Accepts JPG, PNG or GIF. Max size 2MB.</p>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setAvatar(e.target.files[0])}/>
                <button onClick={() => fileRef.current.click()}
                  style={{ padding: '6px 14px', borderRadius: 7, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.35)', color: '#60a5fa', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; }}>
                  Change Photo
                </button>
              </div>
            </div>

            <div className="settings-form-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <Field label="First Name" value={firstName} onChange={setFirstName} placeholder="First name"/>
              <Field label="Last Name"  value={lastName}  onChange={setLastName}  placeholder="Last name"/>
            </div>

            <div style={{ marginBottom: 20 }}>
              <Field label="Email Address" value={email} onChange={setEmail} placeholder="your@email.com"
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleSaveProfile}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 9, background: saved ? 'rgba(74,222,128,0.15)' : 'linear-gradient(135deg,#2563eb,#1d4ed8)', border: saved ? '1px solid rgba(74,222,128,0.4)' : 'none', color: saved ? '#4ade80' : 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .25s', boxShadow: saved ? 'none' : '0 4px 16px rgba(37,99,235,0.35)' }}>
                {saved
                  ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Saved!</>
                  : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save Changes</>}
              </button>
            </div>
          </SectionRow>

          <SectionRow
            sideTitle="Login Credentials"
            sideDesc="Ensure your account stays secure by updating your password regularly.">

            <div style={{ marginBottom: 14 }}>
              <Field label="Current Password" value={curPwd} onChange={setCurPwd} type={showCur ? 'text' : 'password'} placeholder="Enter current password"
                rightEl={<EyeIcon show={showCur} toggle={() => setShowCur(s => !s)}/>}
              />
            </div>

            <div className="settings-form-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <Field label="New Password" value={newPwd} onChange={setNewPwd} type={showNew ? 'text' : 'password'} placeholder="New password"
                rightEl={<EyeIcon show={showNew} toggle={() => setShowNew(s => !s)}/>}
              />
              <Field label="Confirm New Password" value={confPwd} onChange={setConfPwd} type={showConf ? 'text' : 'password'} placeholder="Confirm password"
                rightEl={<EyeIcon show={showConf} toggle={() => setShowConf(s => !s)}/>}
              />
            </div>

            {newPwd && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
                <p style={{ margin: '0 0 6px', fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Password strength</p>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: newPwd.length > 10 ? '100%' : newPwd.length > 7 ? '65%' : '30%', background: newPwd.length > 10 ? '#4ade80' : newPwd.length > 7 ? '#fbbf24' : '#f87171', borderRadius: 2, transition: 'width .3s' }}/>
                </div>
              </div>
            )}

            {newPwd && confPwd && newPwd !== confPwd && (
              <p style={{ margin: '0 0 14px', fontSize: 11, color: '#f87171', display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                Passwords do not match
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleSavePwd}
                disabled={!curPwd || !newPwd || !confPwd || newPwd !== confPwd}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 9, background: pwdSaved ? 'rgba(74,222,128,0.15)' : (!curPwd || !newPwd || !confPwd || newPwd !== confPwd) ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#2563eb,#1d4ed8)', border: pwdSaved ? '1px solid rgba(74,222,128,0.4)' : '1px solid transparent', color: pwdSaved ? '#4ade80' : (!curPwd || !newPwd || !confPwd || newPwd !== confPwd) ? 'rgba(255,255,255,0.3)' : 'white', fontSize: 13, fontWeight: 600, cursor: (!curPwd || !newPwd || !confPwd || newPwd !== confPwd) ? 'not-allowed' : 'pointer', transition: 'all .25s', boxShadow: (!curPwd || !newPwd || !confPwd || newPwd !== confPwd) ? 'none' : '0 4px 16px rgba(37,99,235,0.35)' }}>
                {pwdSaved
                  ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Updated!</>
                  : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Update Password</>}
              </button>
            </div>
          </SectionRow>

          <SectionRow
            sideTitle="Notification Preferences"
            sideDesc="Control which alerts and updates you receive.">
            {NOTIF_PREFS.map((n, i) => (
              <NotifRow key={n.label} label={n.label} sub={n.sub} defaultOn={n.def} isLast={i === NOTIF_PREFS.length - 1} />
            ))}
          </SectionRow>

          <div style={{ padding: '32px 0' }}>
            <div className="settings-danger-grid" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32 }}>
              <div>
                <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#f87171' }}>Danger Zone</h2>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>Irreversible actions that affect your account.</p>
              </div>
              <div style={{ background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.18)', borderRadius: 14, padding: 24 }}>
                <div className="settings-danger-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: 'white' }}>Delete Account</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Permanently delete your admin account and all associated data.</p>
                  </div>
                  <button style={{ padding: '9px 18px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(248,113,113,0.45)', color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: 20, transition: 'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
