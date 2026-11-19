// Nhận file Excel (.xlsx) tải lên, giữ trong bộ nhớ (không ghi ra đĩa)
const multer = require('multer');
const HttpError = require('../utils/HttpError');

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, callback) => {
    const isExcelFile = /\.xlsx$/i.test(file.originalname);
    callback(isExcelFile ? null : new HttpError(400, 'Chỉ hỗ trợ file .xlsx'), isExcelFile);
  },
});

module.exports = { uploadExcel };
