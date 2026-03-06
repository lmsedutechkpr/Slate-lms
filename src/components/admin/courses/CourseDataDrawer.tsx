'use client';

import { useState, useEffect } from 'react';
import { X, Search, Star, User, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatRelativeTime } from '@/lib/utils/format';

interface CourseDataDrawerProps {
  courseId: string;
  courseTitle: string;
  type: 'enrollments' | 'reviews';
  onClose: () => void;
}

export default function CourseDataDrawer({ courseId, courseTitle, type, onClose }: CourseDataDrawerProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      if (type === 'enrollments') {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select(`
            id, enrolled_at, progress_percent,
            student:profiles!student_id(full_name, email, avatar_url)
          `)
          .eq('course_id', courseId)
          .order('enrolled_at', { ascending: false });
        if (mounted) setData(enrollments || []);
      } else {
        const { data: reviews } = await supabase
          .from('course_reviews')
          .select(`
            id, rating, comment, created_at,
            student:profiles!student_id(full_name, avatar_url)
          `)
          .eq('course_id', courseId)
          .order('created_at', { ascending: false });
        if (mounted) setData(reviews || []);
      }
      if (mounted) setLoading(false);
    }
    fetchData();
    return () => { mounted = false; };
  }, [courseId, type, supabase]);

  const filtered = data.filter(item => {
    if (!search) return true;
    const name = item.student?.full_name?.toLowerCase() || '';
    const email = item.student?.email?.toLowerCase() || '';
    const comment = item.comment?.toLowerCase() || '';
    return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase()) || comment.includes(search.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900 capitalize">{type}</h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{courseTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-gray-900 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm">Loading data...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-500">
              No results found.
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.student?.avatar_url ? (
                        <img src={item.student.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {item.student?.full_name || 'Anonymous Student'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {type === 'enrollments' ? item.student?.email : formatRelativeTime(item.created_at)}
                      </p>
                    </div>
                    {type === 'enrollments' ? (
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">{item.progress_percent || 0}%</span>
                        <p className="text-[10px] text-gray-500">Progress</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-bold text-gray-900">{item.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  {type === 'enrollments' && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      Enrolled: {new Date(item.enrolled_at).toLocaleDateString()}
                    </div>
                  )}
                  {type === 'reviews' && item.comment && (
                    <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-100 mt-2">
                      {item.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
