import { createClient } from '@/lib/supabase/server';
import { getInstructorCourse } from '@/lib/actions/instructor';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Layout, ListChecks, Settings, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function CourseLandingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const course = await getInstructorCourse(id, user.id);

  if (!course) {
    notFound();
  }

  const navItems = [
    { label: 'Basic Info', href: `/instructor/courses/${id}/edit`, icon: Settings },
    { label: 'Curriculum', href: `/instructor/courses/${id}/curriculum`, icon: ListChecks },
    { label: 'Landing Page', href: `/instructor/courses/${id}/landing`, icon: Layout, active: true },
  ];

  return (
    <div className="max-w-5xl mx-auto p-8 pb-20">
      <Link 
        href="/instructor/courses" 
        className="flex items-center gap-2 text-gray-400 hover:text-black font-bold text-xs uppercase tracking-widest mb-8 transition-colors"
      >
        <ChevronLeft size={16} />
        Back to Courses
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Course Landing Page</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">{course.title}</p>
        </div>
      </div>

      {/* Tabs / Sub-navigation */}
      <div className="flex items-center gap-1 border-b border-gray-100 mb-12 overflow-x-auto pb-px">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
              item.active
                ? 'border-black text-black'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </div>

      <div className="space-y-12">
        <div className="bg-white border border-gray-100 p-10 rounded-3xl shadow-sm space-y-10">
          <div className="space-y-4">
            <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              <ImageIcon className="text-gray-400" size={20} />
              Course Thumbnail
            </h3>
            <p className="text-sm font-medium text-gray-500">
              Upload a high-quality image that represents your course. Recommended size: 1280x720px (16:9).
            </p>
            
            <div className="flex flex-col md:flex-row gap-8 pt-4">
              <div className="w-full md:w-80 h-44 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt="Thumbnail preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-6">
                    <ImageIcon size={32} className="mx-auto text-gray-300 mb-2" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Thumbnail</span>
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <Button className="w-fit bg-black text-white px-8 rounded-xl font-bold text-xs uppercase tracking-widest h-12">
                  Upload Image
                </Button>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-4">
                  Accepted formats: JPG, PNG, WEBP. Max size: 2MB.
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="space-y-4">
            <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Video className="text-gray-400" size={20} />
              Promotional Video
            </h3>
            <p className="text-sm font-medium text-gray-500">
              A short intro video can increase enrollments by 5x. Students love to see who they are learning from.
            </p>
            
            <div className="flex flex-col md:flex-row gap-8 pt-4">
              <div className="w-full md:w-80 h-44 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                {course.promo_video_url ? (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <Video size={32} className="text-white opacity-50" />
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <Video size={32} className="mx-auto text-gray-300 mb-2" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Video</span>
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <Button className="w-fit bg-white text-black border-2 border-black px-8 rounded-xl font-bold text-xs uppercase tracking-widest h-12">
                  Add Video
                </Button>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-4">
                  Paste a YouTube, Vimeo, or direct video link.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl flex items-start gap-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
            <Settings size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-emerald-900 mb-1">Course Visibility</h4>
            <p className="text-xs font-medium text-emerald-800/70 mb-6">
              Your course is currently in <span className="font-black uppercase">{course.status}</span> mode. 
              Only you can see it. Once you finish building the curriculum and landing page, you can submit it for review.
            </p>
            <Button className="bg-emerald-600 text-white px-8 rounded-xl font-bold text-xs uppercase tracking-widest h-11 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
              Submit for Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
