// Đọc ?page=&limit= từ query string và tính vị trí bắt đầu (offset) cho câu SQL LIMIT/OFFSET
function getPagination(req, maxLimit = 50) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit, 10) || 10));
  return { page, limit, offset: (page - 1) * limit };
}

module.exports = { getPagination };
