// Lỗi có kèm mã HTTP, ném ra ở bất kỳ đâu để errorHandler trả về đúng status cho client
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = HttpError;
