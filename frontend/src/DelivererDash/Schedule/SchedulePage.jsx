// ActiveSchedulePage.jsx
// Install: npm install leaflet react-leaflet
// Leaflet CSS must be imported in your main entry: import 'leaflet/dist/leaflet.css'
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import {
  MapPin, Bell, CheckCircle2, Clock, TrendingUp,
  Navigation, Package, AlertTriangle, ExternalLink,
  Hourglass, ArrowRight,
} from "lucide-react";
import {
  getSchedule, getIncomingRequests, acceptRequest, rejectRequest,
  getDailySummary, getActiveTask, viewNavigationDetails, switchScheduleTab, getAwaitingClientApprovals,
} from "./FakeApi";

function RequestCard({ request, onAccept, onReject, accepting, rejecting }) {
  const isStore = request.customer.type === "store";

  return (
    <div style={{
      background: "#111c2e",
      border: "1px solid #1e2d3d",
      borderRadius: 16,
      padding: 16,
      transition: "border-color 0.15s",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = "#2563eb33"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2d3d"}
    >
      <div className="!flex !items-start !justify-between !mb-3">
        <div className="!flex !items-center !gap-3">
          <div style={{
            width: 42, height: 42, borderRadius: isStore ? 12 : "50%",
            background: isStore ? "rgba(99,102,241,0.2)" : "rgba(37,99,235,0.15)",
            border: `1.5px solid ${isStore ? "rgba(99,102,241,0.4)" : "rgba(37,99,235,0.3)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", flexShrink: 0,
          }}>
            {isStore
              ? <Package size={20} color="#818cf8" />
              : <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{request.customer.avatar}</span>
            }
          </div>
          <div>
            <p className="!text-[15px] !font-bold !text-white !m-0">{request.customer.name}</p>
            {request.urgent && (
              <div className="!flex !items-center !gap-1 !mt-0.5">
                <AlertTriangle size={11} color="#f59e0b" />
                <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700 }}>URGENT</span>
              </div>
            )}
          </div>
        </div>

        <div className="!text-right">
          <p className="!text-[9px] !font-bold !text-slate-500 !tracking-widest !m-0 !mb-1">PAYOUT</p>
          <p className="!text-[20px] !font-extrabold !text-white !m-0 !leading-none">
            {request.payout.toLocaleString()} <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>DZD</span>
          </p>
        </div>
      </div>

      <div className="!grid !gap-x-4 !gap-y-2 !mb-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <div className="!flex !items-center !gap-1.5 !mb-1">
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2563eb" }} />
            <p className="!text-[9px] !font-bold !text-slate-500 !tracking-widest !m-0">PICKUP</p>
          </div>
          <p className="!text-[12px] !text-slate-300 !m-0 !leading-snug">{request.pickup.label}</p>
        </div>
        <div>
          <div className="!flex !items-center !gap-1.5 !mb-1">
            <Package size={9} color="#64748b" />
            <p className="!text-[9px] !font-bold !text-slate-500 !tracking-widest !m-0">PACKAGE</p>
          </div>
          <p className="!text-[12px] !text-slate-300 !m-0 !leading-snug">{request.package.label}</p>
        </div>
        <div>
          <div className="!flex !items-center !gap-1.5 !mb-1">
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981" }} />
            <p className="!text-[9px] !font-bold !text-slate-500 !tracking-widest !m-0">DROP-OFF</p>
          </div>
          <p className="!text-[12px] !text-slate-300 !m-0 !leading-snug">{request.dropoff.label}</p>
        </div>
        {request.deliverBy && (
          <div>
            <div className="!flex !items-center !gap-1.5 !mb-1">
              <Clock size={9} color="#64748b" />
              <p className="!text-[9px] !font-bold !text-slate-500 !tracking-widest !m-0">DELIVER BY</p>
            </div>
            <span style={{
              background: "rgba(37,99,235,0.15)", color: "#60a5fa",
              border: "1px solid rgba(37,99,235,0.3)",
              borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 700,
            }}>
              {request.deliverBy}
            </span>
          </div>
        )}
      </div>

      <div className="!flex !items-center !justify-end !gap-3">
        <button
          onClick={() => onReject(request.id)}
          disabled={rejecting}
          style={{ padding: "8px 18px", borderRadius: 10, background: "transparent", border: "1px solid #334155", color: "#94a3b8", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.color = "#ef4444"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#94a3b8"; }}
        >
          {rejecting ? "..." : "REJECT"}
        </button>
        <button
          onClick={() => onAccept(request.id)}
          disabled={accepting}
          style={{ padding: "8px 22px", borderRadius: 10, background: "#2563eb", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 12px rgba(37,99,235,0.4)", opacity: accepting ? 0.7 : 1 }}
        >
          {accepting && <span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />}
          ACCEPT →
        </button>
      </div>
    </div>
  );
}

function formatWaitingSince(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    return `${h}h ago`;
  } catch {
    return null;
  }
}

/** Polished “waiting for client” queue — matches dashboard dark theme. */
function AwaitingClientQueue({ items }) {
  if (items.length === 0) return null;

  return (
    <div
      style={{
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(251,191,36,0.22)",
        background: "linear-gradient(165deg, rgba(251,191,36,0.07) 0%, #0f1620 42%, #111c2e 100%)",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.2), 0 12px 40px -12px rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          padding: "16px 16px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(145deg, rgba(251,191,36,0.18), rgba(245,158,11,0.08))",
            border: "1px solid rgba(251,191,36,0.28)",
          }}
        >
          <Hourglass size={20} color="#fbbf24" strokeWidth={2} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#f8fafc", letterSpacing: "-0.02em" }}>
              Awaiting client confirmation
            </h3>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 10px",
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#fcd34d",
                background: "rgba(251,191,36,0.12)",
                border: "1px solid rgba(251,191,36,0.25)",
              }}
            >
              <span
                className="sched-pulse-dot"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#fbbf24",
                }}
              />
              Pending
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", lineHeight: 1.45 }}>
            The client chooses who takes this job in their app. You&apos;ll see navigation here once they confirm you. If they pick someone else, this request will drop from your list automatically.
          </p>
        </div>
      </div>

      <div style={{ padding: "12px 14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((req) => {
          const since = formatWaitingSince(req.waitingSince);
          return (
            <div
              key={req.id}
              style={{
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(8,12,20,0.55)",
                backdropFilter: "blur(8px)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  background: "linear-gradient(180deg, #fbbf24, #d97706)",
                  opacity: 0.85,
                }}
              />
              <div style={{ padding: "14px 14px 14px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: "0.12em" }}>
                      REQUEST
                    </p>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.01em" }}>
                      {req.customer.name}
                    </p>
                    {since && (
                      <p style={{ margin: "6px 0 0", fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
                        <Clock size={11} color="#64748b" />
                        Waiting {since}
                      </p>
                    )}
                  </div>
                  {typeof req.payout === "number" && (
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ margin: "0 0 2px", fontSize: 9, fontWeight: 700, color: "#475569", letterSpacing: "0.1em" }}>PAYOUT</p>
                      <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>
                        {req.payout.toLocaleString()} <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>DZD</span>
                      </p>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    position: "relative",
                    borderRadius: 10,
                    padding: "10px 12px",
                    background: "rgba(15,23,42,0.45)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 24, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 3 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563eb", border: "2px solid rgba(37,99,235,0.35)" }} />
                      <div style={{ width: 2, height: 22, margin: "2px 0", background: "linear-gradient(180deg, rgba(37,99,235,0.55), rgba(16,185,129,0.25))", borderRadius: 1 }} />
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", border: "2px solid rgba(16,185,129,0.35)" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em" }}>ROUTE</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#cbd5e1", lineHeight: 1.4 }}>
                        <span style={{ color: "#94a3b8" }}>{req.pickup.label}</span>
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "6px 0" }}>
                        <ArrowRight size={12} color="#475569" />
                        <span style={{ fontSize: 10, color: "#475569", fontWeight: 600 }}>TO</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "#cbd5e1", lineHeight: 1.4 }}>
                        <span style={{ color: "#94a3b8" }}>{req.dropoff.label}</span>
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ActiveSchedulePage() {
  const [schedule,   setSchedule]   = useState(null);
  const [requests,   setRequests]   = useState([]);
  const [awaitingClient, setAwaitingClient] = useState([]);
  const [summary,    setSummary]    = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("Today");
  const [acceptingId, setAcceptingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [navLoading,  setNavLoading]  = useState(false);
  const [isMobile,    setIsMobile]    = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [sched, reqs, pending, sum, task] = await Promise.all([
          getSchedule(), getIncomingRequests(), getAwaitingClientApprovals(), getDailySummary(), getActiveTask(),
        ]);
        setSchedule(sched); setRequests(reqs); setAwaitingClient(pending); setSummary(sum); setActiveTask(task);
        setActiveTab(sched.activeTab ?? "Today");
      } finally { setLoading(false); }
    }
    fetchAll();
  }, []);

  // Keep requests/task fresh so new client requests appear without reload.
  useEffect(() => {
    let alive = true;
    const timer = setInterval(async () => {
      try {
        const [reqs, pending, task] = await Promise.all([
          getIncomingRequests(),
          getAwaitingClientApprovals(),
          getActiveTask(),
        ]);
        if (!alive) return;
        setRequests(reqs);
        setAwaitingClient(pending);
        setActiveTask(task);
      } catch {
        // keep UI steady, next poll retries
      }
    }, 3000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  async function handleTabSwitch(tab) {
    setActiveTab(tab);
    const updated = await switchScheduleTab(tab);
    setSchedule(updated);
  }

  async function handleAccept(id) {
    setAcceptingId(id);
    try {
      const result = await acceptRequest(id);
      if (result?.success === false) {
        window.alert(result?.message || "Could not accept this request.");
        return;
      }
      setRequests(prev => prev.filter(r => r.id !== id));
      if (result?.phase === "awaiting_client_selection" && result?.request) {
        setAwaitingClient(prev => [result.request, ...prev]);
      }
      if (result?.phase === "client_confirmed" && result.orderId) {
        setActiveTask({
          orderId: result.orderId,
          status: "Awaiting Pickup",
          acceptedAgo: "just now",
          pickupAt: result.pickupAt ?? "Pickup point assigned",
        });
        setAwaitingClient(prev => prev.filter(r => r.id !== id));
      }
    } finally { setAcceptingId(null); }
  }

  async function handleReject(id) {
    setRejectingId(id);
    try {
      await rejectRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
    } finally { setRejectingId(null); }
  }

  async function handleViewNavigation() {
    if (!activeTask || activeTask.status === "Awaiting Client Confirmation") return;
    setNavLoading(true);
    await viewNavigationDetails(activeTask.orderId);
    setNavLoading(false);
    navigate(`/deliverer-dashboard/navigation/${activeTask.orderId}`);
  }

  if (loading) return (
    <div className="!flex !items-center !justify-center !h-full" style={{ background: "#0b1525" }}>
      <div className="!flex !flex-col !items-center !gap-3">
        <div style={{ width: 32, height: 32, border: "3px solid rgba(37,99,235,0.3)", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#475569", fontSize: 13, margin: 0 }}>Loading schedule...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  const RightColumn = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Zone Map */}
      <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #1e2d3d", height: 180 }}>
        <MapContainer
          center={[36.74, 3.05]} zoom={11}
          style={{ width: "100%", height: "100%", background: "#0b1525" }}
          zoomControl={false} attributionControl={false} dragging={false} scrollWheelZoom={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        </MapContainer>
        <div style={{ position: "relative", marginTop: -60, marginLeft: 10, background: "rgba(11,21,37,0.88)", backdropFilter: "blur(6px)", borderRadius: 10, padding: "8px 12px", width: "fit-content", border: "1px solid #1e2d3d" }}>
          <div className="!flex !items-center !gap-1.5 !mb-1">
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2563eb" }} />
            <p style={{ fontSize: 9, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", margin: 0 }}>ACTIVE ZONE COVERAGE</p>
          </div>
          <p style={{ fontSize: 12, color: "#cbd5e1", margin: 0, lineHeight: 1.4 }}>{schedule?.activeZones?.join(" • ")}</p>
        </div>
      </div>

      {/* Daily Summary */}
      <div style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: 16, padding: 16 }}>
        <p className="!text-[15px] !font-bold !text-white !m-0 !mb-3">Daily Summary</p>
        {[
          { icon: <CheckCircle2 size={16} color="#10b981" />, label: "Completed", value: `${summary?.completed} Trips`, valueColor: "white" },
          { icon: <Clock size={16} color="#3b82f6" />,        label: "Active",    value: `${summary?.active} Task`,   valueColor: "#3b82f6" },
          { icon: <TrendingUp size={16} color="#10b981" />,   label: "Earnings",  value: summary?.earnings,           valueColor: "#10b981" },
        ].map(({ icon, label, value, valueColor }, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 2 ? "1px solid #1e2d3d" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {icon}
              <span style={{ fontSize: 13, color: "#94a3b8" }}>{label}</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: valueColor }}>{value}</span>
          </div>
        ))}
      </div>

      <AwaitingClientQueue items={awaitingClient} />

      {/* Active Task */}
      {activeTask && (
        <div style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: 16, padding: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, background: "#2563eb", borderRadius: "0 16px 0 12px", padding: "4px 12px", fontSize: 10, fontWeight: 700, color: "white" }}>ONGOING</div>
          <p style={{ fontSize: 9, fontWeight: 700, color: "#475569", letterSpacing: "0.1em", margin: "0 0 8px" }}>ACTIVE TASK</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: "white", margin: "0 0 10px" }}>Order #{activeTask.orderId}</p>
          <span style={{ background: "rgba(234,179,8,0.12)", color: "#eab308", border: "1px solid rgba(234,179,8,0.25)", borderRadius: 6, padding: "3px 10px", fontSize: 10, fontWeight: 700, display: "inline-block", marginBottom: 12 }}>AWAITING PICKUP</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={13} color="#64748b" />
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Accepted {activeTask.acceptedAgo}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={13} color="#64748b" />
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Pickup at <span style={{ color: "white", fontWeight: 600 }}>{activeTask.pickupAt}</span></span>
            </div>
          </div>
          <button
            onClick={handleViewNavigation}
            disabled={navLoading}
            style={{ width: "100%", padding: "10px 0", borderRadius: 10, background: "transparent", border: "1px solid #1e2d3d", color: "#94a3b8", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#60a5fa"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e2d3d"; e.currentTarget.style.color = "#94a3b8"; }}
          >
            {navLoading
              ? <span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#60a5fa", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
              : <><Navigation size={13} /> VIEW NAVIGATION <ExternalLink size={11} /></>
            }
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ background: "#0b1525", minHeight: "100%", padding: isMobile ? "16px" : "24px", display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes schedPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.35); }
          50% { opacity: 0.9; box-shadow: 0 0 0 8px rgba(251, 191, 36, 0); }
        }
        .sched-pulse-dot { animation: schedPulse 1.8s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div className="!flex !items-start !justify-between !flex-wrap !gap-3">
        <div>
          <h1 className="!text-[22px] !font-extrabold !text-white !m-0 !mb-1">Active Schedule</h1>
          <div className="!flex !items-center !gap-1.5">
            <MapPin size={12} color="#64748b" />
            <p className="!text-[13px] !text-slate-500 !m-0">{schedule?.terminal} • {schedule?.zone}</p>
          </div>
        </div>
        <div className="!flex !p-1 !rounded-xl" style={{ background: "#111c2e", border: "1px solid #1e2d3d" }}>
          {["Today", "Weekly"].map(tab => (
            <button key={tab} onClick={() => handleTabSwitch(tab)}
              style={{ padding: "7px 18px", borderRadius: 10, border: "none", background: activeTab === tab ? "#2563eb" : "transparent", color: activeTab === tab ? "white" : "#64748b", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Layout: stacked on mobile, side-by-side on desktop */}
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Incoming Requests banner */}
          <div style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="!flex !items-center !gap-3">
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Bell size={16} color="#3b82f6" />
              </div>
              <div>
                <p className="!text-[15px] !font-bold !text-white !m-0">Incoming Requests</p>
                <p className="!text-[11px] !text-slate-500 !m-0">Updated just now</p>
              </div>
            </div>
            {requests.length > 0 && (
              <span style={{ background: "#2563eb", color: "white", borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>{requests.length} NEW</span>
            )}
          </div>

          {/* Right column info (compact on mobile) */}
          <RightColumn />

          {/* Request cards */}
          {requests.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 20px", color: "#334155" }}>
              <Bell size={28} style={{ opacity: 0.3, margin: "0 auto 10px" }} />
              <p style={{ fontSize: 14, margin: 0 }}>
                {activeTask
                  ? "You have an active delivery. Finish it before accepting new requests."
                  : "No incoming requests"}
              </p>
            </div>
          ) : requests.map(req => (
            <RequestCard key={req.id} request={req} onAccept={handleAccept} onReject={handleReject} accepting={acceptingId === req.id} rejecting={rejectingId === req.id} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          {/* Left */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="!flex !items-center !gap-3">
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Bell size={18} color="#3b82f6" />
                </div>
                <div>
                  <p className="!text-[16px] !font-bold !text-white !m-0">Incoming Requests</p>
                  <p className="!text-[12px] !text-slate-500 !m-0">Dispatch queue updated just now</p>
                </div>
              </div>
              {requests.length > 0 && (
                <span style={{ background: "#2563eb", color: "white", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>{requests.length} NEW</span>
              )}
            </div>
            {requests.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#334155" }}>
                <Bell size={32} style={{ opacity: 0.3, margin: "0 auto 12px" }} />
                <p style={{ fontSize: 14, margin: 0 }}>
                  {activeTask
                    ? "You have an active delivery. Finish it before accepting new requests."
                    : awaitingClient.length > 0
                    ? "No new requests. Waiting for client decisions."
                    : "No incoming requests right now"}
                </p>
              </div>
            ) : requests.map(req => (
              <RequestCard key={req.id} request={req} onAccept={handleAccept} onReject={handleReject} accepting={acceptingId === req.id} rejecting={rejectingId === req.id} />
            ))}
          </div>
          {/* Right */}
          <div style={{ width: 280, flexShrink: 0 }}>
            <RightColumn />
          </div>
        </div>
      )}
    </div>
  );
}