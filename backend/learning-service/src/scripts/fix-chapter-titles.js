// Script fix ChapterTitle bị vỡ encoding trong DB
// Chạy: node src/scripts/fix-chapter-titles.js
require('dotenv').config();
const mysql = require('mysql2/promise');

const chapterTitles = {
  1: 'Khởi đầu từ những điều quen thuộc',
  2: 'Khám phá cuộc sống mỗi ngày',
  3: 'Học tập, công việc & sức khỏe',
  4: 'Kết nối với thế giới xung quanh',
  5: 'Mở rộng góc nhìn của bạn',
};

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'learning_db',
    charset: 'utf8mb4',
  });

  await conn.query('SET NAMES utf8mb4');

  for (const [chapter, title] of Object.entries(chapterTitles)) {
    const [result] = await conn.query(
      'UPDATE Lessons SET ChapterTitle = ? WHERE Chapter = ?',
      [title, Number(chapter)]
    );
    console.log(`Chapter ${chapter}: updated ${result.affectedRows} rows → "${title}"`);
  }

  // Verify
  const [rows] = await conn.query('SELECT Id, Chapter, ChapterTitle FROM Lessons ORDER BY Id');
  console.log('\n=== Kết quả sau fix ===');
  rows.forEach(r => console.log(`  Lesson ${r.Id} | Chặng ${r.Chapter} | ${r.ChapterTitle}`));

  await conn.end();
  console.log('\n✅ Xong!');
}

main().catch(err => { console.error('❌ Lỗi:', err.message); process.exit(1); });
