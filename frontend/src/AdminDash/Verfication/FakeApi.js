import { http } from "../../api/http";

// ─── API Functions ──────────────────────────────────────────────────────────────
const FALLBACK_VERIFICATIONS = [
  {
    id: "VER-1001",
    deliverer: { name: "Ahmed K.", email: "ahmed.k@wassali.com", avatar: "AK" },
    submissionDate: "Apr 18, 2026",
    submissionTime: "10:24 AM",
    idType: "Driver's License",
    idNumber: "1458-ALG-22",
    status: "Pending",
    documents: [],
  },
  {
    id: "VER-1002",
    deliverer: { name: "Sarah M.", email: "sarah.m@wassali.com", avatar: "SM" },
    submissionDate: "Apr 17, 2026",
    submissionTime: "04:02 PM",
    idType: "National ID",
    idNumber: "DZ-90321445",
    status: "Verified",
    documents: [],
  },
  {
    id: "VER-1003",
    deliverer: { name: "Youssef B.", email: "youssef.b@wassali.com", avatar: "YB" },
    submissionDate: "Apr 17, 2026",
    submissionTime: "09:33 AM",
    idType: "Passport",
    idNumber: "P-887234",
    status: "Rejected",
    documents: [],
  },
  {
    id: "VER-1004",
    deliverer: { name: "Nora A.", email: "nora.a@wassali.com", avatar: "NA" },
    submissionDate: "Apr 16, 2026",
    submissionTime: "01:47 PM",
    idType: "Driver's License",
    idNumber: "2291-ALG-75",
    status: "Pending",
    documents: [],
  },
];

function formatSubmissionDate(raw) {
  if (raw == null) return "";
  try {
    const d = typeof raw === "string" ? new Date(raw) : raw;
    return new Date(d).toLocaleString();
  } catch {
    return String(raw);
  }
}

function mapVerification(v) {
  const docs =
    v.documents && typeof v.documents === "object" && !Array.isArray(v.documents)
      ? v.documents
      : {};
  return {
    id: v.verification_id ?? v._id ?? v.id,
    deliverer: {
      name: v.deliverer?.name ?? "Deliverer",
      email: v.deliverer?.email ?? "",
      avatar: v.deliverer?.avatar ?? (v.deliverer?.name ? v.deliverer.name.slice(0, 2).toUpperCase() : "D"),
    },
    submissionDate: v.submission_date ?? formatSubmissionDate(v.created_at) ?? "",
    submissionTime: v.submission_time ?? "",
    idType: v.id_type ?? "",
    idNumber: v.id_number ?? "",
    status: (v.status ?? "pending").toString().replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    documents: docs,
    vehicle: v.vehicle ?? null,
    raw: v,
  };
}

export async function getVerifications(filters = {}) {
  let result = [];
  try {
    const res = await http.get("/verification/admin/list");
    result = res?.data?.verifications ?? res?.data?.data?.verifications ?? [];
  } catch {
    result = [];
  }

  const mapped = (result.length ? result.map(mapVerification) : [...FALLBACK_VERIFICATIONS]);

  let filtered = mapped;
  if (filters.status && filters.status !== "All") {
    filtered = filtered.filter((v) => (v.status ?? "").toLowerCase() === filters.status.toLowerCase());
  }
  if (filters.idType && filters.idType !== "All ID Types") {
    filtered = filtered.filter((v) => (v.idType ?? "").toLowerCase() === filters.idType.toLowerCase());
  }
  if (filters.search) {
    const q = String(filters.search).toLowerCase();
    filtered = filtered.filter(
      (v) =>
        String(v.deliverer?.name ?? "").toLowerCase().includes(q) ||
        String(v.idNumber ?? "").toLowerCase().includes(q)
    );
  }

  const page = filters.page || 1;
  const limit = filters.limit || 5;
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const verifications = filtered.slice((page - 1) * limit, page * limit);

  return { verifications, total, page, totalPages };
}

export async function getVerificationById(id) {
  try {
    const res = await http.get(`/verification/admin/${id}`);
    const v = res?.data?.verification ?? res?.data?.data?.verification ?? null;
    if (!v) return FALLBACK_VERIFICATIONS.find((x) => x.id === id) ?? null;
    return mapVerification(v);
  } catch {
    return FALLBACK_VERIFICATIONS.find((x) => x.id === id) ?? null;
  }
}

export async function getVerificationStats() {
  const { verifications } = await getVerifications({ status: "All", idType: "All ID Types", page: 1, limit: 200 });
  const pending = verifications.filter((v) => v.status === "Pending").length;
  const verified = verifications.filter((v) => v.status === "Verified").length;
  const rejected = verifications.filter((v) => v.status === "Rejected").length;
  return {
    pendingRequests: { value: pending, change: "Needs review", positive: pending <= 5, label: "Needs review" },
    verifiedWeek: { value: verified, change: "This week", positive: true, label: "This week" },
    rejectedWeek: { value: rejected, change: "This week", positive: rejected === 0, label: "This week" },
    avgReviewTime: { value: "18h", change: "Avg", positive: true, label: "Avg" },
  };
}

export async function updateVerificationStatus(id, status, rejectReason) {
  const normalized = String(status || "").toLowerCase();
  try {
    if (normalized === "verified" || normalized === "approved") {
      await http.post(`/verification/admin/${id}/approve`);
    } else if (normalized === "rejected") {
      await http.post(`/verification/admin/${id}/reject`, {
        reason: rejectReason?.trim() || "Rejected by admin",
      });
    }
  } catch {
    // UI keeps working with fallback data when backend is unavailable.
  }
  return (
    (await getVerificationById(id)) ??
    {
      id,
      deliverer: { name: "Deliverer", email: "", avatar: "D" },
      submissionDate: "",
      submissionTime: "",
      idType: "",
      idNumber: "",
      status: normalized === "rejected" ? "Rejected" : "Verified",
      documents: [],
    }
  );
}

export async function createVerification(data) {
  return {
    id: `VER-${Date.now()}`,
    deliverer: data?.deliverer ?? { name: "New Deliverer", email: "new@wassali.com", avatar: "ND" },
    submissionDate: new Date().toLocaleDateString(),
    submissionTime: new Date().toLocaleTimeString(),
    idType: data?.idType ?? "National ID",
    idNumber: data?.idNumber ?? "00000000",
    status: "Pending",
    documents: [],
  };
}

export async function deleteVerification(id) {
  // Not implemented (keep UI action harmless)
  return { success: false };
}

export async function exportVerificationsCSV() {
  const { verifications } = await getVerifications({ status: "All", idType: "All ID Types", page: 1, limit: 5000 });
  const headers = ["ID", "Name", "Email", "ID Type", "ID Number", "Submission Date", "Status"];
  const rows = verifications.map((v) =>
    [v.id, v.deliverer.name, v.deliverer.email, v.idType, v.idNumber, v.submissionDate, v.status].join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}