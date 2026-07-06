import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, FolderCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@luongson.gov.vn");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-primary-600">
      {/* Panel thương hiệu */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 px-14 py-12 text-white relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-500/40" />
        <div className="absolute -right-10 bottom-10 h-64 w-64 rounded-full bg-gold-500/10" />
        <div className="relative">
          <div className="text-gold-300 font-mono text-xs tracking-widest uppercase">
            UBND Xã Lương Sơn · Tỉnh Lâm Đồng
          </div>
          <h1 className="font-display font-extrabold text-4xl leading-tight mt-4 max-w-md">
            Số hóa hồ sơ giáo dục,
            <br /> gọn nhẹ từ cấp xã.
          </h1>
          <p className="text-white/70 mt-4 max-w-sm">
            Nền tảng quản lý dữ liệu học sinh, trường học và văn bản giáo dục
            tập trung — thay thế lưu trữ giấy rời rạc bằng một đầu mối số duy nhất.
          </p>
        </div>
        <div className="relative flex items-center gap-3 text-white/80 text-sm">
          <FolderCheck size={20} className="text-gold-300" />
          Phòng Văn hóa - Xã hội xã Lương Sơn
        </div>
      </div>

      {/* Panel đăng nhập */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-cream">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="text-primary-500 font-mono text-xs tracking-widest uppercase">
              UBND Xã Lương Sơn · Lâm Đồng
            </div>
            <h1 className="font-display font-bold text-2xl text-ink mt-1">
              Số hóa Hồ sơ Giáo dục
            </h1>
          </div>

          <div className="bg-white rounded-card shadow-card border border-line p-7">
            <h2 className="font-display font-bold text-xl text-ink mb-1">Đăng nhập hệ thống</h2>
            <p className="text-sm text-ink-muted mb-6">Nhập thông tin tài khoản được cấp.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-ink-muted uppercase tracking-wide">
                  Email
                </label>
                <div className="relative mt-1">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted uppercase tracking-wide">
                  Mật khẩu
                </label>
                <div className="relative mt-1">
                  <LockKeyhole size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-danger bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
              >
                {loading ? "Đang đăng nhập…" : "Đăng nhập"}
              </button>
            </form>
          </div>

          <div className="mt-5 bg-white/60 border border-line rounded-lg p-4 text-xs text-ink-muted space-y-1">
            <div className="font-semibold text-ink mb-1">Tài khoản demo:</div>
            <div>Admin: admin@luongson.gov.vn / Admin@123</div>
            <div>Cán bộ VH-XH: canbo@luongson.gov.vn / CanBo@123</div>
            <div>Lãnh đạo UBND: lanhdao@luongson.gov.vn / LanhDao@123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
