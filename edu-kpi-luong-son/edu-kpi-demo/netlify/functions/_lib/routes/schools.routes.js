const express = require("express");
const prisma = require("../prisma.js");
const { requireAuth, requireRole } = require("../auth.js");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const schools = await prisma.school.findMany({
    include: { _count: { select: { students: true } } },
    orderBy: { createdAt: "asc" },
  });
  res.json(schools);
});

router.post("/", requireRole("ADMIN", "CAN_BO_VHXH"), async (req, res) => {
  try {
    const { name, principal, address, level } = req.body;
    const school = await prisma.school.create({ data: { name, principal, address, level } });
    await prisma.auditLog.create({
      data: { userId: req.user.id, action: "CREATE", target: `School#${school.id}` },
    });
    res.status(201).json(school);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Không thể tạo trường học." });
  }
});

router.put("/:id", requireRole("ADMIN", "CAN_BO_VHXH"), async (req, res) => {
  try {
    const { name, principal, address, level } = req.body;
    const school = await prisma.school.update({
      where: { id: req.params.id },
      data: { name, principal, address, level },
    });
    await prisma.auditLog.create({
      data: { userId: req.user.id, action: "UPDATE", target: `School#${school.id}` },
    });
    res.json(school);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Không thể cập nhật trường học." });
  }
});

router.delete("/:id", requireRole("ADMIN", "CAN_BO_VHXH"), async (req, res) => {
  try {
    await prisma.school.delete({ where: { id: req.params.id } });
    await prisma.auditLog.create({
      data: { userId: req.user.id, action: "DELETE", target: `School#${req.params.id}` },
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Không thể xóa trường học (có thể còn học sinh liên kết)." });
  }
});

module.exports = router;
