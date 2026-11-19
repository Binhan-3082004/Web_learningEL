// Chi tiết một bài học: từ vựng, ngữ pháp và nút đánh dấu hoàn thành. Route: /lessons/:lessonId
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { completeLesson, getLessonDetail } from '../services/lessonService';
import { getErrorMessage } from '../utils/getErrorMessage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function LessonDetailPage() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    getLessonDetail(lessonId)
      .then(setLesson)
      .catch((error) => setErrorMessage(getErrorMessage(error, 'Không tải được bài học')));
  }, [lessonId]);

  const handleComplete = async () => {
    try {
      const result = await completeLesson(lessonId);
      setLesson({ ...lesson, IsCompleted: true });
      setNotice(result.alreadyCompleted ? 'Bạn đã hoàn thành bài này trước đó.' : `Hoàn thành bài học! +${result.pointsAwarded} điểm`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  if (errorMessage) return <ErrorMessage message={errorMessage} />;
  if (!lesson) return <Loading />;

  return (
    <div>
      <Link to="/lessons" className="text-sm text-blue-600">← Danh sách bài học</Link>
      <h1 className="mt-2 text-2xl font-bold">{lesson.Title}</h1>
      <p className="text-gray-600">{lesson.Description}</p>

      <h2 className="mt-6 text-lg font-semibold">Từ vựng ({lesson.Vocabularies.length})</h2>
      <ul className="mt-2 divide-y rounded-lg border bg-white">
        {lesson.Vocabularies.map((vocabulary) => (
          <li key={vocabulary.Id} className="p-3">
            <b>{vocabulary.Word}</b> <span className="text-gray-500">{vocabulary.Pronunciation}</span> – {vocabulary.Meaning}
            {vocabulary.Example && <p className="text-sm italic text-gray-500">{vocabulary.Example}</p>}
          </li>
        ))}
      </ul>

      {lesson.Grammars.length > 0 && <h2 className="mt-6 text-lg font-semibold">Ngữ pháp</h2>}
      {lesson.Grammars.map((grammar) => (
        <div key={grammar.Id} className="mt-2 rounded-lg border bg-white p-4">
          <p className="font-mono font-semibold">{grammar.Pattern}</p>
          <p>{grammar.Meaning}</p>
          <p className="text-sm text-gray-600">{grammar.Usage}</p>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {grammar.Examples?.map((example) => (
              <li key={example.Id}>{example.Sentence} <span className="text-gray-500">– {example.Translation}</span></li>
            ))}
          </ul>
        </div>
      ))}

      {notice && <p className="mt-4 rounded bg-green-50 p-3 text-green-700">{notice}</p>}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleComplete}
          disabled={lesson.IsCompleted}
          className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {lesson.IsCompleted ? '✓ Đã hoàn thành' : 'Đánh dấu hoàn thành'}
        </button>
        <Link to={`/quiz/${lesson.Id}`} className="rounded border px-4 py-2">Làm Quiz bài này</Link>
      </div>
    </div>
  );
}
