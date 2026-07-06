import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  School as SchoolIcon,
  TrendingUp,
  TrendingDown,
  FileCheck2,
  FileClock,
  BookMarked,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import StatCard from "../components/StatCard.jsx";
import { api } from "../lib/apiClient.js";

const PIE_COLORS = ["#0E4D3C", "#C89B3C"];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [year, setYear] = useState("2025-2026");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get(`/kpi/summary?year=${encodeURIComponent(year)}`)
      .then((data) => mounted && setSummary(data))
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [year]);

  const digitizedPct = useMemo(() => {
    if (!summary) return 0;
    const total = summary.digitizedCount + summary.undigitizedCount;
    if (!total) return 0;
    return Math.round((summary.digitizedCount / total) * 100);
  }, [summary]);

  const ringCircumference = 2 * Math.PI * 54;
  const ringOffset = ringCircumference - (ringCircumference * digitizedPct) / 100;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar
          title="Tổng quan KPI Giáo dục"
          subtitle="Phòng Văn hóa - Xã hội xã Lương Sơn, tỉnh Lâm Đồng"
        />

        <main className="p-6 md:p-8 space-y-6">
          {/* Bộ lọc */}
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              label="Năm học"
              value={year}
              onChange={setYear}
              options={["2023-2024", "2024-2025", "2025-2026"]}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-danger text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {loading || !summary ? (
            <div className="text-ink-muted text-sm">Đang tải dữ liệu KPI…</div>
          ) : (
            <>
              {/* Hero: vòng tiến độ số hóa + stat cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="bg-primary-600 text-white rounded-card shadow-card p-6 flex items-center gap-6">
                  <svg width="120" height="120" viewBox="0 0 120 120" className="shrink-0">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#E8C874"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringOffset}
                      transform="rotate(-90 60 60)"
                      className="ring-progress"
                    />
                    <text x="60" y="66" textAnchor="middle" className="fill-white font-mono font-bold text-2xl">
                      {digitizedPct}%
                    </text>
                  </svg>
                  <div>
                    <div className="text-gold-300 text-xs font-mono uppercase tracking-widest">
                      Tiến độ số hóa
                    </div>
                    <div className="font-display font-bold text-lg mt-1">
                      {summary.digitizedCount} / {summary.digitizedCount + summary.undigitizedCount} hồ sơ
                    </div>
                    <div className="text-white/70 text-sm mt-1">
                      Năm học {year} — mục tiêu 100% hồ sơ được lưu trữ số.
                    </div>
                  </div>
                </div>

                <StatCard label="Tổng số học sinh" value={summary.totalStudents} icon={Users} />
                <StatCard label="Tổng số trường" value={summary.totalSchools} icon={SchoolIcon} accent="gold" />
              </div>

              {/* Hàng stat card thứ 2 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <StatCard label="Tỷ lệ huy động trẻ" value={summary.enrollmentRate} suffix="%" icon={TrendingUp} />
                <StatCard label="Tỷ lệ bỏ học" value={summary.dropoutRate} suffix="%" icon={TrendingDown} accent="danger" />
                <StatCard label="Hồ sơ chưa số hóa" value={summary.undigitizedCount} icon={FileClock} accent="gold" />
                <StatCard label="Số văn bản giáo dục" value={summary.totalDocuments} icon={BookMarked} />
              </div>

              {/* Biểu đồ */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-white rounded-card border border-line shadow-card p-5">
                  <h3 className="font-display font-semibold text-ink mb-4">
                    Học sinh theo trường
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={summary.studentsBySchool}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="students" fill="#0E4D3C" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-card border border-line shadow-card p-5">
                  <h3 className="font-display font-semibold text-ink mb-4">
                    Tình trạng số hóa hồ sơ
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Đã số hóa", value: summary.digitizedCount },
                          { name: "Chưa số hóa", value: summary.undigitizedCount },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {PIE_COLORS.map((c, i) => (
                          <Cell key={i} fill={c} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-card border border-line shadow-card p-5">
                <h3 className="font-display font-semibold text-ink mb-4">
                  KPI theo năm (Tỷ lệ huy động vs. bỏ học)
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={summary.kpiTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD3" />
                    <XAxis dataKey="schoolYear" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="enrollmentRate" name="Huy động (%)" stroke="#0E4D3C" strokeWidth={2.5} />
                    <Line type="monotone" dataKey="dropoutRate" name="Bỏ học (%)" stroke="#C89B3C" strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-2 bg-white border border-line rounded-lg px-3 py-2">
      <span className="text-xs text-ink-muted uppercase tracking-wide">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm font-medium text-ink bg-transparent focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
