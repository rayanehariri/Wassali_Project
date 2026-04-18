// VerificationTableSection.jsx
// ── CHANGE from original: import useNavigate, wire "View Documents" button ───
// Everything else is identical to your original Table.jsx.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";          // ← NEW
import { Search, Check, X, Car, CreditCard, Plane } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

import {
  getVerifications,
  updateVerificationStatus,
  exportVerificationsCSV,
  createVerification,
} from "./FakeApi";

// ── Status styles ────────────────────────────────────────────
const statusStyle = {
  "Pending":  { background: "rgba(245,158,11,0.15)",  color: "#f59e0b" },
  "Verified": { background: "rgba(16,185,129,0.15)",  color: "#10b981" },
  "Rejected": { background: "rgba(239,68,68,0.15)",   color: "#ef4444" },
};

// ── ID type icons ─────────────────────────────────────────────
const idTypeIcon = {
  "Driver's License": <Car        size={14} style={{ color: "#64748b" }} />,
  "National ID":      <CreditCard size={14} style={{ color: "#64748b" }} />,
  "Passport":         <Plane      size={14} style={{ color: "#64748b" }} />,
};

// ── Avatar gradient keyed by name ────────────────────────────
const avatarColors = [
  "linear-gradient(135deg, #2563eb, #60a5fa)",
  "linear-gradient(135deg, #7c3aed, #a78bfa)",
  "linear-gradient(135deg, #ea580c, #fb923c)",
  "linear-gradient(135deg, #0891b2, #22d3ee)",
  "linear-gradient(135deg, #16a34a, #4ade80)",
];
function avatarGradient(name) {
  return avatarColors[name.charCodeAt(0) % avatarColors.length];
}

