// Lấy thông báo lỗi dễ hiểu từ lỗi axios (ưu tiên message do backend trả về)
export function getErrorMessage(error, fallbackMessage = 'Đã có lỗi xảy ra, vui lòng thử lại') {
  return error?.response?.data?.message || fallbackMessage;
}
