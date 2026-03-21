import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Mon", value: 60  },
  { day: "Tue", value: 75  },
  { day: "Wed", value: 55  },
  { day: "Thu", value: 110 },  // active day — blue
  { day: "Fri", value: 45  },
  { day: "Sat", value: 90  },
  { day: "Sun", value: 70  },
];

const activeDay = "Thu";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#1e2536",
        border: "1px solid #33415580",
        borderRadius: "8px",
        padding: "8px 12px",
      }}>
        <p style={{ color: "#94a3b8", fontSize: "12px" }}>{label}</p>
        <p style={{ color: "#3b82f6", fontSize: "14px", fontWeight: 600 }}>
          ${payload[0].value}k
        </p>
      </div>
    );
  }
  return null;
};

export default function MChart() {
  return (
    <div style={{
      background: "#161f2e",
      border: "1px solid #1e2d3d",
      borderRadius: "16px",
      padding: "24px",
      width: "100%",
      height: "100%",
    }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-[16px]">Money Transaction Rate</h3>
          <p className="text-slate-400 text-[12px] mt-0.5">Daily Volume: $12k</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[12px]">This Week</span>
          <span style={{
            background: "rgba(16,185,129,0.1)",
            color: "#10b981",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 700,
            padding: "2px 8px",
          }}>
            +22%
          </span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={32}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={({ x, y, payload }) => (
              <text
                x={x}
                y={y + 12}
                textAnchor="middle"
                fontSize={11}
                fontWeight={payload.value === activeDay ? 700 : 400}
                fill={payload.value === activeDay ? "#ffffff" : "#64748b"}
              >
                {payload.value}
              </text>
            )}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.day}
                fill={entry.day === activeDay ? "#3b82f6" : "#1e3a5f"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}