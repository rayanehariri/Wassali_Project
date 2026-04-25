

import { useState, useEffect } from "react";
import { Eye, Trash2,Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
 
// ── import ALL fake API functions ────────────────────────────
import {
  getOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from "./FakeOrderApi";
import { useNavigate } from "react-router-dom";
 
// ── Status styles ────────────────────────────────────────────
const statusStyle = {
  "In Transit": { background: "rgba(59,130,246,0.15)",  color: "#3b82f6" },
  "Pending":    { background: "rgba(234,179,8,0.15)",   color: "#eab308" },
  "Delivered":  { background: "rgba(16,185,129,0.15)",  color: "#10b981" },
  "Assigned":   { background: "rgba(99,102,241,0.15)",  color: "#6366f1" },
  "Cancelled":  { background: "rgba(239,68,68,0.15)",   color: "#ef4444" },
};
 
// ── Route dot colors ─────────────────────────────────────────
const routeDotColor = {
  "In Transit": "#3b82f6",
  "Pending":    "#eab308",
  "Delivered":  "#10b981",
  "Assigned":   "#6366f1",
  "Cancelled":  "#ef4444",
};
 
export default function OrdersTableSection() {
 
  // ── State ────────────────────────────────────────────────
  const [orders, setOrders]         = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(true);
  const [status, setStatus]         = useState("All");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);

  const navigate = useNavigate();
 
  // ── 1. getOrders — fetch on filter/page change ───────────
  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const result = await getOrders({ status, search, page, limit: 5 });
        setOrders(result.orders);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [status, search, page]);
 
  // ── 2. createOrder — triggered by + Create Order button ──
  async function handleCreateOrder() {
    try {
      const newOrder = await createOrder({
        customer:  { name: "New Customer", avatar: "NC" },
        deliverer: { name: "Unassigned",   avatar: "--", rating: null },
        route:     { from: "Enter pickup location", to: "Enter dropoff location" },
        amount:    "$0.00",
      });
      // add to top of list without refetching
      setOrders((prev) => [newOrder, ...prev.slice(0, 4)]);
      setTotal((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to create order:", err);
    }
  }
 
  // ── 3. updateOrderStatus — triggered by status dropdown ──
  async function handleStatusChange(mongoId, newStatus) {
    try {
      await updateOrderStatus(mongoId, newStatus);
      // update locally without refetching
      setOrders((prev) =>
        prev.map((o) => o._mongoId === mongoId ? { ...o, status: newStatus } : o)
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }
 
  // ── 4. deleteOrder — triggered by trash icon ─────────────
  async function handleDelete(mongoId) {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteOrder(mongoId);
      // remove from list locally
      setOrders((prev) => prev.filter((o) => o._mongoId !== mongoId));
      setTotal((prev) => prev - 1);
    } catch (err) {
      console.error("Failed to delete order:", err);
    }
  }
 
  return (
    <div className="!px-6 !pb-6 flex flex-col gap-4">
 
      {/* ── Filters Bar ───────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
 
        <div className="flex items-center gap-3 flex-wrap">
 
          {/* ← uses createOrder */}
          <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <Input
                      placeholder="Search orders..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      style={{
                        background: "#1e2536",
                        border: "1px solid #33415580",
                        borderRadius: "8px",
                        color: "#f1f5f9",
                        fontSize: "13px",
                        width: "220px",
                        paddingLeft: "32px",
                        height: "36px",
                      }}
                      className="!placeholder-slate-500 focus:!border-blue-500"
                    />
                  </div>
 
          {/* Status filter */}
          <Select
            onValueChange={(val) => { setStatus(val); setPage(1); }}
            defaultValue="All"
          >
            <SelectTrigger
              className="!px-3 !py-4"
              style={{
                background: "#1e2536",
                border: "1px solid #33415580",
                borderRadius: "8px",
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent  style={{ background: "#1e2536", border: "1px solid #33415580" }}>
              {["All", "Pending", "Assigned", "In Transit", "Delivered", "Cancelled"].map((s) => (
                <SelectItem   className="!px-3 !py-2" key={s} value={s} style={{ color: "#f1f5f9", fontSize: "13px" }}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
 
          {/* Date Range — static for now */}
          <Button
            className="!px-3 !py-4"
            variant="outline"
            style={{
              background: "#1e2536",
              border: "1px solid #33415580",
              borderRadius: "8px",
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            📅 Date Range
          </Button>
 
          {/* Location — static for now */}
          <Button
            className="!px-3 !py-4"
            variant="outline"
            style={{
              background: "#1e2536",
              border: "1px solid #33415580",
              borderRadius: "8px",
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            📍 Location
          </Button>
        </div>
 
        {/* Export CSV */}
        <Button
          className="!px-3 !py-4"
          variant="outline"
          style={{
            background: "transparent",
            border: "1px solid #33415580",
            borderRadius: "8px",
            color: "#94a3b8",
            fontSize: "13px",
          }}
        >
          ↓ Export CSV
        </Button>
      </div>
 
      {/* ── Table ─────────────────────────────────────────── */}
      <Card
        className="!pl-4"
        style={{
          background: "#161f2e",
          border: "1px solid #1e2d3d",
          borderRadius: "16px",
        }}
      >
        <CardContent style={{ padding: "0" }}>
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: "#1e2d3d" }}>
                {["Order ID", "Customer", "Deliverer", "Route", "Amount", "Status", "Action"].map((h) => (
                  <TableHead
                    key={h}
                    style={{ color: "#64748b", fontSize: "11px", fontWeight: 600 }}
                    className="uppercase tracking-wider "
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
 
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center !text-slate-400 !py-10">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center !text-slate-400 !py-10">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow
                    key={order._mongoId || order.id}
                    style={{ borderColor: "#1e2d3d" }}
                    className="hover:!bg-white/5"
                  >
                    {/* Order ID */}
                    <TableCell>
                      <p className="text-white text-[13px] font-semibold">{order.id}</p>
                      <p className="text-slate-500 text-[11px]">{order.date}</p>
                    </TableCell>
 
                    {/* Customer */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback
                            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
                            className="!text-white !text-[11px] !font-bold"
                          >
                            {order.customer.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-white text-[13px] font-medium">
                          {order.customer.name}
                        </span>
                      </div>
                    </TableCell>
 
                    {/* Deliverer */}
                    <TableCell className="!py-6">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback
                            style={{
                              background: order.deliverer.name === "Unassigned"
                                ? "#1e2d3d"
                                : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            }}
                            className="!text-white !text-[11px] !font-bold"
                          >
                            {order.deliverer.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white text-[13px] font-medium">
                            {order.deliverer.name}
                          </p>
                          {order.deliverer.rating && (
                            <p className="text-slate-400 text-[11px]">
                              ⭐ {order.deliverer.rating}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
 
                    {/* Route */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: routeDotColor[order.status] || "#64748b", flexShrink: 0 }} />
                          <span className="text-slate-300 text-[12px]">{order.route.from}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: routeDotColor[order.status] || "#64748b", flexShrink: 0 }} />
                          <span className="text-slate-300 text-[12px]">{order.route.to}</span>
                        </div>
                      </div>
                    </TableCell>
 
                    {/* Amount */}
                    <TableCell className="!text-white !font-semibold !text-[13px]">
                      {order.amount}
                    </TableCell>
 
                    {/* Status — ← uses updateOrderStatus on change */}
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(val) => handleStatusChange(order._mongoId, val)}
                      >
                        <SelectTrigger
                          style={{
                            ...statusStyle[order.status],
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            padding: "3px 10px",
                            height: "28px",
                            width: "130px",
                          }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent style={{ background: "#1e2536", border: "1px solid #33415580" }}>
                          {["Pending", "Assigned", "In Transit", "Delivered", "Cancelled"].map((s) => (
                            <SelectItem key={s} value={s}  className="!px-3 !py-2" style={{ color: "#f1f5f9", fontSize: "12px" }}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
 
                    {/* Action — ← uses deleteOrder on trash click */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          onClick={() => navigate(`/dashboard/order/${encodeURIComponent(order._mongoId || order.id)}`)}  
                          size="icon"
                          className="!text-slate-400 hover:!text-white hover:!bg-white/10 rounded-lg"
                        >
                          <Eye size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(order._mongoId)}
                          className="!text-slate-400 hover:!text-red-400 hover:!bg-red-500/10 rounded-lg"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </TableCell>
 
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
 
      {/* ── Pagination ────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-[13px]">
          Showing{" "}
          <span className="text-white font-semibold">{(page - 1) * 5 + 1}</span> to{" "}
          <span className="text-white font-semibold">{Math.min(page * 5, total)}</span> of{" "}
          <span className="text-white font-semibold">{total}</span> results
        </span>
 
        <div className="flex items-center gap-2">
          {/* Prev */}
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ background: "#1e2536", border: "1px solid #33415580", borderRadius: "8px", color: "#94a3b8", width: "36px", height: "36px" }}
          >
            {"<"}
          </Button>
 
          {/* Page numbers */}
          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              onClick={() => setPage(p)}
              style={{
                background: page === p ? "#2563eb" : "#1e2536",
                border: "1px solid #33415580",
                borderRadius: "8px",
                color: page === p ? "white" : "#94a3b8",
                width: "36px",
                height: "36px",
                fontSize: "13px",
                fontWeight: page === p ? 700 : 400,
              }}
            >
              {p}
            </Button>
          ))}
 
          {totalPages > 3 && (
            <span className="text-slate-400 text-[13px]">...</span>
          )}
 
          {/* Next */}
          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ background: "#1e2536", border: "1px solid #33415580", borderRadius: "8px", color: "#94a3b8", width: "36px", height: "36px" }}
          >
            {">"}
          </Button>
        </div>
      </div>
 
    </div>
  );
}