// Truy vấn bảng Users. Model chỉ chứa câu SQL, không chứa logic nghiệp vụ.
const { pool } = require('../config/db');

// Các trường hồ sơ được phép cập nhật: tên trường ở API -> tên cột trong DB
const PROFILE_COLUMNS = {
  fullName: 'FullName',
  phoneNumber: 'PhoneNumber',
  email: 'Email',
  englishLevel: 'EnglishLevel',
};

async function findById(userId, db = pool) {
  const [rows] = await db.query('SELECT * FROM Users WHERE Id = ?', [userId]);
  return rows[0] || null;
}

async function existsById(userId, db = pool) {
  const [rows] = await db.query('SELECT Id FROM Users WHERE Id = ?', [userId]);
  return rows.length > 0;
}

async function findByUserNameOrEmail(userName, email, db = pool) {
  const [rows] = await db.query('SELECT * FROM Users WHERE UserName = ? OR Email = ? LIMIT 1', [userName, email]);
  return rows[0] || null;
}

async function getPasswordHash(userId) {
  const [rows] = await pool.query('SELECT PasswordHash FROM Users WHERE Id = ?', [userId]);
  return rows[0] ? rows[0].PasswordHash : null;
}

// Trả về Id của user vừa tạo
async function create({ email, userName, passwordHash, fullName, phoneNumber }, db = pool) {
  const [result] = await db.query(
    'INSERT INTO Users (Email, UserName, PasswordHash, FullName, PhoneNumber) VALUES (?, ?, ?, ?, ?)',
    [email, userName, passwordHash, fullName, phoneNumber || null]
  );
  return result.insertId;
}

// fields ví dụ: { fullName: 'An', englishLevel: 'B1' }
async function updateProfile(userId, fields) {
  const keys = Object.keys(fields).filter((key) => PROFILE_COLUMNS[key]);
  const assignments = keys.map((key) => `${PROFILE_COLUMNS[key]} = ?`).join(', ');
  const values = keys.map((key) => fields[key]);
  await pool.query(`UPDATE Users SET ${assignments} WHERE Id = ?`, [...values, userId]);
}

async function updatePasswordHash(userId, passwordHash) {
  await pool.query('UPDATE Users SET PasswordHash = ? WHERE Id = ?', [passwordHash, userId]);
}

// Trả về số dòng bị ảnh hưởng (0 nghĩa là không có user này)
async function updateActiveStatus(userId, isActive) {
  const [result] = await pool.query('UPDATE Users SET IsActive = ? WHERE Id = ?', [isActive ? 1 : 0, userId]);
  return result.affectedRows;
}

// Tìm kiếm + phân trang, kèm danh sách vai trò của từng người dùng
async function search({ keyword, limit, offset }) {
  const likeKeyword = `%${keyword}%`;
  const whereClause = keyword ? 'WHERE u.UserName LIKE ? OR u.Email LIKE ? OR u.FullName LIKE ?' : '';
  const whereParams = keyword ? [likeKeyword, likeKeyword, likeKeyword] : [];

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM Users u ${whereClause}`, whereParams);
  const [items] = await pool.query(
    `SELECT u.Id, u.UserName, u.Email, u.FullName, u.PhoneNumber, u.EnglishLevel, u.IsActive, u.CreatedAt,
            GROUP_CONCAT(r.Name) AS Roles
     FROM Users u
     LEFT JOIN UserRoles ur ON ur.UserId = u.Id
     LEFT JOIN Roles r ON r.Id = ur.RoleId
     ${whereClause}
     GROUP BY u.Id ORDER BY u.Id DESC LIMIT ? OFFSET ?`,
    [...whereParams, limit, offset]
  );
  return { total, items };
}

async function getStatistics() {
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(IsActive = 1), 0) AS active,
            COALESCE(SUM(CreatedAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)), 0) AS newLast7Days
     FROM Users`
  );
  return row;
}

// Tìm user bằng GoogleId
async function findByGoogleId(googleId, db = pool) {
  const [rows] = await db.query('SELECT * FROM Users WHERE GoogleId = ?', [googleId]);
  return rows[0] || null;
}

// Tạo user đăng nhập qua Google (không có mật khẩu, không có số điện thoại)
async function createWithGoogle({ email, userName, fullName, googleId }, db = pool) {
  const [result] = await db.query(
    'INSERT INTO Users (Email, GoogleId, UserName, PasswordHash, FullName) VALUES (?, ?, ?, NULL, ?)',
    [email, googleId, userName, fullName]
  );
  return result.insertId;
}

// Liên kết GoogleId vào tài khoản đã tồn tại (đăng ký bằng email trước đó)
async function linkGoogleId(userId, googleId, db = pool) {
  await db.query('UPDATE Users SET GoogleId = ? WHERE Id = ?', [googleId, userId]);
}
module.exports = {
  findById,
  existsById,
  findByUserNameOrEmail,
  findByGoogleId,       // thêm mới
  createWithGoogle,     // thêm mới
  linkGoogleId,
  getPasswordHash,
  create,
  updateProfile,
  updatePasswordHash,
  updateActiveStatus,
  search,
  getStatistics,
};
