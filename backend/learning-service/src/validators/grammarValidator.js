const HttpError = require('../utils/HttpError');
const { parseText, parseLevel } = require('./commonValidator');

const MAX_EXAMPLES_PER_GRAMMAR = 50;

// Kiểm tra body khi Admin thêm/sửa cấu trúc ngữ pháp (kèm danh sách câu ví dụ)
function validateGrammarBody(body = {}) {
  const examples = Array.isArray(body.examples) ? body.examples : [];
  if (examples.length > MAX_EXAMPLES_PER_GRAMMAR) {
    throw new HttpError(400, `Tối đa ${MAX_EXAMPLES_PER_GRAMMAR} ví dụ`);
  }
  return {
    pattern: parseText(body.pattern, 'Cấu trúc', { max: 256 }),
    meaning: parseText(body.meaning, 'Ý nghĩa', { max: 2000, required: false }),
    usage: parseText(body.usage, 'Cách dùng', { max: 4000, required: false }),
    level: parseLevel(body.level, 'A1'),
    examples: examples.map((example) => ({
      sentence: parseText(example.sentence, 'Câu ví dụ', { max: 1000 }),
      translation: parseText(example.translation, 'Dịch nghĩa', { max: 1000, required: false }),
    })),
  };
}

module.exports = { validateGrammarBody };
