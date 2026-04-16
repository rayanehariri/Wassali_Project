
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle, ShoppingCart, CreditCard, Shield, UserCog,
  GraduationCap, Gift, ChevronRight, ChevronDown, X,
  CheckCircle2, AlertTriangle, Circle, ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSystemStatus, getTickets, getFAQs } from "./FakeApi";
import SupportChatWidget from "./Supportchatwidget";

// ── Status badge styles ───────────────────────────────────────────────────────
const statusStyle = {
  Resolved:    { background: "rgba(16,185,129,0.15)",  color: "#10b981", label: "Resolved"    },
  Open:        { background: "rgba(59,130,246,0.15)",  color: "#3b82f6", label: "Open"        },
  "In Progress":{ background: "rgba(234,179,8,0.15)",  color: "#eab308", label: "In Progress" },
};

// ── Category cards data ───────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "orders",    icon: <ShoppingCart size={22} color="#3b82f6" />, label: "Order Issues",          sub: "Missing items, damage or customer disputes"       },
  { id: "payout",    icon: <CreditCard   size={22} color="#3b82f6" />, label: "Payout Support",        sub: "Wallet balance, bank transfers and earnings"      },
  { id: "safety",    icon: <Shield       size={22} color="#3b82f6" />, label: "Vehicle & Safety",      sub: "Road incidents, insurance, and equipment"         },
  { id: "account",   icon: <UserCog      size={22} color="#3b82f6" />, label: "Account Access",        sub: "Profile updates, login issues and security"      },
  { id: "training",  icon: <GraduationCap size={22} color="#3b82f6" />, label: "Training & Onboarding", sub: "New deliverer guide and account activation"      },
  { id: "rewards",   icon: <Gift         size={22} color="#3b82f6" />, label: "Rewards & Incentives",  sub: "Performance bonuses and loyalty programs"        },
];

