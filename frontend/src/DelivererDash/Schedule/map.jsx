// DelivererMapPage.jsx
// Install: npm install leaflet react-leaflet
// Leaflet CSS must be imported in your main entry: import 'leaflet/dist/leaflet.css'

import { useState, useEffect, useMemo } from "react";
import { Phone, Navigation, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { getCurrentOrder, getTodayStats, callCustomer, navigateToOrder } from "./FakeApi";
import { http } from "../../api/http";

// Fix leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Custom map icons ──────────────────────────────────────────────────────────
const pickupIcon = L.divIcon({
  className: "",
  html: `<div style="width:32px;height:32px;background:#2563eb;border-radius:50%;border:3px solid #1d4ed8;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px rgba(37,99,235,0.2);">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
      <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
    </svg>
  </div>`,
  iconSize:   [32, 32],
  iconAnchor: [16, 16],
});

const dropoffIcon = L.divIcon({
  className: "",
  html: `<div style="width:32px;height:32px;background:#10b981;border-radius:50%;border:3px solid #059669;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px rgba(16,185,129,0.2);">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  </div>`,
  iconSize:   [32, 32],
  iconAnchor: [16, 16],
});

const customerIcon = (name) => L.divIcon({
  className: "",
  html: `<div style="background:#0f1b2d;border:1.5px solid #2563eb;border-radius:20px;padding:4px 10px;white-space:nowrap;font-size:12px;font-weight:700;color:white;box-shadow:0 4px 12px rgba(0,0,0,0.5);">${name}</div>`,
  iconSize:   [80, 28],
  iconAnchor: [40, 14],
});

// ── Map fit bounds helper ─────────────────────────────────────────────────────
function FitBounds({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length >= 2) {
      map.fitBounds(coords, { padding: [60, 60] });
    }
  }, [coords, map]);
  return null;
}

