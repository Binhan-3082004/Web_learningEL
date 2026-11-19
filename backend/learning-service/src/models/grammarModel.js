// Truy vấn bảng GrammarStructures và GrammarExamples
const { pool } = require('../config/db');

async function findAll() {
  const [rows] = await pool.query('SELECT * FROM GrammarStructures ORDER BY Level, Id');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM GrammarStructures WHERE Id = ?', [id]);
  return rows[0] || null;
}

async function findByLessonId(lessonId) {
  const [rows] = await pool.query(
    'SELECT g.* FROM GrammarStructures g JOIN LessonGrammars lg ON lg.GrammarId = g.Id WHERE lg.LessonId = ? ORDER BY g.Id',
    [lessonId]
  );
  return rows;
}

async function findExamplesByGrammarId(grammarId) {
  const [rows] = await pool.query('SELECT * FROM GrammarExamples WHERE GrammarId = ? ORDER BY Id', [grammarId]);
  return rows;
}

async function findExamplesByGrammarIds(grammarIds) {
  const [rows] = await pool.query('SELECT * FROM GrammarExamples WHERE GrammarId IN (?) ORDER BY Id', [grammarIds]);
  return rows;
}

async function create({ pattern, meaning, level, usage }, db = pool) {
  const [result] = await db.query(
    'INSERT INTO GrammarStructures (Pattern, Meaning, Level, `Usage`) VALUES (?, ?, ?, ?)',
    [pattern, meaning, level, usage]
  );
  return result.insertId;
}

// Trả về số dòng bị ảnh hưởng (0 nghĩa là không tìm thấy)
async function update(id, { pattern, meaning, level, usage }, db = pool) {
  const [result] = await db.query(
    'UPDATE GrammarStructures SET Pattern = ?, Meaning = ?, Level = ?, `Usage` = ? WHERE Id = ?',
    [pattern, meaning, level, usage, id]
  );
  return result.affectedRows;
}

// Thay toàn bộ câu ví dụ của một cấu trúc ngữ pháp
async function replaceExamples(grammarId, examples, db = pool) {
  await db.query('DELETE FROM GrammarExamples WHERE GrammarId = ?', [grammarId]);
  if (examples.length === 0) return;
  await db.query('INSERT INTO GrammarExamples (GrammarId, Sentence, Translation) VALUES ?', [
    examples.map((example) => [grammarId, example.sentence, example.translation]),
  ]);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM GrammarStructures WHERE Id = ?', [id]);
  return result.affectedRows;
}

async function countAll() {
  const [[row]] = await pool.query('SELECT COUNT(*) AS total FROM GrammarStructures');
  return row.total;
}

module.exports = {
  findAll,
  findById,
  findByLessonId,
  findExamplesByGrammarId,
  findExamplesByGrammarIds,
  create,
  update,
  replaceExamples,
  remove,
  countAll,
};
