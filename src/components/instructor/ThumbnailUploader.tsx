'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, Trash2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { uploadCourseThumbnail, updateCourse } from '@/lib/actions/instructor';

interface ThumbnailUploaderProps {
  courseId: string;
  instructorId: string;
  currentUrl?: string | null;
  onUpload: (url: string) => void;
}

export default function ThumbnailUploader({
  courseId,
  instructorId,
  currentUrl,
  onUpload,
}: ThumbnailUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type', { description: 'Only JPG, PNG, WebP allowed.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large', { description: 'Maximum size is 2MB.' });
      return;
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setUploading(true);

    const formData = new FormData();
    formData.append('thumbnail', file);

    const result = await uploadCourseThumbnail(courseId, instructorId, formData);

    if (result.success && result.url) {
      setPreviewUrl(result.url);
      onUpload(result.url);
      toast.success('Thumbnail uploaded!', {
        description: 'Your course cover has been updated.',
      });
    } else {
      // Revert preview on failure
      setPreviewUrl(currentUrl ?? null);
      toast.error('Upload failed', {
        description: result.error ?? 'Please try again.',
      });
    }

    setUploading(false);

    // Reset input so same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    setPreviewUrl(null);
    await updateCourse(courseId, instructorId, { thumbnail_url: undefined });
    onUpload('');
    toast.success('Thumbnail removed');
  };

  return (
    <div>
      {/* Preview */}
      <div
        className="relative w-full rounded-xl overflow-hidden bg-gray-100 mb-3"
        style={{ aspectRatio: '16/9' }}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Course thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex flex-col items-center justify-center">
            <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
            <p className="text-gray-400 text-xs">No thumbnail yet</p>
          </div>
        )}

        {/* Uploading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
            <p className="text-white text-xs font-medium">Uploading...</p>
          </div>
        )}
      </div>

      {/* Upload trigger */}
      <label
        className={`block w-full border-2 border-dashed rounded-xl py-4 text-center cursor-pointer transition-all duration-150 ${
          uploading
            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
            : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        <Upload className="w-5 h-5 text-gray-400 mx-auto mb-2" />
        <span className="text-gray-700 text-sm font-medium block">
          {previewUrl ? 'Change thumbnail' : 'Upload thumbnail'}
        </span>
        <span className="text-gray-400 text-xs block mt-1">
          JPG, PNG, WebP · Max 2MB · 1280×720
        </span>
      </label>

      {/* Remove button */}
      {previewUrl && !uploading && (
        <button
          type="button"
          onClick={handleRemove}
          className="mt-2 w-full text-red-400 text-xs flex items-center justify-center gap-1.5 hover:text-red-600 py-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove thumbnail
        </button>
      )}
    </div>
  );
}
