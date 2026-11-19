// Khung giao diện cho trang đăng nhập / đăng ký: một thẻ ở giữa màn hình
import { Link, Outlet } from 'react-router-dom';
import logo from '../assets/logo.svg';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Link to="/" className="mb-6 flex items-center gap-2 text-2xl font-bold text-blue-700">
        <img src={logo} alt="" className="h-10 w-10" />
        English Learning
      </Link>
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <Outlet />
      </div>
    </div>
  );
}
