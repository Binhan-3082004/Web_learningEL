// Controller quản lý ngữ pháp (Admin) - FR10
const grammarModel = require('../../models/grammarModel');
const grammarService = require('../../services/grammarService');
const HttpError = require('../../utils/HttpError');
const { parseId } = require('../../validators/commonValidator');
const { validateGrammarBody } = require('../../validators/grammarValidator');

async function listGrammars(req, res) {
  res.json(await grammarModel.findAll());
}

async function getGrammar(req, res) {
  res.json(await grammarService.getGrammarDetail(parseId(req.params.id)));
}

async function createGrammar(req, res) {
  const id = await grammarService.createGrammar(validateGrammarBody(req.body));
  res.status(201).json({ id });
}

async function updateGrammar(req, res) {
  await grammarService.updateGrammar(parseId(req.params.id), validateGrammarBody(req.body));
  res.json({ message: 'Đã cập nhật' });
}

async function deleteGrammar(req, res) {
  const affectedRows = await grammarModel.remove(parseId(req.params.id));
  if (!affectedRows) throw new HttpError(404, 'Không tìm thấy cấu trúc ngữ pháp');
  res.json({ message: 'Đã xóa' });
}

module.exports = { listGrammars, getGrammar, createGrammar, updateGrammar, deleteGrammar };
