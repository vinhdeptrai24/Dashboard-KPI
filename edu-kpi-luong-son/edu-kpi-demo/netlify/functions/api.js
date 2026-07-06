const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");

const authRoutes = require("./_lib/routes/auth.routes.js");
const studentsRoutes = require("./_lib/routes/students.routes.js");
const schoolsRoutes = require("./_lib/routes/schools.routes.js");
const recordsRoutes = require("./_lib/routes/records.routes.js");
const documentsRoutes = require("./_lib/routes/documents.routes.js");
const kpiRoutes = require("./_lib/routes/kpi.routes.js");

const app = express();

app.use(cors());
app.use(express.json({ limit: "15mb" })); // đủ lớn cho file PDF/Word encode base64

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/students", studentsRoutes);
app.use("/schools", schoolsRoutes);
app.use("/records", recordsRoutes);
app.use("/documents", documentsRoutes);
app.use("/kpi", kpiRoutes);

// Xử lý lỗi tập trung
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Lỗi máy chủ không xác định" });
});

module.exports.handler = serverless(app);
