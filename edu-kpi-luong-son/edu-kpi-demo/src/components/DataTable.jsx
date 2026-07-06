import React, { useMemo, useState } from "react";
import { Search, Pencil, Trash2 } from "lucide-react";

export default function DataTable({ columns, data, onEdit, onDelete, canEdit, searchPlaceholder }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => String(row[col.key] ?? "").toLowerCase().includes(q))
    );
  }, [data, query, columns]);

  return (
    <div className="bg-white rounded-card border border-line shadow-card overflow-hidden">
      <div className="p-4 border-b border-line">
        <div className="relative max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder || "Tìm kiếm…"}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-line focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-muted bg-cream">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-semibold whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              {canEdit && <th className="px-4 py-3 text-right">Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-ink-muted">
                  Không có dữ liệu phù hợp.
                </td>
              </tr>
            )}
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-line hover:bg-primary-50/40 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {canEdit && (
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => onEdit(row)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-primary-100 text-primary-500 mr-1"
                      title="Sửa"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(row)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-red-50 text-danger"
                      title="Xóa"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 text-xs text-ink-muted border-t border-line">
        Hiển thị {filtered.length} / {data.length} bản ghi
      </div>
    </div>
  );
}
