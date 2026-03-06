'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  X, 
  Sprout, 
  TrendingUp, 
  Zap, 
  Gift, 
  IndianRupee, 
  CheckCircle2, 
  Info, 
  Loader2, 
  Rocket,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { createCourse } from '@/lib/actions/instructor';
import { cn } from '@/lib/utils';
import { FieldError } from '@/components/auth/FieldError';
import Link from 'next/link';

// Zod schema for course creation
const courseSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(50, 'Short description must be at least 50 characters').max(200, 'Short description cannot exceed 200 characters'),
  fullDescription: z.string().min(100, 'Full description must be at least 100 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.enum(['english', 'tamil', 'both']),
  price: z.number().min(0),
  originalPrice: z.number().optional(),
  whatYouLearn: z.array(z.string().min(1, 'Cannot be empty')).min(4, 'Add at least 4 learning outcomes'),
  requirements: z.array(z.string()),
  tags: z.array(z.string()),
  pricingType: z.enum(['free', 'paid']),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseBuilderFormProps {
  instructorId: string;
  categories: any[];
  approvalStatus: string;
}

const inputStyle = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-black outline-none transition-all placeholder:text-gray-300 focus:ring-2 focus:ring-black/5";
const selectStyle = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-black outline-none transition-all appearance-none bg-white focus:ring-2 focus:ring-black/5";

export default function CourseBuilderForm({ instructorId, categories, approvalStatus }: CourseBuilderFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      fullDescription: '',
      categoryId: '',
      difficulty: 'beginner',
      language: 'english',
      price: 0,
      pricingType: 'free',
      whatYouLearn: ['', '', '', ''],
      requirements: [''],
      tags: [],
    },
  });

  const { watch, setValue, register, handleSubmit, formState: { isDirty } } = form;

  const title = watch('title');
  const description = watch('description');
  const fullDescription = watch('fullDescription');
  const difficulty = watch('difficulty');
  const outcomes = watch('whatYouLearn');
  const requirements = watch('requirements');
  const tags = watch('tags');
  const pricingType = watch('pricingType');
  const price = watch('price');
  const originalPrice = watch('originalPrice');

  function scrollToFirstError(newErrors: Record<string, string>) {
    const firstErrorKey = Object.keys(newErrors)[0]
    if (!firstErrorKey) return
    
    const el = document.querySelector(`[data-field="${firstErrorKey}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  function validateStep1(): boolean {
    const newErrors: Record<string, string> = {}
    
    if (!title.trim()) {
      newErrors.title = 'Course title is required'
    } else if (title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters'
    } else if (title.trim().length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters'
    }
    
    if (!description.trim()) {
      newErrors.shortDesc = 'Short description is required'
    } else if (description.trim().length < 50) {
      newErrors.shortDesc = `${50 - description.trim().length} more characters needed (min. 50)`
    } else if (description.trim().length > 200) {
      newErrors.shortDesc = 'Description cannot exceed 200 characters'
    }
    
    if (!fullDescription.trim()) {
      newErrors.description = 'Full description is required'
    } else if (fullDescription.trim().length < 100) {
      newErrors.description = `${100 - fullDescription.trim().length} more characters needed (min. 100)`
    }
    
    if (!watch('categoryId')) {
      newErrors.category = 'Please select a category'
    }
    
    if (!difficulty) {
      newErrors.difficulty = 'Please select a difficulty level'
    }
    
    setErrors(newErrors)
    
    const errorCount = Object.keys(newErrors).length
    if (errorCount > 0) {
      toast.error(`${errorCount} field${errorCount > 1 ? 's' : ''} need attention`, {
        description: 'Please fix the highlighted fields below.',
        duration: 3000,
      })
      scrollToFirstError(newErrors)
      return false
    }
    
    return true
  }

  function validateStep2(): boolean {
    const newErrors: Record<string, string> = {}
    
    const filledOutcomes = outcomes.filter(o => o.trim())
    
    if (filledOutcomes.length < 4) {
      const needed = 4 - filledOutcomes.length
      newErrors.outcomes = `Add ${needed} more learning outcome${needed > 1 ? 's' : ''} (minimum 4 required)`
    }
    
    const hasEmptyOutcome = outcomes.some((o, i) => !o.trim() && i < 4)
    if (!newErrors.outcomes && hasEmptyOutcome) {
      newErrors.outcomes = 'Please fill in all learning outcome fields'
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      toast.error('Complete your learning outcomes', {
        description: 'Add at least 4 outcomes before continuing.',
        duration: 3000,
      })
      return false
    }
    
    return true
  }

  function validateStep3(): boolean {
    const newErrors: Record<string, string> = {}
    
    if (pricingType === 'paid') {
      if (!price || price === 0) {
        newErrors.price = 'Course price is required'
      } else if (price < 99) {
        newErrors.price = 'Minimum price is ₹99'
      } else if (price > 99999) {
        newErrors.price = 'Maximum price is ₹99,999'
      }
      
      if (originalPrice && originalPrice > 0) {
        if (originalPrice <= price) {
          newErrors.originalPrice = 'Original price must be higher than course price'
        }
      }
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      toast.error('Check your pricing', {
        description: 'Fix the pricing errors before creating.',
        duration: 3000,
      })
      return false
    }
    
    return true
  }

  const handleNextStep = async () => {
    if (step === 1 && validateStep1()) {
      setErrors({})
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setErrors({})
      setStep(3)
    }
  };

  const onSubmit = async (data: CourseFormValues) => {
    if (!validateStep3()) return;
    
    setIsSubmitting(true);
    const loadingToast = toast.loading('Creating your course...')
    try {
        const result = await createCourse({
          instructorId,
          title: data.title,
          description: data.fullDescription, // Maps to 'description' in DB/Action
          categoryId: data.categoryId,
          difficulty: data.difficulty,
          language: data.language,
          price: data.pricingType === 'free' ? 0 : data.price,

          tags: data.tags,
        });

      toast.dismiss(loadingToast)

      if (result.success) {
        toast.success('Course created!', {
          description: 'Now add your curriculum sections and lectures.',
          duration: 3000,
        });
        router.push(`/instructor/courses/${result.courseId}/curriculum`);
      } else {
        toast.error('Failed to create course', {
          description: result.error || 'Please try again.',
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error('Something went wrong');
      setIsSubmitting(false);
    }
  };

  const updateOutcome = (index: number, value: string) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index] = value;
    setValue('whatYouLearn', newOutcomes);
    
    if (errors.outcomes) {
      const filledCount = newOutcomes.filter(o => o.trim()).length;
      const hasEmptyInRequired = newOutcomes.some((o, i) => !o.trim() && i < 4);
      if (filledCount >= 4 && !hasEmptyInRequired) {
        setErrors(prev => ({ ...prev, outcomes: '' }));
      }
    }
  };

  const addOutcome = () => {
    if (outcomes.length < 12) {
      setValue('whatYouLearn', [...outcomes, '']);
    }
  };

  const removeOutcome = (index: number) => {
    if (outcomes.length > 4) {
      const newOutcomes = [...outcomes];
      newOutcomes.splice(index, 1);
      setValue('whatYouLearn', newOutcomes);
    }
  };

  const updateReq = (index: number, value: string) => {
    const newReqs = [...requirements];
    newReqs[index] = value;
    setValue('requirements', newReqs);
  };

  const addRequirement = () => setValue('requirements', [...requirements, '']);
  const removeReq = (index: number) => {
    const newReqs = [...requirements];
    newReqs.splice(index, 1);
    setValue('requirements', newReqs);
  };

  const addTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag) && tags.length < 10) {
      setValue('tags', [...tags, newTag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setValue('tags', tags.filter(t => t !== tag));
  };

  const handleCancel = (e: React.MouseEvent) => {
    if (isDirty) {
      if (!confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        e.preventDefault();
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* PAGE HEADER — fixed height ~65px */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <nav className="flex items-center text-xs font-medium text-gray-400 gap-2 mb-0.5">
            <Link href="/instructor/courses" className="hover:text-gray-900 transition-colors">My Courses</Link>
            <span>→</span>
            <span className="text-gray-600">Create New Course</span>
          </nav>
          <h1 className="text-lg font-bold text-gray-900 leading-none">
            New Course
          </h1>
        </div>

        <Link 
          href="/instructor/courses" 
          onClick={handleCancel}
          className="text-gray-500 text-sm font-semibold hover:text-gray-900 transition-colors"
        >
          Cancel
        </Link>
      </div>

      {/* STEP INDICATOR — fixed height ~56px */}
      <div className="bg-white border-b border-gray-100 flex-shrink-0">
        <StepIndicator step={step} />
      </div>

      {/* CONTENT AREA — fills remaining */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* FORM — scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="min-h-full flex flex-col">
            
            {/* Inner padding */}
            <div className="px-8 py-5 flex-1">
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="mb-5">
                    <h2 className="text-gray-900 font-bold text-lg">Basic Information</h2>
                    <p className="text-gray-400 text-sm mt-0.5">Tell students what your course is about</p>
                  </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-5 max-w-4xl">
                      {/* LEFT COLUMN */}
                      <div className="flex flex-col gap-5">
                        {/* Course Title */}
                        <div data-field="title">
                          <div className="flex justify-between mb-1.5">
                            <label className="text-gray-700 text-sm font-semibold">Course Title <span className="text-red-500 ml-0.5">*</span></label>
                            <span className="text-gray-400 text-xs">{(title || '').length}/100</span>
                          </div>
                          <input
                            type="text"
                            {...register('title')}
                            onChange={(e) => {
                              register('title').onChange(e);
                              if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                            }}
                            maxLength={100}
                            placeholder="e.g. Complete React Masterclass 2026"
                            className={cn(
                              inputStyle,
                              errors.title
                                ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-100'
                                : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900/5'
                            )}
                          />
                          <FieldError error={errors.title} />
                        </div>

                        {/* Short Description */}
                        <div data-field="shortDesc">
                          <div className="flex justify-between mb-1.5">
                            <label className="text-gray-700 text-sm font-semibold">Short Description <span className="text-red-500 ml-0.5">*</span></label>
                            <span className="text-gray-400 text-xs">{(description || '').length}/200</span>
                          </div>
                          <p className="text-gray-400 text-[11px] mb-1.5 leading-tight">Shown in course cards and search results</p>
                          <textarea
                            rows={3}
                            {...register('description')}
                            onChange={(e) => {
                              register('description').onChange(e);
                              if (errors.shortDesc) setErrors(prev => ({ ...prev, shortDesc: '' }));
                            }}
                            maxLength={200}
                            placeholder="Briefly describe what students will learn..."
                            className={cn(
                              inputStyle, 
                              "resize-none",
                              errors.shortDesc
                                ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-100'
                                : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900/5'
                            )}
                          />
                          <FieldError error={errors.shortDesc} />
                        </div>

                        {/* Category + Language */}
                        <div className="grid grid-cols-2 gap-3">
                          <div data-field="category">
                            <label className="text-gray-700 text-sm font-semibold mb-1.5 block">Category <span className="text-red-500 ml-0.5">*</span></label>
                            <select 
                              {...register('categoryId')} 
                              onChange={(e) => {
                                register('categoryId').onChange(e);
                                if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
                              }}
                              className={cn(
                                selectStyle,
                                errors.category
                                  ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-100'
                                  : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900/5'
                              )}
                            >
                              <option value="">Select category...</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <FieldError error={errors.category} />
                          </div>
                            <div>
                              <label className="text-gray-700 text-sm font-semibold mb-1.5 block">Language <span className="text-red-500 ml-0.5">*</span></label>
                              <select {...register('language')} className={selectStyle}>
                                <option value="english">English</option>
                                <option value="tamil">Tamil</option>
                                <option value="both">English & Tamil</option>
                              </select>
                            </div>
                        </div>
                      </div>

                      {/* RIGHT COLUMN */}
                      <div className="flex flex-col gap-5">
                        {/* Full Description */}
                        <div data-field="description">
                          <label className="text-gray-700 text-sm font-semibold mb-1.5 block">Full Description <span className="text-red-500 ml-0.5">*</span></label>
                          <p className="text-gray-400 text-[11px] mb-1.5 leading-tight">Shown on the course page (min. 100 chars)</p>
                          <textarea
                            rows={6}
                            {...register('fullDescription')}
                            onChange={(e) => {
                              register('fullDescription').onChange(e);
                              if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                            }}
                            placeholder="Describe what students will learn, who this course is for, and what makes it special..."
                            className={cn(
                              inputStyle, 
                              "resize-none",
                              errors.description
                                ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-100'
                                : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900/5'
                            )}
                          />
                          <FieldError error={errors.description} />
                        </div>

                        {/* Difficulty Level */}
                        <div data-field="difficulty">
                          <label className="text-gray-700 text-sm font-semibold mb-3 block">Difficulty Level <span className="text-red-500 ml-0.5">*</span></label>
                          <div className={cn(
                            "grid grid-cols-3 gap-2.5",
                            errors.difficulty ? 'ring-2 ring-red-200 rounded-xl p-1' : ''
                          )}>
                            {[
                              { value: 'beginner', label: 'Beginner', desc: 'No prior experience', icon: Sprout },
                              { value: 'intermediate', label: 'Intermediate', desc: 'Some knowledge needed', icon: TrendingUp },
                              { value: 'advanced', label: 'Advanced', desc: 'For experienced learners', icon: Zap },
                            ].map(d => (
                              <button
                                key={d.value}
                                type="button"
                                onClick={() => {
                                  setValue('difficulty', d.value as any);
                                  if (errors.difficulty) setErrors(prev => ({ ...prev, difficulty: '' }));
                                }}
                                className={cn(
                                  "flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all duration-150",
                                  difficulty === d.value ? 'border-black bg-black/5' : 'border-gray-100 bg-white hover:border-gray-300'
                                )}
                              >
                                <d.icon className={cn("w-4 h-4 mb-2", difficulty === d.value ? 'text-black' : 'text-gray-400')} />
                                <span className={cn("text-xs font-bold", difficulty === d.value ? 'text-gray-900' : 'text-gray-600')}>{d.label}</span>
                                <span className="text-gray-400 text-[11px] mt-0.5 leading-tight">{d.desc}</span>
                              </button>
                            ))}
                          </div>
                          {errors.difficulty && (
                            <div className="flex items-center gap-1.5 mt-2">
                              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                              <p className="text-xs text-red-500">
                                {errors.difficulty}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="mb-5">
                    <h2 className="text-gray-900 font-bold text-lg">Course Details</h2>
                    <p className="text-gray-400 text-sm mt-0.5">Help students understand what they'll gain</p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 max-w-4xl">
                      {/* LEFT COLUMN */}
                      <div data-field="outcomes">
                        {/* What You'll Learn */}
                        <div className="mb-1.5 flex items-center justify-between">
                          <div>
                            <label className="text-gray-700 text-sm font-semibold">What You'll Learn *</label>
                            <p className="text-gray-400 text-[11px] mt-0.5">Min. 4 outcomes required</p>
                          </div>
                          <span className={cn(
                            "text-[11px] font-bold px-2.5 py-1 rounded-full",
                            outcomes.filter(o => o.trim()).length >= 4 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : outcomes.filter(o => o.trim()).length >= 2
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-600'
                          )}>
                            {outcomes.filter(o => o.trim()).length}/4 min
                          </span>
                        </div>
                        <div className="space-y-2">
                          {outcomes.map((o, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                                {i + 1}
                              </span>
                              <input
                                value={o}
                                onChange={e => updateOutcome(i, e.target.value)}
                                placeholder="Students will be able to..."
                                className={cn(
                                  "flex-1 border rounded-xl px-3 py-2 text-sm outline-none transition-150",
                                  !o.trim() && errors.outcomes && i < 4
                                    ? 'border-red-300 bg-red-50/40 focus:border-red-400'
                                    : 'border-gray-200 focus:border-gray-900'
                                )}
                              />
                              {outcomes.length > 4 && (
                                <button onClick={() => removeOutcome(i)} type="button">
                                  <X className="w-3.5 h-3.5 text-gray-300 hover:text-red-400" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {outcomes.length < 12 && (
                          <button
                            type="button"
                            onClick={addOutcome}
                            className="mt-2 w-full border-2 border-dashed border-gray-200 rounded-xl py-2 text-xs text-gray-400 hover:border-gray-400 transition-150 flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Outcome
                          </button>
                        )}
                        <FieldError error={errors.outcomes} />
                      </div>

                    {/* RIGHT COLUMN */}
                    <div className="flex flex-col gap-5">
                        {/* Prerequisites */}
                        <div data-field="requirements">
                          <label className="text-gray-700 text-sm font-semibold mb-1 block">Prerequisites <span className="text-gray-400 font-normal text-xs ml-1.5">(optional)</span></label>
                          <p className="text-gray-400 text-[11px] mb-2 leading-tight">What should students know beforehand?</p>
                          <div className="space-y-2">
                            {requirements.map((r, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                                <input
                                  value={r}
                                  onChange={e => updateReq(i, e.target.value)}
                                  placeholder="e.g. Basic computer skills"
                                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-gray-900 outline-none"
                                />
                                <button onClick={() => removeReq(i)} type="button">
                                  <X className="w-3.5 h-3.5 text-gray-300 hover:text-red-400" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={addRequirement}
                            className="mt-2 w-full border-2 border-dashed border-gray-200 rounded-xl py-2 text-xs text-gray-400 hover:border-gray-400 transition-150 flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Prerequisite
                          </button>
                        </div>

                        {/* Tags */}
                        <div data-field="tags">
                          <label className="text-gray-700 text-sm font-semibold mb-1 block">Tags <span className="text-gray-400 font-normal text-xs ml-1.5">(optional, max 10)</span></label>
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1 bg-gray-900 text-white rounded-full px-3 py-1 text-xs">
                                  {tag}
                                  <button type="button" onClick={() => removeTag(tag)} className="text-gray-400 hover:text-white ml-0.5"><X className="w-3 h-3" /></button>
                                </span>
                              ))}
                            </div>
                          )}
                          {tags.length < 10 && (
                            <div className="relative">
                              <input
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' || e.key === ',') {
                                    e.preventDefault()
                                    addTag()
                                  }
                                }}
                                placeholder="Type and press Enter..."
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-gray-900 outline-none pr-24"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-[11px] pointer-events-none">Enter to add</span>
                            </div>
                          )}
                        </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300 max-w-2xl">
                  <div className="mb-5">
                    <h2 className="text-gray-900 font-bold text-lg">Pricing</h2>
                    <p className="text-gray-400 text-sm mt-0.5">Set how students can access your course</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {/* FREE */}
                      <button
                        type="button"
                        onClick={() => {
                          setValue('pricingType', 'free');
                          setValue('price', 0);
                        }}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all duration-150",
                          pricingType === 'free' ? 'border-black bg-black/5' : 'border-gray-100 bg-white hover:border-gray-300'
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-lg mb-2 flex items-center justify-center",
                          pricingType === 'free' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'
                        )}>
                          <Gift className="w-4 h-4" />
                        </div>
                        <p className="text-gray-900 font-bold text-sm">Free</p>
                        <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">Enroll instantly at no cost</p>
                      </button>

                      {/* PAID */}
                      <button
                        type="button"
                        onClick={() => setValue('pricingType', 'paid')}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all duration-150",
                          pricingType === 'paid' ? 'border-black bg-black/5' : 'border-gray-100 bg-white hover:border-gray-300'
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-lg mb-2 flex items-center justify-center",
                          pricingType === 'paid' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'
                        )}>
                          <IndianRupee className="w-4 h-4" />
                        </div>
                        <p className="text-gray-900 font-bold text-sm">Paid</p>
                        <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">Set your price per enrollment</p>
                      </button>
                    </div>

                      {pricingType === 'paid' && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 animate-in slide-in-from-top-2 duration-150">
                          <div className="grid grid-cols-2 gap-4">
                            <div data-field="price">
                              <label className="text-gray-700 text-[11px] font-bold uppercase mb-1.5 block">Price *</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                <input
                                  {...register('price', { 
                                    valueAsNumber: true,
                                    onChange: () => {
                                      if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
                                    }
                                  })}
                                  type="number"
                                  className={cn(
                                    "w-full pl-7 pr-3 py-2 border rounded-lg text-sm outline-none transition-150",
                                    errors.price
                                      ? 'border-red-400 bg-red-50/40 focus:border-red-500'
                                      : 'border-gray-200 focus:border-gray-900'
                                  )}
                                />
                              </div>
                              <FieldError error={errors.price} />
                            </div>
                            <div data-field="originalPrice">
                              <label className="text-gray-700 text-[11px] font-bold uppercase mb-1.5 block">Original Price</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                <input
                                  {...register('originalPrice', { 
                                    valueAsNumber: true,
                                    onChange: () => {
                                      if (errors.originalPrice) setErrors(prev => ({ ...prev, originalPrice: '' }));
                                    }
                                  })}
                                  type="number"
                                  className={cn(
                                    "w-full pl-7 pr-3 py-2 border rounded-lg text-sm outline-none transition-150",
                                    errors.originalPrice
                                      ? 'border-red-400 bg-red-50/40 focus:border-red-500'
                                      : 'border-gray-200 focus:border-gray-900'
                                  )}
                                />
                              </div>
                              <FieldError error={errors.originalPrice} />
                            </div>
                          </div>

                        {price > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-gray-900 font-bold text-xl">₹{price.toLocaleString('en-IN')}</span>
                              {originalPrice && originalPrice > price && (
                                <span className="bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                  {Math.round((1 - price/originalPrice) * 100)}% OFF
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[11px] text-gray-600">Your earnings: <strong className="text-gray-900">₹{Math.round(price * 0.7).toLocaleString('en-IN')}</strong></span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-gray-300" />
                                <span className="text-[11px] text-gray-400">Platform fee (30%)</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          {[499, 999, 1499, 1999, 2999].map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setValue('price', p)}
                              className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-black hover:text-black bg-white"
                            >
                              ₹{p.toLocaleString('en-IN')}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {pricingType === 'free' && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-blue-800 font-bold text-xs">Free Course</p>
                          <p className="text-blue-600 text-[11px] mt-1">Students can enroll instantly without payment. Great for building an audience.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* BOTTOM NAV — sticks to bottom of scroll area */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
              <div className="text-gray-400 text-xs font-medium">
                Step {step} of 3
              </div>
              <div className="flex items-center gap-3">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setErrors({});
                        setStep(step - 1);
                      }}
                      className="text-gray-500 text-sm font-semibold hover:text-gray-900 px-4 py-2"
                    >
                      Back
                    </button>
                  )}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-black text-white rounded-xl px-6 py-2.5 text-sm font-semibold flex items-center gap-2 hover:bg-gray-800 transition-150"
                  >
                    Continue to {step === 1 ? 'Details' : 'Pricing'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-black text-white rounded-xl px-6 py-2.5 text-sm font-semibold flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-150"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                    {isSubmitting ? 'Creating...' : 'Create Course'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* HELPER PANEL */}
        <div className="w-64 border-l border-gray-200 bg-gray-50 overflow-y-auto px-5 py-5 hidden xl:block flex-shrink-0">
          <HelperPanel step={step} />
        </div>
      
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-0 py-4 bg-white border-b border-gray-100">
      {[
        { n: 1, label: 'Basic Info' },
        { n: 2, label: 'Details' },
        { n: 3, label: 'Pricing' },
      ].map((s, i) => (
        <React.Fragment key={s.n}>
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-150",
              step > s.n 
                ? 'bg-black text-white' 
                : step === s.n 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-400'
            )}>
              {step > s.n ? <Check className="w-3.5 h-3.5" /> : s.n}
            </div>
            <span className={cn(
              "text-[11px] mt-1 font-medium",
              step === s.n ? 'text-gray-900' : 'text-gray-400'
            )}>
              {s.label}
            </span>
          </div>
          {i < 2 && (
            <div className={cn(
              "w-24 h-px mx-3 mb-4 transition-all duration-150",
              step > s.n ? 'bg-black' : 'bg-gray-200'
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function HelperPanel({ step }: { step: number }) {
  if (step === 1) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className="text-gray-700 text-[10px] font-bold uppercase tracking-wider">Tips for Titles</span>
          </div>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2 text-gray-500 text-xs leading-relaxed">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Include the main skill e.g. "React Masterclass"</span>
            </li>
            <li className="flex items-start gap-2 text-gray-500 text-xs leading-relaxed">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Mention target level (Beginner/Advanced)</span>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <span className="text-gray-700 text-[10px] font-bold uppercase tracking-wider block mb-3">Examples</span>
          <div className="space-y-2">
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-gray-600 text-[11px] leading-tight">
              ✅ "Complete React 2026 — Beginner to Pro"
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-gray-600 text-[11px] leading-tight">
              ✅ "Tamil Language for Beginners"
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
          <span className="text-gray-700 text-[10px] font-bold uppercase tracking-wider block mb-3">Outcome Tips</span>
          <ul className="space-y-2.5 text-gray-500 text-xs leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Start with action verbs (Build, Create, Understand)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Focus on real-world skills</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
          <span className="text-gray-700 text-[10px] font-bold uppercase tracking-wider block mb-3">Pricing Strategy</span>
          <div className="space-y-3">
            <div>
              <p className="text-gray-900 text-[10px] font-bold">Beginner</p>
              <p className="text-gray-500 text-xs">₹499 – ₹999</p>
            </div>
            <div>
              <p className="text-gray-900 text-[10px] font-bold">Intermediate</p>
              <p className="text-gray-500 text-xs">₹999 – ₹1,999</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <span className="text-gray-700 text-[10px] font-bold uppercase tracking-wider block mb-3">Your Earnings</span>
          <p className="text-gray-500 text-xs leading-relaxed">
            You earn <strong className="text-gray-900">70%</strong> of each sale. Platform fees cover hosting and payments.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
