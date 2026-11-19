// Quy tắc truy cập của các đường dẫn đi qua Gateway

// Route công khai (không cần token). Nếu client vẫn gửi token hợp lệ thì Gateway vẫn đọc để biết người dùng là ai.
const PUBLIC_ROUTES = [
  // Sửa regex này: thêm |google
  { method: 'POST', path: /^\/api\/auth\/(register|login|refresh|logout|google)$/ },
  { method: 'GET', path: /^\/api\/learning\/lessons$/ },
];

// Route chỉ dành cho Admin (RBAC lớp 1 - lớp 2 nằm ở từng service)
const ADMIN_ROUTES = [/^\/api\/users(\/|$)/, /^\/api\/learning\/admin(\/|$)/];

module.exports = { PUBLIC_ROUTES, ADMIN_ROUTES };
