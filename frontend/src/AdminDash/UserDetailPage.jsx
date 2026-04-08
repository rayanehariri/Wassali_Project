// UserDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronRight, Phone, Mail, MapPin,
  Star, ShieldCheck, MessageSquare, Ban,
  Car, CheckCircle, TrendingUp, TrendingDown,
   Wallet, Clock, BadgeCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import UserOrderHistory from "./UserOrderPage";
import { getUserDetail, suspendUser, sendMessage } from "./FakeUseDetaildApi";

// ── Status styles ────────────────────────────────────────
const statusStyle = {
  "Active":   { color: "#10b981", background: "rgba(16,185,129,0.15)"  },
  "Inactive": { color: "#94a3b8", background: "rgba(148,163,184,0.15)" },
  "Banned":   { color: "#ef4444", background: "rgba(239,68,68,0.15)"   },
};

// ── Role avatar gradients ────────────────────────────────
const roleColor = {
  "Deliverer": "linear-gradient(135deg, #7c3aed, #a78bfa)",
  "Customer":  "linear-gradient(135deg, #2563eb, #60a5fa)",
  "Admin":     "linear-gradient(135deg, #ea580c, #fb923c)",
};

// ── Delivery status styles ───────────────────────────────
const deliveryStatusStyle = {
  "Completed": { background: "rgba(16,185,129,0.15)",  color: "#10b981" },
  "Cancelled": { background: "rgba(239,68,68,0.15)",   color: "#ef4444" },
  "Pending":   { background: "rgba(234,179,8,0.15)",   color: "#eab308" },
  "In Transit":{ background: "rgba(59,130,246,0.15)",  color: "#3b82f6" },
};

const tabs = ["Overview", "Order History", "Transaction Log", "Documents"];

