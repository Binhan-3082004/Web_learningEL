// Trang Admin quản lý bài học: danh sách, thêm, sửa, xóa. Route: /admin/lessons
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  adminGetLessons, adminGetLesson,
  adminCreateLesson, adminUpdateLesson, adminDeleteLesson,
} from '../services/lessonService';
import { getErrorMessage } from '../utils/getErrorMessage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const EMPTY_FORM = {
  title: '', level: 'A1', description: '', sortOrder: 0,
  chapter: 1, chapterTitle: '', isReview: false,
  thumbnailUrl: '', tag: '',
  quizQuestionCount: 10,
  vocabularyIds: '', grammarIds: '',
};

function LessonForm({ initial = EMPTY_FORM, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initial);
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title: form.title,
      level: form.level,
      description: form.description,
      sortOrder: Number(form.sortOrder),
      chapter: Number(form.chapter),
      chapterTitle: form.chapterTitle,
      isReview: form.isReview,
      thumbnailUrl: form.thumbnailUrl || null,
      tag: form.tag || null,
      quizQuestionCount: Number(form.quizQuestionCount) || 10,
      vocabularyIds: form.vocabularyIds
        ? form.vocabularyIds.split(',').map((s) => Number(s.trim())).filter(Boolean)
        : [],
      grammarIds: form.grammarIds
        ? form.grammarIds.split(',').map((s) => Number(s.trim())).filter(Boolean)
        : [],
    });
  };

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100';
  const labelCls = 'mb-1 block text-xs font-semibold text-gray-600';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Tiêu đề *</label>
          <input className={inputCls} required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Greetings" />
        </div>
        <div>
          <label className={labelCls}>Cấp độ *</label>
          <select className={inputCls} value={form.level} onChange={(e) => set('level', e.target.value)}>
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Mô tả</label>
        <textarea className={inputCls} rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Mô tả nội dung bài học..." />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Chặng (Chapter) *</label>
          <input type="number" className={inputCls} required min={1} value={form.chapter} onChange={(e) => set('chapter', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Tên chặng</label>
          <input className={inputCls} value={form.chapterTitle} onChange={(e) => set('chapterTitle', e.target.value)} placeholder="VD: Khởi đầu từ những điều quen thuộc" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Thứ tự trong chặng</label>
          <input type="number" className={inputCls} min={0} value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Tag</label>
          <input className={inputCls} value={form.tag} onChange={(e) => set('tag', e.target.value)} placeholder="VD: Từ vựng" />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isReview} onChange={(e) => set('isReview', e.target.checked)} className="h-4 w-4 rounded" />
            <span className="text-sm text-gray-700">Bài ôn tập tổng hợp</span>
          </label>
        </div>
      </div>

      <div>
        <label className={labelCls}>URL ảnh thumbnail</label>
        <input className={inputCls} value={form.thumbnailUrl} onChange={(e) => set('thumbnailUrl', e.target.value)} placeholder="https://..." />
      </div>

      <div>
        <label className={labelCls}>Số câu hỏi Quiz (4–30) *</label>
        <input
          type="number"
          className={inputCls}
          required
          min={4}
          max={30}
          value={form.quizQuestionCount}
          onChange={(e) => set('quizQuestionCount', e.target.value)}
        />
        <p className="mt-1 text-[11px] text-gray-400">Admin cấu hình số câu trắc nghiệm cho bài này (mặc định 10).</p>
      </div>

      <div>
        <label className={labelCls}>ID từ vựng (cách nhau bởi dấu phẩy)</label>
        <input className={inputCls} value={form.vocabularyIds} onChange={(e) => set('vocabularyIds', e.target.value)} placeholder="1, 2, 3, 4, 5" />
        <p className="mt-1 text-[11px] text-gray-400">Nhập các ID từ vựng (xem trang Từ vựng để lấy ID)</p>
      </div>

      <div>
        <label className={labelCls}>ID ngữ pháp (cách nhau bởi dấu phẩy)</label>
        <input className={inputCls} value={form.grammarIds} onChange={(e) => set('grammarIds', e.target.value)} placeholder="1, 2" />
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={loading} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? 'Đang lưu...' : 'Lưu bài học'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl border px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
          Hủy
        </button>
      </div>
    </form>
  );
}

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [mode, setMode] = useState(null); // null | 'create' | {id}
  const [editInitial, setEditInitial] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => {
    adminGetLessons()
      .then(setLessons)
      .catch((e) => setErrorMessage(getErrorMessage(e, 'Không tải được danh sách bài học')));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (body) => {
    setFormLoading(true);
    try {
      await adminCreateLesson(body);
      setMode(null);
      load();
    } catch (e) { setErrorMessage(getErrorMessage(e)); }
    finally { setFormLoading(false); }
  };

  const handleEdit = async (id) => {
    setFormLoading(true);
    try {
      const lesson = await adminGetLesson(id);
      setEditInitial({
        title: lesson.Title,
        level: lesson.Level,
        description: lesson.Description || '',
        sortOrder: lesson.SortOrder,
        chapter: lesson.Chapter,
        chapterTitle: lesson.ChapterTitle || '',
        isReview: Boolean(lesson.IsReview),
        thumbnailUrl: lesson.ThumbnailUrl || '',
        tag: lesson.Tag || '',
        quizQuestionCount: Number(lesson.QuizQuestionCount) || 10,
        vocabularyIds: (lesson.vocabularyIds || []).join(', '),
        grammarIds: (lesson.grammarIds || []).join(', '),
      });
      setMode({ id });
    } catch (e) { setErrorMessage(getErrorMessage(e)); }
    finally { setFormLoading(false); }
  };

  const handleUpdate = async (body) => {
    setFormLoading(true);
    try {
      await adminUpdateLesson(mode.id, body);
      setMode(null);
      load();
    } catch (e) { setErrorMessage(getErrorMessage(e)); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Xóa bài học "${title}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await adminDeleteLesson(id);
      load();
    } catch (e) { setErrorMessage(getErrorMessage(e)); }
  };

  if (!lessons && !errorMessage) return <Loading />;

  const filtered = (lessons || []).filter((l) =>
    l.Title?.toLowerCase().includes(search.toLowerCase()) ||
    String(l.Chapter).includes(search)
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-sm text-blue-600 hover:underline">← Tổng quan</Link>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý bài học</h1>
        </div>
        <button
          onClick={() => { setMode('create'); setEditInitial(null); }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Thêm bài học
        </button>
      </div>

      <ErrorMessage message={errorMessage} />

      {/* Form thêm/sửa */}
      {mode && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="mb-4 text-base font-bold text-gray-900">
            {mode === 'create' ? '+ Thêm bài học mới' : `Chỉnh sửa bài học #${mode.id}`}
          </h2>
          {formLoading && mode !== 'create' && !editInitial ? (
            <Loading />
          ) : (
            <LessonForm
              initial={mode === 'create' ? EMPTY_FORM : editInitial}
              onSubmit={mode === 'create' ? handleCreate : handleUpdate}
              onCancel={() => setMode(null)}
              loading={formLoading}
            />
          )}
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          className="w-64 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
          placeholder="Tìm theo tên, chặng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="text-sm text-gray-500">{filtered.length} bài học</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Tiêu đề</th>
              <th className="px-4 py-3 text-center">Cấp độ</th>
              <th className="px-4 py-3 text-center">Chặng</th>
              <th className="px-4 py-3 text-center">Thứ tự</th>
              <th className="px-4 py-3 text-center">Từ vựng</th>
              <th className="px-4 py-3 text-center">Loại</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Chưa có bài học nào.</td></tr>
            )}
            {filtered.map((lesson) => (
              <tr key={lesson.Id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-gray-400">#{lesson.Id}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{lesson.Title}</p>
                  {lesson.ChapterTitle && <p className="text-xs text-gray-400">{lesson.ChapterTitle}</p>}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">{lesson.Level}</span>
                </td>
                <td className="px-4 py-3 text-center text-gray-600">{lesson.Chapter}</td>
                <td className="px-4 py-3 text-center text-gray-600">{lesson.SortOrder}</td>
                <td className="px-4 py-3 text-center text-gray-600">{Number(lesson.VocabularyCount)}</td>
                <td className="px-4 py-3 text-center">
                  {lesson.IsReview
                    ? <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">ÔN TẬP</span>
                    : <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-700">HỌC</span>
                  }
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(lesson.Id)} className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50">Sửa</button>
                    <button onClick={() => handleDelete(lesson.Id, lesson.Title)} className="rounded-lg border border-red-100 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-50">Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
