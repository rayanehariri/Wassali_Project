// FakeDelivererApi.js
// All requests built from API_BASE_URL in api.config.js
// To switch to real backend → change that ONE value in api.config.js
// Each function has [FAKE] block (runs now) and [REAL] block (uncomment when backend ready)

/*import { API_BASE_URL, getAuthHeaders } from "./api.config";*/

const delay = (ms = 350) => new Promise(r => setTimeout(r, ms));
const NOW = () => new Date().toISOString();

// ─── Fake data ────────────────────────────────────────────────────────────────

const FAKE_CURRENT_ORDER = {
  id: "V-90231",
  customer: {
    name: "Sarah J.",
    phone: "+213 555 123 456",
    avatar: "SJ",
  },
  pickup: {
    label: "Pickup",
    address: "Route d'El Biar, Algiers",
    coords: [36.768, 3.053],
  },
  dropoff: {
    label: "Dropoff • 12 mins",
    address: "Cité 1200 Logements, Bab Ezzouar",
    coords: [36.720, 3.175],
  },
  items: [
    { qty: "1x", name: "MacBook Pro MAX" },
    { qty: "1x", name: "Jus Citron" },
  ],
  status: "Awaiting Pickup", // "Awaiting Pickup" | "In Transit" | "Delivered"
  acceptedAgo: "8m ago",
  pickupLocation: "Boulangerie El-Biar",
};

const FAKE_STATS_TODAY = {
  earningsToday: "4250 DZD",
  activeFor:     "3h 15m",
  nextGoal:      "6000 DZD",
  goalPercent:   70,
};

const FAKE_SCHEDULE = {
  terminal: "Precision Service Terminal",
  zone:     "Algiers Zone 01",
  activeTab: "Today",
  activeZones: ["Algiers Centre", "Hydra", "Mohammadia"],
};

let FAKE_INCOMING_REQUESTS = [
  {
    id: "req-1",
    customer:  { name: "Sarah J.",         avatar: "SJ", type: "person" },
    payout:    850,
    pickup:    { label: "Pharmacie Centrale, Sidi M'Hamed" },
    dropoff:   { label: "Rue Didouche Mourad, Centre Ville" },
    package:   { label: "1× Pharmacy Bag (Urgent Medicine)" },
    deliverBy: "15:45",
    urgent:    true,
  },
  {
    id: "req-2",
    customer:  { name: "Hyper Marché Ardis", avatar: "HM", type: "store" },
    payout:    1200,
    pickup:    { label: "Mohammadia, Ardis Terminal" },
    dropoff:   { label: "Hydra, Résidence Les Pins" },
    package:   { label: "2× Grocery Boxes (Fragile)" },
    deliverBy: null,
    urgent:    false,
  },
];

const FAKE_DAILY_SUMMARY = {
  completed: 12,
  active:    1,
  earnings:  "14,250 DZD",
};

let FAKE_AWAITING_CLIENT_APPROVALS = [];

let FAKE_ACTIVE_TASK = null;

// ─── 1. getCurrentOrder ───────────────────────────────────────────────────────
// Used by: DelivererMapPage
export async function getCurrentOrder() {
  /* [FAKE] */
  await delay();
  return { ...FAKE_CURRENT_ORDER };
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/deliverer/current-order`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("No current order");
  return res.json();
  // expected: { id, customer: { name, phone, avatar }, pickup: { label, address, coords }, dropoff: { label, address, coords }, items: [{ qty, name }], status, acceptedAgo, pickupLocation }
  [REAL] */
}

// ─── 2. getTodayStats ────────────────────────────────────────────────────────
// Used by: DelivererMapPage bottom bar
export async function getTodayStats() {
  /* [FAKE] */
  await delay();
  return { ...FAKE_STATS_TODAY };
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/deliverer/stats/today`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
  // expected: { earningsToday, activeFor, nextGoal, goalPercent }
  [REAL] */
}

// ─── 3. callCustomer ─────────────────────────────────────────────────────────
// Used by: phone icon button in DelivererMapPage
export async function callCustomer(orderId) {
  /* [FAKE] */
  await delay(200);
  console.log(`[FAKE] Calling customer for order ${orderId}`);
  return { success: true, phone: FAKE_CURRENT_ORDER.customer.phone };
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/deliverer/orders/${orderId}/call-customer`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to initiate call");
  return res.json(); // { success, phone }
  [REAL] */
}

// ─── 4. navigateToOrder ──────────────────────────────────────────────────────
// Used by: Navigate button in DelivererMapPage
export async function navigateToOrder(orderId) {
  /* [FAKE] */
  await delay(200);
  console.log(`[FAKE] Opening navigation for order ${orderId}`);
  return { success: true, deepLink: `https://maps.google.com/?q=${FAKE_CURRENT_ORDER.dropoff.coords.join(",")}` };
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/deliverer/orders/${orderId}/navigate`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to get navigation link");
  return res.json(); // { success, deepLink }
  [REAL] */
}

// ─── 5. getSchedule ──────────────────────────────────────────────────────────
// Used by: ActiveSchedulePage header
export async function getSchedule() {
  /* [FAKE] */
  await delay();
  return { ...FAKE_SCHEDULE };
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/deliverer/schedule`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch schedule");
  return res.json();
  // expected: { terminal, zone, activeTab, activeZones }
  [REAL] */
}

