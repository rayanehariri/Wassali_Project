import { useState } from "react";
import {
  DollarSign, BarChart3, Clock, TrendingUp,
  CreditCard, Wallet, Activity, AlertCircle,
  Check, X, RefreshCw, ChevronRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

// ── Data ─────────────────────────────────────────────────────
const REVENUE_DATA = [
  { name: "Jun 1",  value: 2100  },
  { name: "Jun 5",  value: 3400  },
  { name: "Jun 10", value: 2800  },
  { name: "Jun 15", value: 5100  },
  { name: "Jun 20", value: 4800  },
  { name: "Jun 25", value: 6200  },
  { name: "Jul 1",  value: 7100  },
  { name: "Jul 5",  value: 8430  },
  { name: "Jul 10", value: 7800  },
  { name: "Jul 15", value: 9200  },
  { name: "Jul 20", value: 10400 },
];

const TRANSACTIONS = [
  { id: "#ORD-9281", date: "Jun 24, 2023", deliverer: "Alex M.",    delivererAvatar: "AM", amount: "$45.00",  status: "success"  },
  { id: "#ORD-9280", date: "Jun 24, 2023", deliverer: "Sarah J.",   delivererAvatar: "SJ", amount: "$120.50", status: "pending"  },
  { id: "#ORD-9279", date: "Jun 23, 2023", deliverer: "Emily R.",   delivererAvatar: "ER", amount: "$32.00",  status: "refunded" },
  { id: "#ORD-9278", date: "Jun 23, 2023", deliverer: "Michael T.", delivererAvatar: "MT", amount: "$89.00",  status: "success"  },
];

const PAYOUTS = [
  {
    name: "John D.", avatar: "JD", wallet: "$450.00",
    bank: "BEA Bank", holder: "John Doe", iban: "**** **** **** 4829",
    history: [
      { id: "#ORD-9285", date: "Jun 25", commission: "+$12.50" },
      { id: "#ORD-9282", date: "Jun 24", commission: "-$8.00"  },
      { id: "#ORD-9275", date: "Jun 23", commission: "+$15.20" },
      { id: "#ORD-9270", date: "Jun 22", commission: "+$9.50"  },
      { id: "#ORD-9268", date: "Jun 22", commission: "+$11.00" },
    ],
  },
  {
    name: "Lisa K.", avatar: "LK", wallet: "$1,200.00",
    bank: "CIB Algeria", holder: "Lisa Kamel", iban: "**** **** **** 7741",
    history: [
      { id: "#ORD-9284", date: "Jun 25", commission: "+$45.00" },
      { id: "#ORD-9281", date: "Jun 24", commission: "+$78.00" },
    ],
  },
];

const GAINS = [
  { label: "Commission",    pct: 65, color: "#3b82f6" },
  { label: "Service Fees",  pct: 25, color: "#10b981" },
  { label: "Delivery Fees", pct: 10, color: "#eab308" },
];

// ── Status badge ──────────────────────────────────────────────
const statusStyle = {
  success:  { background: "rgba(16,185,129,0.15)",  color: "#10b981" },
  pending:  { background: "rgba(234,179,8,0.15)",   color: "#eab308" },
  refunded: { background: "rgba(239,68,68,0.15)",   color: "#ef4444" },
};

function StatusBadge({ status }) {
  return (
    <Badge
      style={{
        ...statusStyle[status],
        border: "none",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: 600,
        padding: "3px 10px",
        display: "flex",
        alignItems: "center",
        gap: "5px",
        width: "fit-content",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusStyle[status]?.color, display: "inline-block" }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

// ── Stat card matching dashboard style ────────────────────────
function StatCard({ label, value, sub, color, glowColor, icon: Icon }) {
  return (
    <Card
      style={{
        background: `radial-gradient(circle at top right, ${glowColor} 0%, transparent 60%), #1E293B`,
        border: "1px solid #33415580",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderRadius: "12px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CardContent style={{ padding: "16px" }}>
        {/* Top row — icon + label */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-400 font-medium">{label}</span>
          <div style={{
            width: "32px", height: "32px", borderRadius: "9px",
            background: `${color}18`, border: `1px solid ${color}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon size={15} color={color} />
          </div>
        </div>
        {/* Value */}
        <p style={{ margin: "0 0 6px", fontSize: "28px", fontWeight: 800, color:"#FFFF", lineHeight: 1 }}>
          {value}
        </p>
        {/* Sub */}
        <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>{sub}</p>
        
      </CardContent>
    </Card>
  );
}

// ── Chart tooltip ─────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0f2236", border: "1px solid rgba(59,130,246,0.35)",
      borderRadius: "10px", padding: "10px 14px",
    }}>
      <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#93c5fd" }}>{label}</p>
      <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "white" }}>
        ${payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

// ── Payout Modal ──────────────────────────────────────────────
function PayoutModal({ payout, onClose, onConfirm }) {
  const [loading, setLoading]     = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setConfirmed(true);
    onConfirm(payout.name);
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div style={{
        background: "#0f1827",
        border: "1px solid rgba(59,130,246,0.2)",
        borderRadius: "20px",
        width: "700px",
        maxWidth: "95vw",
        display: "flex",
        overflow: "hidden",
        boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
      }}>

        {/* Left panel */}
        <div style={{ flex: 1, padding: "28px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-5 !py-3 !pb-7">
            <Avatar className="h-10 w-10">
              <AvatarFallback style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }} className="!text-white !font-bold !text-sm">
                {payout.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "white" }}>
                Payout Details — {payout.name}
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                Review deliverer earnings before processing.
              </p>
            </div>
          </div>

          {/* Wallet balance */}
          <div style={{
            background: "linear-gradient(135deg,rgba(59,130,246,0.2),rgba(37,99,235,0.1))",
            border: "1px solid rgba(59,130,246,0.25)",
            borderRadius: "14px", padding: "18px 20px", marginBottom: "20px",
          }}>
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={13} color="rgba(255,255,255,0.5)" />
              <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>Current Wallet Balance</p>
            </div>
            <p style={{ margin: "0 0 4px", fontSize: "32px", fontWeight: 800, color: "white" }}>{payout.wallet}</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#4ade80", display: "flex", alignItems: "center", gap: 4 }}>
              <TrendingUp size={12} /> Available
            </p>
          </div>

          {/* Earnings history */}
          <div className="flex items-center gap-2 mb-3">
            <Activity size={13} color="#60a5fa" />
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.65)" }}  className="!py-3">Earnings History</p>
          </div>
          <Card style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", overflow: "hidden" }} className="!px-3 !py-3">
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  {["ORDER ID", "DATE", "COMMISSION"].map((h) => (
                    <TableHead key={h} style={{ color: "rgba(255,255,255,0.28)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em" }}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody >
                {payout.history.map((h) => (
                  <TableRow key={h.id} style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                    <TableCell style={{ color: "#60a5fa", fontFamily: "monospace", fontSize: "12px" }}>{h.id}</TableCell>
                    <TableCell style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px" }}>{h.date}</TableCell>
                    <TableCell style={{ color: h.commission.startsWith("+") ? "#4ade80" : "#ef4444", fontWeight: 600, fontSize: "12px" }}>{h.commission}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Right panel */}
        <div style={{ width: "260px", padding: "28px", display: "flex", flexDirection: "column" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard size={14} color="#60a5fa" />
              <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "white" }}>Banking Information</h4>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="!text-slate-400 hover:!text-white !w-7 !h-7">
              <X size={13} />
            </Button>
          </div>

          {/* Bank fields */}
          {[
            { label: "BANK NAME",        value: payout.bank   },
            { label: "ACCOUNT HOLDER",   value: payout.holder },
            { label: "IBAN / ACCOUNT NUMBER", value: payout.iban },
          ].map((f) => (
            <div key={f.label} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "8px", padding: "10px 12px", marginBottom: "8px",
            }}>
              <p style={{ margin: "0 0 4px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", color: "rgba(255,255,255,0.3)" }}>{f.label}</p>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "white" }}>{f.value}</p>
            </div>
          ))}

          {/* Warning */}
          <div style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.22)",
            borderRadius: "10px", padding: "12px", fontSize: "12px",
            color: "#f59e0b", display: "flex", gap: "8px", marginBottom: "16px",
          }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            Please verify banking details before confirming. This action cannot be undone immediately.
          </div>

          <div style={{ flex: 1 }} />

          {/* Actions */}
          {confirmed ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Check size={28} color="#4ade80" style={{ margin: "0 auto 8px", display: "block" }} />
              <p style={{ color: "#4ade80", fontWeight: 700, fontSize: "14px", margin: 0 }}>Payout processed!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleConfirm}
                disabled={loading}
                style={{
                  background: loading ? "rgba(59,130,246,0.5)" : "#2563eb",
                  color: "white", border: "none", borderRadius: "10px",
                  height: "40px", fontSize: "13px", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: "6px",
                }}
              >
                {loading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <><Check size={14} /> Confirm Payout</>
                )}
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)",
                  borderRadius: "10px", height: "40px", fontSize: "13px",
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function FinancePage({ addToast }) {
  const [payoutFor, setPayoutFor]   = useState(null);
  const [chartRange, setChartRange] = useState("Monthly");

  return (
    <div className="flex flex-col w-full">

      {/* ── Top Bar ── */}
      <header style={{ background: "#0f1117", borderBottom: "1px solid #1e2d3d" }}
        className="flex items-center justify-between !px-6 !py-4">
        <h1 className="text-white font-bold text-[18px]">Financial Analytics</h1>
        <Button
          variant="outline"
        className="!px-6 !py-4"
          style={{
            background: "#1e2536", border: "1px solid #33415580",
            borderRadius: "8px", color: "#94a3b8", fontSize: "13px", height: "36px",
          }}
        >
          <Clock size={13} className="mr-2 " /> This Month
        </Button>
      </header>

      <div className="flex flex-col gap-5 !px-6 !py-5">

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Total Revenue"     value="$124,592" sub="↗ 12.5% vs last month" color="#60a5fa" glowColor="rgba(59,130,246,0.15)"  icon={DollarSign} />
          <StatCard label="Avg. Order Value"  value="$42.50"   sub="↗ 2.1% vs last month"  color="#a78bfa" glowColor="rgba(167,139,250,0.15)" icon={BarChart3}  />
          <StatCard label="Pending Payouts"   value="$4,200"   sub="8 deliverers awaiting" color="#f59e0b" glowColor="rgba(245,158,11,0.15)"  icon={Clock}      />
          <StatCard label="Commission Earned" value="$12,450"  sub="↗ 5.4% profit margin"  color="#4ade80" glowColor="rgba(74,222,128,0.15)"  icon={TrendingUp} />
        </div>

        {/* ── Revenue Chart ── */}
        <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "16px" }}>
          <CardContent style={{ padding: "24px" }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white font-bold text-[15px] mb-1">Revenue Overview</h3>
                <p className="text-slate-400 text-[12px]">Monthly revenue analytics & performance</p>
              </div>
              <div style={{
                display: "flex", gap: "4px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "8px", padding: "3px",
              }}>
                {["Daily", "Monthly"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setChartRange(t)}
                    style={{
                      borderRadius: "6px", padding: "5px 12px",
                      fontSize: "11px", fontWeight: 500, cursor: "pointer",
                      transition: "all 0.15s",
                      background: chartRange === t ? "rgba(59,130,246,0.2)" : "transparent",
                      border: chartRange === t ? "1px solid rgba(59,130,246,0.4)" : "1px solid transparent",
                      color: chartRange === t ? "#93c5fd" : "rgba(255,255,255,0.35)",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revenueGrad)"
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4, stroke: "#0b1929" }}
                  activeDot={{ r: 6, fill: "#60a5fa" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ── Bottom grid ── */}
        <div className="grid gap-4 " style={{ gridTemplateColumns: "1fr 300px" }}>

          {/* Recent Transactions */}
          <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "16px" }} className="!px-3 !py-3">
            <CardContent style={{ padding: "0" }}>
              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <h3 className="text-white font-bold text-[14px]">Recent Transactions</h3>
                <button style={{ background: "none", border: "none", color: "#60a5fa", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  View All <ChevronRight size={13} />
                </button>
              </div>
              <Table >
                <TableHeader>
                  <TableRow style={{ borderColor: "#1e2d3d" }}>
                    {["Order ID", "Date", "Deliverer", "Amount", "Status"].map((h) => (
                      <TableHead key={h} style={{ color: "#64748b", fontSize: "11px", fontWeight: 600 }} className="uppercase tracking-wider">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TRANSACTIONS.map((tx) => (
                    <TableRow key={tx.id} style={{ borderColor: "#1e2d3d" }} className="hover:!bg-white/5">
                      <TableCell style={{ color: "#60a5fa", fontFamily: "monospace", fontSize: "12px" }}>{tx.id}</TableCell>
                      <TableCell style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>{tx.date}</TableCell>
                      <TableCell className="!px-3 !py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }} className="!text-white !text-[10px] !font-bold">
                              {tx.delivererAvatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-white text-[13px]">{tx.deliverer}</span>
                        </div>
                      </TableCell>
                      <TableCell className="!text-white !font-semibold !text-[13px]">{tx.amount}</TableCell>
                      <TableCell><StatusBadge status={tx.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Right column */}
          <div className="flex flex-col gap-4">

            {/* Payout Management */}
            <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "16px" }}>
              <CardContent style={{ padding: "20px" }}>
                <h3 className="text-white font-bold text-[14px] mb-4">Payout Management</h3>
                <div className="flex flex-col gap-3">
                  {PAYOUTS.map((p) => (
                    <div key={p.name} style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "10px", padding: "10px 12px",
                    }}>
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }} className="!text-white !text-[11px] !font-bold">
                          {p.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 600, color: "white" }}>{p.name}</p>
                        <p style={{ margin: 0, fontSize: "11px", color: "#4ade80", fontWeight: 500 }}>Wallet: {p.wallet}</p>
                      </div>
                      <Button
                        onClick={() => setPayoutFor(p)}
                        style={{
                          background: "#2563eb", color: "white",
                          border: "none", borderRadius: "6px",
                          height: "28px", fontSize: "11px", fontWeight: 600,
                          padding: "0 12px",
                        }}
                      >
                        Payout
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  style={{
                    width: "100%", marginTop: "12px",
                    background: "rgba(59,130,246,0.1)",
                    border: "1px solid rgba(59,130,246,0.3)",
                    color: "#60a5fa", borderRadius: "8px",
                    height: "36px", fontSize: "12px", fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  }}
                >
                  <RefreshCw size={13} /> Process All Payouts
                </Button>
              </CardContent>
            </Card>

            {/* Monthly Gain */}
            <Card style={{ background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "16px" }}>
              <CardContent style={{ padding: "20px" }}>
                <h3 className="text-white font-bold text-[14px] mb-4">Monthly Gain</h3>
                <div className="flex flex-col gap-4">
                  {GAINS.map((g) => (
                    <div key={g.label}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: g.color, display: "inline-block" }} />
                          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>{g.label}</span>
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "white" }}>{g.pct}%</span>
                      </div>
                      {/* Progress bar */}
                      <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${g.pct}%`,
                          background: `linear-gradient(90deg, ${g.color}, ${g.color}99)`,
                          borderRadius: "999px",
                          transition: "width 0.6s ease",
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* ── Payout Modal ── */}
      {payoutFor && (
        <PayoutModal
          payout={payoutFor}
          onClose={() => setPayoutFor(null)}
          onConfirm={(name) => {
            addToast?.("success", "Payout Processed", `${name}'s payment sent.`);
            setPayoutFor(null);
          }}
        />
      )}
    </div>
  );
}