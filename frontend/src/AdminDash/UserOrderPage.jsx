// UserOrderHistory.jsx
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { getUserOrderHistory } from "./FakeUseDetaildApi";

const statusStyle = {
  "Completed": { background: "rgba(16,185,129,0.15)",  color: "#10b981" },
  "Cancelled": { background: "rgba(239,68,68,0.15)",   color: "#ef4444" },
  "Pending":   { background: "rgba(234,179,8,0.15)",   color: "#eab308" },
  "In Transit":{ background: "rgba(59,130,246,0.15)",  color: "#3b82f6" },
};

const routeDotColor = {
  "Completed": "#10b981",
  "Cancelled": "#ef4444",
  "Pending":   "#eab308",
  "In Transit":"#3b82f6",
};

export default function UserOrderHistory({ userId }) {
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [userId, status, search, page]);

  return (
    <div className="flex flex-col gap-4">

      {/* ── Filters ───────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">

          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={14} style={{
              position: "absolute", left: "11px", top: "50%",
              transform: "translateY(-50%)", color: "#64748b",
            }} />
            <input
              type="text"
              placeholder="Search by order ID, location..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{
                background: "#1e2536", border: "1px solid #33415580",
                borderRadius: "8px", color: "#f1f5f9",
                fontSize: "13px", height: "36px",
                padding: "0 12px 0 34px", width: "250px", outline: "none",
              }}
            />
          </div>

          {/* Status filter */}
          <Select onValueChange={(v) => { setStatus(v); setPage(1); }} defaultValue="All">
            <SelectTrigger className="!px-3 !py-4" style={{
              background: "#1e2536", border: "1px solid #33415580",
              borderRadius: "8px", color: "#94a3b8", fontSize: "13px",
            }}>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent style={{ background: "#1e2536", border: "1px solid #33415580" }}>
              {["All", "Completed", "Cancelled", "Pending", "In Transit"].map((s) => (
                <SelectItem className="!px-3 !py-2" key={s} value={s} style={{ color: "#f1f5f9", fontSize: "13px" }}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Export */}
        <Button className="!px-3 !py-4" variant="outline" style={{
          background: "transparent", border: "1px solid #33415580",
          borderRadius: "8px", color: "#94a3b8", fontSize: "13px",
        }}>
          ↓ Export CSV
        </Button>
      </div>

      {/* ── Table ─────────────────────────────────────────── */}
      <Card className="!pl-4" style={{
        background: "#161f2e", border: "1px solid #1e2d3d", borderRadius: "16px",
      }}>
        <CardContent style={{ padding: "0" }}>
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: "#1e2d3d" }}>
                {["Order ID", "Date", "Route", "Amount", "Status"].map((h) => (
                  <TableHead key={h} style={{ color: "#64748b", fontSize: "11px", fontWeight: 600 }}
                    className="uppercase tracking-wider">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center !text-slate-400 !py-10">Loading...</TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center !text-slate-400 !py-10">No orders found</TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} style={{ borderColor: "#1e2d3d" }} className="hover:!bg-white/5">

                    {/* Order ID */}
                    <TableCell>
                      <p className="text-white text-[13px] font-semibold">{order.id}</p>
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <p className="text-slate-300 text-[13px]">{order.date}</p>
                    </TableCell>

                    {/* Route */}
                    <TableCell className="!py-6">
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

                    {/* Status */}
                    <TableCell>
                      <span style={{
                        ...statusStyle[order.status],
                        borderRadius: "6px", padding: "3px 10px",
                        fontSize: "12px", fontWeight: 600,
                        display: "inline-flex", alignItems: "center", gap: "5px",
                      }}>
                        <span style={{
                          width: "6px", height: "6px", borderRadius: "50%",
                          background: statusStyle[order.status]?.color,
                        }} />
                        {order.status}
                      </span>
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
          <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            style={{ background: "#1e2536", border: "1px solid #33415580", borderRadius: "8px", color: "#94a3b8", width: "36px", height: "36px" }}>
            {"<"}
          </Button>

          {(() => {
            const pages = [];
            if (totalPages <= 5) for (let i = 1; i <= totalPages; i++) pages.push(i);
            else if (page <= 3) pages.push(1, 2, 3, "...", totalPages);
            else if (page >= totalPages - 2) pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
            else pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
            return pages.map((p, i) =>
              p === "..." ? (
                <span key={`d-${i}`} className="text-slate-400 text-[13px]">...</span>
              ) : (
                <Button key={p} onClick={() => setPage(p)} style={{
                  background: page === p ? "#2563eb" : "#1e2536",
                  border: "1px solid #33415580", borderRadius: "8px",
                  color: page === p ? "white" : "#94a3b8",
                  width: "36px", height: "36px", fontSize: "13px",
                  fontWeight: page === p ? 700 : 400,
                }}>{p}</Button>
              )
            );
          })()}

          <Button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ background: "#1e2536", border: "1px solid #33415580", borderRadius: "8px", color: "#94a3b8", width: "36px", height: "36px" }}>
            {">"}
          </Button>
        </div>
      </div>
    </div>
  );
}