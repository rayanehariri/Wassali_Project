
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function EarningsPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="!flex !flex-col" style={{ background: "#0b1525", minHeight: "100%" }}>

      {/* ══ HEADER ══ */}
      <div className="!px-4 md:!px-8 !pt-6 !pb-8">
        <p className="!text-[10px] !font-bold !text-blue-500 !tracking-[0.15em] !m-0 !mb-3">LOGISTICS TRANSPARENCY</p>
        <h1 className="!text-[30px] md:!text-[38px] !font-extrabold !text-white !m-0 !mb-3">Earnings & Tips Policy</h1>
        <p className="!text-[13px] !text-slate-400 !m-0 !max-w-lg !leading-relaxed">
          Our commitment to fair compensation and financial clarity for every deliverer across the Algerian network.
        </p>
      </div>

      <div className="!px-4 md:!px-8 !pb-8 !flex !flex-col !gap-6">

        {/* ══ ROW 1: Payout Structure + Network Average ══ */}
        <div className="!grid !grid-cols-1 md:!grid-cols-[1fr_220px] !gap-5">

          {/* Payout Structure */}
          <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
            <CardContent className="!p-5 md:!p-6">
              <div className="!flex !items-center !gap-2 !mb-5">
                <div className="!w-8 !h-8 !rounded-xl !flex !items-center !justify-center"
                  style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.2)" }}>
                  <TrendingUp size={15} color="#3b82f6" />
                </div>
                <h3 className="!text-[16px] !font-bold !text-white !m-0">Payout Structure</h3>
              </div>

              <div className="!grid !grid-cols-3 !gap-4 !mb-5">
                {[
                  { label: "Base Fare",      value: "150", unit: "DZD", sub: "Minimum per pickup point" },
                  { label: "Distance Premium", value: "25", unit: "DZD", sub: "Calculated per kilometre" },
                  { label: "Weight Fee",     value: "40", unit: "DZD", sub: "Per KG of the package" },
                ].map(item => (
                  <div key={item.label} className="!p-4 !rounded-xl"
                    style={{ background: "#FFFFFF0D", border: "1px solid #FFFFFF0D" }}>
                      <p className="!text-[11px] !font-bold !text-slate-400 !m-0 !mb-1">{item.label}</p>
                    <p className="!text-[28px] !font-extrabold !text-white !m-0 !leading-none !mb-0.5">
                      {item.value} <span className="!text-[14px] !text-slate-500 !font-medium">{item.unit}</span>
                    </p>
                    
                    <p className="!text-[10px] !text-slate-500 !m-0">{item.sub}</p>
                  </div>
                ))}
              </div>

              <div className="!p-4 !rounded-xl !text-[12px] !text-slate-400 !leading-relaxed"
                style={{ background: null}}>
                Our dynamic algorithm ensures your time is valued. Earnings are calculated in real-time
                based on traffic conditions, neighbourhood terrain, and total delivery complexity.
              </div>
            </CardContent>
          </Card>

          {/* Network Average */}
          <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
            <CardContent className="!p-5">
              <p className="!text-[10px] !font-bold !text-slate-500 !tracking-widest !m-0 !mb-3">NETWORK AVERAGE</p>

              {/* Map/chart placeholder */}
              <div className="!w-full !h-20 !rounded-xl !mb-4 !overflow-hidden !relative"
                style={{ background: "linear-gradient(135deg, #0f1b2d, #0b1420)" }}>
                {/* Decorative grid */}
                <svg width="100%" height="100%" style={{ opacity: 0.15 }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <g key={i}>
                      <line x1={`${i * 20}%`} y1="0" x2={`${i * 20}%`} y2="100%" stroke="#3b82f6" strokeWidth="0.5"/>
                      <line x1="0" y1={`${i * 20}%`} x2="100%" y2={`${i * 20}%`} stroke="#3b82f6" strokeWidth="0.5"/>
                    </g>
                  ))}
                </svg>
                <div style={{
                  position: "absolute", bottom: 8, right: 8, width: 28, height: 28,
                  borderRadius: "50%", background: "rgba(37,99,235,0.3)", border: "1.5px solid #3b82f6",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3b82f6" }} />
                </div>
              </div>

              <p className="!text-[42px] !font-extrabold !text-white !m-0 !leading-none !mb-1">850</p>
              <p className="!text-[16px] !font-semibold !text-slate-400 !m-0 !mb-3">DZD</p>
              <p className="!text-[11px] !text-slate-500 !m-0 !leading-snug">
                Average hourly earnings for top-tier partners in Algiers during peak operations.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ══ ROW 2: Tip Distribution + Performance Incentives ══ */}
        <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5">

          {/* Tip Distribution */}
          <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
            <CardContent className="!p-5 md:!p-6">
              <div className="!flex !items-center !gap-2 !mb-5">
                <span style={{ fontSize: 18 }}>💸</span>
                <h3 className="!text-[16px] !font-bold !text-white !m-0">Tip Distribution</h3>
              </div>
              <div className="!flex !flex-col !gap-4">
                {[
                  {
                    icon: "✅",
                    title: "100% Recipient Ownership",
                    desc: "Every tip paid directly to the deliverer. No platform fees or deductions are applied.",
                  },
                  {
                    icon: "🔍",
                    title: "Full Transparency",
                    desc: "Instant notifications for every tip received, with detailed monthly tracking in your dashboard.",
                  },
                  {
                    icon: "📅",
                    title: "Flexible Payouts",
                    desc: "Tips are cleared and only can then be withdrawn daily or credited with weekly base earnings.",
                  },
                ].map(item => (
                  <div key={item.title} className="!flex !gap-3">
                    <span className="!text-[18px] !shrink-0">{item.icon}</span>
                    <div>
                      <p className="!text-[13px] !font-bold !text-white !m-0 !mb-1">{item.title}</p>
                      <p className="!text-[12px] !text-slate-500 !m-0 !leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Incentives */}
          <Card style={{ background: "#111c2e", border: "1px solid #1e2d3d", borderRadius: "14px" }}>
            <CardContent className="!p-5 md:!p-6">
              <div className="!flex !items-center !gap-2 !mb-5">
                <span style={{ fontSize: 18 }}>🚀</span>
                <h3 className="!text-[16px] !font-bold !text-white !m-0">Performance Incentives</h3>
              </div>

              <div className="!flex !flex-col !gap-3 !mb-4">
                {/* High Rating Bonus */}
                <div className="!flex !items-center !justify-between !px-4 !py-3.5 !rounded-xl"
                  style={{ background:"#A855F74D" }}>
                  <div>
                    <p className="!text-[13px] !font-bold !text-white !m-0">High Rating Bonus</p>
                    <p className="!text-[11px] !text-[#D8B4FE] !m-0">Maintain rating above 4.8 deliveries</p>
                  </div>
                  <span className="!text-[14px] !font-extrabold !text-[#A855F7] !shrink-0 !ml-3">+5,000 DZD</span>
                </div>

                {/* Peak Hour Surge */}
                <div className="!flex !items-center !justify-between !px-4 !py-3.5 !rounded-xl"
                  style={{ background: "#0D59F24D" }}>
                  <div>
                    <p className="!text-[13px] !font-bold !text-white !m-0">Peak Hour Surge</p>
                    <p className="!text-[11px] !text-[#60A5FA] m-0">Lunch and Dinner rush multipliers</p>
                  </div>
                  <span className="!text-[14px] !font-extrabold !text-[#0D59F2] !shrink-0 !ml-3">1.5× Rate</span>
                </div>
              </div>

              {/* Note */}
              <div className="!flex !items-start !gap-3 !p-4 !rounded-xl"
                style={{ background: "#FFFFFF0D" }}>
                <div className="!w-10 !h-10 !rounded-xl !flex !items-center !justify-center !shrink-0"
                  style={{ background: "rgba(37,99,235,0.12)" }}>
                  <TrendingUp size={16} color="#3b82f6" />
                </div>
                <p className="!text-[12px] !text-slate-400 !m-0 !leading-relaxed !italic">
                  "Incentives are recalculated every Monday at 00:00 UTC based on previous week's fulfillment reliability and customer feedback metrics."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ══ FOOTER ══ */}
        <div className="!flex !flex-col sm:!flex-row !items-start sm:!items-center !justify-between !pt-2 !gap-3"
          style={{ borderTop: "1px solid #1e2d3d" }}>
          <div>
            <p className="!text-[10px] !font-bold !text-slate-600 !tracking-widest !m-0 !mb-1">TRANSPARENCY IN ALGERIAN DELIVERIES</p>
            <p className="!text-[11px] !text-slate-700 !m-0">© 2026 Wassali Inc. All rights reserved.</p>
          </div>
          <div className="!flex !gap-4">
            <button onClick={() => navigate("/deliverer-dashboard/support/safety")}
              className="!text-[12px] !text-slate-500 hover:!text-slate-300 !bg-transparent !border-none !cursor-pointer !transition-colors">
              Terms of Service and Safety Policy
            </button>
            <button onClick={() => navigate("/deliverer-dashboard/support")}
              className="!text-[12px] !text-slate-500 hover:!text-slate-300 !bg-transparent !border-none !cursor-pointer !transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}