// FakeProfileApi.js

const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

let fakeProfile = {
  id:          "USR-AUTH-002",
  name:        "Alex Mange",
  email:       "alex.m@wassali.dz",
  phone:       "+213 555 12 34 56",
  avatar:      "",
  badge:       "Elite Partner",
  verified:    true,
  status:      "online",
  location:    "Algiers Center",
  locationTag: "PRIMARY ZONE",

  pricing: {
    baseFare:       150,
    pricePerKm:     25,
    pricePerWeight: 50,
  },

  workingHours: {
    active: true,
    days:   ["M", "T", "W", "T", "F"],
    from:   "08:00",
    to:     "20:00",
  },

  documents: [
    { id: "DOC-001", label: "National ID Card", status: "verified", imageUrl: "/docs/id.jpg"      },
    { id: "DOC-002", label: "Driver's License", status: "verified", imageUrl: "/docs/license.jpg" },
  ],

  fleet: {
    status:    "Active & Calibrated",
    name:      "Peugeot 103 1971",
    class:     "Standard Delivery Class",
    plate:     "KNT-882-QX",
    imageUrl:  "",
  },

  achievements: [
    { id: 1, icon: "🏆", label: "Perfect Month",  sub: "Zero late deliveries"          },
    { id: 2, icon: "⚡", label: "Speed Demon",    sub: "100+ Express trips handled"    },
  ],

  quickStats: {
    totalTrips: 1284,
    distance:   "4.2k km",
  },
};

// ─── API Functions ──────────────────────────────────────

export async function getProfile() {
  await delay();
  return { ...fakeProfile };
}

export async function updatePricing(pricing) {
  await delay(500);
  fakeProfile.pricing = { ...fakeProfile.pricing, ...pricing };
  return { success: true, pricing: fakeProfile.pricing };
}

export async function updateWorkingHours(hours) {
  await delay(500);
  fakeProfile.workingHours = { ...fakeProfile.workingHours, ...hours };
  return { success: true, workingHours: fakeProfile.workingHours };
}

export async function toggleOnlineStatus() {
  await delay(300);
  fakeProfile.status = fakeProfile.status === "online" ? "offline" : "online";
  return { success: true, status: fakeProfile.status };
}

export async function updateProfile(data) {
  await delay(600);
  fakeProfile = { ...fakeProfile, ...data };
  return { success: true, profile: fakeProfile };
}