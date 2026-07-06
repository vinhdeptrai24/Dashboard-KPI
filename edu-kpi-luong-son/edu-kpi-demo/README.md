# Hệ thống Số hóa Hồ sơ Giáo dục — Xã Lương Sơn, Lâm Đồng

Web App demo: React + Vite + Tailwind (frontend) · Express chạy trong Netlify Functions (backend) · PostgreSQL + Prisma (database) · Netlify Blobs (lưu file PDF/Word).

---

## 1. Vì sao chọn kiến trúc này cho Netlify

Netlify không host server Node chạy liên tục và không có ổ đĩa bền vững, nên:
- Backend Express được bọc bằng `serverless-http` và chạy như **1 Netlify Function duy nhất** (`netlify/functions/api.js`).
- Database dùng **PostgreSQL ngoài** (khuyến nghị [Neon.tech](https://neon.tech) — miễn phí, khởi tạo trong 1 phút), không dùng SQLite vì file sẽ mất khi function "nguội".
- File PDF/Word được lưu bằng **Netlify Blobs** (kho lưu trữ tích hợp sẵn của Netlify), không lưu vào thư mục local.

---

## 2. Cài đặt & chạy thử ở máy local

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file .env từ mẫu và điền DATABASE_URL (lấy từ Neon.tech) + JWT_SECRET
cp .env.example .env

# 3. Khởi tạo bảng trong database
npx prisma migrate dev --name init

# 4. Sinh dữ liệu mẫu (3 tài khoản, 5 trường, 200 học sinh, 30 hồ sơ, 20 văn bản)
npm run prisma:seed

# 5. Cài Netlify CLI (nếu chưa có) để chạy được cả Function lẫn Frontend cùng lúc
npm install -g netlify-cli

# 6. Chạy local (Netlify CLI sẽ tự chạy Vite dev server + Functions)
netlify dev
```

Truy cập `http://localhost:8888`. Đăng nhập bằng 1 trong 3 tài khoản demo (xem ở màn hình đăng nhập).

> Nếu chỉ chạy `npm run dev` (không qua Netlify CLI), phần Function sẽ không hoạt động vì cần môi trường Netlify để giả lập.

---

## 3. Deploy lên Netlify (Internet)

### Bước 1 — Tạo database PostgreSQL miễn phí
1. Vào [neon.tech](https://neon.tech) → tạo project mới.
2. Copy chuỗi **Connection string** (dạng `postgresql://...`).

### Bước 2 — Đưa code lên Git (khuyến nghị) hoặc dùng Netlify CLI
**Cách A — Qua GitHub (dễ bảo trì nhất):**
```bash
git init
git add .
git commit -m "Khởi tạo hệ thống KPI giáo dục"
# Đẩy lên repository GitHub của bạn, sau đó:
```
Vào [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project** → chọn repo GitHub vừa đẩy lên. Netlify sẽ tự đọc `netlify.toml` để build.

**Cách B — Deploy thẳng từ máy bằng Netlify CLI (không cần Git):**
```bash
netlify login
netlify init          # tạo site mới, làm theo hướng dẫn
netlify deploy --prod # build và deploy bản chính thức
```

### Bước 3 — Khai báo biến môi trường trên Netlify
Vào **Site settings → Environment variables**, thêm:
| Key | Value |
|---|---|
| `DATABASE_URL` | Chuỗi kết nối Neon.tech ở Bước 1 |
| `JWT_SECRET` | Một chuỗi bí mật ngẫu nhiên, đủ dài |

### Bước 4 — Khởi tạo bảng & seed dữ liệu trên database production
Chạy từ máy local, trỏ vào cùng `DATABASE_URL` production:
```bash
npx prisma migrate deploy
npm run prisma:seed
```

### Bước 5 — Deploy lại (nếu dùng Cách B) hoặc chờ Netlify tự build (Cách A)
```bash
netlify deploy --prod
```

Xong — trang web sẽ chạy tại địa chỉ dạng `https://ten-site-cua-ban.netlify.app`.

---

## 4. Tài khoản demo

| Vai trò | Email | Mật khẩu | Quyền |
|---|---|---|---|
| Quản trị viên | admin@luongson.gov.vn | Admin@123 | Toàn quyền |
| Cán bộ Văn hóa - Xã hội | canbo@luongson.gov.vn | CanBo@123 | Thêm/sửa/xóa dữ liệu |
| Lãnh đạo UBND xã | lanhdao@luongson.gov.vn | LanhDao@123 | Chỉ xem Dashboard & Kho văn bản |

---

## 5. Cấu trúc thư mục

```
edu-kpi-demo/
├── netlify.toml                    # Cấu hình build + routing /api/* → Netlify Function
├── package.json
├── prisma/
│   ├── schema.prisma                # 8 model: User, School, Student, EducationRecord,
│   │                                 # DocumentArchive, KPI, Notification, AuditLog
│   └── seed.js                      # Sinh dữ liệu mẫu
├── netlify/functions/
│   ├── api.js                       # Express app (1 function xử lý toàn bộ /api/*)
│   └── _lib/
│       ├── prisma.js                # Prisma Client singleton
│       ├── auth.js                  # JWT sign/verify + phân quyền theo role
│       ├── blobs.js                 # Lưu/đọc file qua Netlify Blobs
│       └── routes/
│           ├── auth.routes.js
│           ├── students.routes.js
│           ├── schools.routes.js
│           ├── records.routes.js
│           ├── documents.routes.js
│           └── kpi.routes.js
└── src/                              # Frontend React
    ├── main.jsx / App.jsx / index.css
    ├── context/AuthContext.jsx
    ├── lib/apiClient.js
    ├── components/ (Sidebar, Navbar, StatCard, DataTable, FileUpload, Modal, ProtectedRoute)
    └── pages/ (Login, Dashboard, Students, Schools, EducationRecords, DocumentArchive)
```

---

## 6. Ghi chú kỹ thuật

- **Upload file**: frontend đọc file thành base64 (`FileReader`) rồi gửi kèm JSON lên API — cách này tránh phải xử lý `multipart/form-data` trong môi trường serverless, phù hợp quy mô demo. Giới hạn kích thước request đã đặt 15MB (đủ cho hồ sơ PDF/Word thông thường).
- **Phân quyền**: gộp trực tiếp vào `User.role` (enum `ADMIN` / `CAN_BO_VHXH` / `LANH_DAO_UBND`) thay vì bảng `Role` riêng, vì đây là demo với 3 vai trò cố định.
- **KPI Dashboard**: nếu đã có bản ghi `KPI` thủ công cho một năm học, hệ thống ưu tiên hiển thị số liệu đó (số liệu chính thức); nếu chưa có, hệ thống tự tính nhanh từ dữ liệu học sinh/hồ sơ hiện có.
- Muốn mở rộng thật (nhiều xã, nhiều huyện...) thì tách các Function nhỏ hơn theo domain và cân nhắc dùng Prisma Accelerate / connection pooling cho PostgreSQL.
