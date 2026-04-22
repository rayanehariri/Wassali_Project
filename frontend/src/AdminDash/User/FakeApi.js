import { http } from "../../api/http";

function normalizeUiStatus(rawStatus) {
  const s = String(rawStatus || "").toLowerCase();
  if (s === "active") return "Active";
  if (s === "banned" || s === "suspended") return "Banned";
  if (s === "inactive" || s === "pending") return "Inactive";
  return "Inactive";
}

// ─── Fake Users Data ────────────────────────────────────────────────────────────
const fakeUsers = [
  {
    id: "USR-001",
    name: "Amine K.",
    email: "amine.k@example.com",
    avatar: "AK",
    role: "Deliverer",
    joinDate: "Oct 24, 2023",
    orders: 1240,
    status: "Active",
  },
  {
    id: "USR-002",
    name: "Sarah B.",
    email: "sarah.b@gmail.com",
    avatar: "SB",
    role: "Customer",
    joinDate: "Nov 02, 2023",
    orders: 45,
    status: "Inactive",
  },
  {
    id: "USR-003",
    name: "Karim L.",
    email: "karim.l@delivery.com",
    avatar: "KL",
    role: "Deliverer",
    joinDate: "Sep 15, 2023",
    orders: 892,
    status: "Banned",
  },
  {
    id: "USR-004",
    name: "Fatima R.",
    email: "fatima.r@domain.com",
    avatar: "FR",
    role: "Customer",
    joinDate: "Dec 10, 2023",
    orders: 12,
    status: "Active",
  },
  {
    id: "USR-005",
    name: "John D.",
    email: "john.doe@wassali.io",
    avatar: "JD",
    role: "Admin",
    joinDate: "Jan 12, 2023",
    orders: null,
    status: "Active",
  },
  {
    id: "USR-006",
    name: "Lina M.",
    email: "lina.m@example.com",
    avatar: "LM",
    role: "Customer",
    joinDate: "Feb 18, 2024",
    orders: 33,
    status: "Active",
  },
  {
    id: "USR-007",
    name: "Omar T.",
    email: "omar.t@delivery.com",
    avatar: "OT",
    role: "Deliverer",
    joinDate: "Mar 05, 2024",
    orders: 560,
    status: "Active",
  },
  {
    id: "USR-008",
    name: "Nadia H.",
    email: "nadia.h@gmail.com",
    avatar: "NH",
    role: "Customer",
    joinDate: "Apr 22, 2024",
    orders: 8,
    status: "Inactive",
  },
  {
    id: "USR-009",
    name: "Yassine B.",
    email: "yassine.b@wassali.io",
    avatar: "YB",
    role: "Admin",
    joinDate: "May 01, 2023",
    orders: null,
    status: "Active",
  },
  {
    id: "USR-010",
    name: "Amira S.",
    email: "amira.s@domain.com",
    avatar: "AS",
    role: "Customer",
    joinDate: "Jun 14, 2024",
    orders: 5,
    status: "Banned",
  },
];

// ─── Stats Data ─────────────────────────────────────────────────────────────────
const fakeUserStats = {
  totalUsers:     { value: 12450, change: "+12%", positive: true,  label: "Total registered accounts" },
  newUsers:       { value: 128,   change: "+5%",  positive: true,  label: "Growth this week"          },
  activeNow:      { value: 450,   change: "Live", positive: true,  label: "Currently online users"    },
  bannedAccounts: { value: 23,    change: "-1%",  positive: false, label: "Requires attention"        },
};

// ─── API Functions ──────────────────────────────────────────────────────────────

/**
 * Get all users with optional filters
 * @param {object} filters - { role, status, search, page, limit }
 * @returns {object} - { users, total, page, totalPages }
 *
 * Replace with:
 * return axios.get("/api/admin/users", { params: filters })
 */
