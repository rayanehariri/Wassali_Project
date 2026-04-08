// FakeAuthApi.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  headers: { "Content-Type": "application/json" },
});

// ─── Default offline admin ──────────────────────────────────────────────────────
// Used as fallback when backend is not running
const OFFLINE_ADMIN = {
  id:       "OFFLINE-ADMIN-001",
  name:     "Admin Rayan",
  email:    "admin@wassali.com",
  username: "admin@wassali.com",
  password: "123456",           // must match your backend strong password rule
  role:     "admin",
  avatar:   "",
};

// ─── API Functions ──────────────────────────────────────────────────────────────

/**
 * Log in with username + password
 * Falls back to offline admin if backend is unreachable
 */
export async function login(email, password) {
  // ── Try real backend first ────────────────────────────
  try {
    const res = await API.post("/auth/login/", {
      username: email,
      password,
    });

    if (!res.data.success) {
      throw new Error(res.data.message || "Login failed.");
    }

    return {
      user: {
        id:     res.data._id        || res.data.user?._id,
        name:   res.data.username   || res.data.user?.username,
        email:  res.data.user?.email || email,
        role:   res.data.role       || res.data.user?.role || "client",
        avatar: res.data.user?.avatar || "",
      },
      token: res.data.token || "backend-token",
    };

  } catch (err) {
    // ── If backend is down, try offline admin ─────────────
    const isNetworkError =
      !err.response ||                          // no response = server down
      err.code === "ERR_NETWORK" ||
      err.code === "ECONNREFUSED";

    if (isNetworkError) {
      // check against offline admin credentials
      if (
        email    === OFFLINE_ADMIN.username &&
        password === OFFLINE_ADMIN.password
      ) {
        console.warn("⚠️ Backend offline — using offline admin account.");
        return {
          user: {
            id:     OFFLINE_ADMIN.id,
            name:   OFFLINE_ADMIN.name,
            email:  OFFLINE_ADMIN.email,
            role:   OFFLINE_ADMIN.role,
            avatar: OFFLINE_ADMIN.avatar,
          },
          token: "offline-token",
        };
      } else {
        throw new Error("Backend is offline. Use admin@wassali.com / Admin@123 to log in.");
      }
    }

    // backend is online but credentials are wrong
    throw new Error(
      err.response?.data?.message || err.message || "Incorrect username or password."
    );
  }
}

/**
 * Register a new account
 * Maps to: POST /api/auth/register/
 */
export async function register({ name, email, password, role }) {
  try {
    const res = await API.post("/auth/register/", {
      username: name,
      email,
      password,
      role: role || "client",
    });

    if (!res.data.success) {
      throw new Error(res.data.message || "Registration failed.");
    }

    return {
      user: {
        id:     res.data.user?._id  || res.data.user?.id,
        name:   res.data.user?.username || name,
        email:  res.data.user?.email    || email,
        role:   res.data.user?.role     || role || "client",
        avatar: "",
      },
      token: res.data.token || "",
    };
  } catch (err) {
    throw new Error(
      err.response?.data?.message || err.message || "Registration failed."
    );
  }
}

/**
 * Send a password reset email
 * ⚠️ No backend endpoint yet — simulated
 * Replace with: return API.post("/auth/forgot-password/", { email })
 */
export async function forgotPassword(email) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email) {
        reject(new Error("No account found with this email address."));
      } else {
        resolve({ success: true, message: "Reset link sent to " + email });
      }
    }, 1000);
  });
}

/**
 * Change username
 * Maps to: POST /api/auth/change/username/<old_username>
 */
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

/**
 * Change password
 * Maps to: POST /api/auth/change/password/<username>
 */
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

/**
 * Logout
 * TODO: add /api/auth/logout/ in Flask if needed
 */
export async function logout() {
  return { success: true };
}