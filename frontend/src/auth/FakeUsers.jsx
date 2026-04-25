// AuthApi.js
// Auth API helpers — Firebase removed, all auth via local Flask backend + JWT

import { http } from "../api/http";
import { normalizeRole } from "./roles";

function firstValidationMessage(errors) {
  if (!errors || typeof errors !== "object") return null;
  const walk = (v) => {
    if (typeof v === "string") return v;
    if (Array.isArray(v)) return v.find(Boolean) || null;
    if (v && typeof v === "object") {
      for (const k of Object.keys(v)) {
        const r = walk(v[k]);
        if (r) return r;
      }
    }
    return null;
  };
  return walk(errors);
}

/** Readable message from Flask `{ message, errors }` or axios network errors */
export function formatAuthApiError(err, fallback = "Request failed.") {
  const data = err?.response?.data;
  const detail = firstValidationMessage(data?.errors);
  if (detail && typeof detail === "string") return detail;
  if (data?.message && String(data.message).trim()) return String(data.message).trim();
  return err?.message || fallback;
}

// ─── Offline / fallback admin ──────────────────────────────────────────────
// This account works in two situations:
//   1. Backend is completely offline (network error)
//   2. Backend is online but this admin account doesn't exist in the database yet
const FALLBACK_ADMIN = {
  id:             "OFFLINE-ADMIN-001",
  name:           "Admin Rayan",
  email:          "admin@wassali.com",
  username:       "admin@wassali.com",
  password:       "123456",
  role:           "admin",
  status:         "active",
  onboardingDone: true,
  welcomeSeen:    true,
  avatar:         "",
};

// ─── Helper: check if credentials match the fallback admin ────────────────
function isFallbackAdmin(email, password) {
  return (
    email    === FALLBACK_ADMIN.username &&
    password === FALLBACK_ADMIN.password
  );
}

function buildFallbackAdminResult() {
  return {
    user: {
      id:             FALLBACK_ADMIN.id,
      name:           FALLBACK_ADMIN.name,
      email:          FALLBACK_ADMIN.email,
      role:           FALLBACK_ADMIN.role,
      status:         FALLBACK_ADMIN.status,
      onboardingDone: FALLBACK_ADMIN.onboardingDone,
      welcomeSeen:    FALLBACK_ADMIN.welcomeSeen,
      avatar:         "",
      uid:            null,
    },
    token: "offline-token",
  };
}

// ─── login ─────────────────────────────────────────────────────────────────
export async function login(email, password) {

  // ── Try real backend first ─────────────────────────────
  try {
    const res = await http.post("/auth/login/", {
      username: email,
      password,
    });

    if (!res.data.success) {
      throw new Error(res.data.message || "Login failed.");
    }

    // Build user object — include status & onboardingDone from backend
    const rawRole =
      res.data.role ??
      res.data.userRole ??
      res.data.user_type ??
      res.data.type;
    let user = {
      id:             res.data._id,
      name:           res.data.username,
      email:          res.data.email || email,
      phone:          res.data.phone || "",
      wilaya:         res.data.wilaya || "",
      role:           normalizeRole(rawRole),
      status:         res.data.status         ?? "active",
      onboardingDone: res.data.onboardingDone  ?? false,
      avatar:         "",
      uid:            res.data._id,  // use backend id as uid
    };

    // Save JWT tokens for API calls
    try {
      if (res.data.access_token) localStorage.setItem("access_token", res.data.access_token);
      if (res.data.refresh_token) localStorage.setItem("refresh_token", res.data.refresh_token);
    } catch {}

    return {
      user,
      token: res.data.access_token,
    };

  } catch (err) {

    // ── Network error → try fallback admin ─────────────────
    const isNetworkError =
      !err.response ||
      err.code === "ERR_NETWORK" ||
      err.code === "ECONNREFUSED" ||
      err.message?.includes("Network Error");

    if (isNetworkError) {
      if (isFallbackAdmin(email, password)) {
        console.warn("⚠️ Backend offline — using fallback admin.");
        return buildFallbackAdminResult();
      }
      throw new Error(
        `Backend is offline. Use ${FALLBACK_ADMIN.username} / ${FALLBACK_ADMIN.password} to log in offline.`
      );
    }

    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.detail  ||
      err.message ||
      "Incorrect username or password."
    );
  }
}

