// Truy vấn bảng Lessons và các bảng liên kết LessonVocabularies, LessonGrammars
const { pool } = require('../config/db');

// Danh sách bài học cho người học, kèm số từ vựng và trạng thái hoàn thành (userId = 0 là khách)
async function findAllForLearner({ level, userId }) {
  const [rows] = await pool.query(
    `SELECT l.Id, l.Title, l.Level, l.Description, l.SortOrder,
            l.Chapter, l.ChapterTitle, l.IsReview, l.ThumbnailUrl, l.Tag,
            (SELECT COUNT(*) FROM LessonVocabularies lv WHERE lv.LessonId = l.Id) AS VocabularyCount,
            COALESCE((SELECT lp.IsCompleted FROM LessonProgresses lp WHERE lp.LessonId = l.Id AND lp.UserId = ?), 0) AS IsCompleted
     FROM Lessons l ${level ? 'WHERE l.Level = ?' : ''}
     ORDER BY l.Chapter, l.SortOrder, l.Id`,
    level ? [userId, level] : [userId]
  );
  return rows;
}

// Danh sách bài học cho Admin, kèm số từ vựng và số ngữ pháp
async function findAllForAdmin() {
  const [rows] = await pool.query(
    `SELECT l.*,
            (SELECT COUNT(*) FROM LessonVocabularies lv WHERE lv.LessonId = l.Id) AS VocabularyCount,
            (SELECT COUNT(*) FROM LessonGrammars lg WHERE lg.LessonId = l.Id) AS GrammarCount
     FROM Lessons l ORDER BY l.Chapter, l.SortOrder, l.Id`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM Lessons WHERE Id = ?', [id]);
  return rows[0] || null;
}

// Lấy vocabularyIds và grammarIds để admin form chỉnh sửa
async function findLinkedIds(lessonId) {
  const [vocabRows] = await pool.query(
    'SELECT VocabularyId AS id FROM LessonVocabularies WHERE LessonId = ? ORDER BY VocabularyId',
    [lessonId]
  );
  const [grammarRows] = await pool.query(
    'SELECT GrammarId AS id FROM LessonGrammars WHERE LessonId = ? ORDER BY GrammarId',
    [lessonId]
  );
  return {
    vocabularyIds: vocabRows.map((r) => r.id),
    grammarIds: grammarRows.map((r) => r.id),
  };
}

async function findVocabulariesOfLesson(lessonId) {
  const [rows] = await pool.query(
    'SELECT v.* FROM Vocabularies v JOIN LessonVocabularies lv ON lv.VocabularyId = v.Id WHERE lv.LessonId = ? ORDER BY lv.VocabularyId',
    [lessonId]
  );
  return rows;
}

async function create({ title, level, description, sortOrder, chapter, chapterTitle, isReview, thumbnailUrl, tag, quizQuestionCount }, db = pool) {
  const [result] = await db.query(
    `INSERT INTO Lessons (Title, Level, Description, SortOrder, Chapter, ChapterTitle, IsReview, ThumbnailUrl, Tag, QuizQuestionCount)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, level, description, sortOrder, chapter, chapterTitle, isReview ? 1 : 0, thumbnailUrl || null, tag || null, quizQuestionCount ?? 10]
  );
  return result.insertId;
}

// Trả về số dòng bị ảnh hưởng (0 nghĩa là không tìm thấy)
async function update(id, { title, level, description, sortOrder, chapter, chapterTitle, isReview, thumbnailUrl, tag, quizQuestionCount }, db = pool) {
  const [result] = await db.query(
    `UPDATE Lessons SET Title = ?, Level = ?, Description = ?, SortOrder = ?,
            Chapter = ?, ChapterTitle = ?, IsReview = ?, ThumbnailUrl = ?, Tag = ?, QuizQuestionCount = ?
     WHERE Id = ?`,
    [title, level, description, sortOrder, chapter, chapterTitle, isReview ? 1 : 0, thumbnailUrl || null, tag || null, quizQuestionCount ?? 10, id]
  );
  return result.affectedRows;
}

// Thay toàn bộ từ vựng và ngữ pháp thuộc bài học
async function replaceLinks(lessonId, { vocabularyIds, grammarIds }, db = pool) {
  await db.query('DELETE FROM LessonVocabularies WHERE LessonId = ?', [lessonId]);
  await db.query('DELETE FROM LessonGrammars WHERE LessonId = ?', [lessonId]);
  if (vocabularyIds.length) {
    await db.query('INSERT INTO LessonVocabularies (LessonId, VocabularyId) VALUES ?', [
      vocabularyIds.map((vocabularyId) => [lessonId, vocabularyId]),
    ]);
  }
  if (grammarIds.length) {
    await db.query('INSERT INTO LessonGrammars (LessonId, GrammarId) VALUES ?', [
      grammarIds.map((grammarId) => [lessonId, grammarId]),
    ]);
  }
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM Lessons WHERE Id = ?', [id]);
  return result.affectedRows;
}

async function countAll() {
  const [[row]] = await pool.query('SELECT COUNT(*) AS total FROM Lessons');
  return row.total;
}

module.exports = {
  findAllForLearner,
  findAllForAdmin,
  findById,
  findLinkedIds,
  findVocabulariesOfLesson,
  create,
  update,
  replaceLinks,
  remove,
  countAll,
};
