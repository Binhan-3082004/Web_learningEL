// Khung giao diện cho trang đăng nhập / đăng ký: một thẻ ở giữa màn hình
import { Link, Outlet } from 'react-router-dom';
import logo from '../assets/logo.svg';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center overflow-y-auto px-4 py-4 sm:py-6">
      <Link to="/" className="mb-6 flex items-center gap-3 text-2xl font-bold text-blue-700">
        <img src={logo} alt="" className="h-10 w-10 rounded-lg" />
        English Learning
      </Link>
      <div className="w-full max-w-[440px] rounded-[20px] border border-gray-200 bg-white px-7 py-8 shadow-[0_2px_12px_rgba(15,23,42,0.10)] sm:px-8">
        <Outlet />
      </div>
    </div>
  );
}
