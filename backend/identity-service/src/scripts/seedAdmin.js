// Tạo tài khoản admin đầu tiên. Chạy: npm run seed
const bcrypt = require('bcryptjs');
require('../config'); // nạp file .env trước khi đọc process.env
const { pool, withTransaction } = require('../config/db');
const userModel = require('../models/userModel');
const roleModel = require('../models/roleModel');
const { ROLES, BCRYPT_ROUNDS } = require('../utils/constants');

async function seedAdmin() {
  const userName = process.env.ADMIN_USERNAME || 'admin';
  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 8) throw new Error('Cần đặt ADMIN_PASSWORD (>= 8 ký tự) trong .env');

  const existingUser = await userModel.findByUserNameOrEmail(userName, email);
  if (existingUser) {
    console.log('Admin đã tồn tại, bỏ qua.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await withTransaction(async (connection) => {
    const adminId = await userModel.create({ email, userName, passwordHash, fullName: 'Administrator' }, connection);
    await roleModel.assignToUser(adminId, [ROLES.ADMIN, ROLES.USER], connection);
  });
  console.log(`Đã tạo admin: ${userName} / ${email}`);
}

seedAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
