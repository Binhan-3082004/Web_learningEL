// Các hàm kiểm tra và làm sạch dữ liệu đầu vào dùng chung. Dữ liệu sai sẽ ném HttpError 400.
const HttpError = require('../utils/HttpError');
const { LEVELS } = require('../utils/constants');

/**
 * Kiểm tra chuỗi văn bản: bỏ khoảng trắng thừa, giới hạn độ dài.
 * Nếu không bắt buộc và bỏ trống thì trả về null.
 */
function parseText(value, label, { max = 255, required = true } = {}) {
  const isEmpty = value === undefined || value === null || value === '';
  if (isEmpty) {
    if (required) throw new HttpError(400, `${label} là bắt buộc`);
    return null;
  }
  if (typeof value !== 'string') throw new HttpError(400, `${label} không hợp lệ`);

  const text = value.trim();
  if (!text) {
    if (required) throw new HttpError(400, `${label} là bắt buộc`);
    return null;
  }
  if (text.length > max) throw new HttpError(400, `${label} quá dài (tối đa ${max} ký tự)`);
  return text;
}

// Cấp độ A1-C2. Nếu bỏ trống thì dùng defaultLevel (nếu không có defaultLevel thì báo lỗi)
function parseLevel(value, defaultLevel = null) {
  if (value === undefined || value === null || value === '') {
    if (defaultLevel) return defaultLevel;
    throw new HttpError(400, 'Cấp độ là bắt buộc');
  }
  if (!LEVELS.includes(value)) throw new HttpError(400, 'Cấp độ phải thuộc A1-C2');
  return value;
}

// Mã (ID) phải là số nguyên dương
function parseId(value, label = 'ID') {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, `${label} không hợp lệ`);
  return id;
}

// Danh sách mã, tự loại phần tử trùng
function parseIdList(values, label) {
  if (values === undefined || values === null) return [];
  if (!Array.isArray(values)) throw new HttpError(400, `${label} phải là danh sách`);
  return [...new Set(values.map((value) => parseId(value, label)))];
}

module.exports = { parseText, parseLevel, parseId, parseIdList };
