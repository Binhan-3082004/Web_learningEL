const HttpError = require('../utils/HttpError');
const { EXAM_TYPES } = require('../utils/constants');
const { parseText } = require('./commonValidator');

const OPTION_LABEL_PATTERN = /^[A-F]$/;

// Kiểm tra body khi Admin thêm/sửa đề thi
function validateExamBody(body = {}) {
  const durationMinutes = Number(body.durationMinutes ?? 30);
  if (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 300) {
    throw new HttpError(400, 'Thời lượng phải từ 1 đến 300 phút');
  }
  if (!EXAM_TYPES.includes(body.examType)) {
    throw new HttpError(400, `Loại đề phải thuộc: ${EXAM_TYPES.join(', ')}`);
  }
  return {
    title: parseText(body.title, 'Tên đề', { max: 256 }),
    examType: body.examType,
    durationMinutes,
    description: parseText(body.description, 'Mô tả', { max: 2000, required: false }),
  };
}

// Kiểm tra body của một câu hỏi. options có dạng { "A": "...", "B": "...", ... }
function validateQuestionBody(body = {}) {
  const options = body.options;
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new HttpError(400, 'Đáp án lựa chọn không hợp lệ');
  }

  const labels = Object.keys(options);
  if (labels.length < 2 || labels.length > 6 || !labels.every((label) => OPTION_LABEL_PATTERN.test(label))) {
    throw new HttpError(400, 'Các lựa chọn phải đánh nhãn A-F (tối thiểu 2)');
  }

  const cleanOptions = {};
  labels.forEach((label) => {
    cleanOptions[label] = parseText(options[label], `Lựa chọn ${label}`, { max: 500 });
  });

  const correctOption = String(body.correctOption || '').toUpperCase();
  if (!cleanOptions[correctOption]) throw new HttpError(400, 'Đáp án đúng phải là một trong các lựa chọn');

  return {
    section: parseText(body.section, 'Phần thi', { max: 50, required: false }) || 'Grammar',
    content: parseText(body.content, 'Nội dung câu hỏi', { max: 4000 }),
    options: JSON.stringify(cleanOptions),
    correctOption,
    explanation: parseText(body.explanation, 'Giải thích', { max: 2000, required: false }),
    audioUrl: parseText(body.audioUrl, 'Đường dẫn âm thanh', { max: 512, required: false }),
    sortOrder: Number.isInteger(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
  };
}

module.exports = { validateExamBody, validateQuestionBody };