export default function VerificationTable() {
  const navigate = useNavigate();                          // ← NEW

  // ── State ────────────────────────────────────────────────
  const [items, setItems]           = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(true);
  const [status, setStatus]         = useState("Pending");
  const [idType, setIdType]         = useState("All ID Types");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);

  // ── 1. getVerifications — fetch on filter/page change ────
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await getVerifications({ status, idType, search, page, limit: 5 });
        setItems(result.verifications);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch (err) {
        console.error("Failed to fetch verifications:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [status, idType, search, page]);

  // ── 2. createVerification — Manual Entry button ──────────
  async function handleManualEntry() {
    try {
      const newItem = await createVerification({
        deliverer: { name: "New Deliverer", email: "new@example.com", avatar: "ND" },
        idType: "National ID", idNumber: "00000000",
      });
      setItems((prev) => [newItem, ...prev.slice(0, 4)]);
      setTotal((p) => p + 1);
    } catch (err) {
      console.error("Failed to create verification:", err);
    }
  }

  // ── 3. updateVerificationStatus — approve/reject buttons ─
  async function handleApprove(id) {
    try {
      await updateVerificationStatus(id, "Verified");
      setItems((prev) => prev.map((v) => v.id === id ? { ...v, status: "Verified" } : v));
    } catch (err) {
      console.error("Failed to approve:", err);
    }
  }

  async function handleReject(id) {
    try {
      await updateVerificationStatus(id, "Rejected");
      setItems((prev) => prev.map((v) => v.id === id ? { ...v, status: "Rejected" } : v));
    } catch (err) {
      console.error("Failed to reject:", err);
    }
  }

  // ── 4. exportCSV ─────────────────────────────────────────
  async function handleExport() {
    const csv  = await exportVerificationsCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "verifications.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="!px-6 !pb-6 flex flex-col gap-4">

      {/* ── Filters Bar ───────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 !pb-2">

        <div className="flex items-center gap-3 flex-wrap">

          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={14} style={{
              position: "absolute", left: "11px", top: "50%",
              transform: "translateY(-50%)", color: "#64748b",
            }} />
            <input
              type="text"
              placeholder="Search by name, ID number..."
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
          <Select onValueChange={(v) => { setStatus(v); setPage(1); }} defaultValue="Pending">
            <SelectTrigger
              className="!px-3 !py-4"
              style={{
                background: "#1e2536", border: "1px solid #33415580",
                borderRadius: "8px", color: "#94a3b8", fontSize: "13px",
              }}
            >
              <SelectValue placeholder="Pending" />
            </SelectTrigger>
            <SelectContent style={{ background: "#1e2536", border: "1px solid #33415580" }}>
              {["All", "Pending", "Verified", "Rejected"].map((s) => (
                <SelectItem className="!px-3 !py-2" key={s} value={s} style={{ color: "#f1f5f9", fontSize: "13px" }}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* ID Type filter */}
          <Select onValueChange={(v) => { setIdType(v); setPage(1); }} defaultValue="All ID Types">
            <SelectTrigger
              className="!px-3 !py-4"
              style={{
                background: "#1e2536", border: "1px solid #33415580",
                borderRadius: "8px", color: "#94a3b8", fontSize: "13px",
              }}
            >
              <SelectValue placeholder="All ID Types" />
            </SelectTrigger>
            <SelectContent style={{ background: "#1e2536", border: "1px solid #33415580" }}>
              {["All ID Types", "Driver's License", "National ID", "Passport"].map((t) => (
                <SelectItem className="!px-3 !py-2" key={t} value={t} style={{ color: "#f1f5f9", fontSize: "13px" }}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range */}
          <Button
            className="!px-3 !py-4"
            variant="outline"
            style={{
              background: "#1e2536", border: "1px solid #33415580",
              borderRadius: "8px", color: "#94a3b8", fontSize: "13px",
            }}
          >
            📅 Date Range
          </Button>
        </div>

        {/* Right: Export + Manual Entry */}
        <div className="flex items-center gap-3">
          <Button
            className="!px-3 !py-4"
            variant="outline"
            onClick={handleExport}
            style={{
              background: "transparent", border: "1px solid #33415580",
              borderRadius: "8px", color: "#94a3b8", fontSize: "13px",
            }}
          >
            ↓ Export Data
          </Button>
          <Button
            onClick={handleManualEntry}
            style={{
              background: "#2563eb", border: "none",
              borderRadius: "8px", color: "white",
              fontSize: "13px", fontWeight: 600,
              height: "36px", padding: "0 16px",
            }}
          >
            + Manual Entry
          </Button>
        </div>
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
                {["Deliverer Name", "Submission Date", "ID Type", "ID Number", "Status", "Actions"].map((h) => (
                  <TableHead
                    key={h}
                    style={{ color: "#64748b", fontSize: "11px", fontWeight: 600 }}
                    className="uppercase tracking-wider"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center !text-slate-400 !py-10">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center !text-slate-400 !py-10">
                    No verifications found
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow
                    key={item.id}
                    style={{ borderColor: "#1e2d3d" }}
                    className="hover:!bg-white/5"
                  >

                    {/* Deliverer Name */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback
                            style={{ background: avatarGradient(item.deliverer.name) }}
                            className="!text-white !text-[11px] !font-bold"
                          >
                            {item.deliverer.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white text-[13px] font-semibold">{item.deliverer.name}</p>
                          <p className="text-slate-500 text-[11px]">{item.deliverer.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Submission Date */}
                    <TableCell className="!py-6">
                      <p className="text-white text-[13px] font-medium">{item.submissionDate}</p>
                      <p className="text-slate-500 text-[11px]">{item.submissionTime}</p>
                    </TableCell>

                    {/* ID Type */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {idTypeIcon[item.idType]}
                        <span className="text-slate-300 text-[13px]">{item.idType}</span>
                      </div>
                    </TableCell>

                    {/* ID Number */}
                    <TableCell className="!text-slate-300 !text-[13px] !font-mono">
                      {item.idNumber}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <span style={{
                        ...statusStyle[item.status],
                        borderRadius: "6px",
                        padding: "3px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                      }}>
                        <span style={{
                          width: "6px", height: "6px", borderRadius: "50%",
                          background: statusStyle[item.status]?.color,
                        }} />
                        {item.status}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center gap-2">

                        {/* ── Context button — navigates to DocViewerPage ── */}   {/* ← CHANGED */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/dashboard/verification/${item.id}`)}  
                          style={{
                            background: "transparent",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                            color: "#94a3b8",
                            fontSize: "12px",
                            fontWeight: 600,
                            height: "30px",
                            padding: "0 12px",
                            whiteSpace: "nowrap",
                            cursor: "pointer",
                          }}
                          className="hover:!bg-[#1e2d3d] hover:!text-white"
                        >
                          {item.status === "Verified" && "View Details"}
                          {item.status === "Rejected" && "Review"}
                          {item.status === "Pending"  && "View Documents"}
                        </Button>

                        {/* Approve — Pending only */}
                        {item.status === "Pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApprove(item.id)}
                            className="!text-emerald-400 hover:!text-emerald-300 hover:!bg-emerald-500/10 rounded-lg"
                            style={{ width: "30px", height: "30px" }}
                          >
                            <Check size={14} />
                          </Button>
                        )}

                        {/* Reject — Pending only */}
                        {item.status === "Pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReject(item.id)}
                            className="!text-red-400 hover:!text-red-300 hover:!bg-red-500/10 rounded-lg"
                            style={{ width: "30px", height: "30px" }}
                          >
                            <X size={14} />
                          </Button>
                        )}

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
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ background: "#1e2536", border: "1px solid #33415580", borderRadius: "8px", color: "#94a3b8", width: "36px", height: "36px" }}
          >
            {"<"}
          </Button>

          {(() => {
            const pages = [];
            if (totalPages <= 5) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else if (page <= 3) {
              pages.push(1, 2, 3, "...", totalPages);
            } else if (page >= totalPages - 2) {
              pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
            } else {
              pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
            }
            return pages.map((p, i) =>
              p === "..." ? (
                <span key={`dot-${i}`} className="text-slate-400 text-[13px]">...</span>
              ) : (
                <Button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    background: page === p ? "#2563eb" : "#1e2536",
                    border: "1px solid #33415580",
                    borderRadius: "8px",
                    color: page === p ? "white" : "#94a3b8",
                    width: "36px", height: "36px",
                    fontSize: "13px",
                    fontWeight: page === p ? 700 : 400,
                  }}
                >
                  {p}
                </Button>
              )
            );
          })()}

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