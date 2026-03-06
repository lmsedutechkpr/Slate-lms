'use client';

import { PlayCircle, FileText } from 'lucide-react';
import { Lecture } from '@/types';
import { getVideoEmbedUrl } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface VideoPlayerProps {
  lecture: Lecture | null;
}

export function VideoPlayer({ lecture }: VideoPlayerProps) {
  if (!lecture) {
    return (
      <div className="w-full aspect-video bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <PlayCircle size={56} className="text-gray-700 mx-auto" />
          <p className="text-gray-600 text-sm">Select a lecture to begin</p>
        </div>
      </div>
    );
  }

  // Article / text lecture
  if (lecture.content_type === 'text') {
    return (
      <div className="w-full min-h-[320px] bg-gray-900 border-b border-gray-800 px-6 lg:px-16 py-10 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-6 text-gray-500 text-xs font-medium uppercase tracking-wider">
            <FileText size={14} />
            Article
          </div>
          {lecture.content ? (
            <div className="prose prose-invert prose-sm max-w-none
              prose-headings:font-semibold prose-headings:text-white
              prose-p:text-gray-300 prose-p:leading-relaxed
              prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
              prose-code:text-emerald-400 prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700
              prose-blockquote:border-l-indigo-500 prose-blockquote:text-gray-400
              prose-strong:text-white prose-li:text-gray-300">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{lecture.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No content yet.</p>
          )}
        </div>
      </div>
    );
  }

  // Video lecture
  if (lecture.video_url) {
    const embedUrl = getVideoEmbedUrl(lecture.video_url);

    if (embedUrl && !embedUrl.endsWith('.mp4') && !embedUrl.endsWith('.webm')) {
      return (
        <div className="w-full aspect-video bg-black">
          <iframe
            className="w-full h-full"
            src={embedUrl}
            title={lecture.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    // Direct video file
    return (
      <div className="w-full aspect-video bg-black">
        <video
          className="w-full h-full"
          src={lecture.video_url}
          controls
          controlsList="nodownload"
        />
      </div>
    );
  }

  // Video lecture but no URL yet
  return (
    <div className="w-full aspect-video bg-gray-950 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto">
          <PlayCircle size={36} className="text-gray-600" />
        </div>
        <div>
          <p className="text-gray-300 font-medium text-sm">{lecture.title}</p>
          <p className="text-gray-600 text-xs mt-1">Video not available yet</p>
        </div>
      </div>
    </div>
  );
}
