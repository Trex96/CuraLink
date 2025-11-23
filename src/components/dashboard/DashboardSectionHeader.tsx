'use client';

import { motion } from 'framer-motion';

interface DashboardSectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function DashboardSectionHeader({ 
  title, 
  description, 
  action,
  className 
}: DashboardSectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 ${className}`}
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  );
}