import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/getErrorMessage';
import ErrorMessage from '../components/ErrorMessage';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from?.pathname || '/';

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const GOOGLE_AUTH_URL = (() => {
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  })();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await login(usernameOrEmail, password);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Đăng nhập thất bại'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 px-3 ">
      <h1 className="text-xl font-bold">Đăng nhập</h1>
      <ErrorMessage message={errorMessage} />

      <label className="block">
        <span className="text-sm font-medium">Tên đăng nhập hoặc email</span>
        <input
          value={usernameOrEmail}
          onChange={(event) => setUsernameOrEmail(event.target.value)}
          placeholder='Nhập tên đăng nhập hoặc email'
          className="mt-2 w-full rounded-xl border p-2.5 "
          required
          autoFocus
        />
      </label>

      <label className="block mb-1">
        <span className="text-sm font-medium">Mật khẩu</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder='Nhập mật khẩu'
          className="mt-2 w-full  rounded-xl border p-2.5"
          required
        />
      </label>



      <button disabled={isSubmitting} className="w-full rounded-xl bg-blue-600 py-2.5 font-medium text-white disabled:opacity-60">
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm mt-1">
          <span className="bg-white px-2 text-gray-400">hoặc</span>
        </div>
      </div>
      <a
        href={GOOGLE_AUTH_URL}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 py-2 text-sm font-medium hover:bg-gray-50"
      >
        <svg className="h-7 w-5" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.8 2.5 30.2 0 24 0 14.7 0 6.7 5.4 2.6 13.3l7.8 6C12.4 13 17.8 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17z" />
          <path fill="#FBBC05" d="M10.4 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.9-4.7l-7.8-6A23.8 23.8 0 0 0 0 24c0 3.8.9 7.4 2.6 10.6l7.8-5.9z" />
          <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.3-7.7 2.3-6.2 0-11.5-4.2-13.4-9.9l-7.8 5.9C6.6 42.6 14.7 48 24 48z" />
        </svg>
        Đăng nhập bằng Google
      </a>
      <p className="text-center text-sm text-gray-900 mt-2">
        Chưa có tài khoản? <Link to="/register" className="text-blue-600 font-bold">Đăng ký</Link>
      </p>
      <p className="text-center text-sm text-gray-600">
        <Link to="/" className="font-medium text-blue-600"> Quay lại trang chủ </Link>
      </p>
    </form>
  );
}
