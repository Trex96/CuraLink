'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/utils';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

const ResponsiveContainer = ({ children, className }: ResponsiveContainerProps) => {
  return (
    <div className={cn('container mx-auto px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;