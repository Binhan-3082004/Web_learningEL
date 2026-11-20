import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const FEATURES = [
  {
    to: '/lessons',
    bgIcon: 'bg-blue-50',
    icon: (
      <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: 'Bài học',
    description: 'Học từ vựng và ngữ pháp theo từng cấp độ A1–C2.',
  },
  {
    to: '/quiz',
    bgIcon: 'bg-yellow-50',
    icon: (
      <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    title: 'Quiz từ vựng',
    description: 'Luyện nhớ từ bằng câu hỏi trắc nghiệm ngẫu nhiên.',
  },
  {
    to: '/exams',
    bgIcon: 'bg-orange-50',
    icon: (
      <svg className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
      </svg>
    ),
    title: 'Thi thử',
    description: 'Làm đề mô phỏng có đồng hồ đếm ngược, chấm điểm tự động.',
  },
  {
    to: '/progress',
    bgIcon: 'bg-purple-50',
    icon: (
      <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Tiến độ',
    description: 'Theo dõi điểm số, chuỗi ngày học và điểm yếu cần cải thiện.',
  },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div>
      {/* ═══════════════════════════════════════════
          HERO SECTION — full-width lavender bg
      ═══════════════════════════════════════════ */}
      <section className="w-full bg-[#ECEEF8] px-4 py-12 md:py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">

          {/* ── LEFT: Text & CTA ── */}
          <div>
            {/* Badge */}
            <span className="inline-block rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold tracking-widest text-blue-600">
              TIẾNG ANH · A1–C2
            </span>

            {/* Headline */}
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.5] tracking-tight text-gray-900 md:text-5xl">
              {user ? (
                <>
                  Chào mừng trở lại,<br />
                  <span className="text-blue-600">{user.fullName}!</span>
                </>
              ) : (
                <div className=''>
                  Học tiếng Anh<br />
                  trực tuyến<br />
                  <span className="text-blue-600">mỗi ngày</span>
                </div>
              )}
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-base text-gray-500">
              {user
                ? `Trình độ hiện tại: ${user.englishLevel}`
                : 'Đăng ký miễn phí để lưu tiến độ và làm bài thi thử.'}
            </p>

            {/* CTA */}
            {!user && (
              <div className="mt-7">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-[#1e3a8a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1e40af]"
                >
                  Bắt đầu ngay
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <p className="mt-2 text-xs text-gray-400">Miễn phí đăng ký</p>
              </div>
            )}
          </div>

          {/* ── RIGHT: Preview Card ── */}
          <div className="hidden justify-end md:flex">
            {/* Outer lavender container */}
            <div className="relative rounded-3xl bg-[#D8DCF4] p-5 pb-10">
              {/* Inner white card */}
              <div className="w-72 rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Bài học</p>
                <h2 className="mt-1.5 text-lg font-bold leading-snug text-gray-900">
                  Một hành trình,<br />nhiều tiến bộ.
                </h2>
                <p className="mt-1 text-xs text-gray-400">Từ vựng & ngữ pháp</p>

                {/* Level grid: 2 rows × 3 cols */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {LEVELS.map((lvl, idx) => (
                    <button
                      key={lvl}
                      className={`rounded-xl py-2 text-sm font-semibold transition ${idx === 0
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                        }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quiz badge — bottom-right */}
              <div className="absolute -bottom-3 right-4 flex items-center gap-2 rounded-2xl bg-[#C8F135] px-4 py-2.5 shadow-md">
                <span className="text-lg font-black text-gray-900">Aa</span>
                <div>
                  <p className="text-xs font-bold leading-tight text-gray-900">Quiz từ vựng</p>
                  <p className="text-[10px] text-gray-600">Luyện nhớ mỗi ngày</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES SECTION — cream bg
      ═══════════════════════════════════════════ */}
      <section className="w-full px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-gray-900">Học theo cách của bạn</h2>
          <p className="mt-1 text-sm text-gray-500">
            Bài học, luyện tập và tiến độ — trong cùng một nơi.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <Link
                key={feature.to}
                to={feature.to}
                className="group relative rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
              >
                {/* Arrow ↗ top-right */}
                <svg
                  className="absolute right-4 top-4 h-4 w-4 text-gray-300 transition group-hover:text-blue-500"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>

                {/* Icon with colored bg */}
                <div className={`mb-4 inline-flex rounded-xl p-2 ${feature.bgIcon}`}>
                  {feature.icon}
                </div>

                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
