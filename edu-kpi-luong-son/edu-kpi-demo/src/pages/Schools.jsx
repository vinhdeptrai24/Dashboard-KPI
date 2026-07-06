import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import { api } from "../lib/apiClient.js";
import { useAuth, CAN_EDIT_ROLES } from "../context/AuthContext.jsx";

const EMPTY_FORM = { name: "", principal: "", address: "", level: "Tiểu học" };

export default function Schools() {
  const { user } = useAuth();
  const canEdit = CAN_EDIT_ROLES.includes(user.role);

  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      setSchools(await api.get("/schools"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({ name: row.name, principal: row.principal, address: row.address, level: row.level || "" });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (editing) await api.put(`/schools/${editing.id}`, form);
      else await api.post("/schools", form);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(row) {
    if (!confirm(`Xóa trường "${row.name}"?`)) return;
    try {
      await api.del(`/schools/${row.id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const columns = [
    { key: "name", label: "Tên trường" },
    { key: "level", label: "Cấp học" },
    { key: "principal", label: "Hiệu trưởng" },
    { key: "address", label: "Địa chỉ" },
    { key: "studentCount", label: "Số học sinh", render: (r) => r._count?.students ?? r.studentCount },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar title="Quản lý trường học" subtitle="Danh sách trường học trên địa bàn xã" />
        <main className="p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-ink-muted">{schools.length} trường học</div>
            {canEdit && (
              <button
                onClick={openCreate}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} /> Thêm trường
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
              data={schools}
              canEdit={canEdit}
              onEdit={openEdit}
              onDelete={handleDelete}
              searchPlaceholder="Tìm theo tên trường, hiệu trưởng…"
            />
          )}
        </main>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Sửa trường học" : "Thêm trường học"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Tên trường" required>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </Field>
          <Field label="Cấp học">
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="input">
              <option>Mầm non</option>
              <option>Tiểu học</option>
              <option>THCS</option>
            </select>
          </Field>
          <Field label="Hiệu trưởng" required>
            <input required value={form.principal} onChange={(e) => setForm({ ...form, principal: e.target.value })} className="input" />
          </Field>
          <Field label="Địa chỉ" required>
            <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" />
          </Field>

          {error && <div className="text-sm text-danger">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
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

function Field({ label, children, required }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-muted uppercase tracking-wide">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