// ── GoalRing SVG ─────────────────────────────────────────────────────────────
function GoalRing({ percent }) {
  const r  = 16;
  const c  = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="!relative !flex !items-center !justify-center" style={{ width: 44, height: 44 }}>
      <svg width="44" height="44" style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx="22" cy="22" r={r} fill="none" stroke="#1e2d3d" strokeWidth="3" />
        <circle cx="22" cy="22" r={r} fill="none" stroke="#2563eb" strokeWidth="3"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span style={{ fontSize: 10, fontWeight: 700, color: "white", position: "relative", zIndex: 1 }}>{percent}%</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DelivererMapPage() {
  const navigate = useNavigate();
  const [order,       setOrder]       = useState(null);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [calling,     setCalling]     = useState(false);
  const [navigating,  setNavigating]  = useState(false);
  const [completing,  setCompleting]  = useState(false);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [o, s] = await Promise.all([getCurrentOrder(), getTodayStats()]);
        setOrder(o);
        setStats(s);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  async function handleCall() {
    if (!order) return;
    setCalling(true);
    const result = await callCustomer(order.id);
    setCalling(false);
    // Open phone dialer
    if (result?.phone) window.location.href = `tel:${result.phone}`;
  }

  async function handleNavigate() {
    if (!order) return;
    setNavigating(true);
    const result = await navigateToOrder(order.id);
    setNavigating(false);
    // Open maps
    if (result?.deepLink) window.open(result.deepLink, "_blank");
  }

  async function handleComplete() {
    if (!order) return;
    setCompleting(true);
    try {
      const normalized = String(order.status || "").toLowerCase();
      if (normalized.includes("awaiting") || normalized === "accepted") {
        await http.post(`/deliverer/deliveries/start_transit/${order.id}`);
        setOrder((prev) => (prev ? { ...prev, status: "in_transit" } : prev));
        window.alert("Status updated to In Transit.");
      } else {
        await http.post(`/deliverer/deliveries/mark_delivered/${order.id}`);
        setOrder(null);
        window.alert("Delivery marked as completed. You can accept another request now.");
      }
    } catch (e) {
      window.alert(e.response?.data?.message || e.message || "Could not complete delivery.");
    } finally {
      setCompleting(false);
    }
  }

  const routeCoords = useMemo(
    () => (order ? [order.pickup.coords, order.dropoff.coords] : []),
    [order?.pickup?.coords, order?.dropoff?.coords]
  );

  const mapCenter = order
    ? [
        (order.pickup.coords[0] + order.dropoff.coords[0]) / 2,
        (order.pickup.coords[1] + order.dropoff.coords[1]) / 2,
      ]
    : [36.74, 3.11];

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "#0b1525", overflow: "hidden" }}>

      {/* ── Full-screen Leaflet Map ───────────────────────────────────────── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {!loading && (
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ width: "100%", height: "100%", background: "#0b1525" }}
            zoomControl={false}
            attributionControl={false}
          >
            {/* Dark tile layer */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />

            {order && (
              <>
                <FitBounds coords={routeCoords} />

                {/* Route polyline */}
                <Polyline
                  positions={routeCoords}
                  pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.9, dashArray: "10,6" }}
                />

                {/* Pickup marker */}
                <Marker position={order.pickup.coords}  icon={pickupIcon} />

                {/* Dropoff marker */}
                <Marker position={order.dropoff.coords} icon={dropoffIcon} />

                {/* Customer label */}
                <Marker position={order.dropoff.coords} icon={customerIcon(order.customer.name)} />
              </>
            )}
          </MapContainer>
        )}
      </div>

      {/* ── Order Panel (top-left) ───────────────────────────────────────── */}
      {order && (
        <div style={{
          position: "absolute", top: 16, left: 16, zIndex: 10,
          width: 220, borderRadius: 16,
          background: "rgba(11,21,37,0.92)",
          border: "1px solid #1e2d3d",
          backdropFilter: "blur(12px)",
          padding: "16px",
        }}>
          {/* Header */}
          <div className="!flex !items-center !justify-between !mb-3">
            <div>
              <p className="!text-[9px] !font-bold !text-slate-500 !tracking-widest !m-0 !mb-1">CURRENT ORDER</p>
              <p className="!text-[18px] !font-extrabold !text-white !m-0">{order.customer.name}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => navigate("/deliverer-dashboard/messages")}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "#111c2e", border: "1px solid #1e2d3d",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
                title="Open messages"
              >
                <MessageCircle size={14} color="#60a5fa" />
              </button>
              <button
                onClick={handleCall}
                disabled={calling}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "#111c2e", border: "1px solid #1e2d3d",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
                title="Call customer"
              >
                {calling
                  ? <span style={{ width: 14, height: 14, border: "2px solid #2563eb", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                  : <Phone size={14} color="#94a3b8" />
                }
              </button>
            </div>
          </div>

          {/* Route */}
          <div className="!flex !flex-col !gap-2 !mb-3">
            {/* Pickup */}
            <div className="!flex !items-start !gap-2">
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563eb", marginTop: 4, flexShrink: 0 }} />
              <div>
                <p className="!text-[9px] !font-bold !text-slate-500 !tracking-widest !m-0">PICKUP</p>
                <p className="!text-[12px] !text-slate-200 !m-0 !leading-tight">{order.pickup.address}</p>
              </div>
            </div>
            {/* Connector */}
            <div style={{ width: 1.5, height: 14, background: "#1e2d3d", marginLeft: "3.5px" }} />
            {/* Dropoff */}
            <div className="!flex !items-start !gap-2">
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", marginTop: 4, flexShrink: 0 }} />
              <div>
                <p className="!text-[9px] !font-bold !text-slate-500 !tracking-widest !m-0">DROPOFF • 12 MINS</p>
                <p className="!text-[12px] !text-slate-200 !m-0 !leading-tight">{order.dropoff.address}</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #1e2d3d", marginBottom: 10 }} />

          {/* Items */}
          <div className="!mb-3">
            <p className="!text-[9px] !font-bold !text-slate-500 !tracking-widest !m-0 !mb-2">
              ORDER ITEMS ({order.items.length})
            </p>
            {order.items.map((item, i) => (
              <p key={i} className="!text-[12px] !text-slate-300 !m-0 !mb-1">
                <span className="!text-slate-500 !mr-1">{item.qty}</span>{item.name}
              </p>
            ))}
          </div>

          {/* Navigate button */}
          <button
            onClick={handleNavigate}
            disabled={navigating}
            style={{
              width: "100%", height: 40, borderRadius: 10,
              background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 14px rgba(37,99,235,0.45)",
              fontSize: 13, fontWeight: 700, color: "white",
              transition: "opacity 0.15s",
            }}
          >
            {navigating
              ? <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
              : <><Navigation size={14} /> Navigate</>
            }
          </button>

          {/* Complete button */}
          <button
            onClick={handleComplete}
            disabled={completing}
            style={{
              width: "100%",
              height: 40,
              borderRadius: 10,
              marginTop: 10,
              background: completing ? "rgba(16,185,129,0.18)" : "linear-gradient(135deg, #10b981, #34d399)",
              border: "none",
              cursor: completing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
              fontSize: 13,
              fontWeight: 800,
              color: "#052016",
              opacity: completing ? 0.7 : 1,
            }}
            title="Mark this delivery as completed"
          >
            {completing ? "Updating..." : String(order.status || "").toLowerCase().includes("awaiting") || String(order.status || "").toLowerCase() === "accepted" ? "Start Transit" : "Mark Delivered ✓"}
          </button>
        </div>
      )}

      {!loading && !order && (
        <div style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 10,
          width: 260,
          borderRadius: 16,
          background: "rgba(11,21,37,0.92)",
          border: "1px solid #1e2d3d",
          backdropFilter: "blur(12px)",
          padding: "16px",
        }}>
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
            No active delivery. Go to Schedule to accept a new request.
          </p>
          <button
            onClick={() => navigate("/deliverer-dashboard/schedule")}
            style={{
              marginTop: 10,
              width: "100%",
              height: 38,
              borderRadius: 10,
              background: "rgba(37,99,235,0.15)",
              border: "1px solid rgba(37,99,235,0.35)",
              color: "#60a5fa",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Go to Schedule
          </button>
        </div>
      )}

      {/* ── Bottom Stats Bar ─────────────────────────────────────────────── */}
      {stats && (
        <div style={{
          position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
          zIndex: 10, display: "flex", alignItems: "center", gap: 0,
          background: "rgba(11,21,37,0.92)",
          border: "1px solid #1e2d3d",
          backdropFilter: "blur(12px)",
          borderRadius: 16, overflow: "hidden",
          minWidth: 420,
        }}>
          {/* Earnings today */}
          <div style={{ padding: "14px 28px", borderRight: "1px solid #1e2d3d" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", margin: "0 0 3px" }}>Earnings today</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: "white", margin: 0 }}>{stats.earningsToday}</p>
          </div>

          {/* Active for */}
          <div style={{ padding: "14px 28px", borderRight: "1px solid #1e2d3d" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", margin: "0 0 3px" }}>Active for</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: "white", margin: 0 }}>{stats.activeFor}</p>
          </div>

          {/* Next Goal */}
          <div style={{ padding: "14px 28px", display: "flex", alignItems: "center", gap: 12 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", margin: "0 0 3px" }}>Next Goal</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: "white", margin: 0 }}>{stats.nextGoal}</p>
            </div>
            <GoalRing percent={stats.goalPercent} />
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "#0b1525" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, border: "3px solid rgba(37,99,235,0.3)", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "#475569", fontSize: 13, margin: 0 }}>Loading map...</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .leaflet-container { background: #0b1525 !important; }
      `}</style>
    </div>
  );
}