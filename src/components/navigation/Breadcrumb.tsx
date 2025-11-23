'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  return (
    <nav className={cn('flex', className)} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {item.active ? (
              <span className="ml-1 text-sm font-medium text-foreground md:ml-2">
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="ml-1 text-sm font-medium text-muted-foreground hover:text-foreground md:ml-2"
              >
                {item.label}
              </Link>
            ) : (
              <span className="ml-1 text-sm font-medium text-muted-foreground md:ml-2">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;