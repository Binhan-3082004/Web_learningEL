// Truy vấn bảng Roles và UserRoles
const { pool } = require('../config/db');

// Trả về mảng tên vai trò, ví dụ ['user', 'admin']
async function findRoleNamesOfUser(userId, db = pool) {
  const [rows] = await db.query(
    'SELECT r.Name FROM UserRoles ur JOIN Roles r ON r.Id = ur.RoleId WHERE ur.UserId = ?',
    [userId]
  );
  return rows.map((row) => row.Name);
}

// Lấy các vai trò theo tên (dùng để kiểm tra tên vai trò có tồn tại không)
async function findByNames(roleNames, db = pool) {
  const [rows] = await db.query('SELECT Id, Name FROM Roles WHERE Name IN (?)', [roleNames]);
  return rows;
}

// Gán vai trò cho user theo tên vai trò
async function assignToUser(userId, roleNames, db = pool) {
  await db.query('INSERT INTO UserRoles (UserId, RoleId) SELECT ?, Id FROM Roles WHERE Name IN (?)', [userId, roleNames]);
}

// Xóa toàn bộ vai trò cũ của user rồi gán danh sách vai trò mới
async function replaceUserRoles(userId, roleIds, db = pool) {
  await db.query('DELETE FROM UserRoles WHERE UserId = ?', [userId]);
  await db.query('INSERT INTO UserRoles (UserId, RoleId) VALUES ?', [roleIds.map((roleId) => [userId, roleId])]);
}

module.exports = { findRoleNamesOfUser, findByNames, assignToUser, replaceUserRoles };
