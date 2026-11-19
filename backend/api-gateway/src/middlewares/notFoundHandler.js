function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Không tìm thấy đường dẫn' });
}

module.exports = notFoundHandler;
