// Chạy: node prisma/seed.js
// Sinh dữ liệu mẫu: 3 tài khoản, 5 trường, 200 học sinh, 30 hồ sơ, 20 văn bản

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const HO_TEN_DEM = ["Văn", "Thị", "Hữu", "Ngọc", "Minh", "Thành", "Xuân", "Thu", "Đức", "Gia"];
const HO = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng"];
const TEN_NAM = ["An", "Bình", "Cường", "Dũng", "Đạt", "Hải", "Khang", "Long", "Minh", "Phát", "Quân", "Sơn", "Tuấn", "Vinh"];
const TEN_NU = ["Anh", "Chi", "Diệp", "Giang", "Hà", "Hương", "Linh", "Mai", "Ngọc", "Nhi", "Phương", "Thảo", "Trang", "Vy"];

function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(startYear, endYear) {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  return new Date(start + Math.random() * (end - start));
}

function genStudentName(gender) {
  const first = randPick(HO);
  const mid = randPick(HO_TEN_DEM);
  const last = gender === "NAM" ? randPick(TEN_NAM) : randPick(TEN_NU);
  return `${first} ${mid} ${last}`;
}

async function main() {
  console.log("Đang xóa dữ liệu cũ…");
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.educationRecord.deleteMany();
  await prisma.documentArchive.deleteMany();
  await prisma.kPI.deleteMany();
  await prisma.student.deleteMany();
  await prisma.school.deleteMany();
  await prisma.user.deleteMany();

  console.log("Tạo tài khoản người dùng…");
  const [adminHash, canBoHash, lanhDaoHash] = await Promise.all([
    bcrypt.hash("Admin@123", 10),
    bcrypt.hash("CanBo@123", 10),
    bcrypt.hash("LanhDao@123", 10),
  ]);

  const admin = await prisma.user.create({
    data: {
      fullName: "Nguyễn Văn Quản Trị",
      email: "admin@luongson.gov.vn",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      fullName: "Trần Thị Cán Bộ",
      email: "canbo@luongson.gov.vn",
      passwordHash: canBoHash,
      role: "CAN_BO_VHXH",
    },
  });

  await prisma.user.create({
    data: {
      fullName: "Lê Văn Lãnh Đạo",
      email: "lanhdao@luongson.gov.vn",
      passwordHash: lanhDaoHash,
      role: "LANH_DAO_UBND",
    },
  });

  console.log("Tạo 5 trường học…");
  const schoolData = [
    { name: "Trường Mầm non Lương Sơn", principal: "Nguyễn Thị Hồng", level: "Mầm non", address: "Thôn 1, xã Lương Sơn" },
    { name: "Trường Tiểu học Lương Sơn A", principal: "Trần Văn Bình", level: "Tiểu học", address: "Thôn 2, xã Lương Sơn" },
    { name: "Trường Tiểu học Lương Sơn B", principal: "Phạm Thị Lan", level: "Tiểu học", address: "Thôn 4, xã Lương Sơn" },
    { name: "Trường THCS Lương Sơn", principal: "Hoàng Văn Nam", level: "THCS", address: "Thôn 3, xã Lương Sơn" },
    { name: "Trường Mầm non Sơn Ca", principal: "Vũ Thị Hoa", level: "Mầm non", address: "Thôn 5, xã Lương Sơn" },
  ];
  const schools = [];
  for (const s of schoolData) {
    schools.push(await prisma.school.create({ data: s }));
  }

  console.log("Tạo 200 học sinh…");
  const statuses = ["DANG_HOC", "DANG_HOC", "DANG_HOC", "DANG_HOC", "BO_HOC", "CHUYEN_TRUONG", "HOAN_THANH"];
  const students = [];
  for (let i = 0; i < 200; i++) {
    const gender = Math.random() > 0.5 ? "NAM" : "NU";
    const school = randPick(schools);
    const student = await prisma.student.create({
      data: {
        fullName: genStudentName(gender),
        dob: randomDate(2010, 2020),
        gender,
        schoolId: school.id,
        className: `${randPick(["1", "2", "3", "4", "5", "6", "7"])}${randPick(["A", "B", "C"])}`,
        status: randPick(statuses),
        address: `Thôn ${1 + Math.floor(Math.random() * 5)}, xã Lương Sơn`,
        schoolYear: randPick(["2023-2024", "2024-2025", "2025-2026"]),
      },
    });
    students.push(student);
  }

  // Cập nhật studentCount cho từng trường
  for (const school of schools) {
    const count = await prisma.student.count({ where: { schoolId: school.id } });
    await prisma.school.update({ where: { id: school.id }, data: { studentCount: count } });
  }

  console.log("Tạo 30 hồ sơ giáo dục (không kèm file thật, chỉ metadata demo)…");
  const maHoSoList = ["GD_01", "GD_08", "GD_09", "GD_10", "GD_11", "GD_22"];
  for (let i = 0; i < 30; i++) {
    const maHoSo = randPick(maHoSoList);
    const school = randPick(schools);
    const student = randPick(students);
    await prisma.educationRecord.create({
      data: {
        maHoSo,
        title: `${maHoSo.replace("_", ".")} - Hồ sơ số ${i + 1}`,
        schoolId: school.id,
        studentId: Math.random() > 0.3 ? student.id : null,
        fileKey: `records/demo-placeholder-${i + 1}.pdf`,
        fileName: `ho-so-${i + 1}.pdf`,
        fileType: "pdf",
        isDigitized: Math.random() > 0.15,
        uploadedById: admin.id,
      },
    });
  }

  console.log("Tạo 20 văn bản giáo dục…");
  const vanBanTypes = ["LUAT", "NGHI_DINH", "THONG_TU", "QUYET_DINH", "CONG_VAN"];
  const coQuan = ["Bộ Giáo dục và Đào tạo", "UBND tỉnh Lâm Đồng", "Sở Giáo dục và Đào tạo Lâm Đồng", "UBND xã Lương Sơn"];
  for (let i = 0; i < 20; i++) {
    const type = randPick(vanBanTypes);
    await prisma.documentArchive.create({
      data: {
        number: `${10 + i}/${type.slice(0, 2)}-GDĐT`,
        title: `Văn bản hướng dẫn công tác giáo dục số ${i + 1}`,
        issuer: randPick(coQuan),
        issueDate: randomDate(2021, 2026),
        type,
        description: "Văn bản mẫu phục vụ minh họa hệ thống số hóa hồ sơ giáo dục.",
        fileKey: `documents/demo-placeholder-${i + 1}.pdf`,
        fileName: `van-ban-${i + 1}.pdf`,
        uploadedById: admin.id,
      },
    });
  }

  console.log("Tạo dữ liệu KPI theo năm…");
  await prisma.kPI.createMany({
    data: [
      {
        schoolYear: "2023-2024",
        totalStudents: 185,
        totalSchools: 5,
        enrollmentRate: 96.2,
        dropoutRate: 1.8,
        digitizedCount: 18,
        undigitizedCount: 12,
        totalDocuments: 15,
      },
      {
        schoolYear: "2024-2025",
        totalStudents: 193,
        totalSchools: 5,
        enrollmentRate: 96.9,
        dropoutRate: 1.3,
        digitizedCount: 22,
        undigitizedCount: 8,
        totalDocuments: 18,
      },
      {
        schoolYear: "2025-2026",
        totalStudents: 200,
        totalSchools: 5,
        enrollmentRate: 97.8,
        dropoutRate: 0.9,
        digitizedCount: 26,
        undigitizedCount: 4,
        totalDocuments: 20,
      },
    ],
  });

  console.log("✅ Hoàn tất seed dữ liệu mẫu!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
