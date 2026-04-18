// SettingsPage.jsx — pixel-perfect match to design + full mobile responsive
import { useState, useEffect } from "react";
import {
  Fingerprint, ShieldCheck, Eye, EyeOff, RefreshCw,
  Copy, Check, Laptop, Smartphone, AlertCircle, X,
  KeyRound, Lock, Bell, Activity, MapPin,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  getSettings, updateCredentials, toggleTwoFactor,
  deleteSession, updatePermission,
  regenerateAccessKey, copyAccessKey, changePassword,
} from "./FakeApi";

// ── Change Password Modal ─────────────────────────────────────────────────────
function ChangePasswordModal({ onClose, onSave }) {
  const [current, setCurrent] = useState("");
  const [next,    setNext]    = useState("");
  const [confirm, setConfirm] = useState("");
  const [showC,   setShowC]   = useState(false);
  const [showN,   setShowN]   = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  async function handleSave() {
    if (next !== confirm) { setError("Passwords do not match."); return; }
    if (next.length < 6)  { setError("Password must be at least 6 characters."); return; }
    setError("");
    setSaving(true);
    try {
      await changePassword({ currentPassword: current, newPassword: next });
      onSave();
    } catch (e) {
      setError(e.message ?? "Failed to change password.");
    } finally { setSaving(false); }
  }

  return (
    <div className="!fixed !inset-0 !z-50 !flex !items-center !justify-center"
      style={{ background: "rgba(5,10,20,0.78)", backdropFilter: "blur(8px)" }}>
      <div className="!w-[420px] !rounded-2xl !overflow-hidden"
        style={{ background: "#0b1525", border: "1px solid #1e2d3d", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
        <div className="!flex !items-center !justify-between !px-7 !pt-6 !pb-5"
          style={{ borderBottom: "1px solid #1e2d3d" }}>
          <div className="!flex !items-center !gap-2">
            <Lock size={16} color="#3b82f6" />
            <h3 className="!text-[16px] !font-bold !text-white !m-0">Change Password</h3>
          </div>
          <button onClick={onClose}
            className="!w-7 !h-7 !rounded-full !flex !items-center !justify-center !cursor-pointer !border-none"
            style={{ background: "#111c2e", border: "1px solid #1e2d3d" }}>
            <X size={13} color="#64748b" />
          </button>
        </div>
        <div className="!px-7 !py-6 !flex !flex-col !gap-4">
          {error && (
            <div className="!flex !items-center !gap-2 !px-3 !py-2.5 !rounded-xl"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <AlertCircle size={13} color="#ef4444" />
              <span className="!text-[12px] !text-red-400">{error}</span>
            </div>
          )}
          {/* Current password */}
          <div>
            <label className="!block !text-[10px] !font-bold !text-slate-500 !mb-1.5 !tracking-wider">CURRENT PASSWORD</label>
            <div className="!flex !items-center !gap-2 !px-4 !py-3 !rounded-xl"
              style={{ background: "#111c2e", border: "1px solid #1e2d3d" }}>
              <input type={showC ? "text" : "password"} value={current}
                onChange={e => setCurrent(e.target.value)} placeholder="••••••••"
                className="!flex-1 !bg-transparent !text-white !text-[13px] !outline-none !border-none" />
              <button onClick={() => setShowC(p => !p)}
                className="!text-slate-500 hover:!text-slate-300 !bg-transparent !border-none !cursor-pointer !p-0">
                {showC ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          {/* New password */}
          <div>
            <label className="!block !text-[10px] !font-bold !text-slate-500 !mb-1.5 !tracking-wider">NEW PASSWORD</label>
            <div className="!flex !items-center !gap-2 !px-4 !py-3 !rounded-xl"
              style={{ background: "#111c2e", border: "1px solid #1e2d3d" }}>
              <input type={showN ? "text" : "password"} value={next}
                onChange={e => setNext(e.target.value)} placeholder="Min 6 characters"
                className="!flex-1 !bg-transparent !text-white !text-[13px] !outline-none !border-none" />
              <button onClick={() => setShowN(p => !p)}
                className="!text-slate-500 hover:!text-slate-300 !bg-transparent !border-none !cursor-pointer !p-0">
                {showN ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          {/* Confirm */}
          <div>
            <label className="!block !text-[10px] !font-bold !text-slate-500 !mb-1.5 !tracking-wider">CONFIRM NEW PASSWORD</label>
            <div className="!flex !items-center !gap-2 !px-4 !py-3 !rounded-xl"
              style={{ background: "#111c2e", border: "1px solid #1e2d3d" }}>
              <input type="password" value={confirm}
                onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
                className="!flex-1 !bg-transparent !text-white !text-[13px] !outline-none !border-none" />
            </div>
          </div>
          <div className="!flex !gap-3 !mt-2">
            <button onClick={onClose}
              className="!flex-1 !py-3 !rounded-xl !text-[13px] !font-semibold !text-slate-400 !cursor-pointer !border-none"
              style={{ background: "transparent", border: "1px solid #1e2d3d" }}>Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="!flex-1 !py-3 !rounded-xl !text-[13px] !font-bold !text-white !cursor-pointer !flex !items-center !justify-center !gap-2"
              style={{ background: "#2563eb", border: "none", opacity: saving ? 0.7 : 1 }}>
              {saving
                ? <span className="!w-4 !h-4 !border-2 !border-white/30 !border-t-white !rounded-full !animate-spin" />
                : <><Check size={14} /> Save Password</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Permission Row ────────────────────────────────────────────────────────────
function PermissionRow({ icon, label, sublabel, permKey, value, onToggle, isLast }) {
  return (
    <div
      className="!flex !items-center !justify-between !px-4 !py-3.5 !rounded-xl !transition-all"
      style={{
        background:   "#0f1b2d",
        border:       "1px solid #1a2d4a",
        marginBottom: isLast ? 0 : 8,
      }}
    >
      <div className="!flex-1 !min-w-0 !pr-4">
        <p className="!text-[13px] !font-semibold !text-white !m-0">{label}</p>
        <p className="!text-[10px] !font-bold !text-slate-500 !m-0 !tracking-wider">{sublabel}</p>
      </div>
      <Switch
        checked={value}
        onCheckedChange={val => onToggle(permKey, val)}
        className="!data-[state=checked]:!bg-blue-600 !shrink-0"
      />
    </div>
  );
}

// ── Main SettingsPage ─────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [settings,       setSettings]       = useState(null);
  const [loading,        setLoading]        = useState(true);

  // Login & Identity
  const [loginEmail,     setLoginEmail]     = useState("");
  const [recoveryEmail,  setRecoveryEmail]  = useState("");
  const [credSaving,     setCredSaving]     = useState(false);
  const [credSuccess,    setCredSuccess]    = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [passChanged,    setPassChanged]    = useState(false);

  // Security Hub
  const [twoFactor,      setTwoFactor]      = useState(false);
  const [tfaSaving,      setTfaSaving]      = useState(false);
  const [deletingId,     setDeletingId]     = useState(null);

  // Access Key
  const [accessKey,      setAccessKey]      = useState("");
  const [keyNote,        setKeyNote]        = useState("");
  const [regenerating,   setRegenerating]   = useState(false);
  const [copied,         setCopied]         = useState(false);

  // Permissions
  const [permissions,    setPermissions]    = useState({
    locationSharing:     true,
    systemNotifications: true,
    diagnosticReports:   false,
  });

  // Sessions
  const [sessions,       setSessions]       = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const s = await getSettings();
        setSettings(s);
        setLoginEmail(s.loginEmail);
        setRecoveryEmail(s.recoveryEmail);
        setTwoFactor(s.twoFactorEnabled);
        setSessions(s.sessions);
        setPermissions(s.permissions);
        setAccessKey(s.accessKey);
        setKeyNote(s.keyNote);
      } finally { setLoading(false); }
    }
    load();
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleUpdateCredentials() {
    setCredSaving(true);
    await updateCredentials({ loginEmail, recoveryEmail });
    setCredSaving(false);
    setCredSuccess(true);
    setTimeout(() => setCredSuccess(false), 2500);
  }

  async function handleToggle2FA(val) {
    setTfaSaving(true);
    await toggleTwoFactor(val);
    setTwoFactor(val);
    setTfaSaving(false);
  }

  async function handleDeleteSession(id) {
    setDeletingId(id);
    await deleteSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
    setDeletingId(null);
  }

  async function handlePermissionToggle(key, val) {
    setPermissions(prev => ({ ...prev, [key]: val }));
    await updatePermission(key, val);
  }

  async function handleRegenerate() {
    setRegenerating(true);
    const result = await regenerateAccessKey();
    setAccessKey(result.accessKey);
    setRegenerating(false);
  }

  async function handleCopy() {
    await copyAccessKey(accessKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return (
    <div className="!flex !items-center !justify-center !h-full" style={{ background: "#0b1525" }}>
      <div className="!flex !flex-col !items-center !gap-3">
        <div className="!w-7 !h-7 !border-2 !border-blue-600/30 !border-t-blue-500 !rounded-full !animate-spin" />
        <p className="!text-[13px] !text-slate-500 !m-0">Loading settings...</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Change Password Modal */}
      {showChangePass && (
        <ChangePasswordModal
          onClose={() => setShowChangePass(false)}
          onSave={() => {
            setShowChangePass(false);
            setPassChanged(true);
            setTimeout(() => setPassChanged(false), 3000);
          }}
        />
      )}

      <div className="!p-4 md:!p-6 !flex !flex-col !gap-5" style={{ background: "#0b1525", minHeight: "100%" }}>

        {/* ══ PAGE HEADER ══ */}
        <div className="!mb-1">
          <p className="!text-[11px] !font-bold !text-blue-500 !tracking-[0.15em] !m-0 !mb-1">SYSTEM CONFIGURATION</p>
          <h1 className="!text-[26px] md:!text-[32px] !font-extrabold !text-white !m-0">Partner Settings</h1>
        </div>

        {/* ══ MAIN GRID ══ */}
        <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5">

          {/* ──────────────────────────────────────────────
              LEFT COL: Login & Identity + Privacy & Permissions
          ────────────────────────────────────────────── */}
          <div className="!flex !flex-col !gap-5">

            {/* Login & Identity */}
            <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "16px" }}>
              <CardContent className="!p-5 md:!p-6">
                {/* Card header */}
                <div className="!flex !items-center !gap-3 !mb-6">
                  <div className="!w-10 !h-10 !rounded-xl !flex !items-center !justify-center"
                    style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.25)" }}>
                    <Fingerprint size={18} color="#3b82f6" />
                  </div>
                  <h2 className="!text-[17px] !font-bold !text-white !m-0">Login & Identity</h2>
                </div>

                {/* Email fields row */}
                <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-4 !mb-4">
                  <div>
                    <label className="!block !text-[10px] !font-bold !text-slate-500 !mb-2 !tracking-widest">LOGIN EMAIL</label>
                    <input
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className="!w-full !px-4 !py-3 !rounded-xl !text-[13px] !text-white !outline-none !transition-all"
                      style={{ background: "#0f1b2d", border: "1px solid #1e3a5f" }}
                    />
                  </div>
                  <div>
                    <label className="!block !text-[10px] !font-bold !text-slate-500 !mb-2 !tracking-widest">RECOVERY EMAIL</label>
                    <input
                      value={recoveryEmail}
                      onChange={e => setRecoveryEmail(e.target.value)}
                      className="!w-full !px-4 !py-3 !rounded-xl !text-[13px] !text-white !outline-none !transition-all"
                      style={{ background: "#0f1b2d", border: "1px solid #1e3a5f" }}
                    />
                  </div>
                </div>

                {/* Password row */}
                <div className="!mb-5">
                  <label className="!block !text-[10px] !font-bold !text-slate-500 !mb-2 !tracking-widest">PASSWORD</label>
                  <div className="!flex !items-center !px-4 !py-3 !rounded-xl"
                    style={{ background: "#0f1b2d", border: "1px solid #1e3a5f" }}>
                    <span className="!flex-1 !text-[14px] !text-white !tracking-widest !font-medium select-none">
                      ••••••••••••••••
                    </span>
                    <button
                      onClick={() => setShowChangePass(true)}
                      className="!text-[12px] !font-bold !text-blue-400 hover:!text-blue-300 !bg-transparent !border-none !cursor-pointer !transition-colors !shrink-0"
                    >
                      Change
                    </button>
                  </div>
                  {passChanged && (
                    <p className="!text-[11px] !text-green-400 !m-0 !mt-1.5 !flex !items-center !gap-1">
                      <Check size={11} /> Password updated successfully
                    </p>
                  )}
                </div>

                <Separator className="!bg-[#1e2d3d] !mb-5" />

                {/* Update Credentials button */}
                <button
                  onClick={handleUpdateCredentials}
                  disabled={credSaving}
                  className="!w-full !py-3.5 !rounded-xl !text-[14px] !font-bold !text-white !cursor-pointer !flex !items-center !justify-center !gap-2 !transition-all"
                  style={{
                    background:  "#2563eb",
                    border:      "none",
                    boxShadow:   "0 4px 16px rgba(37,99,235,0.4)",
                    opacity:     credSaving ? 0.7 : 1,
                  }}
                >
                  {credSaving
                    ? <span className="!w-4 !h-4 !border-2 !border-white/30 !border-t-white !rounded-full !animate-spin" />
                    : credSuccess
                      ? <><Check size={15} /> Credentials Updated!</>
                      : "Update Credentials"
                  }
                </button>
              </CardContent>
            </Card>

            {/* Privacy & Permissions */}
            <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "16px" }}>
              <CardContent className="!p-5 md:!p-6">
                {/* Card header */}
                <div className="!flex !items-center !gap-3 !mb-5">
                  <div className="!w-10 !h-10 !rounded-xl !flex !items-center !justify-center"
                    style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.25)" }}>
                    {/* Privacy icon — eye with slash */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </div>
                  <h2 className="!text-[17px] !font-bold !text-white !m-0">Privacy & Permissions</h2>
                </div>

                <div className="!flex !flex-col !gap-2">
                  <PermissionRow
                    permKey="locationSharing"
                    label="Location Sharing"
                    sublabel="ACTIVE DURING SHIFT HOURS"
                    value={permissions.locationSharing}
                    onToggle={handlePermissionToggle}
                  />
                  <PermissionRow
                    permKey="systemNotifications"
                    label="System Notifications"
                    sublabel="CRITICAL ALERTS & ASSIGNMENTS"
                    value={permissions.systemNotifications}
                    onToggle={handlePermissionToggle}
                  />
                  <PermissionRow
                    permKey="diagnosticReports"
                    label="Diagnostic Reports"
                    sublabel="ANONYMOUS PERFORMANCE DATA"
                    value={permissions.diagnosticReports}
                    onToggle={handlePermissionToggle}
                    isLast
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ──────────────────────────────────────────────
              RIGHT COL: Security Hub + Access Keys
          ────────────────────────────────────────────── */}
          <div className="!flex !flex-col !gap-5">

            {/* Security Hub */}
            <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "16px" }}>
              <CardContent className="!p-5 md:!p-6">
                {/* Card header */}
                <div className="!flex !items-center !gap-3 !mb-5">
                  <div className="!w-10 !h-10 !rounded-xl !flex !items-center !justify-center"
                    style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}>
                    <ShieldCheck size={18} color="#10b981" />
                  </div>
                  <h2 className="!text-[17px] !font-bold !text-white !m-0">Security Hub</h2>
                </div>

                {/* 2FA row */}
                <div
                  className="!flex !items-center !justify-between !px-4 !py-4 !rounded-xl !mb-5"
                  style={{ background: "#0f1b2d", border: "1px solid #1e3a5f" }}
                >
                  <div>
                    <p className="!text-[14px] !font-bold !text-white !m-0">Two-Factor Auth</p>
                    <p className="!text-[11px] !text-slate-500 !m-0 !mt-0.5">Secure tokens via mobile app</p>
                  </div>
                  <Switch
                    checked={twoFactor}
                    onCheckedChange={handleToggle2FA}
                    disabled={tfaSaving}
                    className="!data-[state=checked]:!bg-blue-600"
                  />
                </div>

                <Separator className="!bg-[#1e2d3d] !mb-4" />

                {/* Active Sessions */}
                <p className="!text-[10px] !font-bold !text-slate-500 !tracking-widest !m-0 !mb-3">ACTIVE SESSIONS</p>

                <div className="!flex !flex-col !gap-2">
                  {sessions.map(session => (
                    <div
                      key={session.id}
                      className="!flex !items-center !justify-between !px-4 !py-3 !rounded-xl !transition-all"
                      style={{ background: "#0f1b2d", border: "1px solid #1a2d4a" }}
                    >
                      <div className="!flex !items-center !gap-3">
                        {/* Device icon */}
                        <div className="!w-8 !h-8 !rounded-lg !flex !items-center !justify-center !shrink-0"
                          style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.2)" }}>
                          {session.device.toLowerCase().includes("iphone") || session.device.toLowerCase().includes("mobile")
                            ? <Smartphone size={13} color="#3b82f6" />
                            : <Laptop size={13} color="#3b82f6" />}
                        </div>
                        <div>
                          <p className="!text-[13px] !font-semibold !text-white !m-0">{session.device}</p>
                          <p className="!text-[11px] !text-slate-500 !m-0">
                            {session.location} • {session.lastSeen}
                          </p>
                        </div>
                      </div>

                      {/* Action badge */}
                      {session.isCurrent ? (
                        <span
                          className="!text-[10px] !font-bold !px-2.5 !py-1 !rounded-lg !shrink-0"
                          style={{ background: "rgba(37,99,235,0.15)", color: "#60a5fa", border: "1px solid rgba(37,99,235,0.3)" }}
                        >
                          CURRENT
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          disabled={deletingId === session.id}
                          className="!text-[11px] !font-bold !px-2.5 !py-1 !rounded-lg !cursor-pointer !border-none !transition-all !shrink-0"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            color:      "#ef4444",
                            border:     "1px solid rgba(239,68,68,0.25)",
                            opacity:    deletingId === session.id ? 0.6 : 1,
                          }}
                        >
                          {deletingId === session.id ? "..." : "DELETE"}
                        </button>
                      )}
                    </div>
                  ))}

                  {sessions.length === 0 && (
                    <p className="!text-[12px] !text-slate-500 !text-center !py-4 !m-0">
                      No active sessions found.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Access Keys */}
            <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "16px" }}>
              <CardContent className="!p-5 md:!p-6">
                {/* Card header */}
                <div className="!flex !items-center !gap-3 !mb-5">
                  <div className="!w-10 !h-10 !rounded-xl !flex !items-center !justify-center"
                    style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}>
                    <KeyRound size={18} color="#a78bfa" />
                  </div>
                  <h2 className="!text-[17px] !font-bold !text-white !m-0">Access Keys</h2>
                </div>

                {/* Key display box */}
                <div className="!rounded-xl !p-5 !mb-2" style={{ background: "#0f1b2d", border: "1px solid #1e3a5f" }}>
                  <p className="!text-[9px] !font-bold !text-slate-500 !tracking-[0.15em] !m-0 !mb-3">PARTNER GATEWAY KEY</p>

                  {/* Key value — monospaced, styled like design */}
                  <div
                    className="!flex !items-center !justify-center !py-3 !rounded-xl !mb-3"
                    style={{ background: "#0b1420", border: "1px solid #1a2d4a" }}
                  >
                    <p
                      className="!m-0 !tracking-[0.18em] !font-bold !text-center !break-all"
                      style={{
                        fontSize:      "14px",
                        fontFamily:    "ui-monospace, SFMono-Regular, monospace",
                        color:         "#60a5fa",
                        letterSpacing: "0.18em",
                      }}
                    >
                      {regenerating
                        ? <span className="!text-slate-500">Generating...</span>
                        : accessKey}
                    </p>
                  </div>

                  {/* Note */}
                  <div className="!flex !items-center !gap-2">
                    <AlertCircle size={12} color="#475569" className="!shrink-0" />
                    <p className="!text-[11px] !text-slate-500 !m-0">{keyNote}</p>
                  </div>
                </div>

                <Separator className="!bg-[#1e2d3d] !my-4" />

                {/* Action buttons */}
                <div className="!grid !grid-cols-2 !gap-3">
                  {/* Regenerate */}
                  <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="!flex !items-center !justify-center !gap-2 !py-3 !rounded-xl !text-[13px] !font-semibold !cursor-pointer !transition-all"
                    style={{
                      background:  "transparent",
                      border:      "1px solid #1e3a5f",
                      color:       "#94a3b8",
                      opacity:     regenerating ? 0.6 : 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#60a5fa"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e3a5f"; e.currentTarget.style.color = "#94a3b8"; }}
                  >
                    <RefreshCw size={13} style={{ animation: regenerating ? "stSpin 0.8s linear infinite" : "none" }} />
                    REGENERATE
                  </button>

                  {/* Copy Key */}
                  <button
                    onClick={handleCopy}
                    className="!flex !items-center !justify-center !gap-2 !py-3 !rounded-xl !text-[13px] !font-semibold !cursor-pointer !transition-all"
                    style={{
                      background: copied ? "rgba(16,185,129,0.12)" : "transparent",
                      border:     copied ? "1px solid rgba(16,185,129,0.3)" : "1px solid #1e3a5f",
                      color:      copied ? "#10b981" : "#94a3b8",
                    }}
                    onMouseEnter={e => {
                      if (!copied) { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#60a5fa"; }
                    }}
                    onMouseLeave={e => {
                      if (!copied) { e.currentTarget.style.borderColor = "#1e3a5f"; e.currentTarget.style.color = "#94a3b8"; }
                    }}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "COPIED!" : "COPY KEY"}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <p className="!text-center !text-[11px] !text-slate-700 !m-0 !mt-1">© 2026 Wassali Inc. All rights reserved.</p>
      </div>

      <style>{`@keyframes stSpin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}