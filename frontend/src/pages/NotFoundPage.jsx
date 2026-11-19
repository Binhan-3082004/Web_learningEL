import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-gray-600">Không tìm thấy trang bạn yêu cầu.</p>
      <Link to="/" className="mt-4 inline-block text-blue-600">Về trang chủ</Link>
    </div>
  );
}
