import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Phone, AlertTriangle, ChevronRight,
  Shield, CheckCircle2, AlertCircle, 
  Gauge, Wrench, Handshake, Package, Siren,
  FileWarning, Ban, ShieldAlert, 
  TriangleAlert,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { submitSafetyReport, getSafetyCategories } from "./FakeApi";

// ── Zero Tolerance sub-page ──────────────────────────────
function ZeroTolerancePage({ onBack }) {
  const policies = [
    {
      id: "harassment",
      icon: <AlertTriangle size={18} color="#ef4444" />,
      iconBg: "rgba(239,68,68,0.12)",
      iconBorder: "rgba(239,68,68,0.25)",
      title: "Harassment & Discrimination",
      desc: "Any form of verbal or physical harassment, discrimination based on race, gender, religion, or orientation toward customers, partners, or staff.",
      tags: [{ label: "IMMEDIATE PERMANENT SUSPENSION", color: "#ef4444", bg: null, border: null }],
      note: null,
      accent:"#ef4444",
    },
    {
      id: "substance",
      icon: <Ban size={18} color="#ef4444" />,
      iconBg: "rgba(239,68,68,0.12)",
      iconBorder: "rgba(239,68,68,0.25)",
      title: "Substance Use",
      desc: "Possession or consumption of drugs or alcohol during active delivery runs or while operating delivery equipment.",
      tags: [{ label: "IMMEDIATE ACCOUNT TERMINATION", color: "#ef4444", bg: null, border: null }],
      note: "Subject to governing law enforcement",
      accent: "#ef4444",
    },
    {
      id: "fraud",
      icon: <Shield size={18} color="#ef4444" />,
      specialLayout: true, 
      iconBg: "rgba(239,68,68,0.12)",
      iconBorder: "rgba(239,68,68,0.25)",
      title: "Fraudulent Acts",
      desc: "Faking deliveries, GPS manipulation, account sharing/ID theft, inflating metrics through non-organic means.",
      tags: [
        { label: "STATUS: PERMANENT BAN", color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)" },
        { label: "IMPACT SCALE: FORFEITURE OF EARNINGS", color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.25)"  },
      ],
      note: null,
      accent: "#ef4444",
    },
    {
      id: "safety",
      icon: <ShieldAlert size={18} color="#ef4444" />,
      iconBg: "rgba(239,68,68,0.12)",
      iconBorder: "rgba(239,68,68,0.25)",
      title: "Safety Violations",
      desc: "Reckless driving, failure to use required safety equipment (helmet, vest), or ignoring traffic laws during delivery.",
      tags: [
        { label: "WARNING STRIKE",  color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)" },
        { label: "OR",  color: "#94A3B8", bg:null, border:null },
        { label: "30-DAY SUSPEND",      color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)"   },
      ],
      note: "Repeated infractions trigger a fine starting from 5,000 DZD",
      accent:"#ef4444",
    },
    {
      id: "tampering",
      icon: <Package size={18} color="#ef4444" />,
      iconBg: "rgba(239,68,68,0.12)",
      iconBorder: "rgba(239,68,68,0.25)",
      title: "Package Tampering",
      desc: "Opening, damaging, or removing items from customer packages. Total integrity of the cargo is required at all times.",
      tags: [{ label: "PERMANENT BAN", color: "#ef4444", bg: null, border: null }],
      note: "Applicable fines starting from 5,000 DZD depending on package value.",
      accent: "#ef4444",
    },
  ];

  return (
    <div className="!p-4 md:!p-6 !flex !flex-col !gap-6" style={{ background: "#0b1525", minHeight: "100%" }}>
      <button onClick={onBack}
        className="!flex !items-center !gap-2 !text-[13px] !text-slate-400 hover:!text-white !bg-transparent !border-none !cursor-pointer !w-fit !transition-colors">
        <ArrowLeft size={14} /> RETURN
      </button>
      <div>
        <h1 className="!text-[28px] md:!text-[34px] !font-extrabold !text-white !m-0 !mb-2">Zero Tolerance Policy</h1>
        <p className="!text-[13px] !text-slate-400 !m-0 !leading-relaxed !max-w-xl">
          Wassali Moderation maintains a strict environment to ensure the safety of our network and customer service.
          Violations of these core principles result in immediate actions.
        </p>
      </div>
      <div className="!flex !flex-col !gap-4">
        {policies.map(p => (
          <Card key={p.id} style={{
            background: "#111c2e",
            border: p.accent ? `1px solid ${p.accent}44` : "1px solid #1e2d3d",
            borderRadius: "14px",
          }}>
            <CardContent className="!p-5">
              <div className="!flex !items-center !gap-3 !mb-3">
                <div className="!w-9 !h-9 !rounded-xl !flex !items-center !justify-center !shrink-0"
                  style={{ background: p.iconBg, border: `1px solid ${p.iconBorder}` }}>
                  {p.icon}
                </div>
                <h3 className="!text-[15px] !font-bold !text-white !m-0">{p.title}</h3>
              </div>
              <p className="!text-[13px] !text-slate-400 !m-0 !mb-3 !leading-relaxed">{p.desc}</p>
              <div className={`!flex ${p.specialLayout ? "!gap-3" : "!flex-wrap !gap-2"} !mb-2`}>
       {p.tags.map((tag, i) => {
       if (p.specialLayout) {
      const [title, value] = tag.label.split(":");

      return (
        <div
          key={i}
          className="!flex-1 !rounded-xl !px-4 !py-3"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p className="!text-[10px] !text-slate-400 !mb-1">
            {title}
          </p>
          <p
            className="!text-[12px] !font-bold"
            style={{ color: tag.color }}
          >
            {value}
          </p>
        </div>
      );
    }
    return (
  <span
    key={i}
    className="!text-[10px] !font-bold !px-2.5 !py-1 !rounded-lg w-fit"
    style={{
      background: tag.bg,
      color: tag.color,
      border: `1px solid ${tag.border}`,
    }}
  >
    {tag.label}
  </span>
    );
  })}
</div>
              {p.note && (
                <p className="!text-[11px] !text-slate-500 !m-0 !flex !items-center !gap-1">
                  <CheckCircle2 size={11} color="#475569" /> {p.note}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="!text-center !text-[11px] !text-slate-700 !m-0">© 2026 Wassali Inc. All rights reserved.</p>
    </div>
  );
}

// ── Main SafetyGuidelinesPage ─────────────────────────────
export default function SafetyGuidelinesPage() {
  const navigate = useNavigate();
  const [showZeroTolerance, setShowZeroTolerance] = useState(false);
  const [categories,  setCategories]  = useState([]);
  const [category,    setCategory]    = useState("");
  const [email,       setEmail]       = useState("");
  const [description, setDescription] = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    getSafetyCategories().then(setCategories);
  }, []);

  async function handleSubmitReport() {
    setSubmitError("");
    if (!description.trim()) { setSubmitError("Please describe the incident."); return; }
    setSubmitting(true);
    try {
      await submitSafetyReport({ category, email, description });
      setSubmitted(true);
      setDescription(""); setEmail("");
      setTimeout(() => setSubmitted(false), 4000);
    } catch (e) {
      setSubmitError(e.message);
    } finally { setSubmitting(false); }
  }

  if (showZeroTolerance) return <ZeroTolerancePage onBack={() => setShowZeroTolerance(false)} />;

  return (
    <div className="!flex !flex-col" style={{ background: "#0b1525", minHeight: "100%" }}>

      {/* ══ HERO ══════════════════════════════════════ */}
      <div
        className="!relative !overflow-hidden !px-5 md:!px-8 !pt-8 !pb-10"
        style={{
          background: "linear-gradient(135deg, #060e1a 0%, #0a1628 40%, #0d1f3c 100%)",
          borderBottom: "1px solid #1e2d3d",
        }}
      >
        {/* Decorative animated glow blobs */}
        <div style={{
          position: "absolute", top: -80, right: -80, width: 340, height: 340,
          background: "radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -60, right: 120, width: 200, height: 200,
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />
        {/* Grid overlay */}
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none" }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <g key={i}>
              <line x1={`${i * 5}%`} y1="0" x2={`${i * 5}%`} y2="100%" stroke="#94a3b8" strokeWidth="1" />
              <line x1="0" y1={`${i * 5}%`} x2="100%" y2={`${i * 5}%`} stroke="#94a3b8" strokeWidth="1" />
            </g>
          ))}
        </svg>

        {/* Back nav */}
        <button
          onClick={() => navigate("/deliverer-dashboard/support")}
          className="!flex !items-center !gap-2 !text-[12px] !text-slate-500 hover:!text-white !bg-transparent !border-none !cursor-pointer !mb-6 !transition-colors !relative !z-10"
        >
          <ArrowLeft size={13} /> Support / Admin
        </button>

        <div className="!relative !z-10">
          <p className="!text-[10px] !font-bold !text-blue-500 !tracking-[0.2em] !m-0 !mb-3">
            PARTNER GUIDELINES / ALGIERS
          </p>
          <h1 className="!text-[36px] md:!text-[48px] !font-extrabold !m-0 !mb-4 !leading-tight">
            <span className="!text-white">Safety First,</span><br />
            <span className="!text-blue-400">Always Together.</span>
          </h1>
          <p className="!text-[13px] !text-slate-400 !m-0 !max-w-md !leading-relaxed">
            To our partners in Algiers, Oran, and Constantine: Your safety is our absolute priority.
            These guidelines ensure a professional environment for you and our customers.
          </p>
        </div>
      </div>

      <div className="!p-4 md:!p-6 !flex !flex-col !gap-5">

        {/* ══ ROW 1: Road Safety + Emergency Hotline ══ */}
        <div className="!grid !grid-cols-1 md:!grid-cols-[1fr_220px] !gap-5">

          {/* Road Safety Protocols */}
          <Card style={{ background: "#0f1b2d", border: "1px solid #1e3a5f", borderRadius: "14px" }}>
            <CardContent className="!p-5">
              <div className="!flex !items-center !justify-between !mb-5">
                <div className="!flex !items-center !gap-3">
                  <div className="!w-9 !h-9 !rounded-xl !flex !items-center !justify-center"
                    style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.25)" }}>
                    <Shield size={16} color="#3b82f6" />
                  </div>
                  <h3 className="!text-[15px] !font-bold !text-white !m-0">Road Safety Protocols</h3>
                </div>
                <span className="!text-[10px] !font-bold !px-2.5 !py-1 !rounded-full"
                  style={{ background: "rgba(37,99,235,0.15)", color: "#60a5fa", border: "1px solid rgba(37,99,235,0.3)" }}>
                  Mandatory
                </span>
              </div>
              <div className="!grid !grid-cols-1 sm:!grid-cols-3 !gap-3">
                {[
                  { icon: <Shield    size={20} color="#3b82f6" />, label: "Helmet Usage or Belt", desc: "Specific to vehicle type, helmets must be worn and fastened at all times while riding." },
                  { icon: <Gauge     size={20} color="#3b82f6" />, label: "Speed Limits",         desc: "Always obey local traffic and speed laws to avoid accidents and operational signaling fines." },
                  { icon: <Wrench    size={20} color="#3b82f6" />, label: "Maintenance",          desc: "Ensure your vehicle has working brakes, tires, and operational signaling lights." },
                ].map(item => (
                  <div key={item.label} className="!p-4 !rounded-xl"
                    style={{ background: "#0b1525", border: "1px solid #1a2f4e" }}>
                    <div className="!w-9 !h-9 !rounded-lg !flex !items-center !justify-center !mb-3"
                      style={{ background: "rgba(37,99,235,0.12)" }}>
                      {item.icon}
                    </div>
                    <p className="!text-[12px] !font-bold !text-white !m-0 !mb-1">{item.label}</p>
                    <p className="!text-[11px] !text-slate-500 !m-0 !leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Hotline */}
          <Card style={{
            background: "linear-gradient(160deg, #1a0a0a 0%, #0f1b2d 100%)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "14px",
          }}>
            <CardContent className="!p-5">
              <div className="!flex !items-center !gap-2 !mb-1">
                <div className="!w-8 !h-8 !rounded-lg !flex !items-center !justify-center"
                  style={{ background: "rgba(239,68,68,0.15)" }}>
                  <Siren size={15} color="#ef4444" />
                </div>
                <h3 className="!text-[14px] !font-bold !text-white !m-0">Emergency Hotline</h3>
              </div>
              <p className="!text-[11px] !text-slate-500 !m-0 !mb-4 !leading-snug">
                Immediate assistance for accidents or threats while on delivery.
              </p>
              <p className="!text-[52px] !font-extrabold !text-white !m-0 !leading-none !mb-1">1544</p>
              <p className="!text-[11px] !text-slate-500 !m-0 !mb-5">Available 24/7 to partners</p>
              <a
                href="tel:1544"
                className="!flex !items-center !justify-center !gap-2 !w-full !py-3 !rounded-xl !text-[13px] !font-bold !text-white !no-underline !transition-all"
                style={{ background: "#dc2626", boxShadow: "0 4px 14px rgba(220,38,38,0.4)" }}
              >
                <Phone size={14} /> CALL NOW
              </a>
            </CardContent>
          </Card>
        </div>

        {/* ══ ROW 2: Conduct + Accident Response ══════ */}
        <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5">

          {/* Conduct */}
          <Card style={{ background: "#0f1b2d", border: "1px solid #1e3a5f", borderRadius: "14px" }}>
            <CardContent className="!p-5">
              <div className="!flex !items-center !gap-2 !mb-4">
                <div className="!w-9 !h-9 !rounded-xl !flex !items-center !justify-center"
                  style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)" }}>
                  <Handshake size={16} color="#818cf8" />
                </div>
                <h3 className="!text-[15px] !font-bold !text-white !m-0">Conduct</h3>
              </div>
              <div className="!flex !flex-col !gap-3">
                {[
                  { icon: <Handshake size={14} color="#818cf8" />, title: "Respectful Interaction", desc: "Always address customers and staff in a professional and courteous tone at all interactions." },
                  { icon: <Package   size={14} color="#818cf8" />, title: "Safe Handling",          desc: "Keep and handle cargo clearly and properly in packaging." },
                ].map(item => (
                  <div key={item.title} className="!flex !items-start !gap-3 !p-4 !rounded-xl"
                    style={{ background: "#0b1525", border: "1px solid #1a2f4e" }}>
                    <div className="!w-7 !h-7 !rounded-lg !flex !items-center !justify-center !shrink-0"
                      style={{ background: "rgba(99,102,241,0.12)" }}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="!text-[12px] !font-bold !text-white !m-0 !mb-1">{item.title}</p>
                      <p className="!text-[11px] !text-slate-500 !m-0 !leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Accident Response Steps */}
          <Card style={{ background: "#0f1b2d", border: "1px solid #1e3a5f", borderRadius: "14px" }}>
            <CardContent className="!p-5">
              <div className="!flex !items-center !gap-2 !mb-5">
                <div className="!w-9 !h-9 !rounded-xl !flex !items-center !justify-center"
                  style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <Siren size={16} color="#f87171" />
                </div>
                <h3 className="!text-[15px] !font-bold !text-white !m-0">Accident Response Steps</h3>
              </div>
              <div className="!flex !flex-col sm:!flex-row !gap-4">
                {[
                  { step: 1, color: "#2563eb", title: "Ensure Safety",  desc: "Move yourself and the vehicle to a secure location if not already safe." },
                  { step: 2, color: "#2563eb", title: "Call Support",   desc: "Use the hotline 1544 or tap to contact the Wassali control centre directly." },
                  { step: 3, color: "#2563eb", title: "Document",       desc: "Take clear photos of any damages to the scene and cargo, safe to do so." },
                ].map(item => (
                  <div key={item.step} className="!flex-1 !p-3 !rounded-xl"
                    style={{ background: "#0b1525", border: "1px solid #1a2f4e" }}>
                    <div
                      className="!w-7 !h-7 !rounded-full !flex !items-center !justify-center !text-[12px] !font-extrabold !text-white !mb-3"
                      style={{ background: item.color, boxShadow: `0 0 0 3px rgba(37,99,235,0.2)` }}
                    >
                      {item.step}
                    </div>
                    <p className="!text-[12px] !font-bold !text-white !m-0 !mb-1">{item.title}</p>
                    <p className="!text-[11px] !text-slate-500 !m-0 !leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ══ Zero Tolerance Policy Banner ════════════ */}
        <div
          className="!rounded-xl !p-5 !cursor-pointer !transition-all hover:!brightness-110"
          style={{ background: "#0f1b2d", border: "1px solid rgba(239,68,68,0.35)" }}
          onClick={() => setShowZeroTolerance(true)}
        >
          <div className="!flex !items-center !justify-between !mb-3">
            <div className="!flex !items-center !gap-2">
              <TriangleAlert size={16} color="#ef4444" />
              <h3 className="!text-[15px] !font-bold !text-white !m-0">Zero Tolerance Policy</h3>
            </div>
            <ChevronRight size={16} color="#ef4444" />
          </div>
          <div className="!flex !flex-wrap !gap-5 !mb-3">
            {[
              { label: "Harassment",      icon: <AlertTriangle size={11} color="#ef4444" />, color: "#F1F5F9", bg: "#FFFFFF0D",  border: "rgba(239,68,68,0.25)"  },
              { label: "Substance Use",   icon: <Ban           size={11} color="#ef4444" />, color: "#F1F5F9", bg: "#FFFFFF0D",  border: "rgba(239,68,68,0.25)"  },
              { label: "Fraudulent Acts", icon: <FileWarning   size={11} color="#ef4444" />, color: "#F1F5F9", bg: "#FFFFFF0D", border: "rgba(239,68,68,0.25)" },
              { label: "Safety Violations",icon:<ShieldAlert   size={11} color="#ef4444" />, color: "#F1F5F9", bg: "#FFFFFF0D", border: "rgba(239,68,68,0.25)" },
            ].map(tag => (
              <span key={tag.label}
                className="!text-[11px] !font-semibold !pl-3 !pr-11 !py-2 !rounded-lg !flex !items-center !gap-4"
                style={{ background: tag.bg, color: tag.color, border: `1px solid ${tag.border}` }}>
                {tag.icon} {tag.label}
              </span>
            ))}
          </div>
          <div className="!flex !items-center !justify-between">
            <p className="!text-[11px] !text-slate-500 !m-0">
              Violations may result in fines starting from 5,000 DZD to permanent account suspension.
            </p>
            <button
              className="!text-[11px] !font-bold !text-blue-400 !bg-transparent !border-none !cursor-pointer !shrink-0 !ml-3 !whitespace-nowrap hover:!text-blue-300"
              onClick={e => { e.stopPropagation(); setShowZeroTolerance(true); }}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* ══ Safety Report Form ═══════════════════════ */}
        <div style={{
          background: "linear-gradient(160deg, #0b1525 0%, #0f1e38 100%)",
          border: "1px solid #1e3a5f",
          borderRadius: "14px",
          padding: "24px",
        }}>
          <div className="!flex !items-center !gap-2 !mb-1">
            <AlertCircle size={18} color="#3b82f6" />
            <h3 className="!text-[18px] !font-bold !text-white !m-0">Spotted a safety issue?</h3>
          </div>
          <p className="!text-[12px] !text-slate-500 !m-0 !mb-5 !leading-relaxed">
            Reporting incidents helps us make the platform safer for everyone.
            Use our anonymous reporting tool if you feel uncomfortable sharing directly.
          </p>

          <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-3 !mb-3">
            {/* Category */}
            <div>
              <label className="!block !text-[10px] !font-bold !text-slate-500 !mb-1.5 !tracking-widest">
                CATEGORY
              </label>
              <Select value={category} onValueChange={setCategory} >
                <SelectTrigger
                  className="!w-full !rounded-xl !text-[13px] !text-white !px-3"
                  style={{ background: "#0b1525", border: "1px solid #1e3a5f", height: 42 }}
                >
                  <SelectValue placeholder="Traffic Incident"  />
                </SelectTrigger>
                <SelectContent style={{ background: "#111c2e", border: "1px solid #1e2d3d" }} className={"!px-3"}>
                  {categories.map(c => (
                    <SelectItem key={c} value={c} style={{ color: "#f1f5f9", fontSize: "13px" }} >{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div>
              <label className="!block !text-[10px] !font-bold !text-slate-500 !mb-1.5 !tracking-widest">
                EMAIL (OPTIONAL)
              </label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="!w-full !px-4 !py-2.5 !rounded-xl !text-[13px] !text-white !outline-none"
                style={{ background: "#0b1525", border: "1px solid #1e3a5f", height: 42 }}
              />
            </div>
          </div>

          {/* Description */}
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe what happened..."
            rows={3}
            className="!w-full !px-4 !py-3 !rounded-xl !text-[13px] !text-white !outline-none !resize-none !mb-3"
            style={{ background: "#0b1525", border: "1px solid #1e3a5f" }}
          />

          {submitError && (
            <p className="!text-[12px] !text-red-400 !m-0 !mb-3 !flex !items-center !gap-1">
              <AlertCircle size={12} /> {submitError}
            </p>
          )}
          {submitted && (
            <p className="!text-[12px] !text-green-400 !m-0 !mb-3 !flex !items-center !gap-1">
              <CheckCircle2 size={12} /> Report submitted successfully. Thank you!
            </p>
          )}

          <button
            onClick={handleSubmitReport}
            disabled={submitting}
            className="!px-6 !py-2.5 !rounded-xl !text-[13px] !font-bold !text-white !cursor-pointer !flex !items-center !gap-2 !transition-all hover:!opacity-90"
            style={{
              background: "#2563eb",
              border: "none",
              boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting && (
              <span className="!w-4 !h-4 !border-2 !border-white/30 !border-t-white !rounded-full !animate-spin" />
            )}
            Submit Report
          </button>
        </div>

        <p className="!text-center !text-[11px] !text-slate-700 !m-0">
          © 2026 Wassali Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
}