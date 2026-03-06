'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { updateAvatar } from '@/lib/actions/profile';
import { useRouter } from 'next/navigation';

interface AvatarUploadProps {
  currentUrl: string | null;
  displayName: string;
}

export function AvatarUpload({ currentUrl, displayName }: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const initial =
    displayName?.charAt(0)?.toUpperCase() || 'S';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setError('');
    setSuccess(false);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const result = await updateAvatar(formData);

      if (result.success && result.avatarUrl) {
        setPreviewUrl(result.avatarUrl);
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error ?? 'Upload failed');
        setPreviewUrl(currentUrl); // revert
      }
    } finally {
      setUploading(false);
      // Reset file input so same file can be re-selected
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Profile Photo</h3>

      <div className="flex items-center gap-5">
        {/* Avatar preview */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black flex items-center justify-center">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt={displayName}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-2xl">{initial}</span>
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
              <Loader2 size={18} className="text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-3">
            JPG, PNG, or WebP. Max 2MB.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 bg-black text-white text-xs font-semibold rounded-xl px-4 py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Camera size={13} />
            {uploading ? 'Uploading...' : 'Change Photo'}
          </button>

          {/* Status messages */}
          {success && (
            <p className="flex items-center gap-1.5 text-xs text-emerald-600 mt-2">
              <CheckCircle2 size={12} />
              Photo updated!
            </p>
          )}
          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-500 mt-2">
              <AlertCircle size={12} />
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
