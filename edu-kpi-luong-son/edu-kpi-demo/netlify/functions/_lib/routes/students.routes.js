const express = require("express");
const prisma = require("../prisma.js");
const { requireAuth, requireRole } = require("../auth.js");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const students = await prisma.student.findMany({
    include: { school: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(students);
});

router.post("/", requireRole("ADMIN", "CAN_BO_VHXH"), async (req, res) => {
  try {
    const { fullName, dob, gender, schoolId, className, status, address, schoolYear } = req.body;
    const student = await prisma.student.create({
      data: {
        fullName,
        dob: new Date(dob),
        gender,
        schoolId,
        className,
        status,
        address,
        schoolYear,
      },
    });
    await prisma.auditLog.create({
      data: { userId: req.user.id, action: "CREATE", target: `Student#${student.id}` },
    });
    res.status(201).json(student);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Không thể tạo học sinh. Kiểm tra lại dữ liệu." });
  }
});

router.put("/:id", requireRole("ADMIN", "CAN_BO_VHXH"), async (req, res) => {
  try {
    const { fullName, dob, gender, schoolId, className, status, address, schoolYear } = req.body;
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: {
        fullName,
        dob: new Date(dob),
        gender,
        schoolId,
        className,
        status,
        address,
        schoolYear,
      },
    });
    await prisma.auditLog.create({
      data: { userId: req.user.id, action: "UPDATE", target: `Student#${student.id}` },
    });
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Không thể cập nhật học sinh." });
  }
});

router.delete("/:id", requireRole("ADMIN", "CAN_BO_VHXH"), async (req, res) => {
  try {
    await prisma.student.delete({ where: { id: req.params.id } });
    await prisma.auditLog.create({
      data: { userId: req.user.id, action: "DELETE", target: `Student#${req.params.id}` },
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Không thể xóa học sinh." });
  }
});

module.exports = router;
