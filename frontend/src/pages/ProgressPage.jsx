// Tiến độ & thành tích: bài học đã hoàn thành, điểm các lần làm bài, chuỗi ngày học, điểm yếu
import { useEffect, useState } from 'react';
import { getMistakes, getProgress } from '../services/progressService';
import { getErrorMessage } from '../utils/getErrorMessage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const SESSION_TYPE_LABELS = { quiz: 'Quiz', exam: 'Thi thử' };

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border bg-white p-4 text-center">
      <p className="text-2xl font-bold text-blue-700">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

export default function ProgressPage() {
  const [progress, setProgress] = useState(null);
  const [mistakes, setMistakes] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    Promise.all([getProgress(), getMistakes()])
      .then(([progressData, mistakeData]) => {
        setProgress(progressData);
        setMistakes(mistakeData);
      })
      .catch((error) => setErrorMessage(getErrorMessage(error, 'Không tải được tiến độ')));
  }, []);

  if (errorMessage) return <ErrorMessage message={errorMessage} />;
  if (!progress || !mistakes) return <Loading />;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Tiến độ học tập</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Bài học hoàn thành" value={`${progress.lessons.completed}/${progress.lessons.total}`} />
        <StatCard label="Chuỗi ngày học" value={`${progress.streakDays} ngày`} />
        <StatCard label="Điểm tích lũy" value={progress.totalPoints} />
        <StatCard label="Hoàn thành chung" value={`${progress.lessons.percent}%`} />
      </div>

      <section>
        <h2 className="font-semibold">Theo cấp độ</h2>
        <ul className="mt-2 space-y-2">
          {progress.lessons.byLevel.map((item) => (
            <li key={item.level} className="flex items-center gap-3">
              <span className="w-8 font-mono">{item.level}</span>
              <div className="h-3 flex-1 rounded bg-gray-200">
                <div className="h-3 rounded bg-blue-600" style={{ width: `${item.percent}%` }} />
              </div>
              <span className="w-16 text-right text-sm text-gray-500">{item.completed}/{item.total}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-semibold">Kết quả làm bài</h2>
        {progress.sessions.length === 0 && <p className="text-gray-500">Bạn chưa làm bài nào.</p>}
        <ul className="mt-2 space-y-1 text-sm">
          {progress.sessions.map((item) => (
            <li key={item.type}>
              {SESSION_TYPE_LABELS[item.type] || item.type}: {item.attempts} lượt · điểm trung bình {item.avgScore}% · cao nhất {item.bestScore}%
            </li>
          ))}
        </ul>
        {progress.recentScores.length > 0 && (
          <p className="mt-2 text-sm text-gray-600">Điểm gần đây: {progress.recentScores.map((item) => `${item.Score}%`).join(' → ')}</p>
        )}
      </section>

      <section>
        <h2 className="font-semibold">Điểm yếu cần cải thiện</h2>
        {mistakes.weakVocabularies.length === 0 && mistakes.weakSections.length === 0 && (
          <p className="text-gray-500">Chưa có dữ liệu lỗi sai.</p>
        )}
        <ul className="mt-2 space-y-1 text-sm">
          {mistakes.weakVocabularies.map((item) => (
            <li key={item.Id}>Từ <b>{item.Word}</b> ({item.Meaning}) – sai {item.wrongCount} lần</li>
          ))}
          {mistakes.weakSections.map((item) => (
            <li key={item.Section}>Phần <b>{item.Section}</b> – sai {item.wrongCount} câu</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
