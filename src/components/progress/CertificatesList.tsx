import { Award, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Certificate } from '@/types';

interface CertRow {
  certificate: Certificate;
  course: {
    id: string;
    title: string;
    title_ta: string | null;
    slug: string;
    thumbnail_url: string | null;
    category?: { name: string; color: string | null } | null;
  } | null;
}

interface CertificatesListProps {
  rows: CertRow[];
  lang?: 'en' | 'ta';
}

export function CertificatesList({ rows, lang = 'en' }: CertificatesListProps) {
  if (rows.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <Award size={28} className="text-amber-300" />
        </div>
        <p className="text-gray-500 text-sm font-medium">No certificates yet</p>
        <p className="text-gray-400 text-xs mt-1">
          Complete a course to earn your first certificate.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rows.map(({ certificate, course }) => {
        const title =
          lang === 'ta' && course?.title_ta ? course.title_ta : (course?.title ?? 'Course');
        return (
          <div
            key={certificate.id}
            className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center flex-shrink-0">
              <Award size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              {course?.slug ? (
                <Link
                  href={`/courses/${course.slug}`}
                  className="font-semibold text-gray-900 text-sm line-clamp-1 hover:text-black transition-colors"
                >
                  {title}
                </Link>
              ) : (
                <p className="font-semibold text-gray-900 text-sm line-clamp-1">{title}</p>
              )}
              <p className="text-xs text-gray-500 mt-0.5">
                Issued{' '}
                {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                #{certificate.certificate_number}
              </p>
            </div>
            {course?.slug && (
              <Link
                href={`/courses/${course.slug}`}
                className="flex-shrink-0 text-amber-500 hover:text-amber-600 transition-colors"
                title="View course"
              >
                <ExternalLink size={14} />
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
