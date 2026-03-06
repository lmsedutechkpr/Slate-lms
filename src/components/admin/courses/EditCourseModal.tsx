'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { updateCourseAdmin } from '@/lib/actions/admin';
import { toast } from 'sonner';

interface EditCourseModalProps {
  course: any;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditCourseModal({ course, onClose, onUpdated }: EditCourseModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: course.title || '',
    slug: course.slug || '',
    difficulty: course.difficulty || 'beginner',
    price: course.price?.toString() || '0',
    original_price: course.original_price?.toString() || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const updates = {
      title: formData.title,
      slug: formData.slug,
      difficulty: formData.difficulty,
      price: parseFloat(formData.price) || 0,
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
    };

    const result = await updateCourseAdmin(course.id, updates);
    setLoading(false);

    if (result.success) {
      toast.success('Course updated successfully');
      onUpdated();
    } else {
      toast.error(result.error || 'Failed to update course');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-hidden">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col m-4 max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Edit Course metadata</h3>
            <p className="text-xs text-gray-500 mt-0.5">Quickly update listing details for {course.title}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="edit-course-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Course Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:bg-white outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">URL Slug</label>
              <input
                type="text"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:bg-white outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Current Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Original Price (₹) (Optional)</label>
                <input
                  type="number"
                  name="original_price"
                  min="0"
                  step="0.01"
                  value={formData.original_price}
                  onChange={handleChange}
                  placeholder="e.g. 5999"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:bg-white outline-none"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200/50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="edit-course-form"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-bold text-white bg-gray-900 hover:bg-black rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
