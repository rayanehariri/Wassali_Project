// UserDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronRight, Phone, Mail, MapPin,
  Star, ShieldCheck, MessageSquare, Ban,
  CheckCircle, TrendingUp, TrendingDown,
  Wallet, Clock, BadgeCheck, Search,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

import { getUserDetail, suspendUser, sendMessage, getUserOrderHistory } from "./FakeUseDetaildApi";

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

// ── Status / role styles ──────────────────────────────────────
const statusStyle = {
  "Active":   { color: "#10b981", background: "rgba(16,185,129,0.15)"  },
  "Inactive": { color: "#94a3b8", background: "rgba(148,163,184,0.15)" },
  "Banned":   { color: "#ef4444", background: "rgba(239,68,68,0.15)"   },
};
const roleColor = {
  "Deliverer": "linear-gradient(135deg, #7c3aed, #a78bfa)",
  "Customer":  "linear-gradient(135deg, #2563eb, #60a5fa)",
  "Admin":     "linear-gradient(135deg, #ea580c, #fb923c)",
};
const deliveryStatusStyle = {
  "Completed": { background: "rgba(16,185,129,0.15)",  color: "#10b981" },
  "Cancelled": { background: "rgba(239,68,68,0.15)",   color: "#ef4444" },
  "Pending":   { background: "rgba(234,179,8,0.15)",   color: "#eab308" },
  "In Transit":{ background: "rgba(59,130,246,0.15)",  color: "#3b82f6" },
};

const tabs = ["Overview", "Order History", "Transaction Log", "Documents"];

// ── UserOrderHistory ──────────────────────────────────────────
function UserOrderHistory({ userId }) {
  const { isMobile } = useBreakpoint();
  const [orders, setOrders]         = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(true);
  const [status, setStatus]         = useState("All");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const result = await getUserOrderHistory(userId, { status, search, page, limit: 5 });
        setOrders(result.orders);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchOrders();
  }, [userId, status, search, page]);

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{
                background: "#1e2536", border: "1px solid #33415580",
                borderRadius: "8px", color: "#f1f5f9",
                fontSize: "13px", height: "36px",
                padding: "0 12px 0 34px",
                width: isMobile ? "100%" : "220px",
                outline: "none",
              }}
            />
          </div>
          <Select onValueChange={(v) => { setStatus(v); setPage(1); }} defaultValue="All">
            <SelectTrigger className="!px-3 !py-4" style={{ background: "#1e2536", border: "1px solid #33415580", borderRadius: "8px", color: "#94a3b8", fontSize: "13px", minWidth: "120px" }}>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent style={{ background: "#1e2536", border: "1px solid #33415580" }}>
              {["All", "Completed", "Cancelled", "Pending", "In Transit"].map((s) => (
                <SelectItem className="!px-3 !py-2" key={s} value={s} style={{ color: "#f1f5f9", fontSize: "13px" }}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="!px-3 !py-4" variant="outline" style={{ background: "transparent", border: "1px solid #33415580", borderRadius: "8px", color: "#94a3b8", fontSize: "13px" }}>
          ↓ Export CSV
        </Button>
      </div>

      {/* Table */}
      <Card className="!pl-4" style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "16px" }}>
        <CardContent style={{ padding: "0" }}>
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: "480px" }}>
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: "#1e2d3d" }}>
                    {["Order ID", "Date", "Route", "Amount", "Status"].map((h) => (
                      <TableHead key={h} style={{ color: "#64748b", fontSize: "11px", fontWeight: 600 }} className="uppercase tracking-wider">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center !text-slate-400 !py-10">Loading...</TableCell></TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center !text-slate-400 !py-10">No orders found</TableCell></TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id} style={{ borderColor: "#1e2d3d" }} className="hover:!bg-white/5">
                        <TableCell><p className="text-white text-[13px] font-semibold">{order.id}</p></TableCell>
                        <TableCell><p className="text-slate-300 text-[13px]">{order.date}</p></TableCell>
                        <TableCell className="!py-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: deliveryStatusStyle[order.status]?.color || "#64748b", flexShrink: 0 }} />
                              <span className="text-slate-300 text-[12px]">{order.route.from}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: deliveryStatusStyle[order.status]?.color || "#64748b", flexShrink: 0 }} />
                              <span className="text-slate-300 text-[12px]">{order.route.to}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="!text-white !font-semibold !text-[13px]">{order.amount}</TableCell>
                        <TableCell>
                          <span style={{ ...deliveryStatusStyle[order.status], borderRadius: "6px", padding: "3px 10px", fontSize: "12px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "5px" }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: deliveryStatusStyle[order.status]?.color }} />
                            {order.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <span className="text-slate-400 text-[13px]">
          Showing <span className="text-white font-semibold">{(page - 1) * 5 + 1}</span> to{" "}
          <span className="text-white font-semibold">{Math.min(page * 5, total)}</span> of{" "}
          <span className="text-white font-semibold">{total}</span> results
        </span>
        <div className="flex items-center gap-2">
          <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            style={{ background: "#1e2536", border: "1px solid #33415580", borderRadius: "8px", color: "#94a3b8", width: "36px", height: "36px" }}>{"<"}</Button>
          {(() => {
            const pages = [];
            if (totalPages <= 5) for (let i = 1; i <= totalPages; i++) pages.push(i);
            else if (page <= 3)               pages.push(1, 2, 3, "...", totalPages);
            else if (page >= totalPages - 2)  pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
            else                              pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
            return pages.map((p, i) =>
              p === "..." ? (
                <span key={`d-${i}`} className="text-slate-400 text-[13px]">...</span>
              ) : (
                <Button key={p} onClick={() => setPage(p)} style={{ background: page === p ? "#2563eb" : "#1e2536", border: "1px solid #33415580", borderRadius: "8px", color: page === p ? "white" : "#94a3b8", width: "36px", height: "36px", fontSize: "13px", fontWeight: page === p ? 700 : 400 }}>{p}</Button>
              )
            );
          })()}
          <Button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ background: "#1e2536", border: "1px solid #33415580", borderRadius: "8px", color: "#94a3b8", width: "36px", height: "36px" }}>{">"}</Button>
        </div>
      </div>
    </div>
  );
}

