// DelivererOverviewPage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Star, Package, ChevronRight, X, Navigation, MapPin, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  getDelivererStats,
  getRecentDeliveries,
} from "./FakeApi";
import {
  getActiveTask,
  viewNavigationDetails,
  startTransit,
  markDelivered,
  cancelActiveDeliveryByDeliverer,
} from "../Schedule/FakeApi";

const statusStyle = {
  "Completed":  { background: "rgba(16,185,129,0.15)",  color: "#10b981" },
  "Delivered":  { background: "rgba(16,185,129,0.15)",  color: "#10b981" },
  "Accepted":   { background: "rgba(34,197,94,0.15)",   color: "#22c55e" },
  "Cancelled":  { background: "rgba(239,68,68,0.15)",   color: "#ef4444" },
  "Pending":    { background: "rgba(234,179,8,0.15)",   color: "#eab308" },
  "In Transit": { background: "rgba(59,130,246,0.15)",  color: "#3b82f6" },
};

function DelivererLiveMap({ pickupCoords, dropoffCoords, height = 300 }) {
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const layersRef = useRef(null);
  const sig = `${JSON.stringify(pickupCoords)}|${JSON.stringify(dropoffCoords)}`;

  useEffect(() => {
    function ensureLeaflet(cb) {
      if (window.L) { cb(); return; }
      if (!document.querySelector("#dash-leaflet-css")) {
        const link = document.createElement("link");
        link.id = "dash-leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = cb;
      document.head.appendChild(script);
    }

    ensureLeaflet(() => {
      if (!mapRef.current || mapObj.current) return;
      const L = window.L;
      const map = L.map(mapRef.current, {
        center: [36.737, 3.086],
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
      });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(map);
      mapObj.current = map;
      layersRef.current = L.layerGroup().addTo(map);
    });

    return () => {
      if (mapObj.current) {
        mapObj.current.remove();
        mapObj.current = null;
        layersRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const L = window.L;
    const map = mapObj.current;
    const layers = layersRef.current;
    if (!L || !map || !layers) return;

    layers.clearLayers();
    const fallback = [36.737, 3.086];
    const a = Array.isArray(pickupCoords) && pickupCoords.length >= 2 ? pickupCoords : null;
    const b = Array.isArray(dropoffCoords) && dropoffCoords.length >= 2 ? dropoffCoords : null;

    const mk = (color, glow) => L.divIcon({
      className: "",
      html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid #0e3a4a;${glow ? `box-shadow:0 0 10px ${glow}` : ""}"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

    if (a && b) {
      L.marker(a, { icon: mk("#4ade80", "rgba(74,222,128,.8)") }).addTo(layers).bindPopup("Pickup");
      L.marker(b, { icon: mk("#f87171") }).addTo(layers).bindPopup("Drop-off");
      L.polyline([a, b], { color: "#3b82f6", weight: 3, opacity: 0.75, dashArray: "8 5" }).addTo(layers);
      try {
        map.fitBounds([a, b], { padding: [28, 28], animate: false });
      } catch {
        map.setView(a, 13);
      }
    } else {
      const c = a || b || fallback;
      L.marker(c, { icon: mk("#60a5fa", "rgba(96,165,250,.8)") }).addTo(layers).bindPopup("Route");
      map.setView(c, a || b ? 13 : 12);
    }
  }, [sig, pickupCoords, dropoffCoords]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height,
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid #1e2d3d",
        background: "#0d1b2e",
      }}
    />
  );
}

const fullDeliveryHistory = [
  { id: "#WASS-9281", items: "2× Grocery Box",          date: "Today, 10:42 AM",      status: "Completed", payout: "1,650.00 DZD" },
  { id: "#WASS-9280", items: "1× Hot Meal, 1× Drink",   date: "Today, 09:15 AM",      status: "Completed", payout: "1,120.00 DZD" },
  { id: "#WASS-9279", items: "3× Pharmacy Items",       date: "Yesterday, 06:30 PM",  status: "Cancelled", payout: "850.00 DZD"   },
  { id: "#WASS-9278", items: "1× Electronics Package",  date: "Yesterday, 04:15 PM",  status: "Completed", payout: "2,000.00 DZD" },
  { id: "#WASS-9275", items: "2× Fast Food Combo",      date: "Yesterday, 01:20 PM",  status: "Completed", payout: "950.00 DZD"   },
  { id: "#WASS-9270", items: "1× Medicine Pack",        date: "Oct 24, 11:00 AM",     status: "Completed", payout: "600.00 DZD"   },
  { id: "#WASS-9265", items: "3× Grocery Box",          date: "Oct 24, 09:30 AM",     status: "Cancelled", payout: "750.00 DZD"   },
  { id: "#WASS-9260", items: "2× Clothing Items",       date: "Oct 23, 05:00 PM",     status: "Completed", payout: "1,300.00 DZD" },
  { id: "#WASS-9255", items: "1× Laptop Bag",           date: "Oct 23, 02:10 PM",     status: "Completed", payout: "1,800.00 DZD" },
  { id: "#WASS-9250", items: "4× Fast Food Combo",      date: "Oct 22, 08:45 PM",     status: "Completed", payout: "1,100.00 DZD" },
  { id: "#WASS-9245", items: "2× Pharmacy Items",       date: "Oct 22, 03:20 PM",     status: "Completed", payout: "500.00 DZD"   },
  { id: "#WASS-9240", items: "1× Grocery Box",          date: "Oct 21, 12:00 PM",     status: "Cancelled", payout: "400.00 DZD"   },
];

const ITEMS_PER_PAGE = 5;

// ── Active Task Card ─────────────────────────────────────
function ActiveTaskCard({
  task,
  onViewNavigation,
  onAdvanceStatus,
  onCancel,
  navLoading,
  statusUpdating,
  cancellingTask,
}) {
  if (!task) {
    return (
      <div style={{
        background: "#0f1623",
        border: "1px solid rgba(173,198,255,0.12)",
        borderRadius: "16px",
        padding: "24px 18px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 280,
        color: "#64748b",
        fontSize: 13,
        textAlign: "center",
      }}>
        <Package size={28} style={{ marginBottom: 12, opacity: 0.45 }} />
        <p style={{ margin: 0, fontWeight: 600, color: "#94a3b8" }}>No active delivery</p>
        <p style={{ margin: "8px 0 0", fontSize: 12, opacity: 0.85, maxWidth: 260, lineHeight: 1.45 }}>
          When you accept a job from Schedule, client and route details will show here.
        </p>
      </div>
    );
  }

  const t = task;
  const st = String(t.status || "").toLowerCase();
  const raw = String(t.rawStatus || "").toLowerCase();
  const cancelDisabled =
    cancellingTask || !(st.includes("awaiting") || raw === "accepted" || raw === "pending");
  const navDisabled =
    navLoading || st.includes("awaiting client confirmation") || st.includes("client confirmation");
  const primaryDisabled =
    statusUpdating || st.includes("delivered") || !t.orderId;
  const primaryLabel = st.includes("delivered")
    ? "Delivered"
    : st.includes("awaiting") || raw === "accepted" || raw === "pending"
      ? "Start Transit"
      : st.includes("transit") || raw === "in_transit"
        ? "Mark Delivered"
        : "Start Transit";

  const statusConfig = {
    "Awaiting Pickup": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", dot: "#f59e0b" },
    "In Transit":      { color: "#ADC6FF", bg: "rgba(173,198,255,0.1)", border: "rgba(173,198,255,0.2)", dot: "#ADC6FF" },
    "Delivered":       { color: "#4EDEA3", bg: "rgba(78,222,163,0.1)",  border: "rgba(78,222,163,0.2)",  dot: "#4EDEA3" },
  };
  const sc = statusConfig[t.status] || statusConfig["Awaiting Pickup"];

  return (
    <div style={{
      background: "#0f1623",
      border: "1px solid rgba(173,198,255,0.12)",
      borderRadius: "16px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}>

      {/* Top gradient strip */}
      <div style={{
        background: "linear-gradient(135deg, rgba(173,198,255,0.07) 0%, rgba(78,222,163,0.07) 100%)",
        borderBottom: "0.5px solid rgba(173,198,255,0.1)",
        padding: "14px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <div>
            <p style={{ fontSize: "10px", fontWeight: 600, color: "rgba(173,198,255,0.45)", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 4px" }}>Active Task</p>
            <p style={{ fontSize: "18px", fontWeight: 700, color: "white", margin: 0, letterSpacing: "-0.3px" }}>{t.clientName}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "10px", color: "rgba(78,222,163,0.5)", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Payout</p>
            <p style={{ fontSize: "17px", fontWeight: 600, color: "#4EDEA3", margin: 0 }}>{t.payout}</p>
          </div>
        </div>

        {/* Status badge + time */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            background: sc.bg, border: `0.5px solid ${sc.border}`,
            color: sc.color, borderRadius: "99px",
            fontSize: "11px", fontWeight: 600, padding: "3px 10px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />
            {t.status}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "rgba(173,198,255,0.35)" }}>
            <Clock size={11} />
            Accepted {t.acceptedAt || t.acceptedAgo || "recently"}
          </span>
        </div>
      </div>

      {/* Route */}
      <div style={{ padding: "14px 16px", borderBottom: "0.5px solid rgba(173,198,255,0.07)", flex: 1 }}>
        <p style={{
          fontSize: "10px", fontWeight: 600, letterSpacing: "1px",
          textTransform: "uppercase", margin: "0 0 12px",
          background: "linear-gradient(90deg, #ADC6FF, #4EDEA3)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text", display: "inline-block",
        }}>Route</p>

        <div style={{ display: "flex", gap: "12px" }}>
          {/* Spine */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "4px", width: "12px", flexShrink: 0 }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ADC6FF", boxShadow: "0 0 0 3px rgba(173,198,255,0.15)", flexShrink: 0 }} />
            <div style={{ width: "2px", flex: 1, minHeight: "24px", background: "linear-gradient(to bottom, #ADC6FF, #4EDEA3)", margin: "4px 0", borderRadius: "1px" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#4EDEA3", boxShadow: "0 0 0 3px rgba(78,222,163,0.15)", flexShrink: 0 }} />
          </div>

          {/* Stops */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Pickup */}
            <div style={{ background: "rgba(173,198,255,0.04)", border: "0.5px solid rgba(173,198,255,0.08)", borderRadius: "10px", padding: "9px 11px" }}>
              <span style={{ fontSize: "9px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", color: "#ADC6FF", background: "rgba(173,198,255,0.1)", border: "0.5px solid rgba(173,198,255,0.2)", borderRadius: "99px", padding: "1px 7px", display: "inline-block", marginBottom: "6px" }}>Pickup</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 10px" }}>
                <div>
                  <p style={{ fontSize: "9px", color: "rgba(173,198,255,0.3)", margin: "0 0 1px", textTransform: "uppercase" }}>Wilaya</p>
                  <p style={{ fontSize: "12px", fontWeight: 500, color: "#e2e8f0", margin: 0 }}>{t.pickup.wilaya}</p>
                </div>
                <div>
                  <p style={{ fontSize: "9px", color: "rgba(173,198,255,0.3)", margin: "0 0 1px", textTransform: "uppercase" }}>Commune</p>
                  <p style={{ fontSize: "12px", fontWeight: 500, color: "#e2e8f0", margin: 0 }}>{t.pickup.commune}</p>
                </div>
                {t.pickup.street && (
                  <div style={{ gridColumn: "span 2" }}>
                    <p style={{ fontSize: "9px", color: "rgba(173,198,255,0.3)", margin: "0 0 1px", textTransform: "uppercase" }}>Street</p>
                    <p style={{ fontSize: "12px", fontWeight: 500, color: "#e2e8f0", margin: 0 }}>{t.pickup.street}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Drop-off */}
            <div style={{ background: "rgba(78,222,163,0.03)", border: "0.5px solid rgba(78,222,163,0.08)", borderRadius: "10px", padding: "9px 11px" }}>
              <span style={{ fontSize: "9px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", color: "#4EDEA3", background: "rgba(78,222,163,0.1)", border: "0.5px solid rgba(78,222,163,0.2)", borderRadius: "99px", padding: "1px 7px", display: "inline-block", marginBottom: "6px" }}>Drop-off</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 10px" }}>
                <div>
                  <p style={{ fontSize: "9px", color: "rgba(173,198,255,0.3)", margin: "0 0 1px", textTransform: "uppercase" }}>Wilaya</p>
                  <p style={{ fontSize: "12px", fontWeight: 500, color: "#e2e8f0", margin: 0 }}>{t.dropoff.wilaya}</p>
                </div>
                <div>
                  <p style={{ fontSize: "9px", color: "rgba(173,198,255,0.3)", margin: "0 0 1px", textTransform: "uppercase" }}>Commune</p>
                  <p style={{ fontSize: "12px", fontWeight: 500, color: t.dropoff.commune ? "#e2e8f0" : "#475569", margin: 0 }}>{t.dropoff.commune || "—"}</p>
                </div>
                {t.dropoff.street && (
                  <div style={{ gridColumn: "span 2" }}>
                    <p style={{ fontSize: "9px", color: "rgba(173,198,255,0.3)", margin: "0 0 1px", textTransform: "uppercase" }}>Street</p>
                    <p style={{ fontSize: "12px", fontWeight: 500, color: "#e2e8f0", margin: 0 }}>{t.dropoff.street}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* View Navigation */}
        <button
          type="button"
          disabled={navDisabled}
          onClick={onViewNavigation}
          style={{
            width: "100%", padding: "9px",
            background: "rgba(173,198,255,0.06)",
            border: "0.5px solid rgba(173,198,255,0.15)",
            borderRadius: "10px", cursor: navDisabled ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            fontSize: "12px", fontWeight: 600, color: "#ADC6FF",
            transition: "all 0.15s",
            opacity: navDisabled ? 0.45 : 1,
          }}
          onMouseEnter={e => { if (!navDisabled) e.currentTarget.style.background = "rgba(173,198,255,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(173,198,255,0.06)"; }}
        >
          {navLoading ? (
            <span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "#ADC6FF", borderRadius: "50%", display: "inline-block", animation: "doSpin 0.8s linear infinite" }} />
          ) : (
            <Navigation size={13} />
          )}
          View Navigation ↗
        </button>

        <button
          type="button"
          disabled={primaryDisabled}
          onClick={onAdvanceStatus}
          style={{
            width: "100%", padding: "11px",
            background: "linear-gradient(135deg, #ADC6FF 0%, #4EDEA3 100%)",
            border: "none", borderRadius: "10px", cursor: primaryDisabled ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
            fontSize: "13px", fontWeight: 700, color: "#0b1220",
            transition: "opacity 0.15s",
            opacity: primaryDisabled ? 0.55 : 1,
          }}
          onMouseEnter={e => { if (!primaryDisabled) e.currentTarget.style.opacity = "0.9"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = primaryDisabled ? "0.55" : "1"; }}
        >
          <CheckCircle2 size={15} />
          {statusUpdating ? "Updating..." : primaryLabel}
        </button>

        <button
          type="button"
          disabled={cancelDisabled}
          onClick={onCancel}
          style={{
            width: "100%", padding: "9px",
            background: "rgba(239,68,68,0.07)",
            border: "0.5px solid rgba(239,68,68,0.2)",
            borderRadius: "10px", cursor: cancelDisabled ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            fontSize: "12px", fontWeight: 600, color: "#ef4444",
            transition: "all 0.15s",
            opacity: cancelDisabled ? 0.45 : 1,
          }}
          onMouseEnter={e => { if (!cancelDisabled) e.currentTarget.style.background = "rgba(239,68,68,0.12)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.07)"; }}
        >
          <XCircle size={13} />
          {cancellingTask ? "Cancelling..." : "Cancel Delivery"}
        </button>
        <style>{`@keyframes doSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

// ── History Modal ────────────────────────────────────────
function DeliveryHistoryModal({ onClose, deliveries }) {
  const [filter, setFilter] = useState("All");
  const [page,   setPage]   = useState(1);
  const history = deliveries?.length ? deliveries : fullDeliveryHistory;

  const filtered = filter === "All"
    ? history
    : history.filter(d => d.status === filter);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function getPageNumbers() {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3)       return [1, 2, 3, "...", totalPages];
    if (page >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  }

  return (
    <div
      className="!fixed !inset-0 !z-50 !flex !items-center !justify-center !p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="!w-full !max-h-[90vh] !flex !flex-col !rounded-2xl"
        style={{ background: "#0f1b2d", border: "1px solid #1e2d3d", boxShadow: "0 24px 48px rgba(0,0,0,0.5)", maxWidth: "680px" }}
      >
        <div className="!flex !items-start !justify-between !px-4 !pt-5 !pb-4" style={{ borderBottom: "1px solid #1e2d3d" }}>
          <div>
            <h2 className="!text-[18px] !font-extrabold !text-white !m-0 !mb-1">Recent Deliveries</h2>
            <p className="!text-[12px] !text-slate-500 !m-0">View and manage your recent delivery history.</p>
          </div>
          <button onClick={onClose} className="!w-8 !h-8 !rounded-lg !flex !items-center !justify-center !cursor-pointer !border-none !transition-all hover:!bg-white/10" style={{ background: "transparent", color: "#64748b" }}>
            <X size={16} />
          </button>
        </div>

        <div className="!flex !items-center !gap-2 !px-4 !py-3 !flex-wrap" style={{ borderBottom: "1px solid #1e2d3d" }}>
          {["All", "Completed", "Cancelled"].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className="!px-4 !py-1.5 !rounded-full !text-[12px] !font-semibold !cursor-pointer !border !transition-all"
              style={{ background: filter === f ? "#2563eb" : "transparent", borderColor: filter === f ? "#2563eb" : "#2a3a5c", color: filter === f ? "white" : "#64748b" }}
            >{f}</button>
          ))}
        </div>

        <div className="!flex-1 !overflow-y-auto !overflow-x-auto">
          <div style={{ minWidth: "520px" }}>
            <div className="!grid !px-4 !py-3" style={{ gridTemplateColumns: "1fr 1.6fr 1.4fr 1fr 1fr", borderBottom: "1px solid #1e2d3d" }}>
              {["ORDER ID", "ITEMS", "DATE & TIME", "STATUS", "PAYOUT"].map(h => (
                <p key={h} className="!text-[10px] !font-bold !text-slate-500 !m-0 !tracking-wider">{h}</p>
              ))}
            </div>
            {paginated.length === 0 ? (
              <p className="!text-center !text-slate-500 !py-10 !text-[13px]">No deliveries found.</p>
            ) : (
              paginated.map((d, i) => (
                <div key={d.id} className="!grid !px-4 !py-4 !items-center hover:!bg-white/[.02] !transition-all !cursor-pointer"
                  style={{ gridTemplateColumns: "1fr 1.6fr 1.4fr 1fr 1fr", borderBottom: i < paginated.length - 1 ? "1px solid #1e2d3d" : "none" }}
                >
                  <p className="!text-[12px] !font-bold !text-white !m-0">{d.id}</p>
                  <p className="!text-[12px] !text-slate-400 !m-0">{d.items}</p>
                  <p className="!text-[12px] !text-slate-400 !m-0">{d.date}</p>
                  <span style={{ ...(statusStyle[d.status] || statusStyle.Pending), borderRadius: "6px", padding: "3px 8px", fontSize: "11px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px", width: "fit-content" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: (statusStyle[d.status] || statusStyle.Pending)?.color, flexShrink: 0 }} />
                    {d.status}
                  </span>
                  <p className="!text-[12px] !font-bold !text-white !m-0">{d.payout}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="!flex !items-center !justify-between !px-4 !py-3 !flex-wrap !gap-2" style={{ borderTop: "1px solid #1e2d3d" }}>
          <span className="!text-[12px] !text-slate-500">
            <span className="!text-white !font-semibold">{(page - 1) * ITEMS_PER_PAGE + 1}</span>–
            <span className="!text-white !font-semibold">{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</span> of{" "}
            <span className="!text-white !font-semibold">{filtered.length}</span>
          </span>
          <div className="!flex !items-center !gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="!w-8 !h-8 !rounded-lg !flex !items-center !justify-center !cursor-pointer !border !transition-all hover:!bg-white/10 disabled:!opacity-40"
              style={{ background: "transparent", borderColor: "#2a3a5c", color: "#94a3b8" }}>‹</button>
            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`dot-${i}`} className="!text-slate-500 !text-[13px] !px-1">...</span>
              ) : (
                <button key={p} onClick={() => setPage(p)}
                  className="!w-8 !h-8 !rounded-lg !flex !items-center !justify-center !cursor-pointer !border !text-[13px] !font-semibold !transition-all"
                  style={{ background: page === p ? "#2563eb" : "transparent", borderColor: page === p ? "#2563eb" : "#2a3a5c", color: page === p ? "white" : "#94a3b8" }}
                >{p}</button>
              )
            )}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="!w-8 !h-8 !rounded-lg !flex !items-center !justify-center !cursor-pointer !border !transition-all hover:!bg-white/10 disabled:!opacity-40"
              style={{ background: "transparent", borderColor: "#2a3a5c", color: "#94a3b8" }}>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────
export default function DelivererOverviewPage({ currentUser, activeTask }) {
  const navigate = useNavigate();
  const [stats,       setStats]       = useState(null);
  const [deliveries,  setDeliveries]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [isMobile,    setIsMobile]    = useState(false);
  const [isTablet,    setIsTablet]    = useState(false);
  const [dashTask,    setDashTask]    = useState(null);
  const [navLoading, setNavLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [cancellingTask, setCancellingTask] = useState(false);

  const displayTask = dashTask || activeTask;

  async function refreshDashTask() {
    try {
      const t = await getActiveTask();
      setDashTask(t);
    } catch {
      setDashTask(null);
    }
  }

  async function handleViewNavigation() {
    const t = displayTask;
    if (!t?.orderId || String(t.status || "").toLowerCase().includes("awaiting client confirmation")) return;
    setNavLoading(true);
    try {
      await viewNavigationDetails(t.orderId);
      navigate(`/deliverer-dashboard/navigation/${t.orderId}`);
    } catch (e) {
      window.alert(e?.response?.data?.message || e?.message || "Navigation failed.");
    } finally {
      setNavLoading(false);
    }
  }

  async function handleAdvanceStatus() {
    const t = displayTask;
    if (!t?.orderId || statusUpdating) return;
    setStatusUpdating(true);
    try {
      const s = String(t.status || "").toLowerCase();
      const r = String(t.rawStatus || "").toLowerCase();
      if (s.includes("awaiting") || r === "accepted" || r === "pending") {
        await startTransit(t.orderId);
      } else if (s.includes("transit") || r === "in_transit") {
        await markDelivered(t.orderId);
      }
      await refreshDashTask();
    } catch (e) {
      window.alert(e?.response?.data?.message || e?.message || "Could not update status.");
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handleCancelTask() {
    const t = displayTask;
    if (!t?.orderId || cancellingTask) return;
    setCancellingTask(true);
    try {
      await cancelActiveDeliveryByDeliverer(t.orderId);
      setDashTask(null);
      await refreshDashTask();
    } catch (e) {
      window.alert(e?.response?.data?.message || e?.message || "Cancel failed.");
    } finally {
      setCancellingTask(false);
    }
  }

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [s, d] = await Promise.all([getDelivererStats(), getRecentDeliveries()]);
        setStats(s);
        setDeliveries(d);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  useEffect(() => {
    let alive = true;
    const timer = setInterval(async () => {
      try {
        const [s, d] = await Promise.all([getDelivererStats(), getRecentDeliveries()]);
        if (!alive) return;
        setStats(s);
        setDeliveries(d);
      } catch {
        // Leave the current dashboard data in place and retry on the next poll.
      }
    }, 3000);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  useEffect(() => {
    let alive = true;
    async function loadTask() {
      try {
        const t = await getActiveTask();
        if (alive) setDashTask((prev) => {
          if (!t && !prev) return null;
          if (!t) return null;
          if (!prev) return t;
          const same =
            String(prev.orderId) === String(t.orderId) &&
            String(prev.status) === String(t.status) &&
            String(prev.rawStatus || "") === String(t.rawStatus || "") &&
            JSON.stringify(prev.pickup_coords) === JSON.stringify(t.pickup_coords) &&
            JSON.stringify(prev.dropoff_coords) === JSON.stringify(t.dropoff_coords);
          return same ? prev : t;
        });
      } catch {
        if (alive) setDashTask(null);
      }
    }
    loadTask();
    const t = setInterval(loadTask, 5000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  return (
    <>
      {showHistory && <DeliveryHistoryModal onClose={() => setShowHistory(false)} deliveries={deliveries} />}

      <div style={{ padding: isMobile ? "16px" : "24px", display: "flex", flexDirection: "column", gap: isMobile ? "14px" : "20px", background: "#0b1525", minHeight: "100%" }}>

        <div className="!flex !items-start !justify-between !flex-wrap !gap-3">
          <div>
            <h1 style={{ fontSize: isMobile ? "20px" : "26px", fontWeight: 800, color: "white", margin: "0 0 4px" }}>
              Welcome back, {currentUser?.name?.split(" ")[0] ?? currentUser?.username ?? "there"}!
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Here's your delivery status for today.
            </p>
          </div>
        </div>

        {/* Stat cards */}
        {!loading && stats && (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? "10px" : "16px" }}>
            <Card style={{ background: "radial-gradient(circle at top right, rgba(59,130,246,0.12) 0%, transparent 60%), #1E293B", border: "1px solid #33415580", borderRadius: "12px" }}>
              <CardContent className="!py-4 !px-4">
                <div className="flex items-center justify-between mb-3">
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#475569", letterSpacing: "0.05em", margin: 0, textTransform: "uppercase" }}>Total Earnings</p>
                  <TrendingUp size={16} style={{ color: "#3b82f6" }} />
                </div>
                <p style={{ fontSize: "24px", fontWeight: 600, color: "white", margin: "0 0 4px", lineHeight: 1 }}>{stats.totalEarnings.value}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <TrendingUp size={12} color="#10b981" />
                  <span style={{ fontSize: "13px", color: "#10b981", fontWeight: 400 }}>{stats.totalEarnings.change}</span>
                  <span style={{ fontSize: "13px", color: "#64748b" }}> {stats.totalEarnings.label}</span>
                </div>
              </CardContent>
            </Card>

            <Card style={{ background: "radial-gradient(circle at top right, rgba(16,185,129,0.12) 0%, transparent 60%), #1E293B", border: "1px solid #33415580", borderRadius: "12px" }}>
              <CardContent className="!py-4 !px-4">
                <div className="flex items-center justify-between mb-3">
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#475569", letterSpacing: "0.05em", margin: 0, textTransform: "uppercase" }}>Today</p>
                  <Package size={16} style={{ color: "#10b981" }} />
                </div>
                <p style={{ fontSize: "24px", fontWeight: 600, color: "white", margin: "0 0 4px", lineHeight: 1 }}>{stats.today.value}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "13px", color: "#10b981", fontWeight: 600 }}>{stats.today.change}</span>
                  <span style={{ fontSize: "13px", color: "#64748b" }}> {stats.today.label}</span>
                </div>
              </CardContent>
            </Card>

            <Card style={{ background: "radial-gradient(circle at top right, rgba(245,158,11,0.12) 0%, transparent 60%), #1E293B", border: "1px solid #33415580", borderRadius: "12px" }}>
              <CardContent className="!py-4 !px-4">
                <div className="flex items-center justify-between mb-3">
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#475569", letterSpacing: "0.05em", margin: 0, textTransform: "uppercase" }}>Rating</p>
                  <Star size={16} style={{ color: "#f59e0b" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <p style={{ fontSize: "24px", fontWeight: 600, color: "white", margin: 0, lineHeight: 1 }}>{stats.rating.value}</p>
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "13px", color: "#f59e0b", fontWeight: 600 }}>{stats.rating.change}</span>
                  <span style={{ fontSize: "13px", color: "#64748b" }}> {stats.rating.label}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Map + Active Task */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile || isTablet ? "1fr" : "minmax(0, 1fr) minmax(280px, 340px)",
          gap: isMobile ? "10px" : "18px",
          alignItems: "stretch",
        }}>
          {/* Map card */}
          <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "14px", minWidth: 0 }}>
            <CardContent className="!p-4">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "white", margin: 0 }}>Live order map</p>
              </div>
              <p style={{ fontSize: "12px", color: "#475569", margin: "0 0 12px" }}>
                Pickup → drop-off for your current assignment (updates every few seconds).
              </p>
              <DelivererLiveMap
                pickupCoords={displayTask?.pickup_coords}
                dropoffCoords={displayTask?.dropoff_coords}
                height={isMobile ? 260 : 320}
              />
            </CardContent>
          </Card>

          {/* ── Active Task card (replaces Notifications) ── */}
          <ActiveTaskCard
            task={displayTask}
            onViewNavigation={handleViewNavigation}
            onAdvanceStatus={handleAdvanceStatus}
            onCancel={handleCancelTask}
            navLoading={navLoading}
            statusUpdating={statusUpdating}
            cancellingTask={cancellingTask}
          />
        </div>

        {/* Recent Deliveries */}
        <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
          <CardContent className="!p-4">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "white", margin: 0 }}>Recent Deliveries</p>
              <button
                onClick={() => setShowHistory(true)}
                style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 600, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
              >
                View All <ChevronRight size={13} />
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: "520px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 1.5fr 1fr 1fr", padding: "0 8px 10px", borderBottom: "1px solid #1e2d3d" }}>
                  {["ORDERS", "ITEMS", "DATE & TIME", "STATUS", "PAYOUT"].map(h => (
                    <p key={h} style={{ fontSize: "10px", fontWeight: 700, color: "#475569", margin: 0, letterSpacing: "0.05em" }}>{h}</p>
                  ))}
                </div>
                {loading ? (
                  <p style={{ color: "#64748b", fontSize: "13px", padding: "20px 8px" }}>Loading...</p>
                ) : (
                  deliveries.map((d, i) => (
                    <div key={d.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 1.5fr 1fr 1fr", padding: "14px 8px", alignItems: "center", borderBottom: i < deliveries.length - 1 ? "1px solid #1e2d3d" : "none" }}>
                      <p style={{ fontSize: "12px", fontWeight: 700, color: "white", margin: 0 }}>{d.id}</p>
                      <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>{d.items}</p>
                      <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>{d.date}</p>
                      <span style={{ ...(statusStyle[d.status] || statusStyle.Pending), borderRadius: "6px", padding: "3px 8px", fontSize: "11px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px", width: "fit-content" }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: (statusStyle[d.status] || statusStyle.Pending)?.color, flexShrink: 0 }} />
                        {d.status}
                      </span>
                      <p style={{ fontSize: "12px", fontWeight: 700, color: "white", margin: 0 }}>{d.payout}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#1e2d3d", margin: 0 }}>
          © 2026 Wassali Inc. All rights reserved.
        </p>
      </div>
    </>
  );
}