import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../constants/roles';
import logo from '../assets/logo.svg';

const navLinkClass = ({ isActive }) =>
  `rounded px-3 py-2 text-sm  ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`;

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className=" sticky top-0 z-50 border-b bg-white">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-2 py-5">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-blue-700">
          <img src={logo} alt="" className="h-8 w-8" />
          English Learning
        </Link>

        <div className="flex flex-wrap font-medium items-center gap-1">
          <NavLink to="/lessons" className={navLinkClass}>Bài học</NavLink>
          <NavLink to="/quiz" className={navLinkClass}>Quiz</NavLink>
          <NavLink to="/exams" className={navLinkClass}>Thi thử</NavLink>
          <NavLink to="/progress" className={navLinkClass}>Tiến độ</NavLink>
          {hasRole(ROLES.ADMIN) && <NavLink to="/admin" className={navLinkClass}>Quản trị</NavLink>}
        </div>

        <div className="flex items-center gap-10 text-sm">
          {user ? (
            <>
              <span className="text-gray-900 font-medium">Xin chào, <b>{user.fullName}</b></span>
              <button onClick={handleLogout} className="rounded-xl text-white bg-red-600 px-3 py-1.5 hover:bg-red-800">Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded font-medium  px-3 py-1.5 hover:bg-gray-100">Đăng nhập</Link>
              <Link to="/register" className="rounded-xl  bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">Đăng ký</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
