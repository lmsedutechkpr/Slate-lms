'use client';

import React, { useState } from 'react';
import { PlayCircle, FileText, HelpCircle, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface LectureEditorProps {
  lecture?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function LectureEditor({ lecture, onSave, onCancel }: LectureEditorProps) {
  const [title, setTitle] = useState(lecture?.title || '');
  const [contentType, setContentType] = useState<'video' | 'text' | 'quiz'>(lecture?.content_type || 'video');
  const [videoUrl, setVideoUrl] = useState(lecture?.video_url || '');
  const [content, setContent] = useState(lecture?.content || '');
  const [duration, setDuration] = useState(lecture?.duration_minutes || 0);
  const [isPreview, setIsPreview] = useState(lecture?.is_preview || false);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title,
      content_type: contentType,
      video_url: contentType === 'video' ? videoUrl : '',
      content: contentType === 'text' ? content : '',
      duration_minutes: duration,
      is_preview: contentType === 'video' ? isPreview : false,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Lecture Title *</label>
          <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Getting Started with React"
            className="h-12 rounded-xl border-gray-100 font-bold focus:border-black"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Content Type</label>
          <div className="flex gap-2 p-1 bg-gray-50 border border-gray-100 rounded-2xl h-12">
            {[
              { id: 'video', label: 'Video', icon: PlayCircle },
              { id: 'text', label: 'Text', icon: FileText },
              { id: 'quiz', label: 'Quiz', icon: HelpCircle }
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setContentType(type.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  contentType === type.id 
                    ? "bg-white text-black shadow-sm ring-1 ring-black/5" 
                    : "text-gray-400 hover:text-gray-600 hover:bg-white/50"
                )}
              >
                <type.icon size={14} />
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {contentType === 'video' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Video URL</label>
            <Input 
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="YouTube or direct video link"
              className="h-12 rounded-xl border-white font-medium focus:border-black bg-white shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Duration (Minutes)</label>
            <Input 
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              placeholder="e.g. 15"
              className="h-12 rounded-xl border-white font-medium focus:border-black bg-white shadow-sm"
            />
          </div>
          <div className="col-span-1 md:col-span-2 flex items-center gap-3 bg-white p-4 rounded-xl border border-white shadow-sm">
            <input 
              type="checkbox" 
              id="is_preview"
              checked={isPreview}
              onChange={(e) => setIsPreview(e.target.checked)}
              className="w-5 h-5 rounded-lg border-gray-200 accent-black cursor-pointer"
            />
            <label htmlFor="is_preview" className="text-xs font-bold text-gray-900 cursor-pointer select-none">
              Make this lecture free to preview
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">Non-enrolled students can watch this</p>
            </label>
          </div>
        </div>
      )}

      {contentType === 'text' && (
        <div className="space-y-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Article Content</label>
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Markdown or plain text content for the lecture..."
              className="min-h-[200px] p-5 text-sm font-medium rounded-xl border-white bg-white shadow-sm focus:border-black"
            />
          </div>
          <div className="space-y-2 max-w-xs">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Estimated Reading Time (Min)</label>
            <Input 
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              placeholder="e.g. 5"
              className="h-12 rounded-xl border-white font-medium focus:border-black bg-white shadow-sm"
            />
          </div>
        </div>
      )}

      {contentType === 'quiz' && (
        <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-300 mb-4 shadow-sm">
            <HelpCircle size={24} />
          </div>
          <h4 className="text-sm font-black text-gray-900 mb-1">Quiz Configuration</h4>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest max-w-xs">
            Quizzes will be configured separately once the course structure is saved.
          </p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
        <Button variant="ghost" onClick={onCancel} className="font-bold text-xs uppercase tracking-widest rounded-xl">Cancel</Button>
        <Button onClick={handleSave} className="bg-black text-white px-8 h-12 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-black/10">
          Save Lecture
          <Check size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
