
import { useEffect, useState } from "react";
import { ClipboardList, BadgeCheck, XCircle, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getVerificationStats } from "./FakeApi";

const cardConfig = [
  {
    key: "pendingRequests",
    label: "Pending Requests",
    icon: ClipboardList,
    iconColor: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.15)",
  },
  {
    key: "verifiedWeek",
    label: "Verified This Week",
    icon: BadgeCheck,
    iconColor: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.15)",
  },
  {
    key: "rejectedWeek",
    label: "Rejected This Week",
    icon: XCircle,
    iconColor: "#ef4444",
    glowColor: "rgba(239, 68, 68, 0.15)",
  },
  {
    key: "avgReviewTime",
    label: "Avg. Review Time",
    icon: Clock,
    iconColor: "#3b82f6",
    glowColor: "rgba(59, 130, 246, 0.15)",
  },
];

export default function VerificationCards() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getVerificationStats().then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-4 gap-4 !py-4 !px-5">
      {cardConfig.map(({ key, label, icon: Icon, iconColor, glowColor }) => {
        const s = stats[key];

        return (
          <Card
            key={key}
            style={{
              background: `radial-gradient(circle at top right, ${glowColor} 0%, transparent 60%), #1E293B`,
              border: "1px solid #33415580",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              borderRadius: "12px",
              flexShrink: 0,
            }}
          >
            <CardContent className="!py-4 !px-6">

              {/* Top row — icon + sub label */}
              <div className="flex items-center gap-2 mb-4">
                <Icon size={16} style={{ color: iconColor }} />
                <span className="text-[13px] text-slate-400 font-medium">{label}</span>
              </div>

              {/* Value */}
              <p className="text-[32px] font-bold text-white leading-none mb-2 !py-2">
                {s.value}
              </p>

              {/* Bottom change label */}
              <div className="flex items-center gap-1">
                {s.positive
                  ? <TrendingUp  size={12} style={{ color: "#10b981" }} />
                  : <TrendingDown size={12} style={{ color: key === "pendingRequests" ? "#f59e0b" : "#ef4444" }} />
                }
                <span style={{
                  fontSize: "12px",
                  color: s.positive
                    ? "#10b981"
                    : key === "pendingRequests" ? "#f59e0b" : "#ef4444",
                }}>
                  {s.label}
                </span>
              </div>

            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}