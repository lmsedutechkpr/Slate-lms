'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Search, User, Check, UploadCloud } from 'lucide-react';
import { getAdminInstructors } from '@/lib/actions/admin';
import { createClient } from '@/lib/supabase/client';

interface CreateCourseModalProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
}

export default function CreateCourseModal({ onClose, onSubmit, isSubmitting }: CreateCourseModalProps) {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [instructorSearch, setInstructorSearch] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    category_id: '',
    difficulty: 'beginner',
    price: '',
    original_price: '',
    thumbnail_url: '',
    promo_video_url: '',
    instructor_id: '',
    meta_title: '',
    meta_description: ''
  });

  const supabase = createClient();

  useEffect(() => {
    async function loadResources() {
      // Load categories
      const { data: cats } = await supabase.from('categories').select('id, name').order('name');
      if (cats) setCategories(cats);
      
      // Load instructors
      const insts = await getAdminInstructors('approved');
      if (insts) setInstructors(insts);
    }
    loadResources();
  }, [supabase]);

  const filteredInstructors = instructors.filter(i => 
    i.full_name?.toLowerCase().includes(instructorSearch.toLowerCase()) ||
    i.email?.toLowerCase().includes(instructorSearch.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) return handleNext();
    
    // Final submit
    const finalData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      original_price: formData.original_price ? parseFloat(formData.original_price) : null
    };
    onSubmit(finalData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-hidden">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col m-4 h-[90vh]">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Create New Course</h3>
            <p className="text-xs text-gray-500">Step {step} of 3</p>
          </div>
          <div className="ml-auto flex gap-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 w-8 rounded-full ${i <= step ? 'bg-gray-900' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <form id="create-course-form" onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
            
            {/* STEP 1: Basic Info */}
            <div className={step === 1 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden'}>
              <h4 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h4>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Course Title *</label>
                  <input
                    required={step === 1}
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="e.g. Advanced TypeScript Patterns"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">{formData.title.length}/100</div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Short Description *</label>
                  <textarea
                    required={step === 1}
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleChange}
                    maxLength={200}
                    rows={2}
                    placeholder="Brief summary used in course cards..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none resize-none"
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">{formData.short_description.length}/200</div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Full Description *</label>
                  <textarea
                    required={step === 1}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    minLength={100}
                    rows={5}
                    placeholder="Detailed course description..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Category *</label>
                    <select
                      required={step === 1}
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none bg-white"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Difficulty *</label>
                    <select
                      required={step === 1}
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none bg-white"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: Pricing & Media */}
            <div className={step === 2 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden'}>
              <h4 className="text-xl font-bold text-gray-900 mb-6">Pricing & Media</h4>
              
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Price (₹) *</label>
                    <input
                      type="number"
                      required={step === 2}
                      min="0"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0 for free"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Original Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="original_price"
                      value={formData.original_price}
                      onChange={handleChange}
                      placeholder="Optional"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Thumbnail URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      name="thumbnail_url"
                      value={formData.thumbnail_url}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Promo Video URL</label>
                  <input
                    type="url"
                    name="promo_video_url"
                    value={formData.promo_video_url}
                    onChange={handleChange}
                    placeholder="https://youtube.com/..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* STEP 3: Instructor & SEO */}
            <div className={step === 3 ? 'block animate-in fade-in flex flex-col h-full slide-in-from-right-4' : 'hidden'}>
              <h4 className="text-xl font-bold text-gray-900 mb-6">Instructor & SEO</h4>
              
              <div className="space-y-6 flex-1 flex flex-col min-h-[400px]">
                {/* Instructor Selection */}
                <div className="flex-1 flex flex-col min-h-[250px] border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b border-gray-200">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Assign Instructor *</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search instructors..."
                        value={instructorSearch}
                        onChange={(e) => setInstructorSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none bg-white"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-white">
                    {filteredInstructors.length === 0 ? (
                      <div className="text-center py-6 text-sm text-gray-400">No instructors found</div>
                    ) : (
                      filteredInstructors.map(instructor => (
                        <div
                          key={instructor.id}
                          onClick={() => setFormData(p => ({ ...p, instructor_id: instructor.id }))}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border ${
                            formData.instructor_id === instructor.id 
                              ? 'bg-gray-900 text-white border-gray-900' 
                              : 'hover:bg-gray-50 border-transparent'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${formData.instructor_id === instructor.id ? 'bg-gray-800' : 'bg-gray-200'}`}>
                            {instructor.avatar_url ? (
                              <img src={instructor.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className={`w-4 h-4 ${formData.instructor_id === instructor.id ? 'text-gray-300' : 'text-gray-500'}`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{instructor.full_name}</p>
                            <p className={`text-xs truncate ${formData.instructor_id === instructor.id ? 'text-gray-300' : 'text-gray-500'}`}>{instructor.email}</p>
                          </div>
                          {formData.instructor_id === instructor.id && <Check className="w-4 h-4 text-white flex-shrink-0 mr-1" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Meta Title</label>
                    <input
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleChange}
                      placeholder="SEO Title (defaults to course title)"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-gray-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Meta Description</label>
                    <textarea
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleChange}
                      rows={2}
                      placeholder="SEO Description"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-gray-900 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-between gap-3 bg-gray-50 rounded-b-2xl">
          {step > 1 ? (
            <button 
              type="button"
              onClick={handlePrev}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200/50 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          <button 
            type="submit"
            form="create-course-form"
            disabled={isSubmitting || (step === 3 && !formData.instructor_id)}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gray-900 hover:bg-black rounded-xl transition-colors disabled:opacity-50"
          >
            {step < 3 ? (
              <>Next <ChevronRight className="w-4 h-4" /></>
            ) : isSubmitting ? (
              'Creating...'
            ) : (
              'Create Course'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
