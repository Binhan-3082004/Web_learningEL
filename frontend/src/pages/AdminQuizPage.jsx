// Trang Admin quản lý bộ quiz độc lập. Route: /admin/quiz
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  adminGetQuizSets, adminCreateQuizSet, adminUpdateQuizSet, adminDeleteQuizSet,
  adminGetQuizSetQuestions, adminAddQuestion, adminUpdateQuestion, adminDeleteQuestion,
} from '../services/quizSetService';
import { getErrorMessage } from '../utils/getErrorMessage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const OPTS = ['A', 'B', 'C', 'D'];
const EMPTY_SET = { title: '', description: '' };
const EMPTY_Q   = { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', explanation: '', sortOrder: 0 };

const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100';
const labelCls = 'mb-1 block text-xs font-semibold text-gray-600';

// ── Form thêm/sửa bộ quiz ──
function QuizSetForm({ initial = EMPTY_SET, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-3">
      <div>
        <label className={labelCls}>Tên bộ quiz *</label>
        <input className={inputCls} required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="VD: Tiếng Anh cơ bản" />
      </div>
      <div>
        <label className={labelCls}>Mô tả</label>
        <textarea className={inputCls} rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Mô tả nội dung bộ quiz..." />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={loading}
          className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? 'Đang lưu...' : 'Lưu bộ quiz'}
        </button>
        <button type="button" onClick={onCancel}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
          Huỷ
        </button>
      </div>
    </form>
  );
}

