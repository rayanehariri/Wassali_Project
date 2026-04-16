// OrderDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Phone, MessageSquare, MoreVertical, ChevronRight,
  XCircle, Headphones, RefreshCw, Clock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getOrderById, cancelOrder, forceStatusUpdate } from "./Orders/FakeOrderApi";
 
// ── Breakpoint hook ───────────────────────────────────────────
function useBreakpoint() {
  const [bp, setBp] = useState({ isMobile: false, isTablet: false });
  useEffect(() => {
    const check = () =>
      setBp({
        isMobile: window.innerWidth < 640,
        isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
      });
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return bp;
}
 
// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
 
const riderIcon = L.divIcon({
  className: "",
  html: `<div style="width:42px;height:42px;background:linear-gradient(135deg,#2563eb,#3b82f6);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px rgba(59,130,246,0.25),0 8px 24px rgba(59,130,246,0.45);font-size:20px;">🛵</div>`,
  iconSize: [42, 42], iconAnchor: [21, 21],
});
const destIcon = L.divIcon({
  className: "",
  html: `<div style="width:34px;height:34px;background:#10b981;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 5px rgba(16,185,129,0.25);font-size:16px;">🏠</div>`,
  iconSize: [34, 34], iconAnchor: [17, 17],
});
const restaurantIcon = L.divIcon({
  className: "",
  html: `<div style="width:34px;height:34px;background:#f59e0b;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 5px rgba(245,158,11,0.25);font-size:16px;">🍽️</div>`,
  iconSize: [34, 34], iconAnchor: [17, 17],
});
 
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) map.fitBounds(L.latLngBounds(positions), { padding: [50, 50] });
  }, [map, positions]);
  return null;
}
 
function LiveMap({ order }) {
  if (!order) return null;
  const { restaurantLocation, customerLocation, riderLocation } = order;
  const routePositions = [
    [restaurantLocation.lat, restaurantLocation.lng],
    [riderLocation.lat,      riderLocation.lng],
    [customerLocation.lat,   customerLocation.lng],
  ];
 
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <MapContainer
        center={[riderLocation.lat, riderLocation.lng]}
        zoom={14}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
        <FitBounds positions={routePositions} />
        <Polyline positions={routePositions} pathOptions={{ color: "#3b82f6", weight: 3, dashArray: "8 6", opacity: 0.9 }} />
        <Marker position={[restaurantLocation.lat, restaurantLocation.lng]} icon={restaurantIcon}><Popup>{restaurantLocation.label}</Popup></Marker>
        <Marker position={[customerLocation.lat, customerLocation.lng]} icon={destIcon}><Popup>{customerLocation.label}</Popup></Marker>
        <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon}><Popup>Rider: {order.deliverer.name}</Popup></Marker>
      </MapContainer>
 
      {/* Live tracking badge */}
      <div style={{
        position: "absolute", top: "16px", left: "16px", zIndex: 1000,
        background: "rgba(15,17,23,0.92)", borderRadius: "12px",
        padding: "10px 14px", border: "1px solid #1e2d3d",
        backdropFilter: "blur(8px)", pointerEvents: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 0 3px rgba(16,185,129,0.3)" }} />
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#10b981", letterSpacing: "1px" }}>LIVE TRACKING</span>
        </div>
        <p style={{ fontSize: "15px", fontWeight: 700, color: "white", margin: 0 }}>Order #{order.id}</p>
        <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>Estimated arrival at {order.estimatedArrival}</p>
      </div>
    </div>
  );
}
 
const statusStyle = {
  "In Transit": { background: "rgba(59,130,246,0.15)", color: "#3b82f6" },
  "Pending":    { background: "rgba(234,179,8,0.15)",  color: "#eab308" },
  "Delivered":  { background: "rgba(16,185,129,0.15)", color: "#10b981" },
  "Assigned":   { background: "rgba(99,102,241,0.15)", color: "#6366f1" },
  "Cancelled":  { background: "rgba(239,68,68,0.15)",  color: "#ef4444" },
};
 
