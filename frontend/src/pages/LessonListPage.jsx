// Lộ trình học: tab level A1-C2 + hiển thị bài học nhóm theo chặng. Route: /lessons
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessons } from '../services/lessonService';
import { getErrorMessage } from '../utils/getErrorMessage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const LEVEL_META = {
  A1: { label: 'A1', desc: 'Sơ cấp', color: 'emerald' },
  A2: { label: 'A2', desc: 'Căn bản', color: 'teal' },
  B1: { label: 'B1', desc: 'Trung cấp', color: 'blue' },
  B2: { label: 'B2', desc: 'Trên trung', color: 'indigo' },
  C1: { label: 'C1', desc: 'Nâng cao', color: 'purple' },
  C2: { label: 'C2', desc: 'Thành thạo', color: 'rose' },
};

// Màu active cho từng level
const ACTIVE_CLASSES = {
  A1: 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-100',
  A2: 'bg-teal-600 text-white border-teal-600 shadow-teal-100',
  B1: 'bg-blue-600 text-white border-blue-600 shadow-blue-100',
  B2: 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-100',
  C1: 'bg-purple-600 text-white border-purple-600 shadow-purple-100',
  C2: 'bg-rose-600 text-white border-rose-600 shadow-rose-100',
};

const BADGE_CLASSES = {
  A1: 'bg-emerald-600',
  A2: 'bg-teal-600',
  B1: 'bg-blue-600',
  B2: 'bg-indigo-600',
  C1: 'bg-purple-600',
  C2: 'bg-rose-600',
};

// Icon khóa
function LockIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

// Icon sách
function BookIcon({ className = '' }) {
  return (
    <svg className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

// Sao đánh giá
function Stars({ count = 0, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} className={`h-3 w-3 ${i < count ? 'text-yellow-400' : 'text-gray-200'}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// Card một bài học
function LessonCard({ lesson, index, isCurrent, level }) {
  const isLocked = !lesson.isCompleted && !isCurrent;
  const badgeColor = BADGE_CLASSES[level] || 'bg-blue-600';

  if (lesson.isReview) {
    return (
      <Link
        to={isLocked ? '#' : `/lessons/${lesson.id}`}
        className={`relative flex flex-col rounded-2xl border-2 p-4 transition
          ${isLocked ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60' : 'border-purple-200 bg-purple-50 hover:border-purple-400 hover:shadow-sm'}`}
      >
        <div className="flex items-start justify-between">
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-600">Ôn tập</span>
          {isLocked && <LockIcon />}
        </div>
        <BookIcon className="mt-2 text-purple-400" />
        <p className="mt-2 text-sm font-semibold text-gray-800 leading-snug">{lesson.title}</p>
        <Stars count={lesson.starRating} />
        <span className="mt-1 self-start rounded bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white">ÔN TẬP</span>
      </Link>
    );
  }

  return (
    <Link
      to={isLocked ? '#' : `/lessons/${lesson.id}`}
      className={`relative flex flex-col rounded-2xl border-2 p-4 transition
        ${lesson.isCompleted
          ? 'border-teal-200 bg-teal-50 hover:border-teal-400 hover:shadow-sm'
          : isCurrent
            ? 'border-amber-300 bg-amber-50 shadow-md hover:shadow-lg'
            : 'cursor-not-allowed border-gray-100 bg-white opacity-60'
        }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-semibold text-gray-400">Bài {index + 1}</span>
          {lesson.isCompleted && (
            <span className="ml-2 text-[10px] font-bold text-teal-600">✓ Hoàn thành</span>
          )}
          {isCurrent && !lesson.isCompleted && (
            <span className="ml-2 text-[10px] font-bold text-amber-600">Sẵn sàng học</span>
          )}
          {isLocked && (
            <span className="ml-2 text-[10px] text-gray-400">Chưa mở khóa</span>
          )}
        </div>
        {isLocked && <LockIcon />}
      </div>

      <BookIcon className={`mt-2 ${lesson.isCompleted ? 'text-teal-500' : isCurrent ? 'text-amber-500' : 'text-gray-300'}`} />
      <p className="mt-2 text-sm font-semibold text-gray-800 leading-snug">{lesson.title}</p>
      <Stars count={lesson.starRating} />

      {/* CTA cho bài hiện tại */}
      {isCurrent && !lesson.isCompleted && (
        <div className={`mt-3 flex items-center gap-1.5 self-start rounded-xl px-3 py-1.5 text-xs font-bold text-white ${badgeColor}`}>
          Bắt đầu
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      )}
    </Link>
  );
}

export default function LessonListPage() {
  const [selectedLevel, setSelectedLevel] = useState('A1');
  const [chapters, setChapters] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load bài học khi đổi level
  useEffect(() => {
    setLoading(true);
    setChapters(null);
    setErrorMessage('');
    getLessons(selectedLevel)
      .then(setChapters)
      .catch((err) => setErrorMessage(getErrorMessage(err, 'Không tải được danh sách bài học')))
      .finally(() => setLoading(false));
  }, [selectedLevel]);

  const totalLessons = chapters ? chapters.reduce((s, c) => s + c.lessons.length, 0) : 0;
  const totalChapters = chapters ? chapters.length : 0;

  // Tính globalIndex và bài hiện tại trước khi render
  let lessonMeta = [];
  if (chapters) {
    let idx = 0;
    let currentFound = false;
    lessonMeta = chapters.map((chapter) => ({
      ...chapter,
      lessons: chapter.lessons.map((lesson) => {
        const globalIdx = idx++;
        const isCurrent = !currentFound && !lesson.isCompleted;
        if (isCurrent) currentFound = true;
        return { ...lesson, globalIdx, isCurrent };
      }),
    }));
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lộ trình học của bạn</h1>
          <p className="text-sm text-gray-500 mt-0.5">Chọn cấp độ để xem các chặng & bài học tương ứng</p>
        </div>
        {chapters && (
          <span className="text-sm text-gray-500">{totalLessons} bài học · {totalChapters} chặng</span>
        )}
      </div>

      {/* Tab level A1 → C2 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {LEVELS.map((level) => {
          const meta = LEVEL_META[level];
          const isActive = selectedLevel === level;
          return (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all shadow-sm
                ${isActive
                  ? `${ACTIVE_CLASSES[level]} shadow-md`
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold
                ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {meta.label}
              </span>
              <span className="hidden sm:inline">{meta.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Nội dung */}
      {errorMessage && <ErrorMessage message={errorMessage} />}

      {loading && <Loading />}

      {!loading && !errorMessage && chapters && chapters.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 text-5xl">📚</div>
          <p className="text-lg font-semibold text-gray-700">Chưa có bài học nào ở cấp độ {selectedLevel}</p>
          <p className="mt-1 text-sm text-gray-400">Admin có thể thêm bài học mới trong trang quản trị</p>
        </div>
      )}

      {!loading && !errorMessage && lessonMeta.length > 0 && (
        <div className="space-y-8">
          {lessonMeta.map((chapter) => (
            <div key={chapter.chapter} className="space-y-3">
              {/* Chapter header */}
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${BADGE_CLASSES[selectedLevel] || 'bg-blue-600'}`}>
                  CHẶNG {String(chapter.chapter).padStart(2, '0')}
                </span>
                <span className="text-sm text-gray-500">{chapter.chapterTitle}</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              {/* Lesson grid: 5 cards per row */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {chapter.lessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    index={lesson.globalIdx}
                    isCurrent={lesson.isCurrent}
                    level={selectedLevel}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
