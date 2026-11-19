import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/getErrorMessage';
import ErrorMessage from '../components/ErrorMessage';

const INITIAL_FORM = { userName: '', fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' };

const FIELDS = [
  { name: 'userName', label: 'Tên đăng nhập', type: 'text', required: true },
  { name: 'fullName', label: 'Họ và tên', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phoneNumber', label: 'Số điện thoại (không bắt buộc)', type: 'tel', required: false },
  { name: 'password', label: 'Mật khẩu (tối thiểu 8 ký tự, gồm chữ và số)', type: 'password', required: true },
  { name: 'confirmPassword', label: 'Nhập lại mật khẩu', type: 'password', required: true },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await register(form);
      navigate('/login');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Đăng ký thất bại'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h1 className="text-xl font-bold">Đăng ký tài khoản</h1>
      <ErrorMessage message={errorMessage} />

      {FIELDS.map((field) => (
        <label key={field.name} className="block">
          <span className="text-sm font-medium">{field.label}</span>
          <input
            name={field.name}
            type={field.type}
            value={form[field.name]}
            onChange={handleChange}
            required={field.required}
            className="mt-1 w-full rounded border p-2"
          />
        </label>
      ))}

      <button disabled={isSubmitting} className="w-full rounded bg-blue-600 py-2 font-medium text-white disabled:opacity-60">
        {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Đã có tài khoản? <Link to="/login" className="text-blue-600">Đăng nhập</Link>
      </p>
    </form>
  );
}
