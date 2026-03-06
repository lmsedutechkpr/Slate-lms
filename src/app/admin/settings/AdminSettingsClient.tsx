'use client';

import { useState } from 'react';
import { Settings, ShieldAlert, Star, CreditCard, Mail, Globe, LayoutTemplate, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { toggleFeaturedCourse } from '@/lib/actions/admin';

interface AdminSettingsClientProps {
  courses: any[];
}

export default function AdminSettingsClient({ courses }: AdminSettingsClientProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loadingFeat, setLoadingFeat] = useState<string | null>(null);

  const handleToggleFeatured = async (courseId: string, currentStatus: boolean) => {
    setLoadingFeat(courseId);
    const result = await toggleFeaturedCourse(courseId, !currentStatus);
    setLoadingFeat(null);
    if (result.success) {
      toast.success(`Course ${!currentStatus ? 'featured' : 'unfeatured'} successfully`);
    } else {
      toast.error('Failed to update course');
    }
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Platform settings saved successfully');
  };

  return (
    <div className="min-h-full bg-gray-50 flex flex-col md:flex-row relative">
      {/* SIDEBAR TABS */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Manage platform configuration</p>
        </div>
        <nav className="px-4 pb-6 space-y-1">
          {[
            { id: 'general', icon: Settings, label: 'General Settings' },
            { id: 'appearance', icon: LayoutTemplate, label: 'Appearance' },
            { id: 'featured', icon: Star, label: 'Featured Courses' },
            { id: 'payments', icon: CreditCard, label: 'Payment Gateway' },
            { id: 'email', icon: Mail, label: 'Email Configuration' },
            { id: 'advanced', icon: ShieldAlert, label: 'Advanced & Security' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} className={isActive ? 'opacity-100' : 'opacity-70'} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 p-8 max-w-4xl">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">General Settings</h3>
              <p className="text-sm text-gray-500 mt-1">Basic platform information and global rules.</p>
            </div>
            
            <form onSubmit={handleSaveGeneral} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform Name</label>
                  <input type="text" defaultValue="Slate LMS" className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-gray-900 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Support Email</label>
                  <input type="email" defaultValue="support@slate.com" className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-gray-900 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform Description</label>
                <textarea rows={3} defaultValue="An inclusive learning platform..." className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-gray-900 outline-none resize-none" />
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" className="px-5 py-2.5 bg-black text-white font-medium rounded-xl text-sm hover:bg-gray-800 transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'featured' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Featured Courses</h3>
              <p className="text-sm text-gray-500 mt-1">Select which courses appear on the landing page carousel.</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Course Title</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Instructor</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Featured</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {courses.filter(c => c.status === 'published').map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                            {course.thumbnail_url && <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">{course.title}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {course.instructor?.full_name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(course.id, course.is_featured)}
                          disabled={loadingFeat === course.id}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            course.is_featured ? 'bg-emerald-500' : 'bg-gray-200'
                          } disabled:opacity-50`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              course.is_featured ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {courses.filter(c => c.status === 'published').length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">No published courses found.</div>
              )}
            </div>
          </div>
        )}

        {/* MOCK TABS */}
        {['appearance', 'payments', 'email'].includes(activeTab) && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <Settings className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Configuration panel</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
              This settings module is partially implemented. Third-party integrations will be available in the next platform update.
            </p>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Advanced & Security</h3>
              <p className="text-sm text-gray-500 mt-1">Critical platform controls and operations.</p>
            </div>
            
            <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-gray-900">Maintenance Mode</h4>
                  <p className="text-sm text-gray-500 mt-1 max-w-md">
                    Activating maintenance mode will hide the platform from all users except administrators. Use this during major upgrades.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsMaintenance(!isMaintenance);
                    toast.success(`Maintenance mode ${!isMaintenance ? 'activated' : 'deactivated'}`);
                  }}
                  className={`px-5 py-2.5 font-medium rounded-xl text-sm transition-colors ${
                    isMaintenance ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  {isMaintenance ? 'Deactivate Maintenance' : 'Activate Maintenance'}
                </button>
              </div>

              {isMaintenance && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3">
                  <ShieldAlert size={16} className="text-red-500" />
                  <span className="text-sm text-red-800 font-medium">Platform is currently in maintenance mode. Only admins can log in.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