// ── All Tickets Modal ─────────────────────────────────────────────────────────
function AllTicketsModal({ onClose }) {
  const [tickets,    setTickets]    = useState([]);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => { load(page); }, [page]);

  async function load(p) {
    setLoading(true);
    try {
      const res = await getTickets({ page: p, limit: 5 });
      setTickets(res.tickets);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } finally { setLoading(false); }
  }

  return (
    <div className="!fixed !inset-0 !z-50 !flex !items-center !justify-center !px-4"
      style={{ background: "rgba(5,10,20,0.8)", backdropFilter: "blur(8px)" }}>
      <div className="!w-full !max-w-[520px] !rounded-2xl !overflow-hidden"
        style={{ background: "#111c2e", border: "1px solid #1e2d3d", boxShadow: "0 24px 60px rgba(0,0,0,0.7)" }}>

        {/* Header */}
        <div className="!flex !items-center !justify-between !px-6 !py-5"
          style={{ borderBottom: "1px solid #1e2d3d" }}>
          <div>
            <h3 className="!text-[17px] !font-bold !text-white !m-0">All Support Tickets</h3>
            <p className="!text-[12px] !text-slate-500 !m-0">Review and track your full support history</p>
          </div>
          <button onClick={onClose}
            className="!w-8 !h-8 !rounded-full !flex !items-center !justify-center !cursor-pointer !border-none"
            style={{ background: "#1a2744", border: "1px solid #1e2d3d" }}>
            <X size={14} color="#64748b" />
          </button>
        </div>

        {/* Table header */}
        <div className="!grid !px-6 !py-3 !gap-3"
          style={{ gridTemplateColumns: "1fr 2fr 1fr 1fr", borderBottom: "1px solid #1e2d3d" }}>
          {["TICKET ID", "SUBJECT", "STATUS", "LAST UPDATE"].map(h => (
            <p key={h} className="!text-[9px] !font-bold !text-slate-500 !m-0 !tracking-widest">{h}</p>
          ))}
        </div>

        {/* Rows */}
        <div style={{ minHeight: 200 }}>
          {loading ? (
            <div className="!flex !items-center !justify-center !py-12">
              <div className="!w-5 !h-5 !border-2 !border-blue-600/30 !border-t-blue-500 !rounded-full !animate-spin" />
            </div>
          ) : (
            tickets.map((t, i) => (
              <div key={t.id}
                className="!grid !px-6 !py-3.5 !gap-3 !items-center"
                style={{
                  gridTemplateColumns: "1fr 2fr 1fr 1fr",
                  borderBottom: i < tickets.length - 1 ? "1px solid #1e2d3d" : "none",
                }}>
                <span className="!text-[12px] !font-bold !text-blue-400">{t.id}</span>
                <div>
                  <p className="!text-[12px] !font-semibold !text-white !m-0 !truncate">{t.subject}</p>
                  <p className="!text-[10px] !text-slate-500 !m-0 !truncate">{t.description}</p>
                </div>
                <span
                  className="!text-[10px] !font-bold !px-2 !py-0.5 !rounded-md !w-fit"
                  style={statusStyle[t.status] ?? statusStyle["Open"]}
                >
                  {t.status}
                </span>
                <span className="!text-[11px] !text-slate-500">{t.updatedAt}</span>
              </div>
            ))
          )}
        </div>

        {/* Footer / pagination */}
        <div className="!flex !items-center !justify-between !px-6 !py-4"
          style={{ borderTop: "1px solid #1e2d3d" }}>
          <p className="!text-[11px] !text-slate-500 !m-0">
            Showing {(page - 1) * 5 + 1}–{Math.min(page * 5, total)} of {total} tickets
          </p>
          <div className="!flex !gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="!px-4 !py-1.5 !rounded-lg !text-[12px] !font-semibold !cursor-pointer !border-none !transition-all"
              style={{ background: "#1a2744", color: page === 1 ? "#334155" : "#94a3b8" }}>
              Previous
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="!px-4 !py-1.5 !rounded-lg !text-[12px] !font-semibold !cursor-pointer !border-none !transition-all"
              style={{ background: "#2563eb", color: "white" }}>
              Next Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FAQ Accordion ─────────────────────────────────────────────────────────────
function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="!rounded-xl !overflow-hidden !transition-all !cursor-pointer"
      style={{ background: "#111c2e", border: "1px solid #1e2d3d" }}
      onClick={() => setOpen(p => !p)}
    >
      <div className="!flex !items-center !justify-between !px-5 !py-4">
        <p className="!text-[14px] !font-semibold !text-white !m-0 !pr-4">{faq.question}</p>
        <ChevronDown size={16} color="#64748b"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
      </div>
      {open && (
        <div className="!px-5 !pb-4" style={{ borderTop: "1px solid #1e2d3d" }}>
          <p className="!text-[13px] !text-slate-400 !m-0 !pt-3 !leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  );
}

// ── Main SupportPage ──────────────────────────────────────────────────────────
export default function SupportPage({currentUser}) {
  const navigate = useNavigate();

  const [systemStatus,   setSystemStatus]   = useState(null);
  const [recentTickets,  setRecentTickets]  = useState([]);
  const [faqs,           setFaqs]           = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);


  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [status, tRes, faqData] = await Promise.all([
          getSystemStatus(),
          getTickets({ page: 1, limit: 5 }),
          getFAQs(),
        ]);
        setSystemStatus(status);
        setRecentTickets(tRes.tickets);
        setFaqs(faqData);
      } finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return (
    <div className="!flex !items-center !justify-center !h-full" style={{ background: "#0b1525" }}>
      <div className="!w-7 !h-7 !border-2 !border-blue-600/30 !border-t-blue-500 !rounded-full !animate-spin" />
    </div>
  );

  const overallStatus = Object.values(systemStatus ?? {}).some(s => s.status === "warning")
    ? "Partial Service" : "All Systems Operational";
  const isPartial = overallStatus === "Partial Service";

  return (
    <>
      {showAllTickets && <AllTicketsModal onClose={() => setShowAllTickets(false)} />}

      <div className="!p-4 md:!p-6 !flex !flex-col !gap-6" style={{ background: "#0b1525", minHeight: "100%" }}>

        {/* ══ HEADER ══ */}
        <div>
          <h1 className="!text-[28px] md:!text-[36px] !font-extrabold !text-white !m-0 !mb-1">
            How can we help today?
          </h1>
          <p className="!text-[13px] !text-slate-500 !m-0">Search documentation, delivery guides, or policies...</p>
        </div>

        {/* ══ MAIN GRID ══ */}
        <div className="!grid !grid-cols-1 lg:!grid-cols-[1fr_280px] !gap-6">

          {/* ── LEFT ── */}
          <div className="!flex !flex-col !gap-6">

            {/* Category grid */}
            <div className="!grid !grid-cols-2 sm:!grid-cols-3 !gap-3">
              {CATEGORIES.map(cat => (
                <div key={cat.id}
                  className="!flex !flex-col !gap-3 !p-4 !rounded-xl !cursor-pointer !transition-all"
                  style={{ background: "#111c2e", border: "1px solid #1e2d3d" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#2563eb44"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2d3d"}
                >
                  <div className="!w-10 !h-10 !rounded-xl !flex !items-center !justify-center"
                    style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.2)" }}>
                    {cat.icon}
                  </div>
                  <div>
                    <p className="!text-[13px] !font-bold !text-white !m-0 !mb-1">{cat.label}</p>
                    <p className="!text-[11px] !text-slate-500 !m-0 !leading-snug">{cat.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Support Tickets */}
            <div>
              <div className="!flex !items-center !justify-between !mb-3">
                <h2 className="!text-[18px] !font-bold !text-white !m-0">Recent Support Tickets</h2>
                <button onClick={() => setShowAllTickets(true)}
                  className="!text-[12px] !text-blue-400 hover:!text-blue-300 !bg-transparent !border-none !cursor-pointer !font-semibold !flex !items-center !gap-1">
                  View All Tickets <ChevronRight size={13} />
                </button>
              </div>

              <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
                <CardContent className="!p-0">
                  {/* Table header */}
                  <div className="!hidden sm:!grid !px-5 !py-3 !gap-3"
                    style={{ gridTemplateColumns: "1fr 2fr 1.2fr 1fr 0.8fr", borderBottom: "1px solid #1e2d3d" }}>
                    {["TICKET ID", "SUBJECT", "STATUS", "LAST UPDATE"].map(h => (
                      <p key={h} className="!text-[9px] !font-bold !text-slate-500 !m-0 !tracking-widest">{h}</p>
                    ))}
                  </div>

                  {recentTickets.map((t, i) => (
                    <div key={t.id}
                      className="!flex sm:!grid !flex-col sm:!flex-row !items-start sm:!items-center !px-5 !py-3.5 !gap-2 sm:!gap-3"
                      style={{
                        gridTemplateColumns: "1fr 2fr 1.2fr 1fr 0.8fr",
                        borderBottom: i < recentTickets.length - 1 ? "1px solid #1e2d3d" : "none",
                      }}>
                      <span className="!text-[11px] !font-bold !text-slate-400">{t.id}</span>
                      <div>
                        <p className="!text-[13px] !font-semibold !text-white !m-0">{t.subject}</p>
                        <p className="!text-[11px] !text-slate-500 !m-0 !truncate">{t.description}</p>
                      </div>
                      <span
                        className="!text-[10px] !font-bold !px-2.5 !py-0.5 !rounded-md !w-fit"
                        style={statusStyle[t.status] ?? statusStyle["Open"]}>
                        {t.status}
                      </span>
                      <span className="!text-[11px] !text-slate-500">{t.updatedAt}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="!text-[20px] !font-bold !text-white !m-0 !mb-4">Frequently Asked Questions</h2>
              <div className="!flex !flex-col !gap-2">
                {faqs.map(faq => <FAQItem key={faq.id} faq={faq} />)}
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="!flex !flex-col !gap-4">

            {/* Direct Help */}
            <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
              <CardContent className="!p-5">
                <h3 className="!text-[15px] !font-bold !text-white !m-0 !mb-4">Direct Help</h3>

                {/* Live Chat status */}
                <div className="!flex !items-center !justify-between !mb-3">
                  <div className="!flex !items-center !gap-2">
                    <MessageCircle size={14} color="#64748b" />
                    <span className="!text-[13px] !text-slate-300">Live Chat</span>
                  </div>
                  <span className="!text-[10px] !font-bold !px-2 !py-0.5 !rounded-full"
                    style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>
                    Online
                  </span>
                </div>

                {/* Start Live Chat button — disabled, UI only */}
                <button
                  className="!w-full !py-3 !rounded-xl !text-[13px] !font-bold !text-white !flex !items-center !justify-center !gap-2 !cursor-pointer "
                  style={{ background: "#0D59F2", border: "none", boxShadow: "0 4px 14px rgba(37,99,235,0.4)" }}
                   onClick={() => setChatOpen(true)}
                >
                  <MessageCircle size={14} /> Start Live Chat
                </button>

                {chatOpen && (
               <div style={{ position:"fixed", bottom:20, right:20, width:340, zIndex:50 }}>
               <SupportChatWidget
                  currentUser={currentUser}
                   onClose={() => setChatOpen(false)}
                   variant="deliverer"
                    />
                 </div>
                )}

                {/* Wait time */}
                <div className="!flex !items-center !justify-between !mt-3">
                  <span className="!text-[11px] !text-slate-500">Wait Time Estimate</span>
                  <span className="!text-[11px] !font-bold !text-white">~2 mins</span>
                </div>
                {/* Progress bar */}
                <div className="!w-full !h-1 !rounded-full !mt-1.5 !overflow-hidden" style={{ background: "#1e2d3d" }}>
                  <div className="!h-full !rounded-full" style={{ width: "30%", background: "#2563eb" }} />
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
              <CardContent className="!p-5">
                <div className="!flex !items-center !justify-between !mb-4">
                  <h3 className="!text-[15px] !font-bold !text-white !m-0">System Status</h3>
                  <span className="!text-[10px] !font-bold !px-2.5 !py-1 !rounded-full"
                    style={{
                      background: isPartial ? "rgba(234,179,8,0.15)"  : "rgba(16,185,129,0.15)",
                      color:      isPartial ? "#eab308"                : "#10b981",
                      border:     `1px solid ${isPartial ? "rgba(234,179,8,0.3)" : "rgba(16,185,129,0.3)"}`,
                    }}>
                    {overallStatus}
                  </span>
                </div>

                <div className="!flex !flex-col !gap-2.5">
                  {Object.values(systemStatus ?? {}).map(s => (
                    <div key={s.label} className="!flex !items-center !justify-between">
                      <div className="!flex !items-center !gap-2">
                        {s.status === "ok"
                          ? <CheckCircle2 size={14} color="#10b981" />
                          : <AlertTriangle size={14} color="#eab308" />}
                        <span className="!text-[12px] !text-slate-300">{s.label}</span>
                      </div>
                      <span className="!text-[11px] !font-semibold"
                        style={{ color: s.status === "ok" ? "#10b981" : "#eab308" }}>
                        {s.uptime}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Note */}
                {Object.values(systemStatus ?? {}).find(s => s.note) && (
                  <div className="!mt-3 !px-3 !py-2.5 !rounded-xl !text-[11px] !text-slate-400 !leading-relaxed"
                    style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.15)" }}>
                    *{Object.values(systemStatus).find(s => s.note)?.note}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Resources */}
            <div style={{ border: "1px solid #1e2d3d", borderRadius: "14px", background: "#111c2e", padding: "16px 20px" }}>
              <p className="!text-[10px] !font-bold !text-slate-500 !tracking-widest !m-0 !mb-3">QUICK RESOURCES</p>
              {[
                { label: "Safety and Community Guidelines 2026", path: "/deliverer-dashboard/support/safety" },
                { label: "Earnings & Tips Policy",               path: "/deliverer-dashboard/support/earnings-policy" },
              ].map(link => (
                <button key={link.label}
                  onClick={() => navigate(link.path)}
                  className="!w-full !flex !items-center !justify-between !py-3 !cursor-pointer !bg-transparent !border-none !text-left !transition-colors"
                  style={{ borderBottom: "1px solid #1e2d3d" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#60a5fa"}
                  onMouseLeave={e => e.currentTarget.style.color = ""}
                >
                  <span className="!text-[13px] !text-slate-300 !font-medium">{link.label}</span>
                  <ChevronRight size={14} color="#475569" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="!text-center !text-[11px] !text-slate-700 !m-0">© 2026 Wassali Inc. All rights reserved.</p>
      </div>
    </>
  );
}