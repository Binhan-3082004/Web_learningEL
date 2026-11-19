// Xử lý đường dẫn không tồn tại (404) và gom mọi lỗi về một định dạng JSON { message }
function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Không tìm thấy đường dẫn' });
}

// Express nhận biết error-handler nhờ có đủ 4 tham số, nên không được bỏ "next"
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.status) return res.status(err.status).json({ message: err.message });
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Dữ liệu đã tồn tại' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'JSON không hợp lệ' });
  console.error(err);
  res.status(500).json({ message: 'Lỗi hệ thống' });
}

module.exports = { notFoundHandler, errorHandler };
