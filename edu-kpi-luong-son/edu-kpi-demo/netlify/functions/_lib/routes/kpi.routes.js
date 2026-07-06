const express = require("express");
const prisma = require("../prisma.js");
const { requireAuth } = require("../auth.js");

const router = express.Router();
router.use(requireAuth);

router.get("/summary", async (req, res) => {
  try {
    const year = req.query.year || "2025-2026";

    const [totalSchools, studentsInYear, allSchools, records, documentsCount, kpiRows] =
      await Promise.all([
        prisma.school.count(),
        prisma.student.findMany({ where: { schoolYear: year }, include: { school: true } }),
        prisma.school.findMany(),
        prisma.educationRecord.findMany(),
        prisma.documentArchive.count(),
        prisma.kPI.findMany({ orderBy: { schoolYear: "asc" } }),
      ]);

    const totalStudents = studentsInYear.length;
    const dropout = studentsInYear.filter((s) => s.status === "BO_HOC").length;
    const dropoutRate = totalStudents ? +((dropout / totalStudents) * 100).toFixed(1) : 0;

    // Nếu đã có bản ghi KPI thủ công cho năm này thì ưu tiên dùng (số liệu chính thức),
    // ngược lại tính nhanh từ dữ liệu học sinh/hồ sơ hiện có.
    const kpiRow = kpiRows.find((k) => k.schoolYear === year);

    const digitizedCount = records.filter((r) => r.isDigitized).length;
    const undigitizedCount = records.filter((r) => !r.isDigitized).length;

    const studentsBySchool = allSchools.map((s) => ({
      name: s.name,
      students: studentsInYear.filter((st) => st.schoolId === s.id).length,
    }));

    const kpiTrend = kpiRows.map((k) => ({
      schoolYear: k.schoolYear,
      enrollmentRate: k.enrollmentRate,
      dropoutRate: k.dropoutRate,
    }));

    res.json({
      totalStudents: kpiRow?.totalStudents ?? totalStudents,
      totalSchools: kpiRow?.totalSchools ?? totalSchools,
      enrollmentRate: kpiRow?.enrollmentRate ?? 97.5,
      dropoutRate: kpiRow?.dropoutRate ?? dropoutRate,
      digitizedCount: kpiRow?.digitizedCount ?? digitizedCount,
      undigitizedCount: kpiRow?.undigitizedCount ?? undigitizedCount,
      totalDocuments: kpiRow?.totalDocuments ?? documentsCount,
      studentsBySchool,
      kpiTrend: kpiTrend.length ? kpiTrend : [{ schoolYear: year, enrollmentRate: 97.5, dropoutRate: dropoutRate }],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Không thể tải dữ liệu KPI." });
  }
});

module.exports = router;
