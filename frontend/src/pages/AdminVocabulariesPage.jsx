// Trang Admin quản lý từ vựng: danh sách, thêm, sửa, xóa. Route: /admin/vocabularies
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { getErrorMessage } from '../utils/getErrorMessage';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const EMPTY_FORM = {
  word: '', pronunciation: '', meaning: '', example: '',
  level: 'A1', audioUrl: '',
};

const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100';
const labelCls = 'mb-1 block text-xs font-semibold text-gray-600';

function VocabForm({ initial = EMPTY_FORM, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initial);
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, audioUrl: form.audioUrl || null });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Từ vựng *</label>
          <input className={inputCls} value={form.word} onChange={(e) => set('word', e.target.value)} required placeholder="hello" />
        </div>
        <div>
          <label className={labelCls}>Phiên âm</label>
          <input className={inputCls} value={form.pronunciation} onChange={(e) => set('pronunciation', e.target.value)} placeholder="/həˈloʊ/" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Nghĩa *</label>
        <input className={inputCls} value={form.meaning} onChange={(e) => set('meaning', e.target.value)} required placeholder="Xin chào" />
      </div>
      <div>
        <label className={labelCls}>Câu ví dụ</label>
        <textarea className={inputCls} rows={2} value={form.example} onChange={(e) => set('example', e.target.value)} placeholder="Hello, my name is An." />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Cấp độ *</label>
          <select className={inputCls} value={form.level} onChange={(e) => set('level', e.target.value)}>
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>URL Audio</label>
          <input className={inputCls} value={form.audioUrl} onChange={(e) => set('audioUrl', e.target.value)} placeholder="https://..." />
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

export default function AdminVocabulariesPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mode, setMode] = useState(null); // null | 'add' | {id}
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (keyword) params.q = keyword;
      if (levelFilter) params.level = levelFilter;
      const { data } = await apiClient.get(API_ENDPOINTS.LEARNING.ADMIN_VOCABULARIES, { params });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Không tải được từ vựng'));
    } finally {
      setLoading(false);
    }
  }, [page, keyword, levelFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async (body) => {
    setFormLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.LEARNING.ADMIN_VOCABULARIES, body);
      setMode(null);
      fetchData();
    } catch (err) { alert(getErrorMessage(err, 'Lỗi thêm từ vựng')); }
    finally { setFormLoading(false); }
  };

  const handleEdit = async (body) => {
    setFormLoading(true);
    try {
      await apiClient.put(`${API_ENDPOINTS.LEARNING.ADMIN_VOCABULARIES}/${mode.id}`, body);
      setMode(null); setEditData(null);
      fetchData();
    } catch (err) { alert(getErrorMessage(err, 'Lỗi cập nhật')); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`${API_ENDPOINTS.LEARNING.ADMIN_VOCABULARIES}/${deleteId}`);
      setDeleteId(null);
      fetchData();
    } catch (err) { alert(getErrorMessage(err, 'Lỗi xoá')); }
  };

  const openEdit = (item) => {
    setEditData({
      word: item.Word || '', pronunciation: item.Pronunciation || '',
      meaning: item.Meaning || '', example: item.Example || '',
      level: item.Level || 'A1', audioUrl: item.AudioUrl || '',
    });
    setMode({ id: item.Id });
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/admin" className="hover:text-blue-600">Quản trị</Link>
        <span>›</span>
        <span className="font-medium text-gray-800">Quản lý từ vựng</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Từ vựng <span className="text-base font-normal text-gray-400">({total} từ)</span></h1>
        <button onClick={() => { setMode('add'); setEditData(null); }}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          + Thêm từ vựng
        </button>
      </div>

      {/* Form */}
      {(mode === 'add' || (mode && mode.id)) && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-gray-700">{mode === 'add' ? 'Thêm từ vựng mới' : 'Chỉnh sửa từ vựng'}</h2>
          <VocabForm
            initial={mode === 'add' ? EMPTY_FORM : editData}
            onSubmit={mode === 'add' ? handleAdd : handleEdit}
            onCancel={() => { setMode(null); setEditData(null); }}
            loading={formLoading}
          />
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <input
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none w-56"
          placeholder="Tìm từ vựng..."
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
        />
        <select
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          value={levelFilter}
          onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
        >
          <option value="">Tất cả cấp độ</option>
          {LEVELS.map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>

      {errorMessage && <ErrorMessage message={errorMessage} />}
      {loading && <Loading />}

      {/* Table */}
      {!loading && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Từ vựng</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Phiên âm</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Nghĩa</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Cấp độ</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Audio</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">Không có từ vựng nào</td></tr>
              ) : items.map((item) => (
                <tr key={item.Id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800">{item.Word}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.Pronunciation || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{item.Meaning}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">{item.Level}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{item.AudioUrl ? '🔊' : '—'}</td>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40">← Trước</button>
          <span className="text-sm text-gray-500">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40">Tiếp →</button>
        </div>
      )}

      {/* Modal xoá */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl bg-white p-6 shadow-xl w-80">
            <p className="text-sm font-semibold text-gray-800 mb-4">Xác nhận xoá từ vựng #{deleteId}?</p>
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
