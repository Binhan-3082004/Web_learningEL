// Trang Admin quản lý ngữ pháp: danh sách, thêm, sửa, xóa. Route: /admin/grammars
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { getErrorMessage } from '../utils/getErrorMessage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const ADMIN_GRAMMARS = '/learning/admin/grammars';

const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100';
const labelCls = 'mb-1 block text-xs font-semibold text-gray-600';

const EMPTY_FORM = { pattern: '', meaning: '', usage: '', level: 'A1', examples: [] };

function GrammarForm({ initial = EMPTY_FORM, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initial);
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const addExample = () => setForm((f) => ({ ...f, examples: [...f.examples, { sentence: '', translation: '' }] }));
  const removeExample = (i) => setForm((f) => ({ ...f, examples: f.examples.filter((_, idx) => idx !== i) }));
  const setExample = (i, key, val) => setForm((f) => ({
    ...f,
    examples: f.examples.map((ex, idx) => idx === i ? { ...ex, [key]: val } : ex),
  }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Cấu trúc ngữ pháp *</label>
          <input className={inputCls} value={form.pattern} onChange={(e) => set('pattern', e.target.value)} required placeholder="S + V + O" />
        </div>
        <div>
          <label className={labelCls}>Cấp độ *</label>
          <select className={inputCls} value={form.level} onChange={(e) => set('level', e.target.value)}>
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>Ý nghĩa</label>
        <textarea className={inputCls} rows={2} value={form.meaning} onChange={(e) => set('meaning', e.target.value)} placeholder="Mô tả ý nghĩa cấu trúc..." />
      </div>
      <div>
        <label className={labelCls}>Cách dùng</label>
        <textarea className={inputCls} rows={3} value={form.usage} onChange={(e) => set('usage', e.target.value)} placeholder="Hướng dẫn cách dùng..." />
      </div>

      {/* Câu ví dụ */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelCls + ' mb-0'}>Câu ví dụ ({form.examples.length})</label>
          <button type="button" onClick={addExample} className="text-xs text-blue-600 hover:underline">+ Thêm ví dụ</button>
        </div>
        <div className="space-y-2">
          {form.examples.map((ex, i) => (
            <div key={i} className="flex gap-2 items-start rounded-lg bg-gray-50 p-2">
              <div className="flex-1 space-y-1">
                <input className={inputCls} placeholder="Câu tiếng Anh *" value={ex.sentence} onChange={(e) => setExample(i, 'sentence', e.target.value)} required />
                <input className={inputCls} placeholder="Dịch nghĩa" value={ex.translation} onChange={(e) => setExample(i, 'translation', e.target.value)} />
              </div>
              <button type="button" onClick={() => removeExample(i)} className="mt-1 text-red-400 hover:text-red-600 text-lg leading-none">×</button>
            </div>
          ))}
        </div>
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

export default function AdminGrammarsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mode, setMode] = useState(null); // null | 'add' | {id, data}
  const [deleteId, setDeleteId] = useState(null);
  const [keyword, setKeyword] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(ADMIN_GRAMMARS);
      setItems(data);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Không tải được ngữ pháp'));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async (body) => {
    setFormLoading(true);
    try {
      await apiClient.post(ADMIN_GRAMMARS, body);
      setMode(null); fetchData();
    } catch (err) { alert(getErrorMessage(err, 'Lỗi thêm ngữ pháp')); }
    finally { setFormLoading(false); }
  };

  const openEdit = async (item) => {
    try {
      const { data } = await apiClient.get(`${ADMIN_GRAMMARS}/${item.Id}`);
      setMode({
        id: item.Id,
        data: {
          pattern: data.pattern || '', meaning: data.meaning || '',
          usage: data.usage || '', level: data.level || 'A1',
          examples: (data.examples || []).map((ex) => ({ sentence: ex.sentence || '', translation: ex.translation || '' })),
        },
      });
    } catch (err) { alert(getErrorMessage(err, 'Không lấy được dữ liệu')); }
  };

  const handleEdit = async (body) => {
    setFormLoading(true);
    try {
      await apiClient.put(`${ADMIN_GRAMMARS}/${mode.id}`, body);
      setMode(null); fetchData();
    } catch (err) { alert(getErrorMessage(err, 'Lỗi cập nhật')); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`${ADMIN_GRAMMARS}/${deleteId}`);
      setDeleteId(null); fetchData();
    } catch (err) { alert(getErrorMessage(err, 'Lỗi xoá')); }
  };

  const filtered = items.filter((item) =>
    !keyword || item.Pattern?.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 space-y-5">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/admin" className="hover:text-blue-600">Quản trị</Link>
        <span>›</span>
        <span className="font-medium text-gray-800">Quản lý ngữ pháp</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Ngữ pháp <span className="text-base font-normal text-gray-400">({items.length} cấu trúc)</span></h1>
        <button onClick={() => setMode('add')} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          + Thêm cấu trúc
        </button>
      </div>

      {/* Form */}
      {(mode === 'add' || (mode && mode.id)) && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-gray-700">{mode === 'add' ? 'Thêm cấu trúc ngữ pháp mới' : 'Chỉnh sửa cấu trúc ngữ pháp'}</h2>
          <GrammarForm
            initial={mode === 'add' ? EMPTY_FORM : mode.data}
            onSubmit={mode === 'add' ? handleAdd : handleEdit}
            onCancel={() => setMode(null)}
            loading={formLoading}
          />
        </div>
      )}

      {/* Filter */}
      <input
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none w-64"
        placeholder="Tìm cấu trúc ngữ pháp..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      {errorMessage && <ErrorMessage message={errorMessage} />}
      {loading && <Loading />}

      {/* Table */}
      {!loading && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Cấu trúc</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Ý nghĩa</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Cấp độ</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">Không có cấu trúc ngữ pháp nào</td></tr>
              ) : filtered.map((item) => (
                <tr key={item.Id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800">{item.Pattern}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{item.Meaning || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-600">{item.Level}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(item)} className="mr-2 text-xs text-blue-600 hover:underline">Sửa</button>
                    <button onClick={() => setDeleteId(item.Id)} className="text-xs text-red-500 hover:underline">Xoá</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal xoá */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl bg-white p-6 shadow-xl w-80">
            <p className="text-sm font-semibold text-gray-800 mb-4">Xác nhận xoá cấu trúc ngữ pháp #{deleteId}?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="rounded-lg border px-4 py-2 text-sm">Huỷ</button>
              <button onClick={handleDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Xoá</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