// ─── register ──────────────────────────────────────────────────────────────
export async function register({ name, email, phone, password, role }) {
  try {
    const res = await http.post("/auth/register/", {
      username: name,
      email,
      phone,
      password,
      role: role || "client",
    });

    if (!res.data.success) {
      throw new Error(res.data.message || "Registration failed.");
    }

    return { success: true };

  } catch (err) {
    throw new Error(formatAuthApiError(err, "Registration failed."));
  }
}

// ─── forgotPassword ────────────────────────────────────────────────────────
export async function forgotPassword(email) {
  const res = await http.post("/auth/forgot-password/", { email });
  const body = res?.data ?? {};
  if (body.success === false) throw new Error(body.message || "Request failed.");
  return {
    success: true,
    message: body.message || "If an account exists, a reset link was sent.",
    devResetLink: body.dev_reset_link,
    devNotice: body.dev_notice,
    userFound: body.user_found,
  };
}

// ─── register (phone verify flow) ───────────────────────────────────────────
export async function registerStart({ name, email, phone, password, role, wilaya }) {
  try {
    const res = await http.post("/auth/register/start/", {
      username: name,
      email,
      phone,
      password,
      role: role || "client",
      wilaya,
    });
    const body = res?.data ?? {};
    if (body.success === false) throw new Error(body.message || "Could not start registration.");
    return {
      pendingId: body.pending_id,
      expiresIn: body.expires_in_seconds ?? 900,
      devVerificationCode: body.dev_verification_code,
      devNotice: body.dev_notice,
    };
  } catch (err) {
    throw new Error(formatAuthApiError(err, "Could not start registration."));
  }
}

export async function registerEmailStart({ name, email, password, role, wilaya }) {
  try {
    const res = await http.post("/auth/register/email/start/", {
      username: name,
      email,
      password,
      role: role || "client",
      wilaya,
    });
    const body = res?.data ?? {};
    if (body.success === false) throw new Error(body.message || "Could not start registration.");
    return {
      pendingId: body.pending_id,
      expiresIn: body.expires_in_seconds ?? 900,
      devVerificationCode: body.dev_verification_code,
      devNotice: body.dev_notice,
    };
  } catch (err) {
    throw new Error(formatAuthApiError(err, "Could not start registration."));
  }
}

export async function registerVerify(pendingId, code) {
  try {
    const res = await http.post("/auth/register/verify/", { pending_id: pendingId, code });
    const body = res?.data ?? {};
    if (body.success === false) throw new Error(body.message || "Verification failed.");
  } catch (err) {
    throw new Error(formatAuthApiError(err, "Verification failed."));
  }
}

export async function registerResendCode(pendingId) {
  try {
    const res = await http.post("/auth/register/resend-code/", { pending_id: pendingId });
    const body = res?.data ?? {};
    if (body.success === false) throw new Error(body.message || "Resend failed.");
    return {
      devVerificationCode: body.dev_verification_code,
      devNotice: body.dev_notice,
    };
  } catch (err) {
    throw new Error(formatAuthApiError(err, "Resend failed."));
  }
}

// ─── changeUsername ────────────────────────────────────────────────────────
export async function changeUsername(oldUsername, newUsername) {
  try {
    const res = await http.post(`/auth/change/username/${oldUsername}/`, {
      new_username: newUsername,
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
}

// ─── changePassword ────────────────────────────────────────────────────────
export async function changePassword(username, oldPassword, newPassword) {
  try {
    let targetUsername = username;
    if (!targetUsername) {
      const me = await http.get("/auth/me/");
      const user = me?.data?.user ?? me?.data?.data?.user;
      targetUsername = user?.username;
    }
    if (!targetUsername) throw new Error("Unable to resolve account username.");

    const res = await http.post(`/auth/change/password/${targetUsername}/`, {
      old_password: oldPassword,
      new_password: newPassword,
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
}

// ─── logout ────────────────────────────────────────────────────────────────
export async function logout() {
  try {
    // Revoke refresh token on backend (best-effort)
    try {
      const rt = localStorage.getItem("refresh_token");
      if (rt) await http.post("/auth/logout/", { refresh_token: rt });
    } catch {}
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } catch {}
  } catch (err) {
    console.warn("Logout error:", err.message);
  }
  return { success: true };
}