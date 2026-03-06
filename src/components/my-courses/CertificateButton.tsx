'use client';

import Link from 'next/link';
import { Award } from 'lucide-react';
import { Certificate } from '@/types';

interface CertificateButtonProps {
  certificate: Certificate;
}

export function CertificateButton({ certificate }: CertificateButtonProps) {
  return (
    <Link
      href={`/dashboard/my-courses/certificate/${certificate.id}`}
      target="_blank"
      className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-emerald-100 transition-colors"
    >
      <Award size={14} />
      Certificate
    </Link>
  );
}
