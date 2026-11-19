// Danh sách bài học (khách cũng xem được). Lọc theo cấp độ.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessons } from '../services/lessonService';
import { LEVELS } from '../constants/levels';
import { getErrorMessage } from '../utils/getErrorMessage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function LessonListPage() {
  const [selectedLevel, setSelectedLevel] = useState('');
  const [lessons, setLessons] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setLessons(null);
    getLessons(selectedLevel)
      .then(setLessons)
      .catch((error) => setErrorMessage(getErrorMessage(error, 'Không tải được danh sách bài học')));
  }, [selectedLevel]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bài học</h1>
        <select value={selectedLevel} onChange={(event) => setSelectedLevel(event.target.value)} className="rounded border p-2">
          <option value="">Tất cả cấp độ</option>
          {LEVELS.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <ErrorMessage message={errorMessage} />
        {!lessons && !errorMessage && <Loading />}
        {lessons && lessons.length === 0 && <p className="text-gray-500">Chưa có bài học nào.</p>}
      </div>

      <ul className="mt-2 space-y-3">
        {lessons?.map((lesson) => (
          <li key={lesson.Id} className="flex items-center justify-between rounded-lg border bg-white p-4">
            <div>
              <h2 className="font-semibold">
                {lesson.Title} <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{lesson.Level}</span>
                {lesson.IsCompleted && <span className="ml-2 text-sm text-green-600">✓ Đã hoàn thành</span>}
              </h2>
              <p className="text-sm text-gray-600">{lesson.Description}</p>
              <p className="text-xs text-gray-400">{lesson.VocabularyCount} từ vựng</p>
            </div>
            <div className="flex gap-2">
              <Link to={`/lessons/${lesson.Id}`} className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white">Học</Link>
              <Link to={`/quiz/${lesson.Id}`} className="rounded border px-3 py-1.5 text-sm">Quiz</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
