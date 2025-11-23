'use client';

import { motion } from 'framer-motion';

interface DashboardGridLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardGridLayout({ children, className }: DashboardGridLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}