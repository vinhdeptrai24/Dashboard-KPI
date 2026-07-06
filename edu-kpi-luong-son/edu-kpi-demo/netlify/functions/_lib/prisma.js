const { PrismaClient } = require("@prisma/client");

// Tránh tạo quá nhiều connection khi function bị "hot" giữa các lượt gọi
let prisma;
if (!global.__prisma) {
  global.__prisma = new PrismaClient();
}
prisma = global.__prisma;

module.exports = prisma;
