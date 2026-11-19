// Controller quản lý từ vựng (Admin) - FR10
const vocabularyModel = require('../../models/vocabularyModel');
const { importVocabulariesFromExcel } = require('../../services/vocabularyImportService');
const HttpError = require('../../utils/HttpError');
const { getPagination } = require('../../utils/pagination');
const { parseId, parseLevel } = require('../../validators/commonValidator');
const { validateVocabularyBody } = require('../../validators/vocabularyValidator');

async function listVocabularies(req, res) {
  const { page, limit, offset } = getPagination(req, 100);
  const level = req.query.level ? parseLevel(req.query.level) : null;
  const { total, items } = await vocabularyModel.search({ level, keyword: req.query.q, limit, offset, sortBy: 'newest' });
  res.json({ page, limit, total, items });
}

async function createVocabulary(req, res) {
  const id = await vocabularyModel.create(validateVocabularyBody(req.body));
  res.status(201).json({ id });
}

async function updateVocabulary(req, res) {
  const affectedRows = await vocabularyModel.update(parseId(req.params.id), validateVocabularyBody(req.body));
  if (!affectedRows) throw new HttpError(404, 'Không tìm thấy từ vựng');
  res.json({ message: 'Đã cập nhật' });
}

async function deleteVocabulary(req, res) {
  const affectedRows = await vocabularyModel.remove(parseId(req.params.id));
  if (!affectedRows) throw new HttpError(404, 'Không tìm thấy từ vựng');
  res.json({ message: 'Đã xóa' });
}

async function importVocabularies(req, res) {
  if (!req.file) throw new HttpError(400, 'Vui lòng chọn file .xlsx (trường "file")');
  res.json(await importVocabulariesFromExcel(req.file.buffer));
}

module.exports = { listVocabularies, createVocabulary, updateVocabulary, deleteVocabulary, importVocabularies };
