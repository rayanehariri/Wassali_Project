


// FakeApi.js  —  Earnings module
// Replace each [FAKE] block with [REAL] fetch() when backend is ready.
// Change only API_BASE_URL in api.config.js to switch environments.
 
/*import { API_BASE_URL, getAuthHeaders } from "./api.config";*/
 
const delay = (ms = 350) => new Promise(r => setTimeout(r, ms));
 
// ─── Fake data ────────────────────────────────────────────────────────────────
 
const FAKE_STATS = {
  totalEarnings: { value: "2,845.50 DZD", change: "+12.5%" },
  today:         { value: "145.20 DZD",   change: "6",      label: "" },
  rating:        { value: "4.92 ⭐",       change: "Top 5%", label: "Partner" },
};
 
const FAKE_BALANCE = {
  available: "842.50 DZD",
  change:    "+4.2%",
  updatedAt: "15 mins ago",
};
 
const FAKE_METHODS = [
  { id: "m1", type: "bank", name: "BEA Bank",  detail: "Checking ••••8832", isDefault: true  },
  { id: "m2", type: "card", name: "CCP/Card",  detail: "Card ••••4242",     isDefault: false },
];
 
const FAKE_PREFS = { schedule: "Weekly", autoCashout: true };
 
const FAKE_GOAL = { target: 1200, current: 842.5 };
 
const FAKE_CHART = [
  { day: "Mon", value: 120 },
  { day: "Tue", value: 95  },
  { day: "Wed", value: 160 },
  { day: "Thu", value: 210 },
  { day: "Fri", value: 185 },
  { day: "Sat", value: 240 },
  { day: "Sun", value: 145 },
];
 
const FAKE_ANALYTICS = {
  items: [
    { label: "Base Fares",        value: "1,820.00 DZD", color: "#3b82f6" },
    { label: "Distance Premium",  value: "645.50 DZD",   color: "#10b981" },
    { label: "Tips",              value: "380.00 DZD",   color: "#f59e0b" },
  ],
  total: "2,845.50 DZD",
};
 
const FAKE_RECENT_TRX = [
  { id: "TRX-0001", method: "Instant Cashout", methodType: "card",  date: "Oct 24", time: "10:42 AM", amount: "145.50 DZD", status: "Completed", grossAmount: "148.00 DZD", fee: "-2.50 DZD", netPayout: "145.50 DZD", methodDetail: "Debit ••45" },
  { id: "TRX-0002", method: "Weekly Deposit",  methodType: "bank",  date: "Oct 23", time: "08:30 PM", amount: "842.20 DZD", status: "Processing", grossAmount: "850.00 DZD", fee: "-7.80 DZD", netPayout: "842.20 DZD", methodDetail: "BEA ••34" },
  { id: "TRX-0003", method: "Weekly Deposit",  methodType: "bank",  date: "Oct 16", time: "09:00 AM", amount: "756.00 DZD", status: "Completed",  grossAmount: "763.00 DZD", fee: "-7.00 DZD", netPayout: "756.00 DZD", methodDetail: "BEA ••34" },
];
 
