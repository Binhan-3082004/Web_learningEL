// Quiz trắc nghiệm từ vựng. Route: /quiz (mọi từ vựng) hoặc /quiz/:lessonId (theo bài học)
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { startQuiz, submitQuiz } from '../services/quizService';
import { getErrorMessage } from '../utils/getErrorMessage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const QUESTION_COUNT = 10;

export default function QuizPage() {
  const { lessonId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { vocabularyId: đáp án đã chọn }
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const loadNewQuiz = () => {
    setQuiz(null);
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
    setErrorMessage('');
    startQuiz({ lessonId: lessonId ? Number(lessonId) : undefined, count: QUESTION_COUNT })
      .then(setQuiz)
      .catch((error) => setErrorMessage(getErrorMessage(error, 'Không thể tạo Quiz')));
  };

  useEffect(loadNewQuiz, [lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    const answerList = quiz.questions.map((question) => ({
      vocabularyId: question.vocabularyId,
      answer: answers[question.vocabularyId] || '',
    }));
    try {
      setResult(await submitQuiz(quiz.sessionId, answerList));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Nộp bài thất bại'));
    }
  };

  if (errorMessage) return <ErrorMessage message={errorMessage} />;
  if (!quiz) return <Loading message="Đang tạo Quiz..." />;

  if (result) {
    const wrongResults = result.results.filter((item) => !item.correct);
    return (
      <div className="mx-auto max-w-xl">
        <h2 className="text-2xl font-bold">Kết quả: {result.correct}/{result.total} ({result.score}%)</h2>
        <p className="mt-1 text-gray-600">+{result.pointsAwarded} điểm</p>
        <ul className="mt-4 space-y-2">
          {wrongResults.map((item) => (
            <li key={item.vocabularyId} className="rounded border border-red-200 bg-red-50 p-3">
              <div>Bạn chọn: <b>{item.userAnswer || '(bỏ trống)'}</b></div>
              <div>Đáp án đúng: <b>{item.correctAnswer}</b></div>
            </li>
          ))}
        </ul>
        <button onClick={loadNewQuiz} className="mt-6 rounded bg-blue-600 px-4 py-2 text-white">Làm lại</button>
      </div>
    );
  }

  const question = quiz.questions[currentIndex];
  const isLastQuestion = currentIndex === quiz.questions.length - 1;

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-sm text-gray-500">Câu {currentIndex + 1}/{quiz.total}</p>
      <h2 className="mt-2 text-2xl font-bold">{question.prompt}</h2>
      {question.pronunciation && <p className="text-gray-500">{question.pronunciation}</p>}

      <div className="mt-4 grid gap-2">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => setAnswers({ ...answers, [question.vocabularyId]: option })}
            className={`rounded border p-3 text-left ${answers[question.vocabularyId] === option ? 'border-blue-600 bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-between">
        <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)} className="rounded border px-4 py-2 disabled:opacity-40">
          Trước
        </button>
        {isLastQuestion ? (
          <button onClick={handleSubmit} className="rounded bg-green-600 px-4 py-2 text-white">Nộp bài</button>
        ) : (
          <button onClick={() => setCurrentIndex(currentIndex + 1)} className="rounded bg-blue-600 px-4 py-2 text-white">Tiếp</button>
        )}
      </div>
    </div>
  );
}
