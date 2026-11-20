// Trang người học làm quiz. Route: /quiz/:id
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getQuizSets, getQuizSetQuestions, submitQuizSet } from '../services/quizSetService';
import { getErrorMessage } from '../utils/getErrorMessage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_KEYS   = ['OptionA', 'OptionB', 'OptionC', 'OptionD'];

function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="absolute left-0 top-0 h-full rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <span className="shrink-0 text-xs font-semibold text-gray-500">{current}/{total}</span>
    </div>
  );
}

export default function QuizPage() {
  const { id } = useParams();
  const [quizSet, setQuizSet] = useState(null);  // thông tin bộ quiz
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});    // { questionId: 'A'|'B'|'C'|'D' }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load thông tin bộ quiz và câu hỏi
    Promise.all([getQuizSets(), getQuizSetQuestions(id)])
      .then(([sets, qs]) => {
        setQuizSet(sets.find((s) => String(s.Id) === String(id)) || null);
        setQuestions(qs);
      })
      .catch((e) => setErrorMessage(getErrorMessage(e, 'Không tải được bộ quiz')));
  }, [id]);

  const handleSelect = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answerList = questions.map((q) => ({
        questionId: q.Id,
        selectedOption: answers[q.Id] || '',
      }));
      setResult(await submitQuizSet(id, answerList));
    } catch (e) {
      setErrorMessage(getErrorMessage(e, 'Nộp bài thất bại'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
  };

  if (errorMessage) return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <Link to="/quiz" className="text-sm text-blue-600 hover:underline">← Danh sách quiz</Link>
      <ErrorMessage message={errorMessage} />
    </div>
  );

  if (!questions) return <Loading message="Đang tải câu hỏi..." />;

  if (questions.length === 0) return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 text-center">
      <div className="text-5xl mb-4">📭</div>
      <p className="font-semibold text-gray-700">Bộ quiz này chưa có câu hỏi</p>
      <Link to="/quiz" className="mt-4 inline-block text-sm text-blue-600 hover:underline">← Quay lại</Link>
    </div>
  );

  // ── Màn hình kết quả ──
  if (result) {
    const { correct, total, score, results } = result;
    const isPerfect = correct === total;
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 space-y-4">
        <nav className="flex items-center gap-1.5 text-sm text-gray-400">
          <Link to="/quiz" className="hover:text-gray-600">Quiz</Link>
          <span>›</span>
          <span className="text-gray-600">{quizSet?.Title || `Bộ quiz #${id}`}</span>
        </nav>

        {/* Score card */}
        <div className={`rounded-2xl p-6 text-center border shadow-sm ${isPerfect ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
          <div className="text-5xl mb-2">{isPerfect ? '🏆' : score >= 70 ? '👍' : '📖'}</div>
          <h2 className="text-2xl font-bold text-gray-900">{correct}/{total} câu đúng</h2>
          <p className="mt-1 text-4xl font-black text-blue-600">{score}%</p>
          {isPerfect && <p className="mt-2 text-sm font-semibold text-green-600">🎉 Xuất sắc! Trả lời đúng tất cả!</p>}
        </div>

        {/* Chi tiết từng câu */}
        <div className="space-y-3">
          {results.map((r, i) => {
            const q = questions.find((q) => q.Id === r.questionId);
            if (!q) return null;
            const optIdx = OPTION_LABELS.indexOf(r.correctOption);
            const correctText = optIdx >= 0 ? q[OPTION_KEYS[optIdx]] : '';
            const selIdx = OPTION_LABELS.indexOf(r.selectedOption);
            const selectedText = selIdx >= 0 ? q[OPTION_KEYS[selIdx]] : '(bỏ trống)';
            return (
              <div key={r.questionId} className={`rounded-xl border p-4 text-sm ${r.correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <p className="font-semibold text-gray-800 mb-2">Câu {i + 1}: {q.Question}</p>
                {r.correct ? (
                  <p className="text-green-700">✓ {r.correctOption}. {correctText}</p>
                ) : (
                  <>
                    <p className="text-red-600">✗ Bạn chọn: {r.selectedOption ? `${r.selectedOption}. ${selectedText}` : '(bỏ trống)'}</p>
                    <p className="text-green-700 mt-0.5">✓ Đáp án đúng: {r.correctOption}. {correctText}</p>
                    {r.explanation && <p className="mt-1.5 text-gray-500 italic">💡 {r.explanation}</p>}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleRetry} className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
            🔄 Làm lại
          </button>
          <Link to="/quiz" className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 text-center hover:bg-gray-50 transition">
            ← Danh sách quiz
          </Link>
        </div>
      </div>
    );
  }

  // ── Màn hình làm quiz ──
  const q = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-5">
        <Link to="/quiz" className="hover:text-gray-600">Quiz</Link>
        <span>›</span>
        <span className="text-gray-600">{quizSet?.Title || `Bộ quiz #${id}`}</span>
      </nav>

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <h1 className="text-lg font-bold text-gray-900">{quizSet?.Title || 'Quiz'}</h1>
          <span className="text-xs text-gray-400">{answeredCount}/{questions.length} đã trả lời</span>
        </div>
        <ProgressBar current={currentIndex + 1} total={questions.length} />
      </div>

      {/* Card câu hỏi */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Câu {currentIndex + 1} / {questions.length}
        </p>
        <h2 className="text-xl font-bold text-gray-900 leading-snug">{q.Question}</h2>

        <div className="mt-5 space-y-2">
          {OPTION_LABELS.map((label, i) => {
            const optionText = q[OPTION_KEYS[i]];
            const isSelected = answers[q.Id] === label;
            return (
              <button
                key={label}
                onClick={() => handleSelect(q.Id, label)}
                className={`flex w-full items-center gap-3 rounded-xl border-2 p-3.5 text-left text-sm font-medium transition
                  ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold
                  ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {label}
                </span>
                {optionText}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-5 flex gap-3">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(currentIndex - 1)}
          className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
        >
          ← Trước
        </button>
        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition"
          >
            {submitting ? 'Đang nộp...' : `Nộp bài (${answeredCount}/${questions.length} câu)`}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="flex-1 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Tiếp →
          </button>
        )}
      </div>
    </div>
  );
}
