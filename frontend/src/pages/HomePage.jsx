import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const FEATURES = [
  { to: '/lessons', title: 'Bài học', description: 'Học từ vựng và ngữ pháp theo từng cấp độ A1–C2.' },
  { to: '/quiz', title: 'Quiz từ vựng', description: 'Luyện nhớ từ bằng câu hỏi trắc nghiệm ngẫu nhiên.' },
  { to: '/exams', title: 'Thi thử', description: 'Làm đề mô phỏng có đồng hồ đếm ngược, chấm điểm tự động.' },
  { to: '/progress', title: 'Tiến độ', description: 'Theo dõi điểm số, chuỗi ngày học và điểm yếu cần cải thiện.' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div>
      <section className="rounded-lg bg-blue-600 p-8 text-white">
        <h1 className="text-3xl font-bold">
          {user ? `Chào mừng trở lại, ${user.fullName}!` : 'Học tiếng Anh trực tuyến mỗi ngày'}
        </h1>
        <p className="mt-2 text-blue-100">
          {user ? `Trình độ hiện tại của bạn: ${user.englishLevel}` : 'Đăng ký miễn phí để lưu tiến độ và làm bài thi thử.'}
        </p>
        {!user && (
          <Link to="/register" className="mt-4 inline-block rounded bg-white px-5 py-2 font-medium text-blue-700">
            Bắt đầu ngay
          </Link>
        )}
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <Link key={feature.to} to={feature.to} className="rounded-lg border bg-white p-5 hover:border-blue-400 hover:shadow-sm">
            <h2 className="text-lg font-semibold">{feature.title}</h2>
            <p className="mt-1 text-gray-600">{feature.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
