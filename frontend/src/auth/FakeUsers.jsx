// AuthApi.js
// Same as your FakeAuthApi.js but with Firebase token added to login()
// Everything else is IDENTICAL — register, forgotPassword, changeUsername, etc.

// FakeAuthApi.js
import axios from "axios";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../Firebase.config";
import { normalizeRole } from "./roles";
 
const API = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  headers: { "Content-Type": "application/json" },
});
 
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
 
// ─── Helper: sign into Firebase ────────────────────────────────────────────
async function signIntoFirebase(user, firebaseToken) {
  if (!firebaseToken) return user;
  try {
    await signInWithCustomToken(auth, firebaseToken);
    const uid = auth.currentUser?.uid;
    if (uid) {
      await setDoc(doc(db, "users", uid), {
        uid,
        mongoId:  user.id,
        name:     user.name,
        role:     user.role,
        avatar:   (user.name ?? "??").slice(0, 2).toUpperCase(),
        status:   "online",
        lastSeen: serverTimestamp(),
      }, { merge: true });
      return { ...user, uid };
    }
  } catch (firebaseErr) {
    console.warn("⚠️ Firebase sign-in error (non-blocking):", firebaseErr.message);
  }
  return user;
}
 
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
    const res = await API.post("/auth/login/", {
      username: email,
      password,
    });
 
    if (!res.data.success) {
      // Backend is online but login failed.
      // If the error is "user does not exist" and the credentials match
      // the fallback admin, let them in anyway (admin not seeded in DB yet).
      const msg = (res.data.message ?? "").toLowerCase();
      const isUserNotFound =
        msg.includes("does not exist") ||
        msg.includes("not found") ||
        msg.includes("no account");
 
      if (isUserNotFound && isFallbackAdmin(email, password)) {
        console.warn("⚠️ Admin not in DB — using fallback admin account.");
        return buildFallbackAdminResult();
      }
 
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
      email:          email,
      role:           normalizeRole(rawRole),
      status:         res.data.status         ?? "active",
      onboardingDone: res.data.onboardingDone  ?? false,
      avatar:         "",
      uid:            null,
    };
 
    user = await signIntoFirebase(user, res.data.firebaseToken);
 
    return {
      user,
      token: res.data._id,
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
 
    // ── Backend is online but returned a 4xx/5xx error ─────────────────────
    // Check if the error message indicates "user not found" — if so and the
    // credentials match the fallback admin, allow login anyway (admin not seeded).
    const serverMsg = (
      err.response?.data?.message ||
      err.response?.data?.detail  ||
      err.message ||
      ""
    ).toLowerCase();
 
    const isUserNotFoundError =
      serverMsg.includes("does not exist") ||
      serverMsg.includes("not found")      ||
      serverMsg.includes("no account")     ||
      serverMsg.includes("invalid")        ||
      err.response?.status === 404;
 
    if (isUserNotFoundError && isFallbackAdmin(email, password)) {
      console.warn("⚠️ Admin not in DB (HTTP error path) — using fallback admin account.");
      return buildFallbackAdminResult();
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
    const res = await API.post("/auth/register/", {
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
    throw new Error(
      err.response?.data?.message || err.message || "Registration failed."
    );
  }
}
 
// ─── forgotPassword ────────────────────────────────────────────────────────
export async function forgotPassword(email) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email) reject(new Error("No account found with this email address."));
      else resolve({ success: true, message: "Reset link sent to " + email });
    }, 1000);
  });
}
 
// ─── changeUsername ────────────────────────────────────────────────────────
export async function changeUsername(oldUsername, newUsername) {
  try {
    const res = await API.post(`/auth/change/username/${oldUsername}/`, {
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
    const res = await API.post(`/auth/change/password/${username}/`, {
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
    if (auth.currentUser?.uid) {
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        status:   "offline",
        lastSeen: serverTimestamp(),
      }, { merge: true });
    }
    await signOut(auth);
  } catch (err) {
    console.warn("Firebase logout error:", err.message);
  }
  return { success: true };
}