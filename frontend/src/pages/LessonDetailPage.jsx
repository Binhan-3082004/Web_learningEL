// Chi tiết bài học: học từng từ vựng có audio, ngữ pháp, đánh dấu hoàn thành. Route: /lessons/:lessonId
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { completeLesson, getLessonDetail } from '../services/lessonService';
import { getErrorMessage } from '../utils/getErrorMessage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

// ── Tabs sidebar ──
const TABS = [
  { key: 'vocabulary', label: 'Từ vựng', icon: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  )},
  { key: 'grammar', label: 'Ngữ pháp', icon: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
    </svg>
  )},
];

// ── Audio player hook ──
function useAudio() {
  const audioRef = useRef(null);
  const play = (url) => {
    if (!url) return;
    if (audioRef.current) audioRef.current.pause();
    audioRef.current = new Audio(url);
    audioRef.current.play().catch(() => {});
  };
  return play;
}

// ── Progress bar ──
function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-teal-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 text-xs font-semibold text-gray-500">
        {String(current).padStart(2, '0')}/{String(total).padStart(2, '0')}
      </span>
    </div>
  );
}

// ── Vocabulary Card ──
function VocabCard({ vocab, index, total, onPrev, onNext, isLast, onPlayAudio }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Section label */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Từ vựng {String(index + 1).padStart(2, '0')}
        </span>
        <button className="rounded p-1 text-gray-300 hover:text-gray-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </button>
      </div>

      <p className="mb-4 text-sm font-semibold text-gray-700">{vocab.word && vocab.word.length > 0 ? vocab.word.charAt(0).toUpperCase() + vocab.word.slice(1) : ''} & các từ liên quan</p>

      {/* Main content: image placeholder + word info */}
      <div className="flex gap-6">
        {/* Left: illustration placeholder */}
        <div className="hidden shrink-0 md:flex h-40 w-44 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-100">
          <div className="text-5xl">📖</div>
          <span className="mt-2 text-xs text-gray-400">Let&apos;s learn!</span>
        </div>

        {/* Right: word details */}
        <div className="flex-1">
          <h2 className="text-4xl font-black text-gray-900">{vocab.word}</h2>
          <div className="mt-1 flex items-center gap-2">
            {vocab.pronunciation && (
              <span className="text-sm text-gray-500">/{vocab.pronunciation}/</span>
            )}
            {vocab.level && (
              <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700">
                {vocab.level}
              </span>
            )}
          </div>

          <p className="mt-3 text-xl font-semibold text-teal-600">{vocab.meaning}</p>

          {vocab.example && (
            <div className="mt-4 rounded-xl bg-gray-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Ví dụ trong giao tiếp</p>
              <p className="text-sm font-medium text-gray-800">{vocab.example}</p>
            </div>
          )}

          {/* Audio buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onPlayAudio(vocab.audioUrl)}
              disabled={!vocab.audioUrl}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <svg className="h-4 w-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
              Nghe phát âm
            </button>
            <button
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
              onClick={() => {
                if ('speechSynthesis' in window) {
                  const utterance = new SpeechSynthesisUtterance(vocab.word);
                  utterance.lang = 'en-US';
                  window.speechSynthesis.speak(utterance);
                }
              }}
            >
              <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
              Thử phát âm
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
        <button
          onClick={onPrev}
          disabled={index === 0}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-30 transition"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Từ trước
        </button>

        <span className="text-xs text-gray-400">Dùng phím ← → để chuyển từ</span>

        <button
          onClick={onNext}
          className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 transition"
        >
          {isLast ? 'Hoàn thành' : 'Từ tiếp theo'}
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Grammar Section ──
function GrammarSection({ grammars }) {
  if (!grammars || grammars.length === 0) {
    return <p className="text-gray-500 text-sm">Bài học này chưa có ngữ pháp.</p>;
  }
  return (
    <div className="space-y-4">
      {grammars.map((grammar, i) => (
        <div key={grammar.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Ngữ pháp {i + 1}</span>
          <p className="mt-2 font-mono text-lg font-bold text-gray-900">{grammar.pattern}</p>
          <p className="mt-1 text-gray-600">{grammar.meaning}</p>
          {grammar.usage && <p className="mt-1 text-sm text-gray-500">{grammar.usage}</p>}
          {grammar.examples && grammar.examples.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {grammar.examples.map((ex) => (
                <li key={ex.id} className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <span className="font-medium">{ex.sentence}</span>
                  <span className="ml-2 text-gray-400">– {ex.translation}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Page ──
export default function LessonDetailPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('vocabulary');
  const [vocabIndex, setVocabIndex] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [notice, setNotice] = useState('');
  const playAudio = useAudio();

  useEffect(() => {
    getLessonDetail(lessonId)
      .then(setLesson)
      .catch((error) => setErrorMessage(getErrorMessage(error, 'Không tải được bài học')));
  }, [lessonId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (activeTab !== 'vocabulary' || !lesson) return;
      if (e.key === 'ArrowRight') setVocabIndex((i) => Math.min(i + 1, lesson.vocabularies.length - 1));
      if (e.key === 'ArrowLeft') setVocabIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeTab, lesson]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const result = await completeLesson(lessonId);
      setLesson((prev) => ({ ...prev, isCompleted: true }));
      setNotice(result.alreadyCompleted ? 'Bạn đã hoàn thành bài này trước đó.' : `🎉 Hoàn thành! +${result.pointsAwarded} điểm`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setCompleting(false);
    }
  };

  if (errorMessage) return <ErrorMessage message={errorMessage} />;
  if (!lesson) return <Loading />;

  const vocabs = lesson.vocabularies || [];
  const currentVocab = vocabs[vocabIndex];
  const isLastVocab = vocabIndex === vocabs.length - 1;

  return (
    <div className="flex min-h-[calc(100vh-57px)] bg-gray-50">
      {/* ── Sidebar ── */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-gray-200 bg-white px-4 py-6 md:flex">
        {/* Course badge */}
        <div>
          <span className="inline-block rounded bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase text-teal-700">
            {lesson.level}
          </span>
          <h2 className="mt-2 text-base font-bold text-gray-900 leading-snug">
            Bài {lesson.sortOrder || lessonId}
          </h2>
          <p className="text-sm text-gray-500 leading-snug">{lesson.title}</p>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Nội dung bài học</p>
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition
                  ${activeTab === tab.key ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.key && (
                  <svg className="ml-auto h-3.5 w-3.5 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Luyện tập button */}
        <div className="mt-auto">
          <Link
            to={`/quiz/${lessonId}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            Luyện tập qua bài
          </Link>
          <p className="mt-3 text-center text-[10px] text-gray-400">Mỗi ngày một chút.<br />Tiếng Anh tốt hơn mỗi ngày.</p>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-4">
            <Link to="/lessons" className="hover:text-gray-600">Học tập</Link>
            <span>›</span>
            <span className="text-gray-600">{lesson.title}</span>
          </nav>

          {/* Lesson header */}
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
                {lesson.description && (
                  <p className="mt-1 text-sm text-gray-500">{lesson.description}</p>
                )}
              </div>
              <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                Bài {lesson.sortOrder || lessonId} · {lesson.tag || 'Từ vựng'}
              </span>
            </div>

            {/* Progress bar (vocabulary tab) */}
            {activeTab === 'vocabulary' && vocabs.length > 0 && (
              <div className="mt-3">
                <p className="mb-1.5 text-xs text-gray-400">Tiến trình bài học</p>
                <ProgressBar current={vocabIndex + 1} total={vocabs.length} />
              </div>
            )}
          </div>

          {/* Tab content */}
          {activeTab === 'vocabulary' && (
            <>
              {vocabs.length === 0 ? (
                <p className="text-gray-500">Bài học này chưa có từ vựng.</p>
              ) : (
                <VocabCard
                  vocab={currentVocab}
                  index={vocabIndex}
                  total={vocabs.length}
                  onPrev={() => setVocabIndex((i) => Math.max(i - 1, 0))}
                  onNext={() => {
                    if (isLastVocab) setActiveTab('grammar');
                    else setVocabIndex((i) => i + 1);
                  }}
                  isLast={isLastVocab}
                  onPlayAudio={playAudio}
                />
              )}
            </>
          )}

          {activeTab === 'grammar' && (
            <GrammarSection grammars={lesson.grammars} />
          )}

          {/* Notice */}
          {notice && (
            <div className="mt-4 rounded-xl bg-teal-50 border border-teal-200 p-3 text-sm font-medium text-teal-700">
              {notice}
            </div>
          )}

          {/* Complete CTA */}
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100">
                <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {lesson.isCompleted ? '✓ Đã hoàn thành bài học!' : 'Học xong, thử sức ngay!'}
                </p>
                <p className="text-xs text-gray-500">
                  {lesson.isCompleted ? 'Tiếp tục ôn luyện qua Quiz.' : 'Luyện tập để biến từ mới thành kiến thức của bạn.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!lesson.isCompleted && (
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60 transition"
                >
                  {completing ? 'Đang xử lý...' : '✓ Hoàn thành'}
                </button>
              )}
              <Link
                to={`/quiz/${lessonId}`}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                Luyện tập
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
