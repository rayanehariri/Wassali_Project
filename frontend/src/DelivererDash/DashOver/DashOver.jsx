// DelivererOverviewPage.jsx
import { useState, useEffect } from "react";
import { TrendingUp, Star, Package, ChevronRight, X,ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  getDelivererStats,
  getRecentDeliveries,
} from "./FakeApi";

const statusStyle = {
  "Completed": { background: "rgba(16,185,129,0.15)",  color: "#10b981" },
  "Cancelled": { background: "rgba(239,68,68,0.15)",   color: "#ef4444" },
  "Pending":   { background: "rgba(234,179,8,0.15)",   color: "#eab308" },
  "In Transit":{ background: "rgba(59,130,246,0.15)",  color: "#3b82f6" },
};

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

// ── History Modal ────────────────────────────────────────
function DeliveryHistoryModal({ onClose }) {
  const [filter, setFilter] = useState("All");
  const [page,   setPage]   = useState(1);

  const filtered = filter === "All"
    ? fullDeliveryHistory
    : fullDeliveryHistory.filter(d => d.status === filter);

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
        style={{
          background: "#0f1b2d",
          border: "1px solid #1e2d3d",
          boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
          maxWidth: "680px",
        }}
      >
        {/* Header */}
        <div className="!flex !items-start !justify-between !px-4 !pt-5 !pb-4" style={{ borderBottom: "1px solid #1e2d3d" }}>
          <div>
            <h2 className="!text-[18px] !font-extrabold !text-white !m-0 !mb-1">Recent Deliveries</h2>
            <p className="!text-[12px] !text-slate-500 !m-0">View and manage your recent delivery history.</p>
          </div>
          <button
            onClick={onClose}
            className="!w-8 !h-8 !rounded-lg !flex !items-center !justify-center !cursor-pointer !border-none !transition-all hover:!bg-white/10"
            style={{ background: "transparent", color: "#64748b" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="!flex !items-center !gap-2 !px-4 !py-3 !flex-wrap" style={{ borderBottom: "1px solid #1e2d3d" }}>
          {["All", "Completed", "Cancelled"].map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className="!px-4 !py-1.5 !rounded-full !text-[12px] !font-semibold !cursor-pointer !border !transition-all"
              style={{
                background:  filter === f ? "#2563eb" : "transparent",
                borderColor: filter === f ? "#2563eb" : "#2a3a5c",
                color:       filter === f ? "white"   : "#64748b",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table — scrollable on mobile */}
        <div className="!flex-1 !overflow-y-auto !overflow-x-auto">
          <div style={{ minWidth: "520px" }}>
            {/* Table header */}
            <div
              className="!grid !px-4 !py-3"
              style={{ gridTemplateColumns: "1fr 1.6fr 1.4fr 1fr 1fr", borderBottom: "1px solid #1e2d3d" }}
            >
              {["ORDER ID", "ITEMS", "DATE & TIME", "STATUS", "PAYOUT"].map(h => (
                <p key={h} className="!text-[10px] !font-bold !text-slate-500 !m-0 !tracking-wider">{h}</p>
              ))}
            </div>

            {/* Rows */}
            {paginated.length === 0 ? (
              <p className="!text-center !text-slate-500 !py-10 !text-[13px]">No deliveries found.</p>
            ) : (
              paginated.map((d, i) => (
                <div
                  key={d.id}
                  className="!grid !px-4 !py-4 !items-center hover:!bg-white/[.02] !transition-all !cursor-pointer"
                  style={{
                    gridTemplateColumns: "1fr 1.6fr 1.4fr 1fr 1fr",
                    borderBottom: i < paginated.length - 1 ? "1px solid #1e2d3d" : "none",
                  }}
                >
                  <p className="!text-[12px] !font-bold !text-white !m-0">{d.id}</p>
                  <p className="!text-[12px] !text-slate-400 !m-0">{d.items}</p>
                  <p className="!text-[12px] !text-slate-400 !m-0">{d.date}</p>
                  <span style={{
                    ...statusStyle[d.status],
                    borderRadius: "6px", padding: "3px 8px",
                    fontSize: "11px", fontWeight: 600,
                    display: "inline-flex", alignItems: "center", gap: "4px",
                    width: "fit-content",
                  }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: statusStyle[d.status]?.color, flexShrink: 0 }} />
                    {d.status}
                  </span>
                  <p className="!text-[12px] !font-bold !text-white !m-0">{d.payout}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        <div
          className="!flex !items-center !justify-between !px-4 !py-3 !flex-wrap !gap-2"
          style={{ borderTop: "1px solid #1e2d3d" }}
        >
          <span className="!text-[12px] !text-slate-500">
            <span className="!text-white !font-semibold">{(page - 1) * ITEMS_PER_PAGE + 1}</span>–
            <span className="!text-white !font-semibold">{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</span> of{" "}
            <span className="!text-white !font-semibold">{filtered.length}</span>
          </span>

          <div className="!flex !items-center !gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="!w-8 !h-8 !rounded-lg !flex !items-center !justify-center !cursor-pointer !border !transition-all hover:!bg-white/10 disabled:!opacity-40"
              style={{ background: "transparent", borderColor: "#2a3a5c", color: "#94a3b8" }}
            >‹</button>

            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`dot-${i}`} className="!text-slate-500 !text-[13px] !px-1">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="!w-8 !h-8 !rounded-lg !flex !items-center !justify-center !cursor-pointer !border !text-[13px] !font-semibold !transition-all"
                  style={{
                    background:  page === p ? "#2563eb" : "transparent",
                    borderColor: page === p ? "#2563eb" : "#2a3a5c",
                    color:       page === p ? "white"   : "#94a3b8",
                  }}
                >{p}</button>
              )
            )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="!w-8 !h-8 !rounded-lg !flex !items-center !justify-center !cursor-pointer !border !transition-all hover:!bg-white/10 disabled:!opacity-40"
              style={{ background: "transparent", borderColor: "#2a3a5c", color: "#94a3b8" }}
            >›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────
export default function DelivererOverviewPage({ currentUser, isOnline,setIsOnline }) {
  const navigate = useNavigate();
  const [stats,       setStats]       = useState(null);
  const [deliveries,  setDeliveries]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [isMobile,    setIsMobile]    = useState(false);
  const [isTablet,    setIsTablet]    = useState(false);
   [isOnline,setIsOnline] = useState();

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

  return (
    <>
      {showHistory && <DeliveryHistoryModal onClose={() => setShowHistory(false)} />}

      <div style={{ padding: isMobile ? "16px" : "24px", display: "flex", flexDirection: "column", gap: isMobile ? "14px" : "20px", background: "#0b1525", minHeight: "100%" }}>

        <div className="!flex !items-start !justify-between !flex-wrap !gap-3">
        <div>
          <h1 style={{ fontSize: isMobile ? "20px" : "26px", fontWeight: 800, color: "white", margin: "0 0 4px" }}>
            Welcome back, {currentUser?.name?.split(" ")[0] ?? "Alex"}!
          </h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            Here's your delivery status for today.
          </p>
        </div>
         <button
                  onClick={() => setIsOnline(prev=>!prev)}
                  
                  className="!flex !items-center !gap-2 !px-4 !py-2 !rounded-xl !text-[13px] !font-semibold !cursor-pointer !border !transition-all"
                  style={{
                    background:  isOnline ? "rgba(16,185,129,0.1)"     : "rgba(100,116,139,0.1)",
                    borderColor: isOnline ? "rgba(16,185,129,0.35)"    : "rgba(100,116,139,0.3)",
                    color:       isOnline ? "#10b981"                  : "#64748b",
                  }}
                >
                  <div className="!w-2 !h-2 !rounded-full"
                    style={{
                      background:  isOnline ? "#10b981" : "#64748b",
                      boxShadow:   isOnline ? "0 0 0 3px rgba(16,185,129,0.25)" : "none",
                    }}
                  />
                  {isOnline ? "Online Status" : "Go Online"}
                  <ChevronDown size={13} />
                </button>
              </div>

        {/* Stat cards — 1 col mobile, 3 col desktop */}
        {!loading && stats && (
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(3, 1fr)" : "repeat(3, 1fr)",
            gap: isMobile ? "10px" : "16px",
          }}>
            <Card style={{ background: `radial-gradient(circle at top right, rgba(59,130,246,0.12) 0%, transparent 60%), #1E293B`, border: "1px solid #33415580", borderRadius: "12px" }}>
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

            <Card style={{ background: `radial-gradient(circle at top right, rgba(16,185,129,0.12) 0%, transparent 60%), #1E293B`, border: "1px solid #33415580", borderRadius: "12px" }}>
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

            <Card style={{ background: `radial-gradient(circle at top right, rgba(245,158,11,0.12) 0%, transparent 60%), #1E293B`, border: "1px solid #33415580", borderRadius: "12px" }}>
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

        {/* Map + Notifications — stacked on mobile/tablet */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile || isTablet ? "1fr" : "1fr 300px",
          gap: isMobile ? "10px" : "16px",
        }}>
          <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
            <CardContent className="!p-4">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "white", margin: 0 }}>Live Order Map</p>
                <button style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>Expand ↗</button>
              </div>
              <p style={{ fontSize: "12px", color: "#475569", margin: "0 0 12px" }}>High demand areas highlighted</p>
              <div style={{ height: "200px", borderRadius: "10px", overflow: "hidden", background: "linear-gradient(135deg, #0d1b2e 0%, #0f2444 50%, #0d1b2e 100%)", border: "1px solid #1e2d3d", position: "relative" }}>
                <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.06 }}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <g key={i}>
                      <line x1={`${i * 9}%`} y1="0" x2={`${i * 9}%`} y2="100%" stroke="#94a3b8" strokeWidth="1" />
                      <line x1="0" y1={`${i * 9}%`} x2="100%" y2={`${i * 9}%`} stroke="#94a3b8" strokeWidth="1" />
                    </g>
                  ))}
                </svg>
                <div style={{ position: "absolute", top: "30%", left: "35%", width: "80px", height: "80px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)" }} />
                <div style={{ position: "absolute", top: "50%", left: "55%", width: "60px", height: "60px", borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)" }} />
                <div style={{ position: "absolute", top: "52%", left: "56%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#a855f7", boxShadow: "0 0 0 4px rgba(168,85,247,0.3)" }} />
                  <span style={{ fontSize: "10px", color: "white", marginTop: "4px", fontWeight: 600 }}>You</span>
                </div>
                <div style={{ position: "absolute", top: "28%", left: "33%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 0 3px rgba(99,102,241,0.3)" }} />
                  <span style={{ fontSize: "9px", color: "#94a3b8", marginTop: "3px" }}>A</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
            <CardContent className="!p-4">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "white", margin: 0 }}>Notifications</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { color: "#3b82f6", label: "New Order Available",  sub: "Mohammadia • 850DZD",       time: "Just now" },
                  { color: "#10b981", label: "Payout Processed",     sub: "Weekly earnings deposited.", time: "2hrs ago" },
                  { color: "#f59e0b", label: "New 5-Star Rating!",   sub: '"Great service, very fast"', time: "3hrs ago" },
                  { color: "#a78bfa", label: "Surge Pricing Active", sub: "",                           time: ""         },
                ].map((n, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px", borderRadius: "10px", background: "#1e2d3d", cursor: "pointer" }}>
                    <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: `${n.color}20`, border: `1px solid ${n.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: n.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "12px", fontWeight: 700, color: "white", margin: "0 0 1px" }}>{n.label}</p>
                      {n.sub  && <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 1px" }}>{n.sub}</p>}
                      {n.time && <p style={{ fontSize: "10px", color: "#475569", margin: 0 }}>{n.time}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Deliveries — horizontally scrollable table on mobile */}
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
                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 1.5fr 1fr 1fr", padding: "0 8px 10px", borderBottom: "1px solid #1e2d3d" }}>
                  {["ORDERS", "ITEMS", "DATE & TIME", "STATUS", "PAYOUT"].map(h => (
                    <p key={h} style={{ fontSize: "10px", fontWeight: 700, color: "#475569", margin: 0, letterSpacing: "0.05em" }}>{h}</p>
                  ))}
                </div>

                {/* Rows */}
                {loading ? (
                  <p style={{ color: "#64748b", fontSize: "13px", padding: "20px 8px" }}>Loading...</p>
                ) : (
                  deliveries.map((d, i) => (
                    <div key={d.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 1.5fr 1fr 1fr", padding: "14px 8px", alignItems: "center", borderBottom: i < deliveries.length - 1 ? "1px solid #1e2d3d" : "none" }}>
                      <p style={{ fontSize: "12px", fontWeight: 700, color: "white", margin: 0 }}>{d.id}</p>
                      <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>{d.items}</p>
                      <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>{d.date}</p>
                      <span style={{ ...statusStyle[d.status], borderRadius: "6px", padding: "3px 8px", fontSize: "11px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px", width: "fit-content" }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: statusStyle[d.status]?.color, flexShrink: 0 }} />
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