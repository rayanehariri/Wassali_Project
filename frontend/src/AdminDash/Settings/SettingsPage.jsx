import { useState, useRef, useCallback } from 'react';
import { http } from '../../api/http';
import { changePassword } from '../../auth/FakeUsers';

function EyeBtn({ show, toggle }) {
  return (
    <button onClick={toggle} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.35)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {show ? (
          <>
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </>
        ) : (
          <>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </>
        )}
      </svg>
    </button>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder = '', icon, rightEl }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.6)', fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: '.02em' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.3)', display: 'flex', pointerEvents: 'none' }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: `10px ${rightEl ? 38 : 14}px 10px ${icon ? 38 : 14}px`,
            background: 'rgba(255,255,255,.05)',
            border: '1px solid rgba(255,255,255,.12)',
            borderRadius: 8,
            color: '#fff',
            fontSize: 13,
            fontFamily: "'DM Sans', system-ui, sans-serif",
            outline: 'none',
            transition: 'border-color .2s',
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(59,130,246,.6)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,.12)')}
        />
        {rightEl && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
            {rightEl}
          </span>
        )}
      </div>
    </div>
  );
}

function Toggle({ on, setOn }) {
  return (
    <div
      onClick={() => setOn(v => !v)}
      style={{
        width: 42, height: 23, borderRadius: 12,
        background: on ? '#2563eb' : 'rgba(255,255,255,.12)',
        position: 'relative', cursor: 'pointer',
        transition: 'background .2s', flexShrink: 0,
      }}
    >
      <div style={{
        width: 17, height: 17, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3, left: on ? 22 : 3,
        transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)',
      }} />
    </div>
  );
}

function SectionRow({ sideTitle, sideDesc, titleColor = '#fff', children }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32,
      padding: '32px 0', borderBottom: '1px solid rgba(255,255,255,.06)',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}
      className="settings-section-row"
    >
      <div>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: titleColor }}>{sideTitle}</h2>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.45)', lineHeight: 1.6 }}>{sideDesc}</p>
      </div>
      <div style={{
        background: 'linear-gradient(145deg,#0e2040,#091830)',
        border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 14, padding: 24,
      }}>
        {children}
      </div>
    </div>
  );
}

function SaveBtn({ onClick, saved, disabled, savedLabel, normalIcon, normalLabel }) {
  const bg = saved
    ? 'rgba(74,222,128,.15)'
    : disabled
    ? 'rgba(255,255,255,.06)'
    : 'linear-gradient(135deg,#2563eb,#1d4ed8)';
  const border = saved ? '1px solid rgba(74,222,128,.4)' : '1px solid transparent';
  const color = saved ? '#4ade80' : disabled ? 'rgba(255,255,255,.3)' : '#fff';
  const shadow = disabled || saved ? 'none' : '0 4px 16px rgba(37,99,235,.35)';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '10px 22px', borderRadius: 9,
        background: bg, border, color, boxShadow: shadow,
        fontSize: 13, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all .25s',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {saved ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {savedLabel}
        </>
      ) : (
        <>{normalIcon}{normalLabel}</>
      )}
    </button>
  );
}

const NOTIF_PREFS = [
  { label: 'New order alerts',          sub: 'Get notified when a new order is placed',         def: true  },
  { label: 'Delivery status updates',   sub: 'Alerts when deliveries change status',            def: true  },
  { label: 'User reports & complaints', sub: 'Notifications for new reports submitted',         def: true  },
  { label: 'Weekly summary digest',     sub: 'Receive a weekly analytics email every Monday',   def: false },
  { label: 'System maintenance alerts', sub: 'Be informed of scheduled downtime',               def: false },
];

function NotifRow({ label, sub, def, isLast }) {
  const [on, setOn] = useState(def);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      padding: '13px 0',
      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,.05)',
    }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.85)' }}>{label}</p>
        <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,.35)' }}>{sub}</p>
      </div>
      <Toggle on={on} setOn={setOn} />
    </div>
  );
}

