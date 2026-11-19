// Bọc controller async để mọi lỗi (throw / reject) được chuyển sang errorHandler thay vì làm treo request
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

module.exports = asyncHandler;