// ── Form thêm/sửa câu hỏi ──
function QuestionForm({ initial = EMPTY_Q, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5 space-y-4">
      <h4 className="text-sm font-bold text-blue-800">
        {initial.question ? '✏️ Sửa câu hỏi' : '➕ Thêm câu hỏi mới'}
      </h4>

      {/* Câu hỏi */}
      <div>
        <label className={labelCls}>Nội dung câu hỏi *</label>
        <textarea className={inputCls} required rows={2}
          value={form.question}
          onChange={(e) => set('question', e.target.value)}
          placeholder="Nhập câu hỏi trắc nghiệm..." />
      </div>

      {/* 4 đáp án */}
      <div>
        <label className={labelCls}>4 đáp án *</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {OPTS.map((opt) => (
            <div key={opt} className="flex items-center gap-2">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold
                ${form.correctOption === opt ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {opt}
              </span>
              <input
                className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2
                  ${form.correctOption === opt
                    ? 'border-green-400 bg-green-50 focus:ring-green-100'
                    : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'}`}
                required
                value={form[`option${opt}`]}
                onChange={(e) => set(`option${opt}`, e.target.value)}
                placeholder={`Đáp án ${opt}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Chọn đáp án đúng */}
      <div className="flex flex-wrap items-center gap-3">
        <span className={labelCls + ' mb-0'}>Đáp án đúng:</span>
        {OPTS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => set('correctOption', opt)}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition
              ${form.correctOption === opt
                ? 'bg-green-500 text-white shadow-md scale-110'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {opt}
          </button>
        ))}
        <span className="text-xs text-gray-500">
          → Đáp án <b className="text-green-600">{form.correctOption}</b> được chọn là đúng
        </span>
      </div>

      {/* Giải thích */}
      <div>
        <label className={labelCls}>Giải thích (tuỳ chọn)</label>
        <input className={inputCls}
          value={form.explanation}
          onChange={(e) => set('explanation', e.target.value)}
          placeholder="Giải thích tại sao đáp án đúng (hiện khi xem kết quả)..." />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={loading}
          className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? 'Đang lưu...' : 'Lưu câu hỏi'}
        </button>
        <button type="button" onClick={onCancel}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
          Huỷ
        </button>
      </div>
    </form>
  );
}

// ── Panel câu hỏi của 1 bộ quiz (mở rộng bên dưới card) ──
function QuizSetPanel({ quizSetId }) {
  const [questions, setQuestions] = useState(null);
  const [qMode, setQMode] = useState(null);  // null | 'create' | {id, data}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setQuestions(null);
    adminGetQuizSetQuestions(quizSetId)
      .then(setQuestions)
      .catch((e) => setError(getErrorMessage(e)));
  };
  useEffect(() => { load(); }, [quizSetId]);

  const handleAdd = async (body) => {
    setLoading(true);
    try { await adminAddQuestion(quizSetId, body); setQMode(null); load(); }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (body) => {
    setLoading(true);
    try { await adminUpdateQuestion(qMode.id, body); setQMode(null); load(); }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa câu hỏi này?')) return;
    try { await adminDeleteQuestion(id); load(); }
    catch (e) { setError(getErrorMessage(e)); }
  };

  return (
    <div className="border-t border-blue-100 bg-gray-50 px-5 py-5 space-y-4">
      {error && <ErrorMessage message={error} />}

      {/* Nút thêm câu hỏi — nổi bật */}
      {!qMode && (
        <button
          onClick={() => setQMode('create')}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-300 bg-white py-3 text-sm font-semibold text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Thêm câu hỏi trắc nghiệm
        </button>
      )}

      {/* Form câu hỏi */}
      {qMode && (
        <QuestionForm
          initial={qMode === 'create' ? EMPTY_Q : qMode.data}
          onSubmit={qMode === 'create' ? handleAdd : handleUpdate}
          onCancel={() => setQMode(null)}
          loading={loading}
        />
      )}

      {/* Danh sách câu hỏi */}
      {!questions && <Loading />}

      {questions?.length === 0 && !qMode && (
        <p className="text-center text-sm text-gray-400 py-4">
          Chưa có câu hỏi nào. Nhấn nút trên để thêm câu đầu tiên!
        </p>
      )}

      <div className="space-y-3">
        {questions?.map((q, i) => (
          <div key={q.Id} className="rounded-xl border border-gray-200 bg-white p-4">
            {/* Câu hỏi đang sửa */}
            {qMode?.id === q.Id ? (
              <QuestionForm
                initial={qMode.data}
                onSubmit={handleUpdate}
                onCancel={() => setQMode(null)}
                loading={loading}
              />
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900 leading-snug">
                    <span className="mr-1.5 text-gray-400">#{i + 1}</span>
                    {q.Question}
                  </p>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      onClick={() => setQMode({
                        id: q.Id,
                        data: { question: q.Question, optionA: q.OptionA, optionB: q.OptionB, optionC: q.OptionC, optionD: q.OptionD, correctOption: q.CorrectOption, explanation: q.Explanation || '', sortOrder: q.SortOrder }
                      })}
                      className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100"
                    >Sửa</button>
                    <button
                      onClick={() => handleDelete(q.Id)}
                      className="rounded-lg border border-red-100 px-2.5 py-1 text-xs text-red-500 hover:bg-red-50"
                    >Xóa</button>
                  </div>
                </div>

                {/* 4 đáp án */}
                <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {OPTS.map((opt) => (
                    <div key={opt}
                      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs
                        ${q.CorrectOption === opt ? 'bg-green-100 text-green-800 font-bold' : 'bg-gray-50 text-gray-600'}`}
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold
                        ${q.CorrectOption === opt ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {opt}
                      </span>
                      {q[`Option${opt}`]}
                      {q.CorrectOption === opt && <span className="ml-auto">✓</span>}
                    </div>
                  ))}
                </div>

                {q.Explanation && (
                  <p className="mt-2 text-xs text-gray-400 italic">💡 {q.Explanation}</p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Trang chính ──
export default function AdminQuizPage() {
  const [sets, setSets] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [openSetId, setOpenSetId] = useState(null);  // accordion: bộ quiz đang mở
  const [setMode, setSetMode] = useState(null);       // null | 'create' | {id, data}
  const [setLoading, setSetLoading] = useState(false);

  const loadSets = () =>
    adminGetQuizSets()
      .then(setSets)
      .catch((e) => setErrorMsg(getErrorMessage(e)));

  useEffect(() => { loadSets(); }, []);

  const handleCreateSet = async (body) => {
    setSetLoading(true);
    try { await adminCreateQuizSet(body); setSetMode(null); loadSets(); }
    catch (e) { setErrorMsg(getErrorMessage(e)); }
    finally { setSetLoading(false); }
  };

  const handleUpdateSet = async (body) => {
    setSetLoading(true);
    try { await adminUpdateQuizSet(setMode.id, body); setSetMode(null); loadSets(); }
    catch (e) { setErrorMsg(getErrorMessage(e)); }
    finally { setSetLoading(false); }
  };

  const handleDeleteSet = async (id, title) => {
    if (!window.confirm(`Xóa bộ quiz "${title}"? Tất cả câu hỏi trong bộ sẽ bị xóa luôn.`)) return;
    try {
      await adminDeleteQuizSet(id);
      if (openSetId === id) setOpenSetId(null);
      loadSets();
    }
    catch (e) { setErrorMsg(getErrorMessage(e)); }
  };

  if (!sets && !errorMsg) return <Loading />;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-sm text-blue-600 hover:underline">← Tổng quan</Link>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Quiz</h1>
        </div>
        <button
          onClick={() => { setSetMode('create'); setOpenSetId(null); }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Thêm bộ quiz
        </button>
      </div>

      <p className="text-sm text-gray-500 -mt-2">
        Tạo bộ quiz, bấm vào bộ quiz để thêm câu hỏi trắc nghiệm (A/B/C/D).
      </p>

      <ErrorMessage message={errorMsg} />

      {/* Form thêm/sửa bộ quiz */}
      {setMode && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="mb-4 text-sm font-bold text-gray-900">
            {setMode === 'create' ? '+ Thêm bộ quiz mới' : `✏️ Sửa bộ quiz "${setMode.data.title}"`}
          </h2>
          <QuizSetForm
            initial={setMode === 'create' ? EMPTY_SET : setMode.data}
            onSubmit={setMode === 'create' ? handleCreateSet : handleUpdateSet}
            onCancel={() => setSetMode(null)}
            loading={setLoading}
          />
        </div>
      )}

      {/* Empty state */}
      {sets?.length === 0 && !setMode && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <div className="text-5xl mb-4">📝</div>
          <p className="font-semibold text-gray-700">Chưa có bộ quiz nào</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Nhấn "Thêm bộ quiz" để tạo bộ quiz đầu tiên</p>
          <button
            onClick={() => setSetMode('create')}
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Thêm bộ quiz
          </button>
        </div>
      )}

      {/* Danh sách bộ quiz — dạng accordion */}
      <div className="space-y-3">
        {sets?.map((s) => {
          const isOpen = openSetId === s.Id;
          return (
            <div key={s.Id} className={`overflow-hidden rounded-2xl border-2 transition-all
              ${isOpen ? 'border-blue-400 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}`}>

              {/* Header của bộ quiz — bấm để mở/đóng */}
              <div
                className={`flex cursor-pointer items-center justify-between px-5 py-4 ${isOpen ? 'bg-blue-600' : 'bg-white'}`}
                onClick={() => setOpenSetId(isOpen ? null : s.Id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mũi tên accordion */}
                  <svg
                    className={`h-5 w-5 shrink-0 transition-transform ${isOpen ? 'rotate-90 text-white' : 'text-gray-400'}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                  <div className="min-w-0">
                    <p className={`font-bold truncate ${isOpen ? 'text-white' : 'text-gray-900'}`}>{s.Title}</p>
                    {s.Description && (
                      <p className={`text-xs truncate ${isOpen ? 'text-blue-100' : 'text-gray-400'}`}>{s.Description}</p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 ml-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold
                    ${isOpen ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>
                    {s.QuestionCount} câu
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSetMode({ id: s.Id, data: { title: s.Title, description: s.Description || '' } }); }}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition
                      ${isOpen ? 'border-white/30 text-white hover:bg-white/20' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >Sửa</button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteSet(s.Id, s.Title); }}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition
                      ${isOpen ? 'border-red-300 text-red-200 hover:bg-red-500/30' : 'border-red-100 text-red-500 hover:bg-red-50'}`}
                  >Xóa</button>
                </div>
              </div>

              {/* Panel câu hỏi — mở rộng khi click */}
              {isOpen && <QuizSetPanel quizSetId={s.Id} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
