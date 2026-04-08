import { useEffect, useState } from "react";
import { Users, UserPlus, Wifi, ShieldOff, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getUserStats } from "./FakeApi";

const cardConfig = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: Users,
    iconColor: "#3b82f6",
    glowColor: "rgba(59, 130, 246, 0.15)",
  },
  {
    key: "newUsers",
    label: "New Users (7d)",
    icon: UserPlus,
    iconColor: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.15)",
  },
  {
    key: "activeNow",
    label: "Active Now",
    icon: Wifi,
    iconColor: "#6366f1",
    glowColor: "rgba(99, 102, 241, 0.15)",
  },
  {
    key: "bannedAccounts",
    label: "Banned Accounts",
    icon: ShieldOff,
    iconColor: "#ef4444",
    glowColor: "rgba(239, 68, 68, 0.15)",
  },
];

export default function UserCards() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getUserStats().then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-4 gap-4 !py-7 !px-5">
      {cardConfig.map(({ key, label, icon: Icon, iconColor, glowColor }) => {
        const s        = stats[key];
        const isLive   = s.change === "Live";
        const positive = s.positive;

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

              {/* Top row — icon + badge */}
              <div className="flex items-center justify-between mb-5">
                <Icon size={22} style={{ color: iconColor }} />

                {isLive ? (
                  <span style={{
                    background: "rgba(99,102,241,0.15)",
                    color: "#6366f1",
                    fontSize: "11px",
                    fontWeight: 700,
                    borderRadius: "6px",
                    padding: "2px 8px",
                    letterSpacing: "0.5px",
                  }}>
                    Live
                  </span>
                ) : (
                  <div className="flex items-center gap-0.5">
                    {positive
                      ? <TrendingUp  size={13} style={{ color: "#10b981" }} />
                      : <TrendingDown size={13} style={{ color: "#ef4444" }} />
                    }
                    <span
                      className="text-xs font-semibold"
                      style={{ color: positive ? "#10b981" : "#ef4444" }}
                    >
                      {s.change}
                    </span>
                  </div>
                )}
              </div>

              <div className="!pt-2">
                <p className="text-sm text-slate-400 mb-1 !pb-2">{label}</p>

                {/* Value */}
                <span className="text-3xl font-bold text-white leading-none">
                  {key === "newUsers"
                    ? `+${s.value.toLocaleString()}`
                    : s.value.toLocaleString()
                  }
                </span>
              </div>

            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}