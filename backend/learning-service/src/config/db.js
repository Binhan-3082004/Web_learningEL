// Kết nối MySQL bằng connection pool và hàm tiện ích chạy transaction
const mysql = require('mysql2/promise');
const config = require('./index');

const pool = mysql.createPool({
  ...config.db,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  dateStrings: ['DATE'],
});

// Đồng bộ múi giờ + encoding UTF-8 cho mỗi connection mới
// SET NAMES utf8mb4 bắt buộc để tiếng Việt không bị vỡ
pool.pool.on('connection', (connection) => {
  connection.query(`SET NAMES utf8mb4`);
  connection.query(`SET time_zone = '${config.db.timezone}'`);
});

/**
 * Chạy nhiều câu SQL trong một transaction.
 * Nếu callback ném lỗi thì rollback toàn bộ, thành công thì commit.
 * @param {(connection) => Promise<any>} callback nhận connection để chạy các câu SQL
 */
async function withTransaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { pool, withTransaction };
