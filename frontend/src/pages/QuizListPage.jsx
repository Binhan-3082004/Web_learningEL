// Trang người học: danh sách bộ quiz. Route: /quiz
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getQuizSets } from '../services/quizSetService';
import { getErrorMessage } from '../utils/getErrorMessage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

function QuizSetCard({ set }) {
  const hasQuestions = set.QuestionCount > 0;
  return (
    <Link
      to={hasQuestions ? `/quiz/${set.Id}` : '#'}
      className={`group flex flex-col rounded-2xl border-2 p-5 transition
        ${hasQuestions
          ? 'border-gray-200 bg-white hover:border-blue-400 hover:shadow-md'
          : 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-50'}`}
    >
      {/* Icon */}
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 transition">
        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-900 leading-snug line-clamp-2">{set.Title}</h3>

      {/* Description */}
      {set.Description && (
        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{set.Description}</p>
      )}

      {/* Footer */}
      <div className="mt-auto pt-4 flex items-center justify-between">
        <span className="text-xs text-gray-400">{set.QuestionCount} câu hỏi</span>
        {hasQuestions ? (
          <span className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white group-hover:bg-blue-700 transition">
            Làm quiz →
          </span>
        ) : (
          <span className="text-xs text-gray-400">Chưa có câu hỏi</span>
        )}
      </div>
    </Link>
  );
}

export default function QuizListPage() {
  const [sets, setSets] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getQuizSets()
      .then(setSets)
      .catch((e) => setErrorMessage(getErrorMessage(e, 'Không tải được danh sách quiz')));
  }, []);

  if (errorMessage) return <ErrorMessage message={errorMessage} />;
  if (!sets) return <Loading />;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Quiz trắc nghiệm</h1>
        <p className="mt-1 text-sm text-gray-500">Chọn một bộ quiz để bắt đầu luyện tập</p>
      </div>

      {sets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 text-6xl">📝</div>
          <p className="text-lg font-semibold text-gray-700">Chưa có bộ quiz nào</p>
          <p className="mt-1 text-sm text-gray-400">Admin sẽ thêm các bộ quiz sớm thôi!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sets.map((set) => <QuizSetCard key={set.Id} set={set} />)}
        </div>
      )}
    </div>
  );
}