export default function SettingsPage({ currentUser }) {
  const [firstName, setFirstName] = useState((currentUser?.name || 'Admin User').split(' ')[0] || 'Admin');
  const [lastName,  setLastName]  = useState((currentUser?.name || 'Admin User').split(' ').slice(1).join(' ') || 'User');
  const [email,     setEmail]     = useState(currentUser?.email || 'admin@wassali.com');
  const [curPwd,    setCurPwd]    = useState('');
  const [newPwd,    setNewPwd]    = useState('');
  const [confPwd,   setConfPwd]   = useState('');
  const [showCur,   setShowCur]   = useState(false);
  const [showNew,   setShowNew]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [pwdSaved,  setPwdSaved]  = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [avatarURL, setAvatarURL] = useState(null);
  const fileRef = useRef(null);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await http.patch('/auth/me/', {
        username: `${firstName} ${lastName}`.trim(),
        email,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePwd = async () => {
    if (!curPwd || !newPwd || !confPwd || newPwd !== confPwd) return;
    setSavingPwd(true);
    try {
      const me = await http.get('/auth/me/');
      const meUser = me?.data?.user ?? me?.data?.data?.user;
      const username = meUser?.username || currentUser?.username;
      await changePassword(username, curPwd, newPwd);
      setPwdSaved(true);
      setCurPwd(''); setNewPwd(''); setConfPwd('');
      setTimeout(() => setPwdSaved(false), 2500);
    } finally {
      setSavingPwd(false);
    }
  };

  const handleFile = useCallback(e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setAvatarURL(URL.createObjectURL(f));
  }, []);

  const pwdDisabled = !curPwd || !newPwd || !confPwd || newPwd !== confPwd;
  const pwdStrength = newPwd.length > 10 ? 100 : newPwd.length > 7 ? 65 : 30;
  const pwdColor    = newPwd.length > 10 ? '#4ade80' : newPwd.length > 7 ? '#fbbf24' : '#f87171';

  const SaveIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );

  const LockIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #0e2040 inset !important;
          -webkit-text-fill-color: #fff !important;
        }
        .settings-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,.12) transparent;
        }
        .settings-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .settings-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .settings-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,.12);
          border-radius: 99px;
        }
        @media (max-width: 680px) {
          .settings-section-row { grid-template-columns: 1fr !important; gap: 16px !important; padding: 24px 0 !important; }
          .settings-2col        { grid-template-columns: 1fr !important; }
          .settings-danger-row  { grid-template-columns: 1fr !important; }
          .settings-danger-actions { flex-direction: column !important; align-items: stretch !important; }
          .settings-danger-actions button { margin-left: 0 !important; width: 100%; }
        }
      `}</style>

      <div className="settings-scroll" style={{ minHeight: '100vh', width: '100%', background: '#07101f', fontFamily: "'DM Sans', system-ui, sans-serif", display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        {/* ── Top Bar ── */}
        <div style={{ background: '#0d1f38', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>Settings</h1>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,.45)' }}>Manage your account preferences and security</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={{ position: 'relative', width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.5)', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', background: '#ef4444', border: '1.5px solid #0d1f38' }} />
            </button>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
              A
            </div>
          </div>
        </div>

        {/* ── Scrollable content ── */}
          <div style={{ flex: 1, padding: '8px 16px 48px', maxWidth: 960, margin: '0 auto', width: '100%' }}>
          {/* Profile */}
          <SectionRow sideTitle="Profile Information" sideDesc="Update your public profile details and avatar.">
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24, padding: '16px 18px', background: 'rgba(255,255,255,.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,.07)', flexWrap: 'wrap' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: avatarURL ? '#000' : 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid rgba(255,255,255,.15)', flexShrink: 0 }}>
                {avatarURL
                  ? <img src={avatarURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                }
              </div>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#fff' }}>Profile Photo</p>
                <p style={{ margin: '0 0 10px', fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Accepts JPG, PNG or GIF. Max size 2 MB.</p>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                <button
                  onClick={() => fileRef.current && fileRef.current.click()}
                  style={{ padding: '6px 14px', borderRadius: 7, background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.35)', color: '#60a5fa', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Change Photo
                </button>
              </div>
            </div>

            <div className="settings-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <Field label="First Name" value={firstName} onChange={setFirstName} placeholder="First name" />
              <Field label="Last Name"  value={lastName}  onChange={setLastName}  placeholder="Last name" />
            </div>

            <div style={{ marginBottom: 20 }}>
              <Field
                label="Email Address" value={email} onChange={setEmail} placeholder="your@email.com"
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                }
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <SaveBtn onClick={handleSaveProfile} saved={saved} disabled={savingProfile} savedLabel="Saved!" normalIcon={SaveIcon} normalLabel={savingProfile ? "Saving..." : "Save Changes"} />
            </div>
          </SectionRow>

          {/* Password */}
          <SectionRow sideTitle="Login Credentials" sideDesc="Keep your account secure by updating your password regularly.">
            <div style={{ marginBottom: 14 }}>
              <Field
                label="Current Password" value={curPwd} onChange={setCurPwd}
                type={showCur ? 'text' : 'password'} placeholder="Enter current password"
                rightEl={<EyeBtn show={showCur} toggle={() => setShowCur(s => !s)} />}
              />
            </div>

            <div className="settings-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <Field
                label="New Password" value={newPwd} onChange={setNewPwd}
                type={showNew ? 'text' : 'password'} placeholder="New password"
                rightEl={<EyeBtn show={showNew} toggle={() => setShowNew(s => !s)} />}
              />
              <Field
                label="Confirm New Password" value={confPwd} onChange={setConfPwd}
                type={showConf ? 'text' : 'password'} placeholder="Confirm password"
                rightEl={<EyeBtn show={showConf} toggle={() => setShowConf(s => !s)} />}
              />
            </div>

            {newPwd && (
              <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(255,255,255,.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,.07)' }}>
                <p style={{ margin: '0 0 6px', fontSize: 11, color: 'rgba(255,255,255,.45)', fontWeight: 600 }}>Password strength</p>
                <div style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pwdStrength}%`, background: pwdColor, borderRadius: 2, transition: 'width .3s, background .3s' }} />
                </div>
              </div>
            )}

            {newPwd && confPwd && newPwd !== confPwd && (
              <p style={{ margin: '0 0 14px', fontSize: 11, color: '#f87171', display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                Passwords do not match
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <SaveBtn onClick={handleSavePwd} saved={pwdSaved} disabled={pwdDisabled || savingPwd} savedLabel="Updated!" normalIcon={LockIcon} normalLabel={savingPwd ? "Updating..." : "Update Password"} />
            </div>
          </SectionRow>

          {/* Notifications */}
          <SectionRow sideTitle="Notification Preferences" sideDesc="Control which alerts and updates you receive.">
            {NOTIF_PREFS.map((n, i) => (
              <NotifRow key={n.label} label={n.label} sub={n.sub} def={n.def} isLast={i === NOTIF_PREFS.length - 1} />
            ))}
          </SectionRow>

          {/* Danger Zone */}
          <div style={{ padding: '32px 0' }}>
            <div className="settings-danger-row" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32 }}>
              <div>
                <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#f87171' }}>Danger Zone</h2>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.45)', lineHeight: 1.6 }}>Irreversible actions that affect your account.</p>
              </div>
              <div style={{ background: 'rgba(248,113,113,.04)', border: '1px solid rgba(248,113,113,.18)', borderRadius: 14, padding: 24 }}>
                <div className="settings-danger-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#fff' }}>Delete Account</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.45)' }}>Permanently delete your admin account and all associated data.</p>
                  </div>
                  <button
                    style={{ padding: '9px 18px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(248,113,113,.45)', color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: 20, fontFamily: 'inherit', transition: 'background .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
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