const FAKE_WITHDRAWALS = [
  { id: "TRX-8829-001", method: "Bank Transfer",  methodType: "bank", methodDetail: "••••1234", date: "Oct 28, 2023", time: "02:15 PM", amount: "$452.80", status: "Completed",  grossAmount: "$458.00", fee: "-$5.20", netPayout: "$452.80" },
  { id: "TRX-9932-05A", method: "Instant Cashout",methodType: "card", methodDetail: "Debit ••45", date: "Oct 25, 2023", time: "10:42 AM", amount: "$145.50", status: "Completed",  grossAmount: "$148.00", fee: "-$2.50", netPayout: "$145.50" },
  { id: "TRX-9875-B22", method: "Bank Transfer",  methodType: "bank", methodDetail: "••••1234", date: "Oct 23, 2023", time: "08:30 PM", amount: "$842.20", status: "Processing", grossAmount: "$850.00", fee: "-$7.80", netPayout: "$842.20" },
  { id: "TRX-9551-F12", method: "Bank Transfer",  methodType: "bank", methodDetail: "••••1234", date: "Oct 18, 2023", time: "09:15 AM", amount: "$320.00", status: "Failed",     grossAmount: "$326.00", fee: "-$6.00", netPayout: "$320.00" },
  { id: "TRX-9122-A90", method: "Bank Transfer",  methodType: "bank", methodDetail: "••••1234", date: "Oct 16, 2023", time: "09:00 AM", amount: "$756.00", status: "Completed",  grossAmount: "$763.00", fee: "-$7.00", netPayout: "$756.00" },
  { id: "TRX-8902-C33", method: "Instant Cashout",methodType: "card", methodDetail: "Debit ••45", date: "Oct 12, 2023", time: "04:30 PM", amount: "$95.00",  status: "Completed",  grossAmount: "$97.00",  fee: "-$2.00", netPayout: "$95.00"  },
  { id: "TRX-8801-D11", method: "Bank Transfer",  methodType: "bank", methodDetail: "••••1234", date: "Oct 10, 2023", time: "11:00 AM", amount: "$210.00", status: "Completed",  grossAmount: "$214.00", fee: "-$4.00", netPayout: "$210.00" },
  { id: "TRX-8700-E55", method: "Bank Transfer",  methodType: "bank", methodDetail: "••••1234", date: "Oct 5, 2023",  time: "03:45 PM", amount: "$580.00", status: "Failed",     grossAmount: "$588.00", fee: "-$8.00", netPayout: "$580.00" },
];
 
// ─── 1. getEarningsStats ──────────────────────────────────────────────────────
export async function getEarningsStats() {
  /* [FAKE] */
  await delay();
  return { ...FAKE_STATS };
  /* [FAKE] */
 
  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/admin/earnings/stats`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch earnings stats");
  return res.json();
  // expected: { totalEarnings: { value, change }, today: { value, change }, rating: { value, change, label } }
  [REAL] */
}
 
// ─── 2. getBalance ───────────────────────────────────────────────────────────
export async function getBalance() {
  /* [FAKE] */
  await delay();
  return { ...FAKE_BALANCE };
  /* [FAKE] */
 
  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/admin/earnings/balance`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch balance");
  return res.json();
  // expected: { available: string, change: string, updatedAt: string }
  [REAL] */
}
 
// ─── 3. getPayoutMethods ─────────────────────────────────────────────────────
export async function getPayoutMethods() {
  /* [FAKE] */
  await delay();
  return [...FAKE_METHODS];
  /* [FAKE] */
 
  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/admin/payout-methods`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch payout methods");
  return res.json();
  // expected: [{ id, type: "bank"|"card", name, detail, isDefault }]
  [REAL] */
}
 
// ─── 4. getPayoutPreferences ─────────────────────────────────────────────────
export async function getPayoutPreferences() {
  /* [FAKE] */
  await delay();
  return { ...FAKE_PREFS };
  /* [FAKE] */
 
  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/admin/payout-preferences`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch preferences");
  return res.json();
  // expected: { schedule: "Weekly"|"Daily", autoCashout: boolean }
  [REAL] */
}
 
// ─── 5. getEarningsGoal ──────────────────────────────────────────────────────
export async function getEarningsGoal() {
  /* [FAKE] */
  await delay();
  return { ...FAKE_GOAL };
  /* [FAKE] */
 
  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/admin/earnings/goal`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch goal");
  return res.json();
  // expected: { target: number, current: number }
  [REAL] */
}
 
// ─── 6. getWeeklyPerformance ─────────────────────────────────────────────────
export async function getWeeklyPerformance() {
  /* [FAKE] */
  await delay();
  return [...FAKE_CHART];
  /* [FAKE] */
 
  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/admin/earnings/weekly`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch chart data");
  return res.json();
  // expected: [{ day: "Mon", value: 120 }, ...]
  [REAL] */
}
 
// ─── 7. getFinancialAnalytics ────────────────────────────────────────────────
export async function getFinancialAnalytics() {
  /* [FAKE] */
  await delay();
  return { ...FAKE_ANALYTICS };
  /* [FAKE] */
 
  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/admin/earnings/analytics`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
  // expected: { items: [{ label, value, color }], total: string }
  [REAL] */
}
 
// ─── 8. getRecentTransactions ────────────────────────────────────────────────
export async function getRecentTransactions() {
  /* [FAKE] */
  await delay();
  return [...FAKE_RECENT_TRX];
  /* [FAKE] */
 
  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/admin/earnings/recent-transactions`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch recent transactions");
  return res.json();
  [REAL] */
}
 
