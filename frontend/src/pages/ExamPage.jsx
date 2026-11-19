// Thi thử có đồng hồ đếm ngược, tự nộp khi hết giờ. Route: /exam/:examId
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { startExam, submitExam } from '../services/examService';
import { updateMyProfile } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { useCountdown } from '../hooks/useCountdown';
import { formatCountdown } from '../utils/formatTime';
import { getErrorMessage } from '../utils/getErrorMessage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const WARNING_SECONDS = 60; // dưới 1 phút thì đồng hồ chuyển màu đỏ

export default function ExamPage() {
  const { examId } = useParams();
  const { setUser } = useAuth();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: 'A' | 'B' | ... }
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const hasSubmitted = useRef(false); // chặn nộp bài hai lần (bấm nút + hết giờ)

  useEffect(() => {
    startExam(examId)
      .then(setExam)
      .catch((error) => setErrorMessage(getErrorMessage(error, 'Không thể bắt đầu bài thi')));
  }, [examId]);

  const handleSubmit = useCallback(async () => {
    if (hasSubmitted.current || !exam) return;
    hasSubmitted.current = true;

    const answerList = exam.questions.map((question) => ({
      questionId: question.id,
      answer: answers[question.id] || '',
    }));
    try {
      const examResult = await submitExam(exam.sessionId, answerList);
      setResult(examResult);
      // Bài kiểm tra xếp trình độ: lưu trình độ đề xuất vào hồ sơ
      if (examResult.suggestedLevel) {
        const updatedUser = await updateMyProfile({ englishLevel: examResult.suggestedLevel });
        setUser(updatedUser);
      }
    } catch (error) {
      hasSubmitted.current = false;
      setErrorMessage(getErrorMessage(error, 'Nộp bài thất bại'));
    }
  }, [exam, answers, setUser]);

  const secondsLeft = useCountdown(exam?.endsAt, { enabled: Boolean(exam) && !result, onExpire: handleSubmit });

  if (errorMessage) return <ErrorMessage message={errorMessage} />;
  if (!exam) return <Loading message="Đang tải đề thi..." />;

  if (result) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-bold">Điểm: {result.score}% ({result.correct}/{result.total})</h2>
        {result.suggestedLevel && <p className="mt-2">Trình độ đề xuất: <b>{result.suggestedLevel}</b></p>}
        <p className="mt-1 text-gray-600">+{result.pointsAwarded} điểm</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="sticky top-0 flex items-center justify-between bg-gray-50 py-2">
        <h1 className="text-xl font-bold">{exam.title}</h1>
        <span className={`rounded px-3 py-1 font-mono ${secondsLeft < WARNING_SECONDS ? 'bg-red-100 text-red-700' : 'bg-gray-200'}`}>
          {formatCountdown(secondsLeft)}
        </span>
      </div>

      {exam.questions.map((question, index) => (
        <div key={question.id} className="mt-6">
          <p className="font-medium">{index + 1}. {question.content}</p>
          {question.audioUrl && <audio controls src={question.audioUrl} className="mt-2" />}
          <div className="mt-2 grid gap-1">
            {Object.entries(question.options).map(([optionKey, optionText]) => (
              <label key={optionKey} className="flex cursor-pointer items-center gap-2 rounded border bg-white p-2 hover:bg-gray-50">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={answers[question.id] === optionKey}
                  onChange={() => setAnswers({ ...answers, [question.id]: optionKey })}
                />
                <span>{optionKey}. {optionText}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button onClick={handleSubmit} className="mt-8 rounded bg-green-600 px-5 py-2 text-white">Nộp bài</button>
    </div>
  );
}
