'use client';

import Image from 'next/image';
import { BookOpen, CheckCircle2, Award, Calendar } from 'lucide-react';
import { Profile } from '@/types';
import { format } from 'date-fns';

interface ProfileCardProps {
  profile: Profile;
  enrolledCount: number;
  completedCount: number;
  certificateCount: number;
}

export function ProfileCard({
  profile,
  enrolledCount,
  completedCount,
  certificateCount,
}: ProfileCardProps) {
  const initial =
    profile.full_name?.charAt(0)?.toUpperCase() ||
    profile.email?.charAt(0)?.toUpperCase() ||
    'S';
  const displayName = profile.full_name || profile.email?.split('@')[0] || 'Student';
  const memberSince = profile.created_at
    ? format(new Date(profile.created_at), 'MMM yyyy')
    : null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Banner */}
      <div className="h-20 bg-gradient-to-r from-gray-900 to-gray-700" />

      {/* Avatar + info */}
      <div className="px-6 pb-6">
        <div className="-mt-10 mb-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black border-4 border-white flex-shrink-0 flex items-center justify-center">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={displayName}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-2xl">{initial}</span>
            )}
          </div>
        </div>

        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-gray-900 font-bold text-xl leading-tight">{displayName}</h2>
            <p className="text-gray-400 text-sm mt-0.5">{profile.email}</p>
          </div>
          <span className="flex-shrink-0 mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-100 rounded-full px-2.5 py-1">
            Student
          </span>
        </div>

        {profile.bio && (
          <p className="text-gray-600 text-sm mt-3 leading-relaxed">{profile.bio}</p>
        )}

        {memberSince && (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
            <Calendar size={12} />
            Member since {memberSince}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-5 pt-5 border-t border-gray-100">
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1">
              <BookOpen size={13} className="text-blue-500" />
              <span className="text-sm font-bold text-gray-900">{enrolledCount}</span>
            </div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Enrolled</span>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span className="text-sm font-bold text-gray-900">{completedCount}</span>
            </div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Completed</span>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1">
              <Award size={13} className="text-amber-500" />
              <span className="text-sm font-bold text-gray-900">{certificateCount}</span>
            </div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Certificates</span>
          </div>
        </div>
      </div>
    </div>
  );
}
