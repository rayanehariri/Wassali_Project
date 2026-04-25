// Admin orders API — backed by Mongo deliveries (`/api/admin/deliveries`)
import { http } from "../../api/http";

const delay = (ms = 200) => new Promise((res) => setTimeout(res, ms));

function normalizeOrder(raw) {
  if (!raw) return null;
  const mongo = raw._mongoId || String(raw.id || "").replace(/^#/, "");
  return {
    ...raw,
    _mongoId: mongo,
    id: raw.id || (mongo ? `#${mongo.slice(0, 10)}` : raw.id),
  };
}

export async function getOrders(filters = {}) {
  try {
    const res = await http.get("/admin/deliveries", {
      params: {
        status: filters.status || "All",
        search: filters.search || "",
        page: filters.page || 1,
        limit: filters.limit || 5,
      },
    });
    const body = res?.data ?? {};
    const orders = (body.orders || []).map(normalizeOrder).filter(Boolean);
    return {
      orders,
      total: body.total ?? orders.length,
      page: body.page ?? 1,
      totalPages: body.totalPages ?? 1,
    };
  } catch (e) {
    console.error("getOrders", e);
    return { orders: [], total: 0, page: 1, totalPages: 1 };
  }
}

export async function getOrderById(orderId) {
  const rawId = String(orderId || "").replace(/^#/, "").trim();
  if (!rawId) return null;
  try {
    const res = await http.get(`/admin/deliveries/${rawId}`);
    const o = (res?.data ?? {}).order;
    return normalizeOrder(o);
  } catch {
    try {
      const { orders } = await getOrders({ search: rawId, limit: 20, page: 1 });
      return orders.find((x) => String(x._mongoId || "").startsWith(rawId)) || orders[0] || null;
    } catch {
      return null;
    }
  }
}

export async function getOrderStats() {
  try {
    const res = await http.get("/admin/deliveries/stats");
    const d = res?.data ?? {};
    const map = (k, label) => ({
      label: d[k]?.label || label,
      value: String(d[k]?.value ?? "0"),
      change: d[k]?.change ?? "Live",
      positive: d[k]?.positive !== false,
    });
    return {
      totalOrders: map("totalOrders", "Total Orders"),
      pendingPickups: map("pendingPickups", "Pending Pickups"),
      inTransit: map("inTransit", "In Transit"),
      deliveredToday: map("deliveredToday", "Delivered"),
    };
  } catch (e) {
    console.error("getOrderStats", e);
    return {
      totalOrders: { value: 0, change: "—", positive: true },
      pendingPickups: { value: 0, change: "—", positive: true },
      inTransit: { value: 0, change: "—", positive: true },
      deliveredToday: { value: 0, change: "—", positive: true },
    };
  }
}

export async function createOrder(orderData) {
  await delay();
  console.warn("Admin create order is not wired to the API yet.");
  return {
    id: `#NEW${Date.now().toString(36).slice(-6)}`,
    placedAt: "Just now",
    date: "Just now",
    estimatedArrival: "TBD",
    receiptId: "—",
    status: "Pending",
    amount: orderData?.amount || "0 DZD",
    customer: orderData?.customer || { name: "—", avatar: "—" },
    deliverer: orderData?.deliverer || { name: "—", avatar: "—", rating: null },
    route: orderData?.route || { from: "—", to: "—" },
    restaurantLocation: { lat: 36.737, lng: 3.086, label: "Pickup" },
    customerLocation: { lat: 36.742, lng: 3.068, label: "Drop-off" },
    riderLocation: { lat: 36.739, lng: 3.07 },
    items: orderData?.items || [],
    timeline: [],
    _mongoId: "",
  };
}

export async function updateOrderStatus(orderId, status) {
  const mongo = String(orderId || "").replace(/^#/, "");
  const res = await http.patch(`/admin/deliveries/${mongo}/status`, { status });
  const o = (res?.data ?? {}).order;
  return normalizeOrder(o);
}

export async function deleteOrder(orderId) {
  const mongo = String(orderId || "").replace(/^#/, "");
  await http.delete(`/admin/deliveries/${mongo}`);
  return { success: true };
}

export async function cancelOrder(orderId) {
  return updateOrderStatus(orderId, "Cancelled");
}

export async function forceStatusUpdate(orderId) {
  const o = await getOrderById(orderId);
  if (!o) return null;
  const flow = ["Pending", "Assigned", "In Transit", "Delivered"];
  const idx = flow.indexOf(o.status);
  const next = idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : "Delivered";
  return updateOrderStatus(orderId, next);
}