// ─── 9. getWithdrawals ───────────────────────────────────────────────────────
export async function getWithdrawals({ status, page, limit = 6 }) {
  /* [FAKE] */
  await delay();
  let list = [...FAKE_WITHDRAWALS];
  if (status !== "All") list = list.filter(w => w.status === status);
  const total      = list.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const withdrawals = list.slice((page - 1) * limit, page * limit);
  return { withdrawals, total, totalPages };
  /* [FAKE] */
 
  /* [REAL]
  const params = new URLSearchParams({ page, limit });
  if (status !== "All") params.append("status", status);
  const res = await fetch(`${API_BASE_URL}/admin/withdrawals?${params}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch withdrawals");
  return res.json();
  // expected: { withdrawals: [...], total: N, totalPages: N }
  [REAL] */
}
 
// ─── 10. withdrawFunds ───────────────────────────────────────────────────────
export async function withdrawFunds() {
  /* [FAKE] */
  await delay(600);
  return { success: true };
  /* [FAKE] */
 
  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/admin/earnings/withdraw`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Withdrawal failed");
  return res.json();
  [REAL] */
}
 
// ─── 11. removePayoutMethod ──────────────────────────────────────────────────
export async function removePayoutMethod(id) {
  /* [FAKE] */
  await delay(400);
  const idx = FAKE_METHODS.findIndex(m => m.id === id);
  if (idx !== -1) FAKE_METHODS.splice(idx, 1);
  return { success: true };
  /* [FAKE] */
 
  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/admin/payout-methods/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to remove method");
  return res.json();
  [REAL] */
}
 
// ─── 12. addPayoutMethod ─────────────────────────────────────────────────────
export async function addPayoutMethod(data) {
  /* [FAKE] */
  await delay(700);
  const newMethod = {
    id:        `m${Date.now()}`,
    type:      data.type,
    name:      data.holderName || (data.type === "bank" ? "New Bank" : "New Card"),
    detail:    data.type === "bank"
      ? `Checking ••••${(data.accountNumber || "").slice(-4)}`
      : `Card ••••${(data.accountNumber || "").slice(-4)}`,
    isDefault: false,
  };
  FAKE_METHODS.push(newMethod);
  return newMethod;
  /* [FAKE] */
 
  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/admin/payout-methods`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add payout method");
  return res.json();
  [REAL] */
}
 
// ─── 13. editPayoutMethod ────────────────────────────────────────────────────
export async function editPayoutMethod(id, data) {
  /* [FAKE] */
  await delay(500);
  const method = FAKE_METHODS.find(m => m.id === id);
  if (method) {
    method.name   = data.holderName    || method.name;
    method.detail = data.accountNumber
      ? `Checking ••••${data.accountNumber.slice(-4)}`
      : method.detail;
  }
  return { success: true };
  /* [FAKE] */
 
  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/admin/payout-methods/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to edit payout method");
  return res.json();
  [REAL] */
}
 
// ─── 14. updatePayoutSchedule ────────────────────────────────────────────────
export async function updatePayoutSchedule(schedule) {
  /* [FAKE] */
  await delay(300);
  FAKE_PREFS.schedule = schedule;
  return { ...FAKE_PREFS };
  /* [FAKE] */
 
  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/admin/payout-preferences/schedule`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ schedule }),
  });
  if (!res.ok) throw new Error("Failed to update schedule");
  return res.json();
  [REAL] */
}
 
// ─── 15. updateAutoCashout ───────────────────────────────────────────────────
export async function updateAutoCashout(enabled) {
  /* [FAKE] */
  await delay(300);
  FAKE_PREFS.autoCashout = enabled;
  return { ...FAKE_PREFS };
  /* [FAKE] */
 
  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/admin/payout-preferences/auto-cashout`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ autoCashout: enabled }),
  });
  if (!res.ok) throw new Error("Failed to update auto cashout");
  return res.json();
  [REAL] */
}