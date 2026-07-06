const express = require("express");
const { randomUUID } = require("crypto");
const prisma = require("../prisma.js");
const { requireAuth, requireRole } = require("../auth.js");
const { saveFile, readFile, deleteFile } = require("../blobs.js");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const records = await prisma.educationRecord.findMany({
    include: { school: true, student: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(records);
});

router.post("/", requireRole("ADMIN", "CAN_BO_VHXH"), async (req, res) => {
  try {
    const { maHoSo, title, schoolId, studentId, fileName, fileType, base64 } = req.body;
    if (!base64) return res.status(400).json({ error: "Thiếu file đính kèm" });

    const fileKey = `records/${randomUUID()}-${fileName}`;
    await saveFile(fileKey, base64, fileType);

    const record = await prisma.educationRecord.create({
      data: {
        maHoSo,
        title,
        schoolId: schoolId || null,
        studentId: studentId || null,
        fileKey,
        fileName,
        fileType,
        isDigitized: true,
        uploadedById: req.user.id,
      },
    });

    await prisma.auditLog.create({
      data: { userId: req.user.id, action: "CREATE", target: `EducationRecord#${record.id}` },
    });

    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Không thể lưu hồ sơ giáo dục." });
  }
});

router.get("/:id/download", async (req, res) => {
  try {
    const record = await prisma.educationRecord.findUnique({ where: { id: req.params.id } });
    if (!record) return res.status(404).json({ error: "Không tìm thấy hồ sơ" });

    const base64 = await readFile(record.fileKey);
    if (!base64) return res.status(404).json({ error: "Không tìm thấy tệp lưu trữ" });

    res.json({ fileName: record.fileName, base64 });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Không thể tải tệp hồ sơ." });
  }
});

router.delete("/:id", requireRole("ADMIN", "CAN_BO_VHXH"), async (req, res) => {
  try {
    const record = await prisma.educationRecord.findUnique({ where: { id: req.params.id } });
    if (record) await deleteFile(record.fileKey).catch(() => {});
    await prisma.educationRecord.delete({ where: { id: req.params.id } });
    await prisma.auditLog.create({
      data: { userId: req.user.id, action: "DELETE", target: `EducationRecord#${req.params.id}` },
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Không thể xóa hồ sơ." });
  }
});

module.exports = router;
