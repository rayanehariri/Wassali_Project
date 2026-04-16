// FakeSupportApi.js
// Change API_BASE_URL in api.config.js to switch to real backend.
// Each function: [FAKE] runs now, [REAL] uncomment when backend ready.

/*import { API_BASE_URL, getAuthHeaders } from "./api.config";*/

const delay = (ms = 350) => new Promise(r => setTimeout(r, ms));

// ─── Fake data ────────────────────────────────────────────────────────────────

const FAKE_SYSTEM_STATUS = {
  orderDispatch: { label: "Order Dispatch", status: "ok",      uptime: "99.9% Up",  note: null },
  payoutAPI:     { label: "Payout API",     status: "ok",      uptime: "Uptime",    note: null },
  network:       { label: "Network",        status: "warning", uptime: "Degraded",  note: "Route maintenance in Algiers region affecting certain transfers. Expected resolution 18:00 today." },
};

let FAKE_TICKETS = [
  { id: "STK-88219", subject: "Payment delay for Trip ID #A44", description: "Earnings discrepancy: 1,250.00 DZD",  status: "Resolved",    updatedAt: "2 hours ago" },
  { id: "STK-81442", subject: "Vehicle Insurance Renewal inquiry", description: "Uploading secondary insurance certificate", status: "Open",        updatedAt: "5 mins ago"  },
  { id: "STK-90112", subject: "Missing thermal bag equipment",  description: "Equipment request for Algiers regional centre", status: "In Progress", updatedAt: "Moments ago" },
  { id: "STK-89581", subject: "Account Login Issue",           description: "Two-factor authentication collection opened", status: "Resolved",    updatedAt: "6 hours ago" },
  { id: "STK-87590", subject: "Account verification pending",  description: "Driver/licence documents upload",           status: "In Progress", updatedAt: "1 day ago"   },
  { id: "STK-55594", subject: "App crash during delivery #B12", description: "App crashed while marking delivered",       status: "Resolved",    updatedAt: "3 days ago"  },
  { id: "STK-59423", subject: "Incorrect tip payout calculation", description: "Customer tip not reflected in earnings", status: "Resolved",    updatedAt: "1 week ago"  },
];

const FAKE_FAQS = [
  {
    id: 1,
    question: "What is the weekly payout schedule?",
    answer: "Payouts are processed every Monday at 09:00 AM. Funds typically arrive within 1–3 business days depending on your bank. You can also enable Instant Cashout from your Earnings page for immediate transfers (subject to a 1% fee).",
  },
  {
    id: 2,
    question: "What should I do if the app crashes during a delivery?",
    answer: "If the app crashes mid-delivery, restart it and navigate to your Active Orders. Your delivery progress is auto-saved. If the order disappears, contact support immediately with your Order ID and we will restore it and ensure you're compensated.",
  },
  {
    id: 3,
    question: "Am I covered by insurance while on a trip?",
    answer: "Yes. Wassali provides partner insurance coverage during active delivery periods. Coverage includes third-party liability and cargo protection up to 50,000 DZD per package. For details, refer to the Safety & Community Guidelines.",
  },
  {
    id: 4,
    question: "How are customer tips processed?",
    answer: "100% of customer tips go directly to you with no platform deduction. Tips appear in your earnings breakdown within 24 hours of delivery completion. You can view tip history in the Earnings & Tips Policy section.",
  },
];

const FAKE_SAFETY_REPORT_CATEGORIES = [
  "Traffic Incident", "Harassment", "Package Damage", "Road Hazard", "Other",
];

// ─── 1. getSystemStatus ───────────────────────────────────────────────────────
export async function getSystemStatus() {
  /* [FAKE] */
  await delay(300);
  return { ...FAKE_SYSTEM_STATUS };
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/support/system-status`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch system status");
  return res.json();
  // expected: { orderDispatch: { label, status, uptime, note }, payoutAPI: {...}, network: {...} }
  [REAL] */
}

// ─── 2. getTickets ────────────────────────────────────────────────────────────
export async function getTickets({ page = 1, limit = 5 } = {}) {
  /* [FAKE] */
  await delay(400);
  const total      = FAKE_TICKETS.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const tickets    = FAKE_TICKETS.slice((page - 1) * limit, page * limit);
  return { tickets, total, totalPages, page };
  /* [FAKE] */

  /* [REAL]
  const params = new URLSearchParams({ page, limit });
  const res = await fetch(`${API_BASE_URL}/support/tickets?${params}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
  // expected: { tickets: [...], total, totalPages, page }
  [REAL] */
}

// ─── 3. getFAQs ───────────────────────────────────────────────────────────────
export async function getFAQs() {
  /* [FAKE] */
  await delay(300);
  return [...FAKE_FAQS];
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/support/faqs`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch FAQs");
  return res.json();
  [REAL] */
}

// ─── 4. submitSafetyReport ───────────────────────────────────────────────────
export async function submitSafetyReport({ category, email, description }) {
  /* [FAKE] */
  await delay(800);
  if (!description?.trim()) throw new Error("Description is required");
  return { success: true, reportId: `RPT-${Date.now()}` };
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/support/safety-report`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ category, email, description }),
  });
  if (!res.ok) throw new Error("Failed to submit report");
  return res.json();
  [REAL] */
}

// ─── 5. getSafetyCategories ──────────────────────────────────────────────────
export async function getSafetyCategories() {
  /* [FAKE] */
  await delay(200);
  return [...FAKE_SAFETY_REPORT_CATEGORIES];
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/support/safety-categories`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
  [REAL] */
}

// ─── Exported constants (used by static pages) ────────────────────────────────
export { FAKE_SAFETY_REPORT_CATEGORIES };