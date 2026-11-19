// Truy vấn bảng Vocabularies
const { pool } = require('../config/db');

const SORT_ORDERS = {
  alphabet: 'Word',
  newest: 'Id DESC',
};

// Tìm kiếm + phân trang. filters: { level, keyword }, sortBy: 'alphabet' | 'newest'
async function search({ level, keyword, limit, offset, sortBy = 'newest' }) {
  const conditions = [];
  const params = [];
  if (level) {
    conditions.push('Level = ?');
    params.push(level);
  }
  if (keyword) {
    conditions.push('(Word LIKE ? OR Meaning LIKE ?)');
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderClause = SORT_ORDERS[sortBy] || SORT_ORDERS.newest;

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM Vocabularies ${whereClause}`, params);
  const [items] = await pool.query(
    `SELECT * FROM Vocabularies ${whereClause} ORDER BY ${orderClause} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return { total, items };
}

// Ghép thêm JOIN/WHERE khi lọc theo bài học hoặc cấp độ
function buildFilter({ lessonId, level }) {
  const params = [];
  const conditions = ['1=1'];
  let joinClause = '';
  if (lessonId) {
    joinClause = 'JOIN LessonVocabularies lv ON lv.VocabularyId = v.Id';
    conditions.push('lv.LessonId = ?');
    params.push(lessonId);
  }
  if (level) {
    conditions.push('v.Level = ?');
    params.push(level);
  }
  return { joinClause, whereClause: conditions.join(' AND '), params };
}

// Từ vựng ngẫu nhiên để ra đề Quiz
async function findRandomForQuiz({ lessonId, level, limit }) {
  const { joinClause, whereClause, params } = buildFilter({ lessonId, level });
  const [rows] = await pool.query(
    `SELECT v.Id, v.Word, v.Pronunciation, v.Meaning FROM Vocabularies v ${joinClause}
     WHERE ${whereClause} ORDER BY RAND() LIMIT ?`,
    [...params, limit]
  );
  return rows;
}

// Từ vựng ngẫu nhiên để làm bộ flashcard
async function findRandomForFlashcards({ lessonId, level, limit }) {
  const { joinClause, whereClause, params } = buildFilter({ lessonId, level });
  const [rows] = await pool.query(
    `SELECT v.Id, v.Word, v.Pronunciation, v.Meaning, v.Example, v.AudioUrl FROM Vocabularies v ${joinClause}
     WHERE ${whereClause} ORDER BY RAND() LIMIT ?`,
    [...params, limit]
  );
  return rows;
}

// Kho từ vựng để lấy đáp án gây nhiễu (sai) cho câu hỏi Quiz
async function findDistractorCandidates(limit) {
  const [rows] = await pool.query('SELECT Id, Word, Meaning FROM Vocabularies ORDER BY RAND() LIMIT ?', [limit]);
  return rows;
}

async function create({ word, pronunciation, meaning, example, level, audioUrl }) {
  const [result] = await pool.query(
    'INSERT INTO Vocabularies (Word, Pronunciation, Meaning, Example, Level, AudioUrl) VALUES (?, ?, ?, ?, ?, ?)',
    [word, pronunciation, meaning, example, level, audioUrl]
  );
  return result.insertId;
}

// Trả về số dòng bị ảnh hưởng (0 nghĩa là không tìm thấy)
async function update(id, { word, pronunciation, meaning, example, level, audioUrl }) {
  const [result] = await pool.query(
    'UPDATE Vocabularies SET Word = ?, Pronunciation = ?, Meaning = ?, Example = ?, Level = ?, AudioUrl = ? WHERE Id = ?',
    [word, pronunciation, meaning, example, level, audioUrl, id]
  );
  return result.affectedRows;
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM Vocabularies WHERE Id = ?', [id]);
  return result.affectedRows;
}

// rows: mảng [word, pronunciation, meaning, example, level]
async function insertMany(rows) {
  await pool.query('INSERT INTO Vocabularies (Word, Pronunciation, Meaning, Example, Level) VALUES ?', [rows]);
}

async function countAll() {
  const [[row]] = await pool.query('SELECT COUNT(*) AS total FROM Vocabularies');
  return row.total;
}

module.exports = {
  search,
  findRandomForQuiz,
  findRandomForFlashcards,
  findDistractorCandidates,
  create,
  update,
  remove,
  insertMany,
  countAll,
};
