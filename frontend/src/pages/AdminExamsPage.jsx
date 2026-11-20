// Trang Admin quản lý đề thi + câu hỏi: danh sách, thêm, sửa, xóa. Route: /admin/exams
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { getErrorMessage } from '../utils/getErrorMessage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const EXAM_TYPES = ['TOEIC', 'IELTS', 'PLACEMENT'];
const ADMIN_EXAMS = '/learning/admin/exams';
const ADMIN_QUESTIONS = '/learning/admin/questions';

const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100';
const labelCls = 'mb-1 block text-xs font-semibold text-gray-600';

const EMPTY_EXAM = { title: '', examType: 'TOEIC', durationMinutes: 60, description: '' };

// Form thêm/sửa đề thi
function ExamForm({ initial = EMPTY_EXAM, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initial);
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className={labelCls}>Tên đề thi *</label>
        <input className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)} required placeholder="TOEIC Practice Test 1" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Loại đề *</label>
          <select className={inputCls} value={form.examType} onChange={(e) => set('examType', e.target.value)}>
            {EXAM_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Thời gian (phút) *</label>
          <input type="number" min={1} max={300} className={inputCls} value={form.durationMinutes} onChange={(e) => set('durationMinutes', e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Mô tả</label>
        <textarea className={inputCls} rows={2} value={form.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Mô tả đề thi..." />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Huỷ</button>
        <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
    </form>
  );
}

// Form thêm câu hỏi
const EMPTY_Q = { section: 'Grammar', content: '', options: { A: '', B: '', C: '', D: '' }, correctOption: 'A', explanation: '', audioUrl: '', sortOrder: 0 };

function QuestionForm({ onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(EMPTY_Q);
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setOpt = (label, val) => setForm((f) => ({ ...f, options: { ...f.options, [label]: val } }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-3 mt-3 border-t pt-3">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Thêm câu hỏi mới</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Phần thi</label>
          <input className={inputCls} value={form.section} onChange={(e) => set('section', e.target.value)} placeholder="Grammar" />
        </div>
        <div>
          <label className={labelCls}>Thứ tự</label>
          <input type="number" className={inputCls} value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Nội dung câu hỏi *</label>
        <textarea className={inputCls} rows={2} required value={form.content} onChange={(e) => set('content', e.target.value)} placeholder="She ___ to school every day." />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {['A', 'B', 'C', 'D'].map((label) => (
          <div key={label}>
            <label className={labelCls}>Đáp án {label} *</label>
            <input className={inputCls} required value={form.options[label]} onChange={(e) => setOpt(label, e.target.value)} placeholder={`Lựa chọn ${label}`} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Đáp án đúng *</label>
          <select className={inputCls} value={form.correctOption} onChange={(e) => set('correctOption', e.target.value)}>
            {['A', 'B', 'C', 'D'].map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>URL Audio</label>
          <input className={inputCls} value={form.audioUrl} onChange={(e) => set('audioUrl', e.target.value)} placeholder="https://..." />
        </div>
      </div>
      <div>
        <label className={labelCls}>Giải thích đáp án</label>
        <textarea className={inputCls} rows={2} value={form.explanation} onChange={(e) => set('explanation', e.target.value)} placeholder="Giải thích tại sao chọn đáp án này..." />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">Huỷ</button>
        <button type="submit" disabled={loading} className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
          {loading ? 'Đang lưu...' : 'Thêm câu hỏi'}
        </button>
      </div>
    </form>
  );
}

// Panel xem + thêm/xoá câu hỏi của 1 đề
function QuestionsPanel({ exam, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editQ, setEditQ] = useState(null); // {id, data}
  const [editLoading, setEditLoading] = useState(false);
  const [deleteQId, setDeleteQId] = useState(null);

  const fetchQ = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`${ADMIN_EXAMS}/${exam.Id}/questions`);
      setQuestions(data);
    } catch (err) { alert(getErrorMessage(err, 'Không tải được câu hỏi')); }
    finally { setLoading(false); }
  }, [exam.Id]);

  useEffect(() => { fetchQ(); }, [fetchQ]);

  const handleAddQ = async (body) => {
    setAddLoading(true);
    try {
      await apiClient.post(`${ADMIN_EXAMS}/${exam.Id}/questions`, body);
      setShowAdd(false); fetchQ();
    } catch (err) { alert(getErrorMessage(err, 'Lỗi thêm câu hỏi')); }
    finally { setAddLoading(false); }
  };

  const openEditQ = (q) => {
    const opts = typeof q.Options === 'string' ? JSON.parse(q.Options) : (q.Options || { A: '', B: '', C: '', D: '' });
    setEditQ({
      id: q.Id,
      data: { section: q.Section || 'Grammar', content: q.Content || '', options: opts, correctOption: q.CorrectOption || 'A', explanation: q.Explanation || '', audioUrl: q.AudioUrl || '', sortOrder: q.SortOrder || 0 },
    });
  };

  const handleEditQ = async (body) => {
    setEditLoading(true);
    try {
      await apiClient.put(`${ADMIN_QUESTIONS}/${editQ.id}`, body);
      setEditQ(null); fetchQ();
    } catch (err) { alert(getErrorMessage(err, 'Lỗi cập nhật câu hỏi')); }
    finally { setEditLoading(false); }
  };

  const handleDeleteQ = async () => {
    try {
      await apiClient.delete(`${ADMIN_QUESTIONS}/${deleteQId}`);
      setDeleteQId(null); fetchQ();
    } catch (err) { alert(getErrorMessage(err, 'Lỗi xoá câu hỏi')); }
  };

  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800">📋 Câu hỏi — {exam.Title}</h3>
        <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">× Đóng</button>
      </div>

      {loading ? <Loading /> : (
        <div className="space-y-2">
          {questions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Chưa có câu hỏi nào</p>
          ) : questions.map((q, idx) => {
            const opts = typeof q.Options === 'string' ? JSON.parse(q.Options) : (q.Options || {});
            const isEditing = editQ && editQ.id === q.Id;
            return (
              <div key={q.Id} className="rounded-xl bg-white border border-gray-100 p-3">
                {isEditing ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleEditQ(editQ.data); }} className="space-y-2">
                    <textarea className={inputCls} rows={2} value={editQ.data.content} onChange={(e) => setEditQ((eq) => ({ ...eq, data: { ...eq.data, content: e.target.value } }))} />
                    <div className="grid grid-cols-2 gap-2">
                      {['A', 'B', 'C', 'D'].map((label) => (
                        <input key={label} className={inputCls} placeholder={`Đáp án ${label}`} value={editQ.data.options[label] || ''}
                          onChange={(e) => setEditQ((eq) => ({ ...eq, data: { ...eq.data, options: { ...eq.data.options, [label]: e.target.value } } }))} />
                      ))}
                    </div>
                    <div className="flex gap-2 items-center">
                      <label className="text-xs text-gray-500">Đúng:</label>
                      <select className="rounded border px-2 py-1 text-xs" value={editQ.data.correctOption}
                        onChange={(e) => setEditQ((eq) => ({ ...eq, data: { ...eq.data, correctOption: e.target.value } }))}>
                        {['A', 'B', 'C', 'D'].map((l) => <option key={l}>{l}</option>)}
                      </select>
                      <button type="submit" disabled={editLoading} className="ml-auto rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white">Lưu</button>
                      <button type="button" onClick={() => setEditQ(null)} className="rounded-lg border px-3 py-1 text-xs text-gray-600">Huỷ</button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-800"><span className="text-gray-400 text-xs mr-1">#{idx + 1}</span>{q.Content}</p>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => openEditQ(q)} className="text-xs text-blue-600 hover:underline">Sửa</button>
                        <button onClick={() => setDeleteQId(q.Id)} className="text-xs text-red-500 hover:underline">Xoá</button>
                      </div>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {Object.entries(opts).map(([label, text]) => (
                        <span key={label} className={`text-xs px-2 py-0.5 rounded-full border ${label === q.CorrectOption ? 'bg-teal-100 border-teal-300 text-teal-700 font-bold' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                          {label}. {text}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}


      {showAdd ? (
        <QuestionForm onSubmit={handleAddQ} onCancel={() => setShowAdd(false)} loading={addLoading} />
      ) : (
        <button onClick={() => setShowAdd(true)} className="w-full rounded-xl border-2 border-dashed border-indigo-300 py-2 text-sm text-indigo-600 hover:bg-indigo-100 transition">
          + Thêm câu hỏi
        </button>
      )}

      {deleteQId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl bg-white p-6 shadow-xl w-80">
            <p className="text-sm font-semibold text-gray-800 mb-4">Xác nhận xoá câu hỏi #{deleteQId}?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteQId(null)} className="rounded-lg border px-4 py-2 text-sm">Huỷ</button>
              <button onClick={handleDeleteQ} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">Xoá</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default function AdminExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mode, setMode] = useState(null); // null | 'add' | {id}
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [openQPanel, setOpenQPanel] = useState(null); // exam object

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(ADMIN_EXAMS);
      setExams(data);
    } catch (err) { setErrorMessage(getErrorMessage(err, 'Không tải được đề thi')); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async (body) => {
    setFormLoading(true);
    try {
      await apiClient.post(ADMIN_EXAMS, { ...body, durationMinutes: Number(body.durationMinutes) });
      setMode(null); fetchData();
    } catch (err) { alert(getErrorMessage(err, 'Lỗi thêm đề thi')); }
    finally { setFormLoading(false); }
  };

  const handleEdit = async (body) => {
    setFormLoading(true);
    try {
      await apiClient.put(`${ADMIN_EXAMS}/${mode.id}`, { ...body, durationMinutes: Number(body.durationMinutes) });
      setMode(null); setEditData(null); fetchData();
    } catch (err) { alert(getErrorMessage(err, 'Lỗi cập nhật đề thi')); }
    finally { setFormLoading(false); }
  };

  const openEdit = (exam) => {
    setEditData({ title: exam.Title, examType: exam.ExamType, durationMinutes: exam.DurationMinutes, description: exam.Description || '' });
    setMode({ id: exam.Id });
    setOpenQPanel(null);
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`${ADMIN_EXAMS}/${deleteId}`);
      setDeleteId(null); fetchData();
      if (openQPanel?.Id === deleteId) setOpenQPanel(null);
    } catch (err) { alert(getErrorMessage(err, 'Lỗi xoá đề thi')); }
  };

  const TYPE_COLOR = { TOEIC: 'blue', IELTS: 'teal', PLACEMENT: 'purple' };
  const typeClass = (t) => {
    const c = TYPE_COLOR[t] || 'gray';
    return `bg-${c}-50 text-${c}-600 border-${c}-200`;
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 space-y-5">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/admin" className="hover:text-blue-600">Quản trị</Link>
        <span>›</span>
        <span className="font-medium text-gray-800">Quản lý đề thi</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Đề thi <span className="text-base font-normal text-gray-400">({exams.length} đề)</span></h1>
        <button onClick={() => { setMode('add'); setEditData(null); setOpenQPanel(null); }}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          + Thêm đề thi
        </button>
      </div>

      {/* Form thêm/sửa đề */}
      {(mode === 'add' || (mode && mode.id)) && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-gray-700">{mode === 'add' ? 'Thêm đề thi mới' : 'Chỉnh sửa đề thi'}</h2>
          <ExamForm
            initial={mode === 'add' ? EMPTY_EXAM : editData}
            onSubmit={mode === 'add' ? handleAdd : handleEdit}
            onCancel={() => { setMode(null); setEditData(null); }}
            loading={formLoading}
          />
        </div>
      )}

      {errorMessage && <ErrorMessage message={errorMessage} />}
      {loading && <Loading />}

      {/* Danh sách đề thi */}
      {!loading && (
        <div className="space-y-3">
          {exams.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-500">Chưa có đề thi nào</p>
            </div>
          ) : exams.map((exam) => (
            <div key={exam.Id} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800">{exam.Title}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${typeClass(exam.ExamType)}`}>{exam.ExamType}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">⏱ {exam.DurationMinutes} phút · {exam.QuestionCount} câu hỏi</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOpenQPanel(openQPanel?.Id === exam.Id ? null : exam)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${openQPanel?.Id === exam.Id ? 'bg-indigo-600 text-white border-indigo-600' : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}
                  >
                    📋 Câu hỏi
                  </button>
                  <button onClick={() => openEdit(exam)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50">Sửa</button>
                  <button onClick={() => setDeleteId(exam.Id)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50">Xoá</button>
                </div>
              </div>

              {/* Panel câu hỏi inline */}
              {openQPanel?.Id === exam.Id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <QuestionsPanel exam={exam} onClose={() => setOpenQPanel(null)} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal xoá đề */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl bg-white p-6 shadow-xl w-80">
            <p className="text-sm font-semibold text-gray-800 mb-1">Xác nhận xoá đề thi #{deleteId}?</p>
            <p className="text-xs text-gray-400 mb-4">Tất cả câu hỏi trong đề sẽ bị xoá theo.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="rounded-lg border px-4 py-2 text-sm">Huỷ</button>
              <button onClick={handleDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">Xoá</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
