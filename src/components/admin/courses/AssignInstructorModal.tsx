'use client';

import { useState, useEffect } from 'react';
import { Search, X, Check, User } from 'lucide-react';
import { getAdminInstructors, assignInstructor } from '@/lib/actions/admin';
import { toast } from 'sonner';

interface AssignInstructorModalProps {
  courseId: string;
  courseTitle: string;
  currentInstructorId?: string | null;
  onClose: () => void;
  onAssigned: () => void;
}

export default function AssignInstructorModal({
  courseId,
  courseTitle,
  currentInstructorId,
  onClose,
  onAssigned
}: AssignInstructorModalProps) {
  const [instructors, setInstructors] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(currentInstructorId || null);

  useEffect(() => {
    let mounted = true;
    async function fetchInstructors() {
      // Fetch only approved instructors for assignment
      const data = await getAdminInstructors('approved');
      if (mounted) {
        setInstructors(data || []);
        setLoading(false);
      }
    }
    fetchInstructors();
    return () => { mounted = false; };
  }, []);

  const filtered = instructors.filter(i => 
    i.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    i.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedId || selectedId === currentInstructorId) {
      onClose();
      return;
    }
    setSubmitting(true);
    const result = await assignInstructor(courseId, selectedId);
    setSubmitting(false);
    
    if (result.success) {
      toast.success('Instructor assigned successfully');
      onAssigned();
    } else {
      toast.error(result.error || 'Failed to assign instructor');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-hidden">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[85vh] m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Assign Instructor</h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-sm">For "{courseTitle}"</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-gray-900 outline-none"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="text-center py-8 text-sm text-gray-500">Loading instructors...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">No instructors found matching "{search}"</div>
          ) : (
            filtered.map((instructor) => (
              <button
                key={instructor.id}
                onClick={() => setSelectedId(instructor.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  selectedId === instructor.id
                    ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {instructor.avatar_url ? (
                    <img src={instructor.avatar_url} alt={instructor.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {instructor.full_name || 'Unnamed Instructor'}
                      {instructor.id === currentInstructorId && (
                        <span className="ml-2 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">Currently Assigned</span>
                      )}
                    </p>
                    {selectedId === instructor.id && (
                      <Check className="w-4 h-4 text-gray-900 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{instructor.email}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200/50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={!selectedId || submitting}
            onClick={handleAssign}
            className="px-5 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-black rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Assigning...' : selectedId === currentInstructorId ? 'Keep Current' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
}
