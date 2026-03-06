'use client';

import { useState } from 'react';
import { Megaphone, Users, Send, Loader2, CheckCircle2, History } from 'lucide-react';
import { toast } from 'sonner';
import { sendSystemAnnouncement } from '@/lib/actions/admin';
import { formatRelativeTime } from '@/lib/utils/format';

interface AdminNotificationsClientProps {
  initialAnnouncements: any[];
}

const TARGET_OPTIONS = [
  { id: 'all', label: 'All Users', description: 'Students, Instructors, and Sellers' },
  { id: 'student', label: 'Students Only', description: 'Registered learners' },
  { id: 'instructor', label: 'Instructors Only', description: 'Course creators' },
  { id: 'seller', label: 'Sellers Only', description: 'Digital product vendors' },
];

export default function AdminNotificationsClient({ initialAnnouncements }: AdminNotificationsClientProps) {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [target, setTarget] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    const roles = target === 'all' ? ['all'] : [target];
    const result = await sendSystemAnnouncement(roles, title, message, link);
    setIsSending(false);

    if (result.success) {
      toast.success(`Announcement sent to ${result.count} users`);
      setAnnouncements([{
        id: Math.random().toString(),
        title,
        message,
        created_at: new Date().toISOString(),
        count: result.count,
        type: 'system'
      }, ...announcements]);
      
      setTitle('');
      setMessage('');
      setLink('');
      setTarget('all');
      setActiveTab('history');
    } else {
      toast.error(result.error || 'Failed to send announcement');
    }
  };

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-8 pt-5">
        <h1 className="text-2xl font-bold text-gray-900">System Notifications</h1>
        <p className="text-gray-400 text-sm mt-1">Send platform-wide announcements and alerts</p>

        {/* TABS */}
        <div className="flex items-center gap-1 mt-6 -mb-px">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'new'
                ? 'border-black text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Send size={16} />
            New Announcement
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-black text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <History size={16} />
            History
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 max-w-4xl">
        {activeTab === 'new' ? (
          <form onSubmit={handleSend} className="space-y-6">
            
            {/* Target Audience */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={16} className="text-gray-400" />
                Target Audience
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TARGET_OPTIONS.map(opt => (
                  <label 
                    key={opt.id}
                    className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                      target === opt.id 
                      ? 'border-black bg-gray-50 ring-1 ring-black' 
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="target" 
                      value={opt.id} 
                      checked={target === opt.id}
                      onChange={(e) => setTarget(e.target.value)}
                      className="mt-1 sr-only" 
                    />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 flex-shrink-0 ${
                      target === opt.id ? 'border-black bg-black' : 'border-gray-300'
                    }`}>
                      {target === opt.id && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${target === opt.id ? 'text-gray-900' : 'text-gray-700'}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Message Content */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Megaphone size={16} className="text-gray-400" />
                Announcement Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notification Title *</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Platform Maintenance Tomorrow"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-gray-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message Body *</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about the announcement..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-gray-900 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Optional Link</label>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://example.com/details"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-gray-900 outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">Users can click the notification to visit this URL.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSending || !title.trim() || !message.trim()}
                className="flex flex-row items-center gap-2 bg-black hover:bg-gray-800 text-white font-medium rounded-xl px-6 py-3 transition-colors disabled:opacity-50"
              >
                {isSending ? (
                  <><Loader2 size={18} className="animate-spin" /> Sending...</>
                ) : (
                  <><Send size={18} /> Send Announcement</>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                <Megaphone className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No past announcements</p>
              </div>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <Megaphone size={18} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900">{announcement.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{announcement.message}</p>
                        <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-400 font-medium">
                          <span className="flex items-center gap-1.5">
                            <History size={12} />
                            {formatRelativeTime(announcement.created_at)}
                          </span>
                          <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={12} />
                            Reached ~{announcement.count} users
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
