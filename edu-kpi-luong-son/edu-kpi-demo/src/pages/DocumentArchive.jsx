import React, { useEffect, useState } from "react";
import { Plus, Download } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import FileUpload from "../components/FileUpload.jsx";
import { api } from "../lib/apiClient.js";
import { useAuth, CAN_EDIT_ROLES } from "../context/AuthContext.jsx";

const TYPE_LABEL = {
  LUAT: "Luật",
  NGHI_DINH: "Nghị định",
  THONG_TU: "Thông tư",
  QUYET_DINH: "Quyết định",
  CONG_VAN: "Công văn",
};

const EMPTY_FORM = {
  number: "",
  title: "",
  issuer: "",
  issueDate: "",
  type: "THONG_TU",
  description: "",
  file: null,
};

export default function DocumentArchivePage() {
  const { user } = useAuth();
  const canEdit = CAN_EDIT_ROLES.includes(user.role);

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      setDocs(await api.get("/documents"));
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
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.file) {
      setError("Vui lòng chọn file PDF văn bản.");
      return;
    }
    try {
      await api.post("/documents", {
        number: form.number,
        title: form.title,
        issuer: form.issuer,
        issueDate: form.issueDate,
        type: form.type,
        description: form.description,
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
    if (!confirm(`Xóa văn bản "${row.title}"?`)) return;
    try {
      await api.del(`/documents/${row.id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDownload(row) {
    try {
      const data = await api.get(`/documents/${row.id}/download`);
      const link = document.createElement("a");
      link.href = `data:application/octet-stream;base64,${data.base64}`;
      link.download = data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err.message);
    }
  }

  const columns = [
    { key: "number", label: "Số hiệu" },
    { key: "title", label: "Tên văn bản" },
    { key: "type", label: "Loại", render: (r) => TYPE_LABEL[r.type] },
    { key: "issuer", label: "Cơ quan ban hành" },
    { key: "issueDate", label: "Ngày ban hành", render: (r) => new Date(r.issueDate).toLocaleDateString("vi-VN") },
    {
      key: "dl",
      label: "Tải xuống",
      render: (r) => (
        <button onClick={() => handleDownload(r)} className="flex items-center gap-1 text-primary-500 hover:text-primary-600 text-xs font-medium">
          <Download size={14} /> Tải PDF
        </button>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar title="Kho văn bản giáo dục" subtitle="Luật, Nghị định, Thông tư, Quyết định, Công văn" />
        <main className="p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-ink-muted">{docs.length} văn bản</div>
            {canEdit && (
              <button
                onClick={openCreate}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} /> Thêm văn bản
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
              data={docs}
              canEdit={canEdit}
              onEdit={() => {}}
              onDelete={handleDelete}
              searchPlaceholder="Tìm theo số hiệu, tên văn bản…"
            />
          )}
        </main>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Thêm văn bản giáo dục" wide>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Số hiệu" required>
            <input required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="input" />
          </Field>
          <Field label="Loại văn bản">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
              {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Tên văn bản" full required>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
          </Field>
          <Field label="Cơ quan ban hành" required>
            <input required value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} className="input" />
          </Field>
          <Field label="Ngày ban hành" required>
            <input type="date" required value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} className="input" />
          </Field>
          <Field label="Mô tả" full>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={3} />
          </Field>
          <Field label="Tệp PDF" full required>
            <FileUpload value={form.file} onChange={(file) => setForm({ ...form, file })} accept=".pdf" />
          </Field>

          {error && <div className="sm:col-span-2 text-sm text-danger">{error}</div>}

          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-line">
              Hủy
            </button>
            <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold">
              Lưu văn bản
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
