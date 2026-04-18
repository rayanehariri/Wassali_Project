// FakeVerificationApi.js

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

const fakeVerifications = [
  {
    id: "VER-001",
    deliverer: { name: "Ahmed Benali", email: "ahmed.b@example.com", avatar: "AB" },
    submissionDate: "Oct 24, 2023",
    submissionTime: "10:42 AM",
    idType: "Driver's License",
    idNumber: "DL-98231-X",
    status: "Pending",
    documents: ["front.jpg", "back.jpg"],
  },
  {
    id: "VER-002",
    deliverer: { name: "Sara Mounir", email: "sara.m@example.com", avatar: "SM" },
    submissionDate: "Oct 23, 2023",
    submissionTime: "02:15 PM",
    idType: "National ID",
    idNumber: "18928374",
    status: "Verified",
    documents: ["front.jpg"],
  },
  {
    id: "VER-003",
    deliverer: { name: "Karim Jaziri", email: "k.jaziri@example.com", avatar: "KJ" },
    submissionDate: "Oct 22, 2023",
    submissionTime: "09:30 AM",
    idType: "Passport",
    idNumber: "P99283112",
    status: "Pending",
    documents: ["passport.jpg"],
  },
  {
    id: "VER-004",
    deliverer: { name: "Omar Fayed", email: "omar.f@example.com", avatar: "OF" },
    submissionDate: "Oct 21, 2023",
    submissionTime: "04:45 PM",
    idType: "Driver's License",
    idNumber: "DL-77382-Y",
    status: "Rejected",
    documents: ["front.jpg", "back.jpg"],
  },
  {
    id: "VER-005",
    deliverer: { name: "Leila Mansour", email: "l.mansour@example.com", avatar: "LM" },
    submissionDate: "Oct 21, 2023",
    submissionTime: "11:15 AM",
    idType: "National ID",
    idNumber: "22938471",
    status: "Pending",
    documents: ["front.jpg"],
  },
  {
    id: "VER-006",
    deliverer: { name: "Youssef Karimi", email: "y.karimi@example.com", avatar: "YK" },
    submissionDate: "Oct 20, 2023",
    submissionTime: "08:00 AM",
    idType: "Passport",
    idNumber: "P88172634",
    status: "Verified",
    documents: ["passport.jpg"],
  },
  {
    id: "VER-007",
    deliverer: { name: "Nour Hamdan", email: "n.hamdan@example.com", avatar: "NH" },
    submissionDate: "Oct 19, 2023",
    submissionTime: "03:20 PM",
    idType: "National ID",
    idNumber: "33841920",
    status: "Rejected",
    documents: ["front.jpg"],
  },
  {
    id: "VER-008",
    deliverer: { name: "Rania Tahir", email: "r.tahir@example.com", avatar: "RT" },
    submissionDate: "Oct 18, 2023",
    submissionTime: "01:10 PM",
    idType: "Driver's License",
    idNumber: "DL-44512-Z",
    status: "Pending",
    documents: ["front.jpg", "back.jpg"],
  },
  {
    id: "VER-009",
    deliverer: { name: "Bilal Osman", email: "b.osman@example.com", avatar: "BO" },
    submissionDate: "Oct 17, 2023",
    submissionTime: "10:05 AM",
    idType: "Passport",
    idNumber: "P77364821",
    status: "Verified",
    documents: ["passport.jpg"],
  },
  {
    id: "VER-010",
    deliverer: { name: "Salma Idrissi", email: "s.idrissi@example.com", avatar: "SI" },
    submissionDate: "Oct 16, 2023",
    submissionTime: "09:45 AM",
    idType: "National ID",
    idNumber: "44920183",
    status: "Pending",
    documents: ["front.jpg"],
  },
];

const fakeVerificationStats = {
  pendingRequests: { value: 12,     change: "Requires attention", positive: false, label: "Requires attention"   },
  verifiedWeek:    { value: 45,     change: "+12% from last week", positive: true,  label: "+12% from last week" },
  rejectedWeek:    { value: 3,      change: "Incorrect documents", positive: false, label: "Incorrect documents" },
  avgReviewTime:   { value: "4h 12m", change: "Within SLA",        positive: true,  label: "Within SLA"         },
};

// ─── API Functions ──────────────────────────────────────────────────────────────

export async function getVerifications(filters = {}) {
  await delay();
  let result = [...fakeVerifications];

  if (filters.status && filters.status !== "All") {
    result = result.filter((v) => v.status === filters.status);
  }
  if (filters.idType && filters.idType !== "All ID Types") {
    result = result.filter((v) => v.idType === filters.idType);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (v) =>
        v.deliverer.name.toLowerCase().includes(q) ||
        v.idNumber.toLowerCase().includes(q)
    );
  }

  const page       = filters.page  || 1;
  const limit      = filters.limit || 5;
  const total      = result.length;
  const totalPages = Math.ceil(total / limit);
  const paginated  = result.slice((page - 1) * limit, page * limit);

  return { verifications: paginated, total, page, totalPages };
}

export async function getVerificationById(id) {
  await delay();
  return fakeVerifications.find((v) => v.id === id) ?? null;
}

export async function getVerificationStats() {
  await delay();
  return fakeVerificationStats;
}

export async function updateVerificationStatus(id, status) {
  await delay();
  const item = fakeVerifications.find((v) => v.id === id);
  if (item) item.status = status;
  return item ?? null;
}

export async function createVerification(data) {
  await delay();
  const newItem = {
    id: `VER-${String(fakeVerifications.length + 1).padStart(3, "0")}`,
    submissionDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    submissionTime: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    status: "Pending",
    documents: [],
    ...data,
  };
  fakeVerifications.unshift(newItem);
  return newItem;
}

export async function deleteVerification(id) {
  await delay();
  const index = fakeVerifications.findIndex((v) => v.id === id);
  if (index !== -1) fakeVerifications.splice(index, 1);
  return { success: true };
}

export async function exportVerificationsCSV() {
  await delay();
  const headers = ["ID", "Name", "Email", "ID Type", "ID Number", "Submission Date", "Status"];
  const rows = fakeVerifications.map((v) =>
    [v.id, v.deliverer.name, v.deliverer.email, v.idType, v.idNumber, v.submissionDate, v.status].join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}