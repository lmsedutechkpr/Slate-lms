'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCategory, updateCategory, deleteCategory } from '@/lib/actions/admin';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';

interface CategoryActionsProps {
  categories: any[];
}

const ICON_OPTIONS = ['💻', '🎨', '📊', '🔬', '📸', '🎵', '🏋️', '🌍', '📝', '🧠', '🚀', '💼', '🎓', '🔧', '📱'];
const COLOR_OPTIONS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B',
  '#10B981', '#06B6D4', '#3B82F6', '#84CC16', '#F97316',
];

export default function CategoryActions({ categories }: CategoryActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', name_ta: '', icon: '📚', color: '#6366F1', description: '' });
  const [editForm, setEditForm] = useState<any>({});

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setLoading('create');
    const result = await createCategory(form);
    setLoading(null);
    if (result.success) {
      toast.success('Category created');
      setShowCreate(false);
      setForm({ name: '', name_ta: '', icon: '📚', color: '#6366F1', description: '' });
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to create');
    }
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, name_ta: cat.name_ta || '', icon: cat.icon || '📚', color: cat.color || '#6366F1', description: cat.description || '' });
  };

  const handleUpdate = async (id: string) => {
    if (!editForm.name.trim()) { toast.error('Name is required'); return; }
    setLoading(`edit-${id}`);
    const result = await updateCategory(id, editForm);
    setLoading(null);
    if (result.success) {
      toast.success('Category updated');
      setEditingId(null);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to update');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    setLoading(`delete-${id}`);
    const result = await deleteCategory(id);
    setLoading(null);
    if (result.success) {
      toast.success('Category deleted');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm"
        >
          <Plus size={16} />
          New Category
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Create Category</h3>
            <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-700">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name (English) *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Web Development"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name (Tamil)</label>
              <input
                type="text"
                value={form.name_ta}
                onChange={(e) => setForm({ ...form, name_ta: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Optional Tamil translation"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Short description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setForm({ ...form, icon })}
                    className={`text-xl p-1.5 rounded-lg transition-colors ${form.icon === icon ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'hover:bg-gray-100'}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setForm({ ...form, color })}
                    className={`w-7 h-7 rounded-full transition-all ${form.color === color ? 'ring-2 ring-offset-2 ring-gray-800 scale-110' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading === 'create'}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-900 hover:bg-gray-700 text-white rounded-xl transition-colors disabled:opacity-60"
            >
              {loading === 'create' ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Create
            </button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories.map((cat: any) => (
          <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {editingId === cat.id ? (
              <div className="p-5 space-y-3">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Category name"
                />
                <input
                  type="text"
                  value={editForm.name_ta}
                  onChange={(e) => setEditForm({ ...editForm, name_ta: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Tamil name (optional)"
                />
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Description"
                />
                <div className="flex flex-wrap gap-1.5">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setEditForm({ ...editForm, icon })}
                      className={`text-base p-1 rounded-lg ${editForm.icon === icon ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'hover:bg-gray-100'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditForm({ ...editForm, color })}
                      className={`w-6 h-6 rounded-full ${editForm.color === color ? 'ring-2 ring-offset-1 ring-gray-800' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleUpdate(cat.id)}
                    disabled={loading === `edit-${cat.id}`}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-60"
                  >
                    {loading === `edit-${cat.id}` ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-2 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="h-1.5 w-full" style={{ backgroundColor: cat.color || '#6366F1' }} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{cat.icon || '📚'}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{cat.name}</h3>
                        {cat.name_ta && <p className="text-xs text-gray-500">{cat.name_ta}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        disabled={loading === `delete-${cat.id}`}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-60"
                      >
                        {loading === `delete-${cat.id}` ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{cat.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-600 font-medium">{cat.courseCount} courses</span>
                    {cat.publishedCount > 0 && (
                      <span className="text-emerald-600">{cat.publishedCount} published</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
