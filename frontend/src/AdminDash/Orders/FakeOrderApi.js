// FakeOrderApi.js
// Fake API — replace with real axios calls when connecting to backend

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

// ─── Fake Orders Data ───────────────────────────────────────────────────────────
const fakeOrders = [
  {
    id: "WAS-9281",
    placedAt: "Today, 10:23 AM",
    date: "Today, 10:23 AM",
    estimatedArrival: "10:45 AM",
    receiptId: "R-00192",
    status: "In Transit",
    amount: "$45.00",
    customer:  { name: "Sarah Jenkins", avatar: "SJ", rating: 4.8 },
    deliverer: { name: "Mike T.",        avatar: "MT", rating: 4.9, vehicle: "Motorcycle" },
    route: { from: "123 Main St, Downtown", to: "456 Oak Ave, Riverside" },
    restaurantLocation: { lat: 36.7372, lng: -3.0865, label: "Restaurant" },
    customerLocation:   { lat: 36.7525, lng: -3.0420, label: "Customer"   },
    riderLocation:      { lat: 36.7450, lng: -3.0640 },
    items: [
      { qty: 2, name: "Burger Deluxe", price: "$18.00" },
      { qty: 1, name: "Large Fries",   price: "$5.00"  },
      { qty: 2, name: "Cola",          price: "$4.00"  },
    ],
    timeline: [
      { label: "Order Placed",              time: "10:23 AM", done: true,  active: false },
      { label: "Picked Up from Restaurant", time: "10:31 AM", done: true,  active: false },
      { label: "On the way",                time: "10:35 AM", done: false, active: true  },
      { label: "Delivered",                 time: null,       done: false, active: false },
    ],
  },
  {
    id: "WAS-9282",
    placedAt: "Today, 09:15 AM",
    date: "Today, 09:15 AM",
    estimatedArrival: "09:40 AM",
    receiptId: "R-00193",
    status: "Pending",
    amount: "$32.50",
    customer:  { name: "David Chen", avatar: "DC", rating: 4.6 },
    deliverer: { name: "Sarah L.",   avatar: "SL", rating: 4.8, vehicle: "Bicycle" },
    route: { from: "789 Pine Ln, Westside", to: "101 Maple Dr, Uptown" },
    restaurantLocation: { lat: 36.7200, lng: -3.1000, label: "Restaurant" },
    customerLocation:   { lat: 36.7300, lng: -3.0700, label: "Customer"   },
    riderLocation:      { lat: 36.7200, lng: -3.1000 },
    items: [
      { qty: 1, name: "Grilled Chicken", price: "$14.00" },
      { qty: 2, name: "Side Salad",      price: "$9.00"  },
    ],
    timeline: [
      { label: "Order Placed",              time: "09:15 AM", done: true,  active: false },
      { label: "Picked Up from Restaurant", time: null,       done: false, active: true  },
      { label: "On the way",                time: null,       done: false, active: false },
      { label: "Delivered",                 time: null,       done: false, active: false },
    ],
  },
  {
    id: "WAS-9283",
    placedAt: "Yesterday, 04:45 PM",
    date: "Yesterday, 04:45 PM",
    estimatedArrival: "05:10 PM",
    receiptId: "R-00194",
    status: "Delivered",
    amount: "$18.00",
    customer:  { name: "Emily Moore", avatar: "EM", rating: 4.7 },
    deliverer: { name: "Tom H.",      avatar: "TH", rating: 4.7, vehicle: "Scooter" },
    route: { from: "222 Elm St, Suburbs", to: "333 Birch Rd, North Hills" },
    restaurantLocation: { lat: 36.7100, lng: -3.0900, label: "Restaurant" },
    customerLocation:   { lat: 36.7250, lng: -3.0600, label: "Customer"   },
    riderLocation:      { lat: 36.7250, lng: -3.0600 },
    items: [
      { qty: 1, name: "Margherita Pizza", price: "$12.00" },
      { qty: 1, name: "Tiramisu",         price: "$6.00"  },
    ],
    timeline: [
      { label: "Order Placed",              time: "04:45 PM", done: true, active: false },
      { label: "Picked Up from Restaurant", time: "04:55 PM", done: true, active: false },
      { label: "On the way",                time: "05:00 PM", done: true, active: false },
      { label: "Delivered",                 time: "05:08 PM", done: true, active: false },
    ],
  },
  {
    id: "WAS-9284",
    placedAt: "Yesterday, 02:10 PM",
    date: "Yesterday, 02:10 PM",
    estimatedArrival: "02:40 PM",
    receiptId: "R-00195",
    status: "Assigned",
    amount: "$120.00",
    customer:  { name: "Michael Scott", avatar: "MS", rating: 4.5 },
    deliverer: { name: "Dwight S.",     avatar: "DS", rating: 5.0, vehicle: "Car" },
    route: { from: "555 Cedar Blvd, Industrial", to: "777 Ash Ct, Business Park" },
    restaurantLocation: { lat: 36.7600, lng: -3.0500, label: "Restaurant" },
    customerLocation:   { lat: 36.7750, lng: -3.0200, label: "Customer"   },
    riderLocation:      { lat: 36.7600, lng: -3.0500 },
    items: [
      { qty: 3, name: "Steak Meal",  price: "$45.00" },
      { qty: 2, name: "Wine Bottle", price: "$30.00" },
      { qty: 1, name: "Cheesecake", price: "$0.00"  },
    ],
    timeline: [
      { label: "Order Placed",              time: "02:10 PM", done: true,  active: false },
      { label: "Picked Up from Restaurant", time: null,       done: false, active: true  },
      { label: "On the way",                time: null,       done: false, active: false },
      { label: "Delivered",                 time: null,       done: false, active: false },
    ],
  },
  {
    id: "WAS-9285",
    placedAt: "Today, 11:30 AM",
    date: "Today, 11:30 AM",
    estimatedArrival: "N/A",
    receiptId: "R-00196",
    status: "Cancelled",
    amount: "$25.00",
    customer:  { name: "Jim Halpert", avatar: "JH", rating: 4.4 },
    deliverer: { name: "Unassigned",  avatar: "--", rating: null, vehicle: null },
    route: { from: "888 Spruce Way, Eastside", to: "999 Fir Pl, Harbor" },
    restaurantLocation: { lat: 36.7000, lng: -3.1100, label: "Restaurant" },
    customerLocation:   { lat: 36.7150, lng: -3.0800, label: "Customer"   },
    riderLocation:      { lat: 36.7000, lng: -3.1100 },
    items: [
      { qty: 2, name: "Veggie Wrap",  price: "$10.00" },
      { qty: 1, name: "Orange Juice", price: "$5.00"  },
    ],
    timeline: [
      { label: "Order Placed",              time: "11:30 AM", done: true,  active: false },
      { label: "Picked Up from Restaurant", time: null,       done: false, active: false },
      { label: "On the way",                time: null,       done: false, active: false },
      { label: "Delivered",                 time: null,       done: false, active: false },
    ],
  },
];

