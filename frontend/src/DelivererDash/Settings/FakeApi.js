// FakeSettingsApi.js
// All requests built from API_BASE_URL in api.config.js
// To switch to real backend → change that ONE value in api.config.js
// Each function: [FAKE] block runs now, [REAL] block to uncomment when backend ready

import { http } from "../../api/http";

// ─── Fake data ────────────────────────────────────────────────────────────────

let FAKE_SETTINGS = {
  loginEmail:    "alex.m@wassali.dz",
  recoveryEmail: "m.auvoir_backup@gmail.com",
  password:      "••••••••••••••••",

  twoFactorEnabled: true,

  sessions: [
    { id: "s1", device: "MacBook Pro 16\"", location: "London, UK", lastSeen: "Active Now", isCurrent: true  },
    { id: "s2", device: "iPhone 15 Pro",   location: "Paris, FR",  lastSeen: "2H Ago",     isCurrent: false },
  ],

  permissions: {
    locationSharing:    true,
    systemNotifications: true,
    diagnosticReports:  false,
  },

  accessKey: "KL-X92-8821-PRT-NAV-001",
  keyNote:   "Restricted telemetry access only. Valid for 30 days.",
};

// ─── 1. getSettings ───────────────────────────────────────────────────────────
// Used by: SettingsPage on mount
export async function getSettings() {
  const res = await http.get("/deliverer/settings");
  return (
    res?.data?.settings ??
    res?.data?.data?.settings ??
    { ...FAKE_SETTINGS, sessions: [...FAKE_SETTINGS.sessions] }
  );
}

// ─── 2. updateCredentials ────────────────────────────────────────────────────
// Used by: "Update Credentials" button in Login & Identity
export async function updateCredentials({ loginEmail, recoveryEmail, newPassword }) {
  const res = await http.patch("/deliverer/settings/credentials", { loginEmail, recoveryEmail, newPassword });
  return res?.data?.data ?? { success: true };
}

// ─── 3. toggleTwoFactor ──────────────────────────────────────────────────────
// Used by: Two-Factor Auth toggle in Security Hub
export async function toggleTwoFactor(enabled) {
  const res = await http.patch("/deliverer/settings/2fa", { enabled });
  return res?.data?.data ?? { success: true, twoFactorEnabled: enabled };
}

// ─── 4. deleteSession ────────────────────────────────────────────────────────
// Used by: DELETE button on each session row
export async function deleteSession(sessionId) {
  const res = await http.delete(`/deliverer/settings/sessions/${sessionId}`);
  return res?.data?.data ?? { success: true };
}

// ─── 5. updatePermission ─────────────────────────────────────────────────────
// Used by: each toggle in Privacy & Permissions
export async function updatePermission(key, value) {
  const res = await http.patch("/deliverer/settings/permissions", { [key]: value });
  return res?.data?.data ?? { success: true };
}

// ─── 6. regenerateAccessKey ──────────────────────────────────────────────────
// Used by: REGENERATE button in Access Keys
export async function regenerateAccessKey() {
  const res = await http.post("/deliverer/settings/access-key/regenerate");
  return res?.data?.data ?? { success: true };
}

// ─── 7. copyAccessKey ────────────────────────────────────────────────────────
// Used by: COPY KEY button — copies to clipboard (no API call needed)
// This is a pure client-side action, no backend endpoint required.
export async function copyAccessKey(key) {
  await navigator.clipboard.writeText(key);
  return { success: true };
}

// ─── 8. changePassword ───────────────────────────────────────────────────────
// Used by: "Change" link next to password field
export async function changePassword({ currentPassword, newPassword }) {
  if (!currentPassword || !newPassword) throw new Error("Both fields required");
  const me = await http.get("/auth/me/");
  const user = me?.data?.user ?? me?.data?.data?.user;
  if (!user?.username) throw new Error("Unable to resolve current account.");
  const res = await http.post(`/auth/change/password/${user.username}/`, {
    old_password: currentPassword,
    new_password: newPassword,
  });
  return res?.data?.data ?? { success: true };
}