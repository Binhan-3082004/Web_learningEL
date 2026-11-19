// Nhập hàng loạt từ vựng từ file Excel (.xlsx)
// Cột: Word | Pronunciation | Meaning | Example | Level. Dòng 1 là tiêu đề.
const ExcelJS = require('exceljs');
const vocabularyModel = require('../models/vocabularyModel');
const HttpError = require('../utils/HttpError');
const { LEVELS } = require('../utils/constants');

const MAX_ROWS_PER_IMPORT = 2000;
const COLUMN = { WORD: 1, PRONUNCIATION: 2, MEANING: 3, EXAMPLE: 4, LEVEL: 5 };

// Lấy nội dung văn bản của một ô (ô có thể chứa chữ định dạng, công thức, liên kết...)
function readCellText(row, columnIndex) {
  const value = row.getCell(columnIndex).value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    if (value.richText) return value.richText.map((part) => part.text).join('');
    return String(value.text ?? value.result ?? '');
  }
  return String(value);
}

async function importVocabulariesFromExcel(fileBuffer) {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(fileBuffer);
  } catch {
    throw new HttpError(400, 'Không đọc được file Excel');
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new HttpError(400, 'File không có bảng dữ liệu');

  const validRows = [];
  const errors = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // bỏ dòng tiêu đề

    const word = readCellText(row, COLUMN.WORD).trim();
    const meaning = readCellText(row, COLUMN.MEANING).trim();
    const level = readCellText(row, COLUMN.LEVEL).trim().toUpperCase() || 'A1';
    if (!word && !meaning) return; // dòng trống

    const isInvalid = !word || !meaning || word.length > 100 || !LEVELS.includes(level);
    if (isInvalid) {
      errors.push({ row: rowNumber, message: 'Dữ liệu không hợp lệ' });
      return;
    }
    validRows.push([
      word,
      readCellText(row, COLUMN.PRONUNCIATION).trim() || null,
      meaning,
      readCellText(row, COLUMN.EXAMPLE).trim() || null,
      level,
    ]);
  });

  if (validRows.length > MAX_ROWS_PER_IMPORT) {
    throw new HttpError(400, `Tối đa ${MAX_ROWS_PER_IMPORT} dòng mỗi lần nhập`);
  }
  if (validRows.length) await vocabularyModel.insertMany(validRows);
  return { imported: validRows.length, errors };
}

module.exports = { importVocabulariesFromExcel };
