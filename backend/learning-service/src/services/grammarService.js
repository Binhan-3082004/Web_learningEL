// Logic nghiệp vụ ngữ pháp cho Admin: một cấu trúc ngữ pháp luôn lưu kèm danh sách câu ví dụ
const { withTransaction } = require('../config/db');
const grammarModel = require('../models/grammarModel');
const HttpError = require('../utils/HttpError');

async function getGrammarDetail(grammarId) {
  const grammar = await grammarModel.findById(grammarId);
  if (!grammar) throw new HttpError(404, 'Không tìm thấy cấu trúc ngữ pháp');
  const examples = await grammarModel.findExamplesByGrammarId(grammarId);
  return { ...grammar, Examples: examples };
}

async function createGrammar(grammarData) {
  return withTransaction(async (connection) => {
    const grammarId = await grammarModel.create(grammarData, connection);
    await grammarModel.replaceExamples(grammarId, grammarData.examples, connection);
    return grammarId;
  });
}

async function updateGrammar(grammarId, grammarData) {
  await withTransaction(async (connection) => {
    const affectedRows = await grammarModel.update(grammarId, grammarData, connection);
    if (!affectedRows) throw new HttpError(404, 'Không tìm thấy cấu trúc ngữ pháp');
    await grammarModel.replaceExamples(grammarId, grammarData.examples, connection);
  });
}

module.exports = { getGrammarDetail, createGrammar, updateGrammar };
