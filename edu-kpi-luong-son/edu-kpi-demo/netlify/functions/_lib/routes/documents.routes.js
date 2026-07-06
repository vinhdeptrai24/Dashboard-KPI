const express = require("express");
const { randomUUID } = require("crypto");
const prisma = require("../prisma.js");
const { requireAuth, requireRole } = require("../auth.js");
const { saveFile, readFile, deleteFile } = require("../blobs.js");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const docs = await prisma.documentArchive.findMany({ orderBy: { issueDate: "desc" } });
  res.json(docs);
});

router.post("/", requireRole("ADMIN", "CAN_BO_VHXH"), async (req, res) => {
  try {
    const { number, title, issuer, issueDate, type, description, fileName, fileType, base64 } = req.body;
    if (!base64) return res.status(400).json({ error: "Thiếu file PDF đính kèm" });

    const fileKey = `documents/${randomUUID()}-${fileName}`;
    await saveFile(fileKey, base64, fileType);

    const doc = await prisma.documentArchive.create({
      data: {
        number,
        title,
        issuer,
        issueDate: new Date(issueDate),
        type,
        description,
        fileKey,
        fileName,
        uploadedById: req.user.id,
      },
    });

    await prisma.auditLog.create({
      data: { userId: req.user.id, action: "CREATE", target: `DocumentArchive#${doc.id}` },
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Không thể lưu văn bản." });
  }
});

router.get("/:id/download", async (req, res) => {
  try {
    const doc = await prisma.documentArchive.findUnique({ where: { id: req.params.id } });
    if (!doc) return res.status(404).json({ error: "Không tìm thấy văn bản" });

    const base64 = await readFile(doc.fileKey);
    if (!base64) return res.status(404).json({ error: "Không tìm thấy tệp lưu trữ" });

    res.json({ fileName: doc.fileName, base64 });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Không thể tải văn bản." });
  }
});

router.delete("/:id", requireRole("ADMIN", "CAN_BO_VHXH"), async (req, res) => {
  try {
    const doc = await prisma.documentArchive.findUnique({ where: { id: req.params.id } });
    if (doc) await deleteFile(doc.fileKey).catch(() => {});
    await prisma.documentArchive.delete({ where: { id: req.params.id } });
    await prisma.auditLog.create({
      data: { userId: req.user.id, action: "DELETE", target: `DocumentArchive#${req.params.id}` },
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Không thể xóa văn bản." });
  }
});

module.exports = router;
