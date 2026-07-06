import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import { api } from "../lib/apiClient.js";
import { useAuth, CAN_EDIT_ROLES } from "../context/AuthContext.jsx";

const EMPTY_FORM = {
  fullName: "",
  dob: "",
  gender: "NAM",
  schoolId: "",
  className: "",
  status: "DANG_HOC",
  address: "",
  schoolYear: "2025-2026",
};

const STATUS_LABEL = {
  DANG_HOC: "Đang học",
  BO_HOC: "Bỏ học",
  CHUYEN_TRUONG: "Chuyển trường",
  HOAN_THANH: "Hoàn thành",
};

export default function Students() {
  const { user } = useAuth();
  const canEdit = CAN_EDIT_ROLES.includes(user.role);

  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  async function loadAll() {
    setLoading(true);
    try {
      const [s, sc] = await Promise.all([api.get("/students"), api.get("/schools")]);
      setStudents(s);
      setSchools(sc);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, schoolId: schools[0]?.id || "" });
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      fullName: row.fullName,
      dob: row.dob?.slice(0, 10) || "",
      gender: row.gender,
      schoolId: row.schoolId,
      className: row.className,
      status: row.status,
      address: row.address,
      schoolYear: row.schoolYear,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await api.put(`/students/${editing.id}`, form);
      } else {
        await api.post("/students", form);
      }
      setModalOpen(false);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(row) {
    if (!confirm(`Xóa học sinh "${row.fullName}"?`)) return;
    try {
      await api.del(`/students/${row.id}`);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  const columns = [
    { key: "fullName", label: "Họ tên" },
    { key: "dob", label: "Ngày sinh", render: (r) => new Date(r.dob).toLocaleDateString("vi-VN") },
    { key: "gender", label: "Giới tính", render: (r) => (r.gender === "NAM" ? "Nam" : "Nữ") },
    { key: "school", label: "Trường", render: (r) => r.school?.name || "—" },
    { key: "className", label: "Lớp" },
    { key: "status", label: "Tình trạng", render: (r) => <StatusBadge status={r.status} /> },
    { key: "address", label: "Địa chỉ" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar title="Quản lý học sinh" subtitle="Danh sách học sinh trên địa bàn xã" />
        <main className="p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-ink-muted">{students.length} học sinh</div>
            {canEdit && (
              <button
                onClick={openCreate}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} /> Thêm học sinh
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-danger text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-ink-muted text-sm">Đang tải…</div>
          ) : (
            <DataTable
              columns={columns}
              data={students}
              canEdit={canEdit}
              onEdit={openEdit}
              onDelete={handleDelete}
              searchPlaceholder="Tìm theo tên, lớp, địa chỉ…"
            />
          )}
        </main>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Sửa học sinh" : "Thêm học sinh"} wide>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Họ tên" required>
            <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input" />
          </Field>
          <Field label="Ngày sinh" required>
            <input type="date" required value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="input" />
          </Field>
          <Field label="Giới tính">
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input">
              <option value="NAM">Nam</option>
              <option value="NU">Nữ</option>
            </select>
          </Field>
          <Field label="Trường" required>
            <select required value={form.schoolId} onChange={(e) => setForm({ ...form, schoolId: e.target.value })} className="input">
              <option value="">-- Chọn trường --</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Lớp" required>
            <input required value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} className="input" />
          </Field>
          <Field label="Tình trạng học tập">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Năm học">
            <input value={form.schoolYear} onChange={(e) => setForm({ ...form, schoolYear: e.target.value })} className="input" />
          </Field>
          <Field label="Địa chỉ" full>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" />
          </Field>

          {error && <div className="sm:col-span-2 text-sm text-danger">{error}</div>}

          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-line">
              Hủy
            </button>
            <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold">
              Lưu
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Field({ label, children, required, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-xs font-medium text-ink-muted uppercase tracking-wide">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    DANG_HOC: "bg-primary-50 text-primary-500",
    BO_HOC: "bg-red-50 text-danger",
    CHUYEN_TRUONG: "bg-gold-100 text-gold-600",
    HOAN_THANH: "bg-green-50 text-success",
  };
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${map[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