export async function getUsers(filters = {}) {
  const res = await http.get("/admin/users");
  const all = res?.data?.users ?? res?.data?.data?.users ?? [];

  let result = all.map((u) => {
    const name = u.name ?? u.username ?? "User";
    return {
      id: u._id ?? u.id,
      name,
      email: u.email ?? "",
      avatar: (name || "U").split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase(),
      role: (u.role ?? "client").toString().toLowerCase() === "client" ? "Customer" : (u.role ?? "client").toString().replace(/\b\w/g, (c) => c.toUpperCase()),
      joinDate: u.created_at ? String(u.created_at).slice(0, 10) : "",
      orders: u.orders ?? null,
      status: normalizeUiStatus(u.status),
    };
  });

  if (filters.role && filters.role !== "All Roles") {
    result = result.filter((u) => u.role === filters.role);
  }

  if (filters.status && filters.status !== "All Statuses") {
    result = result.filter((u) => u.status === filters.status);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }

  const page       = filters.page  || 1;
  const limit      = filters.limit || 5;
  const total      = result.length;
  const totalPages = Math.ceil(total / limit);
  const paginated  = result.slice((page - 1) * limit, page * limit);

  return { users: paginated, total, page, totalPages };
}

/**
 * Get a single user by ID
 * @param {string} userId
 * @returns {object|null}
 *
 * Replace with:
 * return axios.get(`/api/admin/users/${userId}`)
 */
export async function getUserById(userId) {
  const res = await http.get(`/admin/users/${userId}`);
  const u = res?.data?.user ?? res?.data?.data?.user;
  if (!u) return null;
  const name = u.name ?? u.username ?? "User";
  return {
    id: u._id ?? u.id,
    name,
    email: u.email ?? "",
    avatar: (name || "U").split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase(),
    role: (u.role ?? "client").toString().toLowerCase() === "client" ? "Customer" : (u.role ?? "client").toString().replace(/\b\w/g, (c) => c.toUpperCase()),
    joinDate: u.created_at ? String(u.created_at).slice(0, 10) : "",
    orders: u.orders ?? null,
    status: normalizeUiStatus(u.status),
  };
}

/**
 * Get user stats for the dashboard cards
 * @returns {object}
 *
 * Replace with:
 * return axios.get("/api/admin/users/stats")
 */
export async function getUserStats() {
  const res = await http.get("/admin/users/stats");
  return res?.data ?? res?.data?.data ?? fakeUserStats;
}

/**
 * Create a new user
 * @param {object} userData
 * @returns {object} - the newly created user
 *
 * Replace with:
 * return axios.post("/api/admin/users", userData)
 */
export async function createUser(userData) {
  const role = (userData?.role ?? "Customer").toString().toLowerCase() === "customer" ? "client" : (userData?.role ?? "client").toString().toLowerCase();
  const status = (userData?.status ?? "Active").toString().toLowerCase();
  const res = await http.post("/admin/users", { name: userData?.name, email: userData?.email, role, status });
  return res?.data?.data?.user ?? userData;
}

/**
 * Update a user's status
 * @param {string} userId
 * @param {string} status - "Active" | "Inactive" | "Banned"
 * @returns {object|null}
 *
 * Replace with:
 * return axios.patch(`/api/admin/users/${userId}`, { status })
 */
export async function updateUserStatus(userId, status) {
  const normalized = String(status || "").toLowerCase();
  await http.patch(`/admin/users/${userId}`, { status: normalized });
  return getUserById(userId);
}

/**
 * Update a user's role
 * @param {string} userId
 * @param {string} role - "Admin" | "Deliverer" | "Customer"
 * @returns {object|null}
 *
 * Replace with:
 * return axios.patch(`/api/admin/users/${userId}`, { role })
 */
export async function updateUserRole(userId, role) {
  const normalized =
    String(role || "").toLowerCase() === "customer" ? "client" : String(role || "").toLowerCase();
  await http.patch(`/admin/users/${userId}`, { role: normalized });
  return getUserById(userId);
}

/**
 * Delete a user
 * @param {string} userId
 * @returns {{ success: boolean }}
 *
 * Replace with:
 * return axios.delete(`/api/admin/users/${userId}`)
 */
export async function deleteUser(userId) {
  const res = await http.delete(`/admin/users/${userId}`);
  return res?.data?.data ?? { success: true };
}

/**
 * Export users as CSV string
 * @returns {string}
 *
 * Replace with:
 * return axios.get("/api/admin/users/export")
 */
export async function exportUsersCSV() {
  const { users } = await getUsers({ role: "All Roles", status: "All Statuses", page: 1, limit: 5000 });
  const headers = ["ID", "Name", "Email", "Role", "Join Date", "Orders", "Status"];
  const rows = users.map((u) =>
    [u.id, u.name, u.email, u.role, u.joinDate, u.orders ?? "-", u.status].join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}