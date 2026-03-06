import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Printer, ArrowLeft } from 'lucide-react';
import { getCertificateById } from '@/lib/actions/my-courses';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CertificatePage({ params }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { id } = await params;
  const certificate = await getCertificateById(id, user.id);

  if (!certificate) redirect('/dashboard/my-courses');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 print:bg-white print:p-0">
      <div className="max-w-2xl w-full mx-auto bg-white p-8 md:p-16 border-2 border-gray-900 rounded-2xl print:rounded-none print:border-gray-900">
        {/* Logo */}
        <div className="text-center mb-6">
          <span className="text-gray-900 font-bold text-3xl tracking-[0.25em] uppercase">
            Slate
          </span>
        </div>

        <div className="border-t border-gray-200 my-6" />

        {/* Certificate body */}
        <div className="text-center">
          <p className="text-gray-500 text-sm uppercase tracking-widest">
            Certificate of Completion
          </p>

          <p className="text-gray-400 text-sm mt-6">This certifies that</p>

          <p className="text-gray-900 text-3xl font-bold mt-2">
            {certificate.student?.full_name ?? 'Student'}
          </p>

          <p className="text-gray-400 text-sm mt-4">has successfully completed</p>

          <p className="text-gray-900 text-xl font-semibold mt-1">
            {certificate.course?.title ?? 'Course'}
          </p>
        </div>

        <div className="border-t border-gray-200 my-8" />

        {/* Footer row */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Certificate No.</p>
            <p className="text-gray-700 text-sm font-mono font-medium">
              {certificate.certificate_number}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Issued on</p>
            <p className="text-gray-700 text-sm font-medium">
              {format(new Date(certificate.issued_at), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Buttons — hidden on print */}
        <div className="mt-8 flex flex-wrap gap-3 justify-center print:hidden">
          <button
            onClick={() => typeof window !== 'undefined' && window.print()}
            className="inline-flex items-center gap-2 bg-black text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-900 transition-colors"
          >
            <Printer size={14} />
            Print Certificate
          </button>
          <Link
            href="/dashboard/my-courses"
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to My Courses
          </Link>
        </div>
      </div>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
}