// ─── Stats Data ─────────────────────────────────────────────────────────────────
const fakeStats = {
  totalOrders:    { value: 1248, change: "+12%", positive: true },
  pendingPickups: { value: 42,   change: "+5%",  positive: true },
  inTransit:      { value: 115,  change: "+8%",  positive: true },
  deliveredToday: { value: 89,   change: "+15%", positive: true },
};

// ─── Status Flow ────────────────────────────────────────────────────────────────
const statusFlow = ["Pending", "Assigned", "In Transit", "Delivered"];

// ─── API Functions ──────────────────────────────────────────────────────────────

/**
 * Get all orders with optional filters
 * @param {object} filters - { status, search, page, limit }
 * @returns {object} - { orders, total, page, totalPages }
 *
 * Replace with:
 * return axios.get("/api/admin/orders", { params: filters })
 */
export async function getOrders(filters = {}) {
  await delay();
  let result = [...fakeOrders];

  if (filters.status && filters.status !== "All") {
    result = result.filter((o) => o.status === filters.status);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.deliverer.name.toLowerCase().includes(q)
    );
  }

  const page       = filters.page  || 1;
  const limit      = filters.limit || 5;
  const total      = result.length;
  const totalPages = Math.ceil(total / limit);
  const paginated  = result.slice((page - 1) * limit, page * limit);

  return { orders: paginated, total, page, totalPages };
}

