// FakeUserDetailApi.js

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

const fakeUserDetails = [
  {
    id: "USR-001",
    name: "Amine Khelif",
    email: "bouchoucha.k@esi-sba.dz",
    avatar: "AK",
    avatarUrl: "",
    role: "Deliverer",
    badge: "Top Rated Deliverer",
    verified: true,
    status: "Active",
    rating: 4.9,
    deliveries: 1240,
    memberYears: "3yr",
    phone: "+213 555 123 456",
    homeAddress: "12 Rue Didouche Mourad, Algiers",
    joinDate: "Mar 15, 2021",
    vehicle: {
      type: "Motorcycle",
      model: "Sym Fiddle III",
      plateNumber: "00123-116-16",
      verified: true,
      imageUrl: "",
    },
    stats: {
      totalEarned:     { value: "450,000", change: "+12.5%", positive: true,  label: "from last month"   },
      avgDeliveryTime: { value: "24",       change: "-2 min", positive: true,  label: "faster than avg"  },
      acceptanceRate:  { value: "98%",          progress: 98,     positive: true,  label: "Acceptance Rate"  },
    },
    reviews: {
      average: 4.9,
      breakdown: { 5: 85, 4: 10, 3: 3, 2: 1, 1: 1 },
      latest: {
        text: "Very polite and fast delivery. Food was still hot. Highly recommend...",
        label: "Great service!",
        time: "2d ago",
      },
    },
    recentDeliveries: [
      { id: "#ORD-00921", date: "Today, 10:23 AM",    customer: { name: "Sarah B.",  avatar: "SB" }, status: "Completed" },
      { id: "#ORD-00920", date: "Yesterday, 4:15 PM", customer: { name: "Karim M.",  avatar: "KM" }, status: "Completed" },
      { id: "#ORD-00918", date: "Oct 24, 2:30 PM",    customer: { name: "Youcef A.", avatar: "YA" }, status: "Cancelled" },
    ],
  },
  {
    id: "USR-002",
    name: "Sarah Boudiaf",
    email: "sarah.b@gmail.com",
    avatar: "SB",
    avatarUrl: "",
    role: "Customer",
    badge: "Loyal Customer",
    verified: true,
    status: "Active",
    rating: 4.7,
    deliveries: 45,
    memberYears: "2yr",
    phone: "+213 555 987 654",
    homeAddress: "5 Rue Ben Mhidi, Oran",
    joinDate: "Nov 02, 2022",
    vehicle: null,
    stats: {
      totalEarned:     { value: "0 DZD",   change: "+0%",    positive: true, label: "from last month"  },
      avgDeliveryTime: { value: "—",        change: "—",      positive: true, label: "avg wait time"    },
      acceptanceRate:  { value: "—",        progress: 0,      positive: true, label: "Order Rate"       },
    },
    reviews: {
      average: 4.7,
      breakdown: { 5: 70, 4: 20, 3: 5, 2: 3, 1: 2 },
      latest: {
        text: "Fast delivery, great experience overall.",
        label: "Loved it!",
        time: "5d ago",
      },
    },
    recentDeliveries: [
      { id: "#ORD-00810", date: "Today, 09:00 AM",    customer: { name: "Self", avatar: "SB" }, status: "Completed" },
      { id: "#ORD-00799", date: "Oct 20, 11:00 AM",   customer: { name: "Self", avatar: "SB" }, status: "Completed" },
    ],
  },
];

const fakeOrderHistory = {
  "USR-001": [
    { id: "#ORD-00921", date: "Today, 10:23 AM",      route: { from: "McDonald's Hydra",       to: "Didouche Mourad, Algiers"  }, amount: "850 DZD",  status: "Completed" },
    { id: "#ORD-00920", date: "Yesterday, 4:15 PM",   route: { from: "Pizza Hut Kouba",        to: "Ben Aknoun, Algiers"       }, amount: "1200 DZD", status: "Completed" },
    { id: "#ORD-00918", date: "Oct 24, 2:30 PM",      route: { from: "KFC Bab Ezzouar",        to: "El Harrach, Algiers"       }, amount: "650 DZD",  status: "Cancelled" },
    { id: "#ORD-00915", date: "Oct 22, 12:00 PM",     route: { from: "Burger King Cheraga",    to: "Dely Ibrahim, Algiers"     }, amount: "980 DZD",  status: "Completed" },
    { id: "#ORD-00910", date: "Oct 20, 8:00 PM",      route: { from: "Subway Hydra",           to: "Birkhaden, Algiers"        }, amount: "720 DZD",  status: "Completed" },
    { id: "#ORD-00905", date: "Oct 18, 1:30 PM",      route: { from: "Tacos House Saoula",     to: "Draria, Algiers"           }, amount: "430 DZD",  status: "Completed" },
    { id: "#ORD-00900", date: "Oct 15, 7:45 PM",      route: { from: "Pasta Palace Hydra",     to: "El Achour, Algiers"        }, amount: "1100 DZD", status: "Completed" },
    { id: "#ORD-00895", date: "Oct 13, 11:00 AM",     route: { from: "Sushi Bar Bouzareah",    to: "Cheraga, Algiers"          }, amount: "1500 DZD", status: "Cancelled" },
  ],
  "USR-002": [
    { id: "#ORD-00810", date: "Today, 09:00 AM",      route: { from: "McDonald's Oran",        to: "Ben Mhidi, Oran"           }, amount: "600 DZD",  status: "Completed" },
    { id: "#ORD-00799", date: "Oct 20, 11:00 AM",     route: { from: "Pizza Hut Oran",         to: "Ben Mhidi, Oran"           }, amount: "900 DZD",  status: "Completed" },
  ],
};

// ─── API Functions ──────────────────────────────────────────────────────────────

/**
 * Get user detail by ID
 * Replace with: return axios.get(`/api/admin/users/${userId}`)
 */
export async function getUserDetail(userId) {
  await delay();
  return fakeUserDetails.find((u) => u.id === userId) ?? null;
}

/**
 * Get order history for a user
 * Replace with: return axios.get(`/api/admin/users/${userId}/orders`, { params: filters })
 */
export async function getUserOrderHistory(userId, filters = {}) {
  await delay();
  let result = [...(fakeOrderHistory[userId] ?? [])];

  if (filters.status && filters.status !== "All") {
    result = result.filter((o) => o.status === filters.status);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (o) => o.id.toLowerCase().includes(q) || o.route.from.toLowerCase().includes(q)
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
 * Suspend a user account
 * Replace with: return axios.patch(`/api/admin/users/${userId}/status`, { status: "suspended" })
 */
export async function suspendUser(userId) {
  await delay();
  const user = fakeUserDetails.find((u) => u.id === userId);
  if (user) user.status = "Banned";
  return { success: true };
}

/**
 * Send message to user
 * Replace with: return axios.post(`/api/admin/users/${userId}/message`, { message })
 */
export async function sendMessage(userId, message) {
  await delay();
  return { success: true, message: "Message sent successfully" };
}