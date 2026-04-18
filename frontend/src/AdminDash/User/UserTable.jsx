// UserTableSection.jsx
import { useState, useEffect } from "react";
import { Eye, Trash2, Search } from "lucide-react";
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
  getUsers, createUser, updateUserStatus,
  deleteUser, exportUsersCSV,
} from "./FakeApi";

import { useNavigate } from "react-router-dom";

// ── Status styles ────────────────────────────────────────────
const statusStyle = {
  "Active":   { background: "rgba(16,185,129,0.15)",  color: "#10b981" },
  "Inactive": { background: "rgba(148,163,184,0.15)", color: "#94a3b8" },
  "Banned":   { background: "rgba(239,68,68,0.15)",   color: "#ef4444" },
};

// ── Role styles ──────────────────────────────────────────────
const roleStyle = {
  "Deliverer": { background: "rgba(167,139,250,0.15)", color: "#a78bfa", dot: "#a78bfa" },
  "Customer":  { background: "rgba(96,165,250,0.15)",  color: "#60a5fa", dot: "#60a5fa" },
  "Admin":     { background: "rgba(251,146,60,0.15)",  color: "#fb923c", dot: "#fb923c" },
};

// ── Avatar gradients ─────────────────────────────────────────
const avatarGradient = {
  "Deliverer": "linear-gradient(135deg, #7c3aed, #a78bfa)",
  "Customer":  "linear-gradient(135deg, #2563eb, #60a5fa)",
  "Admin":     "linear-gradient(135deg, #ea580c, #fb923c)",
};

export default function UserTable() {

  // ── State ────────────────────────────────────────────────
  const [users, setUsers]           = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(true);
  const [role, setRole]             = useState("All Roles");
  const [status, setStatus]         = useState("All Statuses");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);

  const navigate = useNavigate();

  // ── 1. getUsers — fetch on filter/page change ────────────
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const result = await getUsers({ role, status, search, page, limit: 5 });
        setUsers(result.users);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [role, status, search, page]);

  // ── 2. createUser — triggered by + Add New User button ───
  async function handleCreateUser() {
    try {
      const newUser = await createUser({
        name: "New User", email: "new@example.com",
        avatar: "NU", role: "Customer",
      });
      setUsers((prev) => [newUser, ...prev.slice(0, 4)]);
      setTotal((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to create user:", err);
    }
  }

  // ── 3. updateUserStatus — triggered by status dropdown ───
  async function handleStatusChange(userId, newStatus) {
    try {
      await updateUserStatus(userId, newStatus);
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, status: newStatus } : u)
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  // ── 4. deleteUser — triggered by trash icon ──────────────
  async function handleDelete(userId) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setTotal((prev) => prev - 1);
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  }

  // ── 5. exportCSV ─────────────────────────────────────────
  async function handleExport() {
    const csv  = await exportUsersCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "users.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="!px-6 !pb-6 flex flex-col gap-4">

      {/* ── Filters Bar ───────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">

        <div className="flex items-center gap-3 flex-wrap">

          {/* Search input */}
          <div style={{ position: "relative" }}>
            <Search size={14} style={{
              position: "absolute", left: "11px", top: "50%",
              transform: "translateY(-50%)", color: "#64748b",
            }} />
            <input
              type="text"
              placeholder="Search users by name, email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{
                background: "#1e2536", border: "1px solid #33415580",
                borderRadius: "8px", color: "#f1f5f9",
                fontSize: "13px", height: "36px",
                padding: "0 12px 0 32px", width: "240px", outline: "none",
              }}
            />
          </div>

          {/* Role filter */}
          <Select onValueChange={(val) => { setRole(val); setPage(1); }} defaultValue="All Roles">
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
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent style={{ background: "#1e2536", border: "1px solid #33415580" }}>
              {["All Roles", "Admin", "Deliverer", "Customer"].map((r) => (
                <SelectItem className="!px-3 !py-2" key={r} value={r} style={{ color: "#f1f5f9", fontSize: "13px" }}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select onValueChange={(val) => { setStatus(val); setPage(1); }} defaultValue="All Statuses">
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
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent style={{ background: "#1e2536", border: "1px solid #33415580" }}>
              {["All Statuses", "Active", "Inactive", "Banned"].map((s) => (
                <SelectItem className="!px-3 !py-2" key={s} value={s} style={{ color: "#f1f5f9", fontSize: "13px" }}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right: Export + Add */}
        <div className="flex items-center gap-3">
          <Button
            className="!px-3 !py-4"
            variant="outline"
            onClick={handleExport}
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

          <Button
            onClick={handleCreateUser}
            style={{
              background: "#2563eb",
              color: "white",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              height: "36px",
              padding: "0 16px",
              border: "none",
            }}
          >
            + Add New User
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
                {["User", "Role", "Join Date", "Orders", "Status", "Actions"].map((h) => (
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
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center !text-slate-400 !py-10">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    style={{ borderColor: "#1e2d3d" }}
                    className="hover:!bg-white/5"                   
                  >

                    {/* User */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback
                            style={{ background: avatarGradient[user.role] || "linear-gradient(135deg,#334155,#475569)" }}
                            className="!text-white !text-[11px] !font-bold"
                          >
                            {user.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white text-[13px] font-semibold">{user.name}</p>
                          <p className="text-slate-500 text-[11px]">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role badge */}
                    <TableCell className="!py-6">
                      <span style={{
                        ...roleStyle[user.role],
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
                          background: roleStyle[user.role]?.dot, flexShrink: 0,
                        }} />
                        {user.role}
                      </span>
                    </TableCell>

                    {/* Join Date */}
                    <TableCell>
                      <p className="text-white text-[13px] font-semibold">{user.joinDate}</p>
                    </TableCell>

                    {/* Orders */}
                    <TableCell className="!text-white !font-semibold !text-[13px]">
                      {user.orders != null ? user.orders.toLocaleString() : "–"}
                    </TableCell>

                    {/* Status dropdown */}
                    <TableCell>
                      <Select
                        defaultValue={user.status}
                        onValueChange={(val) => handleStatusChange(user.id, val)}
                      >
                        <SelectTrigger
                          style={{
                            ...statusStyle[user.status],
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            padding: "3px 10px",
                            height: "28px",
                            width: "110px",
                          }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent style={{ background: "#1e2536", border: "1px solid #33415580" }}>
                          {["Active", "Inactive", "Banned"].map((s) => (
                            <SelectItem key={s} value={s} className="!px-3 !py-2" style={{ color: "#f1f5f9", fontSize: "12px" }}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/dashboard/users/${user.id}`)}
                          className="!text-slate-400 hover:!text-white hover:!bg-white/10 rounded-lg"
                        >
                          <Eye size={15}  />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.id)}
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
          <span className="text-white font-semibold">{total.toLocaleString()}</span> entries
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

          {/* Page numbers with ellipsis */}
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