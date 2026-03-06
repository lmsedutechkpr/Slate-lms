'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  BookOpen,
  Plus,
  X,
  Video,
  ExternalLink,
  AlertCircle,
  Loader2,
  Sprout,
  TrendingUp,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { InstructorBreadcrumb } from './InstructorBreadcrumb';
import { toast } from 'sonner';
import { updateCourse } from '@/lib/actions/instructor';
import { Category } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ThumbnailUploader from './ThumbnailUploader';
import CourseStatusBadge from './CourseStatusBadge';
import { formatDistanceToNow, format } from 'date-fns';

interface CourseEditFormProps {
  course: any;
  categories: Category[];
  instructorId: string;
}

const DIFFICULTY_OPTIONS = [
  {
    value: 'beginner',
    label: 'Beginner',
    desc: 'No prior experience',
    icon: Sprout,
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    desc: 'Some knowledge needed',
    icon: TrendingUp,
  },
  {
    value: 'advanced',
    label: 'Advanced',
    desc: 'For experienced learners',
    icon: Zap,
  },
];

export default function CourseEditForm({
  course: initialCourse,
  categories,
  instructorId,
}: CourseEditFormProps) {
  const router = useRouter();
  const [course, setCourse] = useState(initialCourse);
  const [loading, setLoading] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [thumbnailDisplay, setThumbnailDisplay] = useState<string | null>(initialCourse.thumbnail_url ?? null);

  const isPending = course.status === 'pending_review';

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const handleChange = (field: string, value: any) => {
    if (isPending) return;
    setCourse((prev: any) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (isPending || saveState === 'saving') return;
    setSaveState('saving');
    setLoading(true);

    try {
      const result = await updateCourse(course.id, instructorId, {
        title: course.title,
        description: course.description,
        category_id: course.category_id,
        difficulty: course.difficulty,
        language: course.language,
        price: course.price,

        what_you_learn: course.what_you_learn,
        requirements: course.requirements,
        tags: course.tags,
        promo_video_url: course.promo_video_url,
        thumbnail_url: course.thumbnail_url,
      });

      if (result.success) {
        setSaveState('saved');
        setIsDirty(false);
        setLastSaved(new Date());
        router.refresh();
        setTimeout(() => setSaveState('idle'), 3000);
      } else {
        setSaveState('error');
        toast.error('Save failed', { description: result.error });
        setTimeout(() => setSaveState('idle'), 3000);
      }
    } catch (error: any) {
      setSaveState('error');
      toast.error('An error occurred', { description: error.message });
      setTimeout(() => setSaveState('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const addItem = (field: 'what_you_learn' | 'requirements') => {
    if (isPending) return;
    const current = [...(course[field] || [])];
    if (field === 'what_you_learn' && current.length >= 12) return;
    current.push('');
    handleChange(field, current);
  };

  const removeItem = (field: 'what_you_learn' | 'requirements', index: number) => {
    if (isPending) return;
    const current = [...(course[field] || [])];
    if (field === 'what_you_learn' && current.length <= 4) return;
    current.splice(index, 1);
    handleChange(field, current);
  };

  const updateItem = (field: 'what_you_learn' | 'requirements', index: number, value: string) => {
    if (isPending) return;
    const current = [...(course[field] || [])];
    current[index] = value;
    handleChange(field, current);
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isPending) return;
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = e.currentTarget.value.trim().replace(',', '');
      if (value && !(course.tags || []).includes(value) && (course.tags || []).length < 10) {
        handleChange('tags', [...(course.tags || []), value]);
        e.currentTarget.value = '';
      }
    }
  };

  const removeTag = (tag: string) => {
    if (isPending) return;
    handleChange('tags', (course.tags || []).filter((t: string) => t !== tag));
  };

  const truncate = (str: string, length: number) => {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
  };

  return (
    <div className="min-h-full bg-gray-50">

      {/* PAGE HEADER — normal flow, NOT sticky */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <InstructorBreadcrumb items={[
              { label: 'My Courses', href: '/instructor/courses' },
              { label: truncate(course.title, 30), href: `/instructor/courses/${course.id}` },
              { label: 'Edit' },
            ]} />
            <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
          </div>

          {/* Only Preview here — NO Save button */}
          <Link
            href={`/courses/${course.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="flex items-center gap-2 border border-gray-300 text-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
              <ExternalLink className="w-4 h-4" />
              Preview Course
            </button>
          </Link>
        </div>
      </div>

      {/* Pending Review Banner */}
      {isPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 mx-8 mt-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
            <AlertCircle size={20} strokeWidth={3} />
          </div>
          <div>
            <p className="text-amber-900 font-bold text-base">Course is under review</p>
            <p className="text-amber-700 text-sm">Editing is disabled until admin completes the review.</p>
          </div>
        </div>
      )}

      {/* CONTENT — normal flow, no fixed heights */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-3 gap-6 items-start">

          {/* LEFT — form sections */}
          <div className="col-span-2 space-y-5">

            {/* Section: Basic Info */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-5">Basic Information</h2>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-sm font-semibold text-gray-700">Course Title *</label>
                    <span className={`text-xs ${(course.title || '').length < 10 ? 'text-red-400' : 'text-gray-400'}`}>
                      {(course.title || '').length}/100
                    </span>
                  </div>
                  <Input
                    value={course.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    maxLength={100}
                    placeholder="e.g. Master React in 30 Days"
                    className="border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0"
                    disabled={isPending}
                  />
                </div>



                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-sm font-semibold text-gray-700">Full Description *</label>
                    <span className={`text-xs ${(course.description || '').length < 50 ? 'text-red-400' : 'text-gray-400'}`}>
                      {(course.description || '').length} chars
                    </span>
                  </div>
                  <Textarea
                    value={course.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={6}
                    placeholder="Detailed description shown on course page (min 50 chars)..."
                    className="border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0 resize-none"
                    disabled={isPending}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Category *</label>
                    <Select
                      value={course.category_id || ''}
                      onValueChange={(val) => handleChange('category_id', val)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-200">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Language *</label>
                    <Select
                      value={course.language || 'english'}
                      onValueChange={(val) => handleChange('language', val)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-200">
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="tamil">Tamil</SelectItem>
                        <SelectItem value="both">English &amp; Tamil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Difficulty Cards */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">Difficulty *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => handleChange('difficulty', d.value)}
                        disabled={isPending}
                        className={`flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                          course.difficulty === d.value
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 bg-white hover:border-gray-400'
                        }`}
                      >
                        <d.icon
                          className={`w-5 h-5 mb-2.5 ${
                            course.difficulty === d.value ? 'text-gray-900' : 'text-gray-400'
                          }`}
                        />
                        <span
                          className={`text-sm font-bold ${
                            course.difficulty === d.value ? 'text-gray-900' : 'text-gray-600'
                          }`}
                        >
                          {d.label}
                        </span>
                        <span className="text-gray-400 text-xs mt-0.5 leading-tight">{d.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    Tags <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(course.tags || []).map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5 border border-gray-200"
                      >
                        {tag}
                        <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-black">
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <Input
                    onKeyDown={handleTagAdd}
                    placeholder="Type tag and press Enter..."
                    className="border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0"
                    disabled={isPending || (course.tags || []).length >= 10}
                  />
                </div>
              </div>
            </div>

            {/* Section: What You'll Learn */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">What You&apos;ll Learn</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Minimum 4 items required</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    (course.what_you_learn || []).filter((o: string) => o.trim()).length >= 4
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {(course.what_you_learn || []).filter((o: string) => o.trim()).length}/4 min
                </span>
              </div>

              <div className="space-y-2">
                {(course.what_you_learn || []).map((item: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <Input
                      value={item}
                      onChange={(e) => updateItem('what_you_learn', index, e.target.value)}
                      placeholder="Students will be able to..."
                      className="flex-1 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0"
                      disabled={isPending}
                    />
                    <button
                      onClick={() => removeItem('what_you_learn', index)}
                      className={`p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all ${
                        (course.what_you_learn || []).length <= 4 ? 'invisible' : ''
                      }`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {(course.what_you_learn || []).length < 12 && (
                <button
                  onClick={() => addItem('what_you_learn')}
                  disabled={isPending}
                  className="mt-3 w-full border-2 border-dashed border-gray-200 rounded-xl py-2 text-xs text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Add Learning Outcome
                </button>
              )}
            </div>

            {/* Section: Prerequisites */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-1">Prerequisites</h2>
              <p className="text-gray-400 text-xs mb-4">What should students know before taking this?</p>

              <div className="space-y-2">
                {(course.requirements || []).map((item: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateItem('requirements', index, e.target.value)}
                      placeholder="e.g. Basic computer skills"
                      className="flex-1 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0"
                      disabled={isPending}
                    />
                    <button
                      onClick={() => removeItem('requirements', index)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addItem('requirements')}
                disabled={isPending}
                className="mt-3 w-full border-2 border-dashed border-gray-200 rounded-xl py-2 text-xs text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Add Requirement
              </button>
            </div>

            {/* Section: Pricing */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Pricing</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  onClick={() => handleChange('price', 0)}
                  disabled={isPending}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    course.price === 0 ? 'bg-gray-50 border-black' : 'bg-white border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 mb-2 flex items-center justify-center ${
                      course.price === 0 ? 'border-black' : 'border-gray-200'
                    }`}
                  >
                    {course.price === 0 && <div className="w-2 h-2 rounded-full bg-black" />}
                  </div>
                  <p className="font-semibold text-sm text-gray-900">Free</p>
                  <p className="text-gray-400 text-xs mt-0.5">Instant enrollment</p>
                </button>
                <button
                  onClick={() => { if (course.price === 0) handleChange('price', 499); }}
                  disabled={isPending}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    course.price > 0 ? 'bg-gray-50 border-black' : 'bg-white border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 mb-2 flex items-center justify-center ${
                      course.price > 0 ? 'border-black' : 'border-gray-200'
                    }`}
                  >
                    {course.price > 0 && <div className="w-2 h-2 rounded-full bg-black" />}
                  </div>
                  <p className="font-semibold text-sm text-gray-900">Paid</p>
                  <p className="text-gray-400 text-xs mt-0.5">Set your price</p>
                </button>
              </div>

              {course.price > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Course Price *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                      <Input
                        type="number"
                        value={course.price}
                        onChange={(e) => handleChange('price', Number(e.target.value))}
                        min={99}
                        max={99999}
                        className="pl-8 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0"
                        disabled={isPending}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                      Original Price <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                      <Input
                        type="number"
                        value={course.original_price || ''}
                        onChange={(e) => handleChange('original_price', Number(e.target.value))}
                        placeholder="Show a higher price"
                        className="pl-8 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0"
                        disabled={isPending}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section: Promo Video */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-1">Promo Video</h2>
              <p className="text-gray-400 text-xs mb-4">A preview video helps students decide (YouTube/Vimeo)</p>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={course.promo_video_url || ''}
                  onChange={(e) => handleChange('promo_video_url', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="pl-10 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0"
                  disabled={isPending}
                />
              </div>
              {course.promo_video_url && (
                <div className="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Preview video set</span>
                  </div>
                  <Link
                    href={course.promo_video_url}
                    target="_blank"
                    className="text-xs text-gray-400 hover:text-black flex items-center gap-1"
                  >
                    View <ExternalLink size={10} />
                  </Link>
                </div>
              )}
            </div>

          </div>
          {/* END LEFT COLUMN */}

          {/* RIGHT — sticky sidebar */}
          <div className="col-span-1 space-y-4 sticky top-6 self-start">

            {/* Thumbnail Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Course Thumbnail</h3>
              <ThumbnailUploader
                  courseId={course.id}
                  instructorId={instructorId}
                  currentUrl={thumbnailDisplay}
                  onUpload={(url) => {
                    handleChange('thumbnail_url', url);
                    setThumbnailDisplay(url || null);
                    router.refresh();
                  }}
                />
            </div>

            {/* Save Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Save Changes</h3>
              <button
                onClick={handleSave}
                disabled={saveState === 'saving' || isPending}
                className={`w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60 ${
                  saveState === 'saved'
                    ? 'bg-emerald-600 text-white'
                    : saveState === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {saveState === 'saving' && <Loader2 size={15} className="animate-spin" />}
                {saveState === 'saved' && <CheckCircle2 size={15} />}
                {saveState === 'error' && <AlertCircle size={15} />}
                {saveState === 'idle' && <Save size={15} />}
                {saveState === 'saving'
                  ? 'Saving...'
                  : saveState === 'saved'
                  ? 'Saved!'
                  : saveState === 'error'
                  ? 'Failed'
                  : 'Save Changes'}
              </button>

              <div className="mt-2 text-center min-h-[20px]">
                {saveState === 'idle' && isDirty && (
                  <p className="text-amber-500 text-xs flex items-center justify-center gap-1">
                    <AlertCircle size={11} /> Unsaved changes
                  </p>
                )}
                {saveState === 'idle' && !isDirty && lastSaved && (
                  <p className="text-gray-400 text-xs">
                    Last saved {formatDistanceToNow(lastSaved)} ago
                  </p>
                )}
              </div>

              <Link
                href={`/instructor/courses/${course.id}/curriculum`}
                className="w-full border border-gray-200 text-gray-700 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-all mt-3"
              >
                <BookOpen size={15} />
                Go to Curriculum
              </Link>
            </div>

            {/* Status Card */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Status</span>
                <CourseStatusBadge status={course.status} />
              </div>
              <p className="text-gray-400 text-xs">
                Created {format(new Date(course.created_at), 'MMM d, yyyy')}
              </p>
              {isPending && (
                <p className="text-amber-600 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle size={11} /> Editing disabled while under review
                </p>
              )}
            </div>

          </div>
          {/* END RIGHT COLUMN */}

        </div>
      </div>
    </div>
  );
}
