import React, { useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import { fileToBase64 } from "../lib/apiClient.js";

export default function FileUpload({ value, onChange, accept = ".pdf,.doc,.docx" }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file) {
    if (!file) return;
    setBusy(true);
    try {
      const base64 = await fileToBase64(file);
      onChange({
        fileName: file.name,
        fileType: file.name.split(".").pop().toLowerCase(),
        base64,
      });
    } finally {
      setBusy(false);
    }
  }

  if (value?.fileName) {
    return (
      <div className="flex items-center justify-between border border-line rounded-lg px-3 py-2.5 bg-primary-50/40">
        <div className="flex items-center gap-2 text-sm text-ink">
          <FileText size={16} className="text-primary-500" />
          <span className="truncate max-w-[220px]">{value.fileName}</span>
        </div>
        <button type="button" onClick={() => onChange(null)} className="text-ink-muted hover:text-danger">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-line rounded-lg px-4 py-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors"
    >
      <UploadCloud size={22} className="text-primary-500" />
      <div className="text-sm text-ink">{busy ? "Đang xử lý…" : "Nhấn để chọn file PDF hoặc Word"}</div>
      <div className="text-xs text-ink-muted">Định dạng hỗ trợ: PDF, DOC, DOCX</div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
