// Trang quản trị (chỉ Admin): thống kê người dùng và học liệu. Route: /admin
import { useEffect, useState } from 'react';
import { getContentStatistics, getUserStatistics } from '../services/adminService';
import { getErrorMessage } from '../utils/getErrorMessage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border bg-white p-4 text-center">
      <p className="text-2xl font-bold text-blue-700">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [userStats, setUserStats] = useState(null);
  const [contentStats, setContentStats] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    Promise.all([getUserStatistics(), getContentStatistics()])
      .then(([users, content]) => {
        setUserStats(users);
        setContentStats(content);
      })
      .catch((error) => setErrorMessage(getErrorMessage(error, 'Không tải được thống kê')));
  }, []);

  if (errorMessage) return <ErrorMessage message={errorMessage} />;
  if (!userStats || !contentStats) return <Loading />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản trị hệ thống</h1>

      <section>
        <h2 className="font-semibold">Người dùng</h2>
        <div className="mt-2 grid grid-cols-3 gap-3">
          <StatCard label="Tổng số" value={userStats.total} />
          <StatCard label="Đang hoạt động" value={userStats.active} />
          <StatCard label="Mới trong 7 ngày" value={userStats.newLast7Days} />
        </div>
      </section>

      <section>
        <h2 className="font-semibold">Học liệu</h2>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Từ vựng" value={contentStats.content.vocabularies} />
          <StatCard label="Bài học" value={contentStats.content.lessons} />
          <StatCard label="Ngữ pháp" value={contentStats.content.grammars} />
          <StatCard label="Đề thi" value={contentStats.content.exams} />
        </div>
      </section>

      <section>
        <h2 className="font-semibold">Hoạt động học tập</h2>
        <p className="mt-1 text-sm text-gray-600">
          {contentStats.activeLearnersLast7Days} người học trong 7 ngày qua · {contentStats.completedLessons} lượt hoàn thành bài học
        </p>
      </section>
    </div>
  );
}