export default function UserDetailPage() {
  const { userId }  = useParams();
  const navigate    = useNavigate();

  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [acting, setActing]       = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  // ── Fetch user ───────────────────────────────────────
  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const data = await getUserDetail(userId);
        setUser(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId]);

  // ── Suspend ──────────────────────────────────────────
  async function handleSuspend() {
    if (!window.confirm("Suspend this account?")) return;
    setActing(true);
    try {
      await suspendUser(userId);
      setUser((prev) => ({ ...prev, status: "Banned" }));
    } finally {
      setActing(false);
    }
  }

  // ── Message ──────────────────────────────────────────
  async function handleMessage() {
    await sendMessage(userId, "Hello from admin");
  }

  // ── Loading ──────────────────────────────────────────
  if (loading) return (
    <div style={{
      background: "#0f1117", minHeight: "100vh",
      display: "flex", alignItems: "center",
      justifyContent: "center", color: "#64748b",
    }}>
      Loading...
    </div>
  );

  if (!user) return (
    <div style={{
      background: "#0f1117", minHeight: "100vh",
      display: "flex", alignItems: "center",
      justifyContent: "center", color: "#64748b",
    }}>
      User not found.
    </div>
  );

  const { stats, reviews } = user;

  return (
    <div style={{ background: "#0f1117", minHeight: "100vh", display: "flex", flexDirection: "column" }}>


      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* ── Breadcrumb ──────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {["Dashboard", "Users", user.name].map((crumb, i, arr) => (
            <span key={crumb} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                onClick={() => {
                  if (i === 0) navigate("/dashboard");
                  if (i === 1) navigate("/dashboard/users");
                }}
                style={{
                  fontSize: "13px",
                  color: i === arr.length - 1 ? "#3b82f6" : "#64748b",
                  cursor: i < arr.length - 1 ? "pointer" : "default",
                  fontWeight: i === arr.length - 1 ? 600 : 400,
                }}
              >
                {crumb}
              </span>
              {i < arr.length - 1 && <ChevronRight size={13} color="#334155" />}
            </span>
          ))}
        </div>

        {/* ── Main grid ────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "20px", alignItems: "start" }}>

          {/* ── LEFT: Profile + Contact ──────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Profile Card */}
            <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "16px" }}>
              <CardContent className="!p-6">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>

                  {/* Avatar with online dot */}
                  <div style={{ position: "relative" }}>
                    <Avatar style={{ width: "88px", height: "88px", border: "3px solid #1e2d3d" }}>
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback style={{
                        background: roleColor[user.role] || "linear-gradient(135deg,#334155,#475569)",
                        fontSize: "24px", fontWeight: 700, color: "white",
                      }}>
                        {user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span style={{
                      position: "absolute", bottom: "6px", right: "6px",
                      width: "14px", height: "14px", borderRadius: "50%",
                      background: user.status === "Active" ? "#10b981" : "#64748b",
                      border: "2px solid #161f2e",
                    }} />
                  </div>

                  {/* Name + badges */}
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "18px", fontWeight: 800, color: "white", margin: "0 0 6px" }}>
                      {user.name}
                    </p>

                    {/* Role badge + verified */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 600 }}>
                        {user.badge}
                      </span>
                      {user.verified && (
                        <span style={{
                          background: "rgba(16,185,129,0.15)", color: "#10b981",
                          fontSize: "11px", fontWeight: 700,
                          borderRadius: "6px", padding: "2px 8px",
                          display: "inline-flex", alignItems: "center", gap: "3px",
                        }}>
                          <ShieldCheck size={11} /> Verified
                        </span>
                      )}
                    </div>

                    {/* Status badge — uses statusStyle ✅ */}
                    <div style={{ marginTop: "8px" }}>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color:      statusStyle[user.status]?.color      ?? "#64748b",
                        background: statusStyle[user.status]?.background ?? "rgba(100,116,139,0.15)",
                        borderRadius: "6px",
                        padding: "2px 10px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}>
                        <span style={{
                          width: "6px", height: "6px", borderRadius: "50%",
                          background: statusStyle[user.status]?.color ?? "#64748b",
                          flexShrink: 0,
                        }} />
                        {user.status}
                      </span>
                    </div>
                  </div>

                  {/* Stats row: Rating / Deliveries / Member */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                    width: "100%",
                    borderTop: "1px solid #1e2d3d",
                    borderBottom: "1px solid #1e2d3d",
                    padding: "12px 0",
                  }}>
                    {[
                      { label: "Rating",     value: user.rating      },
                      { label: "Deliveries", value: user.deliveries  },
                      { label: "Member",     value: user.memberYears },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "16px", fontWeight: 800, color: "white", margin: 0 }}>{value}</p>
                        <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                    <Button
                      onClick={handleMessage}
                      style={{
                        width: "100%", height: "38px",
                        background: "transparent",
                        border: "1px solid #334155",
                        borderRadius: "10px", color: "#94a3b8",
                        fontSize: "13px", fontWeight: 600,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      }}
                      className="hover:!bg-[#1e2d3d] hover:!text-white"
                    >
                      <MessageSquare size={14} /> Message
                    </Button>

                    <Button
                      onClick={handleSuspend}
                      disabled={acting || user.status === "Banned"}
                      style={{
                        width: "100%", height: "38px",
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        borderRadius: "10px", color: "#ef4444",
                        fontSize: "13px", fontWeight: 600,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      }}
                      className="hover:!bg-red-500/20"
                    >
                      <Ban size={14} />
                      {user.status === "Banned" ? "Account Suspended" : "Suspend Account"}
                    </Button>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "16px" }}>
              <CardContent className="!p-5">
                <p style={{ fontSize: "13px", fontWeight: 700, color: "white", margin: "0 0 14px" }}>
                  Contact Information
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    { icon: Phone,  label: "Phone Number",  value: user.phone       },
                    { icon: Mail,   label: "Email Address", value: user.email       },
                    { icon: MapPin, label: "Home Address",  value: user.homeAddress },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "8px",
                        background: "#1e2d3d", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Icon size={14} color="#64748b" />
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 2px" }}>{label}</p>
                        <p style={{ fontSize: "13px", color: "#f1f5f9", margin: 0, fontWeight: 500 }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* ── RIGHT: Tabs + content ────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #1e2d3d" }}>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "10px 20px",
                    background: "transparent", border: "none",
                    borderBottom: activeTab === tab ? "2px solid #3b82f6" : "2px solid transparent",
                    color: activeTab === tab ? "#3b82f6" : "#64748b",
                    fontSize: "13px", fontWeight: activeTab === tab ? 700 : 400,
                    cursor: "pointer", marginBottom: "-1px",
                    transition: "all 0.15s",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* ── Overview ──────────────────────────────── */}
            {activeTab === "Overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

               {/* 3 stat cards */}
{/* 3 stat cards */}
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>

  {/* Total Earned */}
  <Card style={{
    background: "#1E293B",
    border: "1px solid #33415580",
    borderRadius: "12px",
  }}>
    <CardContent className="!py-5 !px-5">
      <div className="flex items-center gap-4 mb-3 !pb-2 ">
        {/* Icon circle */}
        <div style={{
          width: "48px", height: "48px", borderRadius: "50%", flexShrink: 0,
          background: "rgba(59,130,246,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Wallet size={22} color="#3b82f6" />
        </div>
        {/* Label + value */}
        <div className="!pb-2">
          <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 4px" }}>Total Earned</p>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <p style={{ fontSize: "26px", fontWeight: 800, color: "white", margin: 0, lineHeight: 1 }}>
            {stats.totalEarned.value}
             </p>
            <p className="!pt-2" style={{fontFamily: "Inter, sans-serif", fontWeight: 400,fontStyle: "normal",fontSize: "14px",lineHeight: "20px",letterSpacing: "0px", verticalAlign: "middle",color: "#64748B"}}>DZD</p>
          </div>
        </div>
      </div>
      {/* Bottom trend */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <TrendingUp size={13} color="#10b981" />
        <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 600 }}>
          {stats.totalEarned.change}
        </span>
        <div>
        <span style={{ fontSize: "12px", color: "#64748b" }}>
          {stats.totalEarned.label}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Avg Delivery Time */}
  <Card style={{
    background: "#1E293B",
    border: "1px solid #33415580",
    borderRadius: "12px",
  }}>
    <CardContent className="!py-5 !px-5">
      <div className="flex items-center gap-4 mb-3 !pb-2 ">
        {/* Icon circle */}
        <div style={{
          width: "48px", height: "48px", borderRadius: "50%", flexShrink: 0,
          background: "#581C8733",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Clock size={22} color="#C084FC" />
        </div>
        {/* Label + value */}
        <div className="!pb-2">

          <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 4px" }}>Avg. Delivery Time</p>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <p style={{ fontSize: "26px", fontWeight: 800, color: "white", margin: 0, lineHeight: 1 }}>
            {stats.avgDeliveryTime.value}
          </p>
           <p className="!pt-2" style={{fontFamily: "Inter, sans-serif", fontWeight: 400,fontStyle: "normal",fontSize: "14px",lineHeight: "20px",letterSpacing: "0px", verticalAlign: "middle",color: "#64748B"}}>min</p>
          </div>
        </div>
      </div>
      {/* Bottom trend */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <TrendingDown size={13} color="#10b981" />
        <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 600 }}>
          {stats.avgDeliveryTime.change}
        </span>
        <span style={{ fontSize: "12px", color: "#64748b" }}>
          {stats.avgDeliveryTime.label}
        </span>
      </div>
    </CardContent>
  </Card>

  {/* Acceptance Rate */}
  <Card style={{
    background: "#1E293B",
    border: "1px solid #33415580",
    borderRadius: "12px",
  }}>
    <CardContent className="!py-5 !px-5">
      <div className="flex items-center gap-4 mb-4 !pb-2 ">
        {/* Icon circle */}
        <div style={{
          width: "48px", height: "48px", borderRadius: "50%", flexShrink: 0,
          background: "rgba(245,158,11,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <BadgeCheck size={22} color="#f59e0b" />
        </div>
        {/* Label + value */}
        <div className="!pb-3">
          <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 4px" }}>
            {stats.acceptanceRate.label}
          </p>
          <p className="!pb-2" style={{ fontSize: "26px", fontWeight: 800, color: "white", margin: 0, lineHeight: 1 }}>
            {stats.acceptanceRate.value}
          </p>
        </div>
      </div>
      {/* Bottom progress bar */}
      <div style={{
        height: "5px", background: "#0f1117",
        borderRadius: "99px", overflow: "hidden",
      }}>
        <div style={{
          width: `${stats.acceptanceRate.progress}%`,
          height: "100%",
          background: "linear-gradient(90deg, #f59e0b, #fb923c)",
          borderRadius: "99px",
        }} />
      </div>
    </CardContent>
  </Card>

</div>
                {/* Recent Deliveries + Right column */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "14px" }}>

                  {/* Recent Deliveries mini table */}
                  <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
                    <CardContent className="!p-5">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "white", margin: 0 }}>Recent Deliveries</p>
                        <button
                          onClick={() => setActiveTab("Order History")}
                          style={{ fontSize: "12px", color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                        >
                          View All
                        </button>
                      </div>

                      {/* Header */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", marginBottom: "10px" }}>
                        {["Order ID", "Date", "Customer", "Status"].map((h) => (
                          <p key={h} style={{
                            fontSize: "10px", fontWeight: 700,
                            color: "#475569", margin: 0,
                            letterSpacing: "0.05em", textTransform: "uppercase",
                          }}>
                            {h}
                          </p>
                        ))}
                      </div>

                      {/* Rows */}
                      {user.recentDeliveries.map((d, i) => (
                        <div
                          key={d.id}
                          style={{
                            display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
                            alignItems: "center",
                            paddingBottom: i < user.recentDeliveries.length - 1 ? "12px" : 0,
                            marginBottom: i < user.recentDeliveries.length - 1 ? "12px" : 0,
                            borderBottom: i < user.recentDeliveries.length - 1 ? "1px solid #1e2d3d" : "none",
                          }}
                        >
                          <p style={{ fontSize: "13px", color: "white", fontWeight: 600, margin: 0 }}>{d.id}</p>
                          <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>{d.date}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Avatar style={{ width: "22px", height: "22px" }}>
                              <AvatarFallback style={{
                                background: "linear-gradient(135deg,#2563eb,#60a5fa)",
                                fontSize: "9px", fontWeight: 700, color: "white",
                              }}>
                                {d.customer.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>{d.customer.name}</span>
                          </div>
                          <span style={{
                            ...deliveryStatusStyle[d.status],
                            borderRadius: "6px", padding: "2px 8px",
                            fontSize: "11px", fontWeight: 600,
                            display: "inline-flex", alignItems: "center", gap: "4px",
                            width: "fit-content",
                          }}>
                            <span style={{
                              width: "5px", height: "5px", borderRadius: "50%",
                              background: deliveryStatusStyle[d.status]?.color,
                              flexShrink: 0,
                            }} />
                            {d.status}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Right column: Vehicle + Reviews */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                    {/* Vehicle Details */}
                    {user.vehicle && (
                      <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
                        <CardContent className="!p-5">
                          <p style={{ fontSize: "14px", fontWeight: 700, color: "white", margin: "0 0 14px" }}>
                            Vehicle Details
                          </p>
                          {[
                            { label: "Type",         value: user.vehicle.type         },
                            { label: "Model",        value: user.vehicle.model        },
                            { label: "Plate Number", value: user.vehicle.plateNumber  },
                          ].map(({ label, value }) => (
                            <div key={label} style={{
                              display: "flex", justifyContent: "space-between",
                              alignItems: "center", marginBottom: "10px",
                            }}>
                              <span style={{ fontSize: "12px", color: "#64748b" }}>{label}</span>
                              <span style={{ fontSize: "12px", fontWeight: 600, color: "white" }}>{value}</span>
                            </div>
                          ))}
                          {user.vehicle.verified && (
                            <div style={{
                              display: "flex", alignItems: "center", gap: "5px",
                              background: "rgba(16,185,129,0.1)",
                              border: "1px solid rgba(16,185,129,0.2)",
                              borderRadius: "8px", padding: "6px 10px", marginTop: "10px",
                            }}>
                              <CheckCircle size={13} color="#10b981" />
                              <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 600 }}>
                                Verified Vehicle
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Reviews Breakdown */}
                    <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
                      <CardContent className="!p-5">
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "white", margin: "0 0 14px" }}>
                          Reviews Breakdown
                        </p>

                        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "14px" }}>
                          {/* Big rating number */}
                          <div style={{
                            background: "#1e2d3d", borderRadius: "12px",
                            padding: "12px 16px", textAlign: "center", flexShrink: 0,
                          }}>
                            <p style={{ fontSize: "26px", fontWeight: 800, color: "white", margin: 0 }}>
                              {reviews.average}
                            </p>
                            <div style={{ display: "flex", gap: "2px", justifyContent: "center", marginTop: "4px" }}>
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s} size={10}
                                  fill={s <= Math.round(reviews.average) ? "#f59e0b" : "none"}
                                  color={s <= Math.round(reviews.average) ? "#f59e0b" : "#334155"}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Star bars */}
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                            {[5, 4, 3, 2, 1].map((star) => (
                              <div key={star} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontSize: "11px", color: "#64748b", width: "8px" }}>{star}</span>
                                <div style={{
                                  flex: 1, height: "5px",
                                  background: "#1e2d3d", borderRadius: "99px", overflow: "hidden",
                                }}>
                                  <div style={{
                                    width: `${reviews.breakdown[star] ?? 0}%`,
                                    height: "100%",
                                    background: "#3b82f6",
                                    borderRadius: "99px",
                                  }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Latest review */}
                        <div style={{ borderTop: "1px solid #1e2d3d", paddingTop: "12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "white" }}>
                              {reviews.latest.label}
                            </span>
                            <span style={{ fontSize: "11px", color: "#64748b" }}>
                              {reviews.latest.time}
                            </span>
                          </div>
                          <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 8px", lineHeight: 1.5 }}>
                            {reviews.latest.text}
                          </p>
                          <button style={{
                            fontSize: "12px", color: "#3b82f6", fontWeight: 600,
                            background: "none", border: "none", cursor: "pointer", padding: 0,
                          }}>
                            Read all reviews
                          </button>
                        </div>
                      </CardContent>
                    </Card>

                  </div>
                </div>
              </div>
            )}

            {/* ── Order History Tab ──────────────────────── */}
            {activeTab === "Order History" && (
              <UserOrderHistory userId={userId} />
            )}

            {/* ── Transaction Log Tab ────────────────────── */}
            {activeTab === "Transaction Log" && (
              <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
                <CardContent className="!p-8" style={{ textAlign: "center" }}>
                  <p style={{ color: "#64748b", fontSize: "14px" }}>Transaction Log coming soon.</p>
                </CardContent>
              </Card>
            )}

            {/* ── Documents Tab ──────────────────────────── */}
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