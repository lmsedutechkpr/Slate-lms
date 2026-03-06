'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function InstructorBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm mb-1">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
          )}
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-gray-400 hover:text-gray-700 transition-colors truncate max-w-[160px]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700 font-medium truncate max-w-[200px]">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
