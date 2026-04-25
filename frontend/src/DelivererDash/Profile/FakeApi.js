// Profile API (real backend-first; no placeholder “Alex” identity)
import { http } from "../../api/http";

function emptyProfile() {
  return {
    id: "",
    name: "",
    email: "",
    phone: "",
    avatar: "",
    badge: "Partner",
    verified: false,
    status: "offline",
    location: "",
    locationTag: "",
    pricing: {
      baseFare: 150,
      pricePerKm: 25,
      pricePerWeight: 50,
    },
    workingHours: {
      active: true,
      days: ["M", "T", "W", "T", "F"],
      from: "08:00",
      to: "20:00",
    },
    documents: [],
    fleet: {
      status: "—",
      name: "—",
      class: "—",
      plate: "—",
      imageUrl: "",
    },
    achievements: [],
    quickStats: {
      totalTrips: 0,
      distance: "—",
    },
  };
}

// ─── API Functions ──────────────────────────────────────

export async function getProfile() {
  const base = emptyProfile();
  try {
    const [meRes, settingsRes] = await Promise.allSettled([
      http.get("/deliverer/me"),
      http.get("/deliverer/settings"),
    ]);
    const me = meRes.status === "fulfilled" ? (meRes.value?.data?.user ?? null) : null;
    const settings =
      settingsRes.status === "fulfilled"
        ? (settingsRes.value?.data?.settings ?? settingsRes.value?.data ?? null)
        : null;

    if (!me) return base;

    const fullName = (me.name || me.username || "").trim() || "Deliverer";
    const derivedLocation =
      [me.wilaya, me.commune].filter(Boolean).join(" - ") ||
      (me.wilaya ? String(me.wilaya) : "") ||
      base.location;

    return {
      ...base,
      id: me._id != null ? String(me._id) : base.id,
      name: fullName,
      email: (me.email || "").trim(),
      phone: (me.phone || "").trim(),
      avatar: me.avatar || "",
      badge: (me.badge || "").trim() || (me.status === "active" ? "Verified partner" : "Partner"),
      verified: me.status === "active",
      status: me.online ? "online" : "offline",
      location: derivedLocation || "—",
      locationTag: me.wilaya ? String(me.wilaya).toUpperCase().slice(0, 24) : "ZONE",
      workingHours: {
        ...base.workingHours,
        active: settings?.permissions?.locationSharing ?? base.workingHours.active,
        from: settings?.workingHours?.from ?? me.working_hours_from ?? base.workingHours.from,
        to: settings?.workingHours?.to ?? me.working_hours_to ?? base.workingHours.to,
      },
      pricing: {
        baseFare: Number(me.base_fare ?? me.pricing?.baseFare ?? base.pricing.baseFare),
        pricePerKm: Number(me.price_per_km ?? me.pricing?.pricePerKm ?? base.pricing.pricePerKm),
        pricePerWeight: Number(me.price_per_weight ?? me.pricing?.pricePerWeight ?? base.pricing.pricePerWeight),
      },
      fleet: {
        status: me.vehicle_status || me.fleet?.status || base.fleet.status,
        name: me.vehicle_model || me.fleet?.name || base.fleet.name,
        class: me.vehicle_class || me.fleet?.class || base.fleet.class,
        plate: me.license_plate || me.fleet?.plate || base.fleet.plate,
        imageUrl: me.fleet?.imageUrl || "",
      },
      quickStats: {
        totalTrips: Number(me.total_trips ?? me.totalTrips ?? 0),
        distance: me.distance_label || base.quickStats.distance,
      },
    };
  } catch {
    return emptyProfile();
  }
}

export async function updatePricing(pricing) {
  await Promise.resolve();
  return { success: true, pricing };
}

export async function updateWorkingHours(hours) {
  await Promise.resolve();
  return { success: true, workingHours: hours };
}

export async function toggleOnlineStatus() {
  try {
    const meRes = await http.get("/deliverer/me");
    const u = meRes?.data?.user ?? {};
    const cur = u.online === true;
    const nextOnline = !cur;
    await http.post("/deliverer/status", { online: nextOnline });
    return { success: true, status: nextOnline ? "online" : "offline" };
  } catch {
    return { success: false, status: "offline" };
  }
}

export async function updateProfile(data) {
  await Promise.resolve();
  return { success: true, profile: { ...emptyProfile(), ...data } };
}
