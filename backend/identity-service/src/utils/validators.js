// Các hàm kiểm tra định dạng dữ liệu đầu vào (trả về true/false)
const isEmail = (value) =>
  typeof value === 'string' && value.length <= 256 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isUserName = (value) => typeof value === 'string' && /^[a-zA-Z0-9_]{4,30}$/.test(value);

// Mật khẩu: 8-72 ký tự (giới hạn của bcrypt), có cả chữ và số
const isStrongPassword = (value) =>
  typeof value === 'string' && value.length >= 8 && value.length <= 72 && /[A-Za-z]/.test(value) && /\d/.test(value);

// Số điện thoại là tùy chọn: bỏ trống vẫn hợp lệ
const isPhoneNumber = (value) => value == null || value === '' || /^[0-9+\-\s]{9,15}$/.test(value);

const isFullName = (value) => typeof value === 'string' && value.trim() !== '' && value.length <= 100;

module.exports = { isEmail, isUserName, isStrongPassword, isPhoneNumber, isFullName };
