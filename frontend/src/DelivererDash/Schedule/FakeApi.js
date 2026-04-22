// FakeDelivererApi.js
// All requests built from API_BASE_URL in api.config.js
// To switch to real backend → change that ONE value in api.config.js
// Each function has [FAKE] block (runs now) and [REAL] block (uncomment when backend ready)

import { http } from "../../api/http";
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

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
  try {
    const activeRes = await http.get("/deliverer/active-task");
    const task = activeRes?.data?.task ?? activeRes?.data?.data?.task ?? null;
    if (!task?.orderId && !task?.order_id) return null;
    const orderId = task.orderId ?? task.order_id;

    const navRes = await http.get(`/deliverer/orders/${orderId}/navigation-details`);
    const order = navRes?.data?.order ?? navRes?.data?.data?.order ?? null;
    if (!order) return null;

    const pickupAddress = order.pickup ?? task.pickupAt ?? "Pickup";
    const dropoffAddress = order.dropoff ?? "Dropoff";
    const description = order.description ?? "Package";
    const pickupCoords = Array.isArray(order.pickupCoords) ? order.pickupCoords : [36.76, 3.05];
    const dropoffCoords = Array.isArray(order.dropoffCoords) ? order.dropoffCoords : [36.74, 3.07];

    return {
      id: order.orderId ?? orderId,
      customer: {
        name: order.clientName || "Client",
        phone: "",
        avatar: "CL",
      },
      pickup: {
        label: "Pickup",
        address: pickupAddress,
        coords: pickupCoords,
      },
      dropoff: {
        label: "Dropoff",
        address: dropoffAddress,
        coords: dropoffCoords,
      },
      items: [{ qty: "1x", name: description }],
      status: task.status ?? "Awaiting Pickup",
      acceptedAgo: task.acceptedAgo ?? "just now",
      pickupLocation: pickupAddress,
      price: Number(order.price ?? 0),
      delivererName: order.delivererName || "",
    };
  } catch {
    return null;
  }
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
  try {
    const res = await http.get("/deliverer/incoming-requests");
    const body = res?.data ?? {};
    const reqs = body.requests ?? body.data?.requests ?? [];
    return reqs.map((r) => ({
      id: r.request_id ?? r._id ?? r.id,
      customer: {
        name: r.customer?.name ?? r.client_name ?? `Client ${(r.client_id || "").slice(0, 6)}` ?? "Client",
        avatar: r.customer?.avatar ?? "C",
        type: r.customer?.type ?? "person",
      },
      payout: Number(r.payout ?? r.price ?? 0),
      pickup: { label: r.pickup?.address ?? r.pickup?.label ?? "Pickup" },
      dropoff: { label: r.dropoff?.address ?? r.dropoff?.label ?? "Dropoff" },
      package: { label: r.package?.label ?? r.description ?? "Package" },
      deliverBy: r.deliverBy ?? null,
      urgent: Boolean(r.urgent ?? false),
    }));
  } catch (e) {
    console.warn("getIncomingRequests:", e.response?.status, e.response?.data?.message || e.message);
    return [];
  }
}

// ─── 7-bis. getAwaitingClientApprovals ──────────────────────────────────────
// Used by: ActiveSchedulePage waiting list
export async function getAwaitingClientApprovals() {
  const res = await http.get("/deliverer/requests/awaiting-client-approval");
  const items = res?.data?.items ?? res?.data?.data?.items ?? [];
  return items.map((r) => ({
    id: r.request_id ?? r._id ?? r.id,
    customer: {
      name: r.customer?.name ?? r.client_name ?? `Client ${(r.client_id || "").slice(0, 6)}` ?? "Client",
      avatar: r.customer?.avatar ?? "C",
      type: r.customer?.type ?? "person",
    },
    payout: Number(r.payout ?? r.price ?? 0),
    pickup: { label: r.pickup?.address ?? r.pickup?.label ?? "Pickup" },
    dropoff: { label: r.dropoff?.address ?? r.dropoff?.label ?? "Dropoff" },
    package: { label: r.package?.label ?? r.description ?? "Package" },
    deliverBy: r.deliverBy ?? null,
    urgent: Boolean(r.urgent ?? false),
    waitingSince: r.accepted_at ?? r.updated_at ?? r.created_at ?? null,
    phase: "awaiting_client_selection",
  }));
}

// ─── 7. acceptRequest ────────────────────────────────────────────────────────
// Used by: ACCEPT button on each request card
export async function acceptRequest(requestId) {
  try {
    const res = await http.post(`/deliverer/requests/${requestId}/accept`);
    const data = res?.data ?? {};
    return { success: true, ...data };
  } catch (e) {
    const msg = e.response?.data?.message || e.message || "Could not accept this request";
    return { success: false, message: msg, code: e.response?.data?.code };
  }
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
  const res = await http.get("/deliverer/active-task");
  const task = res?.data?.task ?? res?.data?.data?.task ?? null;
  if (!task) return null;
  return {
    orderId: task.order_id ?? task.orderId ?? task._id ?? null,
    status: task.status_label ?? task.status ?? "Active",
    acceptedAgo: task.accepted_ago ?? task.acceptedAgo ?? "",
    pickupAt: task.pickup?.address ?? task.pickupAt ?? "Pickup",
  };
}

// ─── 11. viewNavigationDetails ───────────────────────────────────────────────
// Used by: VIEW NAVIGATION DETAILS button in active task
export async function viewNavigationDetails(orderId) {
  const res = await http.get(`/deliverer/orders/${orderId}/navigation-details`);
  return res?.data ?? res?.data?.data ?? { success: true, orderId };
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