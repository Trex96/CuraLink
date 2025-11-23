'use client';

import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  description?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  label, 
  description, 
  showPercentage = true,
  size = 'md',
  className 
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-2';
      case 'lg': return 'h-4';
      default: return 'h-3';
    }
  };
  
  return (
    <div className={className}>
      {(label || description || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          <div>
            {label && <div className="text-sm font-medium">{label}</div>}
            {description && <div className="text-xs text-muted-foreground">{description}</div>}
          </div>
          {showPercentage && (
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Progress 
          value={percentage} 
          className={getSizeClass()}
        />
      </motion.div>
    </div>
  );
}