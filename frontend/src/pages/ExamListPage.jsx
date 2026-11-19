// Danh sách đề thi thử (bao gồm bài kiểm tra xếp trình độ)
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getExams } from '../services/examService';
import { getErrorMessage } from '../utils/getErrorMessage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function ExamListPage() {
  const [exams, setExams] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getExams()
      .then(setExams)
      .catch((error) => setErrorMessage(getErrorMessage(error, 'Không tải được danh sách đề thi')));
  }, []);

  if (errorMessage) return <ErrorMessage message={errorMessage} />;
  if (!exams) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold">Thi thử</h1>
      {exams.length === 0 && <p className="mt-4 text-gray-500">Chưa có đề thi nào.</p>}
      <ul className="mt-4 space-y-3">
        {exams.map((exam) => (
          <li key={exam.Id} className="flex items-center justify-between rounded-lg border bg-white p-4">
            <div>
              <h2 className="font-semibold">
                {exam.Title} <span className="ml-2 rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">{exam.ExamType}</span>
              </h2>
              <p className="text-sm text-gray-600">{exam.Description}</p>
              <p className="text-xs text-gray-400">{exam.QuestionCount} câu · {exam.DurationMinutes} phút</p>
            </div>
            <Link to={`/exam/${exam.Id}`} className="rounded bg-blue-600 px-4 py-2 text-sm text-white">Làm bài</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
