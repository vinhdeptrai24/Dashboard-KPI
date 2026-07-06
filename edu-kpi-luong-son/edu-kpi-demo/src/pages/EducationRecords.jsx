import React, { useEffect, useState } from "react";
import { Plus, Download, Eye } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import FileUpload from "../components/FileUpload.jsx";
import { api } from "../lib/apiClient.js";
import { useAuth, CAN_EDIT_ROLES } from "../context/AuthContext.jsx";

const MA_HO_SO_OPTIONS = ["GD_01", "GD_08", "GD_09", "GD_10", "GD_11", "GD_22"];

const EMPTY_FORM = { maHoSo: "GD_01", title: "", schoolId: "", studentId: "", file: null };

export default function EducationRecords() {
  const { user } = useAuth();
  const canEdit = CAN_EDIT_ROLES.includes(user.role);

  const [records, setRecords] = useState([]);
  const [schools, setSchools] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [filterMa, setFilterMa] = useState("ALL");

  async function load() {
    setLoading(true);
    try {
      const [r, sc, st] = await Promise.all([
        api.get("/records"),
        api.get("/schools"),
        api.get("/students"),
      ]);
      setRecords(r);
      setSchools(sc);
      setStudents(st);
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
    setForm({ ...EMPTY_FORM, schoolId: schools[0]?.id || "" });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.file) {
      setError("Vui lòng chọn file PDF hoặc Word để tải lên.");
      return;
    }
    try {
      await api.post("/records", {
        maHoSo: form.maHoSo,
        title: form.title,
        schoolId: form.schoolId || null,
        studentId: form.studentId || null,
        fileName: form.file.fileName,
        fileType: form.file.fileType,
        base64: form.file.base64,
      });
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(row) {
    if (!confirm(`Xóa hồ sơ "${row.title}"?`)) return;
    try {
      await api.del(`/records/${row.id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDownload(row) {
    try {
      const data = await api.get(`/records/${row.id}/download`);
      downloadBase64(data.base64, data.fileName);
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = filterMa === "ALL" ? records : records.filter((r) => r.maHoSo === filterMa);

  const columns = [
    { key: "maHoSo", label: "Mã hồ sơ", render: (r) => <MaBadge ma={r.maHoSo} /> },
    { key: "title", label: "Tên hồ sơ" },
    { key: "school", label: "Trường", render: (r) => r.school?.name || "—" },
    { key: "student", label: "Học sinh", render: (r) => r.student?.fullName || "—" },
    { key: "fileName", label: "Tệp đính kèm" },
    {
      key: "actions2",
      label: "Xem / Tải",
      render: (r) => (
        <button
          onClick={() => handleDownload(r)}
          className="flex items-center gap-1 text-primary-500 hover:text-primary-600 text-xs font-medium"
        >
          <Download size={14} /> Tải xuống
        </button>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar title="Hồ sơ giáo dục" subtitle="Lưu trữ hồ sơ số hóa theo nhóm GD.01 – GD.22" />
        <main className="p-6 md:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-white border border-line rounded-lg px-3 py-2">
              <span className="text-xs text-ink-muted uppercase tracking-wide">Nhóm hồ sơ</span>
              <select
                value={filterMa}
                onChange={(e) => setFilterMa(e.target.value)}
                className="text-sm font-medium text-ink bg-transparent focus:outline-none"
              >
                <option value="ALL">Tất cả</option>
                {MA_HO_SO_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m.replace("_", ".")}</option>
                ))}
              </select>
            </div>
            {canEdit && (
              <button
                onClick={openCreate}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} /> Tải hồ sơ mới
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
              data={filtered}
              canEdit={canEdit}
              onEdit={() => {}}
              onDelete={handleDelete}
              searchPlaceholder="Tìm theo tên hồ sơ…"
            />
          )}
        </main>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tải lên hồ sơ giáo dục" wide>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Mã hồ sơ" required>
            <select required value={form.maHoSo} onChange={(e) => setForm({ ...form, maHoSo: e.target.value })} className="input">
              {MA_HO_SO_OPTIONS.map((m) => (
                <option key={m} value={m}>{m.replace("_", ".")}</option>
              ))}
            </select>
          </Field>
          <Field label="Tên hồ sơ" required>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
          </Field>
          <Field label="Trường liên quan (tùy chọn)">
            <select value={form.schoolId} onChange={(e) => setForm({ ...form, schoolId: e.target.value })} className="input">
              <option value="">-- Không chọn --</option>
              {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Học sinh liên quan (tùy chọn)">
            <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="input">
              <option value="">-- Không chọn --</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </select>
          </Field>
          <Field label="Tệp hồ sơ (PDF/Word)" full required>
            <FileUpload value={form.file} onChange={(file) => setForm({ ...form, file })} />
          </Field>

          {error && <div className="sm:col-span-2 text-sm text-danger">{error}</div>}

          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-line">
              Hủy
            </button>
            <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold">
              Lưu hồ sơ
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

function MaBadge({ ma }) {
  return (
    <span className="text-xs font-mono font-semibold px-2 py-1 rounded-full bg-primary-50 text-primary-500">
      {ma.replace("_", ".")}
    </span>
  );
}

function downloadBase64(base64, fileName) {
  const link = document.createElement("a");
  link.href = `data:application/octet-stream;base64,${base64}`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
