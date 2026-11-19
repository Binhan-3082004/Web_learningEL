// Trang nhận code từ Google sau khi người dùng chấp nhận
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const called = useRef(false); // ngăn gọi 2 lần do StrictMode

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error || !code) {
      navigate('/login', { state: { error: 'Đăng nhập Google bị hủy' }, replace: true });
      return;
    }

    loginWithGoogle(code)
      .then(() => navigate('/', { replace: true }))
      .catch((err) => {
        navigate('/login', {
          state: { error: getErrorMessage(err, 'Đăng nhập Google thất bại') },
          replace: true,
        });
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Đang xử lý đăng nhập Google...</p>
    </div>
  );
}