/**
 * Get a single order by ID
 * @param {string} orderId
 * @returns {object|null}
 *
 * Replace with:
 * return axios.get(`/api/admin/orders/${orderId}`)
 */
export async function getOrderById(orderId) {
  await delay();
  return fakeOrders.find((o) => o.id === orderId) ?? null;
}

/**
 * Get order stats for the dashboard cards
 * @returns {object}
 *
 * Replace with:
 * return axios.get("/api/admin/orders/stats")
 */
export async function getOrderStats() {
  await delay();
  return fakeStats;
}

/**
 * Create a new order
 * @param {object} orderData
 * @returns {object} - the newly created order
 *
 * Replace with:
 * return axios.post("/api/admin/orders", orderData)
 */
export async function createOrder(orderData) {
  await delay();
  const newOrder = {
    id: `WAS-${Math.floor(Math.random() * 9000) + 1000}`,
    placedAt: "Just now",
    estimatedArrival: "TBD",
    receiptId: `R-${Math.floor(Math.random() * 90000) + 10000}`,
    status: "Pending",
    restaurantLocation: { lat: 36.7372, lng: -3.0865, label: "Restaurant" },
    customerLocation:   { lat: 36.7525, lng: -3.0420, label: "Customer"   },
    riderLocation:      { lat: 36.7372, lng: -3.0865 },
    timeline: [
      { label: "Order Placed",              time: "Just now", done: true,  active: false },
      { label: "Picked Up from Restaurant", time: null,       done: false, active: true  },
      { label: "On the way",                time: null,       done: false, active: false },
      { label: "Delivered",                 time: null,       done: false, active: false },
    ],
    ...orderData,
  };
  fakeOrders.unshift(newOrder);
  return newOrder;
}

/**
 * Update order status
 * @param {string} orderId
 * @param {string} status - "Pending" | "Assigned" | "In Transit" | "Delivered" | "Cancelled"
 * @returns {object|null}
 *
 * Replace with:
 * return axios.patch(`/api/admin/orders/${orderId}`, { status })
 */
export async function updateOrderStatus(orderId, status) {
  await delay();
  const order = fakeOrders.find((o) => o.id === orderId);
  if (order) order.status = status;
  return order ?? null;
}

/**
 * Cancel an order
 * @param {string} orderId
 * @returns {object|null}
 *
 * Replace with:
 * return axios.patch(`/api/admin/orders/${orderId}/cancel`)
 */
export async function cancelOrder(orderId) {
  await delay();
  const order = fakeOrders.find((o) => o.id === orderId);
  if (order) order.status = "Cancelled";
  return order ?? null;
}

/**
 * Force advance the order to the next status in the flow
 * Also advances the timeline accordingly
 * @param {string} orderId
 * @returns {{ status: string, timeline: array }|null}
 *
 * Replace with:
 * return axios.post(`/api/admin/orders/${orderId}/force-update`)
 */
export async function forceStatusUpdate(orderId) {
  await delay();
  const order = fakeOrders.find((o) => o.id === orderId);
  if (!order) return null;

  const idx = statusFlow.indexOf(order.status);
  if (idx !== -1 && idx < statusFlow.length - 1) {
    order.status = statusFlow[idx + 1];
  }

  // Advance timeline: mark current active step as done, activate next
  const activeStep = order.timeline.find((t) => t.active);
  const nextStep   = order.timeline.find((t) => !t.done && !t.active);

  if (activeStep) {
    activeStep.done   = true;
    activeStep.active = false;
    activeStep.time   = "Just now";
  }
  if (nextStep) {
    nextStep.active = true;
  }

  return { status: order.status, timeline: order.timeline };
}

/**
 * Delete an order
 * @param {string} orderId
 * @returns {{ success: boolean }}
 *
 * Replace with:
 * return axios.delete(`/api/admin/orders/${orderId}`)
 */
export async function deleteOrder(orderId) {
  await delay();
  const index = fakeOrders.findIndex((o) => o.id === orderId);
  if (index !== -1) fakeOrders.splice(index, 1);
  return { success: true };
}