// ─── 6. getIncomingRequests ──────────────────────────────────────────────────
// Used by: ActiveSchedulePage incoming requests list
export async function getIncomingRequests() {
  /* [FAKE] */
  await delay();
  return [...FAKE_INCOMING_REQUESTS];
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/deliverer/incoming-requests`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch requests");
  return res.json();
  // expected: [{ id, customer: { name, avatar, type }, payout, pickup, dropoff, package, deliverBy, urgent }]
  [REAL] */
}

// ─── 7-bis. getAwaitingClientApprovals ──────────────────────────────────────
// Used by: ActiveSchedulePage waiting list
export async function getAwaitingClientApprovals() {
  /* [FAKE] */
  await delay(180);
  return [...FAKE_AWAITING_CLIENT_APPROVALS];
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/deliverer/requests/awaiting-client-approval`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch waiting approvals");
  return res.json();
  // expected: [{ id, customer, payout, pickup, dropoff, package, deliverBy, urgent, waitingSince }]
  [REAL] */
}

// ─── 7. acceptRequest ────────────────────────────────────────────────────────
// Used by: ACCEPT button on each request card
export async function acceptRequest(requestId) {
  /* [FAKE] */
  await delay(500);
  const idx = FAKE_INCOMING_REQUESTS.findIndex(r => r.id === requestId);
  if (idx === -1) return { success: false };

  const [acceptedRequest] = FAKE_INCOMING_REQUESTS.splice(idx, 1);
  const pending = {
    ...acceptedRequest,
    waitingSince: NOW(),
    phase: "awaiting_client_selection",
  };
  FAKE_AWAITING_CLIENT_APPROVALS.push(pending);

  return {
    success: true,
    phase: "awaiting_client_selection",
    request: pending,
  };
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/deliverer/requests/${requestId}/accept`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to accept request");
  return res.json(); // { success, phase: "awaiting_client_selection" | "client_confirmed", orderId? }
  [REAL] */
}

// ─── 7-ter. simulateClientConfirmRequest (FAKE / dev testing only) ───────────
// Call when the customer selects this deliverer — unlocks active task + navigation.
export async function simulateClientConfirmRequest(requestId) {
  /* [FAKE] */
  await delay(400);
  const idx = FAKE_AWAITING_CLIENT_APPROVALS.findIndex((r) => r.id === requestId);
  if (idx === -1) return { success: false };

  const [req] = FAKE_AWAITING_CLIENT_APPROVALS.splice(idx, 1);
  const orderId = `V-${Math.floor(Math.random() * 90000) + 10000}`;
  FAKE_ACTIVE_TASK = {
    orderId,
    status: "Awaiting Pickup",
    acceptedAgo: "just now",
    pickupAt: req.pickup?.label ?? "Pickup point",
  };

  return {
    success: true,
    phase: "client_confirmed",
    orderId,
    pickupAt: FAKE_ACTIVE_TASK.pickupAt,
  };
  /* [FAKE] */

  /* [REAL] — not used; real flow is push/WebSocket or poll from backend
  [REAL] */
}

// ─── 8. rejectRequest ────────────────────────────────────────────────────────
// Used by: REJECT button on each request card
export async function rejectRequest(requestId) {
  /* [FAKE] */
  await delay(400);
  const idx = FAKE_INCOMING_REQUESTS.findIndex(r => r.id === requestId);
  if (idx !== -1) FAKE_INCOMING_REQUESTS.splice(idx, 1);
  return { success: true };
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/deliverer/requests/${requestId}/reject`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to reject request");
  return res.json();
  [REAL] */
}

// ─── 9. getDailySummary ──────────────────────────────────────────────────────
// Used by: ActiveSchedulePage right panel
export async function getDailySummary() {
  /* [FAKE] */
  await delay();
  return { ...FAKE_DAILY_SUMMARY };
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/deliverer/stats/daily-summary`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch daily summary");
  return res.json();
  // expected: { completed: number, active: number, earnings: string }
  [REAL] */
}

// ─── 10. getActiveTask ───────────────────────────────────────────────────────
// Used by: ActiveSchedulePage right panel active task card
export async function getActiveTask() {
  /* [FAKE] */
  await delay();
  return FAKE_ACTIVE_TASK ? { ...FAKE_ACTIVE_TASK } : null;
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/deliverer/active-task`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("No active task");
  return res.json();
  // expected: { orderId, status, acceptedAgo, pickupAt }
  [REAL] */
}

// ─── 11. viewNavigationDetails ───────────────────────────────────────────────
// Used by: VIEW NAVIGATION DETAILS button in active task
export async function viewNavigationDetails(orderId) {
  /* [FAKE] */
  await delay(200);
  return { success: true, orderId };
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/deliverer/orders/${orderId}/navigation-details`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to get navigation details");
  return res.json();
  [REAL] */
}

// ─── 12. switchScheduleTab ───────────────────────────────────────────────────
// Used by: Today / Weekly toggle in ActiveSchedulePage
export async function switchScheduleTab(tab) {
  /* [FAKE] */
  await delay(200);
  FAKE_SCHEDULE.activeTab = tab;
  return { ...FAKE_SCHEDULE };
  /* [FAKE] */

  /* [REAL]
  const res = await fetch(`${API_BASE_URL}/deliverer/schedule?tab=${tab}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to switch tab");
  return res.json();
  [REAL] */
}