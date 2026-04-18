// EarningsPage.jsx — complete file with WithdrawalModal flow integrated
import { useState, useEffect } from "react";
import {
  TrendingUp, Star, Package, Plus, Eye, EyeOff,
  X, Check, Landmark, CreditCard, AlertCircle, ArrowLeft,
  ChevronRight, Zap, BarChart2, ChevronDown, RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  getEarningsStats, getBalance, getPayoutMethods,
  getPayoutPreferences, getEarningsGoal,
  withdrawFunds, removePayoutMethod,
  updatePayoutSchedule, updateAutoCashout,
  addPayoutMethod, editPayoutMethod,
  getWithdrawals, getWeeklyPerformance, getFinancialAnalytics,
  getRecentTransactions,
} from "./FakeApi";

// ── useBreakpoint ─────────────────────────────────────────────────────────────
function useBreakpoint() {
  const [bp, setBp] = useState({ isMobile: false, isTablet: false });
  useEffect(() => {
    const check = () => setBp({
      isMobile: window.innerWidth < 640,
      isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
    });
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return bp;
}

const statusStyle = {
  "Completed":  { background: "rgba(16,185,129,0.15)",  color: "#10b981" },
  "Processing": { background: "rgba(234,179,8,0.15)",   color: "#eab308" },
  "Failed":     { background: "rgba(239,68,68,0.15)",   color: "#ef4444" },
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0f1b2d", border: "1px solid #1e2d3d", borderRadius: "10px", padding: "8px 14px" }}>
      <p style={{ color: "#64748b", fontSize: "11px", margin: "0 0 2px" }}>{label}</p>
      <p style={{ color: "#3b82f6", fontSize: "14px", fontWeight: 700, margin: 0 }}>{payload[0].value} DZD</p>
    </div>
  );
}

function ModalOverlay({ children }) {
  return (
    <div className="!fixed !inset-0 !z-50 !flex !items-center !justify-center !p-4"
      style={{ background: "rgba(5,10,20,0.78)", backdropFilter: "blur(8px)" }}>
      {children}
    </div>
  );
}

function RequestStep({ balance, methods, onConfirm, onClose }) {
  const rawNum = parseFloat((balance?.available ?? "842.50").replace(/[^0-9.]/g, "")) || 0;
  const [amount, setAmount] = useState(rawNum.toFixed(2));
  const [selectedMethod, setSelectedMethod] = useState(methods?.[0] ?? null);
  const [showMethods, setShowMethods] = useState(false);
  const fee = (parseFloat(amount || 0) * 0.01).toFixed(2);
  const netPayout = Math.max(0, parseFloat(amount || 0) - parseFloat(fee)).toFixed(2);
  const canSubmit = parseFloat(amount) > 0 && !!selectedMethod;

  return (
    <ModalOverlay>
      <div className="!w-full !rounded-2xl !overflow-visible" style={{ background: "#0b1525", border: "1px solid #1e2d3d", boxShadow: "0 24px 60px rgba(0,0,0,0.6)", maxWidth: "440px" }}>
        <div className="!flex !items-center !justify-between !px-6 !pt-6 !pb-5" style={{ borderBottom: "1px solid #1e2d3d" }}>
          <div>
            <h2 className="!text-[17px] !font-extrabold !text-white !m-0">Request Withdrawal</h2>
            <p className="!text-[12px] !text-slate-500 !m-0 !mt-0.5">Transfer earnings to your payout method</p>
          </div>
          <button onClick={onClose} className="!w-8 !h-8 !rounded-full !flex !items-center !justify-center !cursor-pointer !border-none" style={{ background: "#111c2e", border: "1px solid #1e2d3d" }}>
            <X size={14} color="#64748b" />
          </button>
        </div>
        <div className="!px-6 !py-5 !flex !flex-col !gap-4">
          <div className="!text-center !py-1">
            <p className="!text-[10px] !font-bold !text-slate-500 !tracking-widest !m-0 !mb-2">AVAILABLE BALANCE</p>
            <p className="!text-[36px] !font-extrabold !text-white !m-0 !leading-none">{balance?.available ?? "842.50 DZD"}</p>
          </div>
          <div>
            <div className="!flex !items-center !justify-between !mb-2">
              <label className="!text-[11px] !font-bold !text-slate-500 !tracking-widest">WITHDRAWAL AMOUNT</label>
              <button onClick={() => setAmount(rawNum.toFixed(2))} className="!text-[11px] !text-blue-400 !font-semibold !bg-transparent !border-none !cursor-pointer">MAX</button>
            </div>
            <div className="!flex !items-center !gap-3 !px-4 !py-3 !rounded-xl" style={{ background: "#111c2e", border: "1px solid #1e2d3d" }}>
              <span className="!text-[13px] !text-slate-500 !font-semibold !shrink-0">DZD</span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="!flex-1 !bg-transparent !border-none !outline-none !text-[16px] !font-bold !text-white" placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className="!block !text-[11px] !font-bold !text-slate-500 !tracking-widest !mb-2">PAYOUT METHOD</label>
            <div className="!relative">
              <button onClick={() => setShowMethods(p => !p)} className="!w-full !flex !items-center !justify-between !px-4 !py-3 !rounded-xl !cursor-pointer !border-none" style={{ background: "#111c2e", border: "1px solid #1e2d3d" }}>
                <div className="!flex !items-center !gap-3">
                  <div className="!w-8 !h-8 !rounded-lg !flex !items-center !justify-center" style={{ background: "rgba(37,99,235,0.15)" }}>
                    {selectedMethod?.type === "card" ? <CreditCard size={14} color="#3b82f6" /> : <Landmark size={14} color="#3b82f6" />}
                  </div>
                  <span className="!text-[13px] !text-white !font-semibold">{selectedMethod?.name ?? "Select method"}</span>
                </div>
                <ChevronDown size={16} color="#64748b" style={{ transform: showMethods ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {showMethods && methods?.length > 0 && (
                <div className="!absolute !top-full !left-0 !right-0 !mt-1 !rounded-xl !overflow-hidden !z-10" style={{ background: "#111c2e", border: "1px solid #1e2d3d", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                  {methods.map((m, i) => (
                    <button key={m.id} onClick={() => { setSelectedMethod(m); setShowMethods(false); }} className="!w-full !flex !items-center !gap-3 !px-4 !py-3 !cursor-pointer !border-none !text-left" style={{ background: selectedMethod?.id === m.id ? "rgba(37,99,235,0.1)" : "transparent", borderBottom: i < methods.length - 1 ? "1px solid #1e2d3d" : "none" }}>
                      <div className="!w-7 !h-7 !rounded-lg !flex !items-center !justify-center" style={{ background: "rgba(37,99,235,0.12)" }}>
                        {m.type === "card" ? <CreditCard size={13} color="#3b82f6" /> : <Landmark size={13} color="#3b82f6" />}
                      </div>
                      <span className="!text-[13px] !text-white !font-medium">{m.name}</span>
                      <span className="!text-[12px] !text-slate-500">{m.detail}</span>
                      {m.isDefault && <span className="!ml-auto !text-[10px] !font-bold !px-2 !py-0.5 !rounded-full" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>DEFAULT</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="!rounded-xl !px-4 !py-3 !flex !flex-col !gap-2" style={{ background: "#111c2e", border: "1px solid #1e2d3d" }}>
            <div className="!flex !items-center !justify-between">
              <span className="!text-[12px] !text-slate-500">Processing Fee (1%)</span>
              <span className="!text-[12px] !text-slate-400">- {fee} DZD</span>
            </div>
            <div style={{ borderTop: "1px solid #1e2d3d", paddingTop: 8 }} className="!flex !items-center !justify-between">
              <span className="!text-[13px] !font-bold !text-white">Total Payout</span>
              <span className="!text-[14px] !font-extrabold !text-blue-400">{netPayout} DZD</span>
            </div>
          </div>
          <button onClick={() => onConfirm({ amount, method: selectedMethod, fee, netPayout })} disabled={!canSubmit} className="!w-full !py-3.5 !rounded-xl !text-[14px] !font-bold !text-white !cursor-pointer !flex !items-center !justify-center" style={{ background: "#2563eb", border: "none", boxShadow: "0 4px 16px rgba(37,99,235,0.45)", opacity: canSubmit ? 1 : 0.5 }}>
            Request Withdrawal →
          </button>
          <button onClick={onClose} className="!w-full !py-2 !rounded-xl !text-[13px] !font-semibold !text-slate-400 !cursor-pointer !border-none" style={{ background: "transparent" }}>Cancel</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function ProcessingStep({ method }) {
  return (
    <ModalOverlay>
      <div className="!w-full !rounded-2xl !p-10 !text-center" style={{ background: "#0b1525", border: "1px solid #1e2d3d", maxWidth: "380px" }}>
        <div className="!relative !mx-auto !mb-6" style={{ width: 72, height: 72 }}>
          <svg width="72" height="72" style={{ position: "absolute", top: 0, left: 0, animation: "wSpin 1.2s linear infinite" }}>
            <circle cx="36" cy="36" r="30" fill="none" stroke="#1e2d3d" strokeWidth="4" />
            <circle cx="36" cy="36" r="30" fill="none" stroke="#2563eb" strokeWidth="4" strokeDasharray="80 110" strokeLinecap="round" />
          </svg>
          <div className="!absolute !inset-0 !flex !items-center !justify-center !rounded-full" style={{ background: "rgba(37,99,235,0.12)", margin: 10 }}>
            <Landmark size={22} color="#3b82f6" />
          </div>
        </div>
        <h2 className="!text-[20px] !font-extrabold !text-white !m-0 !mb-3">Withdrawal Processing</h2>
        <p className="!text-[13px] !text-slate-400 !m-0 !leading-relaxed">Transferring to <span className="!text-white !font-semibold">{method?.name ?? "account"}</span>. Usually 1–3 business days.</p>
        <style>{`@keyframes wSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </ModalOverlay>
  );
}

function SuccessStep({ amount, method, onClose }) {
  return (
    <ModalOverlay>
      <div className="!w-full !rounded-2xl !p-10 !text-center !relative" style={{ background: "#0b1525", border: "1px solid #1e2d3d", maxWidth: "380px" }}>
        <button onClick={onClose} className="!absolute !top-4 !right-4 !w-7 !h-7 !rounded-full !flex !items-center !justify-center !cursor-pointer !border-none" style={{ background: "#111c2e", border: "1px solid #1e2d3d" }}><X size={12} color="#64748b" /></button>
        <div className="!relative !mx-auto !mb-6" style={{ width: 80, height: 80 }}>
          <div style={{ position: "absolute", inset: -8, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)" }} />
          <div style={{ width: 80, height: 80, borderRadius: "50%", border: "2px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(16,185,129,0.12)", border: "1.5px solid rgba(16,185,129,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={26} color="#10b981" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <h2 className="!text-[20px] !font-extrabold !text-white !m-0 !mb-3">Withdrawal Successful!</h2>
        <p className="!text-[13px] !text-slate-400 !m-0 !leading-relaxed !mb-6">Request for <span className="!text-white !font-bold">{amount} DZD</span> confirmed. Funds arrive in <span className="!text-white !font-semibold">{method?.name ?? "account"}</span> within 1–3 business days.</p>
        <button onClick={onClose} className="!w-full !py-3 !rounded-xl !text-[14px] !font-bold !text-white !cursor-pointer !flex !items-center !justify-center" style={{ background: "#2563eb", border: "none" }}>Back to Earnings</button>
      </div>
    </ModalOverlay>
  );
}

function FailedStep({ onRetry, onClose }) {
  return (
    <ModalOverlay>
      <div className="!w-full !rounded-2xl !p-10 !text-center !relative" style={{ background: "#0b1525", border: "1px solid #1e2d3d", maxWidth: "380px" }}>
        <button onClick={onClose} className="!absolute !top-4 !right-4 !w-7 !h-7 !rounded-full !flex !items-center !justify-center !cursor-pointer !border-none" style={{ background: "#111c2e", border: "1px solid #1e2d3d" }}><X size={12} color="#64748b" /></button>
        <div className="!relative !mx-auto !mb-6" style={{ width: 80, height: 80 }}>
          <div style={{ position: "absolute", inset: -8, borderRadius: "50%", background: "radial-gradient(circle, rgba(239,68,68,0.18) 0%, transparent 70%)" }} />
          <div style={{ width: 80, height: 80, borderRadius: "50%", border: "2px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(239,68,68,0.1)", border: "1.5px solid rgba(239,68,68,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={26} color="#ef4444" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <h2 className="!text-[20px] !font-extrabold !text-white !m-0 !mb-3">Withdrawal Failed</h2>
        <p className="!text-[13px] !text-slate-400 !m-0 !leading-relaxed !mb-6">Unable to process your request. Check your balance or payout method and try again.</p>
        <div className="!flex !flex-col !gap-3">
          <button onClick={onRetry} className="!w-full !py-3 !rounded-xl !text-[14px] !font-bold !cursor-pointer !flex !items-center !justify-center !gap-2" style={{ background: "transparent", border: "1px solid rgba(239,68,68,0.5)", color: "#ef4444" }}><RefreshCw size={14} /> Try Again</button>
          <button onClick={onClose} className="!w-full !py-2.5 !rounded-xl !text-[13px] !font-semibold !text-slate-500 !cursor-pointer !border-none" style={{ background: "transparent" }}>Dismiss</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function WithdrawalFlow({ balance, methods, onClose }) {
  const [step, setStep] = useState("request");
  const [withdrawData, setWithdrawData] = useState(null);

  async function handleConfirm(data) {
    setWithdrawData(data);
    setStep("processing");
    try {
      const result = await withdrawFunds({ amount: data.amount, methodId: data.method?.id });
      await new Promise(r => setTimeout(r, 1800));
      setStep(result?.success ? "success" : "failed");
    } catch {
      await new Promise(r => setTimeout(r, 1800));
      setStep("failed");
    }
  }

  if (step === "request")    return <RequestStep    balance={balance} methods={methods} onConfirm={handleConfirm} onClose={onClose} />;
  if (step === "processing") return <ProcessingStep method={withdrawData?.method} />;
  if (step === "success")    return <SuccessStep    amount={withdrawData?.netPayout} method={withdrawData?.method} onClose={onClose} />;
  if (step === "failed")     return <FailedStep     onRetry={() => setStep("request")} onClose={onClose} />;
  return null;
}

function EditBankModal({ method, onSave, onClose }) {
  const [holderName, setHolderName] = useState(method?.name ?? "");
  const [accountNumber, setAccountNumber] = useState("");
  const [showNumber, setShowNumber] = useState(false);
  const [saving, setSaving] = useState(false);
  const isCard = method?.type === "card";

  async function handleSave() {
    setSaving(true);
    await editPayoutMethod(method.id, { holderName, accountNumber });
    setSaving(false);
    onSave();
  }

  return (
    <ModalOverlay>
      <div className="!w-full !rounded-2xl !p-6" style={{ background: "#0b1525", border: "1px solid #1e2d3d", maxWidth: "420px" }}>
        <div className="!flex !items-center !justify-between !mb-5">
          <div className="!flex !items-center !gap-2">
            {isCard ? <CreditCard size={18} color="#3b82f6" /> : <Landmark size={18} color="#3b82f6" />}
            <span className="!text-[15px] !font-bold !text-white">{isCard ? "Edit Debit Card" : "Edit Bank Account"}</span>
          </div>
          <button onClick={onClose} className="!text-slate-400 !bg-transparent !border-none !cursor-pointer"><X size={18} /></button>
        </div>
        <div className="!flex !items-start !gap-2 !p-3 !rounded-xl !mb-4" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
          <AlertCircle size={14} color="#3b82f6" className="!mt-0.5 !shrink-0" />
          <p className="!text-[12px] !text-slate-400 !m-0">Changes will hold withdrawals for 48 hours for security.</p>
        </div>
        <div className="!flex !flex-col !gap-4">
          <div>
            <label className="!block !text-[11px] !font-semibold !tracking-[.07em] !text-slate-500 !mb-2">{isCard ? "CARDHOLDER NAME" : "ACCOUNT HOLDER NAME"}</label>
            <input value={holderName} onChange={e => setHolderName(e.target.value)} className="!w-full !rounded-xl !px-4 !py-3 !text-[14px] !text-white !outline-none" style={{ background: "#111c2e", border: "1px solid #1e2d3d" }} />
          </div>
          <div>
            <label className="!block !text-[11px] !font-semibold !tracking-[.07em] !text-slate-500 !mb-2">{isCard ? "CARD NUMBER" : "ACCOUNT NUMBER"}</label>
            <div className="!relative">
              <input type={showNumber ? "text" : "password"} value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder={isCard ? "0000 0000 0000 0000" : "12345678832"} className="!w-full !rounded-xl !px-4 !py-3 !text-[14px] !text-white !outline-none !pr-11" style={{ background: "#111c2e", border: "1px solid #1e2d3d" }} />
              <button onClick={() => setShowNumber(p => !p)} className="!absolute !right-3 !top-1/2 !-translate-y-1/2 !text-slate-400 !bg-transparent !border-none !cursor-pointer">{showNumber ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>
        </div>
        <div className="!flex !gap-3 !mt-5">
          <button onClick={onClose} className="!flex-1 !py-2.5 !rounded-xl !text-[13px] !font-semibold !text-slate-400 !cursor-pointer" style={{ background: "transparent", border: "1px solid #1e2d3d" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} className="!flex-1 !py-2.5 !rounded-xl !text-[13px] !font-semibold !text-white !cursor-pointer !flex !items-center !justify-center !gap-2" style={{ background: "#2563eb", border: "none" }}>
            {saving ? <span className="!w-4 !h-4 !border-2 !border-white/30 !border-t-white !rounded-full !animate-spin" /> : <><Check size={14} /> Save Changes</>}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function AddPayoutModal({ onSave, onClose }) {
  const [methodType, setMethodType] = useState("bank");
  const [holderName, setHolderName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastDigits, setLastDigits] = useState("");

  async function handleLink() {
    setSaving(true);
    const result = await addPayoutMethod({ type: methodType, holderName, accountNumber: methodType === "bank" ? accountNumber : cardNumber, routingNumber, expiry, cvc });
    setLastDigits(methodType === "bank" ? accountNumber.slice(-4) : cardNumber.slice(-4));
    setSaving(false);
    setSuccess(true);
    setTimeout(() => { onSave(result); }, 1500);
  }

  if (success) return (
    <ModalOverlay>
      <div className="!w-full !rounded-2xl !p-8 !text-center" style={{ background: "#0b1525", border: "1px solid #1e2d3d", maxWidth: "380px" }}>
        <div className="!w-16 !h-16 !rounded-full !flex !items-center !justify-center !mx-auto !mb-5" style={{ background: "rgba(37,99,235,0.15)", border: "2px solid #2563eb" }}><Check size={28} color="#3b82f6" /></div>
        <h3 className="!text-[18px] !font-bold !text-white !mb-2">Payment Method Linked!</h3>
        <p className="!text-[13px] !text-slate-400 !mb-6">Your {methodType === "bank" ? "bank account" : "debit card"} ending in <span className="!text-white !font-semibold">•••• {lastDigits}</span> has been added.</p>
        <button onClick={onClose} className="!w-full !py-3 !rounded-xl !text-[14px] !font-semibold !text-white !cursor-pointer" style={{ background: "#2563eb", border: "none" }}>← Back to Earnings</button>
      </div>
    </ModalOverlay>
  );

  return (
    <ModalOverlay>
      <div className="!w-full !rounded-2xl !p-6" style={{ background: "#0b1525", border: "1px solid #1e2d3d", maxWidth: "460px", maxHeight: "90vh", overflowY: "auto" }}>
        <div className="!flex !justify-end !mb-2">
          <button onClick={onClose} className="!text-slate-400 !bg-transparent !border-none !cursor-pointer"><X size={18} /></button>
        </div>
        <div className="!text-center !mb-5">
          <div className="!w-12 !h-12 !rounded-full !flex !items-center !justify-center !mx-auto !mb-3" style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.3)" }}>
            {methodType === "bank" ? <Landmark size={20} color="#3b82f6" /> : <CreditCard size={20} color="#3b82f6" />}
          </div>
          <h3 className="!text-[17px] !font-bold !text-white !mb-1">Add Payout Method</h3>
          <p className="!text-[13px] !text-slate-400">Select how you want to receive your earnings.</p>
        </div>
        <div className="!grid !grid-cols-2 !gap-3 !mb-5">
          {[
            { type: "bank", label: "Bank Account", sub: "1–3 business days", icon: <Landmark size={22} /> },
            { type: "card", label: "Debit Card",   sub: "Instant transfer",  icon: <CreditCard size={22} /> },
          ].map(opt => (
            <button key={opt.type} onClick={() => setMethodType(opt.type)}
              className="!flex !flex-col !items-center !gap-2 !py-4 !rounded-xl !cursor-pointer !border !relative"
              style={{ background: methodType === opt.type ? "rgba(37,99,235,0.12)" : "#111c2e", borderColor: methodType === opt.type ? "#2563eb" : "#1e2d3d", color: methodType === opt.type ? "#60a5fa" : "#64748b" }}>
              {methodType === opt.type && <div className="!absolute !top-2 !right-2 !w-5 !h-5 !rounded-full !flex !items-center !justify-center" style={{ background: "#2563eb" }}><Check size={11} color="white" /></div>}
              {opt.icon}
              <span className="!text-[13px] !font-semibold">{opt.label}</span>
              <span className="!text-[11px] !text-slate-500">{opt.sub}</span>
            </button>
          ))}
        </div>
        <div className="!flex !flex-col !gap-3 !mb-4">
          {methodType === "bank" ? (
            <>
              <div><label className="!block !text-[11px] !font-semibold !tracking-[.07em] !text-slate-500 !mb-2">ACCOUNT HOLDER NAME</label><input value={holderName} onChange={e => setHolderName(e.target.value)} placeholder="e.g. Alex Mitchell" className="!w-full !rounded-xl !px-4 !py-3 !text-[13px] !text-white !outline-none" style={{ background: "#111c2e", border: "1px solid #1e2d3d" }} /></div>
              <div className="!grid !grid-cols-2 !gap-3">
                <div><label className="!block !text-[11px] !font-semibold !tracking-[.07em] !text-slate-500 !mb-2">ROUTING NUMBER</label><input value={routingNumber} onChange={e => setRoutingNumber(e.target.value)} placeholder="9 digits" className="!w-full !rounded-xl !px-4 !py-3 !text-[13px] !text-white !outline-none" style={{ background: "#111c2e", border: "1px solid #1e2d3d" }} /></div>
                <div><label className="!block !text-[11px] !font-semibold !tracking-[.07em] !text-slate-500 !mb-2">ACCOUNT NUMBER</label><input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="10–12 digits" className="!w-full !rounded-xl !px-4 !py-3 !text-[13px] !text-white !outline-none" style={{ background: "#111c2e", border: "1px solid #1e2d3d" }} /></div>
              </div>
            </>
          ) : (
            <>
              <div><label className="!block !text-[11px] !font-semibold !tracking-[.07em] !text-slate-500 !mb-2">CARDHOLDER NAME</label><input value={holderName} onChange={e => setHolderName(e.target.value)} placeholder="e.g. Alex Mitchell" className="!w-full !rounded-xl !px-4 !py-3 !text-[13px] !text-white !outline-none" style={{ background: "#111c2e", border: "1px solid #1e2d3d" }} /></div>
              <div><label className="!block !text-[11px] !font-semibold !tracking-[.07em] !text-slate-500 !mb-2">CARD NUMBER</label><input value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" className="!w-full !rounded-xl !px-4 !py-3 !text-[13px] !text-white !outline-none" style={{ background: "#111c2e", border: "1px solid #1e2d3d" }} /></div>
              <div className="!grid !grid-cols-2 !gap-3">
                <div><label className="!block !text-[11px] !font-semibold !tracking-[.07em] !text-slate-500 !mb-2">EXPIRY DATE</label><input value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/YY" className="!w-full !rounded-xl !px-4 !py-3 !text-[13px] !text-white !outline-none" style={{ background: "#111c2e", border: "1px solid #1e2d3d" }} /></div>
                <div><label className="!block !text-[11px] !font-semibold !tracking-[.07em] !text-slate-500 !mb-2">CVC</label><input value={cvc} onChange={e => setCvc(e.target.value)} placeholder="123" className="!w-full !rounded-xl !px-4 !py-3 !text-[13px] !text-white !outline-none" style={{ background: "#111c2e", border: "1px solid #1e2d3d" }} /></div>
              </div>
            </>
          )}
        </div>
        <div className="!flex !items-start !gap-2 !mb-4">
          <AlertCircle size={13} color="#3b82f6" className="!mt-0.5 !shrink-0" />
          <p className="!text-[11px] !text-slate-500 !m-0">Your banking information is encrypted and securely stored.</p>
        </div>
        <div className="!flex !gap-3">
          <button onClick={onClose} className="!flex-1 !py-3 !rounded-xl !text-[13px] !font-semibold !text-slate-300 !cursor-pointer" style={{ background: "transparent", border: "1px solid #1e2d3d" }}>Cancel</button>
          <button onClick={handleLink} disabled={saving} className="!flex-1 !py-3 !rounded-xl !text-[13px] !font-bold !text-white !cursor-pointer !flex !items-center !justify-center !gap-2" style={{ background: "#2563eb", border: "none" }}>
            {saving ? <span className="!w-4 !h-4 !border-2 !border-white/30 !border-t-white !rounded-full !animate-spin" /> : <>{methodType === "bank" ? "Link Account →" : "Link Card →"}</>}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function TransactionDetailModal({ trx, onClose }) {
  if (!trx) return null;
  return (
    <ModalOverlay>
      <div className="!w-full !rounded-2xl !p-6" style={{ background: "#0b1525", border: "1px solid #1e2d3d", maxWidth: "380px" }}>
        <div className="!flex !items-center !justify-between !mb-5">
          <div><h3 className="!text-[15px] !font-bold !text-white !m-0">Transaction Details</h3><p className="!text-[12px] !text-slate-500 !m-0">#{trx.id}</p></div>
          <div className="!flex !items-center !gap-3">
            <span style={{ ...statusStyle[trx.status], borderRadius: "6px", padding: "3px 10px", fontSize: "12px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusStyle[trx.status]?.color }} />{trx.status}
            </span>
            <button onClick={onClose} className="!text-slate-400 !bg-transparent !border-none !cursor-pointer"><X size={16} /></button>
          </div>
        </div>
        <div className="!flex !flex-col !gap-0" style={{ borderTop: "1px solid #1e2d3d" }}>
          {[
            { label: "Date & Time",    value: `${trx.date}\n${trx.time}`, multiline: true },
            { label: "Payout Method",  value: `${trx.method} ${trx.methodDetail}` },
            { label: "Gross Amount",   value: trx.grossAmount },
            { label: "Processing Fee", value: trx.fee },
          ].map(({ label, value, multiline }) => (
            <div key={label} className="!flex !justify-between !items-center !py-3" style={{ borderBottom: "1px solid #1e2d3d" }}>
              <span className="!text-[13px] !text-slate-400">{label}</span>
              {multiline ? <div className="!text-right">{value.split("\n").map((v, i) => <p key={i} className={`!m-0 !text-[13px] ${i === 0 ? "!text-white !font-medium" : "!text-slate-500 !text-[11px]"}`}>{v}</p>)}</div>
                : <span className="!text-[13px] !text-white !font-medium">{value}</span>}
            </div>
          ))}
          <div className="!flex !justify-between !items-center !pt-4">
            <span className="!text-[14px] !font-semibold !text-white">Net Payout</span>
            <span className="!text-[16px] !font-bold !text-blue-400">{trx.netPayout}</span>
          </div>
        </div>
        <button onClick={onClose} className="!w-full !mt-5 !py-3 !rounded-xl !text-[14px] !font-semibold !text-white !cursor-pointer" style={{ background: "#2563eb", border: "none" }}>Close</button>
      </div>
    </ModalOverlay>
  );
}

function StatCard({ label, value, change, changeLabel, icon, glowColor }) {
  return (
    <Card style={{ background: `radial-gradient(circle at top right, ${glowColor} 0%, transparent 60%), #111c2e`, border: "1px solid #1e2d3d", borderRadius: "14px" }}>
      <CardContent className="!py-4 !px-4">
        <div className="!flex !items-center !justify-between !mb-3">{icon}<span className="!text-[12px] !font-semibold !text-slate-500 !tracking-widest">{label}</span></div>
        <p className="!text-[24px] !font-semibold !text-white !m-0 !mb-1 !pb-2">{value}</p>
        <div className="!flex !items-center !gap-1">
          <TrendingUp size={11} color="#10b981" />
          <span className="!text-[13px] !font-semibold !text-green-400">{change}</span>
          {changeLabel && <span className="!text-[13px] !text-slate-500">{changeLabel}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function EarningsPage() {
  const { isMobile, isTablet } = useBreakpoint();
  const isNarrow = isMobile || isTablet;

  const [activeTab, setActiveTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [balance, setBalance] = useState(null);
  const [methods, setMethods] = useState([]);
  const [prefs, setPrefs] = useState(null);
  const [goal, setGoal] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [recentTrx, setRecentTrx] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMethod, setEditMethod] = useState(null);
  const [selectedTrx, setSelectedTrx] = useState(null);

  const [withdrawals, setWithdrawals] = useState([]);
  const [whFilter, setWhFilter] = useState("All");
  const [whPage, setWhPage] = useState(1);
  const [whTotal, setWhTotal] = useState(0);
  const [whTotalPages, setWhTotalPages] = useState(1);
  const [whLoading, setWhLoading] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [s, b, m, p, g, chart, analy, recent] = await Promise.all([
          getEarningsStats(), getBalance(), getPayoutMethods(),
          getPayoutPreferences(), getEarningsGoal(),
          getWeeklyPerformance(), getFinancialAnalytics(), getRecentTransactions(),
        ]);
        setStats(s); setBalance(b); setMethods(m); setPrefs(p); setGoal(g);
        setChartData(chart); setAnalytics(analy); setRecentTrx(recent);
      } finally { setLoading(false); }
    }
    fetchAll();
  }, []);

  useEffect(() => {
    if (activeTab === "History") fetchWithdrawals();
  }, [activeTab, whFilter, whPage]);

  async function fetchWithdrawals() {
    setWhLoading(true);
    try {
      const result = await getWithdrawals({ status: whFilter, page: whPage, limit: 6 });
      setWithdrawals(result.withdrawals);
      setWhTotal(result.total);
      setWhTotalPages(result.totalPages);
    } finally { setWhLoading(false); }
  }

  async function handleRemoveMethod(id) {
    if (!window.confirm("Remove this payment method?")) return;
    await removePayoutMethod(id);
    setMethods(prev => prev.filter(m => m.id !== id));
  }

  async function handleScheduleChange(schedule) {
    const updated = await updatePayoutSchedule(schedule);
    setPrefs(updated);
  }

  async function handleAutoCashout() {
    const updated = await updateAutoCashout(!prefs.autoCashout);
    setPrefs(updated);
  }

  async function handleEditSave() {
    setEditMethod(null);
    const updated = await getPayoutMethods();
    setMethods(updated);
  }

  const progressPercent = goal ? Math.min((goal.current / goal.target) * 100, 100) : 0;

  if (loading) return (
    <div className="!flex !items-center !justify-center !h-full" style={{ background: "#0b1525" }}>
      <div className="!flex !flex-col !items-center !gap-3">
        <div className="!w-8 !h-8 !border-2 !border-blue-600/30 !border-t-blue-500 !rounded-full !animate-spin" />
        <p className="!text-[13px] !text-slate-500 !m-0">Loading earnings...</p>
      </div>
    </div>
  );

  const TopSection = () => (
    <div className={`!flex !gap-4 !mb-4 ${isNarrow ? "!flex-col" : "!items-start"}`}>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "12px" }}>
        <StatCard label="TOTAL EARNINGS" value={stats?.totalEarnings.value} change={stats?.totalEarnings.change}
          icon={<TrendingUp size={16} color="#3b82f6" />} glowColor="rgba(59,130,246,0.1)" />
        <StatCard label="TODAY" value={stats?.today.value} change={`${stats?.today.change} trips`} changeLabel=" completed"
          icon={<Package size={16} color="#10b981" />} glowColor="rgba(16,185,129,0.1)" />
        <StatCard label="RATING" value={stats?.rating.value} change={stats?.rating.change} changeLabel={` ${stats?.rating.label}`}
          icon={<Star size={16} color="#f59e0b" />} glowColor="rgba(245,158,11,0.1)" />
      </div>
      <div style={{ width: isNarrow ? "100%" : "280px", flexShrink: 0 }}>
        <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
          <CardContent className="!p-4">
            <p className="!text-[11px] !text-slate-500 !m-0 !mb-2">Balance Available</p>
            <div className="!flex !items-end !gap-2 !mb-1">
              <p className="!text-[28px] !font-extrabold !text-white !m-0 !leading-none">{balance?.available}</p>
              <div className="!flex !items-center !gap-1 !mb-1">
                <TrendingUp size={12} color="#10b981" />
                <span className="!text-[12px] !font-semibold !text-green-400">{balance?.change}</span>
              </div>
            </div>
            <p className="!text-[11px] !text-slate-500 !m-0 !mb-3">Updated {balance?.updatedAt}</p>
            <button onClick={() => setShowWithdrawModal(true)} className="!w-full !py-2.5 !rounded-xl !text-[13px] !font-bold !text-white !cursor-pointer !flex !items-center !justify-center !gap-2" style={{ background: "#2563eb", border: "none", boxShadow: "0 4px 12px rgba(37,99,235,0.35)" }}>
              <Landmark size={14} /> Withdraw Funds
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <>
      {showWithdrawModal && <WithdrawalFlow balance={balance} methods={methods} onClose={() => setShowWithdrawModal(false)} />}
      {showAddModal && <AddPayoutModal onSave={newMethod => { setMethods(prev => [...prev, newMethod]); setShowAddModal(false); }} onClose={() => setShowAddModal(false)} />}
      {editMethod && <EditBankModal method={editMethod} onSave={handleEditSave} onClose={() => setEditMethod(null)} />}
      {selectedTrx && <TransactionDetailModal trx={selectedTrx} onClose={() => setSelectedTrx(null)} />}

      <div className="!flex !flex-col" style={{ background: "#0b1525", minHeight: "100%", padding: isMobile ? "16px" : "24px" }}>

        {/* Header */}
        <div className={`!flex !items-start !justify-between !mb-4 ${isMobile ? "!flex-col !gap-3" : "!flex-row"}`}>
          <div>
            {activeTab === "History" && (
              <button onClick={() => setActiveTab("Overview")} className="!flex !items-center !gap-2 !text-slate-400 !text-[13px] !mb-2 !bg-transparent !border-none !cursor-pointer">
                <ArrowLeft size={14} /> Back
              </button>
            )}
            <h1 className="!text-[22px] !font-extrabold !text-white !m-0">{activeTab === "History" ? "Withdrawal History" : "Earnings"}</h1>
            <p className="!text-[13px] !text-slate-500 !m-0">{activeTab === "History" ? "View and manage your payout transaction logs." : "Track your performance and manage payouts."}</p>
          </div>
          {activeTab !== "History" && (
            <div className="!flex !gap-2 !p-1 !rounded-xl" style={{ background: "#111c2e", border: "1px solid #1e2d3d" }}>
              {["Overview", "Payout Settings"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="!px-4 !py-2 !rounded-lg !text-[12px] !font-semibold !cursor-pointer !border-none !transition-all"
                  style={{ background: activeTab === tab ? "#2563eb" : "transparent", color: activeTab === tab ? "white" : "#64748b" }}>
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ══ OVERVIEW ══ */}
        {activeTab === "Overview" && (
          <>
            <TopSection />
            <div style={{ display: "flex", flexDirection: isNarrow ? "column" : "row", gap: "16px" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
                <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
                  <CardContent className="!p-4">
                    <div className="!flex !items-center !justify-between !mb-3">
                      <h3 className="!text-[14px] !font-bold !text-white !m-0">Weekly Performance</h3>
                      <span className="!text-[11px] !font-semibold !px-3 !py-1 !rounded-lg !text-slate-300" style={{ background: "#1a2744", border: "1px solid #1e2d3d" }}>This Week</span>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                        <defs>
                          <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#1e2d3d" }} />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fill="url(#earningsGrad)" dot={false} activeDot={{ r: 5, fill: "#3b82f6", stroke: "#0b1525", strokeWidth: 2 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
                  <CardContent className="!p-4">
                    <div className="!flex !items-center !justify-between !mb-3">
                      <h3 className="!text-[14px] !font-bold !text-white !m-0">Recent Transactions</h3>
                      <button onClick={() => { setActiveTab("History"); setWhPage(1); setWhFilter("All"); }} className="!text-[12px] !text-blue-400 !bg-transparent !border-none !cursor-pointer !font-semibold !flex !items-center !gap-1">
                        View All <ChevronRight size={12} />
                      </button>
                    </div>
                    <div className="!flex !flex-col !gap-0">
                      {recentTrx.map((t, i) => (
                        <div key={t.id}
                          className="!flex !items-center !justify-between !py-3 !cursor-pointer hover:!bg-white/[.02] !rounded-lg !px-2 !-mx-2"
                          style={{ borderBottom: i < recentTrx.length - 1 ? "1px solid #1e2d3d" : "none" }}
                          onClick={() => setSelectedTrx(t)}>
                          <div className="!flex !items-center !gap-3">
                            <div className="!w-9 !h-9 !rounded-xl !flex !items-center !justify-center" style={{ background: t.methodType === "card" ? "rgba(16,185,129,0.12)" : "rgba(37,99,235,0.12)" }}>
                              {t.methodType === "card" ? <Zap size={15} color="#10b981" /> : <Landmark size={15} color="#3b82f6" />}
                            </div>
                            <div>
                              <p className="!text-[13px] !font-semibold !text-white !m-0">{t.method}</p>
                              <p className="!text-[11px] !text-slate-500 !m-0">{t.date}, {t.time}</p>
                            </div>
                          </div>
                          <div className="!text-right">
                            <p className="!text-[13px] !font-bold !text-white !m-0">{t.amount}</p>
                            <span style={{ ...statusStyle[t.status], borderRadius: "5px", padding: "2px 8px", fontSize: "10px", fontWeight: 600 }}>{t.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right sidebar — full width on narrow */}
              <div style={{ width: isNarrow ? "100%" : "280px", flexShrink: 0, display: "flex", flexDirection: isNarrow ? "row" : "column", flexWrap: "wrap", gap: "14px" }}>
                {[
                  <Card key="analytics" style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "14px", flex: isNarrow ? "1 1 260px" : "none" }}>
                    <CardContent className="!p-4">
                      <div className="!flex !items-center !justify-between !mb-3">
                        <div className="!flex !items-center !gap-2"><BarChart2 size={15} color="#64748b" /><h3 className="!text-[13px] !font-bold !text-white !m-0">Financial Analytics</h3></div>
                      </div>
                      <div className="!flex !flex-col !gap-3">
                        {(analytics?.items ?? []).map((item, i) => (
                          <div key={i} className="!flex !items-center !justify-between">
                            <div className="!flex !items-center !gap-2"><div className="!w-2 !h-2 !rounded-full" style={{ background: item.color }} /><span className="!text-[12px] !text-slate-400">{item.label}</span></div>
                            <span className="!text-[12px] !font-semibold !text-white">{item.value}</span>
                          </div>
                        ))}
                        <div style={{ borderTop: "1px solid #1e2d3d", paddingTop: "10px" }} className="!flex !items-center !justify-between">
                          <span className="!text-[12px] !font-bold !text-white">Total for Period</span>
                          <span className="!text-[13px] !font-bold !text-blue-400">{analytics?.total}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>,
                  <Card key="goal" style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "14px", flex: isNarrow ? "1 1 200px" : "none" }}>
                    <CardContent className="!p-4">
                      <h3 className="!text-[13px] !font-bold !text-white !m-0 !mb-3">Earnings Goal</h3>
                      <div className="!flex !justify-between !mb-2"><p className="!text-[12px] !text-slate-400 !m-0">Weekly Goal</p><p className="!text-[12px] !font-bold !text-white !m-0">${goal?.target?.toLocaleString()}</p></div>
                      <div className="!w-full !h-2 !rounded-full !mb-3 !overflow-hidden" style={{ background: "#1e2d3d" }}><div className="!h-full !rounded-full" style={{ width: `${progressPercent}%`, background: "linear-gradient(90deg, #1d4ed8, #3b82f6)" }} /></div>
                      <p className="!text-[11px] !text-slate-500 !m-0">You're <span className="!text-white !font-semibold">${(goal?.target - goal?.current).toFixed(2)}</span> away!</p>
                    </CardContent>
                  </Card>,
                ]}
              </div>
            </div>
          </>
        )}

        {/* ══ PAYOUT SETTINGS ══ */}
        {activeTab === "Payout Settings" && (
          <>
            <TopSection />
            <div style={{ display: "flex", flexDirection: isNarrow ? "column" : "row", gap: "16px" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
                <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
                  <CardContent className="!p-4">
                    <div className="!flex !items-center !justify-between !mb-3">
                      <h3 className="!text-[14px] !font-bold !text-white !m-0">Payout Methods</h3>
                      <span className="!text-[11px] !text-slate-500">{methods.length} Linked</span>
                    </div>
                    <div className="!flex !flex-col !gap-3">
                      {methods.map(method => (
                        <div key={method.id} className="!flex !items-center !justify-between !p-3 !rounded-xl" style={{ background: "#0b1525", border: "1px solid #1e2d3d" }}>
                          <div className="!flex !items-center !gap-3">
                            <div className="!w-9 !h-9 !rounded-lg !flex !items-center !justify-center" style={{ background: "rgba(37,99,235,0.15)" }}>
                              {method.type === "bank" ? <Landmark size={16} color="#3b82f6" /> : <CreditCard size={16} color="#3b82f6" />}
                            </div>
                            <div>
                              <div className="!flex !items-center !gap-2 !flex-wrap">
                                <p className="!text-[13px] !font-semibold !text-white !m-0">{method.name}</p>
                                {method.isDefault && <span className="!text-[10px] !font-bold !px-2 !py-0.5 !rounded-full" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>DEFAULT</span>}
                              </div>
                              <p className="!text-[11px] !text-slate-500 !m-0">{method.detail}</p>
                            </div>
                          </div>
                          <div className="!flex !gap-3">
                            <button onClick={() => setEditMethod(method)} className="!text-[12px] !text-blue-400 !bg-transparent !border-none !cursor-pointer !font-semibold">Edit</button>
                            <button onClick={() => handleRemoveMethod(method.id)} className="!text-[12px] !text-red-400 !bg-transparent !border-none !cursor-pointer !font-semibold">Remove</button>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => setShowAddModal(true)} className="!flex !items-center !justify-center !gap-2 !w-full !py-3 !rounded-xl !text-[13px] !font-semibold !text-blue-400 !cursor-pointer" style={{ background: "transparent", border: "1px dashed rgba(37,99,235,0.35)" }}>
                        <Plus size={14} /> Add New Payout Method
                      </button>
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
                  <CardContent className="!p-4">
                    <h3 className="!text-[14px] !font-bold !text-white !m-0 !mb-4">Payout Preferences</h3>
                    <div className={`!flex !items-start !justify-between !pb-4 ${isMobile ? "!flex-col !gap-3" : ""}`} style={{ borderBottom: "1px solid #1e2d3d" }}>
                      <div>
                        <p className="!text-[13px] !font-semibold !text-white !m-0">Payout Schedule</p>
                        <p className="!text-[11px] !text-slate-500 !m-0">Choose how often you receive your earnings.</p>
                      </div>
                      <div className="!flex !gap-2">
                        {["Weekly", "Daily"].map(s => (
                          <button key={s} onClick={() => handleScheduleChange(s)}
                            className="!px-4 !py-1.5 !rounded-lg !text-[12px] !font-semibold !cursor-pointer !border"
                            style={{ background: prefs?.schedule === s ? "#2563eb" : "transparent", borderColor: prefs?.schedule === s ? "#2563eb" : "#1e2d3d", color: prefs?.schedule === s ? "white" : "#64748b" }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={`!flex !items-center !justify-between !pt-4 ${isMobile ? "!flex-col !gap-3 !items-start" : ""}`}>
                      <div>
                        <p className="!text-[13px] !font-semibold !text-white !m-0">Automatic Cashout</p>
                        <p className="!text-[11px] !text-slate-500 !m-0">Auto-transfer when balance exceeds $50.</p>
                      </div>
                      <button onClick={handleAutoCashout} className="!w-12 !h-6 !rounded-full !relative !cursor-pointer !border-none !transition-all !shrink-0" style={{ background: prefs?.autoCashout ? "#2563eb" : "#1e2d3d" }}>
                        <span className="!absolute !top-0.5 !w-5 !h-5 !rounded-full !bg-white !transition-all" style={{ left: prefs?.autoCashout ? "calc(100% - 22px)" : "2px" }} />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div style={{ width: isNarrow ? "100%" : "280px", flexShrink: 0, display: "flex", flexDirection: isNarrow ? "row" : "column", flexWrap: "wrap", gap: "14px" }}>
                <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "14px", flex: isNarrow ? "1 1 220px" : "none" }}>
                  <CardContent className="!p-4">
                    <div className="!flex !items-center !justify-between !mb-3">
                      <div className="!flex !items-center !gap-2"><Landmark size={14} color="#64748b" /><p className="!text-[12px] !font-semibold !text-slate-400 !m-0">Payout Method</p></div>
                      <button onClick={() => { const def = methods.find(m => m.isDefault) ?? methods[0]; if (def) setEditMethod(def); }} className="!text-[12px] !text-blue-400 !bg-transparent !border-none !cursor-pointer !font-medium">Edit</button>
                    </div>
                    {methods.filter(m => m.isDefault).map(m => (
                      <div key={m.id} className="!flex !items-center !gap-3 !mb-3">
                        <div className="!w-9 !h-9 !rounded-lg !flex !items-center !justify-center" style={{ background: "rgba(37,99,235,0.15)" }}><Landmark size={16} color="#3b82f6" /></div>
                        <div><p className="!text-[13px] !font-semibold !text-white !m-0">{m.name}</p><p className="!text-[11px] !text-slate-500 !m-0">{m.detail}</p></div>
                        <div className="!w-2 !h-2 !rounded-full !ml-auto !shrink-0" style={{ background: "#10b981" }} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "14px", flex: isNarrow ? "1 1 200px" : "none" }}>
                  <CardContent className="!p-4">
                    <h3 className="!text-[13px] !font-bold !text-white !m-0 !mb-3">Earnings Goal</h3>
                    <div className="!flex !justify-between !mb-2"><p className="!text-[12px] !text-slate-400 !m-0">Weekly Goal</p><p className="!text-[12px] !font-bold !text-white !m-0">${goal?.target?.toLocaleString()}</p></div>
                    <div className="!w-full !h-2 !rounded-full !mb-2 !overflow-hidden" style={{ background: "#1e2d3d" }}><div className="!h-full !rounded-full" style={{ width: `${progressPercent}%`, background: "linear-gradient(90deg, #1d4ed8, #3b82f6)" }} /></div>
                    <p className="!text-[11px] !text-slate-500 !m-0">You're <span className="!text-white !font-semibold">${(goal?.target - goal?.current).toFixed(2)}</span> away!</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* ══ HISTORY ══ */}
        {activeTab === "History" && (
          <div className="!flex !flex-col !gap-4">
            <div className={`!flex !gap-3 ${isMobile ? "!flex-col" : "!items-center !justify-between"}`}>
              <div className="!flex !gap-2 !flex-wrap">
                {["All", "Completed", "Processing", "Failed"].map(f => (
                  <button key={f} onClick={() => { setWhFilter(f); setWhPage(1); }}
                    className="!px-4 !py-1.5 !rounded-full !text-[12px] !font-medium !cursor-pointer !border"
                    style={{ background: whFilter === f ? "rgba(37,99,235,0.15)" : "transparent", borderColor: whFilter === f ? "#2563eb" : "#1e2d3d", color: whFilter === f ? "#60a5fa" : "#64748b" }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
              <CardContent className="!p-0">
                <div style={{ overflowX: "auto" }}>
                  <div style={{ minWidth: "560px" }}>
                    <div className="!grid !px-4 !py-3" style={{ gridTemplateColumns: "1.2fr 1.4fr 1.5fr 0.8fr 1fr 0.3fr", borderBottom: "1px solid #1e2d3d" }}>
                      {["DATE & TIME", "TRANSACTION ID", "METHOD", "AMOUNT", "STATUS", ""].map(h => (
                        <p key={h} className="!text-[10px] !font-bold !text-slate-500 !m-0 !tracking-widest">{h}</p>
                      ))}
                    </div>
                    {whLoading ? (
                      <div className="!flex !items-center !justify-center !py-12 !gap-3">
                        <div className="!w-5 !h-5 !border-2 !border-blue-600/30 !border-t-blue-500 !rounded-full !animate-spin" />
                        <p className="!text-[13px] !text-slate-500 !m-0">Loading...</p>
                      </div>
                    ) : withdrawals.length === 0 ? (
                      <p className="!text-center !text-slate-500 !py-12 !text-[13px] !m-0">No transactions found</p>
                    ) : (
                      withdrawals.map((w, i) => (
                        <div key={w.id}
                          className="!grid !px-4 !py-4 !cursor-pointer hover:!bg-white/[.02] !items-center"
                          style={{ gridTemplateColumns: "1.2fr 1.4fr 1.5fr 0.8fr 1fr 0.3fr", borderBottom: i < withdrawals.length - 1 ? "1px solid #1e2d3d" : "none" }}
                          onClick={() => setSelectedTrx(w)}>
                          <div><p className="!text-[13px] !text-white !font-medium !m-0">{w.date}</p><p className="!text-[11px] !text-slate-500 !m-0">{w.time}</p></div>
                          <p className="!text-[13px] !text-slate-300 !m-0 !font-mono">#{w.id}</p>
                          <div className="!flex !items-center !gap-2">
                            <div className="!w-7 !h-7 !rounded-full !flex !items-center !justify-center" style={{ background: "rgba(37,99,235,0.15)" }}>
                              {w.methodType === "bank" ? <Landmark size={13} color="#3b82f6" /> : <Zap size={13} color="#3b82f6" />}
                            </div>
                            <div><p className="!text-[12px] !text-white !font-medium !m-0">{w.method}</p><p className="!text-[10px] !text-slate-500 !m-0">{w.methodDetail}</p></div>
                          </div>
                          <p className="!text-[13px] !font-bold !text-white !m-0">{w.amount}</p>
                          <span style={{ ...statusStyle[w.status], borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px", width: "fit-content" }}>
                            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: statusStyle[w.status]?.color }} />{w.status}
                          </span>
                          <ChevronRight size={14} color="#475569" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className={`!flex !items-center !justify-between ${isMobile ? "!flex-col !gap-3" : ""}`}>
              <span className="!text-[13px] !text-slate-500">
                Showing <span className="!text-white !font-semibold">{(whPage - 1) * 6 + 1}</span>–
                <span className="!text-white !font-semibold">{Math.min(whPage * 6, whTotal)}</span> of{" "}
                <span className="!text-white !font-semibold">{whTotal}</span> transactions
              </span>
              <div className="!flex !gap-2">
                <Button onClick={() => setWhPage(p => Math.max(1, p - 1))} disabled={whPage === 1}
                  style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "8px", color: "#94a3b8", height: "36px", padding: "0 16px", fontSize: "13px" }}>Previous</Button>
                <Button onClick={() => setWhPage(p => Math.min(whTotalPages, p + 1))} disabled={whPage === whTotalPages}
                  style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "8px", color: "#94a3b8", height: "36px", padding: "0 16px", fontSize: "13px" }}>Next</Button>
              </div>
            </div>
          </div>
        )}

        <p className="!text-center !text-[11px] !text-slate-700 !mt-6 !m-0">© 2025 Wassali Inc. All rights reserved.</p>
      </div>
    </>
  );
}