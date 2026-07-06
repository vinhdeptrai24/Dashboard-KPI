const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../prisma.js");
const { signToken } = require("../auth.js");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Vui lòng nhập email và mật khẩu" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }

    await prisma.auditLog.create({
      data: { userId: user.id, action: "LOGIN", target: `User#${user.id}` },
    });

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Lỗi máy chủ khi đăng nhập" });
  }
});

module.exports = router;
