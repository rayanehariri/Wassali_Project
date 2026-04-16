// ProfilePage.jsx — exact design match + full mobile responsive
import { useState, useEffect } from "react";
import {
  Mail, Phone, MapPin, Check, ShieldCheck,
  Edit2, RefreshCw, ChevronDown, Car, Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  getProfile, updatePricing,
  updateWorkingHours, toggleOnlineStatus,
} from "./FakeApi";

// M T W T F S S — matching design order
const DAYS_MAP = [
  { key: "M",  label: "M" },
  { key: "T1", label: "T" },
  { key: "W",  label: "W" },
  { key: "T2", label: "T" },
  { key: "F",  label: "F" },
  { key: "S1", label: "S" },
  { key: "S2", label: "S" },
];

const ACTIVE_DAYS_DEFAULT = ["M", "T1", "W", "T2", "F"];

// ── Pricing Field ─────────────────────────────────────────────────────────────
function PricingField({ label, field, value, onChange, editingField, setEditingField, onSave, saving }) {
  const isEditing = editingField === field;
  return (
    <div>
      <label className="!block !text-[10px] !font-bold !text-slate-500 !mb-1.5 !tracking-wider">{label}</label>
      <div className="!flex !items-center !px-4 !py-3 !rounded-xl"
        style={{ background: "#0f1b2d", border: "1px solid #1e3a5f" }}>
        {isEditing ? (
          <input
            autoFocus
            type="number"
            value={value}
            onChange={e => onChange(e.target.value)}
            onBlur={() => onSave(field)}
            onKeyDown={e => e.key === "Enter" && onSave(field)}
            className="!flex-1 !bg-transparent !text-white !text-[15px] !font-semibold !outline-none !border-none"
          />
        ) : (
          <span className="!flex-1 !text-[15px] !font-semibold !text-white">{value}</span>
        )}
        <button
          onClick={() => setEditingField(isEditing ? null : field)}
          className="!bg-transparent !border-none !cursor-pointer !transition-colors !p-0"
          style={{ color: isEditing ? "#3b82f6" : "#334155" }}
        >
          {saving === field
            ? <RefreshCw size={14} style={{ animation: "ppSpin 0.8s linear infinite" }} />
            : isEditing ? <Check size={14} color="#3b82f6" /> : <Edit2 size={13} />}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [profile,        setProfile]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(null);

  // Pricing
  const [baseFare,       setBaseFare]       = useState("");
  const [pricePerKm,     setPricePerKm]     = useState("");
  const [pricePerWeight, setPricePerWeight] = useState("");
  const [editingField,   setEditingField]   = useState(null);

  // Working hours
  const [activeDays,     setActiveDays]     = useState(ACTIVE_DAYS_DEFAULT);
  const [timeFrom,       setTimeFrom]       = useState("08:00");
  const [timeTo,         setTimeTo]         = useState("20:00");
  const [scheduleActive, setScheduleActive] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const p = await getProfile();
        setProfile(p);
        setBaseFare(String(p.pricing.baseFare));
        setPricePerKm(String(p.pricing.pricePerKm));
        setPricePerWeight(String(p.pricing.pricePerWeight));
        setActiveDays(p.workingHours?.activeDays ?? ACTIVE_DAYS_DEFAULT);
        setTimeFrom(p.workingHours?.from ?? "08:00");
        setTimeTo(p.workingHours?.to ?? "20:00");
        setScheduleActive(p.workingHours?.active ?? true);
      } finally { setLoading(false); }
    }
    load();
  }, []);

  async function handleSavePricing(field) {
    setSaving(field);
    await updatePricing({
      baseFare:       Number(baseFare),
      pricePerKm:     Number(pricePerKm),
      pricePerWeight: Number(pricePerWeight),
    });
    setProfile(prev => ({
      ...prev,
      pricing: { baseFare: Number(baseFare), pricePerKm: Number(pricePerKm), pricePerWeight: Number(pricePerWeight) },
    }));
    setEditingField(null);
    setSaving(null);
  }

  async function handleToggleDay(key) {
    const next = activeDays.includes(key)
      ? activeDays.filter(d => d !== key)
      : [...activeDays, key];
    setActiveDays(next);
    await updateWorkingHours({ activeDays: next });
  }

  async function handleTimeChange(from, to) {
    await updateWorkingHours({ from, to });
  }

  async function handleToggleSchedule(val) {
    setScheduleActive(val);
    await updateWorkingHours({ active: val });
  }

  async function handleToggleStatus() {
    setSaving("status");
    const res = await toggleOnlineStatus();
    setProfile(prev => ({ ...prev, status: res.status }));
    setSaving(null);
  }

  if (loading) return (
    <div className="!flex !items-center !justify-center !h-full" style={{ background: "#0b1525" }}>
      <div className="!flex !flex-col !items-center !gap-3">
        <div className="!w-7 !h-7 !border-2 !border-blue-600/30 !border-t-blue-500 !rounded-full !animate-spin" />
        <p className="!text-[13px] !text-slate-500 !m-0">Loading profile...</p>
      </div>
    </div>
  );

  const isOnline = profile?.status === "online";

  return (
    <div className="!p-4 md:!p-6 !flex !flex-col !gap-5" style={{ background: "#0b1525", minHeight: "100%" }}>
      <style>{`@keyframes ppSpin { to { transform: rotate(360deg); } }`}</style>

      {/* ══ HEADER ══ */}
      <div className="!flex !items-start !justify-between !flex-wrap !gap-3">
        <div>
          <h1 className="!text-[22px] md:!text-[26px] !font-extrabold !text-white !m-0 !mb-1">Partner Profile</h1>
          <p className="!text-[12px] md:!text-[13px] !text-slate-500 !m-0">Manage your account and Fleet assets.</p>
        </div>

        {/* Online Status toggle */}
        <button
          onClick={handleToggleStatus}
          disabled={saving === "status"}
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

      {/* ══ PROFILE HERO CARD ══ */}
      <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "16px" }}>
        <CardContent className="!p-5">
          <div className="!flex !flex-col sm:!flex-row !items-start sm:!items-center !gap-4">

            {/* Avatar with online dot */}
            <div className="!relative !shrink-0">
              <Avatar style={{ width: 88, height: 88, border: "2px solid #1e3a5f" }}>
                <AvatarImage src={profile?.avatar} alt={profile?.name} />
                <AvatarFallback style={{
                  background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
                  fontSize: "22px", fontWeight: 800, color: "white",
                }}>
                  {(profile?.name ?? "A").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="!absolute !bottom-1 !right-1 !w-4 !h-4 !rounded-full !border-2"
                style={{
                  background:  isOnline ? "#10b981" : "#475569",
                  borderColor: "#111c2e",
                  boxShadow:   isOnline ? "0 0 0 2px rgba(16,185,129,0.3)" : "none",
                }}
              />
            </div>

            {/* Name + badges + contact */}
            <div className="!flex-1 !w-full">
              {/* Name row */}
              <div className="!flex !flex-wrap !items-center !gap-2 !mb-3">
                <h2 className="!text-[20px] md:!text-[24px] !font-extrabold !text-white !m-0">{profile?.name}</h2>
                {/* ELITE PARTNER */}
                <span className="!flex !items-center !gap-1 !px-2.5 !py-0.5 !rounded-full !text-[10px] !font-bold !tracking-wide"
                  style={{ background: "rgba(37,99,235,0.18)", color: "#60a5fa", border: "1px solid rgba(37,99,235,0.35)" }}>
                  ✦ {(profile?.badge ?? "Elite Partner").toUpperCase()}
                </span>
                {/* VERIFIED */}
                {profile?.verified && (
                  <span className="!flex !items-center !gap-1 !px-2.5 !py-0.5 !rounded-full !text-[10px] !font-bold"
                    style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>
                    <ShieldCheck size={10} /> VERIFIED
                  </span>
                )}
              </div>

              {/* Contact pills */}
              <div className="!flex !flex-col sm:!flex-row !gap-3">
                {/* Email */}
                <div className="!flex !items-center !gap-3 !px-4 !py-2.5 !rounded-xl !flex-1"
                  style={{ background: "#0f1b2d", border: "1px solid #1e2d3d" }}>
                  <div className="!w-7 !h-7 !rounded-lg !flex !items-center !justify-center !shrink-0"
                    style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.2)" }}>
                    <Mail size={13} color="#3b82f6" />
                  </div>
                  <div className="!min-w-0">
                    <p className="!text-[9px] !font-bold !text-slate-500 !m-0 !tracking-widest">EMAIL ADDRESS</p>
                    <p className="!text-[12px] !text-white !font-medium !m-0 !truncate">{profile?.email}</p>
                  </div>
                </div>
                {/* Phone */}
                <div className="!flex !items-center !gap-3 !px-4 !py-2.5 !rounded-xl !flex-1"
                  style={{ background: "#0f1b2d", border: "1px solid #1e2d3d" }}>
                  <div className="!w-7 !h-7 !rounded-lg !flex !items-center !justify-center !shrink-0"
                    style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.2)" }}>
                    <Phone size={13} color="#3b82f6" />
                  </div>
                  <div className="!min-w-0">
                    <p className="!text-[9px] !font-bold !text-slate-500 !m-0 !tracking-widest">PHONE NUMBER</p>
                    <p className="!text-[12px] !text-white !font-medium !m-0">{profile?.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ══ ROW 2: Edit Pricing + Working Hours ══ */}
      <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5">

        {/* Edit Pricing */}
        <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "16px" }}>
          <CardContent className="!p-5">
            <div className="!flex !items-center !gap-2 !mb-5">
              <div className="!w-8 !h-8 !rounded-lg !flex !items-center !justify-center"
                style={{ background: "rgba(37,99,235,0.15)" }}>
                <Zap size={15} color="#3b82f6" />
              </div>
              <h3 className="!text-[15px] !font-bold !text-white !m-0">Edit Pricing</h3>
            </div>
            <div className="!flex !flex-col !gap-4">
              <PricingField label="BASE FARE (DZD)"
                field="baseFare" value={baseFare} onChange={setBaseFare}
                editingField={editingField} setEditingField={setEditingField}
                onSave={handleSavePricing} saving={saving} />
              <PricingField label="PRICE PER KM (DZD)"
                field="pricePerKm" value={pricePerKm} onChange={setPricePerKm}
                editingField={editingField} setEditingField={setEditingField}
                onSave={handleSavePricing} saving={saving} />
              <PricingField label="PRICE PER PACKAGE WEIGHT (DZD)"
                field="pricePerWeight" value={pricePerWeight} onChange={setPricePerWeight}
                editingField={editingField} setEditingField={setEditingField}
                onSave={handleSavePricing} saving={saving} />
            </div>
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "16px" }}>
          <CardContent className="!p-5">
            {/* Header */}
            <div className="!flex !items-center !justify-between !mb-5">
              <div className="!flex !items-center !gap-2">
                <div className="!w-8 !h-8 !rounded-lg !flex !items-center !justify-center"
                  style={{ background: "rgba(37,99,235,0.15)" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <h3 className="!text-[15px] !font-bold !text-white !m-0">Working Hours</h3>
              </div>
              {/* shadcn Switch */}
              <div className="!flex !items-center !gap-2">
                <span className="!text-[10px] !font-bold !text-slate-500 !tracking-widest">ACTIVE SCHEDULE</span>
                <Switch
                  checked={scheduleActive}
                  onCheckedChange={handleToggleSchedule}
                  className="!data-[state=checked]:!bg-blue-600"
                />
              </div>
            </div>

            {/* Weekly Schedule */}
            <p className="!text-[10px] !font-bold !text-slate-500 !m-0 !mb-3 !tracking-widest">WEEKLY SCHEDULE</p>
            <div className="!flex !gap-2 !mb-5 !flex-wrap">
              {DAYS_MAP.map(({ key, label }) => {
                const active = activeDays.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => handleToggleDay(key)}
                    className="!w-9 !h-9 !rounded-full !text-[12px] !font-bold !cursor-pointer !border-none !transition-all !flex !items-center !justify-center"
                    style={{
                      background: active ? "#2563eb"  : "#0f1b2d",
                      color:      active ? "white"    : "#334155",
                      boxShadow:  active ? "0 0 0 2px rgba(37,99,235,0.4)" : "none",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <Separator className="!bg-[#1e2d3d] !mb-4" />

            {/* Time Interval — shadcn Select */}
            <p className="!text-[10px] !font-bold !text-slate-500 !m-0 !mb-2 !tracking-widest">TIME INTERVAL</p>
            <div className="!flex !items-center !gap-3">
              <Select value={timeFrom} onValueChange={val => { setTimeFrom(val); handleTimeChange(val, timeTo); }}>
                <SelectTrigger
                  className="!flex-1 !rounded-xl !text-[13px] !font-semibold !text-white"
                  style={{ background: "#0f1b2d", border: "1px solid #1e3a5f", height: 40 }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: "#111c2e", border: "1px solid #1e2d3d" }}>
                  {Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`).map(t => (
                    <SelectItem key={t} value={t} style={{ color: "#f1f5f9", fontSize: "13px" }}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="!text-[13px] !text-slate-500 !font-medium !shrink-0">to</span>

              <Select value={timeTo} onValueChange={val => { setTimeTo(val); handleTimeChange(timeFrom, val); }}>
                <SelectTrigger
                  className="!flex-1 !rounded-xl !text-[13px] !font-semibold !text-white"
                  style={{ background: "#0f1b2d", border: "1px solid #1e3a5f", height: 40 }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: "#111c2e", border: "1px solid #1e2d3d" }}>
                  {Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`).map(t => (
                    <SelectItem key={t} value={t} style={{ color: "#f1f5f9", fontSize: "13px" }}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ══ ROW 3: Verification Docs + Fleet (left) | Location + Achievements + Stats (right) ══ */}
      <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5">

        {/* ── LEFT: Verification Docs + Fleet stacked ── */}
        <div className="!flex !flex-col !gap-5">

          {/* Verification Documents */}
          <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "16px" }}>
            <CardContent className="!p-5">
              <div className="!flex !items-center !gap-2 !mb-1">
                <div className="!w-8 !h-8 !rounded-lg !flex !items-center !justify-center"
                  style={{ background: "rgba(37,99,235,0.15)" }}>
                  <ShieldCheck size={15} color="#3b82f6" />
                </div>
                <div>
                  <h3 className="!text-[14px] !font-bold !text-white !m-0">Verification Documents</h3>
                  <p className="!text-[11px] !text-slate-500 !m-0">Official identification for transit authorization</p>
                </div>
              </div>

              <div className="!grid !grid-cols-2 !gap-4 !mt-4">
                {(profile?.documents ?? []).map(doc => (
                  <div key={doc.id} className="!rounded-xl !overflow-hidden"
                    style={{ border: "1px solid #1e3a5f" }}>
                    {/* Image area */}
                    <div className="!h-32 !flex !items-center !justify-center !overflow-hidden"
                      style={{ background: "linear-gradient(135deg, #0f1b2d, #0b1420)" }}>
                      {doc.imageUrl ? (
                        <img src={doc.imageUrl} alt={doc.label} className="!w-full !h-full !object-cover" />
                      ) : (
                        <div className="!flex !flex-col !items-center !gap-2">
                          <ShieldCheck size={32} color="#1e3a5f" />
                          <span className="!text-[10px] !text-slate-600">Document Preview</span>
                        </div>
                      )}
                    </div>
                    {/* Footer */}
                    <div className="!px-3 !py-2.5" style={{ background: "#0f1b2d" }}>
                      <div className="!flex !items-center !justify-between !mb-1">
                        <p className="!text-[12px] !font-semibold !text-white !m-0">{doc.label}</p>
                        <div className="!flex !gap-2">
                          <button className="!text-slate-500 hover:!text-slate-300 !bg-transparent !border-none !cursor-pointer !p-0">
                            <Edit2 size={11} />
                          </button>
                          <button className="!text-slate-500 hover:!text-slate-300 !bg-transparent !border-none !cursor-pointer !p-0">
                            <RefreshCw size={11} />
                          </button>
                        </div>
                      </div>
                      {doc.status === "verified" && (
                        <div className="!flex !items-center !gap-1">
                          <Check size={10} color="#10b981" />
                          <span className="!text-[10px] !font-bold !text-green-400">VERIFIED</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fleet Asset */}
          <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "16px" }}>
            <CardContent className="!p-5">
              <div className="!flex !items-center !justify-between !mb-4">
                <div>
                  <h3 className="!text-[14px] !font-bold !text-white !m-0">Fleet Asset</h3>
                  <p className="!text-[11px] !text-slate-500 !m-0">Primary delivery vehicle details</p>
                </div>
                <span className="!text-[11px] !font-bold !px-3 !py-1 !rounded-full"
                  style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>
                  {profile?.fleet?.status ?? "Active & Calibrated"}
                </span>
              </div>

              <div className="!flex !items-center !gap-4 !p-4 !rounded-xl"
                style={{ background: "#0f1b2d", border: "1px solid #1e3a5f" }}>
                {/* Vehicle image */}
                <div className="!rounded-xl !overflow-hidden !shrink-0 !flex !items-center !justify-center"
                  style={{ width: 96, height: 72, background: "#0b1420" }}>
                  {profile?.fleet?.imageUrl ? (
                    <img src={profile.fleet.imageUrl} alt={profile.fleet.name}
                      className="!w-full !h-full !object-cover" />
                  ) : (
                    <Car size={30} color="#1e3a5f" />
                  )}
                </div>
                {/* Details */}
                <div className="!flex-1">
                  <p className="!text-[16px] !font-extrabold !text-white !m-0 !mb-0.5">{profile?.fleet?.name}</p>
                  <p className="!text-[12px] !text-slate-500 !m-0 !mb-2">{profile?.fleet?.class}</p>
                  <span className="!text-[12px] !font-bold !px-3 !py-1 !rounded-lg"
                    style={{ background: "rgba(37,99,235,0.15)", color: "#60a5fa", border: "1px solid rgba(37,99,235,0.25)" }}>
                    {profile?.fleet?.plate}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT: Location + Achievements + Quick Stats stacked ── */}
        <div className="!flex !flex-col !gap-5">

          {/* Regular Location */}
          <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "16px", position: "relative", overflow: "hidden" }}>
            {/* Decorative radar graphic — top right corner */}
            <div style={{ position: "absolute", top: -16, right: -16, opacity: 0.06, pointerEvents: "none" }}>
              <svg width="130" height="130" viewBox="0 0 130 130" fill="none">
                <circle cx="65" cy="65" r="55" stroke="#3b82f6" strokeWidth="1.5"/>
                <circle cx="65" cy="65" r="35" stroke="#3b82f6" strokeWidth="1.5"/>
                <circle cx="65" cy="65" r="15" stroke="#3b82f6" strokeWidth="1.5"/>
                <line x1="65" y1="0"   x2="65" y2="130" stroke="#3b82f6" strokeWidth="1"/>
                <line x1="0"  y1="65"  x2="130" y2="65" stroke="#3b82f6" strokeWidth="1"/>
              </svg>
            </div>
            <CardContent className="!p-5">
              <div className="!w-9 !h-9 !rounded-xl !flex !items-center !justify-center !mb-3"
                style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.2)" }}>
                <MapPin size={16} color="#3b82f6" />
              </div>
              <p className="!text-[11px] !text-slate-500 !m-0 !mb-1">Regular Location</p>
              <p className="!text-[22px] !font-extrabold !text-white !m-0 !mb-3">{profile?.location}</p>
              <span className="!text-[10px] !font-bold !px-2.5 !py-1 !rounded-full"
                style={{ background: "rgba(37,99,235,0.15)", color: "#60a5fa", border: "1px solid rgba(37,99,235,0.25)" }}>
                {profile?.locationTag ?? "PRIMARY ZONE"}
              </span>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "16px" }}>
            <CardContent className="!p-5">
              <h3 className="!text-[14px] !font-bold !text-white !m-0 !mb-4">Recent Achievements</h3>
              <div className="!flex !flex-col !gap-3">
                {(profile?.achievements ?? []).map(a => (
                  <div key={a.id} className="!flex !items-center !gap-3 !p-3 !rounded-xl"
                    style={{ background: "#0f1b2d", border: "1px solid #1e3a5f" }}>
                    <div className="!w-9 !h-9 !rounded-xl !flex !items-center !justify-center !text-[18px] !shrink-0"
                      style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.15)" }}>
                      {a.icon}
                    </div>
                    <div>
                      <p className="!text-[12px] !font-bold !text-white !m-0">{a.label}</p>
                      <p className="!text-[11px] !text-slate-500 !m-0">{a.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "16px" }}>
            <CardContent className="!p-5">
              <h3 className="!text-[14px] !font-bold !text-white !m-0 !mb-4">Quick Stats</h3>
              <div className="!grid !grid-cols-2 !gap-3">
                <div className="!p-3 !rounded-xl !text-center"
                  style={{ background: "#0f1b2d", border: "1px solid #1e3a5f" }}>
                  <p className="!text-[26px] !font-extrabold !text-white !m-0 !leading-tight">
                    {profile?.quickStats?.totalTrips?.toLocaleString() ?? "1,284"}
                  </p>
                  <p className="!text-[10px] !text-slate-500 !m-0 !mt-1">Total Trips</p>
                </div>
                <div className="!p-3 !rounded-xl !text-center"
                  style={{ background: "#0f1b2d", border: "1px solid #1e3a5f" }}>
                  <p className="!text-[26px] !font-extrabold !text-white !m-0 !leading-tight">
                    {profile?.quickStats?.distance ?? "4.2k km"}
                  </p>
                  <p className="!text-[10px] !text-slate-500 !m-0 !mt-1">Distance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <p className="!text-center !text-[11px] !text-slate-700 !m-0">© 2026 Wassali Inc. All rights reserved.</p>
    </div>
  );
}