// ── UserDetailPage ────────────────────────────────────────────
export default function UserDetailPage() {
  const { userId }  = useParams();
  const navigate    = useNavigate();
  const { isMobile, isTablet } = useBreakpoint();
  const isNarrow = isMobile || isTablet;

  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [acting, setActing]       = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try { setUser(await getUserDetail(userId)); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchUser();
  }, [userId]);

  async function handleSuspend() {
    if (!window.confirm("Suspend this account?")) return;
    setActing(true);
    try { await suspendUser(userId); setUser((p) => ({ ...p, status: "Banned" })); }
    finally { setActing(false); }
  }

  async function handleMessage() { await sendMessage(userId, "Hello from admin"); }

  if (loading) return <div style={{ background: "#0f1117", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>Loading...</div>;
  if (!user)   return <div style={{ background: "#0f1117", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>User not found.</div>;

  const { stats, reviews } = user;

  return (
    <div style={{ background: "#0f1117", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: isMobile ? "16px" : "24px", display: "flex", flexDirection: "column", gap: "18px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          {["Dashboard", "Users", user.name].map((crumb, i, arr) => (
            <span key={crumb} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                onClick={() => { if (i === 0) navigate("/dashboard"); if (i === 1) navigate("/dashboard/users"); }}
                style={{ fontSize: "13px", color: i === arr.length - 1 ? "#3b82f6" : "#64748b", cursor: i < arr.length - 1 ? "pointer" : "default", fontWeight: i === arr.length - 1 ? 600 : 400 }}
              >
                {crumb}
              </span>
              {i < arr.length - 1 && <ChevronRight size={13} color="#334155" />}
            </span>
          ))}
        </div>

        {/* Main grid — stacked on mobile/tablet */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isNarrow ? "1fr" : "280px 1fr",
          gap: "18px",
          alignItems: "start",
        }}>

          {/* LEFT: Profile + Contact */}
          <div style={{ display: "flex", flexDirection: isNarrow ? "row" : "column", gap: "14px", flexWrap: "wrap" }}>

            {/* Profile Card */}
            <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "16px", flex: isNarrow ? "1 1 260px" : "none" }}>
              <CardContent className="!p-5">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <div style={{ position: "relative" }}>
                    <Avatar style={{ width: "80px", height: "80px", border: "3px solid #1e2d3d" }}>
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback style={{ background: roleColor[user.role] || "linear-gradient(135deg,#334155,#475569)", fontSize: "22px", fontWeight: 700, color: "white" }}>
                        {user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span style={{ position: "absolute", bottom: "6px", right: "6px", width: "13px", height: "13px", borderRadius: "50%", background: user.status === "Active" ? "#10b981" : "#64748b", border: "2px solid #161f2e" }} />
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "17px", fontWeight: 800, color: "white", margin: "0 0 6px" }}>{user.name}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 600 }}>{user.badge}</span>
                      {user.verified && (
                        <span style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", fontSize: "11px", fontWeight: 700, borderRadius: "6px", padding: "2px 8px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                          <ShieldCheck size={11} /> Verified
                        </span>
                      )}
                    </div>
                    <div style={{ marginTop: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: statusStyle[user.status]?.color ?? "#64748b", background: statusStyle[user.status]?.background ?? "rgba(100,116,139,0.15)", borderRadius: "6px", padding: "2px 10px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusStyle[user.status]?.color ?? "#64748b", flexShrink: 0 }} />
                        {user.status}
                      </span>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", width: "100%", borderTop: "1px solid #1e2d3d", borderBottom: "1px solid #1e2d3d", padding: "10px 0" }}>
                    {[
                      { label: "Rating",     value: user.rating      },
                      { label: "Deliveries", value: user.deliveries  },
                      { label: "Member",     value: user.memberYears },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "15px", fontWeight: 800, color: "white", margin: 0 }}>{value}</p>
                        <p style={{ fontSize: "10px", color: "#64748b", margin: 0 }}>{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                    <Button onClick={handleMessage} style={{ width: "100%", height: "36px", background: "transparent", border: "1px solid #334155", borderRadius: "10px", color: "#94a3b8", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }} className="hover:!bg-[#1e2d3d] hover:!text-white">
                      <MessageSquare size={14} /> Message
                    </Button>
                    <Button onClick={handleSuspend} disabled={acting || user.status === "Banned"} style={{ width: "100%", height: "36px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", color: "#ef4444", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }} className="hover:!bg-red-500/20">
                      <Ban size={14} />
                      {user.status === "Banned" ? "Account Suspended" : "Suspend Account"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "16px", flex: isNarrow ? "1 1 220px" : "none" }}>
              <CardContent className="!p-5">
                <p style={{ fontSize: "13px", fontWeight: 700, color: "white", margin: "0 0 12px" }}>Contact Information</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { icon: Phone,  label: "Phone Number",  value: user.phone       },
                    { icon: Mail,   label: "Email Address", value: user.email       },
                    { icon: MapPin, label: "Home Address",  value: user.homeAddress },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#1e2d3d", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={13} color="#64748b" />
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 2px" }}>{label}</p>
                        <p style={{ fontSize: "12px", color: "#f1f5f9", margin: 0, fontWeight: 500 }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Tabs + content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Tabs — scrollable on mobile */}
            <div style={{ display: "flex", borderBottom: "1px solid #1e2d3d", overflowX: "auto" }}>
              {tabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: "10px 16px",
                  background: "transparent", border: "none",
                  borderBottom: activeTab === tab ? "2px solid #3b82f6" : "2px solid transparent",
                  color: activeTab === tab ? "#3b82f6" : "#64748b",
                  fontSize: "13px", fontWeight: activeTab === tab ? 700 : 400,
                  cursor: "pointer", marginBottom: "-1px", whiteSpace: "nowrap",
                }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview */}
            {activeTab === "Overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                {/* 3 stat cards — 1-col mobile, 3-col desktop */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "12px" }}>

                  {/* Total Earned */}
                  <Card style={{ background: "#1E293B", border: "1px solid #33415580", borderRadius: "12px" }}>
                    <CardContent className="!py-4 !px-4">
                      <div className="flex items-center gap-4 mb-3">
                        <div style={{ width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0, background: "rgba(59,130,246,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Wallet size={20} color="#3b82f6" />
                        </div>
                        <div>
                          <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 3px" }}>Total Earned</p>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <p style={{ fontSize: "24px", fontWeight: 800, color: "white", margin: 0, lineHeight: 1 }}>{stats.totalEarned.value}</p>
                            <p style={{ fontSize: "13px", color: "#64748b", paddingTop: "6px" }}>DZD</p>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <TrendingUp size={12} color="#10b981" />
                        <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 600 }}>{stats.totalEarned.change}</span>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>{stats.totalEarned.label}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Avg Delivery Time */}
                  <Card style={{ background: "#1E293B", border: "1px solid #33415580", borderRadius: "12px" }}>
                    <CardContent className="!py-4 !px-4">
                      <div className="flex items-center gap-4 mb-3">
                        <div style={{ width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0, background: "#581C8733", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Clock size={20} color="#C084FC" />
                        </div>
                        <div>
                          <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 3px" }}>Avg. Delivery Time</p>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <p style={{ fontSize: "24px", fontWeight: 800, color: "white", margin: 0, lineHeight: 1 }}>{stats.avgDeliveryTime.value}</p>
                            <p style={{ fontSize: "13px", color: "#64748b", paddingTop: "6px" }}>min</p>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <TrendingDown size={12} color="#10b981" />
                        <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 600 }}>{stats.avgDeliveryTime.change}</span>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>{stats.avgDeliveryTime.label}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Acceptance Rate */}
                  <Card style={{ background: "#1E293B", border: "1px solid #33415580", borderRadius: "12px" }}>
                    <CardContent className="!py-4 !px-4">
                      <div className="flex items-center gap-4 mb-3">
                        <div style={{ width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0, background: "rgba(245,158,11,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <BadgeCheck size={20} color="#f59e0b" />
                        </div>
                        <div>
                          <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 3px" }}>{stats.acceptanceRate.label}</p>
                          <p style={{ fontSize: "24px", fontWeight: 800, color: "white", margin: 0, lineHeight: 1 }}>{stats.acceptanceRate.value}</p>
                        </div>
                      </div>
                      <div style={{ height: "5px", background: "#0f1117", borderRadius: "99px", overflow: "hidden" }}>
                        <div style={{ width: `${stats.acceptanceRate.progress}%`, height: "100%", background: "linear-gradient(90deg, #f59e0b, #fb923c)", borderRadius: "99px" }} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Deliveries + right column */}
                <div style={{ display: "grid", gridTemplateColumns: isNarrow ? "1fr" : "1fr 300px", gap: "14px" }}>

                  {/* Recent Deliveries */}
                  <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
                    <CardContent className="!p-4">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "white", margin: 0 }}>Recent Deliveries</p>
                        <button onClick={() => setActiveTab("Order History")} style={{ fontSize: "12px", color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View All</button>
                      </div>

                      {/* Scrollable on narrow */}
                      <div style={{ overflowX: "auto" }}>
                        <div style={{ minWidth: "420px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", marginBottom: "10px" }}>
                            {["Order ID", "Date", "Customer", "Status"].map((h) => (
                              <p key={h} style={{ fontSize: "10px", fontWeight: 700, color: "#475569", margin: 0, letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</p>
                            ))}
                          </div>
                          {user.recentDeliveries.map((d, i) => (
                            <div key={d.id} style={{
                              display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
                              alignItems: "center",
                              paddingBottom: i < user.recentDeliveries.length - 1 ? "10px" : 0,
                              marginBottom:  i < user.recentDeliveries.length - 1 ? "10px" : 0,
                              borderBottom:  i < user.recentDeliveries.length - 1 ? "1px solid #1e2d3d" : "none",
                            }}>
                              <p style={{ fontSize: "12px", color: "white", fontWeight: 600, margin: 0 }}>{d.id}</p>
                              <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>{d.date}</p>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Avatar style={{ width: "20px", height: "20px" }}>
                                  <AvatarFallback style={{ background: "linear-gradient(135deg,#2563eb,#60a5fa)", fontSize: "8px", fontWeight: 700, color: "white" }}>
                                    {d.customer.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <span style={{ fontSize: "11px", color: "#94a3b8" }}>{d.customer.name}</span>
                              </div>
                              <span style={{ ...deliveryStatusStyle[d.status], borderRadius: "6px", padding: "2px 6px", fontSize: "10px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "3px", width: "fit-content" }}>
                                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: deliveryStatusStyle[d.status]?.color, flexShrink: 0 }} />
                                {d.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right column: Vehicle + Reviews */}
                  <div style={{ display: "flex", flexDirection: isNarrow ? "row" : "column", gap: "14px", flexWrap: "wrap" }}>

                    {/* Vehicle Details */}
                    {user.vehicle && (
                      <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "14px", flex: isNarrow ? "1 1 200px" : "none" }}>
                        <CardContent className="!p-4">
                          <p style={{ fontSize: "13px", fontWeight: 700, color: "white", margin: "0 0 12px" }}>Vehicle Details</p>
                          {[
                            { label: "Type",         value: user.vehicle.type        },
                            { label: "Model",        value: user.vehicle.model       },
                            { label: "Plate Number", value: user.vehicle.plateNumber },
                          ].map(({ label, value }) => (
                            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                              <span style={{ fontSize: "12px", color: "#64748b" }}>{label}</span>
                              <span style={{ fontSize: "12px", fontWeight: 600, color: "white" }}>{value}</span>
                            </div>
                          ))}
                          {user.vehicle.verified && (
                            <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "8px", padding: "6px 10px", marginTop: "10px" }}>
                              <CheckCircle size={13} color="#10b981" />
                              <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 600 }}>Verified Vehicle</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Reviews Breakdown */}
                    <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "14px", flex: isNarrow ? "1 1 220px" : "none" }}>
                      <CardContent className="!p-4">
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "white", margin: "0 0 12px" }}>Reviews Breakdown</p>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
                          <div style={{ background: "#1e2d3d", borderRadius: "10px", padding: "10px 14px", textAlign: "center", flexShrink: 0 }}>
                            <p style={{ fontSize: "24px", fontWeight: 800, color: "white", margin: 0 }}>{reviews.average}</p>
                            <div style={{ display: "flex", gap: "2px", justifyContent: "center", marginTop: "4px" }}>
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} size={10} fill={s <= Math.round(reviews.average) ? "#f59e0b" : "none"} color={s <= Math.round(reviews.average) ? "#f59e0b" : "#334155"} />
                              ))}
                            </div>
                          </div>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                            {[5, 4, 3, 2, 1].map((star) => (
                              <div key={star} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontSize: "11px", color: "#64748b", width: "8px" }}>{star}</span>
                                <div style={{ flex: 1, height: "5px", background: "#1e2d3d", borderRadius: "99px", overflow: "hidden" }}>
                                  <div style={{ width: `${reviews.breakdown[star] ?? 0}%`, height: "100%", background: "#3b82f6", borderRadius: "99px" }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{ borderTop: "1px solid #1e2d3d", paddingTop: "10px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "white" }}>{reviews.latest.label}</span>
                            <span style={{ fontSize: "11px", color: "#64748b" }}>{reviews.latest.time}</span>
                          </div>
                          <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 8px", lineHeight: 1.5 }}>{reviews.latest.text}</p>
                          <button style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Read all reviews</button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Order History Tab */}
            {activeTab === "Order History" && <UserOrderHistory userId={userId} />}

            {/* Transaction Log Tab */}
            {activeTab === "Transaction Log" && (
              <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
                <CardContent className="!p-8" style={{ textAlign: "center" }}>
                  <p style={{ color: "#64748b", fontSize: "14px" }}>Transaction Log coming soon.</p>
                </CardContent>
              </Card>
            )}

            {/* Documents Tab */}
            {activeTab === "Documents" && (
              <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
                <CardContent className="!p-8" style={{ textAlign: "center" }}>
                  <p style={{ color: "#64748b", fontSize: "14px" }}>Documents coming soon.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}