export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const { isMobile, isTablet } = useBreakpoint();
 
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState(false);
  // Mobile: show map or details panel
  const [mobileView, setMobileView] = useState("map");
 
  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      try { setOrder(await getOrderById(orderId)); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchOrder();
  }, [orderId]);
 
  async function handleCancel() {
    if (!window.confirm("Cancel this order?")) return;
    setActing(true);
    try { await cancelOrder(orderId); setOrder((p) => ({ ...p, status: "Cancelled" })); }
    finally { setActing(false); }
  }
 
  async function handleForceUpdate() {
    setActing(true);
    try {
      const updated = await forceStatusUpdate(orderId);
      setOrder((p) => ({ ...p, status: updated.status, timeline: updated.timeline }));
    } finally { setActing(false); }
  }
 
  if (loading) return <div className="flex items-center justify-center h-full" style={{ color: "#64748b" }}>Loading order...</div>;
  if (!order)  return <div className="flex items-center justify-center h-full" style={{ color: "#64748b" }}>Order not found.</div>;
 
  const isNarrow = isMobile || isTablet;
 
  // ── Detail panel content ──────────────────────────────────
  const DetailPanel = () => (
    <div style={{
      width: isNarrow ? "100%" : "380px",
      flexShrink: 0,
      background: "#0f1117",
      borderLeft: isNarrow ? "none" : "1px solid #1e2d3d",
      borderTop:  isNarrow ? "1px solid #1e2d3d" : "none",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      height: isNarrow ? "auto" : "100%",
    }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e2d3d" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
          {["Dashboard", "Orders", `#${order.id}`].map((crumb, i, arr) => (
            <span key={crumb} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                onClick={() => i < arr.length - 1 && navigate(i === 0 ? "/dashboard" : "/dashboard/order")}
                style={{ fontSize: "12px", color: i === arr.length - 1 ? "#3b82f6" : "#64748b", cursor: i < arr.length - 1 ? "pointer" : "default", fontWeight: i === arr.length - 1 ? 600 : 400 }}
              >
                {crumb}
              </span>
              {i < arr.length - 1 && <ChevronRight size={12} color="#334155" />}
            </span>
          ))}
        </div>
 
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "18px", fontWeight: 700, color: "white", margin: 0 }}>Order Details</h1>
            <span style={{ ...statusStyle[order.status], borderRadius: "6px", padding: "2px 10px", fontSize: "11px", fontWeight: 700 }}>
              {order.status.toUpperCase()}
            </span>
          </div>
          <button style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}>
            <MoreVertical size={18} />
          </button>
        </div>
        <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0" }}>
          <Clock size={11} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
          Placed on {order.placedAt}
        </p>
      </div>
 
      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
 
        {/* Involved Parties */}
        <section style={{ background: "#161f2e", borderRadius: "14px", border: "1px solid #1e2d3d", padding: "14px" }}>
          <p style={{ fontSize: "10px", fontWeight: 700, color: "#475569", letterSpacing: "1px", marginBottom: "12px" }}>INVOLVED PARTIES</p>
          {[
            { person: order.customer,  role: "Customer"  },
            { person: order.deliverer, role: "Deliverer" },
          ].map(({ person, role }) => (
            <div key={role} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              paddingBottom: role === "Customer" ? "12px" : 0,
              marginBottom:  role === "Customer" ? "12px" : 0,
              borderBottom:  role === "Customer" ? "1px solid #1e2d3d" : "none",
              flexWrap: "wrap", gap: "8px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={person.avatar} />
                  <AvatarFallback style={{
                    background: role === "Customer" ? "linear-gradient(135deg,#3b82f6,#8b5cf6)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    fontSize: "12px", fontWeight: 700, color: "white",
                  }}>
                    {person.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "white", margin: 0 }}>{person.name}</p>
                  <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>⭐ {person.rating} • {role}{person.vehicle ? ` • ${person.vehicle}` : ""}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {[Phone, MessageSquare].map((Icon, i) => (
                  <button key={i} style={{ width: "32px", height: "32px", background: "#1e2d3d", border: "1px solid #334155", borderRadius: "8px", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
 
        {/* Delivery Timeline */}
        <section style={{ background: "#161f2e", borderRadius: "14px", border: "1px solid #1e2d3d", padding: "14px" }}>
          <p style={{ fontSize: "10px", fontWeight: 700, color: "#475569", letterSpacing: "1px", marginBottom: "14px" }}>DELIVERY TIMELINE</p>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {(order.timeline || []).map((step, i) => {
              const isLast = i === order.timeline.length - 1;
              return (
                <div key={i} style={{ display: "flex", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                      width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0, marginTop: "3px",
                      background: step.done ? "#10b981" : step.active ? "#3b82f6" : "#1e2d3d",
                      border: step.active ? "2px solid rgba(59,130,246,0.4)" : "2px solid transparent",
                      boxShadow: step.active ? "0 0 0 3px rgba(59,130,246,0.15)" : "none",
                    }} />
                    {!isLast && <div style={{ width: "2px", flex: 1, minHeight: "24px", background: step.done ? "#10b981" : "#1e2d3d", margin: "3px 0" }} />}
                  </div>
                  <div style={{ paddingBottom: isLast ? 0 : "14px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, margin: 0, color: step.done || step.active ? "white" : "#334155" }}>{step.label}</p>
                    {step.time && <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0" }}>{step.time}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
 
        {/* Items */}
        <section style={{ background: "#161f2e", borderRadius: "14px", border: "1px solid #1e2d3d", padding: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "#475569", letterSpacing: "1px", margin: 0 }}>ITEMS</p>
            <p style={{ fontSize: "11px", color: "#475569", margin: 0 }}>Receipt #{order.receiptId}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(order.items || []).map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ background: "#1e2d3d", borderRadius: "6px", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#94a3b8", flexShrink: 0 }}>
                    {item.qty}
                  </span>
                  <span style={{ fontSize: "13px", color: "#cbd5e1" }}>{item.name}</span>
                </div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "white" }}>{item.price}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #1e2d3d", paddingTop: "10px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>Total</span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>{order.amount}</span>
            </div>
          </div>
        </section>
      </div>
 
      {/* Footer Actions */}
      <div style={{ padding: "14px 20px", borderTop: "1px solid #1e2d3d", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            onClick={handleCancel}
            disabled={acting || order.status === "Cancelled" || order.status === "Delivered"}
            style={{ flex: 1, height: "40px", background: "transparent", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "10px", color: "#ef4444", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
          >
            <XCircle size={15} /> Cancel Order
          </Button>
          <Button style={{ flex: 1, height: "40px", background: "transparent", border: "1px solid #334155", borderRadius: "10px", color: "#94a3b8", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <Headphones size={15} /> Support
          </Button>
        </div>
        <Button
          onClick={handleForceUpdate}
          disabled={acting || order.status === "Delivered" || order.status === "Cancelled"}
          style={{ width: "100%", height: "44px", background: "linear-gradient(135deg,#1d4ed8,#2563eb)", border: "none", borderRadius: "10px", color: "white", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(37,99,235,0.4)" }}
        >
          <RefreshCw size={15} style={{ animation: acting ? "spin 1s linear infinite" : "none" }} />
          Force Status Update
        </Button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
 
  // ── Mobile: toggle tabs between map and details ───────────
  if (isNarrow) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0f1117", overflow: "hidden" }}>
        {/* Toggle tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #1e2d3d", background: "#0f1117", flexShrink: 0 }}>
          {["map", "details"].map((view) => (
            <button
              key={view}
              onClick={() => setMobileView(view)}
              style={{
                flex: 1, padding: "12px",
                background: mobileView === view ? "rgba(37,99,235,0.1)" : "transparent",
                border: "none",
                borderBottom: mobileView === view ? "2px solid #2563eb" : "2px solid transparent",
                color: mobileView === view ? "#3b82f6" : "#64748b",
                fontSize: "13px", fontWeight: mobileView === view ? 700 : 400,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {view === "map" ? "🗺 Live Map" : "📋 Details"}
            </button>
          ))}
        </div>
 
        {/* Content */}
        {mobileView === "map" ? (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <LiveMap order={order} />
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto" }}>
            <DetailPanel />
          </div>
        )}
      </div>
    );
  }
 
  // ── Desktop: side-by-side ─────────────────────────────────
  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f1117", overflow: "hidden" }}>
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <LiveMap order={order} />
      </div>
      <DetailPanel />
    </div>
  );
}