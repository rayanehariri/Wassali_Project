import { http } from "../../api/http";

const fakeDelivererStats = {
  totalEarnings: { value: "2,845.50 DZD", change: "+12.5%", positive: true,  label: "vs last week"     },
  today:         { value: "145.20 DZD",   change: "6",      positive: true,  label: "trips completed"  },
  rating:        { value: "4.92",         change: "Top 5%", positive: true,  label: " Partner"   },
};

const fakeNotifications = [
  { id: 1, color: "#3b82f6", label: "New Order Available",  sub: "Mohammadia • 850 DZD",        time: "Just now" },
  { id: 2, color: "#10b981", label: "Payout Processed",     sub: "Weekly earnings deposited.",   time: "2hrs ago" },
  { id: 3, color: "#f59e0b", label: "New 5-Star Rating!",   sub: '"Great service, very fast!"',  time: "3hrs ago" },
  { id: 4, color: "#a78bfa", label: "Surge Pricing Active", sub: "2× multiplier in your zone.",  time: "5hrs ago" },
];

const fakeRecentDeliveries = [
  { id: "#WASS-9281", items: "2× Grocery Box",         date: "Today, 10:42 AM",      status: "Completed", payout: "1,650.00 DZD" },
  { id: "#WASS-9280", items: "1× Hot Meal, 1× Drink",  date: "Today, 09:15 AM",      status: "Completed", payout: "1,120.00 DZD" },
  { id: "#WASS-9279", items: "3× Pharmacy Items",      date: "Yesterday, 06:30 PM",  status: "Cancelled", payout: "850.00 DZD"   },
];

/**
 * Get deliverer stats
 * Replace with: return axios.get("/api/deliverer/stats")
 */
export async function getDelivererStats() {
  const res = await http.get("/deliverer/stats");
  return res?.data?.data ?? res?.data ?? fakeDelivererStats;
}

/**
 * Get notifications
 * Replace with: return axios.get("/api/deliverer/notifications")
 */
export async function getDelivererNotifications() {
  const res = await http.get("/deliverer/notifications");
  return res?.data?.notifications ?? res?.data?.data?.notifications ?? fakeNotifications;
}

/**
 * Get recent deliveries
 * Replace with: return axios.get("/api/deliverer/deliveries/recent")
 */
export async function getRecentDeliveries() {
  const res = await http.get("/deliverer/deliveries/recent");
  return res?.data?.deliveries ?? res?.data?.data?.deliveries ?? fakeRecentDeliveries;
}

/**
 * Toggle online status
 * Replace with: return axios.post("/api/deliverer/status", { online })
 */
export async function toggleOnlineStatus(online) {
  const res = await http.post("/deliverer/status", { online });
  return res?.data?.data ?? { success: true, online };
}
