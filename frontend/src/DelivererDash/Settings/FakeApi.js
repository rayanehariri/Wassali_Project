// FakeSettingsApi.js
// All requests built from API_BASE_URL in api.config.js
// To switch to real backend → change that ONE value in api.config.js
// Each function: [FAKE] block runs now, [REAL] block to uncomment when backend ready

/*import { API_BASE_URL, getAuthHeaders } from "./api.config";*/

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

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
  /* [FAKE] */
  await delay();
  return { ...FAKE_SETTINGS, sessions: [...FAKE_SETTINGS.sessions] };
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/deliverer/settings`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
  // expected: { loginEmail, recoveryEmail, twoFactorEnabled, sessions, permissions, accessKey, keyNote }
  [REAL] */
}

// ─── 2. updateCredentials ────────────────────────────────────────────────────
// Used by: "Update Credentials" button in Login & Identity
export async function updateCredentials({ loginEmail, recoveryEmail, newPassword }) {
  /* [FAKE] */
  await delay(700);
  if (loginEmail)    FAKE_SETTINGS.loginEmail    = loginEmail;
  if (recoveryEmail) FAKE_SETTINGS.recoveryEmail = recoveryEmail;
  if (newPassword)   FAKE_SETTINGS.password      = "••••••••••••••••";
  return { success: true };
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/deliverer/settings/credentials`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ loginEmail, recoveryEmail, newPassword }),
  });
  if (!res.ok) throw new Error("Failed to update credentials");
  return res.json();
  [REAL] */
}

// ─── 3. toggleTwoFactor ──────────────────────────────────────────────────────
// Used by: Two-Factor Auth toggle in Security Hub
export async function toggleTwoFactor(enabled) {
  /* [FAKE] */
  await delay(400);
  FAKE_SETTINGS.twoFactorEnabled = enabled;
  return { success: true, twoFactorEnabled: enabled };
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/deliverer/settings/2fa`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ enabled }),
  });
  if (!res.ok) throw new Error("Failed to toggle 2FA");
  return res.json();
  [REAL] */
}

// ─── 4. deleteSession ────────────────────────────────────────────────────────
// Used by: DELETE button on each session row
export async function deleteSession(sessionId) {
  /* [FAKE] */
  await delay(500);
  FAKE_SETTINGS.sessions = FAKE_SETTINGS.sessions.filter(s => s.id !== sessionId);
  return { success: true };
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/deliverer/settings/sessions/${sessionId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete session");
  return res.json();
  [REAL] */
}

// ─── 5. updatePermission ─────────────────────────────────────────────────────
// Used by: each toggle in Privacy & Permissions
export async function updatePermission(key, value) {
  /* [FAKE] */
  await delay(300);
  FAKE_SETTINGS.permissions[key] = value;
  return { success: true, permissions: { ...FAKE_SETTINGS.permissions } };
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/deliverer/settings/permissions`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ [key]: value }),
  });
  if (!res.ok) throw new Error("Failed to update permission");
  return res.json();
  [REAL] */
}

// ─── 6. regenerateAccessKey ──────────────────────────────────────────────────
// Used by: REGENERATE button in Access Keys
export async function regenerateAccessKey() {
  /* [FAKE] */
  await delay(800);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const rand  = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const newKey = `${rand(2)}-${rand(3)}-${rand(4)}-${rand(3)}-${rand(3)}-${rand(3)}`;
  FAKE_SETTINGS.accessKey = newKey;
  return { success: true, accessKey: newKey };
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/deliverer/settings/access-key/regenerate`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to regenerate key");
  return res.json();
  // expected: { success, accessKey }
  [REAL] */
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
  /* [FAKE] */
  await delay(600);
  if (!currentPassword || !newPassword) throw new Error("Both fields required");
  FAKE_SETTINGS.password = "••••••••••••••••";
  return { success: true };
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/deliverer/settings/password`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) throw new Error("Failed to change password");
  return res.json();
  [REAL] */
}