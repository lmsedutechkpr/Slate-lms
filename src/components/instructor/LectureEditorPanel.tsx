'use client';

import { useState, useEffect } from 'react';
import { X, PlayCircle, FileText, HelpCircle, Loader2, Save, Video, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { updateLecture } from '@/lib/actions/instructor';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getVideoEmbedUrl } from '@/lib/utils';

interface LectureEditorPanelProps {
  lecture: any;
  instructorId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLecture?: any) => void;
}

export default function LectureEditorPanel({
  lecture: initialLecture,
  instructorId,
  isOpen,
  onClose,
  onSave,
}: LectureEditorPanelProps) {
  const [lecture, setLecture] = useState(initialLecture);
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setLecture(initialLecture);
    setIsDirty(false);
  }, [initialLecture]);

  if (!lecture) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateLecture(lecture.id, instructorId, {
        title: lecture.title,
        content_type: lecture.content_type,
        video_url: lecture.video_url,
        content: lecture.content,
        duration_minutes: lecture.duration_minutes,
        is_free_preview: lecture.is_free_preview,
      });

        if (result.success) {
          toast.success('Lecture updated!');
          onSave(lecture);
        } else {
        toast.error('Failed to update lecture', { description: result.error });
      }
    } catch (error: any) {
      toast.error('An error occurred', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setLecture((prev: any) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const isValidVideoUrl = (url: string) => {
    if (!url) return true;
    return (
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('vimeo.com') ||
      url.includes('loom.com') ||
      url.endsWith('.mp4') ||
      url.endsWith('.webm')
    );
  };

  const embedUrl = lecture.content_type === 'video' ? getVideoEmbedUrl(lecture.video_url || '') : null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity"
          onClick={() => {
            if (isDirty) {
              if (confirm('You have unsaved changes. Close anyway?')) onClose();
            } else {
              onClose();
            }
          }}
        />
      )}

      {/* Panel */}
      <div className={`fixed right-0 top-0 bottom-0 w-[440px] bg-white border-l border-gray-200 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
          <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Edit Lecture</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {lecture.content_type === 'video'
                  ? 'Add a video URL for this lecture'
                  : lecture.content_type === 'text'
                  ? 'Write your article content'
                  : 'Quiz configuration'}
              </p>
            </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-black"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          <div className="space-y-2">
            <Label className="text-xs font-black text-gray-900 uppercase tracking-widest">Lecture Title *</Label>
            <Input
              value={lecture.title}
              onChange={(e) => handleChange('title', e.target.value)}
              maxLength={100}
              placeholder="e.g. Introduction to the course"
              className="bg-gray-50/50 border-gray-100 rounded-xl py-6 font-bold focus:ring-black/5 focus:border-black"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-black text-gray-900 uppercase tracking-widest">Content Type</Label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-gray-50 rounded-xl">
              {[
                { id: 'video', label: 'Video', icon: PlayCircle },
                { id: 'text', label: 'Article', icon: FileText },
                { id: 'quiz', label: 'Quiz', icon: HelpCircle },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleChange('content_type', type.id)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black transition-all ${
                    lecture.content_type === type.id
                      ? 'bg-black text-white shadow-lg shadow-black/10'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <type.icon size={14} />
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {lecture.content_type === 'video' && (
            <div className="space-y-6 animate-in slide-in-from-top-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-black text-gray-900 uppercase tracking-widest">Video URL</Label>
                  {lecture.video_url && (
                    <span className={`text-[10px] font-bold ${isValidVideoUrl(lecture.video_url) ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isValidVideoUrl(lecture.video_url) ? 'Valid URL' : 'Unsupported URL'}
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  YouTube · Vimeo · Loom · Direct MP4
                </p>
                <div className="relative">
                  <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={lecture.video_url || ''}
                    onChange={(e) => handleChange('video_url', e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className={`bg-gray-50/50 border-gray-100 rounded-xl py-6 pl-10 font-medium focus:ring-black/5 focus:border-black ${
                      lecture.video_url && !isValidVideoUrl(lecture.video_url) ? 'border-red-200' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Live Video Preview */}
              {embedUrl && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black text-gray-900 uppercase tracking-widest">Preview</Label>
                    <a
                      href={lecture.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-gray-400 hover:text-black flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink size={10} />
                      Open original
                    </a>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-gray-100 bg-black shadow-lg aspect-video">
                    <iframe
                      src={embedUrl}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                      title="Video preview"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-900 uppercase tracking-widest">Duration (minutes)</Label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="number"
                    value={lecture.duration_minutes || ''}
                    onChange={(e) => handleChange('duration_minutes', Number(e.target.value))}
                    min={1}
                    max={480}
                    className="bg-gray-50/50 border-gray-100 rounded-xl py-6 pl-10 font-bold focus:ring-black/5 focus:border-black"
                  />
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <Label className="text-sm font-black text-gray-900 tracking-tight block">Free Preview</Label>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Students can watch without enrolling</p>
                </div>
                <Switch
                  checked={!!lecture.is_free_preview}
                  onCheckedChange={(val) => handleChange('is_free_preview', val)}
                />
              </div>
            </div>
          )}

          {lecture.content_type === 'text' && (
            <div className="space-y-6 animate-in slide-in-from-top-4">
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-900 uppercase tracking-widest">Article Content</Label>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Markdown supported — will render for students</p>
                <Textarea
                  value={lecture.content || ''}
                  onChange={(e) => handleChange('content', e.target.value)}
                  rows={12}
                  placeholder="## Introduction&#10;&#10;Start writing your lecture content here..."
                  className="bg-gray-50/50 border-gray-100 rounded-2xl p-5 font-mono text-xs focus:ring-black/5 focus:border-black leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-900 uppercase tracking-widest">Reading Time (minutes)</Label>
                <Input
                  type="number"
                  value={lecture.duration_minutes || ''}
                  onChange={(e) => handleChange('duration_minutes', Number(e.target.value))}
                  className="bg-gray-50/50 border-gray-100 rounded-xl py-6 font-bold focus:ring-black/5 focus:border-black"
                />
              </div>
            </div>
          )}

          {lecture.content_type === 'quiz' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col items-center text-center space-y-3 animate-in zoom-in-95">
              <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                <HelpCircle size={24} strokeWidth={3} />
              </div>
              <p className="text-amber-900 font-black tracking-tight">Quiz coming soon</p>
              <p className="text-amber-700 text-xs font-medium">You can create quiz questions after the course is published.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-white flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-gray-50 hover:text-black transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !isDirty}
            className={`flex-1 py-3 bg-black text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-black/20 flex items-center justify-center gap-2 transition-all ${
              loading || !isDirty ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Lecture
          </button>
        </div>
      </div>
    </>
  );
}
